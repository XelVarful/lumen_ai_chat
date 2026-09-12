import { History, Moon, Plus, Sun } from "lucide-react";

import { Brand } from "@/components/brand";

interface ChatHeaderProps {
  title: string;
  dark: boolean;
  onOpenSidebar: () => void;
  onNewChat: () => void;
  onToggleTheme: () => void;
}

export function ChatHeader({
  title,
  dark,
  onOpenSidebar,
  onNewChat,
  onToggleTheme,
}: ChatHeaderProps) {
  return (
    <header className="chat-header">
      <div className="header-start">
        <Brand />
        <span className="header-divider" />
        <h1 title={title}>{title}</h1>
      </div>
      <div className="header-actions">
        <button className="header-button" onClick={onOpenSidebar} aria-label="Открыть историю">
          <History size={17} /> <span>История</span>
        </button>
        <button className="header-button primary" onClick={onNewChat} aria-label="Новый чат">
          <Plus size={17} /> <span>Новый</span>
        </button>
        <button className="icon-button" onClick={onToggleTheme} aria-label="Переключить тему">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
