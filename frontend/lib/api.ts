import type { ChatMessage, StreamEvent } from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface StreamCallbacks {
  onEvent: (event: StreamEvent) => void;
  signal: AbortSignal;
}

export async function streamChat(
  messages: ChatMessage[],
  { onEvent, signal }: StreamCallbacks,
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map(({ role, content }) => ({ role, content })),
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Error("Backend недоступен. Проверьте, что FastAPI запущен.");
  }

  if (!response.ok) {
    if (response.status === 422) throw new Error("Проверьте текст сообщения.");
    throw new Error("Backend недоступен. Проверьте, что FastAPI запущен.");
  }
  if (!response.body) throw new Error("Сервер вернул пустой ответ.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      const data = block
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");
      if (data) onEvent(JSON.parse(data) as StreamEvent);
    }
    if (done) break;
  }
}
