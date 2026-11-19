import { saveMovie } from "@/lib/catalog";
import { readFields, respond } from "@/lib/http";

export function PATCH(request: Request, context: RouteContext<"/api/movies/[id]">) {
  return respond(async () => saveMovie(await readFields(request), (await context.params).id));
}
