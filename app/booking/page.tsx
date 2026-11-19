"use client";

import { useState, type FormEvent } from "react";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, errorMessage, useResource } from "@/lib/client";
import type { BookingQuote, Cinema } from "@/lib/types";

function AddCinema({ onSave }: { onSave: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    setSaving(true);
    try {
      const cinema = await api<Cinema>("/api/cinemas", "POST", {
        name: form.get("name"),
        bundleSizes: String(form.get("sizes")).split(",").map(Number),
      });
      setOpen(false);
      onSave(cinema.id);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setError("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Add cinema
        </Button>
      </DialogTrigger>
      <DialogContent className="editor">
        <DialogTitle>Add cinema</DialogTitle>
        <DialogDescription>
          Enter the seat bundles available at this cinema.
        </DialogDescription>
        <form className="form-stack" onSubmit={save}>
          <label>
            Cinema name
            <Input name="name" required />
          </label>
          <label>
            Bundle sizes
            <Input name="sizes" placeholder="e.g. 2, 5" required />
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <Button disabled={saving}>
            {saving ? "Saving…" : "Save cinema"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BookingPage() {
  const cinemas = useResource<Cinema[]>("/api/cinemas");
  const [selection, setSelection] = useState("");
  const [group, setGroup] = useState("6");
  const cinema =
    cinemas.data?.find((item) => item.id === selection) ?? cinemas.data?.[0];
  const size = Number(group);
  const valid = Number.isInteger(size) && size >= 1 && size <= 10000;
  const result = useResource<BookingQuote>(
    cinema && valid
      ? `/api/cinemas/${cinema.id}/booking?groupSize=${size}`
      : null,
  );
  const quote = result.data;
  return (
    <section className="work-view">
      <div className="eyebrow">
        <Ticket size={16} />
        WATCH PARTY
      </div>
      <div className="section-heading">
        <h1>Booking</h1>
        <AddCinema
          onSave={(id) => {
            setSelection(id);
            cinemas.reload();
          }}
        />
      </div>
      <p className="intro">
        Find the fewest seat bundles for your whole group.
      </p>
      <div className="work-grid">
        <Card className="panel form-stack">
          <label>
            Cinema
            <select
              disabled={!cinema}
              value={cinema?.id ?? ""}
              onChange={(event) => setSelection(event.target.value)}
            >
              {cinemas.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Group size
            <Input
              type="number"
              min="1"
              max="10000"
              step="1"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            />
          </label>
          {cinema && (
            <div>
              <h3>Available bundles</h3>
              <div className="bundle-sizes">
                {cinema.bundleSizes.map((seats) => (
                  <span key={seats}>
                    {seats} {seats === 1 ? "seat" : "seats"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card className="panel" aria-live="polite">
          <h2>Your quote</h2>
          {(cinemas.error || result.error) && (
            <p role="alert" className="error">
              {cinemas.error || result.error}
            </p>
          )}
          {!valid && (
            <p className="empty">
              Enter a whole group size between 1 and 10,000.
            </p>
          )}
          {valid && !quote && !result.error && !cinemas.error && (
            <p className="muted" role="status">
              Calculating quote…
            </p>
          )}
          {quote?.possible && (
            <>
              <div className="quote-total">
                <Ticket size={29} />
                <strong>
                  {quote.totalBundles}{" "}
                  {quote.totalBundles === 1 ? "bundle" : "bundles"}
                </strong>
              </div>
              <p className="muted">
                Exactly {size} {size === 1 ? "seat" : "seats"} at {cinema?.name}
                .
              </p>
              <ul className="plan-list">
                {quote.bundles.map((bundle) => (
                  <li key={bundle.size}>
                    <span>{bundle.size}-seat bundle</span>
                    <strong>× {bundle.count}</strong>
                  </li>
                ))}
              </ul>
            </>
          )}
          {quote && !quote.possible && (
            <p className="empty">
              Not possible. The available bundles cannot seat exactly {size}{" "}
              people.
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}
