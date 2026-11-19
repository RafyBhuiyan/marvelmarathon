import { AppError } from "./planning";

export async function readFields(
  request: Request,
): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(400, "INVALID_INPUT", "Send a JSON object.");
  }
  return body;
}

export async function respond(work: () => unknown, status = 200) {
  try {
    return Response.json(await work(), {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        { error: error.code, message: error.message },
        { status: error.status },
      );
    }
    console.error("API request failed", error);
    return Response.json(
      { error: "SERVER_ERROR", message: "Unable to complete the request." },
      { status: 500 },
    );
  }
}
