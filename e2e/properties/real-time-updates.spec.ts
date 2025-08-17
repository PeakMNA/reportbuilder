import { test, expect } from '@playwright/test'

test.describe('Properties Panel Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer')
    await page.waitForLoadState('networkidle')
  })

  test('should update text component in real-time', async ({ page }) => {
    // Add a text component to canvas
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Wait for component to be added and selected
    await page.waitForSelector('[data-testid="canvas-component"]')
    
    // Update text content in properties panel
    const textInput = page.getByLabel('Content')
    await textInput.clear()
    await textInput.fill('Real-time Update Test')
    
    // Verify canvas updates immediately
    await expect(page.locator('[data-testid="canvas-component"] text')).toHaveText('Real-time Update Test')
  })

  test('should update font size with visual feedback', async ({ page }) => {
    // Add text component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Get initial font size
    const initialFontSize = await page.locator('[data-testid="canvas-component"] text').evaluate(
      el => window.getComputedStyle(el).fontSize
    )
    
    // Update font size
    const fontSizeInput = page.getByLabel('Font Size')
    await fontSizeInput.clear()
    await fontSizeInput.fill('24')
    
    // Verify font size changed on canvas
    const newFontSize = await page.locator('[data-testid="canvas-component"] text').evaluate(
      el => window.getComputedStyle(el).fontSize
    )
    
    expect(newFontSize).not.toBe(initialFontSize)
    expect(newFontSize).toBe('24px')
  })

  test('should update color with immediate visual feedback', async ({ page }) => {
    // Add text component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Update color
    const colorInput = page.getByLabel('Color')
    await colorInput.fill('#ff0000')
    
    // Verify color changed on canvas
    const textColor = await page.locator('[data-testid="canvas-component"] text').evaluate(
      el => window.getComputedStyle(el).color
    )
    
    expect(textColor).toBe('rgb(255, 0, 0)')
  })

  test('should handle rapid property changes with debouncing', async ({ page }) => {
    // Add text component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Monitor network requests to ensure debouncing
    const requests = []
    page.on('request', request => {
      if (request.url().includes('/api/components')) {
        requests.push(request)
      }
    })
    
    // Type rapidly in text input
    const textInput = page.getByLabel('Content')
    await textInput.clear()
    await textInput.type('Rapid typing test', { delay: 50 })
    
    // Wait for debounce period
    await page.waitForTimeout(1000)
    
    // Should have fewer requests than characters typed due to debouncing
    expect(requests.length).toBeLessThan(18) // "Rapid typing test" = 18 chars
  })

  test('should validate properties and show error states', async ({ page }) => {
    // Add text component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Enter invalid font size
    const fontSizeInput = page.getByLabel('Font Size')
    await fontSizeInput.clear()
    await fontSizeInput.fill('-10')
    
    // Verify error message appears
    await expect(page.getByText('Font size must be between 1 and 200')).toBeVisible()
    
    // Verify canvas doesn't update with invalid value
    const fontSize = await page.locator('[data-testid="canvas-component"] text').evaluate(
      el => window.getComputedStyle(el).fontSize
    )
    expect(fontSize).not.toBe('-10px')
  })

  test('should synchronize multiple property changes', async ({ page }) => {
    // Add text component
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    // Change multiple properties simultaneously
    await page.getByLabel('Content').fill('Multi-property test')
    await page.getByLabel('Font Size').fill('20')
    await page.getByLabel('Color').fill('#0000ff')
    await page.getByLabel('Alignment').selectOption('center')
    
    // Verify all changes are reflected on canvas
    const textElement = page.locator('[data-testid="canvas-component"] text')
    
    await expect(textElement).toHaveText('Multi-property test')
    
    const styles = await textElement.evaluate(el => ({
      fontSize: window.getComputedStyle(el).fontSize,
      color: window.getComputedStyle(el).color,
      textAlign: window.getComputedStyle(el).textAlign
    }))
    
    expect(styles.fontSize).toBe('20px')
    expect(styles.color).toBe('rgb(0, 0, 255)')
    expect(styles.textAlign).toBe('center')
  })

  test('should maintain property state during component selection changes', async ({ page }) => {
    // Add two text components
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 200, y: 200 } })
    
    await page.click('[data-testid="component-text"]')
    await page.click('[data-testid="canvas"]', { position: { x: 400, y: 200 } })
    
    // Select first component and change properties
    await page.click('[data-testid="canvas-component"]:first-child')
    await page.getByLabel('Content').fill('First component')
    await page.getByLabel('Font Size').fill('18')
    
    // Select second component
    await page.click('[data-testid="canvas-component"]:last-child')
    
    // Verify properties panel shows second component's properties
    await expect(page.getByLabel('Content')).toHaveValue('Sample Text') // Default text
    await expect(page.getByLabel('Font Size')).toHaveValue('14') // Default size
    
    // Select first component again
    await page.click('[data-testid="canvas-component"]:first-child')
    
    // Verify first component's modified properties are maintained
    await expect(page.getByLabel('Content')).toHaveValue('First component')
    await expect(page.getByLabel('Font Size')).toHaveValue('18')
  })
})