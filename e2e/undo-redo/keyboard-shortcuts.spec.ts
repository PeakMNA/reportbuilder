import { test, expect } from '@playwright/test'

test.describe('Undo/Redo Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer')
    await page.waitForLoadState('networkidle')
  })

  test('should undo component addition with Ctrl+Z', async ({ page }) => {
    // Add a text component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Verify component was added
    await expect(page.locator('[data-testid="canvas-component"]')).toBeVisible()
    
    // Undo with Ctrl+Z
    await page.keyboard.press('Control+z')
    
    // Verify component was removed
    await expect(page.locator('[data-testid="canvas-component"]')).not.toBeVisible()
  })

  test('should redo component addition with Ctrl+Y', async ({ page }) => {
    // Add and undo a component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    await page.keyboard.press('Control+z')
    
    // Verify component is gone
    await expect(page.locator('[data-testid="canvas-component"]')).not.toBeVisible()
    
    // Redo with Ctrl+Y
    await page.keyboard.press('Control+y')
    
    // Verify component is back
    await expect(page.locator('[data-testid="canvas-component"]')).toBeVisible()
  })

  test('should undo property changes with Ctrl+Z', async ({ page }) => {
    // Add component and change properties
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    const textInput = page.getByLabel('Content')
    await textInput.clear()
    await textInput.fill('Changed Text')
    
    // Verify change applied
    await expect(page.locator('[data-testid="canvas-component"] text')).toHaveText('Changed Text')
    
    // Undo the property change
    await page.keyboard.press('Control+z')
    
    // Verify reverted to original text
    await expect(page.locator('[data-testid="canvas-component"] text')).toHaveText('Sample Text')
  })

  test('should undo component deletion with Ctrl+Z', async ({ page }) => {
    // Add component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Select and delete component
    await page.click('[data-testid="canvas-component"]')
    await page.keyboard.press('Delete')
    
    // Verify component deleted
    await expect(page.locator('[data-testid="canvas-component"]')).not.toBeVisible()
    
    // Undo deletion
    await page.keyboard.press('Control+z')
    
    // Verify component restored
    await expect(page.locator('[data-testid="canvas-component"]')).toBeVisible()
  })

  test('should handle multiple undo operations in sequence', async ({ page }) => {
    // Perform multiple operations
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    await page.click('[data-testid="component-rectangle"]')
    await page.click('[data-testid="canvas"]', { position: { x: 400, y: 200 } })
    
    await page.click('[data-testid="component-circle"]')
    await page.click('[data-testid="canvas"]', { position: { x: 300, y: 300 } })
    
    // Verify all components present
    await expect(page.locator('[data-testid="canvas-component"]')).toHaveCount(3)
    
    // Undo operations one by one
    await page.keyboard.press('Control+z') // Remove circle
    await expect(page.locator('[data-testid="canvas-component"]')).toHaveCount(2)
    
    await page.keyboard.press('Control+z') // Remove rectangle
    await expect(page.locator('[data-testid="canvas-component"]')).toHaveCount(1)
    
    await page.keyboard.press('Control+z') // Remove text
    await expect(page.locator('[data-testid="canvas-component"]')).toHaveCount(0)
  })

  test('should handle multiple redo operations in sequence', async ({ page }) => {
    // Add components and undo all
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    await page.click('[data-testid="component-rectangle"]')
    await page.click('[data-testid="canvas"]', { position: { x: 400, y: 200 } })
    
    await page.keyboard.press('Control+z')
    await page.keyboard.press('Control+z')
    
    // Verify all components removed
    await expect(page.locator('[data-testid="canvas-component"]')).toHaveCount(0)
    
    // Redo operations one by one
    await page.keyboard.press('Control+y') // Restore text
    await expect(page.locator('[data-testid="canvas-component"]')).toHaveCount(1)
    
    await page.keyboard.press('Control+y') // Restore rectangle
    await expect(page.locator('[data-testid="canvas-component"]')).toHaveCount(2)
  })

  test('should respect undo/redo limits', async ({ page }) => {
    // Perform maximum number of operations (assume limit is 50)
    for (let i = 0; i < 52; i++) {
      await page.click('[data-testid="component-text"]')
      await page.click('[data-testid="canvas"]', { 
        position: { x: 100 + (i % 10) * 30, y: 100 + Math.floor(i / 10) * 30 } 
      })
    }
    
    // Try to undo more than the limit
    for (let i = 0; i < 55; i++) {
      await page.keyboard.press('Control+z')
    }
    
    // Should still have at least 2 components (52 - 50 limit)
    const componentCount = await page.locator('[data-testid="canvas-component"]').count()
    expect(componentCount).toBeGreaterThanOrEqual(2)
  })

  test('should work with different browser shortcuts', async ({ page, browserName }) => {
    // Add component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Use different shortcuts based on browser/OS
    if (browserName === 'webkit') {
      // macOS shortcuts
      await page.keyboard.press('Meta+z') // Cmd+Z
      await expect(page.locator('[data-testid="canvas-component"]')).not.toBeVisible()
      
      await page.keyboard.press('Meta+Shift+z') // Cmd+Shift+Z
      await expect(page.locator('[data-testid="canvas-component"]')).toBeVisible()
    } else {
      // Windows/Linux shortcuts
      await page.keyboard.press('Control+z')
      await expect(page.locator('[data-testid="canvas-component"]')).not.toBeVisible()
      
      await page.keyboard.press('Control+y')
      await expect(page.locator('[data-testid="canvas-component"]')).toBeVisible()
    }
  })

  test('should disable shortcuts when input is focused', async ({ page }) => {
    // Add component and focus on property input
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    const textInput = page.getByLabel('Content')
    await textInput.focus()
    
    // Type Ctrl+Z in input field - should not trigger undo
    await textInput.press('Control+z')
    
    // Component should still be present
    await expect(page.locator('[data-testid="canvas-component"]')).toBeVisible()
    
    // Click outside input to unfocus
    await page.click('[data-testid="canvas"]', { position: { x: 500, y: 500 } })
    
    // Now Ctrl+Z should work
    await page.keyboard.press('Control+z')
    await expect(page.locator('[data-testid="canvas-component"]')).not.toBeVisible()
  })
})