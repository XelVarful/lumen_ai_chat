"use client";

import { Check, Copy } from "lucide-react";
import { isValidElement, type ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function nodeToText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeToText(node.props.children);
  return "";
}

function CodeContainer({ children }: { children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = nodeToText(children).replace(/\n$/, "");

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>код</span>
        <button onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

export function MessageContent({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodeContainer }}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

