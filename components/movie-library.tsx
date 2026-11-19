"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Check,
  CircleCheck,
  Clapperboard,
  Clock3,
  Film,
  ListTree,
  Pencil,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MovieEditor } from "./movie-editor";
import { api, errorMessage, useResource } from "@/lib/client";
import type { Movie } from "@/lib/types";

const filters = ["All movies", "To watch", "Watched"] as const;

export function MovieLibrary() {
  const { data: movies, error, reload } = useResource<Movie[]>("/api/movies");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All movies");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const watched = movies?.filter((movie) => movie.watched).length;
  const visible = movies?.filter(
    (movie) =>
      movie.title.toLowerCase().includes(query.trim().toLowerCase()) &&
      (filter === "All movies" || movie.watched === (filter === "Watched")),
  );

  async function toggle(movie: Movie) {
    setSaving(movie.id);
    setSaveError("");
    try {
      await api(`/api/movies/${movie.id}`, "PATCH", {
        watched: !movie.watched,
      });
      reload();
    } catch (error) {
      setSaveError(errorMessage(error));
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-line" />
            MCU REWATCH PLANNER
          </div>
          <h1>
            ROAD TO <span>DOOMSDAY</span>
          </h1>
          <p>
            Build your rewatch list, track your progress, and bring your crew to
            opening night.
          </p>
          <div className="hero-stats">
            <span>
              <Film />
              {movies?.length ?? "…"} movies
            </span>
            <i />
            <span>
              <CircleCheck />
              {watched ?? "…"} watched
            </span>
          </div>
        </div>
      </section>
      <section aria-labelledby="library-heading">
        <div className="section-heading">
          <h2 id="library-heading">Movie library</h2>
          <MovieEditor movies={movies ?? []} onSave={reload}>
            <Button disabled={!movies}>
              <Plus />
              Add movie
            </Button>
          </MovieEditor>
        </div>
        <div className="toolbar">
          <div className="filters" aria-label="Watch status">
            {filters.map((item) => (
              <button
                key={item}
                aria-pressed={item === filter}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search">
            <Search size={16} />
            <Input
              aria-label="Search movies"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies…"
            />
          </label>
        </div>
        {(error || saveError) && (
          <p role="alert" className="error">
            {error || saveError}{" "}
            <button onClick={reload}>Reload library</button>
          </p>
        )}
        {!error && !movies && (
          <p role="status" className="muted">
            Loading movie library…
          </p>
        )}
        {visible && !visible.length && (
          <p className="empty">No movies match this view.</p>
        )}
        <div className="movie-grid">
          {visible?.map((movie) => (
            <Card className="movie-card" key={movie.id}>
              <div className="card-art">
                {movie.artwork ? (
                  <Image
                    src={movie.artwork}
                    alt=""
                    fill
                    sizes="(max-width: 620px) 95vw, (max-width: 1000px) 46vw, 25vw"
                  />
                ) : (
                  <Clapperboard className="poster-placeholder" size={46} />
                )}
                <MovieEditor
                  movie={movie}
                  movies={movies ?? []}
                  onSave={reload}
                >
                  <button
                    className="edit-button"
                    aria-label={`Edit ${movie.title}`}
                  >
                    <Pencil size={14} />
                  </button>
                </MovieEditor>
              </div>
              <div className="card-copy">
                <div className="metadata">
                  <span>{movie.releaseYear}</span>
                  <b>·</b>
                  <span>
                    <Clock3 size={13} />
                    {movie.runtimeMinutes} min
                  </span>
                </div>
                <h3>{movie.title}</h3>
                <div className="card-bottom">
                  <button
                    className={`watch-toggle ${movie.watched ? "is-watched" : ""}`}
                    aria-label={`Watched: ${movie.title}`}
                    aria-pressed={movie.watched}
                    disabled={saving !== null}
                    onClick={() => toggle(movie)}
                  >
                    <span className="check-box">
                      {movie.watched && <Check size={12} />}
                    </span>
                    {movie.watched ? "Watched" : "To watch"}
                  </button>
                  <span className="dependency" title="Prerequisites">
                    <ListTree size={14} />
                    {movie.prerequisites.length}
                    <span className="sr-only"> prerequisites</span>
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
