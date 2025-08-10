# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The "Blue Whale Portal" system is a modern B2B supply chain management platform designed for agricultural cooperatives. It facilitates the procurement, inventory management, and distribution of packaging materials (boxes, trays, plastic films, etc.) across a network of cooperative stations. The system consists of a NestJS backend API and an Angular 18 frontend application built with modern best practices and performance optimizations.

## Architecture

### Backend (NestJS)
- **NestJS** framework with modular architecture
- **TypeORM** for database abstraction and migrations
- **PostgreSQL** as primary database
- **JWT** authentication with Passport.js
- **Class-validator** for DTO validation
- **MinIO** for file storage (documents, PDFs, images)
- **Swagger/OpenAPI** documentation
- **Custom decorators** for authentication and roles
- **Service layer pattern** for business logic
- **Entity-based architecture** with TypeORM

### Frontend (Angular 18)
- **Angular 18** with standalone components
- **Angular Router** for navigation with guards
- **RxJS** for reactive programming
- **Tailwind CSS** for styling with custom design system
- **Lucide Angular** for icons
- **Transloco** for internationalization (i18n)
- **Angular Signals** for state management
- **Reactive Forms** for form handling
- **Custom UI components** library
- **Strategy pattern** for role-based navigation
- **Interceptors** for auth, error handling, and loading states

### Key Business Entities

#### 1. **Platforms** (Warehouses/Distribution Centers)
- Warehouses that provide storage and expedition services
- Strategic locations to reduce delivery delays
- Stock and expedite products for faster distribution
- Business contacts management
- Platform fees handled externally by Blue Whale

#### 2. **Stations** (Agricultural Cooperatives)
- Physical locations with inventory management
- Can place orders and request inter-station transfers
- Grouped by StationGroups for organization
- Contact management with primary contact designation
- **Important**: Station contacts are permanently deleted (no soft delete)

#### 3. **Suppliers** (Fournisseurs)
- External suppliers with multiple sites
- SIRET-registered businesses
- Maintain product catalogs with site-specific stock levels
- Business contacts management

#### 4. **Products** (Articles)
- Packaging materials with categories from enum
- Many-to-many supplier relationships with pricing
- Supplier-specific references and documentation
- Stock tracking per location

#### 5. **Global Orders** (Commandes Globales/Master Orders)
- Master/Umbrella orders created from shopping cart validation
- Groups multiple supplier orders for unified customer tracking
- Contains overall order information: total amounts, customer details, status
- Parent order in order hierarchy (standard ERP pattern)
- Enables consolidated reporting and customer communication

#### 6. **Purchase Orders** (Commandes d'Achat/Child Orders)
- Purchase Orders created by stations or Blue Whale
- Child orders that belong to a Global Order (when created from shopping cart)
- Two types: External (to suppliers) and Internal (stations to Blue Whale)
- Flexible delivery options: Platform, Station, or custom address
- Individual supplier workflows while maintaining parent order tracking
- Support for partial deliveries and approvals
- Links to corresponding Sales Orders when applicable

#### 7. **Sales Orders** (Commandes de Vente)
- Sales Orders created by Blue Whale when selling to stations
- Generated in response to station Purchase Orders
- Platform-based fulfillment and shipping
- Complete invoice and payment tracking
- Product-level fulfillment status
- Platform fees and tax calculations
- Links back to originating Purchase Orders

#### 8. **Stock Management**
- **StockStation**: Real-time inventory at stations
- **StockSupplier**: Inventory at supplier sites
- **StockPlatform**: Platform-level inventory (Blue Whale owned)
- Point-in-time snapshots with audit trails

#### 9. **Transfer Requests** (Demandes de Transfert)
- Inter-station stock movements
- Multi-step approval workflow
- Transfer-Product relationship for items

#### 10. **Shopping Carts** (Listes d'Achat)
- Temporary order preparation workspace for customers
- Products selected with specific supplier and packaging options
- Same product can be added from different suppliers with different conditions
- Cart validation creates Master Order and groups products by supplier
- Generates one Master Order containing multiple Purchase Orders

#### 11. **Supplier Contracts** (Contrats Fournisseurs)
- Framework agreements negotiated by Blue Whale
- Volume-based pricing tiers
- Terms and conditions for deliveries
- Payment terms and commercial conditions
- Valid date ranges and renewal terms

#### 12. **Forecasts** (Prévisions)
- Demand forecasting by campaign
- Per product, per supplier projections
- Volume aggregation for contract negotiations

#### 13. **Document Management System**
- Comprehensive document storage and access control
- Integration with MinIO for scalable file storage
- Role-based access control with granular permissions
- Automated document lifecycle management
- Three main document categories:
  - **Product Images**: Visual assets for catalog display
  - **Certifications**: Compliance documents for platforms, suppliers, and stations
  - **Generated Documents**: System-generated business documents (orders, invoices, reports)

## Document Management Architecture

### Document Categories and Storage Strategy

#### 1. **Product Images** (Visual Assets)
- **Purpose**: Product catalog visuals for customer browsing
- **Scope**: One image per product-supplier combination
- **Storage**: `product-images` bucket (publicly accessible)
- **Access**: Public read access for catalog integration
- **File Types**: JPEG, PNG, WebP, GIF
- **Size Limit**: 10MB per image
- **Naming**: `products/{productId}/suppliers/{supplierId}/image_{timestamp}.{ext}`

#### 2. **Certification Documents** (Compliance)
- **Purpose**: Legal and compliance documentation
- **Entities**: Platforms, Suppliers, Stations
- **Storage**: `certifications` bucket (restricted access)
- **Types**: Quality certificates, safety certificates, compliance reports
- **File Types**: PDF, JPEG, PNG
- **Access Control**: Role-based with expiration dates
- **Naming**: `{entityType}/{entityId}/certifications/{certificateType}_{timestamp}.pdf`

#### 3. **Product-Level Certifications** (Product Compliance)
- **Purpose**: Product-specific certification documents per supplier
- **Scope**: One or more certificates per product-supplier combination
- **Storage**: `product-certifications` bucket (restricted access)
- **Types**: Product quality certificates, safety certificates, compliance certificates, specification sheets, material certificates, test reports
- **File Types**: PDF, JPEG, PNG
- **Access Control**: Supplier and customer access with expiration tracking
- **Naming**: `products/{productId}/suppliers/{supplierId}/certifications/{certificateType}_{timestamp}.pdf`

#### 4. **Discrepancy Photos** (Quality Control)
- **Purpose**: Visual documentation of delivery and product issues
- **Scope**: Multiple photos per incident for thorough documentation
- **Storage**: `discrepancies` bucket (urgent attention required)
- **Types**: 
  - **Delivery-time**: Delivery discrepancies, product quality issues, damage reports, non-conformity photos
  - **Post-delivery**: Damage, quality issues, missing items, wrong items, contamination, spoilage, customer complaints
- **File Types**: JPEG, PNG, WebP (images only)
- **Access Control**: Restricted access with urgent notification workflows
- **Naming**: `{entityType}/{entityId}/discrepancies/{discrepancyType}/{photo}_{timestamp}.jpg`

#### 5. **Generated Business Documents** (Process Outputs)
- **Purpose**: System-generated transactional documents
- **Types**: Purchase orders, sales orders, invoices, delivery notes, packing lists
- **Storage**: `documents` bucket (internal access)
- **Format**: PDF (generated from templates)
- **Lifecycle**: Created during business processes, archived after completion
- **Naming**: `{entityType}/{entityId}/{documentType}/{year}/{month}/doc_{timestamp}.pdf`

#### 6. **Reports and Analytics** (Business Intelligence)
- **Purpose**: Management reports and data exports
- **Types**: Stock reports, sales reports, platform performance reports
- **Storage**: `reports` bucket (time-limited access)
- **Formats**: PDF, Excel, CSV
- **Retention**: Automatic cleanup after 90 days
- **Naming**: `reports/{year}/{month}/{reportType}_{timestamp}.{ext}`

### MinIO Storage Structure

```
Buckets:
├── product-images/          # Public bucket for product visuals
│   └── products/
│       └── {productId}/
│           └── suppliers/
│               └── {supplierId}/
│                   └── image_{timestamp}.jpg
│
├── certifications/          # Private bucket for entity compliance docs
│   └── {entityType}/        # platform|supplier|station
│       └── {entityId}/
│           └── certifications/
│               ├── quality_{timestamp}.pdf
│               ├── safety_{timestamp}.pdf
│               └── compliance_{timestamp}.pdf
│
├── product-certifications/ # Private bucket for product-level certs
│   └── products/
│       └── {productId}/
│           └── suppliers/
│               └── {supplierId}/
│                   └── certifications/
│                       ├── quality_{timestamp}.pdf
│                       ├── safety_{timestamp}.pdf
│                       ├── compliance_{timestamp}.pdf
│                       ├── specification_{timestamp}.pdf
│                       ├── material_{timestamp}.pdf
│                       └── test_report_{timestamp}.pdf
│
├── discrepancies/          # Urgent bucket for quality issues
│   └── {entityType}/       # delivery|order_product|purchase_order
│       └── {entityId}/
│           └── discrepancies/
│               ├── delivery/                    # Delivery-time issues
│               │   └── issue_{timestamp}.jpg
│               ├── quality/
│               │   └── problem_{timestamp}.jpg
│               ├── damage/
│               │   └── damage_{timestamp}.jpg
│               ├── non-conformity/
│               │   └── nonconf_{timestamp}.jpg
│               ├── post-delivery-damage/       # Post-delivery issues
│               │   └── damage_{timestamp}.jpg
│               ├── post-delivery-quality/
│               │   └── quality_{timestamp}.jpg
│               ├── post-delivery-missing/
│               │   └── missing_{timestamp}.jpg
│               ├── post-delivery-wrong-items/
│               │   └── wrong_{timestamp}.jpg
│               ├── post-delivery-contamination/
│               │   └── contamination_{timestamp}.jpg
│               ├── post-delivery-spoilage/
│               │   └── spoilage_{timestamp}.jpg
│               └── customer-complaint/
│                   └── complaint_{timestamp}.jpg
│
├── documents/              # Private bucket for business docs
│   └── {entityType}/
│       └── {entityId}/
│           └── {documentType}/
│               └── {year}/
│                   └── {month}/
│                       └── doc_{timestamp}.pdf
│
├── reports/               # Time-limited bucket for reports
│   └── {year}/
│       └── {month}/
│           ├── stock_report_{timestamp}.pdf
│           ├── sales_report_{timestamp}.xlsx
│           └── platform_report_{timestamp}.pdf
│
└── temp/                  # Temporary uploads (24h retention)
    └── {userId}/
        └── upload_{timestamp}.tmp
```

### Document Access Control System

#### Access Types
- **READ**: View and download document
- **WRITE**: Modify document metadata
- **DELETE**: Remove document from system
- **ADMIN**: Full control including access management

#### Entity-Based Permissions
- **USER**: Individual user access
- **STATION**: All users belonging to a station
- **SUPPLIER**: All users belonging to a supplier
- **PLATFORM**: All users belonging to a platform
- **ROLE**: Role-based access (admin, manager, user, viewer)

#### Access Constraints
```typescript
{
  allowedIPs?: string[];           // IP address restrictions
  accessHoursStart?: string;       // "09:00" - time-based access
  accessHoursEnd?: string;         // "18:00" - time-based access
  maxDownloads?: number;           // Download quota
  customRules?: Record<string, any>; // Extended business rules
}
```

### Document Lifecycle Management

#### 1. **Upload Process**
```
User Upload → File Validation → Virus Scan → MinIO Storage → Database Record → Access Grant
```

#### 2. **Access Control Workflow**
```
Request → Authentication → Permission Check → Constraint Validation → Presigned URL → File Access
```

#### 3. **Automated Cleanup**
- **Temp files**: Deleted after 24 hours
- **Reports**: Archived after 90 days
- **Expired certificates**: Flagged for review
- **Orphaned documents**: Cleaned up weekly

### API Endpoints

#### Core Document Operations
```typescript
POST   /api/documents/upload                    // Single file upload
POST   /api/documents/upload-bulk               // Multiple files
GET    /api/documents                           // List with filters
GET    /api/documents/:id                       // Get document details
PUT    /api/documents/:id                       // Update metadata
DELETE /api/documents/:id                       // Delete document
GET    /api/documents/:id/download              // Get download URL
```

#### Entity-Specific Endpoints
```typescript
GET    /api/documents/entity/:type/:id          // Get entity documents
POST   /api/documents/entity/:type/:id/upload   // Upload for entity

// Product images
POST   /api/documents/products/:id/suppliers/:supplierId/image
GET    /api/documents/products/:id/suppliers/:supplierId/image
```

#### Product Certification Endpoints
```typescript
POST   /api/documents/products/:productId/suppliers/:supplierId/certification
GET    /api/documents/products/:productId/suppliers/:supplierId/certifications
GET    /api/documents/certifications/expiring?days=30
```

#### Discrepancy Photo Endpoints
```typescript
// Delivery-time discrepancies
POST   /api/documents/discrepancies/delivery/:deliveryId/upload
POST   /api/documents/discrepancies/product/:orderProductId/upload

// Post-delivery discrepancies
POST   /api/documents/discrepancies/post-delivery/:orderId/upload

// Discrepancy retrieval and filtering
GET    /api/documents/discrepancies/urgent
GET    /api/documents/discrepancies/post-delivery?days=7
GET    /api/documents/discrepancies/timeline/:timeline    // delivery|post-delivery|all
GET    /api/documents/discrepancies/:entityType/:entityId
```

#### Access Management
```typescript
POST   /api/documents/:id/access               // Grant access
POST   /api/documents/access/bulk              // Bulk access grant
```

### Security Features

#### File Validation
- **Size limits**: 50MB per file, 10 files per batch
- **Type validation**: MIME type whitelist per document category
- **Virus scanning**: Integration with ClamAV (future enhancement)
- **Content validation**: PDF structure validation, image format verification

#### Access Security
- **JWT authentication**: Required for all endpoints
- **Role-based authorization**: Fine-grained permission checking
- **Presigned URLs**: Time-limited access to private files
- **Audit logging**: Complete access history tracking
- **IP restrictions**: Optional IP-based access control

#### Data Protection
- **Encryption at rest**: MinIO server-side encryption
- **Encryption in transit**: HTTPS/TLS for all communications
- **Access logging**: Complete audit trail for compliance
- **Backup strategy**: Regular MinIO backups with versioning

### Integration Points

#### Product Catalog
- Automatic image association with ProductSupplier relationships
- CDN integration for fast image delivery
- Image optimization and multiple size generation

#### Order Processing
- Automatic document generation for orders and invoices
- Email attachment integration for customer communications
- Document bundling for multi-supplier orders

#### Compliance Management
- Certificate expiration monitoring and alerts
- Automated compliance report generation
- Integration with quality management processes
- Product-level certification tracking per supplier
- Multi-tier certification validation (entity + product level)

#### Quality Control Workflows

##### Delivery-Time Quality Control
- Real-time discrepancy photo capture during delivery
- Immediate notification system for urgent quality issues
- Severity-based escalation (LOW/MEDIUM/HIGH/CRITICAL)
- Integration with order processing for non-conformity tracking
- Automated supplier notification for quality issues
- Photo-based evidence collection for claims processing

##### Post-Delivery Quality Control
- **Discovery Timeline Tracking**: Track days between delivery and issue discovery
- **Customer-Reported Issues**: Flag discrepancies reported by end customers
- **Extended Investigation Period**: 7-day default window for post-delivery issues
- **Severity Assessment**: Different escalation rules for post-delivery vs delivery-time issues
- **Root Cause Analysis**: Link post-delivery issues to original delivery records
- **Claims Management**: Integration with insurance and supplier liability claims

##### Post-Delivery Issue Categories
- **POST_DELIVERY_DAMAGE_PHOTO**: Physical damage discovered after delivery
- **POST_DELIVERY_QUALITY_ISSUE_PHOTO**: Quality problems identified during use
- **POST_DELIVERY_MISSING_ITEMS_PHOTO**: Items discovered missing after inventory check
- **POST_DELIVERY_WRONG_ITEMS_PHOTO**: Incorrect products identified post-delivery
- **POST_DELIVERY_CONTAMINATION_PHOTO**: Contamination discovered after delivery
- **POST_DELIVERY_SPOILAGE_PHOTO**: Spoilage found during storage or use
- **CUSTOMER_COMPLAINT_PHOTO**: Photos submitted by end customers with complaints

##### Workflow Differentiation
- **Immediate Issues** (0-24h): Treated as urgent with immediate escalation
- **Short-term Issues** (1-3 days): Standard escalation with supplier notification
- **Extended Issues** (4-7 days): Require additional investigation and documentation
- **Late Discovery** (>7 days): Special handling with enhanced evidence requirements

#### Reporting System
- On-demand report generation with template engine
- Scheduled report creation and distribution
- Data export functionality with access control

### Performance Considerations

#### Caching Strategy
- **Public images**: CDN caching with long TTL
- **Private documents**: Presigned URL caching (1 hour)
- **Metadata**: Database query caching for document lists
- **Access checks**: Permission caching with short TTL

#### Storage Optimization
- **Image compression**: Automatic optimization for web delivery
- **PDF compression**: Reduce file sizes for generated documents
- **Cold storage**: Archive old documents to lower-cost storage tiers
- **Deduplication**: Identify and merge duplicate files

#### Monitoring and Alerts
- **Storage usage**: Monitor bucket sizes and growth trends
- **Access patterns**: Track document usage for optimization
- **Error rates**: Monitor upload/download failure rates
- **Performance metrics**: Track response times and throughput

##### 14. **Contract Management System** (Master Contracts with SLAs)
- Framework agreements negotiated with suppliers on annual basis
- Master contracts with per-product Service Level Agreements (SLAs)
- Performance tracking and adherence monitoring
- Manager dashboard for contract performance oversight
- Automated penalty and bonus calculations
- Contract lifecycle management with review and approval workflows

## Contract Management Architecture

### Master Contract Framework

#### 1. **Master Contracts** (Contrats Maîtres)
- **Purpose**: Annual framework agreements negotiated by Blue Whale using total volume leverage
- **Scope**: Define global terms, default SLAs, and financial conditions for supplier relationships
- **Contract Types**: Annual, Multi-year, Seasonal, Spot contracts
- **Status Workflow**: Draft → Active → Suspended/Expired → Terminated
- **Key Features**:
  - Volume commitments and minimum order values
  - Default delivery and quality SLAs with tolerance thresholds
  - Penalty and bonus structures for performance management
  - Contract metadata with negotiation history and custom clauses
  - Automatic renewal options with configurable notice periods

#### 2. **Product-Specific SLAs** (Per-Product Overrides)
- **Purpose**: Override master contract defaults for specific products requiring different terms
- **Granularity**: Product-supplier specific SLA configurations
- **SLA Metrics**:
  - **Delivery Performance**: Custom delivery timeframes, tolerance levels, maximum delays
  - **Quality Standards**: Defect rate thresholds, compliance requirements, critical quality triggers
  - **Quantity Accuracy**: Shortage/overage tolerances, fulfillment rate minimums
  - **Response Times**: Order confirmation and communication requirements
  - **Packaging Compliance**: Special handling, certification, and documentation needs

#### 3. **Seasonal and Contextual Adjustments**
- **Peak Season Adjustments**: Relaxed SLAs during high-demand periods (harvest seasons)
- **Off-Peak Optimization**: Stricter requirements during low-demand periods
- **Special Period Handling**: Custom rules for holidays, maintenance windows, force majeure events
- **Time Window Constraints**: Delivery scheduling restrictions and preferred time slots
- **Temperature and Handling Requirements**: Cold chain management for sensitive products

#### 4. **Performance Monitoring and Metrics**
- **Real-Time Tracking**: Continuous measurement against SLA targets
- **Metric Types**: Delivery performance, quality conformity, quantity accuracy, response times
- **Financial Impact Calculation**: Automated penalty and bonus computations
- **Trend Analysis**: Rolling averages, performance trajectories, comparative benchmarking
- **Escalation Management**: Automated alerts for SLA breaches and contract review triggers

### Contract Performance Management

#### Performance Calculation Engine
```typescript
// Core performance metrics tracked automatically
interface PerformanceMetrics {
  deliveryPerformance: {
    onTimeRate: number;           // % of orders delivered within SLA
    averageDeliveryTime: number;  // Actual average vs SLA target
    lateOrders: number;           // Count of delayed deliveries
    earlyDeliveries: number;      // Count of early deliveries (bonus eligible)
  };
  
  qualityPerformance: {
    conformityRate: number;       // % of orders without quality issues
    defectRate: number;           // % of units with defects
    customerComplaints: number;   // Quality-related complaints
    certificationCompliance: number; // % meeting certification requirements
  };
  
  quantityAccuracy: {
    exactDeliveries: number;      // Orders with 100% quantity accuracy
    shortageRate: number;         // % variance for under-deliveries
    overageRate: number;          // % variance for over-deliveries
    averageVariance: number;      // Average quantity deviation
  };
  
  responseMetrics: {
    averageResponseTime: number;  // Hours to order confirmation
    withinSLAResponses: number;   // Confirmations within required timeframe
    communicationQuality: number; // Completeness of order communications
  };
}
```

#### Financial Impact Management
- **Penalty Calculation**: Automated computation based on SLA breaches and order values
- **Bonus Attribution**: Performance excellence rewards for exceeding SLA targets  
- **Volume-Based Adjustments**: Penalty/bonus scaling based on order size and frequency
- **Contract-Level Aggregation**: Monthly and quarterly financial impact summaries
- **Budget Impact Analysis**: Cost implications of supplier performance on operational budgets

#### Manager Dashboard and Reporting

##### Executive Dashboard Metrics
```typescript
interface ManagerDashboard {
  contractOverview: {
    totalActiveContracts: number;
    contractsAtRisk: number;          // With recent SLA breaches
    contractsExcellent: number;       // Consistently exceeding targets
    contractsExpiringWithin30Days: number;
  };
  
  financialSummary: {
    totalPenaltiesThisMonth: number;
    totalBonusesThisMonth: number;
    netFinancialImpact: number;
    potentialSavings: number;         // From performance improvements
  };
  
  performanceIndicators: {
    avgDeliveryPerformance: number;   // Across all active contracts
    avgQualityPerformance: number;
    supplierRankings: SupplierRanking[];
    trendDirection: 'IMPROVING' | 'STABLE' | 'DECLINING';
  };
  
  actionRequired: {
    pendingEscalations: number;
    overduReviews: number;
    contractsRequiringRenewal: number;
    criticalPerformanceIssues: number;
  };
}
```

##### Contract Performance Reports
- **Individual Contract Analysis**: Comprehensive performance review with recommendations
- **Supplier Benchmarking**: Comparative analysis across multiple suppliers
- **Product Performance Mapping**: SLA adherence by product category and complexity
- **Seasonal Performance Trends**: Year-over-year comparison with seasonal adjustments
- **Risk Assessment**: Identification of contracts requiring immediate attention

### API Endpoints

#### Master Contract Management
```typescript
// Contract CRUD operations
POST   /api/contracts                        // Create new master contract
GET    /api/contracts                        // List contracts with filters
GET    /api/contracts/:id                    // Get contract details
PUT    /api/contracts/:id                    // Update contract terms
DELETE /api/contracts/:id                    // Deactivate contract

// Contract lifecycle management
POST   /api/contracts/:id/activate           // Activate draft contract
POST   /api/contracts/:id/suspend            // Suspend active contract
POST   /api/contracts/:id/renew              // Renew expiring contract
POST   /api/contracts/:id/review             // Submit for review
POST   /api/contracts/:id/approve            // Approve contract (admin)
POST   /api/contracts/:id/reject             // Reject contract (admin)

// Utility endpoints
GET    /api/contracts/:id/summary            // Contract performance summary
GET    /api/contracts/:id/products           // Products covered by contract
POST   /api/contracts/:id/validate-slas      // Validate SLA configurations
GET    /api/contracts/expiring              // Contracts expiring soon
GET    /api/contracts/by-supplier/:supplierId // All contracts for supplier
POST   /api/contracts/:id/duplicate          // Create contract from template
```

#### Product SLA Management
```typescript
// Product-specific SLA overrides
POST   /api/contracts/:id/product-slas            // Add product SLA override
GET    /api/contracts/:id/product-slas            // List product SLAs
PUT    /api/contracts/:id/product-slas/:slaId     // Update product SLA
DELETE /api/contracts/:id/product-slas/:slaId     // Remove product SLA
POST   /api/contracts/:id/product-slas/:slaId/suspend // Suspend SLA enforcement
POST   /api/contracts/:id/product-slas/:slaId/resume  // Resume SLA enforcement
```

#### Contract Performance Dashboard
```typescript
// Manager dashboard endpoints
GET    /api/contract-performance/dashboard         // Executive dashboard metrics
GET    /api/contract-performance/contracts/:id/report // Individual contract report
POST   /api/contract-performance/calculate         // Trigger performance calculation

// Performance monitoring
GET    /api/contract-performance/metrics           // Performance metrics with filters
GET    /api/contract-performance/contracts-at-risk // Contracts needing attention
GET    /api/contract-performance/escalations       // Pending escalations
GET    /api/contract-performance/trends            // Performance trends over time
GET    /api/contract-performance/supplier-rankings // Supplier performance comparison

// Management actions
PUT    /api/contract-performance/metrics/:id       // Update metric (add notes, actions)
POST   /api/contract-performance/metrics/:id/escalate // Manual escalation trigger
GET    /api/contract-performance/financial-impact  // Financial impact summary
GET    /api/contract-performance/alerts            // Performance alerts
POST   /api/contract-performance/reports/bulk-generate // Bulk report generation
```

### Contract Workflow Integration

#### Order Processing Integration
```typescript
// Integration points with order management
interface OrderContractIntegration {
  // Automatic SLA application during order creation
  applySLAToOrder(orderId: string, productId: string, supplierId: string): void;
  
  // Performance measurement triggers
  recordDeliveryPerformance(orderId: string, deliveredAt: Date): void;
  recordQualityMetrics(orderId: string, qualityIssues: QualityIssue[]): void;
  recordQuantityAccuracy(orderId: string, deliveredQuantities: Record<string, number>): void;
  
  // Financial impact calculation
  calculateOrderPenalties(orderId: string): PenaltyCalculation;
  calculateOrderBonuses(orderId: string): BonusCalculation;
}
```

#### Document Management Integration
- **Contract Documents**: PDF generation for master contracts and SLA specifications
- **Performance Reports**: Automated monthly and quarterly performance summaries
- **SLA Evidence**: Integration with discrepancy photo documentation for breach evidence
- **Compliance Certificates**: Link product certifications to SLA requirements
- **Audit Trail**: Complete history of contract changes and performance adjustments

#### Notification and Escalation System
- **SLA Breach Alerts**: Immediate notifications for critical performance failures
- **Contract Review Reminders**: Automated alerts for upcoming review dates
- **Renewal Notifications**: Early warning system for expiring contracts
- **Performance Trend Alerts**: Notifications for declining supplier performance
- **Escalation Workflows**: Multi-level escalation with defined response timeframes

### Business Benefits

#### For Managers
- **Proactive Contract Management**: Early identification of performance issues
- **Data-Driven Decisions**: Objective supplier evaluation and contract renewal decisions
- **Financial Transparency**: Clear visibility into penalty costs and bonus opportunities
- **Risk Mitigation**: Early warning system for contracts requiring attention
- **Operational Efficiency**: Automated performance tracking reduces manual oversight

#### For Operations
- **Clear Expectations**: Well-defined SLAs provide operational clarity
- **Performance Feedback**: Regular performance data enables continuous improvement
- **Automated Penalties**: Reduces disputes and manual financial adjustments
- **Seasonal Flexibility**: SLA adjustments accommodate business seasonality
- **Quality Assurance**: Integration with quality control processes

#### Strategic Value
- **Supplier Development**: Performance data drives supplier improvement initiatives
- **Contract Optimization**: Historical data informs better contract negotiations
- **Volume Leverage**: Framework agreements maximize purchasing power
- **Compliance Assurance**: Systematic approach to supplier performance management
- **Competitive Advantage**: Superior supplier relationships through structured management

## Audit Trail and History System

### Asynchronous Event-Driven History Pattern

The application implements a **zero-performance-impact** audit trail system using the Asynchronous Event-Driven History Pattern. This pattern provides comprehensive change tracking without affecting main application performance.

#### Architecture Components

##### 1. **BaseEntity Structure**
```typescript
// Core base entity - minimal fields for all entities
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// Extended base for entities that need soft delete
export abstract class SoftDeletableEntity extends BaseEntity {
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
```

**Key Design Decisions:**
- **BaseEntity**: Contains only essential fields (id, timestamps)
- **SoftDeletableEntity**: Separate class for entities requiring soft delete functionality
- **Clean Separation**: Entities only inherit fields they actually need
- **Performance Optimized**: No unused columns in entities that don't need soft delete
- **Selective Soft Deletion**: StationContact entities use hard deletion for data integrity

##### 2. **EntityHistory Entity**
```typescript
@Entity('entity_history')
@Index(['entityType', 'entityId', 'timestamp'])
export class EntityHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'entity_type' })
  entityType: string;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column('json')
  changes: Record<string, { old: any; new: any }>;

  @Column({ name: 'changed_by' })
  changedBy: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ nullable: true })
  reason?: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress?: string;

  @Column({ name: 'user_agent', nullable: true })
  userAgent?: string;
}
```

**Features:**
- **Indexed for Performance**: Composite index on (entityType, entityId, timestamp)
- **Rich Context**: Captures user, IP, user agent, and reason for changes
- **Change Diff**: JSON field storing old vs new values
- **Universal**: Works with any entity type

##### 3. **Event-Driven Processing**
```typescript
// Service emits async events - zero blocking
async updateUser(id: string, updateData: any, userId: string) {
  const oldUser = await this.userRepository.findOne({ where: { id } });
  const updatedUser = await this.userRepository.save({ ...oldUser, ...updateData });
  
  // Async event - zero blocking
  this.entityEventService.emitEntityChange(
    'User',
    id,
    oldUser,
    updatedUser,
    userId,
    { reason: 'User profile update' }
  );
  
  return updatedUser;
}

// Background history processor
@OnEvent('entity.changed', { async: true })
async handleEntityChange(payload: EntityChangeEvent) {
  // Process in background - no impact on main flow
  await this.historyRepository.save({
    entityType: payload.entityType,
    entityId: payload.entityId,
    changes: this.calculateDiff(payload.oldValues, payload.newValues),
    changedBy: payload.changedBy,
    timestamp: new Date()
  });
}
```

#### Usage in Services

##### Basic Usage
```typescript
@Injectable()
export class UserService {
  constructor(
    private userRepository: Repository<User>,
    private entityEventService: EntityEventService,
  ) {}

  async updateUser(id: string, updateData: UpdateUserDto, currentUser: User) {
    const oldUser = await this.userRepository.findOne({ where: { id } });
    const updatedUser = await this.userRepository.save({ ...oldUser, ...updateData });
    
    // Emit change event for audit trail
    this.entityEventService.emitEntityChange(
      'User',
      id,
      oldUser,
      updatedUser,
      currentUser.id,
      { reason: 'Profile update by user' }
    );
    
    return updatedUser;
  }
}
```

##### Advanced Usage with Context
```typescript
async approveOrder(orderId: string, currentUser: User, request: Request) {
  const oldOrder = await this.orderRepository.findOne({ where: { id: orderId } });
  const updatedOrder = await this.orderRepository.save({
    ...oldOrder,
    status: OrderStatus.APPROVED,
    approvedBy: currentUser.id,
    approvedAt: new Date()
  });
  
  // Emit with rich context
  this.entityEventService.emitEntityChange(
    'PurchaseOrder',
    orderId,
    oldOrder,
    updatedOrder,
    currentUser.id,
    {
      reason: 'Order approval',
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    }
  );
  
  return updatedOrder;
}
```

#### History Querying

##### Get Entity History
```typescript
// Get complete history for an entity
const userHistory = await this.historyService.getEntityHistory('User', userId);

// Get paginated history
const recentChanges = await this.historyService.getEntityHistory(
  'User', 
  userId, 
  20,  // limit
  0    // offset
);
```

##### Get User Activity
```typescript
// Get all changes made by a user
const userActivity = await this.historyService.getHistoryByUser(userId);
```

#### Benefits

##### Performance Benefits
- **Zero Main Flow Impact**: History processing happens asynchronously
- **Non-Blocking Events**: Main operations complete immediately
- **Background Processing**: History saving doesn't slow down user interactions
- **Optimized Queries**: Indexed history table for fast retrieval
- **Lean Base Entities**: Only essential fields in main entities

##### Audit Benefits
- **Complete Audit Trail**: Every change tracked with full context
- **User Attribution**: Who made each change
- **Temporal Tracking**: When changes occurred
- **Change Details**: What exactly changed (old vs new values)
- **Contextual Information**: Why changes were made, from where

##### Operational Benefits
- **Compliance Ready**: Meets audit requirements for regulated industries
- **Debugging Support**: Complete history for troubleshooting
- **User Accountability**: Clear attribution of all changes
- **Data Recovery**: Can reconstruct entity state at any point in time
- **Analytics Ready**: Change patterns and user behavior analysis

#### System Integration

The history system integrates seamlessly with:
- **All Entity Services**: Any service can emit change events
- **Authentication System**: Automatic user context capture
- **Request Context**: IP address and user agent tracking
- **Database Transactions**: History events are fire-and-forget
- **Error Handling**: History failures don't affect main operations

This pattern ensures comprehensive audit capabilities while maintaining optimal application performance.

## Future Enhancements

#### Contract Management Advanced Features
- **AI-Powered Performance Prediction**: Machine learning models to forecast supplier performance
- **Dynamic SLA Adjustment**: Automatic SLA modifications based on market conditions
- **Supplier Benchmarking Platform**: Industry-wide performance comparisons
- **Contract Template Library**: Standardized contract frameworks for different product categories
- **Integration with External Systems**: ERP, procurement, and logistics system connectivity

#### Document System Advanced Features
- **Document versioning**: Track document history and changes
- **Digital signatures**: PKI integration for document signing
- **OCR integration**: Text extraction from scanned documents
- **AI-powered tagging**: Automatic document classification
- **Workflow integration**: Document approval workflows

#### Integration Expansions
- **Email integration**: Direct document attachment from email
- **Mobile app**: Document capture via mobile camera
- **External integrations**: Sync with third-party document systems
- **API webhooks**: Real-time document event notifications

## Business Workflow

### Order Flow (Standard ERP Terminology)

#### Blue Whale's Triple Role
Blue Whale operates in three distinct business roles:
1. **As Buyer**: Purchasing products from suppliers (direct procurement)
2. **As Seller**: Selling products to stations (from platform stock or direct)
3. **As Commercial Intermediary**: Acting as distributor/broker between suppliers and stations

#### Blue Whale as Commercial Intermediary
- **Master Contract Negotiation**: Establishes annual framework agreements with suppliers
- **Volume Leverage**: Uses total potential volume for better pricing negotiations
- **Billing Services**: Handles all invoicing on behalf of suppliers
- **Commercial Risk**: Takes responsibility for customer payments
- **Value-Added Services**: Logistics, storage, and distribution services
- **Individual Order Processing**: Each customer order uses pre-negotiated contract terms

#### Transaction Types

**Model 1: Blue Whale as Stock Owner**
1. **Supplier → Blue Whale (Stock Purchase)**
   - **Purchase Order**: Blue Whale creates PO to Supplier
   - **Delivery**: Supplier delivers to Platform warehouse
   - **Ownership**: Blue Whale owns the inventory at Platform
   - **Invoice**: Supplier invoices Blue Whale

2. **Blue Whale → Station (Stock Sale)**
   - **Purchase Order**: Station creates PO to Blue Whale
   - **Sales Order**: Blue Whale creates SO to fulfill Station's PO
   - **Fulfillment**: Platform ships Blue Whale's inventory to Station
   - **Invoice**: Blue Whale invoices Station (product cost + margin + services)

**Model 2: Blue Whale as Commercial Intermediary**
1. **Station → Blue Whale (Customer Order)**
   - **Purchase Order**: Station creates PO to Blue Whale (as commercial intermediary)
   - **Contract Application**: Uses pre-negotiated master contract terms

2. **Blue Whale → Supplier (Individual Order)**
   - **Purchase Order**: Blue Whale creates individual PO to Supplier per station order
   - **Master Contract Pricing**: Uses annually negotiated pricing and terms
   - **Delivery**: Supplier ships directly to Platform or Station per order

3. **Blue Whale → Station (Intermediary Invoice)**
   - **Sales Order**: Blue Whale creates SO for billing purposes
   - **Invoice**: Blue Whale invoices Station (supplier cost + intermediary fees)
   - **Payment**: Station pays Blue Whale
   - **Supplier Payment**: Blue Whale pays supplier for individual deliveries

### Commercial Intermediary Model

1. **Master Contract Negotiation Phase** (Annual):
   - Blue Whale negotiates master contracts with suppliers (~once per year)
   - Uses total potential volume across all stations for leverage
   - Establishes fixed pricing, terms, and service conditions
   - Defines payment terms, delivery conditions, and quality standards

2. **Individual Order Processing Phase** (Ongoing):
   - Stations use shopping cart to prepare orders with multiple suppliers
   - Cart validation automatically groups products by supplier
   - Each supplier group generates one Purchase Order
   - All orders use pre-negotiated master contract pricing
   - Blue Whale creates separate PO to each supplier involved

3. **Fulfillment Phase**:
   - Supplier fulfills individual orders using master contract terms
   - Deliveries go directly to platforms or stations as specified
   - Blue Whale coordinates logistics but doesn't aggregate shipments

4. **Billing and Payment Phase**:
   - Blue Whale invoices stations individually (supplier cost + service fees)
   - Stations pay Blue Whale directly (single point of contact)
   - Blue Whale pays suppliers individually for each delivery
   - All transactions use master contract pricing

### Shopping Cart Workflow (Standard ERP: Master Order Model)

1. **Cart Building Phase**:
   - Customers browse products available from multiple suppliers
   - Same product may be offered by different suppliers with different:
     - Packaging options (quantity per package, packaging units)
     - Pricing (based on master contracts)
     - Delivery conditions
     - Quality specifications
   - Customer selects specific product-supplier combinations
   - Cart can contain products from multiple suppliers

2. **Cart Validation Phase** (Master Order Creation):
   - Customer validates/submits shopping cart
   - System creates a **Master Order** (Master/Umbrella Order) for overall tracking
   - System automatically groups cart items by supplier
   - Each supplier group becomes one Purchase Order (Child Order)
   - Order hierarchy: Master Order → Multiple Purchase Orders

3. **Purchase Order Creation** (Child Orders):
   - One PO created per supplier represented in the cart
   - Each PO links back to the Master Order (parent-child relationship)
   - Each PO contains all products from that specific supplier
   - Master contract pricing applied automatically
   - Delivery instructions and terms per supplier

4. **Order Processing & Tracking**:
   - **Master Order Level**: Overall status, total amounts, customer communication
   - **Individual PO Level**: Each supplier PO follows standard workflow
   - **Unified Tracking**: Customer and Blue Whale track progress across all suppliers
   - **Consolidated Reporting**: Single view of multi-supplier order status

### Platform Distribution Model
- **Inventory Storage**: Products stored at platforms may be Blue Whale owned or supplier consigned
- **Fulfillment Services**: Platforms provide pick, pack, ship services
- **Logistics Coordination**: Blue Whale manages delivery schedules and routes
- **Quality Control**: Platforms may perform quality checks and handling

### Key Points
- **Commercial Intermediary**: Blue Whale acts as distributor/broker, not just logistics provider
- **Master Contract Model**: Annual negotiations using total volume leverage (not order aggregation)
- **Shopping Cart Grouping**: Cart validation automatically groups products by supplier
- **Multi-Supplier Orders**: One cart can generate multiple POs (one per supplier)
- **Product-Supplier Choice**: Same product available from multiple suppliers with different conditions
- **Pre-negotiated Pricing**: All orders use master contract terms established annually
- **Contract Management**: Maintains annual framework agreements with suppliers
- **Billing Responsibility**: Blue Whale handles all customer billing, reducing supplier admin
- **Risk Management**: Blue Whale takes commercial risk for customer payments
- **Single Customer Interface**: Stations deal only with Blue Whale, not multiple suppliers
- **Platform Role**: Platforms provide fulfillment services for Blue Whale's operations
- **Flexible Transaction Model**: Station Cart → Multiple Blue Whale POs (grouped by supplier)
- **Triple Role**: Buyer, Seller, and Commercial Intermediary depending on transaction type

### System Design Considerations

**Purchase Order and Sales Order Implementation**
The system now correctly implements both PO and SO entities to support Blue Whale's triple role:

**For Commercial Intermediary Operations (Master Order Model):**
- **Station Shopping Cart** → **Master Order** (Master/Umbrella Order)
- **Master Order** → Multiple **Blue Whale POs** (one per supplier, child orders)
- **Blue Whale SO** → Station (intermediary bills customer for all suppliers)
- **Blue Whale PO** → Each Supplier (individual child orders using master contract terms)
- **Order Hierarchy**: Master Order tracks overall progress across all suppliers

**For Direct Stock Operations:**
- **Blue Whale PO** → Supplier (direct procurement for platform stock)
- **Station PO** → Blue Whale (customer orders from Blue Whale's stock)
- **Blue Whale SO** → Station (Blue Whale sells own inventory)

**Contract Management (Future Enhancement)**
Consider implementing supplier contract entities to track:
- Framework agreements with volume pricing tiers
- Contract terms and renewal dates
- Performance metrics and compliance tracking
- Volume commitments vs. actual orders

**Benefits of Current Design:**
- ✅ Supports both intermediary and direct sales models
- ✅ Proper revenue and expense tracking for Blue Whale
- ✅ Clear audit trail for all commercial relationships
- ✅ Supports master contract pricing model
- ✅ Shopping cart with automatic supplier grouping
- ✅ Multi-supplier order processing (1:many cart to supplier orders)
- ✅ Product-supplier choice flexibility for customers
- ✅ Handles billing intermediation services properly
- ✅ Enables volume leverage for annual contract negotiations

## Tech Stack Details

### Backend Dependencies
- **Framework**: NestJS 10.x with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js with JWT strategy
- **Validation**: class-validator, class-transformer
- **Documentation**: @nestjs/swagger
- **File Storage**: MinIO client
- **Email**: Nodemailer
- **Configuration**: @nestjs/config with validation

### Frontend Dependencies
- **Framework**: Angular 18 with TypeScript
- **State Management**: Angular Signals, RxJS
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide Angular
- **i18n**: @jsverse/transloco
- **Build Tool**: Angular CLI with esbuild
- **Forms**: Angular Reactive Forms

## Development Commands

### Backend
```bash
cd backend
npm run start:dev       # Start in development mode with hot-reload
npm run start:prod      # Start in production mode
npm run build          # Build for production
npm run migration:run  # Run database migrations
npm run seed           # Seed database with sample data
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
```

### Frontend
```bash
cd frontend
npm start              # Start development server (port 4200)
npm run build         # Build for production
npm run test          # Run unit tests
npm run lint          # Run linting
```

### Docker
```bash
docker-compose up -d              # Start all services
docker-compose -f docker-compose.dev.yml up    # Development mode
docker-compose -f docker-compose.prod.yml up   # Production mode
```

## API Structure

### Authentication & Authorization
- JWT tokens with configurable expiration
- Role-based access: `admin`, `manager`, `user`, `viewer`
- Guards: `JwtAuthGuard`, `RolesGuard`
- Public routes decorated with `@Public()`

### API Modules

#### Auth Module (`/api/auth`)
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/profile` - Get current user profile

#### Users Module (`/api/users`)
- Full CRUD operations
- Role-based access control
- Entity relationship with Platform/Station/Supplier

#### Platforms Module (`/api/platforms`)
- Platform management with sites
- Contact management endpoints
- Nested routes for platform contacts

#### Stations Module (`/api/stations`)
- Station CRUD with group management
- Contact management (hard delete only)
- Station groups with cascading deactivation

#### Suppliers Module (`/api/suppliers`)
- Supplier management with sites
- Contact management endpoints
- Product relationships

#### Products Module (`/api/products`)
- Product catalog management
- Supplier relationships with pricing
- Category filtering

#### Orders Module (`/api/orders`)
- Order lifecycle management
- Master order grouping
- Status workflow implementation

#### Stocks Module (`/api/stocks`)
- Multi-location inventory tracking
- Stock movements
- Snapshot management

#### Transfers Module (`/api/transfers`)
- Inter-station transfer requests
- Approval workflow
- Product quantities management

#### Shopping Carts Module (`/api/shopping-carts`)
- Cart management per user/station
- Item management
- Order conversion

## Database Schema

### TypeORM Entities

#### Base Entity
All entities extend `BaseEntity` with:
- `id`: UUID primary key  
- `createdAt`: Creation timestamp
- `updatedAt`: Update timestamp

Some entities extend `SoftDeletableEntity` which adds:
- `isActive`: Soft delete flag

**Note**: Not all entities support soft deletion. StationContact entities use hard deletion.

#### Key Relationships
- **Platform** → has many **Stations**
- **Platform/Station/Supplier** → has many **Users**
- **Product** → many-to-many **Suppliers** (via ProductSupplier)
- **PurchaseOrder** → many-to-many **Products** (via OrderProduct)
- **SalesOrder** → many-to-many **Products** (via SalesOrderProduct)
- **PurchaseOrder** ↔ **SalesOrder** (one-to-one linking when applicable)
- **Station** → belongs to **StationGroup**
- **TransferRequest** → between **Stations**
- **MasterOrder** → has many **PurchaseOrders**

### Order Entity Structure

#### PurchaseOrder Entity
**Table**: `purchase_orders`
- Complete buyer information (Blue Whale or Station)
- Supplier information (external or internal to Blue Whale)
- Flexible delivery addressing (Platform/Station/Custom)
- Financial tracking (amounts, currency, payment terms)
- Status workflow and approval tracking
- Links to corresponding Sales Orders

#### SalesOrder Entity  
**Table**: `sales_orders`
- Blue Whale as seller to station customers
- Platform-based fulfillment
- Complete invoice and payment management
- Shipping and tracking information
- Product-level fulfillment status
- Platform fees and tax calculations

#### Product Line Items
- **OrderProduct**: Purchase Order line items (table: `purchase_order_products`)
- **SalesOrderProduct**: Sales Order line items (table: `sales_order_products`)
- Separate entities with specific fields for each order type

### Enums
Located in `backend/src/common/enums/`:
- `UserRole`: admin, manager, user, viewer
- `ProductCategory`: Various packaging types
- `OrderStatus`: Order workflow states (used by both PO and SO)
- `TransferStatus`: Transfer workflow states

## Frontend Architecture

### Component Structure
```
frontend/src/app/
├── core/                 # Core services, guards, interceptors
│   ├── guards/          # Auth, role guards
│   ├── interceptors/    # HTTP interceptors
│   ├── models/          # TypeScript interfaces
│   ├── services/        # Business services
│   └── strategies/      # Role-based strategies
├── features/            # Feature modules
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard component
│   ├── platforms/      # Platform management
│   ├── stations/       # Station management
│   ├── users/          # User management
│   └── ...            # Other features
├── shared/             # Shared components
│   ├── components/     
│   │   ├── layout/    # Layout components
│   │   └── ui/        # Reusable UI components
│   └── config/        # Shared configuration
└── app.routes.ts      # Main routing configuration
```

### State Management
- **Angular Signals** for reactive state
- **Services** as single source of truth
- **RxJS** for async operations
- **Interceptors** for cross-cutting concerns

### UI Component Library
Custom components in `shared/components/ui/`:
- `ButtonComponent` - Configurable button with variants
- `CardComponent` - Container component
- `InputComponent` - Form input with validation
- `ModalComponent` - Modal dialog
- `SlidePanelComponent` - Slide-over panel
- `DropdownComponent` - Dropdown menu
- Skeleton loaders for loading states

### Routing & Guards
- **AuthGuard**: Protects authenticated routes
- **GuestGuard**: Redirects authenticated users
- **RoleGuard**: Role-based route protection
- Lazy loading for feature modules

### i18n Support
- **Transloco** for internationalization
- Language files in `assets/i18n/`
- Support for English and French
- Dynamic language switching

## Design Patterns

### Backend Patterns

#### Repository Pattern
- Services encapsulate data access
- TypeORM repositories for database operations
- Clear separation of concerns

#### DTO Pattern
- Input validation with class-validator
- Response DTOs for API responses
- Transform pipes for data transformation

#### Dependency Injection
- NestJS IoC container
- Service injection
- Module-based architecture

### Frontend Patterns

#### Strategy Pattern
- Role-based navigation strategies
- Dynamic sidebar configuration
- User permission handling

#### Component Composition
- Standalone components
- Smart vs Presentational components
- Reusable UI component library

#### Reactive Programming
- RxJS operators for data streams
- Async pipe in templates
- Signal-based reactivity

## Security

### Authentication
- JWT-based authentication
- Secure token storage
- Token refresh mechanism
- Session management

### Authorization
- Role-based access control (RBAC)
- Route guards
- API endpoint protection
- Entity-level permissions

### Data Protection
- Input validation
- SQL injection prevention (TypeORM)
- XSS protection
- CORS configuration

## Performance Optimizations

### Backend
- Query optimization with TypeORM
- Pagination for list endpoints
- Caching strategies
- Database indexing

### Frontend
- Lazy loading modules
- OnPush change detection where applicable
- Virtual scrolling for large lists
- Image optimization
- Bundle size optimization with esbuild

## Testing Strategy

### Backend Testing
- Unit tests with Jest
- Service layer testing
- Controller testing with mocks
- E2E testing for critical paths

### Frontend Testing
- Component testing with Jasmine/Karma
- Service testing
- Guard testing
- Integration testing

## Deployment

### Docker Deployment
- Multi-stage Dockerfile for optimization
- Docker Compose for orchestration
- Environment-specific configurations
- Health checks

### Environment Variables
Backend (`.env`):
- `DATABASE_URL`: PostgreSQL connection
- `JWT_SECRET`: JWT signing secret
- `MINIO_*`: MinIO configuration
- `NODE_ENV`: Environment mode

Frontend:
- `environment.ts`: Development config
- `environment.prod.ts`: Production config

## Development Guidelines

### Code Style
- **TypeScript** strict mode enabled
- **ESLint** for linting with comprehensive rules
- **Prettier** for consistent code formatting
- **Conventional Commits** for git messages

## Code Quality and Linting

### ESLint Configuration

The project uses ESLint with comprehensive configurations for both backend (NestJS) and frontend (Angular) to ensure code quality, consistency, and adherence to best practices.

#### Backend ESLint Setup (NestJS)
**Configuration File**: `backend/.eslintrc.js`

**Features:**
- **TypeScript Integration**: @typescript-eslint parser and plugin for TypeScript-specific rules
- **Prettier Integration**: eslint-config-prettier and eslint-plugin-prettier for formatting consistency
- **NestJS Optimization**: Rules tailored for NestJS patterns and decorators
- **Performance Rules**: Optional chaining, nullish coalescing for modern JavaScript
- **Import Organization**: Automatic import sorting and member organization

**Key Rules:**
- `@typescript-eslint/no-explicit-any`: Warns against using `any` type
- `@typescript-eslint/no-unused-vars`: Catches unused variables with ignore patterns
- `@typescript-eslint/prefer-optional-chain`: Enforces modern optional chaining syntax
- `@typescript-eslint/prefer-nullish-coalescing`: Promotes nullish coalescing operator
- `sort-imports`: Automatically organizes imports for better readability
- `prettier/prettier`: Enforces Prettier formatting rules within ESLint

**Usage:**
```bash
cd backend
npm run lint        # Fix issues automatically
npm run lint:check  # Check without fixing
npm run format      # Format code with Prettier
npm run format:check # Check formatting without fixing
```

#### Frontend ESLint Setup (Angular)
**Configuration File**: `frontend/.eslintrc.json`

**Features:**
- **Angular ESLint**: @angular-eslint plugin for Angular-specific rules
- **Template Linting**: HTML template linting with @angular-eslint/template
- **TypeScript Rules**: Consistent with backend TypeScript configuration
- **Component Standards**: Enforces Angular component and directive naming conventions
- **Performance Optimization**: Rules promoting OnPush change detection and track-by functions

**Key Rules:**
- `@angular-eslint/component-selector`: Enforces 'app' prefix and kebab-case for components
- `@angular-eslint/directive-selector`: Enforces 'app' prefix and camelCase for directives
- `@angular-eslint/prefer-on-push-component-change-detection`: Promotes OnPush for performance
- `@angular-eslint/template/eqeqeq`: Enforces strict equality in templates
- `@angular-eslint/template/use-track-by-function`: Warns about missing trackBy functions

**Usage:**
```bash
cd frontend
npm run lint        # Fix issues automatically
npm run lint:check  # Check without fixing
npm run format      # Format code with Prettier
npm run format:check # Check formatting without fixing
```

#### Prettier Configuration
Both backend and frontend share consistent Prettier settings:

**Settings:**
- **Single Quotes**: `true` - Uses single quotes for strings
- **Trailing Commas**: `es5` - Adds trailing commas where valid in ES5
- **Tab Width**: `2` - 2-space indentation
- **Semicolons**: `true` - Always add semicolons
- **Print Width**: `120` - 120 character line length
- **End of Line**: `auto` - Automatic line ending detection
- **Arrow Parens**: `avoid` - Omit parentheses for single-parameter arrow functions

#### Benefits of Linting Setup

**Code Quality Benefits:**
- **Error Prevention**: Catches common TypeScript and JavaScript errors before runtime
- **Type Safety**: Enforces proper TypeScript usage and discourages `any` types
- **Modern Syntax**: Promotes modern JavaScript/TypeScript features and best practices
- **Performance Awareness**: Rules that encourage performance-optimized code patterns
- **Security**: Prevents common security anti-patterns and vulnerabilities

**Team Collaboration Benefits:**
- **Consistent Style**: Eliminates style debates and ensures uniform code formatting
- **Reduced Code Review Time**: Automated style checking removes formatting discussions
- **Onboarding**: New team members follow established patterns automatically
- **Knowledge Transfer**: Consistent patterns make code easier to understand
- **Maintainability**: Consistent structure and naming improve long-term maintenance

**Development Experience Benefits:**
- **IDE Integration**: Real-time error highlighting and auto-fix suggestions
- **Auto-formatting**: Code automatically formats on save with proper configuration
- **Import Organization**: Automatic import sorting and cleanup
- **Quick Fixes**: Many issues can be auto-fixed with a single command
- **CI/CD Integration**: Can be integrated into build pipelines for quality gates

**Framework-Specific Benefits:**

**NestJS Backend:**
- **Decorator Patterns**: Proper handling of NestJS decorators and metadata
- **Service Injection**: Correct dependency injection patterns
- **Guard and Interceptor**: Proper implementation of NestJS architectural patterns
- **Error Handling**: Consistent error handling and HTTP response patterns

**Angular Frontend:**
- **Component Architecture**: Enforces Angular component best practices
- **Template Optimization**: Rules for efficient Angular templates
- **Change Detection**: Promotes OnPush strategy for better performance
- **Accessibility**: Template rules that improve accessibility compliance
- **Reactive Patterns**: Encourages proper RxJS and reactive programming patterns

#### Integration with Development Workflow

**Pre-commit Hooks (Recommended):**
```bash
# Install husky for git hooks
npm install --save-dev husky lint-staged

# Configure pre-commit linting
npx husky add .husky/pre-commit "lint-staged"
```

**CI/CD Integration:**
- Add `npm run lint:check` to build pipelines
- Add `npm run format:check` to ensure consistent formatting
- Fail builds on linting errors to maintain code quality
- Generate linting reports for code quality metrics

**IDE Configuration:**
- **VS Code**: Install ESLint and Prettier extensions for real-time feedback
- **WebStorm/IntelliJ**: Enable ESLint and Prettier plugins
- **Format on Save**: Configure IDE to auto-format and fix on file save
- **Error Highlighting**: Real-time display of linting errors and warnings

This comprehensive linting setup ensures code quality, consistency, and maintainability across the entire development team while promoting TypeScript and framework-specific best practices.

### Backend Best Practices
- Use DTOs for all endpoints
- Implement proper error handling
- Write unit tests for services
- Document APIs with Swagger
- Use transactions for critical operations

### Frontend Best Practices
- Use standalone components
- Implement proper typing
- Handle loading and error states
- Use reactive forms for complex forms
- Follow Angular style guide
- Implement proper unsubscribe patterns

### Git Workflow
- Feature branch workflow
- Pull requests for code review
- Semantic versioning
- Changelog maintenance

## Common Tasks

### Adding a New Entity
1. Create TypeORM entity in backend
2. Create DTOs for CRUD operations
3. Implement service with business logic
4. Create controller with endpoints
5. Add module to imports
6. Create frontend model interface
7. Implement frontend service
8. Create UI components
9. Add routing

### Adding a New Feature Module
1. Generate module with Angular CLI
2. Create feature components
3. Define routing
4. Implement services
5. Add to main routes with lazy loading

### Database Migrations
1. Generate migration: `npm run migration:generate -- -n MigrationName`
2. Review generated SQL
3. Run migration: `npm run migration:run`
4. Test rollback: `npm run migration:revert`

## Troubleshooting

### Common Issues

#### Backend
- **Database connection**: Check PostgreSQL is running and credentials
- **Migration errors**: Ensure database is clean before running
- **JWT errors**: Verify JWT_SECRET is set
- **CORS issues**: Check allowed origins in main.ts

#### Frontend
- **Build errors**: Clear node_modules and reinstall
- **Routing issues**: Check lazy loading syntax
- **API errors**: Verify backend URL in environment
- **Style issues**: Ensure Tailwind is properly configured

## Important Notes

### Data Integrity
- Soft deletes preserve data (`isActive` flag)
- Audit fields track changes
- Transactions for multi-table operations

### Performance Considerations
- Implement pagination for all list endpoints
- Use indexes on frequently queried fields
- Optimize bundle size with lazy loading
- Cache static data

### Security Considerations
- Never expose sensitive data in responses
- Validate all user inputs
- Use parameterized queries (handled by TypeORM)
- Implement rate limiting for public endpoints
- Regular dependency updates

### Future Enhancements
- WebSocket support for real-time updates
- Advanced analytics dashboard
- Mobile application
- Microservices architecture
- GraphQL API option
- Event-driven architecture with message queues