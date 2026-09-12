"use client";

import { useCallback, useRef, useState } from "react";

import { streamChat } from "@/lib/api";
import type { ChatMessage, StreamEvent } from "@/types/chat";

interface StreamHandlers {
  onEvent: (event: StreamEvent) => void;
  onFailure: (message: string) => void;
  onAbort: () => void;
}

export function useChatStream() {
  const controllerRef = useRef<AbortController | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const start = useCallback(
    async (messages: ChatMessage[], handlers: StreamHandlers) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setIsStreaming(true);

      try {
        await streamChat(messages, {
          signal: controller.signal,
          onEvent: (event) => {
            handlers.onEvent(event);
            if (event.type === "error") handlers.onFailure(event.content);
          },
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          handlers.onAbort();
        } else {
          handlers.onFailure(
            error instanceof Error ? error.message : "Неизвестная ошибка.",
          );
        }
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setIsStreaming(false);
        }
      }
    },
    [],
  );

  const stop = useCallback(() => controllerRef.current?.abort(), []);

  return { start, stop, isStreaming };
}
