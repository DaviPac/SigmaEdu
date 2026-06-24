import { test, expect } from '@playwright/test';

test.describe('Agente Acompanhamento', () => {
  test('deve permitir configurar a personalidade, editar o estilo e iniciar o chat', async ({ page }) => {
    // 1. Acessa a página diretamente
    await page.goto('/ava/acompanhamento');

    // 2. Verifica a tela de configuração inicial
    await expect(page.locator('text=Qual tipo de professor você prefere?')).toBeVisible();

    // 3. Seleciona a opção "Mais lúdico"
    const radioLudico = page.locator('label', { hasText: 'Mais lúdico' }).locator('input[type="radio"]');
    await radioLudico.check();
    
    // 4. Confirma o estilo
    await page.locator('button', { hasText: 'Confirmar Estilo' }).click();

    // 5. Verifica se a tela de chat apareceu e a confirmação sumiu
    await expect(page.locator('text=Qual tipo de professor você prefere?')).not.toBeVisible();
    await expect(page.locator('text=Estilo: Mais lúdico')).toBeVisible();
    await expect(page.locator('text=Pronto para analisar seu desempenho')).toBeVisible();

    // 6. Edita o estilo do professor
    await page.locator('button[title="Editar Estilo do Professor"]').click();
    await expect(page.locator('text=Qual tipo de professor você prefere?')).toBeVisible();
    
    // 7. Seleciona "Mais direto"
    const radioDireto = page.locator('label', { hasText: 'Mais direto' }).locator('input[type="radio"]');
    await radioDireto.check();
    await page.locator('button', { hasText: 'Confirmar Estilo' }).click();

    // 8. Verifica se o estilo foi atualizado com sucesso
    await expect(page.locator('text=Estilo: Mais direto')).toBeVisible();

    // 9. Envia uma mensagem
    const input = page.locator('textarea[placeholder="Digite sua dúvida sobre o desempenho..."]');
    await input.fill('Como melhorar em matemática?');
    await page.keyboard.press('Enter');

    // 10. Verifica se a mensagem aparece no chat
    await expect(page.locator('text=Como melhorar em matemática?').first()).toBeVisible();
    
    // 11. Verifica se o "Acompanhamento · modo ENEM" respondeu (mock ou real depende do setup)
    await expect(page.locator('text=Acompanhamento · modo ENEM').first()).toBeVisible();
  });
});
