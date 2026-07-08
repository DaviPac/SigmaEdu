'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Glasses, Settings2 } from 'lucide-react';
import { AGENTS, ACOMPANHAMENTO_CONFIG, ACOMPANHAMENTO_FORMATS } from '@/lib/mock/ava-data';
import type { ChatMessage } from '@/lib/mock/ava-data';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const agent = AGENTS.find((a) => a.id === 'acompanhamento')!;

import MiniMarkdown from '@/components/ava/mini-markdown';

/** Componente principal da tela do agente de acompanhamento. */
export default function AcompanhamentoScreen() {
  const [personalityConfigured, setPersonalityConfigured] = useState(false);
  const [personalityType, setPersonalityType] = useState('Normal');
  const [customPersonality, setCustomPersonality] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isGeneratingFormat, setIsGeneratingFormat] = useState(false);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const storedType = localStorage.getItem('avaAcompanhamento_type');
    const storedCustom = localStorage.getItem('avaAcompanhamento_custom');
    const storedConfigured = localStorage.getItem('avaAcompanhamento_configured');

    if (storedType) setPersonalityType(storedType);
    if (storedCustom) setCustomPersonality(storedCustom);
    if (storedConfigured === 'true') setPersonalityConfigured(true);

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, personalityConfigured]);

  /** Define a personalidade escolhida pelo usuário, busca formato customizado se necessário e salva. */
  const handleConfirmPersonality = async () => {
    let format = '';

    if (personalityType === 'Personalizar professor') {
      setIsGeneratingFormat(true);
      try {
        const res = await fetch(`${BACKEND_URL}/ava/format-generator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personality: customPersonality,
          }),
        });
        const data = await res.json();
        if (data.format) format = data.format;
      } catch (err) {
        console.error('Failed to generate format', err);
      } finally {
        setIsGeneratingFormat(false);
      }
    } else {
      format = ACOMPANHAMENTO_FORMATS[personalityType] || '';
    }

    setPersonalityConfigured(true);
    localStorage.setItem('avaAcompanhamento_type', personalityType);
    localStorage.setItem('avaAcompanhamento_custom', customPersonality);
    localStorage.setItem('avaAcompanhamento_configured', 'true');
    if (format) {
      localStorage.setItem('avaAcompanhamento_format', format);
    } else {
      localStorage.removeItem('avaAcompanhamento_format');
    }
  };

  /** Redefine a personalidade, permitindo a edição na tela inicial. */
  const handleEditPersonality = () => {
    setPersonalityConfigured(false);
    localStorage.setItem('avaAcompanhamento_configured', 'false');
  };

  const currentPersonality =
    personalityType === 'Personalizar professor' ? customPersonality : personalityType;

  /** Envia uma mensagem do usuário para o backend do agente. */
  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const formatTemplate = localStorage.getItem('avaAcompanhamento_format') || undefined;

      const res = await fetch(`${BACKEND_URL}/ava/acompanhamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: msg,
          history: messages,
          personality: currentPersonality,
          formatTemplate,
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

  if (!isLoaded) return null;

  if (!personalityConfigured) {
    return (
      <div className="max-w-xl mx-auto pt-10">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 shadow-sm text-center">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: agent.bg, color: agent.color }}
          >
            <Glasses className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Qual tipo de professor você prefere?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Configure a personalidade do seu agente de acompanhamento para que ele fale do jeito que
            você melhor aprende.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-left">
            {['Normal', 'Mais lúdico', 'Mais direto', 'Personalizar professor'].map((type) => (
              <label
                key={type}
                className={`cursor-pointer border p-3 rounded-md flex items-center gap-3 transition-colors ${personalityType === type ? 'border-[#7E22CE] bg-[#F4EBFF] dark:bg-[rgba(126,34,206,0.1)]' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <input
                  type="radio"
                  name="personality"
                  className="w-4 h-4 text-[#7E22CE] focus:ring-[#7E22CE]"
                  checked={personalityType === type}
                  onChange={() => setPersonalityType(type)}
                />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{type}</span>
              </label>
            ))}
          </div>

          {personalityType === 'Personalizar professor' && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Ex: Fale como um pirata, ou como um sargento..."
                className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:border-[#7E22CE]"
                value={customPersonality}
                onChange={(e) => setCustomPersonality(e.target.value)}
              />
            </div>
          )}

          <button
            onClick={handleConfirmPersonality}
            disabled={
              (personalityType === 'Personalizar professor' && !customPersonality.trim()) ||
              isGeneratingFormat
            }
            className="w-full py-2.5 rounded-md font-medium text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: agent.color }}
          >
            {isGeneratingFormat ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Gerando Formato Visual...
              </>
            ) : (
              'Confirmar Estilo'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
          style={{ background: agent.bg }}
        >
          <Glasses className="w-[18px] h-[18px]" style={{ color: agent.color }} />
        </div>
        <div>
          <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{agent.label}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">
            {agent.description} • Estilo: {currentPersonality}
          </p>
        </div>
        <div
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: agent.bg, color: agent.color }}
        >
          ⚡ +{agent.xpReward} XP
        </div>
        <button
          onClick={handleEditPersonality}
          className="ml-2 flex items-center justify-center p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          title="Editar Estilo do Professor"
        >
          <Settings2 className="w-[18px] h-[18px]" />
        </button>
      </div>

      <div
        className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-3 flex flex-col gap-2.5"
        style={{ minHeight: 200 }}
      >
        {isEmpty && (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ background: agent.bg }}
            >
              <Glasses className="w-5 h-5" style={{ color: agent.color }} />
            </div>
            <p className="text-[12px] font-medium text-gray-700 dark:text-gray-300 mb-0.5">
              Pronto para analisar seu desempenho
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              Escolha uma sugestão abaixo ou digite sua dúvida
            </p>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div
              key={i}
              className="ml-auto max-w-[80%] text-[12px] px-3.5 py-2.5 rounded-[12px_12px_4px_12px] whitespace-pre-wrap"
              style={{ background: '#F4EBFF', color: '#581C87' }}
            >
              {msg.text}
            </div>
          ) : (
            <div
              key={i}
              className="max-w-[100%] sm:max-w-[94%] px-3.5 py-2.5 rounded-[12px_12px_12px_4px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 overflow-hidden"
            >
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1">
                <Glasses className="w-3 h-3" /> Acompanhamento · modo ENEM
              </p>
              {msg.text.trim().startsWith('<div') ? (
                <div dangerouslySetInnerHTML={{ __html: msg.text }} />
              ) : (
                <MiniMarkdown text={msg.text} bulletColor={agent.color} />
              )}
            </div>
          ),
        )}

        {loading && (
          <div className="max-w-[94%] px-3.5 py-2.5 rounded-[12px_12px_12px_4px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mb-1.5 flex items-center gap-1">
              <Glasses className="w-3 h-3" /> Acompanhamento · modo ENEM
            </p>
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: agent.color }} />
          </div>
        )}

        {error && <p className="text-[11px] text-red-500 dark:text-red-400 px-1">⚠ {error}</p>}

        <div ref={endRef} />
      </div>

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
          placeholder="Digite sua dúvida sobre o desempenho..."
          disabled={loading}
          className="flex-1 text-[12px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#7E22CE] disabled:opacity-50 resize-none overflow-y-auto"
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
          style={{ background: agent.color }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ACOMPANHAMENTO_CONFIG.suggestedQuestions.map((q) => (
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
