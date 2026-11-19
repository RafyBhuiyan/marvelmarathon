import assert from "node:assert/strict";
import test from "node:test";
import { bookingQuote, rewatchOrder } from "../lib/planning.ts";

function film(id, prerequisites = [], watched = false) {
  return { id, title: id, prerequisites, watched, releaseYear: 2008, runtimeMinutes: 90, artwork: null };
}

test("a shared prerequisite appears once, ahead of both films that need it", () => {
  const movies = [film("a", [], true), film("b", ["a"]), film("c", ["a"]), film("target", ["b", "c"])];
  const plan = rewatchOrder(movies, "target");
  assert.deepEqual(plan.movies.map(movie => movie.id), ["a", "b", "c"]);
  assert.equal(plan.watchedCount, 1);
  assert.equal(plan.remainingMinutes, 180);
  assert.deepEqual(rewatchOrder(movies, "a"), { movies: [], watchedCount: 0, remainingMinutes: 0 });
});

test("both direct and indirect cycles report the same conflict", () => {
  for (const movies of [[film("a", ["a"])], [film("a", ["b"]), film("b", ["c"]), film("c", ["a"])]]) {
    assert.throws(() => rewatchOrder(movies, "a"), { status: 409, code: "CIRCULAR_DEPENDENCY" });
  }
});

test("quotes minimize the number of bundles and reconstruct an exact seat count", () => {
  for (const [sizes, group, minimum] of [
    [[1, 3, 4], 6, 2], [[2, 5], 11, 4], [[6, 9, 20], 44, 4], [[1, 500], 10000, 20],
  ]) {
    const quote = bookingQuote(sizes, group);
    assert.equal(quote.possible, true);
    assert.equal(quote.totalBundles, minimum);
    assert.equal(quote.bundles.reduce((sum, bundle) => sum + bundle.size * bundle.count, 0), group);
    assert.equal(quote.bundles.reduce((sum, bundle) => sum + bundle.count, 0), minimum);
  }
  assert.deepEqual(bookingQuote([4, 6], 7), { possible: false, totalBundles: null, bundles: [] });
});
