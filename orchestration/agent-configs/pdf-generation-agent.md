# PDF Generation Agent Configuration

## Agent Specification
- **Agent ID**: PDF Generation Agent
- **Task**: #7 - PDF generation engine
- **Worktree**: `../reportbuilder-task-7`
- **Port**: 3007
- **Branch**: `task-7-pdf-generation`
- **Persona**: `--persona-performance`

## Specialization Focus
Document generation and performance optimization with pixel-perfect PDF output matching canvas design.

## Technical Requirements

### Primary Technologies
- **PDF Generation**: jsPDF, Puppeteer, React-PDF
- **Canvas Rendering**: html2canvas, fabric.js
- **Performance**: Web Workers, streaming generation
- **Quality**: High-DPI rendering, vector graphics
- **Optimization**: Compression, caching, batch processing

### MCP Server Configuration
- **Primary**: Context7 (PDF libraries and document generation patterns)
- **Secondary**: Sequential (generation logic and optimization workflows)

### Dependencies
- `jspdf` - Core PDF generation
- `html2canvas` - Canvas-to-image conversion
- `puppeteer` - Server-side PDF rendering
- `react-pdf` - React-based PDF generation
- `pdfkit` - Advanced PDF features

### Key Files to Create/Modify
- `lib/pdf-generation/` (new PDF engine)
- `lib/renderers/` (new rendering engines)
- `components/export/pdf-export-dialog.tsx` (new)
- `workers/pdf-worker.ts` (new background processing)

## Implementation Strategy

### Phase 1: Core PDF Engine
1. **Rendering Pipeline**: Canvas → Image → PDF conversion
2. **Component Mapping**: Map React components to PDF elements
3. **Layout Engine**: Preserve exact positioning and styling
4. **Quality Control**: High-DPI rendering and vector graphics

### Phase 2: Advanced Features
1. **Multi-page Support**: Automatic page breaks and pagination
2. **Interactive Elements**: Clickable links and form fields
3. **Metadata**: Document properties and PDF/A compliance
4. **Optimization**: File size reduction and streaming

### Phase 3: Performance Optimization
1. **Background Processing**: Web Workers for heavy operations
2. **Caching**: Component rendering cache
3. **Batch Generation**: Multiple PDFs in parallel
4. **Progress Tracking**: Real-time generation status

## Acceptance Criteria
- [ ] Generated PDFs match canvas design exactly
- [ ] Support for all 11 component types
- [ ] Multi-page PDF generation
- [ ] High-quality output (300+ DPI)
- [ ] Generation time < 5 seconds for typical reports
- [ ] 100% test coverage for PDF generation logic

## Interface Contracts

### PDF Generation API
```typescript
interface PDFGenerator {
  generatePDF(config: PDFGenerationConfig): Promise<PDFResult>;
  generatePreview(config: PDFGenerationConfig): Promise<string>; // base64
  batchGenerate(configs: PDFGenerationConfig[]): Promise<PDFResult[]>;
  getProgress(jobId: string): Promise<GenerationProgress>;
}

interface PDFGenerationConfig {
  reportId: string;
  components: ComponentLayout[];
  pageSettings: PageSettings;
  quality: 'draft' | 'standard' | 'high' | 'print';
  includeMetadata: boolean;
  watermark?: WatermarkConfig;
  outputFormat: 'pdf' | 'pdf/a' | 'png' | 'jpeg';
}

interface PDFResult {
  jobId: string;
  status: 'success' | 'error' | 'cancelled';
  fileUrl?: string;
  fileSize?: number;
  pageCount?: number;
  generationTime: number;
  error?: string;
}
```

### Page Configuration
```typescript
interface PageSettings {
  size: 'A4' | 'Letter' | 'Legal' | 'A3' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  customSize?: {
    width: number;
    height: number;
    unit: 'mm' | 'in' | 'px';
  };
}

interface WatermarkConfig {
  text?: string;
  image?: string;
  opacity: number;
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  rotation?: number;
}
```

### Component Rendering
```typescript
interface ComponentRenderer {
  componentType: ComponentType;
  render(component: ComponentLayout, context: RenderContext): Promise<PDFElement>;
  getRequiredFonts(): string[];
  getRequiredAssets(): string[];
}

interface RenderContext {
  page: PDFPage;
  dpi: number;
  colorProfile: 'RGB' | 'CMYK';
  fontManager: FontManager;
  assetManager: AssetManager;
}
```

## Rendering Pipeline

### Component-Specific Renderers
```typescript
// Text Component Renderer
class TextRenderer implements ComponentRenderer {
  async render(component: TextComponent, context: RenderContext): Promise<PDFElement> {
    // Render text with proper typography
  }
}

// Chart Component Renderer  
class ChartRenderer implements ComponentRenderer {
  async render(component: ChartComponent, context: RenderContext): Promise<PDFElement> {
    // Generate chart as vector graphics
  }
}

// Table Component Renderer
class TableRenderer implements ComponentRenderer {
  async render(component: TableComponent, context: RenderContext): Promise<PDFElement> {
    // Render table with proper pagination
  }
}
```

## Performance Optimization

### Rendering Performance
- **Component Caching**: Cache rendered components for reuse
- **Incremental Generation**: Only re-render changed components
- **Vector Graphics**: Use vector formats when possible
- **Font Subsetting**: Include only used font characters

### Memory Management
- **Streaming Generation**: Process large documents in chunks
- **Resource Cleanup**: Proper disposal of rendering resources
- **Worker Isolation**: Isolate heavy operations in Web Workers
- **Memory Monitoring**: Track and optimize memory usage

### Quality vs Speed Trade-offs
```typescript
interface QualitySettings {
  draft: {
    dpi: 150;
    compression: 'high';
    vectorGraphics: false;
    fontEmbedding: 'subset';
  };
  standard: {
    dpi: 200;
    compression: 'medium';
    vectorGraphics: true;
    fontEmbedding: 'subset';
  };
  high: {
    dpi: 300;
    compression: 'low';
    vectorGraphics: true;
    fontEmbedding: 'full';
  };
  print: {
    dpi: 600;
    compression: 'none';
    vectorGraphics: true;
    fontEmbedding: 'full';
    colorProfile: 'CMYK';
  };
}
```

## Testing Requirements
- **Unit Tests**: Individual component renderers
- **Integration Tests**: Complete PDF generation workflow
- **Visual Tests**: PDF output validation against canvas
- **Performance Tests**: Generation speed and memory usage
- **Quality Tests**: DPI and visual fidelity validation

## Quality Gates
- TypeScript strict mode compliance
- ESLint zero warnings
- Jest test coverage 100%
- Visual regression tests for PDF output
- Performance benchmarks (< 5s generation time)
- Memory usage limits (< 500MB peak)

## Browser Compatibility

### Client-Side Generation
- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+
- **Fallback Support**: Server-side generation for older browsers
- **Mobile Support**: iOS Safari, Chrome Mobile
- **Performance**: Optimized for different device capabilities

### Server-Side Generation
- **Puppeteer Integration**: Headless Chrome rendering
- **Docker Support**: Containerized PDF generation
- **Scalability**: Horizontal scaling with worker queues
- **Reliability**: Error handling and retry mechanisms

---
**Agent Status**: Ready for Assignment
**Estimated Completion**: 5-7 days
**Dependencies**: Current component system, layout engine