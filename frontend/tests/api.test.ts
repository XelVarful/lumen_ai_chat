import { afterEach, describe, expect, it, vi } from "vitest";

import { streamChat } from "@/lib/api";
import { createMessage } from "@/lib/chat-utils";

describe("streamChat", () => {
  afterEach(() => vi.restoreAllMocks());

  it("собирает SSE-событие, разрезанное на сетевые chunks", async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('event: delta\ndata: {"type":"del'));
        controller.enqueue(encoder.encode('ta","content":"Привет"}\n\n'));
        controller.enqueue(encoder.encode('event: done\ndata: {"type":"done","content":""}\n\n'));
        controller.close();
      },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(body, { status: 200, headers: { "Content-Type": "text/event-stream" } }),
    );
    const events: string[] = [];

    await streamChat([createMessage("user", "Привет")], {
      signal: new AbortController().signal,
      onEvent: (event) => events.push(`${event.type}:${event.content}`),
    });

    expect(events).toEqual(["delta:Привет", "done:"]);
  });

  it("показывает понятную ошибку, если backend недоступен", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    await expect(
      streamChat([createMessage("user", "Привет")], {
        signal: new AbortController().signal,
        onEvent: () => undefined,
      }),
    ).rejects.toThrow("Backend недоступен");
  });
});

