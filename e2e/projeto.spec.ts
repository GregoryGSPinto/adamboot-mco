import { test, expect } from '@playwright/test';

test.describe('Projeto Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel('E-mail').fill('demo@mco.vale.com');
    await page.getByLabel('Senha').fill('mco2026');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL(/.*missao/);
  });

  test('deve mostrar lista de projetos', async ({ page }) => {
    await expect(page.getByText('Minha Missão')).toBeVisible();

    // Should show either projects or empty state
    const hasProjects = (await page.getByText(/projeto/i).count()) > 0;
    const hasEmptyState = (await page.getByText('Nenhum projeto ativo').count()) > 0;

    expect(hasProjects || hasEmptyState).toBeTruthy();
  });

  test('deve criar novo projeto', async ({ page }) => {
    // Click new project button
    await page.getByRole('button', { name: /Novo projeto/i }).click();

    // Fill project name
    await page.getByPlaceholder(/Nome do projeto/i).fill('Projeto Teste E2E');

    // Submit
    await page.getByRole('button', { name: /Criar/i }).click();

    // Should show the new project
    await expect(page.getByText('Projeto Teste E2E')).toBeVisible();
  });

  test('deve expandir card de projeto', async ({ page }) => {
    // Find first project card and click it
    const projectCards = page.locator('[class*="card"]').first();

    if ((await projectCards.count()) > 0) {
      await projectCards.click();

      // Should show expanded content
      await expect(page.getByRole('button', { name: /Abrir projeto/i })).toBeVisible();
    }
  });
});
