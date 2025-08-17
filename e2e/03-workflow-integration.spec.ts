import { test, expect } from '@playwright/test';

test.describe('Workflow Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer');
  });

  test('should complete template selection workflow', async ({ page }) => {
    // Open template manager
    await page.click('text=Templates');
    
    // Select a template
    await page.click('[data-testid="template-card"]');
    
    // Verify template loads
    await expect(page.locator('[data-testid="design-canvas"] .component')).toHaveCount.gte(1);
  });

  test('should complete data binding workflow', async ({ page }) => {
    // Add a component first
    const canvas = page.locator('[data-testid="design-canvas"]');
    const textComponent = page.locator('text=Text').first();
    await textComponent.dragTo(canvas);
    
    // Open data preview panel
    await page.click('text=Data Preview');
    
    // Verify data preview panel opens
    await expect(page.locator('[data-testid="data-preview-panel"]')).toBeVisible();
  });

  test('should complete PDF export workflow', async ({ page }) => {
    // Add a component first
    const canvas = page.locator('[data-testid="design-canvas"]');
    const textComponent = page.locator('text=Text').first();
    await textComponent.dragTo(canvas);
    
    // Click export PDF
    await page.click('text=Export PDF');
    
    // Verify export dialog or process starts
    await expect(page.locator('[data-testid="pdf-export-dialog"]')).toBeVisible();
  });

  test('should show workflow manager', async ({ page }) => {
    // Open workflow panel
    await page.click('text=Workflow');
    
    // Verify workflow panel opens
    await expect(page.locator('[data-testid="workflow-panel"]')).toBeVisible();
  });
});