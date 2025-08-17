import { test, expect } from '@playwright/test';

test.describe('Report Designer Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer');
  });

  test('should load the designer interface', async ({ page }) => {
    // Check for main designer elements
    await expect(page.locator('text=ReportBuilder')).toBeVisible();
    await expect(page.locator('[data-testid="component-palette"]')).toBeVisible();
    await expect(page.locator('[data-testid="design-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="properties-panel"]')).toBeVisible();
  });

  test('should display component palette with draggable components', async ({ page }) => {
    // Check if component palette loads
    const palette = page.locator('[data-testid="component-palette"]');
    await expect(palette).toBeVisible();
    
    // Check for common components
    await expect(page.locator('text=Text')).toBeVisible();
    await expect(page.locator('text=Heading')).toBeVisible();
    await expect(page.locator('text=Table')).toBeVisible();
  });

  test('should allow drag and drop of components', async ({ page }) => {
    // Get canvas and component
    const canvas = page.locator('[data-testid="design-canvas"]');
    const textComponent = page.locator('text=Text').first();
    
    // Drag text component to canvas
    await textComponent.dragTo(canvas);
    
    // Check if component appears on canvas
    await expect(canvas.locator('.component')).toHaveCount(1);
  });
});