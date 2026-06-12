'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { AGENTS, TUTOR_CONFIG } from '@/lib/mock/ava-data';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import type { ChatMessage } from '@/lib/mock/ava-data';

const agent = AGENTS.find((a) => a.id === 'tutor')!;

// ─── Inline markdown renderer ─────────────────────────────────────────────────

function InlineMarkdown({ text }: { text: string }) {
  // Split on bold (**), italic (*), and inline code (`) markers
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return (
    <>
      {tokens.map((tok, i) => {
        if (tok.startsWith('**') && tok.endsWith('**'))
          return <strong key={i}>{tok.slice(2, -2)}</strong>;
        if (tok.startsWith('*') && tok.endsWith('*'))
          return <em key={i}>{tok.slice(1, -1)}</em>;
        if (tok.startsWith('`') && tok.endsWith('`'))
          return (
            <code
              key={i}
              className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-[11px] font-mono"
            >
              {tok.slice(1, -1)}
            </code>
          );
        return <span key={i}>{tok}</span>;
      })}
    </>
  );
}

function MiniMarkdown({ text }: { text: string }) {
  // Split into block-level paragraphs by blank lines
  const blocks = text.split(/\n{2,}/);

  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter(Boolean);
        if (lines.length === 0) return null;

        const firstLine = lines[0];

        // Heading: ## or ###
        if (/^#{2,3}\s/.test(firstLine)) {
          return (
            <p key={bi} className="text-[13px] font-semibold text-gray-800 dark:text-gray-200 mt-1">
              <InlineMarkdown text={firstLine.replace(/^#{2,3}\s/, '')} />
            </p>
          );
        }

        // Bullet list: lines starting with - or *
        if (lines.every((l) => /^[-*•]\s/.test(l.trim()))) {
          return (
            <ul key={bi} className="list-none space-y-0.5 pl-1">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-1.5 items-start text-[12px] leading-relaxed">
                  <span className="mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1D9E75' }} />
                  <InlineMarkdown text={l.replace(/^[-*•]\s/, '').trim()} />
                </li>
              ))}
            </ul>
          );
        }

        // Numbered list: lines starting with 1. 2. …
        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={bi} className="list-decimal list-inside space-y-0.5 pl-0.5">
              {lines.map((l, li) => (
                <li key={li} className="text-[12px] leading-relaxed">
                  <InlineMarkdown text={l.replace(/^\d+\.\s/, '').trim()} />
                </li>
              ))}
            </ol>
          );
        }

        // Default: paragraph (may span multiple soft-wrapped lines)
        return (
          <p key={bi} className="text-[12px] leading-relaxed">
            <InlineMarkdown text={lines.join(' ')} />
          </p>
        );
      })}
    </div>
  );
}

// ─── Tutor screen ─────────────────────────────────────────────────────────────

export default function TutorScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const cfg = getCurrentModelConfig();
      const res = await fetch('/api/ava/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: msg,
          history: messages,
          model: cfg.modelString,
          apiKey: cfg.apiKey,
          baseUrl: cfg.baseUrl,
          providerType: cfg.providerType,
        }),
      });

      const data = (await res.json()) as { text?: string; error?: string };

      if (!res.ok || !data.text) {
        throw new Error(data.error ?? 'Erro ao obter resposta');
      }

      setMessages((prev) => [...prev, { role: 'agent', text: data.text! }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
      setMessages((prev) => prev.slice(0, -1));
      setInput(msg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <>
      {/* Agent header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
          style={{ background: agent.bg }}
        >
          <span className="text-[16px]" style={{ color: agent.color }}>💬</span>
        </div>
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{agent.label}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{agent.description}</p>
        </div>
        <div
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: '#FAEEDA', color: '#633806' }}
        >
          ⚡ +{agent.xpReward} XP por dúvida resolvida
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 flex flex-col gap-2.5" style={{ minHeight: 200 }}>
        {/* Empty state */}
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: agent.bg }}
            >
              <span className="text-[18px]">💬</span>
            </div>
            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
              Tutor ENEM pronto para ajudar
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Escolha uma sugestão abaixo ou digite sua dúvida
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div
              key={i}
              className="ml-auto max-w-[80%] text-[12px] px-3.5 py-2.5 rounded-[12px_12px_4px_12px]"
              style={{ background: '#E1F5EE', color: '#085041' }}
            >
              {msg.text}
            </div>
          ) : (
            <div
              key={i}
              className="max-w-[94%] px-3.5 py-2.5 rounded-[12px_12px_12px_4px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            >
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">
                🤖 Tutor · modo ENEM
              </p>
              <MiniMarkdown text={msg.text} />
              {msg.formulaBox && (
                <div
                  className="rounded-md px-3.5 py-2.5 text-center text-[13px] font-medium my-2"
                  style={{ background: '#E6F1FB', color: '#0C447C' }}
                >
                  {msg.formulaBox}
                </div>
              )}
            </div>
          ),
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="max-w-[94%] px-3.5 py-2.5 rounded-[12px_12px_12px_4px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">🤖 Tutor · modo ENEM</p>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#1D9E75' }} />
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-[11px] text-red-500 dark:text-red-400 px-1">⚠ {error}</p>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
          }}
          placeholder="Digite sua dúvida sobre o ENEM..."
          disabled={loading}
          className="flex-1 text-[12px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#1D9E75] disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="px-3.5 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-40"
          style={{ background: '#1D9E75' }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5">
        {TUTOR_CONFIG.suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            className="text-[11px] px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-white transition-colors disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>
    </>
  );
}
