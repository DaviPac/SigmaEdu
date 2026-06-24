import { NextRequest } from 'next/server';
import { callLLM } from '@/lib/ai/llm';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { resolveModel } from '@/lib/server/resolve-model';
import { createLogger } from '@/lib/logger';
import { runValidatorAgent, runFormulatorAgent } from '@/lib/ai/agents/acompanhamento-crew';

const log = createLogger('Ava Acompanhamento');

interface AcompanhamentoMessage {
  role: 'user' | 'agent';
  text: string;
}

interface AcompanhamentoRequest {
  history: AcompanhamentoMessage[];
  userMessage: string;
  personality: string;
  formatTemplate?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  providerType?: string;
}

const getSystemPrompt = (personality: string, formatTemplate?: string, formulatorContext?: string) => {
  let styleGuideline = '- Seja didático e objetivo';
  
  if (personality === 'Mais lúdico') {
    styleGuideline = '- Use uma linguagem divertida, lúdica e encorajadora. Pode usar emojis à vontade.';
  } else if (personality === 'Mais direto') {
    styleGuideline = '- Seja extremamente direto e conciso. Foque apenas nos fatos e na resolução do problema sem rodeios.';
  } else if (personality && personality !== 'Normal') {
    styleGuideline = `- Adote a seguinte personalidade: ${personality}`;
  }

  let templateGuideline = '';
  if (formatTemplate) {
    templateGuideline = `\nREQUISITO CRÍTICO DE FORMATO DE SAÍDA:
Você DEVE OBRIGATORIAMENTE estruturar sua resposta inteira preenchendo o template HTML abaixo. 
Não adicione NENHUM texto ou mensagem amigável fora deste HTML. Tudo que você disser deve estar substituindo os placeholders (ex: [Texto]) dentro deste HTML.
Seu retorno deve ser PURAMENTE o código HTML.

Template HTML:
${formatTemplate}`;
  }

  const pedagogicalContext = formulatorContext 
    ? `\n[INSTRUÇÃO CRÍTICA DO SETOR PEDAGÓGICO]\nSua equipe de tutores (O Formulador) já rascunhou a teoria e a resolução perfeita para essa dúvida. O seu dever é APENAS pegar esse conteúdo técnico e falar com a SUA personalidade (formatando na saída esperada).\nConteúdo técnico a ser repassado:\n"""\n${formulatorContext}\n"""\n\nResuma ou expanda conforme a sua personalidade mandar, mas seja fiel a esse roteiro e use essa exata questão.`
    : '';

  return `Você é o Agente Professor (Acompanhamento) da SigmaEdu — focado em monitorar o progresso do aluno no ENEM.

Diretrizes:
- Analise dúvidas sobre o desempenho e direcione o aluno.
${styleGuideline}
- Responda em português brasileiro.
- Contextualize as orientações pensando no ENEM.
- Respostas concisas: 2 a 5 parágrafos no máximo.
${pedagogicalContext}
${templateGuideline}`;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AcompanhamentoRequest;
    const { history, userMessage, personality, formatTemplate, model, apiKey, baseUrl, providerType } = body;

    if (!userMessage?.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'userMessage é obrigatório');
    }

    const { model: languageModel } = await resolveModel({
      modelString: model,
      apiKey,
      baseUrl,
      providerType,
    });

    log.info(`Acompanhamento [${personality}]: Iniciando Crew para "${userMessage.slice(0, 60)}"`);

    // --- ETAPA 1: O Validador ---
    const validation = await runValidatorAgent(userMessage, languageModel);
    
    let formulatorContext = '';
    
    if (validation.isEnemSubject) {
      log.info(`Assunto do ENEM detectado: ${validation.subjectName} (${validation.difficulty}). Acionando Formulador...`);
      // --- ETAPA 2: O Formulador ---
      formulatorContext = await runFormulatorAgent(userMessage, validation, languageModel);
    } else if (validation.subjectName === null) {
      log.info(`Assunto genérico ou fora do ENEM. Ignorando Formulador.`);
      // Se não for assunto do enem mas não for genérico (ex: mecânica de carros), o professor dará bronca.
      if (validation.reasoning && !validation.reasoning.includes('genéric')) {
         formulatorContext = `[NOTA DO SUPERVISOR]: O aluno está perguntando sobre algo que NÃO CAI no ENEM. Dê uma bronca amigável (na sua personalidade) e lembre-o de focar nos assuntos da prova.`;
      }
    }

    // --- ETAPA 3: O Professor ---
    const systemPrompt = getSystemPrompt(personality || 'Normal', formatTemplate, formulatorContext);

    // Build conversation context
    const historyContext =
      history.length > 0
        ? '\n\n## Histórico da conversa\n' +
          history
            .slice(-8)
            .map((m) => `${m.role === 'user' ? 'Aluno' : 'Agente'}: ${m.text}`)
            .join('\n')
        : '';

    const prompt = `${historyContext}\n\nAluno: ${userMessage}`;

    const result = await callLLM(
      { model: languageModel, system: systemPrompt, prompt },
      'ava-acompanhamento-professor'
    );

    return apiSuccess({ text: result.text });
  } catch (error) {
    log.error('Acompanhamento Crew failed:', error);
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Erro interno',
    );
  }
}
