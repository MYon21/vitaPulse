export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const base = process.env.BACKEND_URL;
  if (!base) {
    return Response.json({ detail: "Scoring service is not configured." }, { status: 503 });
  }

  const response = await fetch(new URL("score", base), {
    method: "POST",
    headers: { "content-type": request.headers.get("content-type") ?? "application/json" },
    body: await request.text(),
    cache: "no-store",
  });

  return new Response(await response.text(), {
    status: response.status,
    headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
  });
}
