"use client";

import { ArrowUp, Square } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

interface ComposerProps {
  isStreaming: boolean;
  onSend: (content: string) => void;
  onStop: () => void;
}

export function Composer({ isStreaming, onSend, onStop }: ComposerProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [value]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const content = value.trim();
    if (!content || isStreaming) return;
    onSend(content);
    setValue("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="composer-wrap">
      <form className="composer" onSubmit={submit}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Напишите сообщение…"
          rows={1}
          aria-label="Сообщение"
        />
        {isStreaming ? (
          <button className="send-button stop" type="button" onClick={onStop} aria-label="Остановить">
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button className="send-button" type="submit" disabled={!value.trim()} aria-label="Отправить">
            <ArrowUp size={19} strokeWidth={2.5} />
          </button>
        )}
      </form>
      <p className="composer-hint">LUMEN может ошибаться. Проверяйте важную информацию.</p>
    </div>
  );
}
