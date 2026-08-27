/**
 * La connexion à la base. Un seul fichier SQLite : server/data/quizm9.db.
 *
 * Le fichier n'est pas versionné : chacun a le sien, régénéré au besoin.
 * Pour repartir à neuf : arrêtez le serveur et supprimez server/data/quizm9.db.
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataDir = new URL('../../data/', import.meta.url);

export const db = new DatabaseSync(fileURLToPath(new URL('quizm9.db', dataDir)));

// Les lecteurs (le harnais, un autre processus) ne bloquent pas le serveur.
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/**
 * TODO (jalon ①) : créer les tables, puis les remplir si la base est vide.
 *
 * 1. Lire le fichier schema.sql : readFileSync(chemin, 'utf8'). Le chemin
 *    se construit comme celui de quizm9.db ci-dessus, à partir de dataDir.
 * 2. L'exécuter d'un bloc avec db.exec(...). Le schéma est en
 *    CREATE TABLE IF NOT EXISTS : le réexécuter à chaque démarrage est
 *    sans danger.
 * 3. Compter les questionnaires
 * 4. S'il n'y en a aucun, lire et exécuter seed.sql de la même façon.
 */


export function initializeDatabase() {
  const schema = readFileSync(new URL('schema.sql', dataDir), 'utf8');
  db.exec(schema)
  if (db.prepare('SELECT COUNT(*) FROM quizzes').get()['COUNT(*)'] === 0) {
    const seed = readFileSync(new URL('seed.sql', dataDir), 'utf8');
    db.exec(seed);
  }
  ;
}

/**
 * Enveloppe des écritures qui doivent réussir ENSEMBLE. Si fn lève une
 * erreur, tout est annulé (ROLLBACK) ; sinon tout est confirmé (COMMIT).
 */
export function withTransaction(fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
