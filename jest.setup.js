/**
 * Jest Setup Configuration
 * 
 * This file runs before each test file is executed.
 * It sets up the testing environment, mocks, and global utilities.
 */

import '@testing-library/jest-dom'
import { server } from './__mocks__/server'

// Increase timeout for integration tests
jest.setTimeout(30000)

// Enable API mocking
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error',
  })
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}))

// Mock Next.js navigation (App Router)
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => {
  return (dynamicFunction, options) => {
    const Component = dynamicFunction()
    Component.displayName = 'MockedDynamicComponent'
    return Component
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => {
  return ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 0))
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id))

// Mock canvas operations for PDF generation and charts
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  direction: 'ltr',
  fillStyle: '#000000',
  strokeStyle: '#000000',
  globalAlpha: 1,
  lineWidth: 1,
  globalCompositeOperation: 'source-over',
}))

// Mock canvas toDataURL and toBlob
global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mockdata')
global.HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  callback(new Blob(['mock'], { type: 'image/png' }))
})

// Mock PDF generation library
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addPage: jest.fn(),
    text: jest.fn(),
    setFontSize: jest.fn(),
    save: jest.fn(),
    addImage: jest.fn(),
    setTextColor: jest.fn(),
    setDrawColor: jest.fn(),
    setFillColor: jest.fn(),
    rect: jest.fn(),
    line: jest.fn(),
    setFont: jest.fn(),
    getStringUnitWidth: jest.fn(() => 0.5),
    internal: {
      pageSize: {
        getWidth: jest.fn(() => 210),
        getHeight: jest.fn(() => 297),
      },
    },
    output: jest.fn(() => 'mock-pdf-data'),
  }))
})

// Mock HTML to Canvas library
jest.mock('html2canvas', () => {
  return jest.fn(() => Promise.resolve({
    toDataURL: () => 'data:image/png;base64,mockdata',
    width: 800,
    height: 600,
  }))
})

// Mock CSV parsing library
jest.mock('papaparse', () => ({
  parse: jest.fn((data, config) => {
    const lines = data.split('\n')
    const headers = lines[0].split(',')
    const rows = lines.slice(1).map(line => line.split(','))
    
    const result = {
      data: config.header ? rows.map(row => {
        const obj = {}
        headers.forEach((header, i) => {
          obj[header] = row[i]
        })
        return obj
      }) : rows,
      errors: [],
      meta: {
        delimiter: ',',
        linebreak: '\n',
        aborted: false,
        truncated: false,
        cursor: data.length,
        fields: headers,
      }
    }
    
    if (config.complete) {
      config.complete(result)
    }
    
    return result
  }),
}))

// Mock Excel library
jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {
        A1: { v: 'Name' },
        B1: { v: 'Value' },
        A2: { v: 'Test' },
        B2: { v: 123 },
      },
    },
  })),
  utils: {
    sheet_to_json: jest.fn(() => [
      { Name: 'Test', Value: 123 },
    ]),
    json_to_sheet: jest.fn(() => ({})),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
    write: jest.fn(() => 'mock-excel-data'),
  },
}))

// Mock QR Code generation
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve('data:image/png;base64,qrcode-mock')),
  toString: jest.fn(() => Promise.resolve('QR Code ASCII')),
}))

// Mock Zustand store
jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const state = createState(() => ({}), () => {}, {})
    return () => state
  }),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
}))

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: null,
    error: null,
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    data: null,
    error: null,
    isLoading: false,
    isError: false,
  })),
  QueryClient: jest.fn(() => ({
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  })),
  QueryClientProvider: ({ children }) => children,
}))

// File and Blob mocks
global.File = class MockFile {
  constructor(content, filename, options = {}) {
    this.content = Array.isArray(content) ? content : [content]
    this.name = filename
    this.size = this.content.reduce((acc, chunk) => acc + chunk.length, 0)
    this.type = options.type || ''
    this.lastModified = options.lastModified || Date.now()
  }
  
  text() {
    return Promise.resolve(this.content.join(''))
  }
  
  arrayBuffer() {
    const encoder = new TextEncoder()
    const data = encoder.encode(this.content.join(''))
    return Promise.resolve(data.buffer)
  }
}

global.FileReader = class MockFileReader {
  constructor() {
    this.result = null
    this.error = null
    this.readyState = 0
    this.onload = null
    this.onerror = null
    this.onabort = null
    this.onloadstart = null
    this.onloadend = null
    this.onprogress = null
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.result = file.content ? file.content.join('') : ''
      this.readyState = 2
      this.onloadstart?.({ target: this })
      this.onload?.({ target: this })
      this.onloadend?.({ target: this })
    }, 0)
  }
  
  readAsDataURL(file) {
    setTimeout(() => {
      const content = file.content ? file.content.join('') : ''
      this.result = `data:${file.type};base64,${btoa(content)}`
      this.readyState = 2
      this.onloadstart?.({ target: this })
      this.onload?.({ target: this })
      this.onloadend?.({ target: this })
    }, 0)
  }
  
  readAsArrayBuffer(file) {
    setTimeout(() => {
      const encoder = new TextEncoder()
      const content = file.content ? file.content.join('') : ''
      this.result = encoder.encode(content).buffer
      this.readyState = 2
      this.onloadstart?.({ target: this })
      this.onload?.({ target: this })
      this.onloadend?.({ target: this })
    }, 0)
  }
  
  abort() {
    this.readyState = 2
    this.onabort?.({ target: this })
  }
}

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = jest.fn()

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  const storage = {}
  
  return {
    getItem: jest.fn((key) => storage[key] || null),
    setItem: jest.fn((key, value) => {
      storage[key] = value
    }),
    removeItem: jest.fn((key) => {
      delete storage[key]
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key])
    }),
    get length() {
      return Object.keys(storage).length
    },
    key: jest.fn((index) => Object.keys(storage)[index] || null),
  }
}

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
})

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
})

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('mock clipboard text')),
  },
})

// Mock getComputedStyle
window.getComputedStyle = jest.fn(() => ({
  getPropertyValue: jest.fn(() => ''),
  width: '0px',
  height: '0px',
  fontSize: '16px',
  fontFamily: 'Arial',
}))

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
})

// Mock crypto for UUID generation
Object.defineProperty(window, 'crypto', {
  value: {
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
    randomUUID: jest.fn(() => '12345678-1234-1234-1234-123456789012'),
  },
})

// Suppress console warnings for tests
const originalError = console.error
const originalWarn = console.warn

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') ||
     args[0].includes('React.createFactory') ||
     args[0].includes('componentWillReceive') ||
     args[0].includes('act(...)'))
  ) {
    return
  }
  originalError.call(console, ...args)
}

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('deprecated') ||
     args[0].includes('Warning:'))
  ) {
    return
  }
  originalWarn.call(console, ...args)
}

// Global test utilities
global.testUtils = {
  // Wait for async operations
  waitFor: (fn, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const check = () => {
        try {
          const result = fn()
          if (result) {
            resolve(result)
          } else if (Date.now() - startTime >= timeout) {
            reject(new Error('Timeout waiting for condition'))
          } else {
            setTimeout(check, 10)
          }
        } catch (error) {
          if (Date.now() - startTime >= timeout) {
            reject(error)
          } else {
            setTimeout(check, 10)
          }
        }
      }
      check()
    })
  },
  
  // Create mock components
  createMockComponent: (type, props = {}) => ({
    id: `${type}-${Date.now()}`,
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Component`,
    x: 100,
    y: 200,
    width: 200,
    height: 100,
    properties: props,
  }),
  
  // Create mock files
  createMockFile: (content, filename, type = 'text/plain') => {
    return new File([content], filename, { type })
  },
}

// Setup complete
console.log('Jest setup complete - test environment ready')