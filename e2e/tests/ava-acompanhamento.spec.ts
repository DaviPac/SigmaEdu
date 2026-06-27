import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

/** Configura mocks do backend FastAPI para isolar os testes E2E do servidor real. */
async function mockBackendRoutes(page: import('@playwright/test').Page) {
  await page.route(`${BACKEND_URL}/ava/acompanhamento`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ text: 'Resposta mockada do Agente Professor.' }),
    });
  });

  await page.route(`${BACKEND_URL}/ava/format-generator`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        format: '<div class="p-4"><h3>🎯 Análise</h3><p>[Sua resposta aqui]</p></div>',
      }),
    });
  });
}

test.describe('Agente Acompanhamento', () => {
  test.beforeEach(async ({ page }) => {
    await mockBackendRoutes(page);
  });

  test('deve permitir configurar a personalidade, editar o estilo e iniciar o chat', async ({ page }) => {
    await page.goto('/ava/acompanhamento');

    // Verifica a tela de configuração inicial
    await expect(page.locator('text=Qual tipo de professor você prefere?')).toBeVisible();

    // Seleciona a opção "Mais lúdico"
    const radioLudico = page.locator('label', { hasText: 'Mais lúdico' }).locator('input[type="radio"]');
    await radioLudico.check();

    // Confirma o estilo
    await page.locator('button', { hasText: 'Confirmar Estilo' }).click();

    // Verifica se a tela de chat apareceu
    await expect(page.locator('text=Qual tipo de professor você prefere?')).not.toBeVisible();
    await expect(page.locator('text=Estilo: Mais lúdico')).toBeVisible();
    await expect(page.locator('text=Pronto para analisar seu desempenho')).toBeVisible();

    // Edita o estilo do professor
    await page.locator('button[title="Editar Estilo do Professor"]').click();
    await expect(page.locator('text=Qual tipo de professor você prefere?')).toBeVisible();

    // Seleciona "Mais direto"
    const radioDireto = page.locator('label', { hasText: 'Mais direto' }).locator('input[type="radio"]');
    await radioDireto.check();
    await page.locator('button', { hasText: 'Confirmar Estilo' }).click();

    // Verifica se o estilo foi atualizado
    await expect(page.locator('text=Estilo: Mais direto')).toBeVisible();

    // Envia uma mensagem
    const input = page.locator('textarea[placeholder="Digite sua dúvida sobre o desempenho..."]');
    await input.fill('Como melhorar em matemática?');
    await page.keyboard.press('Enter');

    // Verifica se a mensagem aparece no chat
    await expect(page.locator('text=Como melhorar em matemática?').first()).toBeVisible();

    // Verifica se o agente respondeu (mock)
    await expect(page.locator('text=Acompanhamento · modo ENEM').first()).toBeVisible({ timeout: 10_000 });
  });

  test('deve gerar formato dinâmico de HTML para personalidade customizada', async ({ page }) => {
    await page.goto('/ava/acompanhamento');

    // Seleciona a opção personalizada
    const radioCustom = page.locator('label', { hasText: 'Personalizar professor' }).locator('input[type="radio"]');
    await radioCustom.check();

    // Preenche o input
    const inputPersonalizado = page.locator('input[placeholder="Ex: Fale como um pirata, ou como um sargento..."]');
    await expect(inputPersonalizado).toBeVisible();
    await inputPersonalizado.fill('Pirata do Caribe');

    // Confirma o estilo
    const buttonConfirm = page.locator('button', { hasText: 'Confirmar Estilo' });
    await buttonConfirm.click();

    // Tela deve transicionar para o chat
    await expect(page.locator('text=Qual tipo de professor você prefere?')).not.toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Estilo: Pirata do Caribe')).toBeVisible();
  });

  test('deve exibir fallback elegante quando ocorrer erro na API', async ({ page }) => {
    // Sobrescreve o mock para simular resposta de erro tratada pelo backend
    await page.route(`${BACKEND_URL}/ava/acompanhamento`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          text: 'Desculpe, ocorreu um erro interno e não consegui gerar sua resposta. Por favor, tente novamente em alguns instantes!',
        }),
      });
    });

    await page.goto('/ava/acompanhamento');

    // Confirma estilo padrão
    await page.locator('button', { hasText: 'Confirmar Estilo' }).click();

    // Envia uma mensagem
    const input = page.locator('textarea[placeholder="Digite sua dúvida sobre o desempenho..."]');
    await input.fill('trigonometri');
    await page.keyboard.press('Enter');

    // Verifica se a mensagem de fallback foi renderizada
    await expect(
      page.locator('text=Desculpe, ocorreu um erro interno e não consegui gerar sua resposta.'),
    ).toBeVisible({ timeout: 10_000 });
  });
});
