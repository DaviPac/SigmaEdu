'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { AGENTS, TUTOR_CONFIG } from '@/lib/mock/ava-data';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import type { ChatMessage } from '@/lib/mock/ava-data';

const agent = AGENTS.find((a) => a.id === 'tutor')!;

import MiniMarkdown from '@/components/ava/mini-markdown';

// ─── Tutor screen ─────────────────────────────────────────────────────────────

export default function TutorScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
          <span className="text-[16px]" style={{ color: agent.color }}>
            💬
          </span>
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
      <div
        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 flex flex-col gap-2.5"
        style={{ minHeight: 200 }}
      >
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
              className="ml-auto max-w-[80%] text-[12px] px-3.5 py-2.5 rounded-[12px_12px_4px_12px] whitespace-pre-wrap"
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
              <MiniMarkdown text={msg.text} bulletColor="#1D9E75" />
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
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5">
              🤖 Tutor · modo ENEM
            </p>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#1D9E75' }} />
          </div>
        )}

        {/* Error */}
        {error && <p className="text-[11px] text-red-500 dark:text-red-400 px-1">⚠ {error}</p>}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-2 items-end">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Digite sua dúvida sobre o ENEM..."
          disabled={loading}
          className="flex-1 text-[12px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#1D9E75] disabled:opacity-50 resize-none overflow-y-auto"
          style={{ minHeight: '38px', maxHeight: '120px' }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = '38px';
            target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
          }}
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
