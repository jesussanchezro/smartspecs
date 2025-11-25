import { AxiosError } from "axios";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIFY_API_URL = process.env.DIFY_API_URL;
const DIFY_API_KEY = process.env.DIFY_API_KEY;
const DEFAULT_WORKFLOW_ID = process.env.DIFY_WORKFLOW_ID;

export async function POST(req: Request) {
  try {
    if (!DIFY_API_KEY) {
      return NextResponse.json({ error: "Falta DIFY_API_KEY" }, { status: 500 });
    }
    if (!DIFY_API_URL) {
      return NextResponse.json({ error: "Falta DIFY_API_URL" }, { status: 500 });
    }

    const { inputs = {}, user = "57Blocks", workflow_id } = await req.json();

    const upstream = await fetch(DIFY_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        inputs,
        user,
        workflow_id: workflow_id ?? DEFAULT_WORKFLOW_ID,
        response_mode: "streaming",
      }),
      // @ts-expect-error - duplex is required for streaming but not in RequestInit type yet
      duplex: "half"
    });

    if (!upstream.ok || !upstream.body) {
      const text = await upstream.text().catch(() => "");
      return NextResponse.json(
        { error: "Upstream error", details: text || upstream.statusText },
        { status: upstream.status || 500 }
      );
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    const error = err as AxiosError;
    console.error("Dify Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.message, details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}