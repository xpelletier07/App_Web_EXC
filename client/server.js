/**
 * Le serveur du client en PRODUCTION (dans le conteneur). En développement,
 * `react-router dev` fait ce travail, et Vite relaie les appels /api du
 * navigateur vers Express. Ici, on refait les deux : un relais /api, puis
 * React Router qui rend les pages à partir du dossier build/.
 *
 * Fourni. Rien à modifier cette semaine.
 */
import express from 'express';
import { createRequestHandler } from '@react-router/express';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const port = process.env.PORT ?? 5173;

const app = express();

// Le relais : le navigateur appelle /api/... sur CE serveur, qui transmet à
// Express tel quel (méthode, corps, cookie, réponse) et renvoie ce qu'il
// répond. Le cookie de session part avec la requête et revient avec la
// réponse (Set-Cookie) : pour le navigateur, l'API et les pages sont un
// seul et même site.
app.use('/api', express.raw({ type: '*/*' }), async (req, res) => {
  const init = { method: req.method, headers: {}, redirect: 'manual' };
  if (req.get('cookie')) init.headers.cookie = req.get('cookie');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.headers['content-type'] = req.get('content-type') ?? 'application/json';
    init.body = req.body;
  }
  const upstream = await fetch(`${API_URL}/api${req.url}`, init);
  res.status(upstream.status);
  for (const name of ['content-type', 'location']) {
    if (upstream.headers.has(name)) res.set(name, upstream.headers.get(name));
  }
  const cookies = upstream.headers.getSetCookie();
  if (cookies.length > 0) res.set('set-cookie', cookies);
  res.send(Buffer.from(await upstream.arrayBuffer()));
});

// Les fichiers construits par Vite (JavaScript, CSS), puis les pages.
app.use(express.static('build/client', { maxAge: '1h' }));
app.use(createRequestHandler({ build: await import('./build/server/index.js') }));

app.listen(port, () => {
  console.log(`Quiz M9 — client démarré sur http://localhost:${port} (API : ${API_URL})`);
});
