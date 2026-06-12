// ─── Student ─────────────────────────────────────────────────────────────────

export type MockStudent = {
  name: string;
  initials: string;
  xp: number;
  level: number;
  streak: number;
  daysToEnem: number;
  rankPosition: number;
};

export const MOCK_STUDENT: MockStudent = {
  name: 'Davi',
  initials: 'DA',
  xp: 1240,
  level: 8,
  streak: 7,
  daysToEnem: 187,
  rankPosition: 12,
};

// ─── Agents ───────────────────────────────────────────────────────────────────

export type AgentId = 'diagnostico' | 'avaliador' | 'pedagogico' | 'tutor';

export type AgentData = {
  id: AgentId;
  label: string;
  subtitle: string;
  description: string;
  bg: string;
  color: string;
  xpReward: number;
};

export const AGENTS: AgentData[] = [
  { id: 'diagnostico', label: 'Agente Diagnóstico', subtitle: 'Mapeia lacunas', description: 'Mapeando suas lacunas em relação ao ENEM', bg: '#E6F1FB', color: '#185FA5', xpReward: 50 },
  { id: 'avaliador',   label: 'Agente Avaliador',   subtitle: 'Corrige atividades', description: 'Simulado — ciências da natureza · resultado', bg: '#EAF3DE', color: '#3B6D11', xpReward: 120 },
  { id: 'pedagogico',  label: 'Agente Pedagógico',  subtitle: 'Cria sua trilha',    description: 'Trilha personalizada para o ENEM 2025 — Davi', bg: '#EEEDFE', color: '#534AB7', xpReward: 0 },
  { id: 'tutor',       label: 'Agente Tutor',        subtitle: 'Tira dúvidas',       description: 'Modo ENEM — simula a linguagem da banca', bg: '#FAEEDA', color: '#854F0B', xpReward: 20 },
];

// ─── Diagnóstico config ───────────────────────────────────────────────────────

export type LearningStyleIconName = 'Eye' | 'Headphones' | 'Hand' | 'Smile';

export type LearningStyleOption = { label: string; iconName: LearningStyleIconName };

export type DiagnosticoConfig = {
  learningStyles: LearningStyleOption[];
  confidenceLevels: string[];
  weakAreas: string[];
  studyHours: string[];
};

export const DIAGNOSTICO_CONFIG: DiagnosticoConfig = {
  learningStyles: [
    { label: 'Visual',    iconName: 'Eye' },
    { label: 'Auditivo',  iconName: 'Headphones' },
    { label: 'Prático',   iconName: 'Hand' },
  ],
  confidenceLevels: ['Muito baixo', 'Baixo', 'Médio', 'Alto'],
  weakAreas: ['Matemática', 'Ciências da natureza', 'Redação', 'Ciências humanas', 'Linguagens'],
  studyHours: ['Menos de 5h', '5h a 10h', '10h a 20h', 'Mais de 20h'],
};

// ─── ENEM Proficiency / Gaps ──────────────────────────────────────────────────

export type ProficiencyItem = { name: string; percent: number; color: string };

export type EnemArea = { area: string; items: ProficiencyItem[] };

export const ENEM_PROFICIENCY: EnemArea[] = [
  {
    area: 'Ciências humanas',
    items: [
      { name: 'História',   percent: 81, color: '#1D9E75' },
      { name: 'Geografia',  percent: 76, color: '#1D9E75' },
      { name: 'Filosofia',  percent: 52, color: '#EF9F27' },
      { name: 'Sociologia', percent: 60, color: '#EF9F27' },
    ],
  },
  {
    area: 'Ciências da natureza',
    items: [
      { name: 'Biologia', percent: 58, color: '#EF9F27' },
      { name: 'Química',  percent: 39, color: '#E24B4A' },
      { name: 'Física',   percent: 33, color: '#E24B4A' },
    ],
  },
  {
    area: 'Matemática',
    items: [
      { name: 'Geometria',  percent: 65, color: '#1D9E75' },
      { name: 'Funções',    percent: 31, color: '#E24B4A' },
      { name: 'Estatística',percent: 50, color: '#EF9F27' },
    ],
  },
  {
    area: 'Redação — 5 competências',
    items: [
      { name: 'C1 — norma culta',             percent: 80, color: '#1D9E75' },
      { name: 'C2 — compreensão do tema',      percent: 72, color: '#1D9E75' },
      { name: 'C3 — argumentação',             percent: 48, color: '#E24B4A' },
      { name: 'C4 — coesão',                   percent: 55, color: '#EF9F27' },
      { name: 'C5 — proposta de intervenção',  percent: 68, color: '#1D9E75' },
    ],
  },
];

export type GapItem = { name: string; percent: number; color: string; textColor: string };

export const PRIORITY_GAPS: GapItem[] = [
  { name: 'Matemática — funções',        percent: 31, color: '#E24B4A', textColor: '#A32D2D' },
  { name: 'Ciências da natureza',        percent: 55, color: '#EF9F27', textColor: '#BA7517' },
  { name: 'Redação — competência 3',     percent: 48, color: '#EF9F27', textColor: '#BA7517' },
  { name: 'Linguagens',                  percent: 74, color: '#1D9E75', textColor: '#1D9E75' },
];

// ─── Avaliador / Evaluation ───────────────────────────────────────────────────

export type TagVariant = 'teal' | 'blue' | 'amber' | 'red' | 'purple' | 'green';

export type TopicScore = { name: string; percent: number; color: string };

export type EvaluationResult = {
  hits: number;
  misses: number;
  triScore: number;
  topics: TopicScore[];
  gaps: string[];
};

export const MOCK_EVALUATION: EvaluationResult = {
  hits: 18,
  misses: 7,
  triScore: 720,
  topics: [
    { name: 'Biologia — evolução',   percent: 78, color: '#1D9E75' },
    { name: 'Química — orgânica',    percent: 55, color: '#EF9F27' },
    { name: 'Física — eletricidade', percent: 28, color: '#E24B4A' },
  ],
  gaps: [
    'Circuitos elétricos — lei de Ohm',
    'Reações de oxidação-redução',
    'Genética — herança ligada ao sexo',
  ],
};

// ─── Pedagógico ───────────────────────────────────────────────────────────────

export type TrailStep = {
  text: string;
  day: string;
  tag: TagVariant;
  tagLabel: string;
  xp: number;
};

export type AreaProgress = { name: string; percent: number; color: string };

export type PedagogicoData = {
  trailSteps: TrailStep[];
  areaProgress: AreaProgress[];
  projectedScore: number;
  targetScore: number;
};

export const MOCK_PEDAGOGICO: PedagogicoData = {
  trailSteps: [
    { text: 'Aula: funções do 2º grau',       day: 'Seg', tag: 'red',   tagLabel: 'Urgente',    xp: 80  },
    { text: 'Exercícios: lei de Ohm',          day: 'Ter', tag: 'amber', tagLabel: 'Importante', xp: 60  },
    { text: 'Redação: praticar C3',            day: 'Qua', tag: 'amber', tagLabel: 'Importante', xp: 100 },
    { text: 'Simulado semanal completo',       day: 'Sex', tag: 'teal',  tagLabel: 'Semanal',    xp: 120 },
  ],
  areaProgress: [
    { name: 'Ciências humanas',      percent: 72, color: '#1D9E75' },
    { name: 'Linguagens',            percent: 74, color: '#1D9E75' },
    { name: 'Redação',               percent: 54, color: '#EF9F27' },
    { name: 'Matemática',            percent: 48, color: '#EF9F27' },
    { name: 'Ciências da natureza',  percent: 40, color: '#E24B4A' },
  ],
  projectedScore: 680,
  targetScore: 750,
};

// ─── Tutor ────────────────────────────────────────────────────────────────────

export type ChatMessage = { role: 'user' | 'agent'; text: string; formulaBox?: string };

export type TutorConfig = {
  initialMessages: ChatMessage[];
  suggestedQuestions: string[];
};

export const TUTOR_CONFIG: TutorConfig = {
  initialMessages: [],
  suggestedQuestions: [
    'Como o ENEM cobra funções do 2º grau?',
    'Explica a proposta de intervenção (C5)',
    'Diferença entre Marx, Weber e Durkheim',
    'Como resolver questões de genética?',
  ],
};

// ─── Activity / Simulado ──────────────────────────────────────────────────────

export type QuestionOption = { key: string; value: string };

export type ActivityQuestion = {
  id: string;
  area: string;
  text: string;
  options: QuestionOption[];
  correctKey: string;
  xpReward: number;
  hint: string;
};

export type ActivitySet = {
  id: string;
  title: string;
  area: string;
  icon: string;
  description: string;
  questions: ActivityQuestion[];
  isSimulado?: boolean;
};

// ── Funções do 2º Grau ───────────────────────────────────────────────────────
const SET_FUNCOES: ActivityQuestion[] = [
  {
    id: 'fn-01', area: 'Matemática — funções',
    text: 'Uma peça é lançada verticalmente com altura h(t) = −5t² + 30t (t em segundos, h em metros). Qual é a altura máxima atingida pela peça?',
    options: [{ key:'a',value:'30 m'},{key:'b',value:'40 m'},{key:'c',value:'45 m'},{key:'d',value:'50 m'},{key:'e',value:'60 m'}],
    correctKey:'c', xpReward:20,
    hint:'Calcule o tempo do vértice com t_v = −b/2a, depois substitua em h(t). Aqui a = −5, b = 30.',
  },
  {
    id: 'fn-02', area: 'Matemática — funções',
    text: 'A função f(x) = x² − 6x + 8 tem suas raízes nos pontos:',
    options: [{key:'a',value:'x = 1 e x = 8'},{key:'b',value:'x = 2 e x = 4'},{key:'c',value:'x = −2 e x = −4'},{key:'d',value:'x = 1 e x = 7'},{key:'e',value:'x = 3 (raiz dupla)'}],
    correctKey:'b', xpReward:20,
    hint:'Tente fatorar: encontre dois números que multiplicam 8 e somam 6. Se não conseguir, use Bhaskara.',
  },
  {
    id: 'fn-03', area: 'Matemática — funções',
    text: 'Uma indústria tem custo C(x) = 2x² − 12x + 20 (x em centenas de unidades). Para minimizar o custo, quantas centenas de unidades devem ser produzidas?',
    options: [{key:'a',value:'2'},{key:'b',value:'3'},{key:'c',value:'4'},{key:'d',value:'5'},{key:'e',value:'6'}],
    correctKey:'b', xpReward:20,
    hint:'O mínimo de uma parábola com a > 0 ocorre no vértice. Use x_v = −b/2a com a = 2, b = −12.',
  },
  {
    id: 'fn-04', area: 'Matemática — funções',
    text: 'O discriminante Δ = b² − 4ac determina o número de raízes reais. Qual afirmação é correta?',
    options: [
      {key:'a',value:'Δ > 0 → sem raízes reais'},
      {key:'b',value:'Δ = 0 → duas raízes distintas'},
      {key:'c',value:'Δ < 0 → duas raízes reais distintas'},
      {key:'d',value:'Δ > 0 → duas raízes reais distintas'},
      {key:'e',value:'Δ = 0 → sem raízes reais'},
    ],
    correctKey:'d', xpReward:15,
    hint:'Lembre: Δ > 0 = duas raízes, Δ = 0 = uma raiz dupla, Δ < 0 = sem raízes reais.',
  },
  {
    id: 'fn-05', area: 'Matemática — funções',
    text: 'O gráfico de f(x) = −2x² + 4x + 6 intercepta o eixo x em dois pontos. Qual é a soma dessas raízes?',
    options: [{key:'a',value:'−2'},{key:'b',value:'−1'},{key:'c',value:'1'},{key:'d',value:'2'},{key:'e',value:'3'}],
    correctKey:'d', xpReward:25,
    hint:'Pela relação de Girard, a soma das raízes de ax² + bx + c é igual a −b/a. Identifique a e b.',
  },
];

// ── Eletricidade e Circuitos ─────────────────────────────────────────────────
const SET_ELETRICIDADE: ActivityQuestion[] = [
  {
    id: 'el-01', area: 'Física — eletricidade',
    text: 'Uma lâmpada de 100 W é ligada a uma tensão de 220 V. Usando P = V·I, qual é a corrente elétrica que passa pela lâmpada?',
    options: [{key:'a',value:'0,22 A'},{key:'b',value:'0,35 A'},{key:'c',value:'0,45 A'},{key:'d',value:'2,2 A'},{key:'e',value:'22 A'}],
    correctKey:'c', xpReward:20,
    hint:'Isole I na fórmula P = V·I → I = P/V. Divida 100 por 220.',
  },
  {
    id: 'el-02', area: 'Física — eletricidade',
    text: 'Uma resistência de 10 Ω é percorrida por uma corrente de 2 A. Qual é a potência dissipada?',
    options: [{key:'a',value:'5 W'},{key:'b',value:'20 W'},{key:'c',value:'40 W'},{key:'d',value:'100 W'},{key:'e',value:'200 W'}],
    correctKey:'c', xpReward:20,
    hint:'Use P = R·I². Calcule I² primeiro, depois multiplique por R.',
  },
  {
    id: 'el-03', area: 'Física — eletricidade',
    text: 'Em um circuito em série com resistores de 4 Ω, 6 Ω e 2 Ω, a resistência equivalente é:',
    options: [{key:'a',value:'2 Ω'},{key:'b',value:'6 Ω'},{key:'c',value:'12 Ω'},{key:'d',value:'24 Ω'},{key:'e',value:'48 Ω'}],
    correctKey:'c', xpReward:15,
    hint:'Em série, as resistências se somam: R_eq = R₁ + R₂ + R₃.',
  },
  {
    id: 'el-04', area: 'Física — eletricidade',
    text: 'Dois resistores de 6 Ω cada estão ligados em paralelo. Qual é a resistência equivalente?',
    options: [{key:'a',value:'1 Ω'},{key:'b',value:'2 Ω'},{key:'c',value:'3 Ω'},{key:'d',value:'6 Ω'},{key:'e',value:'12 Ω'}],
    correctKey:'c', xpReward:20,
    hint:'Em paralelo: 1/R_eq = 1/R₁ + 1/R₂. Dois resistores iguais em paralelo resultam em metade do valor.',
  },
  {
    id: 'el-05', area: 'Física — eletricidade',
    text: 'Um aparelho de 1.200 W fica ligado por 5 horas. Qual é o consumo em quilowatt-hora (kWh)?',
    options: [{key:'a',value:'0,6 kWh'},{key:'b',value:'1,2 kWh'},{key:'c',value:'6 kWh'},{key:'d',value:'12 kWh'},{key:'e',value:'60 kWh'}],
    correctKey:'c', xpReward:15,
    hint:'Converta W para kW (divida por 1000) e multiplique pelo tempo em horas: E = P(kW) × t(h).',
  },
];

// ── Genética e Herança ───────────────────────────────────────────────────────
const SET_GENETICA: ActivityQuestion[] = [
  {
    id: 'gen-01', area: 'Biologia — genética',
    text: 'No cruzamento de dois indivíduos heterozigotos (Aa × Aa), a proporção fenotípica esperada na prole é:',
    options: [{key:'a',value:'1:1'},{key:'b',value:'2:1'},{key:'c',value:'3:1'},{key:'d',value:'1:2:1'},{key:'e',value:'todos dominantes'}],
    correctKey:'c', xpReward:20,
    hint:'Monte o quadrado de Punnett (2×2) e conte quantos apresentam o fenótipo dominante vs. recessivo.',
  },
  {
    id: 'gen-02', area: 'Biologia — genética',
    text: 'O daltonismo é recessivo e ligado ao X. Uma mulher portadora (X^D X^d) tem filhos com um homem normal (X^D Y). Qual é a probabilidade de um filho homem ser daltônico?',
    options: [{key:'a',value:'0%'},{key:'b',value:'25%'},{key:'c',value:'50%'},{key:'d',value:'75%'},{key:'e',value:'100%'}],
    correctKey:'c', xpReward:25,
    hint:'Monte o Punnett para os filhos homens (XY). Dos gametas maternos X^D e X^d, qual combina com Y para gerar daltônico?',
  },
  {
    id: 'gen-03', area: 'Biologia — genética',
    text: 'Um homem tipo A (I^A i) e uma mulher tipo B (I^B i) têm filhos. Qual a probabilidade de um filho ser do tipo O?',
    options: [{key:'a',value:'0%'},{key:'b',value:'25%'},{key:'c',value:'50%'},{key:'d',value:'75%'},{key:'e',value:'100%'}],
    correctKey:'b', xpReward:25,
    hint:'Faça o Punnett com gametas I^A, i (pai) × I^B, i (mãe). Tipo O = genótipo ii.',
  },
  {
    id: 'gen-04', area: 'Biologia — genética',
    text: 'Uma mulher portadora de hemofilia (X^H X^h) tem filhos com um homem normal (X^H Y). Qual a probabilidade de um filho (qualquer sexo) ser hemofílico?',
    options: [{key:'a',value:'0%'},{key:'b',value:'25%'},{key:'c',value:'50%'},{key:'d',value:'75%'},{key:'e',value:'100%'}],
    correctKey:'b', xpReward:25,
    hint:'Monte o Punnett completo (4 filhos possíveis). A hemofilia manifesta-se apenas em X^h Y. Quantos têm esse genótipo?',
  },
  {
    id: 'gen-05', area: 'Biologia — genética',
    text: 'No diibrismo (AaBb × AaBb), considerando genes em cromossomos diferentes, quantos genótipos distintos são possíveis na prole?',
    options: [{key:'a',value:'4'},{key:'b',value:'6'},{key:'c',value:'7'},{key:'d',value:'9'},{key:'e',value:'16'}],
    correctKey:'d', xpReward:30,
    hint:'Calcule separadamente para cada par: Aa × Aa gera 3 genótipos; Bb × Bb também. Multiplique os resultados.',
  },
];

// ── Redação: Argumentação e Estrutura ────────────────────────────────────────
const SET_REDACAO: ActivityQuestion[] = [
  {
    id: 'red-01', area: 'Redação — competência 5',
    text: 'Para obter nota máxima na competência 5, a proposta de intervenção deve conter obrigatoriamente quantos elementos?',
    options: [{key:'a',value:'2'},{key:'b',value:'3'},{key:'c',value:'4'},{key:'d',value:'5'},{key:'e',value:'6'}],
    correctKey:'d', xpReward:15,
    hint:'Os elementos são: agente, ação, modo/meio, finalidade e detalhamento. Conte-os.',
  },
  {
    id: 'red-02', area: 'Redação — competência 5',
    text: '"O governo deve resolver o problema." Essa proposta recebe nota baixa na C5 porque:',
    options: [
      {key:'a',value:'Usa tempo verbal inadequado'},
      {key:'b',value:'O governo não pode ser agente em redações'},
      {key:'c',value:'É vaga — não especifica ação, modo e detalhamento'},
      {key:'d',value:'Está na terceira pessoa'},
      {key:'e',value:'É muito curta (menos de 10 palavras)'},
    ],
    correctKey:'c', xpReward:20,
    hint:'Identifique quais dos 5 elementos obrigatórios estão ausentes nessa frase.',
  },
  {
    id: 'red-03', area: 'Redação — competência 3',
    text: 'Qual estratégia argumentativa usa dados de especialistas, leis ou instituições reconhecidas para sustentar a tese?',
    options: [
      {key:'a',value:'Argumento de exemplificação'},
      {key:'b',value:'Argumento de causa e efeito'},
      {key:'c',value:'Argumento de autoridade'},
      {key:'d',value:'Argumento por analogia'},
      {key:'e',value:'Argumento de concessão'},
    ],
    correctKey:'c', xpReward:15,
    hint:'Qual tipo de argumento ganha credibilidade por ser atribuído a uma fonte externa confiável?',
  },
  {
    id: 'red-04', area: 'Redação — competência 4',
    text: 'Qual das alternativas apresenta uso INCORRETO de conectivo de acordo com o sentido da frase?',
    options: [
      {key:'a',value:'"Além disso, é necessário que..."'},
      {key:'b',value:'"Portanto, conclui-se que..."'},
      {key:'c',value:'"Porém, o problema se agrava..."'},
      {key:'d',value:'"Visto que, a situação precisa de atenção" (com vírgula após "visto que")'},
      {key:'e',value:'"No entanto, há alternativas..."'},
    ],
    correctKey:'d', xpReward:20,
    hint:'"Visto que" é conjunção subordinativa causal — não admite vírgula imediatamente após ela. Verifique a pontuação.',
  },
  {
    id: 'red-05', area: 'Redação — estrutura',
    text: 'Numa dissertação-argumentativa do ENEM, qual é a função principal do primeiro parágrafo (introdução)?',
    options: [
      {key:'a',value:'Apresentar todos os argumentos do texto'},
      {key:'b',value:'Contextualizar o tema e apresentar a tese do candidato'},
      {key:'c',value:'Propor a intervenção e seus detalhamentos'},
      {key:'d',value:'Resumir as ideias do desenvolvimento'},
      {key:'e',value:'Citar a legislação relacionada ao tema'},
    ],
    correctKey:'b', xpReward:15,
    hint:'A introdução da dissertação tem duas funções essenciais: situar o leitor no tema e deixar clara a posição do autor.',
  },
];

// ── Sociologia e Ciências Humanas ────────────────────────────────────────────
const SET_SOCIOLOGIA: ActivityQuestion[] = [
  {
    id: 'soc-01', area: 'Ciências Humanas — sociologia',
    text: 'Karl Marx identificou que os trabalhadores recebem menos do que o valor que produzem. Esse conceito central em sua teoria econômica é chamado de:',
    options: [{key:'a',value:'Anomia'},{key:'b',value:'Alienação'},{key:'c',value:'Mais-valia'},{key:'d',value:'Solidariedade mecânica'},{key:'e',value:'Fato social'}],
    correctKey:'c', xpReward:20,
    hint:'Qual conceito marxista explica a diferença entre o valor total produzido pelo trabalhador e o salário que ele recebe?',
  },
  {
    id: 'soc-02', area: 'Ciências Humanas — sociologia',
    text: 'Durkheim distinguiu dois tipos de coesão social. Em sociedades industriais modernas com alta divisão do trabalho, prevalece a:',
    options: [
      {key:'a',value:'Solidariedade mecânica'},
      {key:'b',value:'Anomia positiva'},
      {key:'c',value:'Consciência coletiva total'},
      {key:'d',value:'Solidariedade orgânica'},
      {key:'e',value:'Ação social racional'},
    ],
    correctKey:'d', xpReward:20,
    hint:'Pense: sociedades tradicionais = semelhança entre membros = "mecânica". O oposto (diferença/interdependência) = ?',
  },
  {
    id: 'soc-03', area: 'Ciências Humanas — sociologia',
    text: 'Max Weber relacionou o surgimento do capitalismo moderno a uma ética religiosa que valorizava o trabalho, a poupança e a austeridade. Essa ética pertence a qual corrente religiosa?',
    options: [{key:'a',value:'Catolicismo romano'},{key:'b',value:'Islamismo sunita'},{key:'c',value:'Protestantismo calvinista'},{key:'d',value:'Budismo zen'},{key:'e',value:'Judaísmo ortodoxo'}],
    correctKey:'c', xpReward:20,
    hint:'O livro de Weber se chama "A Ética Protestante e o Espírito do Capitalismo". Qual ramo reformador ele estudou?',
  },
  {
    id: 'soc-04', area: 'Ciências Humanas — sociologia',
    text: 'O "fato social" de Durkheim é externo e coercitivo ao indivíduo. Qual das situações abaixo é um exemplo de fato social?',
    options: [
      {key:'a',value:'A cor preferida de uma pessoa'},
      {key:'b',value:'O sonho que alguém teve'},
      {key:'c',value:'A língua portuguesa que os brasileiros usam'},
      {key:'d',value:'A playlist musical pessoal de alguém'},
      {key:'e',value:'A roupa comprada por gosto'},
    ],
    correctKey:'c', xpReward:20,
    hint:'O fato social independe da vontade individual e se impõe ao indivíduo. Qual das opções existe antes e fora de qualquer pessoa?',
  },
  {
    id: 'soc-05', area: 'Ciências Humanas — filosofia',
    text: 'Para Rousseau, o homem nasce bom e é corrompido pela sociedade. Qual contratualista defendia que o estado de natureza é de "guerra de todos contra todos"?',
    options: [{key:'a',value:'Kant'},{key:'b',value:'Locke'},{key:'c',value:'Hobbes'},{key:'d',value:'Hegel'},{key:'e',value:'Montesquieu'}],
    correctKey:'c', xpReward:20,
    hint:'O autor do "Leviatã" (1651) descreveu a vida sem Estado como "solitária, pobre, sórdida, brutal e curta".',
  },
];

// ── Simulado Geral ───────────────────────────────────────────────────────────
const SET_SIMULADO_GERAL: ActivityQuestion[] = [
  {
    id: 'sim-01', area: 'Física — eletricidade',
    text: 'Em um circuito elétrico residencial, uma lâmpada de 100 W é ligada a uma tensão de 220 V. De acordo com a relação P = V·I, qual é a corrente elétrica que passa pela lâmpada?',
    options: [{key:'a',value:'0,22 A'},{key:'b',value:'0,35 A'},{key:'c',value:'0,45 A'},{key:'d',value:'2,2 A'},{key:'e',value:'22 A'}],
    correctKey:'c', xpReward:24,
    hint:'Isole I na fórmula P = V·I. Divida a potência (100 W) pela tensão (220 V).',
  },
  {
    id: 'sim-02', area: 'Matemática — funções',
    text: 'Uma empresa tem lucro L(x) = −x² + 8x − 7 (x em mil unidades). Para maximizar o lucro, a produção deve ser, em mil unidades:',
    options: [{key:'a',value:'2'},{key:'b',value:'4'},{key:'c',value:'6'},{key:'d',value:'7'},{key:'e',value:'8'}],
    correctKey:'b', xpReward:24,
    hint:'O máximo ocorre no vértice. Use x_v = −b/2a com a = −1, b = 8.',
  },
  {
    id: 'sim-03', area: 'Biologia — genética',
    text: 'O daltonismo é recessivo e ligado ao X. Uma mulher normal cujo pai era daltônico tem filhos com um homem normal. Qual a probabilidade de um filho homem ser daltônico?',
    options: [{key:'a',value:'0%'},{key:'b',value:'25%'},{key:'c',value:'50%'},{key:'d',value:'75%'},{key:'e',value:'100%'}],
    correctKey:'c', xpReward:24,
    hint:'A mãe é portadora (X^D X^d). Monte o Punnett e avalie apenas os filhos do sexo masculino.',
  },
  {
    id: 'sim-04', area: 'Química — reações redox',
    text: 'Na reação Zn + CuSO₄ → ZnSO₄ + Cu, o zinco sofre oxidação e o cobre é reduzido. O agente redutor nessa reação é:',
    options: [{key:'a',value:'CuSO₄'},{key:'b',value:'ZnSO₄'},{key:'c',value:'Cu²⁺'},{key:'d',value:'Zn'},{key:'e',value:'SO₄²⁻'}],
    correctKey:'d', xpReward:24,
    hint:'O agente redutor é o que sofre oxidação (perde elétrons). Qual elemento teve seu nox aumentado?',
  },
  {
    id: 'sim-05', area: 'Ciências Humanas — filosofia',
    text: 'Para Rousseau o homem nasce bom e é corrompido pela sociedade. Qual contratualista se opõe a isso, defendendo que o estado de natureza é de guerra de todos contra todos?',
    options: [{key:'a',value:'Kant'},{key:'b',value:'Locke'},{key:'c',value:'Hobbes'},{key:'d',value:'Hegel'},{key:'e',value:'Montesquieu'}],
    correctKey:'c', xpReward:24,
    hint:'O autor do "Leviatã" acreditava que apenas um Estado forte poderia conter a violência natural entre os homens.',
  },
];

export const ACTIVITY_SETS: ActivitySet[] = [
  {
    id: 'funcoes',      title: 'Funções do 2º Grau',               area: 'Matemática',          icon: '📐',
    description: 'Vértice, raízes e otimização — os padrões que o ENEM mais cobra',
    questions: SET_FUNCOES,
  },
  {
    id: 'eletricidade', title: 'Eletricidade e Circuitos',         area: 'Física',              icon: '⚡',
    description: 'Lei de Ohm, potência e circuitos em série e paralelo',
    questions: SET_ELETRICIDADE,
  },
  {
    id: 'genetica',     title: 'Genética e Herança',               area: 'Biologia',            icon: '🧬',
    description: 'Mendel, herança ligada ao sexo e sistema ABO',
    questions: SET_GENETICA,
  },
  {
    id: 'redacao',      title: 'Redação: Argumentação',            area: 'Redação',             icon: '✍️',
    description: 'Competências 3, 4 e 5 — os pontos críticos da nota',
    questions: SET_REDACAO,
  },
  {
    id: 'sociologia',   title: 'Sociologia e Filosofia Política',  area: 'Ciências Humanas',    icon: '🏛️',
    description: 'Marx, Weber, Durkheim e os contratualistas',
    questions: SET_SOCIOLOGIA,
  },
  {
    id: 'simulado-geral', title: 'Simulado Geral ENEM',            area: 'Todas as áreas',      icon: '🏆',
    description: 'Questões de todas as áreas em um único simulado cronometrado',
    questions: SET_SIMULADO_GERAL,
    isSimulado: true,
  },
];

// kept for backward compat — aliased to ActivityQuestion
export type SimuladoQuestion = ActivityQuestion;
export const SIMULADO_QUESTIONS: ActivityQuestion[] = SET_SIMULADO_GERAL;

// ─── ENEM Lessons ─────────────────────────────────────────────────────────────

export type EnemLesson = {
  id: string;
  subjectId: SubjectId;
  area: string;
  title: string;
  description: string;
  durationMin: number;
  status: LessonStatus;
  topics: string[];
  xpReward: number;
  proficiencyPct: number;
};

export const ENEM_LESSONS: EnemLesson[] = [
  // ── Matemática ──────────────────────────────────────────────────────────────
  {
    id: 'enem-fn-01', subjectId: 'enem-mat', area: 'Matemática',
    title: 'Funções do 2º grau no ENEM',
    description: 'O ENEM apresenta funções quadráticas em contextos do cotidiano: trajetória de projéteis, maximização de lucro e otimização de área. O foco é interpretação do vértice e comportamento da parábola, não só resolução algébrica.',
    durationMin: 25, status: 'available', xpReward: 80, proficiencyPct: 31,
    topics: ['Vértice da parábola: xv = −b/2a', 'Máximo e mínimo de função quadrática', 'Zeros da função (raízes)', 'Interpretação de gráficos em contexto real', 'Problemas de otimização ENEM'],
  },
  {
    id: 'enem-fn-02', subjectId: 'enem-mat', area: 'Matemática',
    title: 'Funções exponenciais e logarítmicas',
    description: 'Crescimento e decaimento exponencial são recorrentes no ENEM: juros compostos, radioatividade, crescimento populacional. Logaritmos aparecem na escala Richter, pH e decibéis.',
    durationMin: 28, status: 'available', xpReward: 75, proficiencyPct: 44,
    topics: ['Definição e propriedades da função exponencial', 'Logaritmo como inversa da exponencial', 'Propriedades operatórias do logaritmo', 'Equações exponenciais por logaritmação', 'Aplicações: juros, pH, Richter, decibéis'],
  },
  {
    id: 'enem-stat-01', subjectId: 'enem-mat', area: 'Matemática',
    title: 'Estatística: análise de dados e gráficos',
    description: 'Estatística representa ~15% das questões de matemática no ENEM. A banca exige leitura crítica de tabelas, gráficos de barras, histogramas e boxplots, além de medidas de tendência central.',
    durationMin: 22, status: 'available', xpReward: 70, proficiencyPct: 50,
    topics: ['Média aritmética simples e ponderada', 'Mediana e moda: quando usar cada uma', 'Leitura de gráficos: barras, pizza, histograma', 'Análise de boxplot e dispersão', 'Probabilidade clássica e frequentista'],
  },
  {
    id: 'enem-geo-01', subjectId: 'enem-mat', area: 'Matemática',
    title: 'Geometria espacial: sólidos e volumes',
    description: 'Prismas, pirâmides, cilindros, cones e esferas são frequentes no ENEM em problemas de embalagens, arquitetura e engenharia. A banca cobra cálculo de volume, área e planificação.',
    durationMin: 25, status: 'locked', xpReward: 75, proficiencyPct: 65,
    topics: ['Volume de prismas e pirâmides', 'Volume de cilindro, cone e esfera', 'Área lateral e total dos sólidos', 'Planificação de sólidos geométricos', 'Problemas aplicados: embalagens e arquitetura'],
  },
  {
    id: 'enem-fin-01', subjectId: 'enem-mat', area: 'Matemática',
    title: 'Matemática financeira: juros e porcentagem',
    description: 'Juros simples, compostos e desconto comercial aparecem em contextos de empréstimos, investimentos e compras parceladas. O ENEM prioriza interpretação e montagem de equações a partir de textos.',
    durationMin: 20, status: 'locked', xpReward: 65, proficiencyPct: 42,
    topics: ['Juro simples: M = C(1 + it)', 'Juro composto: M = C(1 + i)ⁿ', 'Desconto comercial e bancário', 'Taxa equivalente e proporcional', 'Leitura de tabela de financiamento'],
  },

  // ── Ciências da Natureza ─────────────────────────────────────────────────────
  {
    id: 'enem-fis-01', subjectId: 'enem-nat', area: 'Ciências da Natureza',
    title: 'Eletricidade: lei de Ohm e circuitos',
    description: 'Circuitos elétricos, potência e consumo de energia elétrica são os tópicos de física mais cobrados no ENEM. Problemas envolvem conta de luz, chuveiro e instalações residenciais como contexto.',
    durationMin: 28, status: 'available', xpReward: 80, proficiencyPct: 33,
    topics: ['Lei de Ohm: V = R·I', 'Potência elétrica: P = V·I = V²/R = R·I²', 'Circuitos em série e paralelo', 'Resistência equivalente', 'Consumo em kWh e conta de energia'],
  },
  {
    id: 'enem-fis-02', subjectId: 'enem-nat', area: 'Ciências da Natureza',
    title: 'Energia mecânica: trabalho e conservação',
    description: 'Trabalho, energia cinética e potencial são cobrados no ENEM em contextos de montanhas-russas, freio de carro, lançamento de projéteis e geração de energia hidrelétrica.',
    durationMin: 25, status: 'locked', xpReward: 75, proficiencyPct: 40,
    topics: ['Trabalho da força resultante', 'Energia cinética: Ec = mv²/2', 'Energia potencial gravitacional: Ep = mgh', 'Conservação da energia mecânica', 'Potência média e rendimento'],
  },
  {
    id: 'enem-qui-01', subjectId: 'enem-nat', area: 'Ciências da Natureza',
    title: 'Reações redox e eletroquímica',
    description: 'Oxidação, redução, pilhas e eletrólise são cobrados no ENEM em contextos de corrosão de metais, baterias de celular, galvanoplastia e proteção catódica de navios e oleodutos.',
    durationMin: 30, status: 'available', xpReward: 80, proficiencyPct: 39,
    topics: ['Número de oxidação (nox): regras gerais', 'Identificar oxidação e redução na equação', 'Pilha de Daniell: funcionamento e ddp', 'Eletrólise ígnea e aquosa', 'Aplicações: corrosão, galvanoplastia, baterias'],
  },
  {
    id: 'enem-qui-02', subjectId: 'enem-nat', area: 'Ciências da Natureza',
    title: 'Química orgânica: funções e reações',
    description: 'Hidrocarbonetos, álcoois, ácidos carboxílicos e ésteres aparecem no ENEM associados a combustíveis, medicamentos, aromas e cosméticos. A banca cobra nomenclatura IUPAC e reações características.',
    durationMin: 30, status: 'completed', xpReward: 75, proficiencyPct: 55,
    topics: ['Hidrocarbonetos: alcanos, alcenos, alcinos, aromáticos', 'Álcoois, éteres, aldeídos e cetonas', 'Ácidos carboxílicos e ésteres: formação e hidrólise', 'Reação de esterificação e saponificação', 'Polímeros: adição e condensação'],
  },
  {
    id: 'enem-bio-01', subjectId: 'enem-nat', area: 'Ciências da Natureza',
    title: 'Genética: herança e biotecnologia',
    description: 'Genética mendelliana, herança ligada ao sexo, alelos múltiplos e biotecnologia (PCR, transgênicos, DNA forense) são temas recorrentes no ENEM, frequentemente associados a dilemas éticos.',
    durationMin: 32, status: 'available', xpReward: 80, proficiencyPct: 45,
    topics: ['Leis de Mendel: dominância e segregação', 'Herança ligada ao sexo: daltonismo, hemofilia', 'Alelos múltiplos: sistema ABO e Rh', 'Engenharia genética: transgênicos e OGM', 'DNA e técnicas de biologia molecular'],
  },
  {
    id: 'enem-bio-02', subjectId: 'enem-nat', area: 'Ciências da Natureza',
    title: 'Ecologia: fluxo de energia e sustentabilidade',
    description: 'Cadeias alimentares, biomas brasileiros, impactos ambientais e sustentabilidade aparecem frequentemente no ENEM, especialmente em questões que cruzam ciências com atualidades e cidadania.',
    durationMin: 22, status: 'completed', xpReward: 70, proficiencyPct: 71,
    topics: ['Cadeia e teia alimentar: produtores e consumidores', 'Pirâmides ecológicas: energia, biomassa, número', 'Biomas brasileiros: características e fauna', 'Desmatamento, erosão e poluição', 'Desenvolvimento sustentável e pegada ecológica'],
  },

  // ── Redação ──────────────────────────────────────────────────────────────────
  {
    id: 'enem-red-01', subjectId: 'enem-red', area: 'Redação',
    title: 'Competência 3: argumentação consistente',
    description: 'A C3 avalia se o candidato seleciona, relaciona e organiza informações para defender seu ponto de vista. É a competência com maior potencial de perda de pontos entre candidatos de nível médio.',
    durationMin: 30, status: 'available', xpReward: 100, proficiencyPct: 48,
    topics: ['Diferença entre argumento e opinião', 'Tipos de argumento: autoridade, exemplificação, causa-efeito', 'Como usar a coletânea sem copiar', 'Estrutura do parágrafo argumentativo: tópico + desenvolvimento', 'Progressão temática: cada parágrafo avança a tese'],
  },
  {
    id: 'enem-red-02', subjectId: 'enem-red', area: 'Redação',
    title: 'Competência 5: proposta de intervenção',
    description: 'A proposta de intervenção (C5) deve apresentar 5 elementos: agente, ação, meio/modo, finalidade e detalhamento. Propostas genéricas ou incompletas perdem até 120 pontos nessa competência.',
    durationMin: 25, status: 'available', xpReward: 100, proficiencyPct: 68,
    topics: ['Os 5 elementos da proposta: agente, ação, meio, finalidade, detalhamento', 'Como identificar o agente correto para cada problema', 'Exemplos de propostas nota 200 comentadas', 'Conectivos para a proposta: "a fim de que", "por meio de"', 'Erros mais comuns: proposta desvinculada da tese'],
  },
  {
    id: 'enem-red-03', subjectId: 'enem-red', area: 'Redação',
    title: 'Competência 4: coesão e conectivos',
    description: 'A C4 avalia o uso de mecanismos linguísticos que garantem a progressão e articulação entre as partes do texto. O ENEM penaliza textos que repetem conectivos ou os usam de forma inadequada.',
    durationMin: 22, status: 'available', xpReward: 100, proficiencyPct: 55,
    topics: ['Conectivos de adição, oposição, causa e consequência', 'Referenciação: pronomes, sinônimos e hiperônimos', 'Paralelismo e concordância como coesão', 'Sequenciação temporal e espacial', 'Análise de redações com erros de coesão'],
  },
  {
    id: 'enem-red-04', subjectId: 'enem-red', area: 'Redação',
    title: 'Competência 1: norma culta e estilo',
    description: 'A C1 avalia o domínio da modalidade escrita formal. Erros de regência, concordância, crase e pontuação comprometem diretamente a nota. Candidatos com C1 baixa raramente superam 700 pontos.',
    durationMin: 25, status: 'completed', xpReward: 80, proficiencyPct: 80,
    topics: ['Concordância verbal e nominal', 'Regência verbal dos verbos mais cobrados', 'Crase: quando usar e quando não usar', 'Pontuação: vírgula antes de "que" e "se"', 'Fragmentação e período excessivamente longo'],
  },
  {
    id: 'enem-red-05', subjectId: 'enem-red', area: 'Redação',
    title: 'Competência 2: tema e tipologia dissertativo-argumentativa',
    description: 'A C2 avalia se o candidato compreende a proposta de redação e se desenvolve o texto dentro da tipologia dissertativo-argumentativa. Fuga ao tema resulta em nota zero.',
    durationMin: 20, status: 'completed', xpReward: 80, proficiencyPct: 72,
    topics: ['Estrutura da dissertação: introdução, desenvolvimento, conclusão', 'Como analisar a proposta e evitar fuga ao tema', 'Introdução com contextualizaçao + tese clara', 'Tese, antítese e síntese no desenvolvimento', 'Conclusão retomando a tese com proposta'],
  },

  // ── Ciências Humanas ─────────────────────────────────────────────────────────
  {
    id: 'enem-fil-01', subjectId: 'enem-hum', area: 'Ciências Humanas',
    title: 'Filosofia política: iluminismo e contratualismo',
    description: 'Hobbes, Locke e Rousseau são os filósofos mais cobrados no ENEM. A banca apresenta trechos dos contratualistas e pede que o candidato identifique características do pensamento de cada autor.',
    durationMin: 28, status: 'available', xpReward: 75, proficiencyPct: 52,
    topics: ['Contrato social: Hobbes (Leviatã), Locke e Rousseau', 'Estado de natureza em cada autor', 'Iluminismo: razão, liberdade e progresso', 'Kant: imperativo categórico e autonomia moral', 'Aplicação contemporânea: democracia e direitos'],
  },
  {
    id: 'enem-soc-01', subjectId: 'enem-hum', area: 'Ciências Humanas',
    title: 'Sociologia: trabalho, poder e desigualdade',
    description: 'Marx, Weber e Durkheim formam a tríade mais cobrada no ENEM. As questões apresentam situações contemporâneas (gig economy, fake news, racismo estrutural) pedindo análise sociológica.',
    durationMin: 25, status: 'available', xpReward: 70, proficiencyPct: 60,
    topics: ['Marx: mais-valia, alienação e luta de classes', 'Weber: ação social, burocracia e ética protestante', 'Durkheim: fato social, anomia e solidariedade', 'Globalização: impactos culturais e econômicos', 'Movimentos sociais e cidadania no Brasil'],
  },
  {
    id: 'enem-his-01', subjectId: 'enem-hum', area: 'Ciências Humanas',
    title: 'História do Brasil: República e ditaduras',
    description: 'O período republicano brasileiro, especialmente a Era Vargas, o regime militar (1964–85) e a redemocratização, é recorrente no ENEM associado a fontes primárias como cartazes, fotografias e documentos oficiais.',
    durationMin: 30, status: 'completed', xpReward: 75, proficiencyPct: 81,
    topics: ['República Velha: coronelismo e oligarquias', 'Era Vargas: Estado Novo e trabalhismo', 'Regime militar: AI-5, censura e milagre econômico', 'Redemocratização: Diretas Já e Constituição de 1988', 'Análise de fontes primárias: cartazes e discursos'],
  },
  {
    id: 'enem-geo-hum-01', subjectId: 'enem-hum', area: 'Ciências Humanas',
    title: 'Geopolítica: conflitos e globalização',
    description: 'A geopolítica contemporânea aparece no ENEM em questões que exigem leitura de mapas temáticos, análise de conflitos regionais e compreensão dos impactos da globalização nas periferias do mundo.',
    durationMin: 25, status: 'locked', xpReward: 70, proficiencyPct: 68,
    topics: ['Nova ordem mundial pós-Guerra Fria', 'Conflitos no Oriente Médio: petróleo e religião', 'Blocos econômicos: UE, BRICS, MERCOSUL', 'Globalização assimétrica e hegemonias', 'Leitura de mapas temáticos e cartogramas'],
  },

  // ── Linguagens ───────────────────────────────────────────────────────────────
  {
    id: 'enem-ling-01', subjectId: 'enem-ling', area: 'Linguagens',
    title: 'Interpretação de texto: inferência e intertextualidade',
    description: 'A prova de linguagens exige inferência (o que o texto implica mas não diz) e reconhecimento de intertextualidade (referências a outros textos, gêneros e épocas). São as habilidades com maior índice de erro.',
    durationMin: 22, status: 'completed', xpReward: 65, proficiencyPct: 78,
    topics: ['Inferência e implícitos textuais', 'Intertextualidade: citação, paráfrase, paródia', 'Ironia, ambiguidade e subentendidos', 'Gêneros textuais: charge, tirinhas, poemas', 'Linguagem verbal e não verbal em conjunto'],
  },
  {
    id: 'enem-lit-01', subjectId: 'enem-ling', area: 'Linguagens',
    title: 'Literatura brasileira: modernismo e contemporaneidade',
    description: 'O ENEM cobra reconhecimento de características estilísticas, não memorização de datas. Modernismo, realismo e contemporaneidade são as escolas mais frequentes, sempre associadas a fragmentos de obras.',
    durationMin: 25, status: 'completed', xpReward: 70, proficiencyPct: 74,
    topics: ['Modernismo: 1ª, 2ª e 3ª geração', 'Semana de Arte Moderna: propósitos e autores', 'Realismo e naturalismo: características e contexto', 'Literatura contemporânea: pluralidade e fragmentação', 'Análise estilística de fragmentos literários'],
  },
  {
    id: 'enem-sem-01', subjectId: 'enem-ling', area: 'Linguagens',
    title: 'Semiótica: linguagem, mídia e publicidade',
    description: 'O ENEM apresenta anúncios publicitários, memes, infográficos e capas de revista pedindo análise da relação entre elementos verbais e visuais. Semiótica é a ferramenta teórica para essas questões.',
    durationMin: 20, status: 'locked', xpReward: 70, proficiencyPct: 66,
    topics: ['Signo, significante e significado (Saussure)', 'Ícone, índice e símbolo (Peirce)', 'Análise de anúncios: texto verbal e imagem', 'Discurso publicitário: persuasão e ideologia', 'Mídias digitais: memes, hipertexto e remix'],
  },
];

// ─── Ranking ──────────────────────────────────────────────────────────────────

export type RankPlayer = {
  position: number;
  initials: string;
  name: string;
  level: number;
  xp: number;
  isMe?: boolean;
  weekGain?: number;
};

export const MOCK_RANKING: RankPlayer[] = [
  { position: 1,  initials: 'MC', name: 'Maria Clara',  level: 12, xp: 2810 },
  { position: 2,  initials: 'LS', name: 'Lucas Silva',  level: 11, xp: 2540 },
  { position: 3,  initials: 'AF', name: 'Ana Ferreira', level: 10, xp: 2100 },
  { position: 4,  initials: 'JP', name: 'João Pedro',   level: 9,  xp: 1870 },
  { position: 12, initials: 'DA', name: 'Você — Davi',  level: 8,  xp: 1240, isMe: true, weekGain: 3 },
];

// ─── Achievements ─────────────────────────────────────────────────────────────

export type Achievement = {
  id: string;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  xp: number;
  unlocked: boolean;
  progress?: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'streak7',    icon: 'flame',      iconColor: '#D85A30', title: 'Sequência de 7 dias',  description: 'Estudou 7 dias seguidos',          xp: 100, unlocked: true },
  { id: 'mapacomplete', icon: 'map',      iconColor: '#185FA5', title: 'Mapa completo',         description: 'Completou o diagnóstico ENEM',     xp: 50,  unlocked: true },
  { id: 'top10',      icon: 'trophy',     iconColor: '#BA7517', title: 'Top 10 escola',         description: 'Entre os 10 melhores',             xp: 0,   unlocked: false, progress: 'Você está em #12' },
  { id: 'simulado1',  icon: 'pencil',     iconColor: '#534AB7', title: 'Primeiro simulado',     description: 'Completou 1 simulado ENEM',        xp: 120, unlocked: true },
  { id: 'gapclosed',  icon: 'chart-line', iconColor: '#3B6D11', title: 'Lacuna fechada',        description: 'Supere 70% em uma área crítica',   xp: 0,   unlocked: false, progress: 'Em progresso' },
  { id: 'enemmaster', icon: 'star',       iconColor: '#BA7517', title: 'Mestre ENEM',           description: 'Acima de 80% em todas as áreas',   xp: 0,   unlocked: false, progress: 'Bloqueada' },
];

// ─── Legacy types (kept for app/ava/aula/[lessonId]/page.tsx) ────────────────

export type SubjectId =
  | 'matematica' | 'portugues' | 'ciencias' | 'historia' | 'geografia' | 'ingles'
  | 'enem-mat'   | 'enem-nat'  | 'enem-red' | 'enem-hum' | 'enem-ling';

export type Subject = { id: SubjectId; name: string; teacher: string; grade: string };

export const SUBJECTS: Subject[] = [
  // ── Legacy (6º ano) ────────────────────────────────────────────────────────
  { id: 'matematica', name: 'Matemática',            teacher: 'Prof. Carlos Silva',    grade: '6º ano' },
  { id: 'portugues',  name: 'Português',             teacher: 'Profa. Ana Martins',    grade: '6º ano' },
  { id: 'ciencias',   name: 'Ciências',              teacher: 'Profa. Beatriz Costa',  grade: '6º ano' },
  { id: 'historia',   name: 'História',              teacher: 'Prof. Roberto Lima',    grade: '6º ano' },
  { id: 'geografia',  name: 'Geografia',             teacher: 'Prof. Paulo Mendes',    grade: '6º ano' },
  { id: 'ingles',     name: 'Inglês',                teacher: 'Profa. Sandra Oliveira',grade: '6º ano' },
  // ── ENEM ───────────────────────────────────────────────────────────────────
  { id: 'enem-mat',  name: 'Matemática',             teacher: 'SigmaEdu IA', grade: 'ENEM 2025' },
  { id: 'enem-nat',  name: 'Ciências da Natureza',   teacher: 'SigmaEdu IA', grade: 'ENEM 2025' },
  { id: 'enem-red',  name: 'Redação',                teacher: 'SigmaEdu IA', grade: 'ENEM 2025' },
  { id: 'enem-hum',  name: 'Ciências Humanas',       teacher: 'SigmaEdu IA', grade: 'ENEM 2025' },
  { id: 'enem-ling', name: 'Linguagens',             teacher: 'SigmaEdu IA', grade: 'ENEM 2025' },
];

export type LessonStatus = 'completed' | 'available' | 'locked';

export type Lesson = {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  durationMin: number;
  date: string;
  weekday: string;
  week: number;
  weekLabel: string;
  status: LessonStatus;
  topics: string[];
};

export const LESSONS: Lesson[] = [
  { id: 'mat-01', subjectId: 'matematica', title: 'Números Naturais e Inteiros', description: 'Conceitos de números naturais, inteiros e sua representação na reta numérica.', durationMin: 45, date: '2026-05-04', weekday: 'Segunda', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Números naturais', 'Números inteiros', 'Reta numérica', 'Valor absoluto'] },
  { id: 'mat-02', subjectId: 'matematica', title: 'Máximo Divisor Comum (MDC)', description: 'Cálculo do MDC usando o método da decomposição em fatores primos.', durationMin: 50, date: '2026-05-06', weekday: 'Quarta', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Fatores primos', 'Decomposição', 'Algoritmo de Euclides', 'Aplicações práticas'] },
  { id: 'mat-03', subjectId: 'matematica', title: 'Mínimo Múltiplo Comum (MMC)', description: 'Cálculo do MMC e suas aplicações na resolução de problemas do cotidiano.', durationMin: 50, date: '2026-05-11', weekday: 'Segunda', week: 2, weekLabel: '11 a 15 de maio', status: 'completed', topics: ['Múltiplos', 'MMC', 'Problemas com MMC', 'Relação entre MDC e MMC'] },
  { id: 'mat-04', subjectId: 'matematica', title: 'Frações: Conceito e Representação', description: 'Introdução às frações, tipos de frações e formas de representação.', durationMin: 60, date: '2026-05-13', weekday: 'Quarta', week: 2, weekLabel: '11 a 15 de maio', status: 'completed', topics: ['Conceito de fração', 'Frações próprias e impróprias', 'Número misto', 'Frações equivalentes'] },
  { id: 'mat-05', subjectId: 'matematica', title: 'Frações: Adição e Subtração', description: 'Operações de adição e subtração com frações de mesmo e diferente denominador.', durationMin: 60, date: '2026-05-26', weekday: 'Segunda', week: 3, weekLabel: '25 a 29 de maio', status: 'available', topics: ['Frações com mesmo denominador', 'Denominadores diferentes', 'MMC aplicado', 'Exercícios práticos'] },
  { id: 'mat-06', subjectId: 'matematica', title: 'Frações: Multiplicação e Divisão', description: 'Operações de multiplicação e divisão com frações e números mistos.', durationMin: 60, date: '2026-06-02', weekday: 'Segunda', week: 4, weekLabel: '1 a 5 de junho', status: 'locked', topics: ['Multiplicação de frações', 'Fração de fração', 'Divisão por frações', 'Problemas aplicados'] },
  { id: 'por-01', subjectId: 'portugues', title: 'Tipos de Texto: Narrativo', description: 'Características e estrutura do texto narrativo.', durationMin: 50, date: '2026-05-05', weekday: 'Terça', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Narrador', 'Personagens', 'Tempo e espaço', 'Enredo'] },
  { id: 'por-02', subjectId: 'portugues', title: 'Morfologia: Substantivos', description: 'Classificação dos substantivos.', durationMin: 45, date: '2026-05-07', weekday: 'Quinta', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Substantivos comuns e próprios', 'Concretos e abstratos', 'Coletivos', 'Flexão'] },
  { id: 'por-03', subjectId: 'portugues', title: 'Morfologia: Adjetivos', description: 'Funções e classificação dos adjetivos.', durationMin: 45, date: '2026-05-19', weekday: 'Terça', week: 3, weekLabel: '18 a 22 de maio', status: 'completed', topics: ['Adjetivo pátrio', 'Locução adjetiva', 'Graus do adjetivo', 'Adjetivação'] },
  { id: 'por-04', subjectId: 'portugues', title: 'Morfologia: Verbos', description: 'Conjugação verbal: modos, tempos e pessoas do verbo.', durationMin: 60, date: '2026-05-28', weekday: 'Quinta', week: 4, weekLabel: '25 a 29 de maio', status: 'available', topics: ['Modo indicativo', 'Modo subjuntivo', 'Modo imperativo', 'Verbos irregulares'] },
  { id: 'cie-01', subjectId: 'ciencias', title: 'Célula: Unidade da Vida', description: 'Estrutura e funções das células procariontes e eucariontes.', durationMin: 55, date: '2026-05-05', weekday: 'Terça', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Membrana celular', 'Núcleo', 'Citoplasma', 'Organelas'] },
  { id: 'cie-02', subjectId: 'ciencias', title: 'Divisão Celular: Mitose', description: 'Fases da mitose.', durationMin: 60, date: '2026-05-12', weekday: 'Terça', week: 2, weekLabel: '11 a 15 de maio', status: 'completed', topics: ['Prófase', 'Metáfase', 'Anáfase', 'Telófase'] },
  { id: 'cie-03', subjectId: 'ciencias', title: 'Sistema Digestório', description: 'Órgãos e funcionamento do sistema digestório humano.', durationMin: 55, date: '2026-05-26', weekday: 'Segunda', week: 4, weekLabel: '25 a 29 de maio', status: 'available', topics: ['Boca e esôfago', 'Estômago', 'Intestino', 'Fígado e pâncreas'] },
  { id: 'his-01', subjectId: 'historia', title: 'Pré-História: Origens da Humanidade', description: 'Do Homo sapiens às primeiras sociedades.', durationMin: 50, date: '2026-05-06', weekday: 'Quarta', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Evolução humana', 'Paleolítico', 'Arte rupestre', 'Nomadismo'] },
  { id: 'his-02', subjectId: 'historia', title: 'Antigas Civilizações: Egito', description: 'Civilização egípcia.', durationMin: 55, date: '2026-05-13', weekday: 'Quarta', week: 2, weekLabel: '11 a 15 de maio', status: 'available', topics: ['Faraós', 'Escrita hieroglífica', 'Pirâmides', 'Rio Nilo'] },
  { id: 'geo-01', subjectId: 'geografia', title: 'Cartografia: Leitura de Mapas', description: 'Elementos dos mapas e escalas.', durationMin: 50, date: '2026-05-07', weekday: 'Quinta', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Elementos do mapa', 'Escala', 'Projeções cartográficas', 'Rosa dos ventos'] },
  { id: 'geo-02', subjectId: 'geografia', title: 'Relevo Brasileiro', description: 'As principais formas de relevo do Brasil.', durationMin: 55, date: '2026-05-14', weekday: 'Quinta', week: 2, weekLabel: '11 a 15 de maio', status: 'available', topics: ['Planaltos', 'Planícies', 'Depressões', 'Serra do Mar'] },
  { id: 'ing-01', subjectId: 'ingles', title: 'Simple Present: Daily Routines', description: 'Uso do simple present para descrever rotinas.', durationMin: 45, date: '2026-05-05', weekday: 'Terça', week: 1, weekLabel: '4 a 8 de maio', status: 'completed', topics: ['Afirmativas e negativas', 'Interrogativas', 'Advérbios de frequência', 'Vocabulary'] },
  { id: 'ing-02', subjectId: 'ingles', title: 'Simple Past: Actions', description: 'Verbos regulares e irregulares no passado simples.', durationMin: 50, date: '2026-05-12', weekday: 'Terça', week: 2, weekLabel: '11 a 15 de maio', status: 'available', topics: ['Regular verbs', 'Irregular verbs', 'Time expressions', 'Past stories'] },
];
