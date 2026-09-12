"use client";

import { useCallback, useEffect, useState } from "react";

import { ChatHeader } from "@/components/chat-header";
import { Composer } from "@/components/composer";
import { MessageList } from "@/components/message-list";
import { Sidebar } from "@/components/sidebar";
import { useChatStorage } from "@/hooks/use-chat-storage";
import { useChatStream } from "@/hooks/use-chat-stream";
import { createMessage, titleFromMessage } from "@/lib/chat-utils";
import type { ChatMessage, StreamEvent } from "@/types/chat";

export default function Home() {
  const storage = useChatStorage();
  const { start, stop, isStreaming } = useChatStream();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("aichat:theme");
    const shouldBeDark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(shouldBeDark);
    document.documentElement.dataset.theme = shouldBeDark ? "dark" : "light";
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    localStorage.setItem("aichat:theme", next ? "dark" : "light");
  };

  const patchAssistant = useCallback(
    (chatId: string, assistantId: string, event: StreamEvent) => {
      storage.updateChat(chatId, (chat) => ({
        ...chat,
        updatedAt: new Date().toISOString(),
        messages: chat.messages.map((message) => {
          if (message.id !== assistantId) return message;
          if (event.type === "delta") return { ...message, content: message.content + event.content };
          if (event.type === "done") return { ...message, status: "complete" };
          return message;
        }),
      }));
    },
    [storage],
  );

  const generate = useCallback(
    (chatId: string, history: ChatMessage[], assistantId: string) => {
      void start(history, {
        onEvent: (event) => patchAssistant(chatId, assistantId, event),
        onFailure: (error) => {
          storage.updateChat(chatId, (chat) => ({
            ...chat,
            messages: chat.messages.map((message) =>
              message.id === assistantId
                ? { ...message, content: error, status: "error" }
                : message,
            ),
          }));
        },
        onAbort: () => {
          storage.updateChat(chatId, (chat) => ({
            ...chat,
            messages: chat.messages.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    content: message.content || "Ответ остановлен.",
                    status: "complete",
                  }
                : message,
            ),
          }));
        },
      });
    },
    [patchAssistant, start, storage],
  );

  const sendMessage = (content: string) => {
    const chat = storage.activeChat;
    if (!chat || isStreaming) return;

    const userMessage = createMessage("user", content);
    const assistantMessage = createMessage("assistant", "", "streaming");
    const history = [
      ...chat.messages.filter((message) => message.status === "complete"),
      userMessage,
    ];

    storage.updateChat(chat.id, (current) => ({
      ...current,
      title: current.messages.length === 0 ? titleFromMessage(content) : current.title,
      updatedAt: new Date().toISOString(),
      messages: [...current.messages, userMessage, assistantMessage],
    }));
    generate(chat.id, history, assistantMessage.id);
  };

  const retryMessage = (messageId: string) => {
    const chat = storage.activeChat;
    if (!chat || isStreaming) return;
    const failedIndex = chat.messages.findIndex((message) => message.id === messageId);
    if (failedIndex < 0) return;

    const history = chat.messages
      .slice(0, failedIndex)
      .filter((message) => message.status === "complete");
    const assistantMessage = createMessage("assistant", "", "streaming");
    storage.updateChat(chat.id, (current) => ({
      ...current,
      messages: current.messages.map((message) =>
        message.id === messageId ? assistantMessage : message,
      ),
    }));
    generate(chat.id, history, assistantMessage.id);
  };

  if (!storage.hydrated) return <div className="app-loader">Загружаем Люмен…</div>;

  return (
    <main className="app-shell">
      {sidebarVisible && (
        <Sidebar
          chats={storage.chats}
          activeChatId={storage.activeChatId}
          open={sidebarVisible}
          onClose={() => setSidebarVisible(false)}
          onSelect={storage.setActiveChatId}
          onNew={storage.addChat}
          onDelete={storage.deleteChat}
        />
      )}
      <section className="chat-panel">
        <ChatHeader
          title={storage.activeChat?.title ?? "Новый чат"}
          dark={dark}
          onOpenSidebar={() => setSidebarVisible(true)}
          onNewChat={storage.addChat}
          onToggleTheme={toggleTheme}
        />
        <MessageList messages={storage.activeChat?.messages ?? []} onRetry={retryMessage} />
        <Composer isStreaming={isStreaming} onSend={sendMessage} onStop={stop} />
      </section>
    </main>
  );
}
