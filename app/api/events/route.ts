import { subscribe, type AppEvent } from "@/lib/events";

/**
 * SIMULATED real-time channel: streams lib/events to open pages as
 * Server-Sent Events. `?ref=BC-4821` limits the stream to one application
 * (the client status page); no ref streams everything (admin).
 * Events carry only a type and a reference — never personal data.
 * Replaced by Supabase Realtime later.
 */

export const dynamic = "force-dynamic";

const KEEPALIVE_MS = 25_000;

function relevant(event: AppEvent, ref: string | null) {
  if (!ref) return true;
  if (event.type === "demo.reset") return true;
  return "ref" in event && event.ref === ref;
}

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref");
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };

      write(": connected\n\n");
      const unsubscribe = subscribe((event) => {
        if (relevant(event, ref)) write(`data: ${JSON.stringify(event)}\n\n`);
      });
      const keepalive = setInterval(() => write(": ping\n\n"), KEEPALIVE_MS);

      cleanup = () => {
        unsubscribe();
        clearInterval(keepalive);
      };
      request.signal.addEventListener("abort", () => {
        cleanup();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
