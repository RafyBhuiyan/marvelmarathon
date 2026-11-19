import { listMovies } from "@/lib/catalog";
import { respond } from "@/lib/http";
import { rewatchOrder } from "@/lib/planning";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/movies/[id]/rewatch-order">,
) {
  const { id } = await context.params;
  return respond(() => rewatchOrder(listMovies(), id));
}
