/**
 * Tests d'INTÉGRATION de l'espace auteur : on démarre l'API sur une base
 * temporaire et on lui parle en HTTP, comme le fait le client.
 *
 * Semaine 5 : créer un questionnaire demandera d'être connecté (exercice 11,
 * jalon 2). api.login() fabrique une session de test (voir helpers.js) ; les
 * tests l'envoient déjà, pour passer avant comme après votre travail. Les
 * test.todo sont à écrire : deux pour l'exercice 11, deux pour l'exercice 10.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { startServer } from "./helpers.js";

let api;
let session;
before(async () => {
  api = await startServer();
  session = await api.login('alice');
});
after(() => api.close());

test('un titre vide est refusé (400)', async () => {
  const { status, data } = await api.request('POST', '/api/quizzes', { title: '   ' }, session);
  assert.equal(status, 400);
  assert.equal(typeof data.error, 'string');
});

test('un titre valide crée le questionnaire (201)', async () => {
  const { status, data } = await api.request('POST', '/api/quizzes', { title: 'Capitales' }, session);
  assert.equal(status, 201);
  assert.equal(data.title, 'Capitales');
  assert.equal(typeof data.id, 'number');
});

// ── Semaine 5 : les comptes ───────────────────────────────────────────────

test.todo('créer un questionnaire sans être connecté est refusé (401)');

test('un cookie de session altéré vaut pas de session (401)', async () => {
  const altered = session.slice(0, -4) + 'zzzz';
  const { status } = await api.request('GET', '/api/me', undefined, altered);
  assert.equal(status, 401);
});

// Deux comptes (api.login('bob')), un questionnaire chacun : bob ne voit
// que le sien.
test.todo('GET /api/me/quizzes ne montre que les questionnaires de l’auteur');

// ── Les questions ─────────────────────────────────────────────────────────

/** Une question valide, à surcharger pour la rendre invalide. */
function question(overrides) {
  return {
    text: 'Capitale du Canada ?',
    durationSeconds: 20,
    choices: [
      { text: 'Ottawa', isCorrect: true },
      { text: 'Toronto', isCorrect: false },
    ],
    ...overrides,
  };
}

/** Crée un questionnaire vide et retourne son id. */
async function createQuiz(title = 'Capitales') {
  const { data } = await api.request('POST', '/api/quizzes', { title }, session);
  return data.id;
}

test('une question sans bonne réponse est refusée (400)', async () => {
  const quizId = await createQuiz();
  const { status, data } = await api.request('POST', `/api/quizzes/${quizId}/questions`, question({
    choices: [
      { text: 'Ottawa', isCorrect: false },
      { text: 'Toronto', isCorrect: false },
    ],
  }));
  assert.equal(status, 400);
  assert.match(data.error, /exactement une bonne réponse/);
});

test('une question avec deux bonnes réponses est refusée (400)', async () => {
  const quizId = await createQuiz();
  const { status } = await api.request('POST', `/api/quizzes/${quizId}/questions`, question({
    choices: [
      { text: 'Ottawa', isCorrect: true },
      { text: 'Toronto', isCorrect: true },
    ],
  }));
  assert.equal(status, 400);
});

test('une question valide est ajoutée et apparaît dans GET /api/quizzes/:id', async () => {
  const quizId = await createQuiz();
  const created = await api.request('POST', `/api/quizzes/${quizId}/questions`, question());
  assert.equal(created.status, 201);

  const { status, data } = await api.request('GET', `/api/quizzes/${quizId}`);
  assert.equal(status, 200);
  assert.equal(data.questions.length, 1);
  assert.equal(data.questions[0].id, created.data.id);
  assert.equal(data.questions[0].text, 'Capitale du Canada ?');
});

test('une partie sur un questionnaire sans question est refusée (400)', async () => {
  const quizId = await createQuiz('Vide');
  const { status, data } = await api.request('POST', '/api/games', { quizId });
  assert.equal(status, 400);
  assert.equal(typeof data.error, 'string');
});

// ── Exercice 10 : les parties d'un questionnaire ──────────────────────────

// Un questionnaire avec une question, deux parties dessus, un joueur dans
// la seconde : la seconde vient en premier, avec playerCount 1.
test.todo('GET /api/quizzes/:id/games liste les parties, la plus récente d’abord');
test.todo('GET /api/quizzes/:id/games sur un questionnaire inconnu répond 404');
