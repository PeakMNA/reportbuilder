# Technical Documentation
## Drag-and-Drop Report Designer Platform

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Tech Stack:** React + TypeScript + Shadcn/ui + GrapesJS  

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Development Environment Setup](#3-development-environment-setup)
4. [Component Library with Shadcn/ui](#4-component-library-with-shadcnui)
5. [API Specification](#5-api-specification)
6. [Database Schema](#6-database-schema)
7. [Authentication & Security](#7-authentication--security)
8. [Report Engine Architecture](#8-report-engine-architecture)
9. [Performance Optimization](#9-performance-optimization)
10. [Testing Strategy](#10-testing-strategy)
11. [Deployment Guide](#11-deployment-guide)
12. [Monitoring & Logging](#12-monitoring--logging)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React + Shadcn/ui]
        GJS[GrapesJS Designer]
        STATE[Redux Toolkit]
    end
    
    subgraph "API Gateway"
        NGINX[Nginx]
        AUTH[Auth Service]
    end
    
    subgraph "Application Services"
        API[Node.js API]
        TEMPLATE[Template Service]
        RENDER[Render Service]
        DATA[Data Service]
    end
    
    subgraph "Infrastructure"
        REDIS[Redis Cache]
        PG[PostgreSQL]
        MONGO[MongoDB]
        S3[S3 Storage]
        QUEUE[Bull Queue]
    end
    
    UI --> NGINX
    GJS --> NGINX
    NGINX --> AUTH
    AUTH --> API
    API --> TEMPLATE
    API --> RENDER
    API --> DATA
    TEMPLATE --> MONGO
    DATA --> PG
    RENDER --> QUEUE
    QUEUE --> REDIS
    RENDER --> S3
```

### 1.2 Microservices Architecture

```yaml
services:
  api-gateway:
    type: nginx
    port: 443
    features:
      - SSL termination
      - Rate limiting
      - Load balancing
      - Request routing
  
  auth-service:
    type: node.js
    port: 3001
    database: postgresql
    features:
      - JWT authentication
      - OAuth 2.0
      - RBAC
      - Session management
  
  template-service:
    type: node.js
    port: 3002
    database: mongodb
    features:
      - Template CRUD
      - Version control
      - Sharing & permissions
      - Template marketplace
  
  render-service:
    type: node.js
    port: 3003
    dependencies:
      - puppeteer
      - handlebars
    features:
      - PDF generation
      - HTML rendering
      - Batch processing
      - Queue management
  
  data-service:
    type: node.js
    port: 3004
    databases:
      - postgresql
      - mongodb
      - redis
    features:
      - Data connectors
      - Query builder
      - Transformation pipeline
      - Caching layer
```

---

## 2. Technology Stack

### 2.1 Frontend Stack

```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.3.0",
  "ui": {
    "components": "shadcn/ui",
    "primitives": "@radix-ui",
    "styling": "tailwindcss 3.4.0",
    "icons": "lucide-react"
  },
  "state": {
    "global": "@reduxjs/toolkit 2.0.1",
    "server": "@tanstack/react-query 5.0.0",
    "forms": "react-hook-form 7.48.0",
    "validation": "zod 3.22.0"
  },
  "designer": {
    "engine": "grapesjs 0.21.0",
    "plugins": [
      "grapesjs-blocks-basic",
      "grapesjs-plugin-forms",
      "grapesjs-style-manager"
    ]
  },
  "build": {
    "bundler": "vite 5.0.0",
    "testing": "vitest 1.0.0",
    "linting": "eslint 8.56.0",
    "formatting": "prettier 3.1.0"
  }
}
```

### 2.2 Backend Stack

```json
{
  "runtime": "Node.js 20.11.0 LTS",
  "framework": "Express 4.18.2",
  "language": "TypeScript 5.3.0",
  "api": {
    "validation": "joi 17.11.0",
    "documentation": "swagger 5.0.0",
    "cors": "cors 2.8.5",
    "security": "helmet 7.1.0"
  },
  "database": {
    "postgresql": {
      "driver": "pg 8.11.0",
      "orm": "prisma 5.7.0",
      "migrations": "prisma-migrate"
    },
    "mongodb": {
      "driver": "mongodb 6.3.0",
      "odm": "mongoose 8.0.0"
    },
    "cache": "redis 4.6.0"
  },
  "reporting": {
    "templates": "handlebars 4.7.8",
    "pdf": "puppeteer 21.6.0",
    "excel": "exceljs 4.4.0",
    "queue": "bull 4.11.0"
  }
}
```

---

## 3. Development Environment Setup

### 3.1 Prerequisites Installation

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm (recommended package manager)
npm install -g pnpm

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install development tools
npm install -g tsx nodemon concurrently
```

### 3.2 Project Setup

```bash
# Clone repository
git clone https://github.com/company/report-designer.git
cd report-designer

# Install dependencies
pnpm install

# Setup Shadcn/ui
pnpm dlx shadcn-ui@latest init

# Configure Shadcn/ui (components.json)
```

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 3.3 Environment Configuration

```bash
# .env.development
NODE_ENV=development
PORT=3000
API_URL=http://localhost:4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/reportdb
MONGODB_URL=mongodb://localhost:27017/templates
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET=report-designer-assets

# Puppeteer
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 4. Component Library with Shadcn/ui

### 4.1 Core Components Setup

```bash
# Install all required Shadcn/ui components
pnpm dlx shadcn-ui@latest add alert dialog button card dropdown-menu \
  form input label select table tabs toast sheet popover command \
  context-menu navigation-menu progress skeleton avatar badge \
  calendar checkbox radio-group slider switch textarea tooltip \
  separator scroll-area collapsible accordion
```

### 4.2 Custom Report Components

```typescript
// src/components/report/ReportCanvas.tsx
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react"
import grapesjs from "grapesjs"

interface ReportCanvasProps {
  className?: string
  template?: string
  onSave?: (data: any) => void
}

export function ReportCanvas({ 
  className, 
  template,
  onSave 
}: ReportCanvasProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const editor = useRef<any>(null)

  useEffect(() => {
    if (!editorRef.current) return

    editor.current = grapesjs.init({
      container: editorRef.current,
      height: '100%',
      width: 'auto',
      plugins: ['grapesjs-blocks-basic'],
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
      },
      deviceManager: {
        devices: [
          { id: 'desktop', name: 'Desktop', width: '' },
          { id: 'tablet', name: 'Tablet', width: '768px' },
          { id: 'mobile', name: 'Mobile', width: '320px' }
        ]
      },
      panels: {
        defaults: []
      }
    })

    // Load template if provided
    if (template) {
      editor.current.setComponents(template)
    }

    return () => {
      editor.current?.destroy()
    }
  }, [template])

  return (
    <Card className={cn("h-full", className)}>
      <ScrollArea className="h-full w-full">
        <div ref={editorRef} className="min-h-[600px]" />
      </ScrollArea>
    </Card>
  )
}
```

```typescript
// src/components/report/ComponentPalette.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Type,
  Image,
  Table,
  BarChart,
  List,
  Square,
  Minus,
  QrCode,
  FileText,
  Calendar
} from "lucide-react"

const components = {
  basic: [
    { id: 'text', label: 'Text', icon: Type },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'table', label: 'Table', icon: Table },
    { id: 'list', label: 'List', icon: List },
    { id: 'shape', label: 'Shape', icon: Square },
    { id: 'line', label: 'Line', icon: Minus }
  ],
  data: [
    { id: 'chart', label: 'Chart', icon: BarChart },
    { id: 'table-dynamic', label: 'Data Table', icon: Table },
    { id: 'qrcode', label: 'QR Code', icon: QrCode }
  ],
  layout: [
    { id: 'page', label: 'Page', icon: FileText },
    { id: 'header', label: 'Header', icon: FileText },
    { id: 'footer', label: 'Footer', icon: FileText }
  ]
}

export function ComponentPalette() {
  const handleDragStart = (e: React.DragEvent, componentId: string) => {
    e.dataTransfer.setData('component', componentId)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Components</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
          
          {Object.entries(components).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 gap-2">
                  {items.map((component) => {
                    const Icon = component.icon
                    return (
                      <Button
                        key={component.id}
                        variant="outline"
                        className="h-20 flex-col gap-2 cursor-move"
                        draggable
                        onDragStart={(e) => handleDragStart(e, component.id)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-xs">{component.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
```

### 4.3 Form Components with Validation

```typescript
// src/components/forms/DataSourceForm.tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

const dataSourceSchema = z.object({
  type: z.enum(["postgresql", "mysql", "mongodb", "api", "csv"]),
  name: z.string().min(2).max(50),
  host: z.string().optional(),
  port: z.coerce.number().optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  useSSL: z.boolean().default(false),
  saveCredentials: z.boolean().default(false),
})

type DataSourceFormValues = z.infer<typeof dataSourceSchema>

export function DataSourceForm() {
  const form = useForm<DataSourceFormValues>({
    resolver: zodResolver(dataSourceSchema),
    defaultValues: {
      type: "postgresql",
      useSSL: false,
      saveCredentials: false,
    },
  })

  async function onSubmit(data: DataSourceFormValues) {
    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save data source')

      toast({
        title: "Success",
        description: "Data source connected successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to data source",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a database type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="api">REST API</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the type of data source to connect
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Connection Name</FormLabel>
              <FormControl>
                <Input placeholder="My Database" {...field} />
              </FormControl>
              <FormDescription>
                A friendly name for this connection
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input placeholder="localhost" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="5432" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="useSSL"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Use SSL Connection</FormLabel>
                <FormDescription>
                  Enable SSL for secure connection
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="button" variant="outline">
            Test Connection
          </Button>
          <Button type="submit">Save Connection</Button>
        </div>
      </form>
    </Form>
  )
}
```

### 4.4 Dashboard Components

```typescript
// src/components/dashboard/StatsCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </p>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## 5. API Specification

### 5.1 OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: Report Designer API
  version: 1.0.0
  description: API for drag-and-drop report designer platform

servers:
  - url: https://api.reportdesigner.com/v1
    description: Production server
  - url: http://localhost:4000/v1
    description: Development server

security:
  - bearerAuth: []

paths:
  /auth/login:
    post:
      tags: [Authentication]
      summary: User login
      security: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [email, password]
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  minLength: 8
      responses:
        200:
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  refreshToken:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

  /templates:
    get:
      tags: [Templates]
      summary: List templates
      parameters:
        - in: query
          name: page
          schema:
            type: integer
            default: 1
        - in: query
          name: limit
          schema:
            type: integer
            default: 20
        - in: query
          name: category
          schema:
            type: string
      responses:
        200:
          description: List of templates
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Template'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

    post:
      tags: [Templates]
      summary: Create template
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TemplateCreate'
      responses:
        201:
          description: Template created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Template'

  /templates/{id}:
    get:
      tags: [Templates]
      summary: Get template by ID
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        200:
          description: Template details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Template'

    put:
      tags: [Templates]
      summary: Update template
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TemplateUpdate'
      responses:
        200:
          description: Template updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Template'

  /reports/generate:
    post:
      tags: [Reports]
      summary: Generate report
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [templateId, format]
              properties:
                templateId:
                  type: string
                format:
                  type: string
                  enum: [pdf, html, excel, docx]
                data:
                  type: object
                async:
                  type: boolean
                  default: false
      responses:
        200:
          description: Report generated (sync)
          content:
            application/pdf:
              schema:
                type: string
                format: binary
        202:
          description: Report generation started (async)
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobId:
                    type: string
                  status:
                    type: string
                  estimatedTime:
                    type: integer

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        role:
          type: string
          enum: [admin, designer, analyst, viewer]
        createdAt:
          type: string
          format: date-time

    Template:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        category:
          type: string
        content:
          type: object
        thumbnail:
          type: string
        version:
          type: integer
        author:
          $ref: '#/components/schemas/User'
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time

    TemplateCreate:
      type: object
      required: [name, content]
      properties:
        name:
          type: string
        description:
          type: string
        category:
          type: string
        content:
          type: object
        isPublic:
          type: boolean

    TemplateUpdate:
      type: object
      properties:
        name:
          type: string
        description:
          type: string
        content:
          type: object
        isPublic:
          type: boolean

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        pages:
          type: integer

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### 5.2 API Implementation Examples

```typescript
// src/api/controllers/template.controller.ts
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { Redis } from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis()

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  category: z.string().optional(),
  content: z.object({
    html: z.string(),
    css: z.string().optional(),
    components: z.array(z.any()),
    styles: z.array(z.any()),
  }),
  isPublic: z.boolean().default(false),
})

export class TemplateController {
  async create(req: Request, res: Response) {
    try {
      const validatedData = createTemplateSchema.parse(req.body)
      const userId = req.user?.id

      const template = await prisma.template.create({
        data: {
          ...validatedData,
          authorId: userId,
          version: 1,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Invalidate cache
      await redis.del('templates:list:*')

      res.status(201).json({
        success: true,
        data: template,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors,
        })
      } else {
        res.status(500).json({
          success: false,
          message: 'Internal server error',
        })
      }
    }
  }

  async list(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const category = req.query.category as string

      const cacheKey = `templates:list:${page}:${limit}:${category || 'all'}`
      const cached = await redis.get(cacheKey)

      if (cached) {
        return res.json(JSON.parse(cached))
      }

      const where = category ? { category } : {}
      const skip = (page - 1) * limit

      const [templates, total] = await Promise.all([
        prisma.template.findMany({
          where,
          skip,
          take: limit,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.template.count({ where }),
      ])

      const response = {
        success: true,
        data: templates,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }

      // Cache for 5 minutes
      await redis.setex(cacheKey, 300, JSON.stringify(response))

      res.json(response)
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      })
    }
  }
}
```

---

## 6. Database Schema

### 6.1 PostgreSQL Schema (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  password       String
  name           String
  role           Role      @default(VIEWER)
  avatar         String?
  emailVerified  Boolean   @default(false)
  twoFactorEnabled Boolean @default(false)
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  lastLoginAt    DateTime?
  
  templates      Template[]
  reports        Report[]
  dataSources    DataSource[]
  teamMembers    TeamMember[]
  auditLogs      AuditLog[]
  
  @@index([email])
  @@index([role])
}

enum Role {
  ADMIN
  DESIGNER
  ANALYST
  VIEWER
}

model Template {
  id            String   @id @default(cuid())
  name          String
  description   String?
  category      String?
  content       Json
  thumbnail     String?
  version       Int      @default(1)
  isPublic      Boolean  @default(false)
  isDeleted     Boolean  @default(false)
  
  authorId      String
  author        User     @relation(fields: [authorId], references: [id])
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  reports       Report[]
  versions      TemplateVersion[]
  shares        TemplateShare[]
  
  @@index([authorId])
  @@index([category])
  @@index([isPublic])
  @@index([name])
}

model TemplateVersion {
  id           String    @id @default(cuid())
  templateId   String
  template     Template  @relation(fields: [templateId], references: [id])
  version      Int
  content      Json
  changeLog    String?
  createdAt    DateTime  @default(now())
  
  @@unique([templateId, version])
  @@index([templateId])
}

model Report {
  id           String    @id @default(cuid())
  name         String
  templateId   String
  template     Template  @relation(fields: [templateId], references: [id])
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  
  status       ReportStatus @default(PENDING)
  format       ReportFormat
  data         Json?
  fileUrl      String?
  error        String?
  
  generatedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@index([userId])
  @@index([templateId])
  @@index([status])
  @@index([createdAt])
}

enum ReportStatus {
  PENDING
  GENERATING
  COMPLETED
  FAILED
}

enum ReportFormat {
  PDF
  HTML
  EXCEL
  DOCX
}

model DataSource {
  id           String    @id @default(cuid())
  name         String
  type         DataSourceType
  config       Json
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  
  isActive     Boolean   @default(true)
  lastTestAt   DateTime?
  lastTestSuccess Boolean?
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  queries      Query[]
  
  @@index([userId])
  @@index([type])
}

enum DataSourceType {
  POSTGRESQL
  MYSQL
  MONGODB
  REST_API
  GRAPHQL
  CSV
  EXCEL
}

model Query {
  id           String    @id @default(cuid())
  name         String
  dataSourceId String
  dataSource   DataSource @relation(fields: [dataSourceId], references: [id])
  
  query        String
  parameters   Json?
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  @@index([dataSourceId])
}

model Team {
  id           String    @id @default(cuid())
  name         String
  description  String?
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  members      TeamMember[]
}

model TeamMember {
  id           String    @id @default(cuid())
  teamId       String
  team         Team      @relation(fields: [teamId], references: [id])
  userId       String
  user         User      @relation(fields: [userId], references: [id])
  role         TeamRole
  
  joinedAt     DateTime  @default(now())
  
  @@unique([teamId, userId])
  @@index([teamId])
  @@index([userId])
}

enum TeamRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model AuditLog {
  id           String    @id @default(cuid())
  userId       String?
  user         User?     @relation(fields: [userId], references: [id])
  
  action       String
  entity       String
  entityId     String?
  metadata     Json?
  ipAddress    String?
  userAgent    String?
  
  createdAt    DateTime  @default(now())
  
  @@index([userId])
  @@index([entity])
  @@index([action])
  @@index([createdAt])
}

model TemplateShare {
  id           String    @id @default(cuid())
  templateId   String
  template     Template  @relation(fields: [templateId], references: [id])
  
  sharedWith   String?   // Email or team ID
  permission   SharePermission
  expiresAt    DateTime?
  
  createdAt    DateTime  @default(now())
  
  @@index([templateId])
  @@index([sharedWith])
}

enum SharePermission {
  VIEW
  USE
  EDIT
}
```

### 6.2 MongoDB Schema

```typescript
// src/models/mongodb/template-content.model.ts
import { Schema, model } from 'mongoose'

const ComponentSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  content: Schema.Types.Mixed,
  props: Schema.Types.Mixed,
  style: Schema.Types.Mixed,
  data: Schema.Types.Mixed,
  children: [{ type: Schema.Types.Mixed }],
})

const TemplateContentSchema = new Schema({
  templateId: { type: String, required: true, index: true },
  version: { type: Number, default: 1 },
  
  // GrapesJS data
  assets: [Schema.Types.Mixed],
  components: [ComponentSchema],
  css: { type: String },
  html: { type: String },
  styles: [Schema.Types.Mixed],
  
  // Handlebars template
  handlebarsTemplate: { type: String },
  helpers: [{ 
    name: String, 
    function: String 
  }],
  partials: [{
    name: String,
    template: String
  }],
  
  // Data mapping
  dataBindings: [{
    componentId: String,
    dataPath: String,
    transformFunction: String,
  }],
  
  // Page settings
  pageSettings: {
    size: { type: String, default: 'A4' },
    orientation: { type: String, default: 'portrait' },
    margins: {
      top: { type: Number, default: 20 },
      right: { type: Number, default: 20 },
      bottom: { type: Number, default: 20 },
      left: { type: Number, default: 20 },
    },
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export const TemplateContent = model('TemplateContent', TemplateContentSchema)
```

---

## 7. Authentication & Security

### 7.1 JWT Authentication Implementation

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'

const prisma = new PrismaClient()
const redis = new Redis()

interface JWTPayload {
  userId: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    // Check if token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${token}`)
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      })
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      })
    }

    next()
  }
}
```

### 7.2 Security Configuration

```typescript
// src/config/security.config.ts
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import { Application } from 'express'

export function configureSecurity(app: Application) {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }))

  // CORS configuration
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
  })

  app.use('/api', limiter)

  // Stricter rate limit for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
  })

  app.use('/api/auth', authLimiter)

  // MongoDB injection prevention
  app.use(mongoSanitize())

  // Request size limits
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
}
```

---

## 8. Report Engine Architecture

### 8.1 PDF Generation Service

```typescript
// src/services/pdf-generator.service.ts
import puppeteer, { Browser, Page } from 'puppeteer'
import Handlebars from 'handlebars'
import { Redis } from 'ioredis'
import Bull from 'bull'
import AWS from 'aws-sdk'
import fs from 'fs/promises'
import path from 'path'

const redis = new Redis()
const s3 = new AWS.S3()

export class PDFGeneratorService {
  private browser: Browser | null = null
  private queue: Bull.Queue

  constructor() {
    this.queue = new Bull('pdf-generation', {
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    })

    this.initializeQueue()
  }

  private async initializeQueue() {
    this.queue.process(5, async (job) => {
      return this.processPDFJob(job.data)
    })

    this.queue.on('completed', (job, result) => {
      console.log(`PDF generation completed: ${job.id}`)
    })

    this.queue.on('failed', (job, err) => {
      console.error(`PDF generation failed: ${job.id}`, err)
    })
  }

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      })
    }
    return this.browser
  }

  async generatePDF(options: {
    template: string
    data: any
    settings?: {
      format?: 'A4' | 'Letter' | 'Legal'
      landscape?: boolean
      margin?: {
        top?: string
        right?: string
        bottom?: string
        left?: string
      }
      headerTemplate?: string
      footerTemplate?: string
      displayHeaderFooter?: boolean
    }
  }): Promise<Buffer> {
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    try {
      // Compile template
      const compiledTemplate = Handlebars.compile(options.template)
      const html = compiledTemplate(options.data)

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 })

      // Load HTML
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      })

      // Wait for any async content
      await page.evaluateHandle('document.fonts.ready')

      // Generate PDF
      const pdf = await page.pdf({
        format: options.settings?.format || 'A4',
        landscape: options.settings?.landscape || false,
        printBackground: true,
        margin: options.settings?.margin || {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: options.settings?.displayHeaderFooter || false,
        headerTemplate: options.settings?.headerTemplate,
        footerTemplate: options.settings?.footerTemplate,
      })

      return pdf
    } finally {
      await page.close()
    }
  }

  async processPDFJob(jobData: {
    reportId: string
    templateId: string
    data: any
    userId: string
  }) {
    try {
      // Get template from database
      const template = await this.getTemplate(jobData.templateId)
      
      // Generate PDF
      const pdf = await this.generatePDF({
        template: template.content,
        data: jobData.data,
      })

      // Upload to S3
      const fileKey = `reports/${jobData.userId}/${jobData.reportId}.pdf`
      await s3.putObject({
        Bucket: process.env.S3_BUCKET!,
        Key: fileKey,
        Body: pdf,
        ContentType: 'application/pdf',
      }).promise()

      // Update report status in database
      await this.updateReportStatus(jobData.reportId, 'COMPLETED', fileKey)

      return { success: true, fileKey }
    } catch (error) {
      await this.updateReportStatus(jobData.reportId, 'FAILED', null, error)
      throw error
    }
  }

  async addToQueue(jobData: any) {
    return this.queue.add(jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    })
  }

  private async getTemplate(templateId: string) {
    // Implementation to fetch template from database
    // This is a placeholder
    return {
      content: '<html><body>{{data}}</body></html>',
    }
  }

  private async updateReportStatus(
    reportId: string,
    status: string,
    fileUrl: string | null,
    error?: any
  ) {
    // Implementation to update report status in database
    // This is a placeholder
  }
}
```

### 8.2 Handlebars Helpers

```typescript
// src/helpers/handlebars.helpers.ts
import Handlebars from 'handlebars'
import moment from 'moment'
import numeral from 'numeral'

// Date formatting
Handlebars.registerHelper('formatDate', (date: any, format: string) => {
  return moment(date).format(format || 'YYYY-MM-DD')
})

// Number formatting
Handlebars.registerHelper('formatNumber', (number: any, format: string) => {
  return numeral(number).format(format || '0,0.00')
})

// Currency formatting
Handlebars.registerHelper('formatCurrency', (amount: any, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
})

// Conditional helpers
Handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this)
})

Handlebars.registerHelper('ifGreater', function(arg1: any, arg2: any, options: any) {
  return arg1 > arg2 ? options.fn(this) : options.inverse(this)
})

// Array helpers
Handlebars.registerHelper('length', (array: any[]) => {
  return Array.isArray(array) ? array.length : 0
})

Handlebars.registerHelper('sum', (array: any[], property?: string) => {
  if (!Array.isArray(array)) return 0
  
  if (property) {
    return array.reduce((sum, item) => sum + (item[property] || 0), 0)
  }
  
  return array.reduce((sum, item) => sum + item, 0)
})

// String helpers
Handlebars.registerHelper('truncate', (str: string, length: number) => {
  if (!str || str.length <= length) return str
  return str.substring(0, length) + '...'
})

Handlebars.registerHelper('uppercase', (str: string) => {
  return str ? str.toUpperCase() : ''
})

Handlebars.registerHelper('lowercase', (str: string) => {
  return str ? str.toLowerCase() : ''
})

// Chart data helper
Handlebars.registerHelper('chartData', (data: any[], labelField: string, valueField: string) => {
  const labels = data.map(item => item[labelField])
  const values = data.map(item => item[valueField])
  
  return JSON.stringify({
    labels,
    datasets: [{
      data: values,
    }],
  })
})

// Pagination helper
Handlebars.registerHelper('paginate', function(context: any[], options: any) {
  const page = options.hash.page || 1
  const perPage = options.hash.perPage || 10
  const start = (page - 1) * perPage
  const end = start + perPage
  
  return context.slice(start, end).map((item: any) => options.fn(item)).join('')
})
```

---

## 9. Performance Optimization

### 9.1 Caching Strategy

```typescript
// src/utils/cache.util.ts
import { Redis } from 'ioredis'
import { createHash } from 'crypto'

export class CacheManager {
  private redis: Redis
  private defaultTTL: number = 300 // 5 minutes

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
    })
  }

  private generateKey(prefix: string, params: any): string {
    const hash = createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex')
    return `${prefix}:${hash}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value)
      if (ttl || this.defaultTTL) {
        await this.redis.setex(key, ttl || this.defaultTTL, serialized)
      } else {
        await this.redis.set(key, serialized)
      }
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error('Cache invalidation error:', error)
    }
  }

  async remember<T>(
    key: string,
    ttl: number,
    callback: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const fresh = await callback()
    await this.set(key, fresh, ttl)
    return fresh
  }
}

// Usage example with decorator
export function Cacheable(prefix: string, ttl: number = 300) {
  const cache = new CacheManager()

  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const key = cache.generateKey(`${prefix}:${propertyName}`, args)
      
      return cache.remember(key, ttl, async () => {
        return method.apply(this, args)
      })
    }

    return descriptor
  }
}
```

### 9.2 Database Query Optimization

```typescript
// src/utils/database.optimization.ts
import { PrismaClient } from '@prisma/client'

export class OptimizedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'error', 'warn']
        : ['error'],
    })
  }

  // Batch operations for better performance
  async batchCreate<T>(model: any, data: T[], chunkSize: number = 100) {
    const results = []
    
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize)
      const created = await model.createMany({
        data: chunk,
        skipDuplicates: true,
      })
      results.push(created)
    }
    
    return results
  }

  // Cursor-based pagination
  async paginate<T>(
    model: any,
    options: {
      take: number
      cursor?: string
      where?: any
      orderBy?: any
    }
  ) {
    const { take, cursor, where, orderBy } = options
    
    const results = await model.findMany({
      take: take + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      where,
      orderBy: orderBy || { createdAt: 'desc' },
    })

    const hasNextPage = results.length > take
    const items = hasNextPage ? results.slice(0, -1) : results
    const nextCursor = hasNextPage ? items[items.length - 1].id : null

    return {
      items,
      nextCursor,
      hasNextPage,
    }
  }
}
```

---

## 10. Testing Strategy

### 10.1 Unit Testing

```typescript
// src/tests/unit/template.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TemplateService } from '@/services/template.service'
import { PrismaClient } from '@prisma/client'

vi.mock('@prisma/client')

describe('TemplateService', () => {
  let service: TemplateService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = {
      template: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    }
    
    service = new TemplateService(mockPrisma)
  })

  describe('createTemplate', () => {
    it('should create a new template', async () => {
      const templateData = {
        name: 'Test Template',
        content: { html: '<div>Test</div>' },
        authorId: 'user123',
      }

      const expectedTemplate = {
        id: 'template123',
        ...templateData,
        createdAt: new Date(),
      }

      mockPrisma.template.create.mockResolvedValue(expectedTemplate)

      const result = await service.createTemplate(templateData)

      expect(mockPrisma.template.create).toHaveBeenCalledWith({
        data: templateData,
        include: { author: true },
      })
      expect(result).toEqual(expectedTemplate)
    })

    it('should throw error for invalid template data', async () => {
      const invalidData = {
        name: '', // Empty name
        content: {},
      }

      await expect(service.createTemplate(invalidData))
        .rejects
        .toThrow('Invalid template data')
    })
  })

  describe('getTemplates', () => {
    it('should return paginated templates', async () => {
      const mockTemplates = [
        { id: '1', name: 'Template 1' },
        { id: '2', name: 'Template 2' },
      ]

      mockPrisma.template.findMany.mockResolvedValue(mockTemplates)
      mockPrisma.template.count.mockResolvedValue(10)

      const result = await service.getTemplates({ page: 1, limit: 2 })

      expect(result).toEqual({
        data: mockTemplates,
        pagination: {
          page: 1,
          limit: 2,
          total: 10,
          pages: 5,
        },
      })
    })
  })
})
```

### 10.2 Integration Testing

```typescript
// src/tests/integration/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('API Integration Tests', () => {
  let authToken: string
  let testUserId: string

  beforeAll(async () => {
    // Setup test database
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        role: 'DESIGNER',
      },
    })
    
    testUserId = user.id

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      })
    
    authToken = loginResponse.body.token
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  describe('POST /api/templates', () => {
    it('should create a new template', async () => {
      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Test Template',
          description: 'Test description',
          content: {
            html: '<div>Test</div>',
            components: [],
          },
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.name).toBe('Integration Test Template')
    })

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({
          name: 'Unauthorized Template',
        })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('GET /api/templates', () => {
    it('should list templates with pagination', async () => {
      const response = await request(app)
        .get('/api/templates?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeInstanceOf(Array)
      expect(response.body.pagination).toBeDefined()
    })
  })
})
```

### 10.3 E2E Testing

```typescript
// src/tests/e2e/report-generation.e2e.ts
import { test, expect } from '@playwright/test'

test.describe('Report Generation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Login
    await page.fill('[data-testid=email-input]', 'test@example.com')
    await page.fill('[data-testid=password-input]', 'password123')
    await page.click('[data-testid=login-button]')
    
    await expect(page).toHaveURL('http://localhost:3000/dashboard')
  })

  test('should create and generate a report', async ({ page }) => {
    // Navigate to designer
    await page.click('[data-testid=new-report-button]')
    await expect(page).toHaveURL(/.*\/designer/)

    // Add components
    await page.dragAndDrop(
      '[data-testid=component-text]',
      '[data-testid=canvas]'
    )

    // Add content
    await page.fill('[data-testid=text-content]', 'Test Report Title')

    // Save template
    await page.click('[data-testid=save-button]')
    await page.fill('[data-testid=template-name]', 'E2E Test Template')
    await page.click('[data-testid=confirm-save]')

    // Generate PDF
    await page.click('[data-testid=generate-pdf]')
    
    // Wait for generation
    await expect(page.locator('[data-testid=pdf-preview]')).toBeVisible({
      timeout: 10000,
    })

    // Verify PDF is displayed
    const pdfFrame = page.frameLocator('[data-testid=pdf-preview]')
    await expect(pdfFrame.locator('text=Test Report Title')).toBeVisible()
  })
})
```

---

## 11. Deployment Guide

### 11.1 Docker Configuration

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build application
RUN pnpm build

# Production image
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install Chromium for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production

EXPOSE 4000

CMD ["node", "dist/index.js"]
```

### 11.2 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:password@postgres:5432/reportdb
      MONGODB_URL: mongodb://mongodb:27017/templates
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - mongodb
      - redis
    volumes:
      - ./uploads:/app/uploads
    networks:
      - report-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: reportdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - report-network

  mongodb:
    image: mongo:6
    volumes:
      - mongo_data:/data/db
    networks:
      - report-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - report-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - report-network

volumes:
  postgres_data:
  mongo_data:
  redis_data:

networks:
  report-network:
    driver: bridge
```

### 11.3 Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: report-designer-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: report-designer-api
  template:
    metadata:
      labels:
        app: report-designer-api
    spec:
      containers:
      - name: api
        image: report-designer/api:latest
        ports:
        - containerPort: 4000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 4000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: report-designer-api-service
  namespace: production
spec:
  selector:
    app: report-designer-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 4000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: report-designer-api-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: report-designer-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## 12. Monitoring & Logging

### 12.1 Monitoring Setup

```typescript
// src/monitoring/prometheus.ts
import { register, Counter, Histogram, Gauge } from 'prom-client'
import { Application } from 'express'

export function setupMonitoring(app: Application) {
  // Metrics
  const httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
  })

  const httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  })

  const activeConnections = new Gauge({
    name: 'active_connections',
    help: 'Number of active connections',
  })

  const pdfGenerationDuration = new Histogram({
    name: 'pdf_generation_duration_seconds',
    help: 'Duration of PDF generation in seconds',
    labelNames: ['template_id', 'status'],
    buckets: [1, 2, 5, 10, 30, 60],
  })

  const pdfGenerationTotal = new Counter({
    name: 'pdf_generation_total',
    help: 'Total number of PDF generations',
    labelNames: ['template_id', 'status'],
  })

  // Middleware to track metrics
  app.use((req, res, next) => {
    const start = Date.now()
    
    activeConnections.inc()

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000
      const route = req.route?.path || 'unknown'
      
      httpRequestDuration
        .labels(req.method, route, res.statusCode.toString())
        .observe(duration)
      
      httpRequestTotal
        .labels(req.method, route, res.statusCode.toString())
        .inc()
      
      activeConnections.dec()
    })

    next()
  })

  // Metrics endpoint
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  })

  return {
    httpRequestDuration,
    httpRequestTotal,
    activeConnections,
    pdfGenerationDuration,
    pdfGenerationTotal,
  }
}
```

### 12.2 Logging Configuration

```typescript
// src/utils/logger.ts
import winston from 'winston'
import { ElasticsearchTransport } from 'winston-elasticsearch'

const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  },
  index: 'report-designer-logs',
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'report-designer',
    environment: process.env.NODE_ENV,
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    
    // File transport
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
    
    // Elasticsearch transport for production
    ...(process.env.NODE_ENV === 'production'
      ? [new ElasticsearchTransport(esTransportOpts)]
      : []),
  ],
})

// Create a stream object for Morgan middleware
export const stream = {
  write: (message: string) => {
    logger.info(message.trim())
  },
}
```

---

## Conclusion

This technical documentation provides a comprehensive guide for implementing the drag-and-drop report designer platform using modern technologies with Shadcn/ui as the UI framework. The architecture is designed for scalability, maintainability, and performance, with clear separation of concerns and industry best practices.

Key technical highlights:
- **Shadcn/ui** for modern, accessible UI components
- **GrapesJS** for drag-and-drop functionality
- **Microservices architecture** for scalability
- **Queue-based PDF generation** for performance
- **Comprehensive testing strategy**
- **Production-ready deployment configurations**
- **Monitoring and logging** for observability

The system is designed to handle enterprise-scale operations while maintaining developer productivity and code quality.