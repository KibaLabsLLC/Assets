export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // KibaD telemetry endpoint
    if (request.method !== "POST" || url.pathname !== "/v1/report") {
      return new Response("Not Found", { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return new Response("Content-Type must be application/json", {
        status: 415,
      });
    }

    // Give each report a unique object key.
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const id = crypto.randomUUID();
    const key = `reports/${date}/${id}.json`;

    // Read the incoming JSON and store it in R2.
    const body = await request.arrayBuffer();

    await env.KIBAOS.put(key, body, {
      httpMetadata: {
        contentType: "application/json",
      },
    });

    return Response.json(
      {
        ok: true,
        id,
      },
      { status: 202 }
    );
  },
};
