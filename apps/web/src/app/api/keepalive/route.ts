const defaultApiBaseUrl = "https://apnarooms-guwahati-3lm4.onrender.com/api";

function getBackendHealthUrl() {
  if (process.env.BACKEND_HEALTH_URL) {
    return process.env.BACKEND_HEALTH_URL;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
  return `${apiBaseUrl.replace(/\/api\/?$/, "")}/health`;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const healthUrl = getBackendHealthUrl();
  const startedAt = Date.now();

  try {
    const response = await fetch(healthUrl, {
      cache: "no-store",
      headers: {
        "user-agent": "apnarooms-vercel-cron"
      }
    });

    const body = await response.text();

    return Response.json(
      {
        ok: response.ok,
        status: response.status,
        pingedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        backend: healthUrl,
        response: body.slice(0, 500)
      },
      { status: response.ok ? 200 : 502 }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        pingedAt: new Date().toISOString(),
        durationMs: Date.now() - startedAt,
        backend: healthUrl,
        error: error instanceof Error ? error.message : "Backend ping failed"
      },
      { status: 502 }
    );
  }
}
