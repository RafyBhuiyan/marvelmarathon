import { connection } from "next/server";
import { createCinema, listCinemas } from "@/lib/catalog";
import { readFields, respond } from "@/lib/http";

export async function GET() {
  await connection();
  return respond(listCinemas);
}

export function POST(request: Request) {
  return respond(async () => createCinema(await readFields(request)), 201);
}
