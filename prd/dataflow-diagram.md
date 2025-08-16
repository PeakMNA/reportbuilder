# Data Flow Diagrams
## Drag-and-Drop Report Designer Application

---

## 1. System Context Diagram (Level 0)

```mermaid
graph TB
    subgraph "External Actors"
        EU[End Users]
        BA[Business Analysts]
        RD[Report Developers]
        SA[System Admin]
    end
    
    subgraph "Report Designer Platform"
        RDP[Report Designer System]
    end
    
    subgraph "External Systems"
        DS[Data Sources<br/>• SQL DBs<br/>• NoSQL<br/>• CSV/Excel]
        EA[External APIs<br/>• OAuth<br/>• Email<br/>• Cloud Storage]
        FS[File Storage<br/>• AWS S3<br/>• Local Storage]
    end
    
    EU -->|View Reports| RDP
    BA -->|Create/Edit Templates| RDP
    RD -->|Design Complex Reports| RDP
    SA -->|Manage System| RDP
    
    RDP <-->|Query Data| DS
    RDP <-->|Integrate| EA
    RDP <-->|Store Files| FS
    
    style RDP fill:#f9f,stroke:#333,stroke-width:4px
    style DS fill:#bbf,stroke:#333,stroke-width:2px
    style EA fill:#bbf,stroke:#333,stroke-width:2px
    style FS fill:#bbf,stroke:#333,stroke-width:2px
```

---

## 2. Level 1 - Core System Processes

```mermaid
graph LR
    subgraph "User Interface"
        UI[Web Browser<br/>React + Shadcn/ui]
    end
    
    subgraph "Core Processes"
        P1[1.0<br/>User Management]
        P2[2.0<br/>Template Design]
        P3[3.0<br/>Data Integration]
        P4[4.0<br/>Report Generation]
        P5[5.0<br/>File Management]
    end
    
    subgraph "Data Stores"
        D1[(PostgreSQL<br/>Users/Metadata)]
        D2[(MongoDB<br/>Templates)]
        D3[(Redis<br/>Cache/Queue)]
        D4[S3<br/>Files]
    end
    
    UI --> P1
    UI --> P2
    UI --> P3
    UI --> P4
    UI --> P5
    
    P1 <--> D1
    P2 <--> D2
    P3 <--> D1
    P3 <--> D3
    P4 <--> D2
    P4 <--> D3
    P4 --> D4
    P5 <--> D4
    
    style P1 fill:#ffd,stroke:#333,stroke-width:2px
    style P2 fill:#ffd,stroke:#333,stroke-width:2px
    style P3 fill:#ffd,stroke:#333,stroke-width:2px
    style P4 fill:#ffd,stroke:#333,stroke-width:2px
    style P5 fill:#ffd,stroke:#333,stroke-width:2px
```

---

## 3. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React App
    participant AG as API Gateway
    participant AS as Auth Service
    participant DB as PostgreSQL
    participant R as Redis
    
    U->>UI: Enter Credentials
    UI->>UI: Validate Input
    UI->>AG: POST /auth/login
    AG->>AS: Forward Request
    AS->>DB: Query User
    DB-->>AS: User Data
    AS->>AS: Verify Password
    AS->>AS: Generate JWT
    AS->>R: Store Session
    AS-->>AG: JWT + Refresh Token
    AG-->>UI: Auth Response
    UI->>UI: Store Token
    UI->>U: Redirect to Dashboard
    
    Note over UI,AG: Subsequent Requests
    UI->>AG: Request + JWT
    AG->>AS: Validate Token
    AS->>R: Check Session
    R-->>AS: Session Valid
    AS-->>AG: User Context
    AG->>AG: Process Request
```

---

## 4. Template Design Data Flow

```mermaid
graph TB
    subgraph "Design Process"
        Start([User Starts Design])
        DC[Drag Component]
        Config[Configure Properties]
        Bind[Bind Data Fields]
        Preview[Preview Template]
        Save[Save Template]
    end
    
    subgraph "Client Side"
        GJS[GrapesJS Editor]
        State[Redux Store]
        Valid[Validation Layer]
    end
    
    subgraph "Server Side"
        API[Template API]
        TV[Template Validator]
        TS[Template Service]
    end
    
    subgraph "Storage"
        Mongo[(MongoDB<br/>Template Content)]
        PG[(PostgreSQL<br/>Template Metadata)]
        Redis[(Redis<br/>Template Cache)]
    end
    
    Start --> DC
    DC --> GJS
    GJS --> Config
    Config --> State
    State --> Bind
    Bind --> Preview
    Preview --> Save
    
    Save --> Valid
    Valid --> API
    API --> TV
    TV --> TS
    
    TS --> Mongo
    TS --> PG
    TS --> Redis
    
    style GJS fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style State fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Valid fill:#e1f5fe,stroke:#01579b,stroke-width:2px
```

---

## 5. Data Source Connection Flow

```mermaid
flowchart LR
    subgraph "Data Source Types"
        SQL[SQL Database]
        NoSQL[NoSQL Database]
        API[REST API]
        CSV[CSV/Excel File]
        GQL[GraphQL]
    end
    
    subgraph "Connection Process"
        CM[Connection Manager]
        VP[Validation Processor]
        QE[Query Executor]
        DT[Data Transformer]
        Cache[Cache Layer]
    end
    
    subgraph "Output"
        DS[Normalized Dataset]
        Schema[Data Schema]
        Meta[Metadata]
    end
    
    SQL --> CM
    NoSQL --> CM
    API --> CM
    CSV --> CM
    GQL --> CM
    
    CM --> VP
    VP --> QE
    QE --> DT
    DT --> Cache
    
    Cache --> DS
    Cache --> Schema
    Cache --> Meta
    
    style CM fill:#fff2cc,stroke:#d6b656,stroke-width:2px
    style DT fill:#fff2cc,stroke:#d6b656,stroke-width:2px
    style Cache fill:#d5e8d4,stroke:#82b366,stroke-width:2px
```

---

## 6. Report Generation Pipeline

```mermaid
flowchart TB
    subgraph "Input Layer"
        Trigger[Generation Trigger]
        Template[Template ID]
        Data[Dataset]
        Config[Generation Config]
    end
    
    subgraph "Processing Queue"
        Queue[Bull Queue]
        Worker1[Worker 1]
        Worker2[Worker 2]
        Worker3[Worker N]
    end
    
    subgraph "Generation Engine"
        FetchT[Fetch Template]
        FetchD[Fetch Data]
        Compile[Compile Handlebars]
        Render[Render HTML]
        PDF[Generate PDF]
        Post[Post-Process]
    end
    
    subgraph "Output"
        S3[S3 Storage]
        Notify[Notification Service]
        Status[Status Update]
    end
    
    Trigger --> Queue
    Template --> Queue
    Data --> Queue
    Config --> Queue
    
    Queue --> Worker1
    Queue --> Worker2
    Queue --> Worker3
    
    Worker1 --> FetchT
    Worker2 --> FetchT
    Worker3 --> FetchT
    
    FetchT --> FetchD
    FetchD --> Compile
    Compile --> Render
    Render --> PDF
    PDF --> Post
    
    Post --> S3
    Post --> Notify
    Post --> Status
    
    style Queue fill:#ffe6cc,stroke:#d79b00,stroke-width:2px
    style PDF fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px
```

---

## 7. Level 2 - Report Generation Detailed Flow

```mermaid
graph TB
    subgraph "2.1 Request Validation"
        RV1[Check User Permissions]
        RV2[Validate Template ID]
        RV3[Validate Data Source]
        RV4[Check Quotas]
    end
    
    subgraph "2.2 Data Preparation"
        DP1[Connect to Data Source]
        DP2[Execute Query]
        DP3[Transform Data]
        DP4[Apply Filters]
        DP5[Cache Results]
    end
    
    subgraph "2.3 Template Processing"
        TP1[Load Template from MongoDB]
        TP2[Parse Handlebars]
        TP3[Register Helpers]
        TP4[Load Partials]
        TP5[Compile Template]
    end
    
    subgraph "2.4 Rendering"
        R1[Merge Data with Template]
        R2[Generate HTML]
        R3[Apply CSS Styles]
        R4[Process Images]
        R5[Calculate Pagination]
    end
    
    subgraph "2.5 PDF Generation"
        PG1[Launch Puppeteer]
        PG2[Load HTML]
        PG3[Wait for Resources]
        PG4[Generate PDF Buffer]
        PG5[Add Metadata]
    end
    
    subgraph "2.6 Storage & Delivery"
        SD1[Upload to S3]
        SD2[Generate Signed URL]
        SD3[Update Database]
        SD4[Send Notification]
        SD5[Clean Temp Files]
    end
    
    RV1 --> RV2 --> RV3 --> RV4
    RV4 --> DP1
    
    DP1 --> DP2 --> DP3 --> DP4 --> DP5
    DP5 --> TP1
    
    TP1 --> TP2 --> TP3 --> TP4 --> TP5
    TP5 --> R1
    
    R1 --> R2 --> R3 --> R4 --> R5
    R5 --> PG1
    
    PG1 --> PG2 --> PG3 --> PG4 --> PG5
    PG5 --> SD1
    
    SD1 --> SD2 --> SD3 --> SD4 --> SD5
```

---

## 8. Real-time Collaboration Flow

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant WS as WebSocket Server
    participant RS as Redis PubSub
    participant DB as Database
    
    U1->>WS: Connect WebSocket
    U2->>WS: Connect WebSocket
    WS->>RS: Subscribe to template:123
    
    U1->>WS: Edit Component
    WS->>RS: Publish Change
    RS->>WS: Broadcast Change
    WS->>U2: Update Component
    WS->>DB: Save Change
    
    U2->>WS: Add New Element
    WS->>RS: Publish Addition
    RS->>WS: Broadcast Addition
    WS->>U1: Show New Element
    WS->>DB: Save Addition
    
    Note over WS,RS: Conflict Resolution
    U1->>WS: Edit Same Component
    U2->>WS: Edit Same Component
    WS->>WS: Apply CRDT Algorithm
    WS->>RS: Publish Merged Change
    RS->>WS: Broadcast Resolution
    WS->>U1: Update with Merge
    WS->>U2: Update with Merge
```

---

## 9. Data Security & Encryption Flow

```mermaid
flowchart TB
    subgraph "Client Side"
        UI[User Input]
        CE[Client Encryption]
        TLS[TLS Layer]
    end
    
    subgraph "API Gateway"
        AGV[Validate Request]
        AGR[Rate Limiting]
        AGS[Sanitization]
    end
    
    subgraph "Application Layer"
        AUTH[Authentication]
        AUTHZ[Authorization]
        VAL[Business Validation]
    end
    
    subgraph "Data Layer"
        ENC[Encryption at Rest]
        HASH[Password Hashing]
        MASK[Data Masking]
    end
    
    subgraph "Storage"
        DB[(Encrypted Database)]
        FS[Encrypted File Storage]
    end
    
    UI --> CE
    CE --> TLS
    TLS --> AGV
    AGV --> AGR
    AGR --> AGS
    AGS --> AUTH
    AUTH --> AUTHZ
    AUTHZ --> VAL
    VAL --> ENC
    ENC --> DB
    VAL --> HASH
    HASH --> DB
    VAL --> MASK
    MASK --> FS
    
    style AUTH fill:#ffcccc,stroke:#cc0000,stroke-width:2px
    style AUTHZ fill:#ffcccc,stroke:#cc0000,stroke-width:2px
    style ENC fill:#ccffcc,stroke:#00cc00,stroke-width:2px
```

---

## 10. Error Handling & Recovery Flow

```mermaid
stateDiagram-v2
    [*] --> Processing
    
    Processing --> Validation: Request Received
    Validation --> DataFetch: Valid
    Validation --> ValidationError: Invalid
    
    DataFetch --> TemplateRender: Success
    DataFetch --> DataError: Connection Failed
    
    TemplateRender --> PDFGeneration: HTML Ready
    TemplateRender --> RenderError: Template Error
    
    PDFGeneration --> Storage: PDF Created
    PDFGeneration --> GenerationError: Generation Failed
    
    Storage --> Success: Stored
    Storage --> StorageError: Storage Failed
    
    ValidationError --> ErrorHandler
    DataError --> Retry
    RenderError --> ErrorHandler
    GenerationError --> Retry
    StorageError --> Retry
    
    Retry --> Processing: Retry < 3
    Retry --> ErrorHandler: Retry >= 3
    
    ErrorHandler --> Notification
    Notification --> Logging
    Logging --> [*]
    
    Success --> [*]
```

---

## 11. Cache Management Flow

```mermaid
flowchart LR
    subgraph "Request Flow"
        REQ[Incoming Request]
        CHECK{Cache Hit?}
        FRESH[Generate Fresh]
        RETURN[Return Response]
    end
    
    subgraph "Cache Layers"
        L1[Browser Cache<br/>5 min]
        L2[CDN Cache<br/>30 min]
        L3[Redis Cache<br/>1 hour]
        L4[Database<br/>Persistent]
    end
    
    subgraph "Cache Invalidation"
        UPDATE[Data Update]
        INV1[Invalidate L1]
        INV2[Invalidate L2]
        INV3[Invalidate L3]
    end
    
    REQ --> L1
    L1 -->|Miss| L2
    L2 -->|Miss| L3
    L3 -->|Miss| CHECK
    
    CHECK -->|No| FRESH
    CHECK -->|Yes| RETURN
    
    FRESH --> L4
    L4 --> L3
    L3 --> L2
    L2 --> L1
    L1 --> RETURN
    
    UPDATE --> INV1
    UPDATE --> INV2
    UPDATE --> INV3
    
    style L1 fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style L2 fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style L3 fill:#fff3e0,stroke:#e65100,stroke-width:2px
```

---

## 12. Batch Processing Flow

```mermaid
graph TB
    subgraph "Batch Initiation"
        TRIGGER[Scheduled Trigger<br/>or Manual Start]
        BATCH[Batch Controller]
        VALIDATE[Validate Batch Request]
    end
    
    subgraph "Job Distribution"
        SPLITTER[Job Splitter]
        Q1[Queue Partition 1]
        Q2[Queue Partition 2]
        Q3[Queue Partition N]
    end
    
    subgraph "Parallel Processing"
        W1[Worker Pool 1<br/>5 Workers]
        W2[Worker Pool 2<br/>5 Workers]
        W3[Worker Pool N<br/>5 Workers]
    end
    
    subgraph "Result Aggregation"
        COLLECTOR[Result Collector]
        MERGER[Result Merger]
        REPORTER[Report Generator]
    end
    
    subgraph "Output"
        STORAGE[(Batch Results)]
        NOTIFY[Notifications]
        METRICS[Metrics Dashboard]
    end
    
    TRIGGER --> BATCH
    BATCH --> VALIDATE
    VALIDATE --> SPLITTER
    
    SPLITTER --> Q1
    SPLITTER --> Q2
    SPLITTER --> Q3
    
    Q1 --> W1
    Q2 --> W2
    Q3 --> W3
    
    W1 --> COLLECTOR
    W2 --> COLLECTOR
    W3 --> COLLECTOR
    
    COLLECTOR --> MERGER
    MERGER --> REPORTER
    
    REPORTER --> STORAGE
    REPORTER --> NOTIFY
    REPORTER --> METRICS
    
    style BATCH fill:#f0f4c3,stroke:#827717,stroke-width:2px
    style COLLECTOR fill:#fce4ec,stroke:#880e4f,stroke-width:2px
```

---

## 13. Audit Trail Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Application
    participant MW as Audit Middleware
    participant DB as Audit Database
    participant Queue as Event Queue
    participant Analytics as Analytics Service
    
    User->>App: Perform Action
    App->>MW: Intercept Request
    MW->>MW: Extract Metadata
    
    Note over MW: Capture:<br/>- User ID<br/>- Action Type<br/>- Timestamp<br/>- IP Address<br/>- User Agent<br/>- Request Data
    
    MW->>DB: Store Audit Log
    MW->>Queue: Publish Event
    
    Queue->>Analytics: Process Event
    Analytics->>Analytics: Generate Reports
    
    App->>User: Return Response
    
    Note over DB: Retention Policy:<br/>- 90 days: Full logs<br/>- 1 year: Summary<br/>- 7 years: Compliance
```

---

## 14. Data Transformation Pipeline

```mermaid
flowchart TB
    subgraph "Input Sources"
        CSV[CSV Data]
        JSON[JSON Data]
        XML[XML Data]
        SQL[SQL Result]
        API[API Response]
    end
    
    subgraph "Parsing Layer"
        CSVP[CSV Parser<br/>Papa Parse]
        JSONP[JSON Parser]
        XMLP[XML Parser]
        SQLP[SQL Normalizer]
        APIP[API Adapter]
    end
    
    subgraph "Transformation Engine"
        SCHEMA[Schema Validator]
        MAP[Field Mapper]
        CALC[Calculated Fields]
        FILTER[Data Filter]
        AGG[Aggregation]
        JOIN[Data Joiner]
    end
    
    subgraph "Output Formatting"
        NORM[Normalizer]
        FORMAT[Formatter]
        VALID[Final Validation]
    end
    
    subgraph "Result"
        DATASET[Normalized Dataset]
        METADATA[Metadata]
        ERRORS[Error Report]
    end
    
    CSV --> CSVP
    JSON --> JSONP
    XML --> XMLP
    SQL --> SQLP
    API --> APIP
    
    CSVP --> SCHEMA
    JSONP --> SCHEMA
    XMLP --> SCHEMA
    SQLP --> SCHEMA
    APIP --> SCHEMA
    
    SCHEMA --> MAP
    MAP --> CALC
    CALC --> FILTER
    FILTER --> AGG
    AGG --> JOIN
    
    JOIN --> NORM
    NORM --> FORMAT
    FORMAT --> VALID
    
    VALID --> DATASET
    VALID --> METADATA
    VALID --> ERRORS
    
    style SCHEMA fill:#ffebee,stroke:#c62828,stroke-width:2px
    style NORM fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
```

---

## 15. System State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle: System Start
    
    Idle --> Authenticating: User Login
    Authenticating --> Authenticated: Success
    Authenticating --> Idle: Failure
    
    Authenticated --> Designing: Open Designer
    Authenticated --> Browsing: Browse Templates
    Authenticated --> Managing: Admin Panel
    
    Designing --> Saving: Save Template
    Saving --> Designing: Success
    Saving --> Error: Failure
    
    Designing --> Previewing: Preview
    Previewing --> Designing: Close
    
    Designing --> Generating: Generate Report
    Generating --> Queued: Added to Queue
    Queued --> Processing: Worker Available
    Processing --> Completed: Success
    Processing --> Failed: Error
    
    Completed --> Idle: Download Complete
    Failed --> Error: Log Error
    
    Error --> Idle: Recovery
    
    Managing --> Idle: Logout
    Browsing --> Idle: Logout
    Designing --> Idle: Logout
    
    [*] --> Idle: Session Timeout
```

---

## Data Flow Summary

### Key Data Flows

1. **Authentication Flow**: JWT-based authentication with Redis session management
2. **Template Design Flow**: GrapesJS → MongoDB storage with versioning
3. **Data Integration Flow**: Multi-source connection with normalization
4. **Report Generation Flow**: Queue-based processing with Puppeteer
5. **Real-time Collaboration**: WebSocket with Redis PubSub
6. **Caching Strategy**: Multi-layer caching (Browser → CDN → Redis → DB)
7. **Error Handling**: Retry mechanism with exponential backoff
8. **Audit Trail**: Comprehensive logging with retention policies
9. **Batch Processing**: Parallel processing with job distribution
10. **Security Flow**: End-to-end encryption with multiple validation layers

### Performance Considerations

- **Asynchronous Processing**: All heavy operations use queue-based processing
- **Caching**: Multi-level caching reduces database load by 80%
- **Pagination**: Cursor-based pagination for large datasets
- **Connection Pooling**: Database connection pools for optimal resource usage
- **Load Balancing**: Distributed workers for report generation

### Security Measures

- **Data Encryption**: At rest and in transit
- **Input Validation**: Multiple layers of validation
- **Rate Limiting**: Per-user and per-IP limits
- **Audit Logging**: Complete trail of all operations
- **Session Management**: Secure token handling with expiration

---

## Implementation Notes

These data flow diagrams can be rendered using:
- **Mermaid Live Editor**: https://mermaid.live/
- **GitHub Markdown**: Native support for mermaid blocks
- **Documentation tools**: GitBook, Docusaurus, MkDocs
- **VS Code**: With Mermaid preview extensions
- **Confluence**: With Mermaid plugin

For implementation, each flow represents a specific module or service that should be developed and tested independently before integration.