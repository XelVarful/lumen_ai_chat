export type MessageRole = "user" | "assistant";
export type MessageStatus = "complete" | "streaming" | "error";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StreamEvent {
  type: "delta" | "done" | "error";
  content: string;
}

