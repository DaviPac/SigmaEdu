'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Loader2,
  Glasses,
  Settings2,
  Trash2,
  Plus,
  MessageSquare,
  Edit2,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  X,
} from 'lucide-react';
import { AGENTS, ACOMPANHAMENTO_CONFIG, ACOMPANHAMENTO_FORMATS } from '@/lib/mock/ava-data';
import type { ChatMessage } from '@/lib/mock/ava-data';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const agent = AGENTS.find((a) => a.id === 'acompanhamento')!;

import MiniMarkdown from '@/components/ava/mini-markdown';

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  personalityType: string;
  customPersonality: string;
  configured: boolean;
  formatTemplate?: string;
  updatedAt: number;
};

export default function AcompanhamentoScreen() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Setup config state (when creating new chat or editing)
  const [setupPersonality, setSetupPersonality] = useState('Normal');
  const [setupCustom, setSetupCustom] = useState('');
  const [isGeneratingFormat, setIsGeneratingFormat] = useState(false);

  // Chat interaction state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Edit title state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Load from local storage
  useEffect(() => {
    const storedConvos = localStorage.getItem('avaAcompanhamento_conversations');
    const storedActiveId = localStorage.getItem('avaAcompanhamento_activeId');

    // Migration from old single-chat format
    const oldMessages = localStorage.getItem('avaAcompanhamento_messages');

    if (storedConvos) {
      try {
        const parsed = JSON.parse(storedConvos);
        setConversations(parsed);
        if (storedActiveId && parsed.find((c: Conversation) => c.id === storedActiveId)) {
          setActiveId(storedActiveId);
        } else if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } catch (_e) {
        console.error(_e);
      }
    } else if (oldMessages) {
      // Migrate old chat
      const type = localStorage.getItem('avaAcompanhamento_type') || 'Normal';
      const custom = localStorage.getItem('avaAcompanhamento_custom') || '';
      const conf = localStorage.getItem('avaAcompanhamento_configured') === 'true';
      const format = localStorage.getItem('avaAcompanhamento_format') || undefined;

      try {
        const parsedMsgs = JSON.parse(oldMessages);
        if (parsedMsgs.length > 0 || conf) {
          const newConvo: Conversation = {
            id: Date.now().toString(),
            title: parsedMsgs[0]?.text?.slice(0, 30) || 'Conversa Anterior',
            messages: parsedMsgs || [],
            personalityType: type,
            customPersonality: custom,
            configured: conf,
            formatTemplate: format,
            updatedAt: Date.now(),
          };
          setConversations([newConvo]);
          setActiveId(newConvo.id);
        }
      } catch (e) {}
    }

    setIsLoaded(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('avaAcompanhamento_conversations', JSON.stringify(conversations));
      if (activeId) {
        localStorage.setItem('avaAcompanhamento_activeId', activeId);
      } else {
        localStorage.removeItem('avaAcompanhamento_activeId');
      }
    }
  }, [conversations, activeId, isLoaded]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  // Auto-scroll when messages update - using block: 'end' just like the working version
  useEffect(() => {
    const timer = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 50);
    return () => clearTimeout(timer);
  }, [activeConversation?.messages, loading, activeId]);

  const handleCreateNew = () => {
    setActiveId(null);
    setSetupPersonality('Normal');
    setSetupCustom('');
  };

  const handleConfirmPersonality = async () => {
    let format = '';
    if (setupPersonality === 'Personalizar professor') {
      setIsGeneratingFormat(true);
      try {
        const res = await fetch(`${BACKEND_URL}/ava/format-generator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personality: setupCustom }),
        });
        const data = await res.json();
        if (data.format) format = data.format;
      } catch (err) {
        console.error('Failed to generate format', err);
      } finally {
        setIsGeneratingFormat(false);
      }
    } else {
      format =
        ACOMPANHAMENTO_FORMATS[setupPersonality as keyof typeof ACOMPANHAMENTO_FORMATS] || '';
    }

    const newChat: Conversation = {
      id: Date.now().toString(),
      title: `Nova Conversa (${setupPersonality})`,
      messages: [],
      personalityType: setupPersonality,
      customPersonality: setupCustom,
      configured: true,
      formatTemplate: format,
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
  };

  const handleEditPersonality = () => {
    if (!activeConversation) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, configured: false, messages: [] } : c)),
    );
    setSetupPersonality(activeConversation.personalityType);
    setSetupCustom(activeConversation.customPersonality);
  };

  const handleDeleteChat = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (window.confirm('Deseja apagar esta conversa?')) {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeId === id) setActiveId(null);
    }
  };

  const handleStartEditTitle = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(title);
  };

  const handleSaveTitle = (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    if (editingId && editTitle.trim()) {
      setConversations((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, title: editTitle.trim() } : c)),
      );
    }
    setEditingId(null);
  };

  const send = async (text?: string) => {
    if (!activeConversation) return;

    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: msg };

    // Update local state immediately
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          return {
            ...c,
            messages: [...c.messages, userMsg],
            title:
              c.messages.length === 0 ? msg.slice(0, 30) + (msg.length > 30 ? '...' : '') : c.title,
            updatedAt: Date.now(),
          };
        }
        return c;
      }),
    );

    setInput('');
    setLoading(true);
    setError(null);

    try {
      const currentPersonality =
        activeConversation.personalityType === 'Personalizar professor'
          ? activeConversation.customPersonality
          : activeConversation.personalityType;

      const res = await fetch(`${BACKEND_URL}/ava/acompanhamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: msg,
          history: activeConversation.messages, // history without the new message
          personality: currentPersonality,
          formatTemplate: activeConversation.formatTemplate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.text) throw new Error(data.error ?? 'Erro ao obter resposta');

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: [...c.messages, { role: 'agent', text: data.text! }],
                updatedAt: Date.now(),
              }
            : c,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de rede');
      // Revert user message on error
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messages: c.messages.slice(0, -1) } : c)),
      );
      setInput(msg);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const isEmpty = activeConversation ? activeConversation.messages.length === 0 && !loading : true;

  if (!isLoaded) return null;

  return (
    <div className="flex">
      {/* Sidebar de Histórico (Sticky) */}
      <div
        className={`flex-shrink-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-lg flex flex-col transition-all duration-300 overflow-hidden sticky top-0 self-start ${isSidebarOpen ? 'w-[260px] max-h-[85vh] border mr-4' : 'w-0 border-none opacity-0 mr-0'}`}
      >
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between min-w-[260px]">
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">Conversas</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCreateNew}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              title="Nova Conversa"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors md:hidden"
              title="Esconder Histórico"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 min-w-[260px]">
          {conversations
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => setActiveId(chat.id)}
                className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer mb-1 transition-colors ${activeId === chat.id ? 'bg-[#F4EBFF] dark:bg-[rgba(126,34,206,0.1)] text-[#7E22CE]' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />

                {editingId === chat.id ? (
                  <div
                    className="flex-1 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(e);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 text-xs px-1.5 py-0.5 border rounded bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 outline-none focus:border-[#7E22CE]"
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="flex-1 text-xs font-medium truncate">{chat.title}</span>
                )}

                {!editingId && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleStartEditTitle(chat.id, chat.title, e)}
                      className="p-1 hover:bg-white dark:hover:bg-gray-700 rounded text-gray-500"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          {conversations.length === 0 && (
            <div className="text-center p-4 text-xs text-gray-500">Nenhuma conversa salva.</div>
          )}
        </div>
      </div>

      {/* Área Principal de Chat */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Botão flutuante para minimizar (Esquerda do chat) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-10 rounded-r-md border border-l-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-gray-500 z-10 shadow-sm"
          title="Alternar Histórico"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        {/* Topo do Chat: Agent Info */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0"
            style={{ background: agent.bg }}
          >
            <Glasses className="w-[18px] h-[18px]" style={{ color: agent.color }} />
          </div>
          <div>
            <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
              {agent.label}
            </p>
            {activeConversation && activeConversation.configured && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">
                {agent.description} • Estilo:{' '}
                {activeConversation.personalityType === 'Personalizar professor'
                  ? activeConversation.customPersonality
                  : activeConversation.personalityType}
              </p>
            )}
            {!activeId && (
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Iniciando nova conversa...
              </p>
            )}
          </div>

          <div
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: agent.bg, color: agent.color }}
          >
            ⚡ +{agent.xpReward} XP
          </div>

          {activeConversation && activeConversation.configured && (
            <>
              <button
                onClick={handleEditPersonality}
                className="ml-2 flex items-center justify-center p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
                title="Editar Estilo do Professor"
              >
                <Settings2 className="w-[18px] h-[18px]" />
              </button>
              <button
                onClick={(e) => handleDeleteChat(activeConversation.id, e)}
                className="ml-1 flex items-center justify-center p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-650 dark:hover:text-red-400 transition-colors text-gray-500 dark:text-gray-400"
                title="Apagar Conversa"
              >
                <Trash2 className="w-[18px] h-[18px]" />
              </button>
            </>
          )}
        </div>

        {/* Corpo do Chat / Configurador */}
        {!activeConversation || !activeConversation.configured ? (
          <div className="max-w-xl w-full mx-auto pt-10">
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
                Configure a personalidade do seu agente de acompanhamento para que ele fale do jeito
                que você melhor aprende.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-left">
                {['Normal', 'Mais lúdico', 'Mais direto', 'Personalizar professor'].map((type) => (
                  <label
                    key={type}
                    className={`cursor-pointer border p-3 rounded-md flex items-center gap-3 transition-colors ${setupPersonality === type ? 'border-[#7E22CE] bg-[#F4EBFF] dark:bg-[rgba(126,34,206,0.1)]' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <input
                      type="radio"
                      name="personality"
                      className="w-4 h-4 text-[#7E22CE] focus:ring-[#7E22CE]"
                      checked={setupPersonality === type}
                      onChange={() => setSetupPersonality(type)}
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {type}
                    </span>
                  </label>
                ))}
              </div>

              {setupPersonality === 'Personalizar professor' && (
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="Ex: Fale como um pirata, ou como um sargento..."
                    className="w-full text-sm px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:border-[#7E22CE]"
                    value={setupCustom}
                    onChange={(e) => setSetupCustom(e.target.value)}
                  />
                </div>
              )}

              <button
                onClick={handleConfirmPersonality}
                disabled={
                  (setupPersonality === 'Personalizar professor' && !setupCustom.trim()) ||
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
        ) : (
          <>
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

              {activeConversation.messages.map((msg, i) =>
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
                    <MiniMarkdown text={msg.text} bulletColor={agent.color} />
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

              {error && (
                <p className="text-[11px] text-red-500 dark:text-red-400 px-1">⚠ {error}</p>
              )}

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
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
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
        )}
      </div>
    </div>
  );
}
