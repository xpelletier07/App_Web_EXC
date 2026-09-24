/**
 * « Se connecter avec GitHub » : OAuth 2, flux par code d'autorisation.
 *
 * Quatre acteurs : l'utilisateur (le navigateur), notre application (ici),
 * le serveur d'autorisation (github.com) et l'API de ressources
 * (api.github.com). Nous ne voyons JAMAIS le mot de passe GitHub de
 * l'utilisateur ; nous recevons un jeton, avec lequel nous lisons son profil.
 *
 * Le flux, en quatre étapes :
 *   1. GET /api/auth/github     on envoie le navigateur chez GitHub, avec un
 *                                `state` aléatoire gardé dans la session
 *   2. GitHub redirige le navigateur vers /api/auth/callback?code=…&state=…
 *   3. Le serveur échange le code contre un jeton (serveur à serveur, avec
 *      le secret de l'application), puis lit le profil avec le jeton
 *   4. Le compte est créé ou retrouvé ; sa session est ouverte
 *
 * Les identifiants viennent de l'environnement (server/.env en
 * développement) : jamais dans le dépôt.
 */
import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import * as repository from './repository/index.js';
import { clearSession, readSession, writeSession } from './session.js';

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
// L'adresse que GitHub rappelle : celle du CLIENT (5173), qui relaie /api.
const CALLBACK_URL = process.env.GITHUB_CALLBACK_URL ?? 'http://localhost:5173/api/auth/callback';

export const auth = Router();

// 1. Départ : le navigateur part chez GitHub demander l'autorisation.
auth.get('/api/auth/github', (req, res) => {
  // Le state est un nonce : GitHub nous le renverra tel quel, et on refusera
  // tout retour qui ne porte pas celui qu'on a émis pour CE navigateur.
  const state = randomBytes(16).toString('hex');
  writeSession(res, { state });

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', CALLBACK_URL);
  url.searchParams.set('state', state);
  // Aucun scope : le profil public suffit, on ne demande rien de plus.
  res.redirect(url.href);
});

// 2 à 4. Retour de GitHub avec un code à usage unique.
auth.get('/api/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  const session = readSession(req);
  if (!code || !state || state !== session.state) {
    return res.status(400).json({ error: 'Retour OAuth invalide (state).' });
  }

  // À faire (exercice 11, jalon 1). Les trois étapes qui restent :
  //
  // 3a. Le code contre un jeton : POST https://github.com/login/oauth/access_token
  //     corps JSON { client_id, client_secret, code, redirect_uri },
  //     en-tête accept: application/json. La réponse contient access_token.
  //     Cet appel part du SERVEUR : c'est le seul endroit où le secret sert.
  //
  // 3b. Le jeton contre le profil : GET https://api.github.com/user avec
  //     l'en-tête authorization: Bearer <jeton>. La réponse : { id, login,
  //     name, avatar_url }.
  //
  // 4.  repository.findOrCreateAccount({ githubId, login, name, avatarUrl }),
  //     puis writeSession(res, { accountId: account.id }) et une redirection
  //     vers /quizzes. Le jeton n'est pas gardé : on n'en a plus besoin.
  res.status(501).json({ error: 'À faire : le rappel OAuth.' });
});

// La déconnexion : on efface le cookie. GitHub n'est pas concerné.
auth.post('/api/auth/logout', (req, res) => {
  clearSession(res);
  res.status(204).end();
});

// Qui suis-je ? La page s'en sert pour afficher « Connecté : login ».
auth.get('/api/me', async (req, res) => {
  const account = await currentAccount(req);
  if (!account) {
    return res.status(401).json({ error: 'Non connecté.' });
  }
  res.status(200).json(publicProfile(account));
});

/** Le compte connecté à cette requête, ou null. */
export async function currentAccount(req) {
  const { accountId } = readSession(req);
  if (!accountId) return null;
  return (await repository.findAccount(accountId)) ?? null;
}

/** Ce qu'on montre d'un compte : jamais la ligne brute. */
function publicProfile(account) {
  return {
    id: account.id,
    login: account.login,
    name: account.name,
    avatarUrl: account.avatar_url,
  };
}
