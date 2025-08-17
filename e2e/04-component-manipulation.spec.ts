import { test, expect } from '@playwright/test';

test.describe('Component Manipulation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer');
  });

  test('should select and edit component properties', async ({ page }) => {
    // Add a text component
    const canvas = page.locator('[data-testid="design-canvas"]');
    const textComponent = page.locator('text=Text').first();
    await textComponent.dragTo(canvas);
    
    // Select the component on canvas
    await canvas.locator('.component').first().click();
    
    // Verify properties panel shows component properties
    const propertiesPanel = page.locator('[data-testid="properties-panel"]');
    await expect(propertiesPanel.locator('text=Properties')).toBeVisible();
    await expect(propertiesPanel.locator('input[type="text"]')).toBeVisible();
  });

  test('should support undo/redo operations', async ({ page }) => {
    // Add a component
    const canvas = page.locator('[data-testid="design-canvas"]');
    const textComponent = page.locator('text=Text').first();
    await textComponent.dragTo(canvas);
    
    // Verify component is added
    await expect(canvas.locator('.component')).toHaveCount(1);
    
    // Press Ctrl+Z to undo
    await page.keyboard.press('Control+z');
    
    // Verify component is removed
    await expect(canvas.locator('.component')).toHaveCount(0);
    
    // Press Ctrl+Y to redo
    await page.keyboard.press('Control+y');
    
    // Verify component is back
    await expect(canvas.locator('.component')).toHaveCount(1);
  });

  test('should delete components with keyboard shortcut', async ({ page }) => {
    // Add a component
    const canvas = page.locator('[data-testid="design-canvas"]');
    const textComponent = page.locator('text=Text').first();
    await textComponent.dragTo(canvas);
    
    // Select the component
    await canvas.locator('.component').first().click();
    
    // Press Delete key
    await page.keyboard.press('Delete');
    
    // Verify component is deleted
    await expect(canvas.locator('.component')).toHaveCount(0);
  });
});