"use client";

import { AlertCircle, Asterisk, Bot, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";

import { MessageContent } from "@/components/message-content";
import type { ChatMessage } from "@/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  onRetry: (messageId: string) => void;
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-index">AI / 01</div>
        <div className="empty-orb"><Asterisk size={32} /></div>
        <h2>Мысль начинается<br />с вопроса.</h2>
        <p>Разбираю сложное, ищу формулировки и помогаю создавать.</p>
      </div>
    );
  }

  return (
    <div className="message-scroll">
      <div className="messages">
        {messages.map((message) => (
          <article key={message.id} className={`message ${message.role}`}>
            {message.role === "assistant" && (
              <div className="assistant-avatar"><Bot size={17} /></div>
            )}
            <div className="message-body">
              {message.content && message.status !== "error" ? (
                <MessageContent content={message.content} />
              ) : message.status === "streaming" ? (
                <div className="typing"><i /><i /><i /></div>
              ) : null}
              {message.status === "streaming" && message.content && <span className="cursor" />}
              {message.status === "error" && (
                <div className="message-error">
                  <AlertCircle size={15} />
                  <span>{message.content || "Не удалось получить ответ."}</span>
                  <button onClick={() => onRetry(message.id)}>
                    <RotateCcw size={14} /> Повторить
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
