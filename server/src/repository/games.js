/**
 * Les lectures et écritures des parties : game, player, answer. Tout le SQL
 * sur ces tables vit ici — nulle part ailleurs.
 */
import { db } from './db.js';

// ── Les trois fonctions à écrire cette semaine ────────────────────────────

/**
 * TODO (jalon ②) : insérer une partie et retourner son id.
 *
 * Un INSERT dans game — colonnes quiz_id, code et created_at ; state et
 * question_index ont des valeurs par défaut. Calquez recordAnswer, plus
 * bas : prepare, des « ? », run, puis retournez lastInsertRowid.
 *
 * @returns {number} l'id de la partie créée
 */
export function createGame(quizId, code, createdAt) {
  db.prepare(
    `INSERT INTO game (quiz_id, code, created_at)
     VALUES (?, ?, ?)`,
  ).run(quizId, code, createdAt);
  return db.prepare('SELECT last_insert_rowid() AS id').get().id;
}

/**
 * TODO (jalon ③) : inscrire un joueur dans une partie et retourner son id.
 *
 * Un INSERT dans player — colonnes game_id et nickname ; score part à 0
 * tout seul. Même modèle que createGame.
 *
 * @returns {number} l'id du joueur inscrit
 */
export function addPlayer(gameId, nickname) {
  db.prepare(
    `INSERT INTO player (game_id, nickname)
     VALUES (?, ?)`,
  ).run(gameId, nickname);
  return db.prepare('SELECT last_insert_rowid() AS id').get().id;
}

// ── Fournies : les lectures ───────────────────────────────────────────────

/** La partie qui porte ce code, ou undefined. */
export function findGameByCode(code) {
  return db.prepare('SELECT * FROM game WHERE code = ?').get(code);
}

/** Le joueur qui porte ce pseudonyme dans cette partie, ou undefined. */
export function findPlayer(gameId, nickname) {
  return db
    .prepare('SELECT * FROM player WHERE game_id = ? AND nickname = ?')
    .get(gameId, nickname);
}

/** Les joueurs d'une partie, classés : meilleur score, puis alphabétique. */
export function getPlayers(gameId) {
  return db
    .prepare(
      `SELECT id, nickname, score
         FROM player
        WHERE game_id = ?
        ORDER BY score DESC, nickname`,
    )
    .all(gameId);
}

/** La réponse d'un joueur à une question, ou undefined s'il n'a pas répondu. */
export function findAnswer(gameId, playerId, questionId) {
  return db
    .prepare('SELECT * FROM answer WHERE game_id = ? AND player_id = ? AND question_id = ?')
    .get(gameId, playerId, questionId);
}

/** Les réponses reçues pour une question, en ordre d'arrivée (horloge du serveur). */
export function getAnswersForQuestion(gameId, questionId) {
  return db
    .prepare(
      `SELECT id, player_id, choice_id, answered_at
         FROM answer
        WHERE game_id = ? AND question_id = ?
        ORDER BY answered_at, id`,
    )
    .all(gameId, questionId);
}

/** Combien de réponses reçues pour une question. */
export function countAnswers(gameId, questionId) {
  return db
    .prepare('SELECT COUNT(*) AS n FROM answer WHERE game_id = ? AND question_id = ?')
    .get(gameId, questionId).n;
}

// ── Fournies : les écritures en cours de partie ───────────────────────────

/**
 * Enregistre la réponse d'un joueur. answeredAt vient de l'horloge du
 * serveur (Date.now()), jamais du client.
 *
 * @returns {number} l'id de la réponse enregistrée
 */
export function recordAnswer(gameId, playerId, questionId, choiceId, answeredAt) {
  const result = db
    .prepare(
      `INSERT INTO answer (game_id, player_id, question_id, choice_id, answered_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(gameId, playerId, questionId, choiceId, answeredAt);
  return result.lastInsertRowid;
}

/** Fait avancer la machine à états d'une partie, d'un seul UPDATE. */
export function updateGameState(gameId, state, questionIndex, questionStartedAt) {
  db.prepare(
    'UPDATE game SET state = ?, question_index = ?, question_started_at = ? WHERE id = ?',
  ).run(state, questionIndex, questionStartedAt, gameId);
}

/** Inscrit les points obtenus par une réponse, une fois la question close. */
export function setAnswerPoints(answerId, points) {
  db.prepare('UPDATE answer SET points = ? WHERE id = ?').run(points, answerId);
}

/** Ajoute des points au total d'un joueur. */
export function addPointsToPlayer(playerId, points) {
  db.prepare('UPDATE player SET score = score + ? WHERE id = ?').run(points, playerId);
}
