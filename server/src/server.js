/**
 * Le point d'entrée du serveur : `npm run dev` et le conteneur lancent ce
 * fichier. Tout le reste (les routes) est dans app.js, testable sans port.
 */
import { app } from './app.js';
import { attachRealtime } from './realtime.js';

const server = app.listen(process.env.PORT ?? 3000, () => {
  console.log(`Quiz M9 : serveur démarré sur http://localhost:${server.address().port}`);
});

attachRealtime(server);