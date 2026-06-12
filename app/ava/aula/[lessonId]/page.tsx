'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { Stage } from '@/components/stage';
import { ThemeProvider } from '@/lib/hooks/use-theme';
import { MediaStageProvider } from '@/lib/contexts/media-stage-context';
import { useStageStore } from '@/lib/store/stage';
import { useMediaGenerationStore } from '@/lib/store/media-generation';
import { useWhiteboardHistoryStore } from '@/lib/store/whiteboard-history';
import { useSceneGenerator } from '@/lib/hooks/use-scene-generator';
import { useSettingsStore } from '@/lib/store/settings';
import { useAgentRegistry } from '@/lib/orchestration/registry/store';
import { getCurrentModelConfig } from '@/lib/utils/model-config';
import { createLogger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { LESSONS, ENEM_LESSONS, SUBJECTS, type Lesson, type EnemLesson, type Subject } from '@/lib/mock/ava-data';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronRight,
  User,
  Calculator,
  BookOpen,
  FlaskConical,
  History,
  Globe,
  Languages,
  type LucideIcon,
} from 'lucide-react';
import type { Stage as StageType } from '@/lib/types/stage';
import type { SceneOutline } from '@/lib/types/generation';

// ─── Shared topbar ───────────────────────────────────────────────────────────

function SigmaTopbar({
  subjectName,
  screenName,
  right,
}: {
  subjectName: string;
  screenName: string;
  right?: string;
}) {
  return (
    <header className="h-12 bg-white dark:bg-gray-900 flex items-center justify-between px-4 flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        <div
          className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
          style={{ background: '#1D9E75' }}
        >
          S
        </div>
        SigmaEdu
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <span>{subjectName}</span>
        <ChevronRight className="w-3 h-3 text-gray-400 dark:text-gray-600" />
        <span className="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[240px]">{screenName}</span>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <User className="w-4 h-4" />
        {right ?? 'Davi · 6º ano'}
      </div>
    </header>
  );
}

const log = createLogger('AvaLesson');

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'generating' | 'ready' | 'error';
type StepId = 'outlines' | 'content' | 'actions';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'outlines', label: 'Criando roteiro da aula' },
  { id: 'content', label: 'Gerando conteúdo dos slides' },
  { id: 'actions', label: 'Preparando o professor virtual' },
];

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  matematica:  Calculator,
  portugues:   BookOpen,
  ciencias:    FlaskConical,
  historia:    History,
  geografia:   Globe,
  ingles:      Languages,
  'enem-mat':  Calculator,
  'enem-nat':  FlaskConical,
  'enem-red':  BookOpen,
  'enem-hum':  History,
  'enem-ling': Languages,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

type AnyLesson = Pick<Lesson | EnemLesson, 'id' | 'subjectId' | 'title' | 'description' | 'durationMin' | 'topics'>;

function buildRequirement(lesson: AnyLesson, subject: Subject): string {
  if (subject.grade === 'ENEM 2025') {
    return (
      `Crie uma aula interativa de ${subject.name} para estudantes que se preparam para o ENEM ` +
      `sobre o tema: "${lesson.title}". ` +
      `${lesson.description} ` +
      `Os tópicos a serem abordados são: ${lesson.topics.join(', ')}. ` +
      `Contextualize os conceitos com exemplos de questões do ENEM, mostre como a banca aborda cada tópico ` +
      `e inclua pelo menos uma questão comentada no estilo ENEM.`
    );
  }
  return (
    `Crie uma aula interativa de ${subject.name} para alunos do ${subject.grade} ` +
    `sobre o tema: "${lesson.title}". ` +
    `${lesson.description} ` +
    `Os tópicos a serem abordados são: ${lesson.topics.join(', ')}.`
  );
}

function getApiHeaders(): Record<string, string> {
  const modelConfig = getCurrentModelConfig();
  return {
    'Content-Type': 'application/json',
    'x-model': modelConfig.modelString,
    'x-api-key': modelConfig.apiKey,
    'x-base-url': modelConfig.baseUrl,
    'x-provider-type': modelConfig.providerType || '',
    'x-image-provider': '',
    'x-image-model': '',
    'x-image-api-key': '',
    'x-image-base-url': '',
    'x-video-provider': '',
    'x-video-model': '',
    'x-video-api-key': '',
    'x-video-base-url': '',
    'x-image-generation-enabled': 'false',
    'x-video-generation-enabled': 'false',
  };
}

async function streamOutlines(
  requirement: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<{ outlines: SceneOutline[]; languageDirective: string }> {
  return new Promise((resolve, reject) => {
    const collected: SceneOutline[] = [];
    let directive = '';

    fetch('/api/generate/scene-outlines-stream', {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        requirements: { requirement, webSearch: false, interactiveMode: false },
        pdfImages: [],
        imageMapping: {},
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res
            .json()
            .then((d: { error?: string }) =>
              reject(new Error(d.error || 'Falha ao gerar roteiro')),
            );
        }
        const reader = res.body?.getReader();
        if (!reader) return reject(new Error('Stream inválido'));

        const decoder = new TextDecoder();
        let buf = '';

        const pump = (): Promise<void> =>
          reader.read().then(({ done, value }) => {
            if (value) {
              buf += decoder.decode(value, { stream: !done });
              const lines = buf.split('\n');
              buf = lines.pop() || '';
              for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                try {
                  const evt = JSON.parse(line.slice(6)) as {
                    type: string;
                    data?: SceneOutline;
                    outlines?: SceneOutline[];
                    languageDirective?: string;
                    error?: string;
                  };
                  if (evt.type === 'outline' && evt.data) collected.push(evt.data);
                  else if (evt.type === 'languageDirective' && evt.languageDirective)
                    directive = evt.languageDirective;
                  else if (evt.type === 'done') {
                    resolve({
                      outlines: evt.outlines || collected,
                      languageDirective:
                        evt.languageDirective || directive || 'Ensine em português brasileiro.',
                    });
                    return;
                  } else if (evt.type === 'error') {
                    reject(new Error(evt.error || 'Erro no roteiro'));
                    return;
                  }
                } catch {
                  /* ignore malformed SSE lines */
                }
              }
            }
            if (done) {
              if (collected.length > 0) {
                resolve({
                  outlines: collected,
                  languageDirective: directive || 'Ensine em português brasileiro.',
                });
              } else {
                reject(new Error('Nenhum roteiro foi gerado'));
              }
              return;
            }
            return pump();
          });

        pump().catch(reject);
      })
      .catch(reject);
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AvaLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params?.lessonId as string;

  const lesson: AnyLesson | null =
    LESSONS.find((l) => l.id === lessonId) ??
    ENEM_LESSONS.find((l) => l.id === lessonId) ??
    null;
  const subject = lesson ? (SUBJECTS.find((s) => s.id === lesson.subjectId) ?? null) : null;
  const backUrl = subject?.grade === 'ENEM 2025' ? '/ava/aulas' : '/ava';

  const stageIdRef = useRef<string>(nanoid(10));
  // Survives Strict Mode double-invoke: only skip if generation already succeeded.
  const generationDoneRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const [phase, setPhase] = useState<Phase>('generating');
  const [step, setStep] = useState<StepId>('outlines');
  const [error, setError] = useState<string | null>(null);

  const { generateRemaining, retrySingleOutline, stop } = useSceneGenerator({
    onComplete: () => log.info('[AvaLesson] All scenes generated'),
  });

  // Start generation. The effect has no deps so it only runs once per mount
  // cycle. React Strict Mode will abort+remount in dev — when that happens,
  // generationDoneRef is still false so the remount restarts generation
  // cleanly instead of being stuck at the loading screen.
  useEffect(() => {
    if (!lesson || !subject || generationDoneRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;

    useMediaGenerationStore.getState().revokeObjectUrls();
    useMediaGenerationStore.setState({ tasks: {} });
    useWhiteboardHistoryStore.getState().clearHistory();

    runGeneration(lesson, subject, controller.signal)
      .then(() => {
        generationDoneRef.current = true;
      })
      .catch((err: unknown) => {
        // AbortError is expected when Strict Mode unmounts or user navigates away.
        if (err instanceof DOMException && err.name === 'AbortError') return;
        log.error('[AvaLesson] Generation failed:', err);
        setError(err instanceof Error ? err.message : 'Erro ao gerar aula');
        setPhase('error');
      });

    return () => {
      controller.abort();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runGeneration = async (lesson: AnyLesson, subject: Subject, signal: AbortSignal) => {
    const stageId = stageIdRef.current;
    const headers = getApiHeaders();

    // Resolve preset agents
    const settings = useSettingsStore.getState();
    const registry = useAgentRegistry.getState();
    const agentIds = settings.selectedAgentIds.filter((id) => {
      const a = registry.getAgent(id);
      return a && !a.isGenerated;
    });
    const agents = agentIds
      .map((id) => registry.getAgent(id))
      .filter(Boolean)
      .map((a) => ({ id: a!.id, name: a!.name, role: a!.role, persona: a!.persona }));

    const stage: StageType = {
      id: stageId,
      name: lesson.title,
      description: lesson.description,
      style: 'professional',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      agentIds,
      interactiveMode: false,
    };
    const stageInfo = { name: stage.name, description: stage.description, style: stage.style };

    // ── Step 1: outlines ──────────────────────────────────────────────────
    setStep('outlines');
    const { outlines, languageDirective } = await streamOutlines(
      buildRequirement(lesson, subject),
      headers,
      signal,
    );
    stage.languageDirective = languageDirective;

    const store = useStageStore.getState();
    store.setStage(stage);
    store.setOutlines(outlines);
    store.setGeneratingOutlines(outlines);

    // ── Step 2: first scene content ───────────────────────────────────────
    setStep('content');
    const contentResp = await fetch('/api/generate/scene-content', {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        outline: outlines[0],
        allOutlines: outlines,
        pdfImages: [],
        imageMapping: {},
        stageInfo,
        stageId,
        agents,
        languageDirective,
      }),
    });
    if (!contentResp.ok) {
      const d = await contentResp.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error((d as { error?: string }).error || 'Falha ao gerar conteúdo');
    }
    const contentData = (await contentResp.json()) as {
      success: boolean;
      content: unknown;
      effectiveOutline?: SceneOutline;
      error?: string;
    };
    if (!contentData.success) throw new Error(contentData.error || 'Falha ao gerar conteúdo');

    // ── Step 3: first scene actions ───────────────────────────────────────
    setStep('actions');
    const actionsResp = await fetch('/api/generate/scene-actions', {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        outline: contentData.effectiveOutline || outlines[0],
        allOutlines: outlines,
        content: contentData.content,
        stageId,
        agents,
        previousSpeeches: [],
        languageDirective,
      }),
    });
    if (!actionsResp.ok) {
      const d = await actionsResp.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error((d as { error?: string }).error || 'Falha ao gerar ações');
    }
    const actionsData = (await actionsResp.json()) as {
      success: boolean;
      scene?: { id: string; order: number };
      error?: string;
    };
    if (!actionsData.success || !actionsData.scene) {
      throw new Error(actionsData.error || 'Falha ao gerar ações');
    }

    // Commit first scene to store
    store.addScene(actionsData.scene as Parameters<typeof store.addScene>[0]);
    store.setCurrentSceneId(actionsData.scene.id);
    store.setGeneratingOutlines(outlines.filter((o) => o.order !== actionsData.scene!.order));

    await store.saveToStorage();

    // Switch to classroom view
    setPhase('ready');

    // Continue remaining scenes in background
    generateRemaining({
      pdfImages: [],
      imageMapping: {},
      stageInfo,
      agents,
      languageDirective,
    });
  };

  const handleRetry = () => {
    if (!lesson || !subject) return;
    abortRef.current?.abort();

    generationDoneRef.current = false;
    stageIdRef.current = nanoid(10);
    setPhase('generating');
    setStep('outlines');
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    useMediaGenerationStore.getState().revokeObjectUrls();
    useMediaGenerationStore.setState({ tasks: {} });
    useWhiteboardHistoryStore.getState().clearHistory();

    runGeneration(lesson, subject, controller.signal)
      .then(() => {
        generationDoneRef.current = true;
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Erro ao gerar aula');
        setPhase('error');
      });
  };

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!lesson || !subject) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-[#f5f5f5] dark:bg-gray-900">
        <SigmaTopbar subjectName="—" screenName="Aula não encontrada" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ maxWidth: 320 }}>
            <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-[15px] font-medium text-gray-700 dark:text-gray-200 mb-1">Aula não encontrada</p>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mb-5">O ID da aula não corresponde a nenhum conteúdo disponível.</p>
            <button
              onClick={() => router.push(backUrl)}
              className="inline-flex items-center gap-1.5 text-sm text-white px-4 py-2 rounded-md font-medium hover:opacity-90 transition-opacity"
              style={{ background: '#1D9E75' }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar às aulas
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Classroom view ────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <ThemeProvider>
        <MediaStageProvider value={stageIdRef.current}>
          <div className="h-screen flex flex-col overflow-hidden">
            <Stage
              onRetryOutline={retrySingleOutline}
              backUrl={backUrl}
              sigmaMode
              sigmaSubject={subject.name}
            />
          </div>
        </MediaStageProvider>
      </ThemeProvider>
    );
  }

  // ── Loading / error screen ────────────────────────────────────────────────
  const SubjectIcon = SUBJECT_ICONS[lesson.subjectId] ?? BookOpen;
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f5f5f5] dark:bg-gray-900">
      {/* Topbar */}
      <SigmaTopbar
        subjectName={subject.name}
        screenName={lesson.title}
        right={`${subject.teacher} · ${subject.grade}`}
      />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        {phase === 'error' ? (
          /* ── Error ─────────────────────────────────────────────────── */
          <div style={{ maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#FCEBEB' }}
            >
              <AlertCircle className="w-7 h-7" style={{ color: '#A32D2D' }} />
            </div>
            <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-1">Erro ao preparar a aula</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => router.push(backUrl)}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              >
                Voltar às aulas
              </button>
              <button
                onClick={handleRetry}
                className="px-4 py-2 text-sm text-white rounded-md font-medium hover:opacity-90 transition-opacity"
                style={{ background: '#1D9E75' }}
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : (
          /* ── Loading ────────────────────────────────────────────────── */
          <div style={{ maxWidth: 320, width: '100%' }}>
            {/* Subject icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: '#E1F5EE' }}
              >
                <SubjectIcon className="w-8 h-8" style={{ color: '#0F6E56' }} />
              </div>
            </div>

            {/* Lesson meta */}
            <div className="text-center mb-6">
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase mb-1" style={{ letterSpacing: '.08em' }}>
                {subject.name} · {subject.grade}
              </p>
              <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-0.5">{lesson.title}</p>
              <p className="text-[12px] text-gray-400 dark:text-gray-500">{subject.teacher}</p>
            </div>

            {/* Steps */}
            <div className="rounded-lg overflow-hidden bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              {STEPS.map((s, idx) => {
                const isDone    = idx < stepIdx;
                const isCurrent = idx === stepIdx;
                return (
                  <div
                    key={s.id}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3',
                      idx < STEPS.length - 1 && 'border-b border-gray-50 dark:border-gray-700',
                      isCurrent && 'bg-[#f9fffe] dark:bg-emerald-950/20',
                    )}
                  >
                    <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" style={{ color: '#1D9E75' }} />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#1D9E75' }} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                    </div>
                    <span
                      className="text-[13px]"
                      style={{
                        color: isDone ? '#9ca3af' : isCurrent ? '#111827' : '#d1d5db',
                        fontWeight: isCurrent ? 500 : 400,
                        textDecoration: isDone ? 'line-through' : undefined,
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
