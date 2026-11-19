import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { seedCinemas, seedMovies } from "./seed";

let connection: DatabaseSync | undefined;

export function transaction<T>(db: DatabaseSync, work: () => T): T {
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function database(): DatabaseSync {
  if (connection) return connection;
  const path =
    process.env.MARATHON_DB ?? join(process.cwd(), "data", "marathon.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  try {
    db.exec("PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;");
    transaction(db, () => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS movies (
          id TEXT PRIMARY KEY, title TEXT NOT NULL COLLATE NOCASE UNIQUE,
          releaseYear INTEGER NOT NULL, runtimeMinutes INTEGER NOT NULL,
          watched INTEGER NOT NULL DEFAULT 0, artwork TEXT
        );
        CREATE TABLE IF NOT EXISTS prerequisites (
          movieId TEXT NOT NULL REFERENCES movies(id), requiredId TEXT NOT NULL REFERENCES movies(id),
          PRIMARY KEY (movieId, requiredId)
        );
        CREATE TABLE IF NOT EXISTS cinemas (
          id TEXT PRIMARY KEY, name TEXT NOT NULL COLLATE NOCASE UNIQUE, bundleSizes TEXT NOT NULL
        );
      `);
      if (db.prepare("SELECT id FROM movies LIMIT 1").get()) return;
      const insertMovie = db.prepare(
        "INSERT INTO movies VALUES (?, ?, ?, ?, ?, ?)",
      );
      const insertLink = db.prepare("INSERT INTO prerequisites VALUES (?, ?)");
      for (const movie of seedMovies) {
        insertMovie.run(
          movie.id,
          movie.title,
          movie.releaseYear,
          movie.runtimeMinutes,
          0,
          movie.artwork,
        );
        for (const id of movie.prerequisites) insertLink.run(movie.id, id);
      }
      const insertCinema = db.prepare("INSERT INTO cinemas VALUES (?, ?, ?)");
      for (const cinema of seedCinemas)
        insertCinema.run(
          cinema.id,
          cinema.name,
          JSON.stringify(cinema.bundleSizes),
        );
    });
  } catch (error) {
    db.close();
    throw error;
  }
  connection = db;
  return db;
}
