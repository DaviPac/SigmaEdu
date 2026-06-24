import { NextRequest } from 'next/server';
import { callLLM } from '@/lib/ai/llm';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { resolveModel } from '@/lib/server/resolve-model';
import { createLogger } from '@/lib/logger';

const log = createLogger('Ava Format Generator');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personality, model, apiKey, baseUrl, providerType } = body;

    if (!personality?.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'personality é obrigatório');
    }

    const { model: languageModel } = await resolveModel({
      modelString: model,
      apiKey,
      baseUrl,
      providerType,
    });

    const systemPrompt = `Você é um Web Designer e Estrategista Didático trabalhando para um chatbot educacional.
Seu objetivo é criar ESTRITAMENTE o código HTML de um template visual que combine perfeitamente com a personalidade: "${personality}".
As respostas do agente devem ser preenchidas dentro deste HTML gerado futuramente.

Diretrizes HTML:
- Retorne APENAS o HTML, sem blocos de \`\`\`html ou explicações. O output tem que ser puramente a string HTML.
- Use UMA <div> contêiner principal para envelopar tudo.
- Use classes Tailwind para estilização (backgrounds suaves como bg-blue-50/bg-red-50, borders, padding p-4, rounded-lg, text-sm, space-y-3, dark:bg-gray-800, etc).
- O template DEVE ter entre 3 a 4 divisões temáticas. Pense como essa personalidade dividiria a resposta (Ex: um pirata teria "O Mapa", "A Bússola", "O Saque").
- Em cada divisão, use títulos (<h3>) estilizados e coloque placeholders de conteúdo em colchetes como "[Sua resposta aqui]".
- Adicione emojis condizentes no título de cada seção.
- Não use <html>, <body> ou <script>. Apenas as divs estruturais do template.`;

    const prompt = `Gere o template de resposta HTML (Tailwind) para a personalidade: ${personality}`;

    const result = await callLLM(
      { model: languageModel, system: systemPrompt, prompt },
      'ava-format-generator',
    );

    let html = result.text.trim();
    if (html.startsWith('```html')) html = html.slice(7);
    if (html.startsWith('```')) html = html.slice(3);
    if (html.endsWith('```')) html = html.slice(0, -3);

    return apiSuccess({ format: html.trim() });
  } catch (error) {
    log.error('Format Generator failed:', error);
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Erro interno',
    );
  }
}
