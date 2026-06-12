import { NextRequest } from 'next/server';
import { callLLM } from '@/lib/ai/llm';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { resolveModel } from '@/lib/server/resolve-model';
import { createLogger } from '@/lib/logger';

const log = createLogger('Ava Tutor');

interface TutorMessage {
  role: 'user' | 'agent';
  text: string;
}

interface TutorRequest {
  history: TutorMessage[];
  userMessage: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  providerType?: string;
}

const SYSTEM_PROMPT = `Você é o Tutor IA da SigmaEdu — especialista em preparação para o ENEM.

Diretrizes:
- Responda em português brasileiro, de forma didática e objetiva
- Contextualize com o ENEM: mostre como a banca aborda o tema, cite padrões de questão
- Use linguagem acessível para um estudante do ensino médio
- Ao mencionar fórmulas, escreva-as de forma clara na linha (ex: x_v = −b/2a)
- Seja encorajador mas preciso — não invente informações
- Respostas concisas: 2 a 5 parágrafos no máximo
- Se a pergunta não for escolar/ENEM, redirecione gentilmente para o estudo`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TutorRequest;
    const { history, userMessage, model, apiKey, baseUrl, providerType } = body;

    if (!userMessage?.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'userMessage é obrigatório');
    }

    const { model: languageModel } = await resolveModel({
      modelString: model,
      apiKey,
      baseUrl,
      providerType,
    });

    // Build conversation context
    const historyContext =
      history.length > 0
        ? '\n\n## Histórico da conversa\n' +
          history
            .slice(-8)
            .map((m) => `${m.role === 'user' ? 'Aluno' : 'Tutor'}: ${m.text}`)
            .join('\n')
        : '';

    const prompt = `${historyContext}\n\nAluno: ${userMessage}`;

    log.info(`Tutor: "${userMessage.slice(0, 60)}"`);

    const result = await callLLM(
      { model: languageModel, system: SYSTEM_PROMPT, prompt },
      'ava-tutor',
    );

    return apiSuccess({ text: result.text });
  } catch (error) {
    log.error('Tutor failed:', error);
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Erro interno',
    );
  }
}
