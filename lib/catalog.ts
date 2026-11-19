import { randomUUID } from "node:crypto";
import { database, transaction } from "./db";
import { AppError, rewatchOrder } from "./planning";
import type { Cinema, Movie } from "./types";

type Fields = Record<string, unknown>;

function invalid(message: string): never {
  throw new AppError(400, "INVALID_INPUT", message);
}

function name(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) invalid(`Enter a ${label}.`);
  return value.trim();
}

export function integer(
  value: unknown,
  min: number,
  max: number,
  label: string,
): number {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    invalid(`${label} must be a whole number between ${min} and ${max}.`);
  }
  return value;
}

export function listMovies(): Movie[] {
  const rows = database()
    .prepare(
      `
    SELECT m.*, (SELECT json_group_array(requiredId ORDER BY rowid) FROM prerequisites WHERE movieId = m.id) AS prerequisites
    FROM movies m ORDER BY releaseYear, title
  `,
    )
    .all();
  return rows.map((row) => ({
    id: String(row.id),
    title: String(row.title),
    releaseYear: Number(row.releaseYear),
    runtimeMinutes: Number(row.runtimeMinutes),
    watched: Boolean(row.watched),
    artwork: row.artwork === null ? null : String(row.artwork),
    prerequisites: JSON.parse(String(row.prerequisites)),
  }));
}

export function saveMovie(fields: Fields, existingId?: string): Movie {
  const db = database();
  // Check the proposed graph and write its edges under the same lock.
  return transaction(db, () => {
    const movies = listMovies();
    const previous = movies.find((movie) => movie.id === existingId);
    if (existingId && !previous)
      throw new AppError(404, "MOVIE_NOT_FOUND", "Movie not found.");
    const id = existingId ?? fields.id ?? randomUUID();
    if (typeof id !== "string" || !/^[\w-]+$/.test(id))
      invalid("Use letters, digits, underscores, or hyphens for the movie ID.");
    if (!previous && movies.some((movie) => movie.id === id))
      throw new AppError(409, "DUPLICATE_ID", "Movie ID already exists.");
    const input = { ...previous, ...fields };
    const title = name(input.title, "movie title");
    if (
      movies.some(
        (movie) =>
          movie.id !== id && movie.title.toLowerCase() === title.toLowerCase(),
      )
    ) {
      throw new AppError(
        409,
        "DUPLICATE_TITLE",
        "A movie with this title already exists.",
      );
    }
    const prerequisites =
      input.prerequisites === undefined ? [] : input.prerequisites;
    if (
      !Array.isArray(prerequisites) ||
      !prerequisites.every((item) => typeof item === "string")
    ) {
      invalid("Prerequisites must be a list of movie IDs.");
    }
    const knownIds = new Set([...movies.map((movie) => movie.id), id]);
    if (prerequisites.some((item) => !knownIds.has(item)))
      invalid("A selected prerequisite does not exist.");
    const watched = input.watched === undefined ? false : input.watched;
    if (typeof watched !== "boolean") invalid("Watched must be true or false.");
    const movie: Movie = {
      id,
      title,
      watched,
      prerequisites: [...new Set<string>(prerequisites)],
      artwork: previous?.artwork ?? null,
      releaseYear: integer(input.releaseYear, 1000, 9999, "Release year"),
      runtimeMinutes: integer(input.runtimeMinutes, 1, 300, "Runtime"),
    };
    rewatchOrder([...movies.filter((item) => item.id !== id), movie], id);

    db.prepare(
      `
      INSERT INTO movies (id, title, releaseYear, runtimeMinutes, watched, artwork) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET title=excluded.title, releaseYear=excluded.releaseYear,
        runtimeMinutes=excluded.runtimeMinutes, watched=excluded.watched
    `,
    ).run(
      id,
      title,
      movie.releaseYear,
      movie.runtimeMinutes,
      Number(watched),
      movie.artwork,
    );
    db.prepare("DELETE FROM prerequisites WHERE movieId = ?").run(id);
    const addLink = db.prepare("INSERT INTO prerequisites VALUES (?, ?)");
    for (const prerequisite of movie.prerequisites)
      addLink.run(id, prerequisite);
    return movie;
  });
}

export function listCinemas(): Cinema[] {
  return database()
    .prepare("SELECT * FROM cinemas ORDER BY rowid")
    .all()
    .map((row) => ({
      id: String(row.id),
      name: String(row.name),
      bundleSizes: JSON.parse(String(row.bundleSizes)),
    }));
}

export function createCinema(fields: Fields): Cinema {
  const cinemaName = name(fields.name, "cinema name");
  const sizes = fields.bundleSizes;
  if (!Array.isArray(sizes) || sizes.length < 1 || sizes.length > 10)
    invalid("Choose between one and ten bundle sizes.");
  const bundleSizes = sizes
    .map((size) => integer(size, 1, 500, "Bundle size"))
    .sort((a, b) => a - b);
  if (new Set(bundleSizes).size !== sizes.length)
    invalid("Each bundle size must be different.");
  const db = database();
  return transaction(db, () => {
    if (
      listCinemas().some(
        (cinema) => cinema.name.toLowerCase() === cinemaName.toLowerCase(),
      )
    ) {
      throw new AppError(
        409,
        "DUPLICATE_NAME",
        "A cinema with this name already exists.",
      );
    }
    const cinema = { id: randomUUID(), name: cinemaName, bundleSizes };
    db.prepare("INSERT INTO cinemas VALUES (?, ?, ?)").run(
      cinema.id,
      cinema.name,
      JSON.stringify(bundleSizes),
    );
    return cinema;
  });
}
