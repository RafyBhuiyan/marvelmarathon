import type { BookingQuote, Movie, RewatchPlan } from "./types";

export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function rewatchOrder(movies: Movie[], targetId: string): RewatchPlan {
  const byId = new Map(movies.map((movie) => [movie.id, movie]));
  const visiting = new Set<string>();
  const finished = new Set<string>();
  const ordered: Movie[] = [];

  function visit(id: string) {
    if (finished.has(id)) return;
    if (visiting.has(id)) {
      throw new AppError(
        409,
        "CIRCULAR_DEPENDENCY",
        "These prerequisites would create a loop.",
      );
    }
    const movie = byId.get(id);
    if (!movie) throw new AppError(404, "MOVIE_NOT_FOUND", "Movie not found.");

    visiting.add(id);
    for (const prerequisite of movie.prerequisites) visit(prerequisite);
    visiting.delete(id);
    finished.add(id);
    // Adding a film on the way back puts all of its prerequisites before it.
    if (id !== targetId) ordered.push(movie);
  }

  visit(targetId);
  return {
    movies: ordered,
    watchedCount: ordered.filter((movie) => movie.watched).length,
    remainingMinutes: ordered.reduce(
      (sum, movie) => sum + (movie.watched ? 0 : movie.runtimeMinutes),
      0,
    ),
  };
}

export function bookingQuote(sizes: number[], groupSize: number): BookingQuote {
  const fewest = Array<number>(groupSize + 1).fill(Infinity);
  const lastBundle = Array<number>(groupSize + 1).fill(0);
  fewest[0] = 0;

  // Every exact purchase ends with one of the cinema's available bundles.
  for (let seats = 1; seats <= groupSize; seats++) {
    for (const size of sizes) {
      if (size <= seats && fewest[seats - size] + 1 < fewest[seats]) {
        fewest[seats] = fewest[seats - size] + 1;
        lastBundle[seats] = size;
      }
    }
  }
  if (!Number.isFinite(fewest[groupSize]))
    return { possible: false, totalBundles: null, bundles: [] };

  const counts = new Map<number, number>();
  for (let seats = groupSize; seats > 0; seats -= lastBundle[seats]) {
    const size = lastBundle[seats];
    counts.set(size, (counts.get(size) ?? 0) + 1);
  }
  const bundles = [...counts]
    .sort(([a], [b]) => b - a)
    .map(([size, count]) => ({ size, count }));
  return { possible: true, totalBundles: fewest[groupSize], bundles };
}
