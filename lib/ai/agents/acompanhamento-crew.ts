import fs from 'fs';
import path from 'path';
import { callLLM } from '@/lib/ai/llm';

export const getEnemTaxonomy = () => {
  const filePath = path.join(process.cwd(), 'ENEMs', 'enem_banco_questoes.json');
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return '{}';
};

const extractJson = (text: string) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse Validator JSON:', text);
    return { isEnemSubject: false, subjectName: null, difficulty: null, reasoning: 'Failed to parse' };
  }
};

/**
 * AGENTE 1: Validador
 * Analisa se a requisição do aluno aborda assuntos contidos na taxonomia do ENEM.
 */
export const runValidatorAgent = async (userMessage: string, languageModel: any) => {
  const taxonomy = getEnemTaxonomy();
  const systemPrompt = `Você é o Agente Validador de Currículo do ENEM.
Sua missão exclusiva é ler a mensagem do aluno e verificar se o que ele pede está dentro dos assuntos do ENEM.

Banco de Assuntos (Taxonomia JSON):
${taxonomy}

INSTRUÇÃO CRÍTICA: Responda ESTRITAMENTE em formato JSON puro, sem nenhum texto extra. Use este schema exato:
{
  "isEnemSubject": boolean,
  "subjectName": string | null,
  "difficulty": "Fácil" | "Médio" | "Difícil" | null,
  "reasoning": string
}

Regras:
1. Se a mensagem for sobre um assunto escolar que consta na taxonomia, retorne isEnemSubject = true.
2. Identifique o "subjectName" e a "difficulty" usando OS MESMOS DADOS presentes na taxonomia.
3. Se a mensagem for genérica (ex: "oi", "tudo bem"), ou se for sobre assuntos totalmente fora do escopo do ENEM (ex: conserto de motor, programação C++), retorne isEnemSubject = false.
4. "reasoning" é para explicar sua decisão (apenas uso interno, o aluno não verá).`;

  const result = await callLLM(
    { model: languageModel, system: systemPrompt, prompt: `Mensagem do aluno: "${userMessage}"` },
    'ava-validator'
  );
  
  return extractJson(result.text);
};

/**
 * AGENTE 2: Formulador
 * Baseado na validação, se for assunto do ENEM, ele formula uma questão e rascunha a explicação didática.
 */
export const runFormulatorAgent = async (userMessage: string, validationData: any, languageModel: any) => {
  const systemPrompt = `Você é o Agente Formulador Pedagógico e conteudista de um cursinho para o ENEM.
O Agente Validador determinou que o aluno deseja aprender ou tirou dúvida sobre o seguinte assunto do ENEM:
- Assunto: ${validationData.subjectName}
- Nível de Dificuldade Estimado no ENEM: ${validationData.difficulty}

Sua missão:
Crie um roteiro bruto e super detalhado contendo a explicação da matéria para que o Professor repasse ao aluno.
COMO INSTRUÍDO, já que o aluno "não sabe o que é", você DEVE:
1. Escrever um resumo claro e direto da teoria.
2. Elaborar uma "Questão Exemplo" fictícia, no estilo do ENEM, que seja do nível da dificuldade especificada (${validationData.difficulty}).
3. Fornecer a resolução detalhada, passo a passo, dessa questão.

Não se preocupe com o "tom" (brincalhão, direto, etc). Apenas gere a massa de dados didática. Formate em Markdown.`;

  const result = await callLLM(
    { model: languageModel, system: systemPrompt, prompt: `Dúvida original do aluno: "${userMessage}"` },
    'ava-formulator'
  );
  
  return result.text;
};
