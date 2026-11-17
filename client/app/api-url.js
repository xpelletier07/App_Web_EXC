/**
 * L'API vue depuis le SERVEUR du client (là où tournent les loader et les
 * action). Le relais de Vite n'existe que pour le navigateur.
 *
 * Par défaut, localhost:3000 : votre poste. Dans un conteneur, l'adresse
 * vient de la variable d'environnement API_URL (semaine 3, Docker).
 */
export const API_URL = process.env.API_URL ?? 'http://localhost:3000';

/**
 * Un appel à l'API depuis un loader ou une action, AVEC le cookie du
 * navigateur. Le loader reçoit la requête du navigateur (request) ; il
 * transmet son cookie à l'API, qui sait ainsi qui est connecté. Sans ça,
 * l'API verrait une requête anonyme venue du serveur du client.
 */
export function apiFetch(request, path, init = {}) {
  const headers = { ...init.headers, cookie: request.headers.get('cookie') ?? '' };
  return fetch(`${API_URL}${path}`, { ...init, headers });
}
