"use client";

import { useCallback, useEffect, useState } from "react";

import { createChat } from "@/lib/chat-utils";
import type { Chat } from "@/types/chat";

const STORAGE_KEY = "aichat:chats:v1";

interface StoredChats {
  version: 1;
  activeChatId: string;
  chats: Chat[];
}

export function useChatStorage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const stored = raw ? (JSON.parse(raw) as StoredChats) : null;
      if (stored?.version === 1 && stored.chats.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setChats(stored.chats);
        setActiveChatId(
          stored.chats.some((chat) => chat.id === stored.activeChatId)
            ? stored.activeChatId
            : stored.chats[0].id,
        );
      } else {
        const first = createChat();
        setChats([first]);
        setActiveChatId(first.id);
      }
    } catch {
      const first = createChat();
      setChats([first]);
      setActiveChatId(first.id);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || !activeChatId) return;
    const payload: StoredChats = { version: 1, chats, activeChatId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [activeChatId, chats, hydrated]);

  const addChat = useCallback(() => {
    const chat = createChat();
    setChats((current) => [chat, ...current]);
    setActiveChatId(chat.id);
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats((current) => {
      const remaining = current.filter((chat) => chat.id !== id);
      if (remaining.length > 0) {
        setActiveChatId((active) => (active === id ? remaining[0].id : active));
        return remaining;
      }
      const replacement = createChat();
      setActiveChatId(replacement.id);
      return [replacement];
    });
  }, []);

  const updateChat = useCallback((id: string, updater: (chat: Chat) => Chat) => {
    setChats((current) =>
      current.map((chat) => (chat.id === id ? updater(chat) : chat)),
    );
  }, []);

  return {
    chats,
    activeChat: chats.find((chat) => chat.id === activeChatId),
    activeChatId,
    setActiveChatId,
    addChat,
    deleteChat,
    updateChat,
    hydrated,
  };
}
