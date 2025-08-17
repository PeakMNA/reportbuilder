import { validateProperty, PropertyError } from '@/lib/property-validation'

describe('Property Validation', () => {
  describe('text properties', () => {
    it('should validate font size within acceptable range', () => {
      expect(validateProperty('fontSize', 12)).toBe(true)
      expect(validateProperty('fontSize', 72)).toBe(true)
      expect(() => validateProperty('fontSize', 0)).toThrow(PropertyError)
      expect(() => validateProperty('fontSize', 1000)).toThrow(PropertyError)
    })

    it('should validate color format', () => {
      expect(validateProperty('color', '#000000')).toBe(true)
      expect(validateProperty('color', '#fff')).toBe(true)
      expect(validateProperty('color', 'rgb(255, 255, 255)')).toBe(true)
      expect(() => validateProperty('color', 'invalid')).toThrow(PropertyError)
    })

    it('should validate text alignment options', () => {
      expect(validateProperty('alignment', 'left')).toBe(true)
      expect(validateProperty('alignment', 'center')).toBe(true)
      expect(validateProperty('alignment', 'right')).toBe(true)
      expect(() => validateProperty('alignment', 'invalid')).toThrow(PropertyError)
    })
  })

  describe('dimension properties', () => {
    it('should validate width and height constraints', () => {
      expect(validateProperty('width', 100)).toBe(true)
      expect(validateProperty('height', 100)).toBe(true)
      expect(() => validateProperty('width', -10)).toThrow(PropertyError)
      expect(() => validateProperty('height', 0)).toThrow(PropertyError)
    })

    it('should validate position constraints', () => {
      expect(validateProperty('x', 0)).toBe(true)
      expect(validateProperty('y', 0)).toBe(true)
      expect(() => validateProperty('x', -1)).toThrow(PropertyError)
      expect(() => validateProperty('y', -1)).toThrow(PropertyError)
    })
  })

  describe('border properties', () => {
    it('should validate border width', () => {
      expect(validateProperty('borderWidth', 0)).toBe(true)
      expect(validateProperty('borderWidth', 5)).toBe(true)
      expect(() => validateProperty('borderWidth', -1)).toThrow(PropertyError)
      expect(() => validateProperty('borderWidth', 100)).toThrow(PropertyError)
    })

    it('should validate border radius', () => {
      expect(validateProperty('borderRadius', 0)).toBe(true)
      expect(validateProperty('borderRadius', 50)).toBe(true)
      expect(() => validateProperty('borderRadius', -1)).toThrow(PropertyError)
    })
  })

  describe('numeric input sanitization', () => {
    it('should handle string numeric inputs', () => {
      expect(validateProperty('fontSize', '14')).toBe(true)
      expect(() => validateProperty('fontSize', 'abc')).toThrow(PropertyError)
    })

    it('should handle decimal inputs', () => {
      expect(validateProperty('fontSize', 14.5)).toBe(true)
      expect(() => validateProperty('fontSize', NaN)).toThrow(PropertyError)
      expect(() => validateProperty('fontSize', Infinity)).toThrow(PropertyError)
    })
  })
})