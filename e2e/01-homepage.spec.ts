import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/ReportBuilder/i);
    
    // Check for main navigation elements
    await expect(page.locator('text=Get Started')).toBeVisible();
  });

  test('should navigate to designer from homepage', async ({ page }) => {
    await page.goto('/');
    
    // Click on Get Started or similar navigation
    await page.click('text=Get Started');
    
    // Should navigate to designer
    await expect(page).toHaveURL(/\/designer/);
  });
});