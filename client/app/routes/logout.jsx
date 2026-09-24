import { redirect } from 'react-router';
import { apiFetch } from '../api-url.js';

/**
 * La déconnexion : une route sans page, seulement une action. Le bouton de
 * la barre de navigation est un <Form method="post" action="/logout">.
 *
 * L'API efface le cookie dans SA réponse (Set-Cookie) ; comme l'action
 * s'exécute sur le serveur du client, elle doit recopier cet en-tête dans
 * la réponse envoyée au navigateur, sinon le cookie y reste.
 */
export async function action({ request }) {
  // À faire (exercice 11, jalon 3) : appeler POST /api/auth/logout avec
  // apiFetch, puis rediriger vers / en recopiant l'en-tête set-cookie de la
  // réponse de l'API. Pour l'instant, le bouton ne déconnecte pas.
  return redirect('/');
}
