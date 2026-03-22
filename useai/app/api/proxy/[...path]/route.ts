import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://useai-backend-production.up.railway.app";

async function proxyRequest(req: NextRequest) {
  // Extract the path after /api/proxy/
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\/proxy\/?/, "");
  const search = url.search; // preserve query params

  const targetUrl = `${BACKEND_URL}/${path}${search}`;

  // Forward headers, skip host-level headers that would confuse the backend
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const skip = ["host", "connection", "transfer-encoding"];
    if (!skip.includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Build fetch options
  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
  };

  // Forward body for non-GET/HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    // Check content type to handle form data vs JSON
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Stream the raw body for file uploads
      fetchOptions.body = await req.arrayBuffer();
    } else {
      try {
        const body = await req.text();
        if (body) {
          fetchOptions.body = body;
        }
      } catch {
        // No body to forward
      }
    }
  }

  try {
    const backendResponse = await fetch(targetUrl, fetchOptions);

    // Read the response body
    const responseBody = await backendResponse.arrayBuffer();

    // Build the proxied response
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // Forward response headers from backend
    backendResponse.headers.forEach((value, key) => {
      // Skip headers that Next.js manages
      const skip = [
        "transfer-encoding",
        "content-encoding",
        "content-length",
      ];
      if (!skip.includes(key.toLowerCase())) {
        response.headers.set(key, value);
      }
    });

    return response;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Backend service unavailable" },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req);
}
export async function POST(req: NextRequest) {
  return proxyRequest(req);
}
export async function PUT(req: NextRequest) {
  return proxyRequest(req);
}
export async function DELETE(req: NextRequest) {
  return proxyRequest(req);
}
export async function PATCH(req: NextRequest) {
  return proxyRequest(req);
}
