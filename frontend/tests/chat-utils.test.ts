import { describe, expect, it } from "vitest";

import { createChat, titleFromMessage } from "@/lib/chat-utils";

describe("chat utils", () => {
  it("создаёт пустой чат", () => {
    const chat = createChat();
    expect(chat.title).toBe("Новый чат");
    expect(chat.messages).toEqual([]);
  });

  it("делает короткий заголовок из первого сообщения", () => {
    expect(titleFromMessage("  Как   работает FastAPI?  ")).toBe("Как работает FastAPI?");
    expect(titleFromMessage("а".repeat(50))).toHaveLength(39);
  });
});

