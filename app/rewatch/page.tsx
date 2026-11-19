"use client";

import { useState } from "react";
import { Check, Clock3, Film, ListVideo } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useResource } from "@/lib/client";
import type { Movie, RewatchPlan } from "@/lib/types";

export default function RewatchPage() {
  const movies = useResource<Movie[]>("/api/movies");
  const [selection, setSelection] = useState("");
  const target =
    selection ||
    movies.data?.find((movie) => movie.id === "doomsday")?.id ||
    movies.data?.[0]?.id ||
    "";
  const result = useResource<RewatchPlan>(
    target ? `/api/movies/${target}/rewatch-order` : null,
  );
  const plan = result.data;
  const percent = plan?.movies.length
    ? Math.round((100 * plan.watchedCount) / plan.movies.length)
    : 0;
  return (
    <section className="work-view">
      <div className="eyebrow">
        <ListVideo size={16} />
        MCU REWATCH PLANNER
      </div>
      <h1>Rewatch plan</h1>
      <p className="intro">Choose a target movie to see what to watch first.</p>
      <div className="work-grid">
        <Card className="panel">
          <label>
            Target movie
            <select
              value={target}
              disabled={!movies.data?.length}
              onChange={(event) => setSelection(event.target.value)}
            >
              {!movies.data?.length && <option value="">Select a movie</option>}
              {movies.data?.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </label>
          {plan && (
            <div className="plan-stats">
              <h3>Your progress</h3>
              <p>
                {plan.watchedCount} of {plan.movies.length} watched
              </p>
              <Progress value={percent} aria-label="Rewatch progress" />
              <p className="remaining">
                <Clock3 size={16} />
                {plan.remainingMinutes} min remaining
              </p>
            </div>
          )}
        </Card>
        <Card className="panel">
          <h2>Watch order</h2>
          {(movies.error || result.error) && (
            <p className="error" role="alert">
              {movies.error || result.error}
            </p>
          )}
          {!plan && !movies.error && !result.error && (
            <p className="muted" role="status">
              Loading movies…
            </p>
          )}
          {plan && !plan.movies.length && (
            <p className="empty">
              You can start with this movie. It has no prerequisites.
            </p>
          )}
          <ol className="plan-list">
            {plan?.movies.map((movie, index) => (
              <li key={movie.id}>
                <span className="order-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="plan-title">
                  {movie.title}
                  <small>
                    {movie.releaseYear} · {movie.runtimeMinutes} min
                  </small>
                </span>
                <span
                  aria-label={movie.watched ? "Watched" : "To watch"}
                  title={movie.watched ? "Watched" : "To watch"}
                >
                  {movie.watched ? (
                    <Check className="green" size={19} />
                  ) : (
                    <Film className="muted" size={17} />
                  )}
                </span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </section>
  );
}
