import type { Cinema, Movie } from "./types";

type SeedMovie = [
  id: string,
  title: string,
  year: number,
  minutes: number,
  prerequisites: string[],
];

const films: SeedMovie[] = [
  ["iron-man", "Iron Man", 2008, 126, []],
  ["first-avenger", "Captain America: The First Avenger", 2011, 124, []],
  ["avengers", "The Avengers", 2012, 143, ["iron-man", "first-avenger"]],
  ["civil-war", "Captain America: Civil War", 2016, 147, ["avengers"]],
  ["ragnarok", "Thor: Ragnarok", 2017, 130, []],
  [
    "infinity-war",
    "Avengers: Infinity War",
    2018,
    149,
    ["civil-war", "ragnarok"],
  ],
  ["endgame", "Avengers: Endgame", 2019, 181, ["infinity-war"]],
  ["doomsday", "Avengers: Doomsday", 2026, 150, ["endgame"]],
];

export const seedMovies: Movie[] = films.map(
  ([id, title, releaseYear, runtimeMinutes, prerequisites]) => ({
    id,
    title,
    releaseYear,
    runtimeMinutes,
    prerequisites,
    watched: false,
    artwork: `/art/${id}.webp`,
  }),
);

export const seedCinemas: Cinema[] = [
  { id: "premiere", name: "Premiere Cinema", bundleSizes: [1, 3, 4] },
  { id: "grand", name: "The Grand", bundleSizes: [2, 5] },
  { id: "galaxy", name: "Galaxy Theatre", bundleSizes: [6, 9, 20] },
  { id: "starlight", name: "Starlight Cinema", bundleSizes: [4, 6] },
];
