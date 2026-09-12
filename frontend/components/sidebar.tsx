import { ArrowUpRight, MessageSquare, Plus, Trash2, X } from "lucide-react";

import { Brand } from "@/components/brand";
import type { Chat } from "@/types/chat";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function Sidebar({
  chats,
  activeChatId,
  open,
  onClose,
  onSelect,
  onNew,
  onDelete,
}: SidebarProps) {
  return (
    <>
      {open && <button className="sidebar-overlay" aria-label="Закрыть меню" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div>
            <span className="drawer-kicker">Архив</span>
            <h2>Диалоги</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Закрыть меню">
            <X size={19} />
          </button>
        </div>

        <button className="new-chat-button" onClick={onNew}>
          <Plus size={18} />
          Новый чат
        </button>

        <nav className="chat-list" aria-label="История чатов">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-row ${chat.id === activeChatId ? "active" : ""}`}
            >
              <button
                className="chat-select"
                onClick={() => {
                  onSelect(chat.id);
                  if (window.innerWidth < 760) onClose();
                }}
              >
                <MessageSquare size={16} />
                <span className="chat-meta">
                  <strong>{chat.title}</strong>
                  <small>{new Date(chat.updatedAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</small>
                </span>
                <ArrowUpRight className="chat-arrow" size={15} />
              </button>
              <button
                className="delete-chat"
                aria-label={`Удалить чат ${chat.title}`}
                onClick={() => onDelete(chat.id)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer"><Brand /> <span>Groq · Free tier</span></div>
      </aside>
    </>
  );
}
