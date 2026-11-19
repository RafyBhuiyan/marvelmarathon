"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api, errorMessage } from "@/lib/client";
import type { Movie } from "@/lib/types";

export function MovieEditor({
  movie,
  movies,
  onSave,
  children,
}: {
  movie?: Movie;
  movies: Movie[];
  onSave: () => void;
  children: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    try {
      await api(
        movie ? `/api/movies/${movie.id}` : "/api/movies",
        movie ? "PATCH" : "POST",
        {
          title: data.get("title"),
          releaseYear: Number(data.get("releaseYear")),
          runtimeMinutes: Number(data.get("runtimeMinutes")),
          prerequisites: data.getAll("prerequisite"),
        },
      );
      setOpen(false);
      onSave();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }
  const choices = movies.filter((item) => item.id !== movie?.id);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError("");
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="editor">
        <DialogHeader>
          <DialogTitle>{movie ? "Edit movie" : "Add movie"}</DialogTitle>
          <DialogDescription>
            Set the film details and choose what to watch first.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="form-stack">
          <label>
            Movie title
            <Input
              name="title"
              defaultValue={movie?.title}
              required
              autoFocus
            />
          </label>
          <div className="form-pair">
            <label>
              Release year
              <Input
                name="releaseYear"
                type="number"
                min="1000"
                max="9999"
                defaultValue={movie?.releaseYear}
                required
              />
            </label>
            <label>
              Runtime (minutes)
              <Input
                name="runtimeMinutes"
                type="number"
                min="1"
                max="300"
                defaultValue={movie?.runtimeMinutes}
                required
              />
            </label>
          </div>
          <fieldset>
            <legend>Prerequisites</legend>
            <div className="choices">
              {choices.map((item) => (
                <label className="choice" key={item.id}>
                  <input
                    type="checkbox"
                    name="prerequisite"
                    value={item.id}
                    defaultChecked={movie?.prerequisites.includes(item.id)}
                  />
                  {item.title}
                </label>
              ))}
              {!choices.length && (
                <p className="muted">No other movies in the library yet.</p>
              )}
            </div>
          </fieldset>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button disabled={saving} type="submit">
            {saving ? "Saving…" : "Save movie"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
