/**
 * Les pages de Quiz M9. Une ligne par URL : le chemin, puis le fichier qui
 * rend la page.
 */
import { index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.jsx'),                       // accueil
  route('catalogue', 'routes/catalogue.jsx'),     // catalogue public
  route('quizzes', 'routes/quizzes.jsx'),         // mes questionnaires (auteur connecté)
  route('quizzes/:id', 'routes/quiz-details.jsx'),   // un questionnaire
  route('quizzes/:id/edit', 'routes/quiz-edit.jsx'), // éditeur
  route('logout', 'routes/logout.jsx'),           // déconnexion (action seulement)
  route('salon/:code', 'routes/lobby.jsx'),       // salon d'attente
  route('jeu/:code', 'routes/game.jsx'),          // salle de jeu
];
