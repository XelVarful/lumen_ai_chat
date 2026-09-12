import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useChatStorage } from "@/hooks/use-chat-storage";

describe("useChatStorage", () => {
  beforeEach(() => localStorage.clear());

  it("создаёт, сохраняет и удаляет чаты", async () => {
    const { result } = renderHook(() => useChatStorage());
    await waitFor(() => expect(result.current.hydrated).toBe(true));
    expect(result.current.chats).toHaveLength(1);

    act(() => result.current.addChat());
    expect(result.current.chats).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem("aichat:chats:v1") ?? "{}").version).toBe(1);

    const activeId = result.current.activeChatId;
    act(() => result.current.deleteChat(activeId));
    expect(result.current.chats).toHaveLength(1);
  });
});

