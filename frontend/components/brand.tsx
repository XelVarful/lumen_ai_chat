import { Asterisk } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Asterisk size={19} strokeWidth={2.4} />
      </span>
      {!compact && <span className="brand-wordmark">LUMEN</span>}
    </div>
  );
}
