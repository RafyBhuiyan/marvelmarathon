export interface Movie {
  id: string;
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  prerequisites: string[];
  watched: boolean;
  artwork: string | null;
}

export interface Cinema {
  id: string;
  name: string;
  bundleSizes: number[];
}

export interface RewatchPlan {
  movies: Movie[];
  watchedCount: number;
  remainingMinutes: number;
}

export interface BookingQuote {
  possible: boolean;
  totalBundles: number | null;
  bundles: { size: number; count: number }[];
}
