import type { Chat, ChatMessage } from "@/types/chat";

export const createId = () => crypto.randomUUID();

export function createChat(): Chat {
  const now = new Date().toISOString();
  return {
    id: createId(),
    title: "Новый чат",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createMessage(
  role: ChatMessage["role"],
  content: string,
  status: ChatMessage["status"] = "complete",
): ChatMessage {
  return {
    id: createId(),
    role,
    content,
    status,
    createdAt: new Date().toISOString(),
  };
}

export function titleFromMessage(content: string): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  return normalized.length > 38 ? `${normalized.slice(0, 38)}…` : normalized;
}

