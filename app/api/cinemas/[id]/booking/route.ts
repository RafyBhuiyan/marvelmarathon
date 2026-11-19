import { integer, listCinemas } from "@/lib/catalog";
import { respond } from "@/lib/http";
import { AppError, bookingQuote } from "@/lib/planning";

export async function GET(
  request: Request,
  context: RouteContext<"/api/cinemas/[id]/booking">,
) {
  const { id } = await context.params;
  return respond(() => {
    const value = new URL(request.url).searchParams.get("groupSize");
    const groupSize = integer(Number(value), 1, 10000, "Group size");
    const cinema = listCinemas().find((cinema) => cinema.id === id);
    if (!cinema)
      throw new AppError(404, "CINEMA_NOT_FOUND", "Cinema not found.");
    return bookingQuote(cinema.bundleSizes, groupSize);
  });
}
