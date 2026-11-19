import { connection } from "next/server";
import { listMovies, saveMovie } from "@/lib/catalog";
import { readFields, respond } from "@/lib/http";

export async function GET() {
  await connection();
  return respond(listMovies);
}

export function POST(request: Request) {
  return respond(async () => saveMovie(await readFields(request)), 201);
}
