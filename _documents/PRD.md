# Product Requirement Dossier (PRD) - Gestion Emballages

## 1. Executive Summary

### 1.1 Project Vision
**Gestion Emballages** is a comprehensive web application designed to be the central nervous system for managing packaging materials across a network of operational stations and external suppliers. The system aims to replace manual, error-prone processes with a streamlined, digital workflow that provides real-time visibility into stock levels, automates order processing, facilitates inter-station transfers, and offers data-driven insights for forecasting and procurement.

### 1.2 Problem Statement
Cooperative networks face significant challenges in managing packaging materials efficiently:
- **Manual processes** prone to errors and delays
- **Lack of real-time visibility** into stock levels across multiple stations
- **Inefficient ordering processes** requiring multiple communication channels
- **Suboptimal inventory management** leading to stockouts or excess inventory
- **Fragmented supplier relationships** with inconsistent pricing and availability data
- **Absence of demand forecasting** capabilities for strategic planning

### 1.3 Solution Overview
Gestion Emballages provides a centralized platform that:
- **Digitalizes the entire packaging procurement workflow** from forecasting to delivery
- **Enables real-time collaboration** between stations, suppliers, and administrators
- **Automates order processing** with workflow-based status management
- **Facilitates inter-station transfers** for optimal inventory distribution
- **Provides comprehensive reporting** and analytics for data-driven decisions
- **Maintains a centralized article catalog** with multi-supplier pricing

### 1.4 Business Objectives
- **Reduce procurement cycle time** by 40% through automation
- **Improve inventory turnover** by 25% through better visibility and transfers
- **Decrease stockout incidents** by 30% via demand forecasting
- **Streamline supplier relationships** with standardized order processing
- **Enable data-driven decision making** through comprehensive analytics

### 1.5 Target Audience
The system serves four primary user groups within the cooperative network:

**Managers/Gestionnaires (System Administrators):**
- Oversee the entire system and manage master data
- Configure users, articles, stations, and suppliers
- Monitor system-wide performance and analytics
- Handle exceptions and complex approval workflows

**Station Staff (Operational Users):**
- Manage day-to-day inventory at their specific location
- Create and track orders for stock replenishment
- Initiate and manage inter-station transfer requests
- Monitor local stock levels and consumption patterns

**Supplier Staff (External Partners):**
- Receive and process incoming orders from stations
- Update order status through fulfillment lifecycle
- Manage product pricing and availability information
- Upload delivery documents and handle exceptions

**End Users (Indirect Beneficiaries):**
- Cooperative members who benefit from improved packaging availability
- Finance teams who gain better cost visibility and control
- Logistics coordinators who optimize distribution networks

---

## 2. Business Requirements

### 2.1 Business Goals

**Primary Goals:**
- Digitalize the complete packaging procurement lifecycle for cooperative networks
- Reduce operational costs through process automation and optimization
- Improve supply chain visibility and responsiveness
- Enable data-driven decision making through comprehensive analytics
- Standardize supplier relationships and ordering processes

**Secondary Goals:**
- Reduce environmental impact through optimized inventory management
- Improve supplier performance through transparent communication
- Enable scalable growth of the cooperative network
- Enhance user satisfaction through intuitive interfaces

### 2.2 Success Criteria
- **Operational Efficiency**: 40% reduction in order processing time
- **Inventory Optimization**: 25% improvement in inventory turnover
- **User Adoption**: 95% active user adoption within 3 months
- **System Reliability**: 99.5% uptime during business hours
- **Data Accuracy**: 99% accuracy in inventory and order data

### 2.3 Stakeholder Analysis

**Primary Stakeholders:**
- Cooperative management (decision makers)
- Station managers (daily operations)
- Procurement teams (supplier relationships)
- IT department (system maintenance)

**Secondary Stakeholders:**
- Supplier organizations (external partners)
- Finance teams (cost control)
- Logistics coordinators (distribution)
- End users (cooperative members)

## 3. User Roles & Access Control

### 3.1 Role Definitions

The system implements a sophisticated role-based access control (RBAC) model with four distinct user roles:

#### 3.1.1 Manager Role
**Purpose**: Super administrators with unrestricted system access
**Organizational Level**: Executive/Strategic
**Key Responsibilities:**
- Overall system governance and configuration
- Strategic decision making based on system analytics
- Exception handling and conflict resolution
- System performance monitoring and optimization

#### 3.1.2 Gestionnaire Role
**Purpose**: Operational administrators with management privileges
**Organizational Level**: Tactical/Operational
**Key Responsibilities:**
- Daily system administration and user management
- Order workflow supervision and exception handling
- Supplier relationship management
- Operational reporting and analytics

#### 3.1.3 Station Role
**Purpose**: Station-based operational users
**Organizational Level**: Operational
**Key Responsibilities:**
- Local inventory management and ordering
- Inter-station transfer coordination
- Reception and quality control processes
- Local performance monitoring

#### 3.1.4 Fournisseur Role
**Purpose**: External supplier representatives
**Organizational Level**: Partner
**Key Responsibilities:**
- Order processing and fulfillment
- Product information management
- Delivery documentation and tracking
- Customer service and support

### 3.2 Permission Matrix

| Function | Manager | Gestionnaire | Station | Fournisseur |
|----------|---------|--------------|---------|-------------|
| **User Management** |
| Create users | ✓ | ✓ | ✗ | ✗ |
| Edit users | ✓ | ✓ | ✗ | ✗ |
| Deactivate users | ✓ | ✓ | ✗ | ✗ |
| View all users | ✓ | ✓ | ✗ | ✗ |
| **Entity Management** |
| Manage stations | ✓ | ✓ | ✗ | ✗ |
| Manage suppliers | ✓ | ✓ | ✗ | ✗ |
| View all entities | ✓ | ✓ | Limited | Limited |
| **Article Management** |
| Create articles | ✓ | ✓ | ✗ | ✗ |
| Edit articles | ✓ | ✓ | ✗ | ✗ |
| View articles | ✓ | ✓ | ✓ | ✓ |
| Manage pricing | ✓ | ✓ | ✗ | Own products |
| **Order Management** |
| View all orders | ✓ | ✓ | Own station | Own orders |
| Create orders | ✓ | ✓ | ✓ | ✗ |
| Process orders | ✓ | ✓ | Receive | Ship |
| Cancel orders | ✓ | ✓ | Own orders | Own orders |
| **Transfer Management** |
| View all transfers | ✓ | ✓ | Involved | ✗ |
| Create transfers | ✓ | ✓ | ✓ | ✗ |
| Process transfers | ✓ | ✓ | ✓ | ✗ |
| **Stock Management** |
| View all stocks | ✓ | ✓ | Own station | Own stock |
| Update stock | ✓ | ✓ | ✓ | ✓ |
| **Analytics & Reporting** |
| System analytics | ✓ | ✓ | ✗ | ✗ |
| Operational reports | ✓ | ✓ | Own data | Own data |
| Financial reports | ✓ | ✓ | ✗ | ✗ |

### 3.3 Authentication & Authorization

**Authentication Requirements:**
- JWT-based token authentication with 24-hour expiration
- Secure password requirements (minimum 6 characters)
- Account lockout after failed login attempts
- Single sign-on capability for enterprise integration

**Authorization Implementation:**
- Role-based route access control
- Entity-based data filtering (users see only relevant data)
- Dynamic menu generation based on user permissions
- API endpoint protection with role validation

---

## 4. User Research & Analysis

### 4.1 User Personas

#### 4.1.1 Marie Dubois - Station Manager
**Demographics**: 45 years old, 10 years in cooperative management, moderate tech skills
**Goals**: Ensure adequate stock levels, minimize waste, control costs
**Pain Points**: Manual tracking, frequent stockouts, supplier communication delays
**Technology Usage**: Uses basic office software, smartphone for communication
**Quote**: "I need to know what's in stock and what's coming without making phone calls all day."

#### 4.1.2 Thomas Martin - Procurement Specialist
**Demographics**: 35 years old, 8 years in procurement, high tech skills
**Goals**: Optimize supplier relationships, reduce costs, ensure quality
**Pain Points**: Fragmented supplier data, manual price comparisons, approval delays
**Technology Usage**: Power user of ERP systems, data analysis tools
**Quote**: "I need real-time visibility into all suppliers and pricing to make smart decisions."

#### 4.1.3 Sophie Laurent - Supplier Representative
**Demographics**: 40 years old, 15 years in B2B sales, moderate tech skills
**Goals**: Fulfill orders efficiently, maintain customer satisfaction, grow business
**Pain Points**: Order status confusion, document management, communication gaps
**Technology Usage**: CRM systems, email, mobile apps for field work
**Quote**: "I want to provide excellent service but need clear order information and status updates."

### 4.2 User Journey Mapping

#### 4.2.1 Station Ordering Journey
**Current State Pain Points:**
1. Manual inventory counting leads to inaccuracies
2. Phone/email ordering creates delays and errors
3. Lack of delivery tracking causes uncertainty
4. Manual reception process is time-consuming
5. No visibility into order status

**Future State Journey:**
1. **Discovery**: Real-time stock dashboard shows low inventory alerts
2. **Planning**: Forecasting tools suggest optimal order quantities
3. **Ordering**: Digital shopping cart with supplier comparison
4. **Tracking**: Real-time order status with delivery notifications
5. **Reception**: Digital receipt with quality control documentation
6. **Analysis**: Performance metrics and cost analysis

#### 4.2.2 Supplier Fulfillment Journey
**Current State Pain Points:**
1. Order information scattered across multiple channels
2. Manual order processing is error-prone
3. Document management is inefficient
4. Customer communication is reactive

**Future State Journey:**
1. **Order Receipt**: Automated notification with complete order details
2. **Processing**: Digital workflow with status updates
3. **Fulfillment**: Integrated shipping and tracking
4. **Documentation**: Digital document upload and sharing
5. **Follow-up**: Automated customer satisfaction tracking

### 4.3 Use Cases and Scenarios

#### 4.3.1 Primary Use Cases

**UC001: Station Places Order**
- Actor: Station Staff
- Precondition: User authenticated, articles available
- Main Flow: Browse catalog → Add to cart → Submit order → Track progress
- Alternative Flows: Modify order, cancel order, reorder from history

**UC002: Supplier Processes Order**
- Actor: Supplier Staff
- Precondition: Order received, user authenticated
- Main Flow: Review order → Confirm → Ship → Upload documents
- Alternative Flows: Reject order, partial fulfillment, handle exceptions

**UC003: Inter-Station Transfer**
- Actor: Station Staff (both source and destination)
- Precondition: Stock available, transfer authorized
- Main Flow: Request transfer → Approve → Ship → Receive
- Alternative Flows: Reject request, modify quantities, handle damages

#### 4.3.2 Edge Cases
- Emergency orders outside normal workflow
- Supplier unavailability and alternative sourcing
- Quality issues and return processes
- System downtime and offline capabilities
- Bulk operations and data imports

## 5. Functional Requirements (Epics & User Stories)

### Epic 1: Identity & Access Management

#### User Story 1.1: User Registration
**As a** Manager or Gestionnaire,
**I want to** create new user accounts for employees and partners,
**so that** I can grant appropriate access to the system based on their roles.

**Acceptance Criteria:**
1. User account creation requires unique email, full name (`nomComplet`), role, and password
2. Password must meet security requirements (minimum 6 characters, will be enhanced to 8+ with complexity)
3. Email must be valid format and unique across the system
4. Role must be one of: Manager, Gestionnaire, Station, Fournisseur
5. Station and Fournisseur roles require associated entity assignment (`entiteId`)
6. System prevents duplicate email registrations
7. Passwords are securely hashed using bcrypt with salt rounds
8. New accounts default to active status (`isActive: true`)
9. Account creation triggers audit log entry with creator information
10. Email notifications sent to new users with login instructions

**Technical Implementation:**
- Express-validator for input validation
- Bcrypt password hashing with 10 salt rounds
- Mongoose unique constraints on email field
- Dynamic entity reference validation based on role

#### User Story 1.2: User Authentication
**As a** User,
**I want to** securely log in to the application,
**so that** I can access role-appropriate features and data.

**Acceptance Criteria:**
1. Login interface accepts email and password
2. System generates JWT token upon successful authentication
3. JWT contains user ID, role, and entity ID for session management
4. Token expiration set to 24 hours with automatic renewal capability
5. Authentication response includes user profile and permissions
6. Failed login attempts return clear, secure error messages
7. Inactive users (`isActive: false`) cannot authenticate
8. Session data persists across browser sessions via localStorage
9. Automatic token refresh before expiration
10. Logout clears all session data and invalidates tokens

**Security Features:**
- JWT tokens with HS256 signing
- Automatic token validation on protected routes
- Rate limiting on authentication endpoints
- Account lockout after multiple failed attempts

#### User Story 1.3: User Account Management
**As a** Manager or Gestionnaire,
**I want to** manage user account lifecycle (activate, deactivate, update),
**so that** I can maintain appropriate access control as staff changes.

**Acceptance Criteria:**
1. Deactivation uses soft delete pattern (`isActive: false`)
2. Deactivated users cannot login or access API endpoints
3. Reactivation restores full account functionality
4. User history and data preserved during deactivation
5. Cascade deactivation for supplier users when supplier is deactivated
6. Bulk operations for managing multiple accounts
7. Account update notifications to affected users
8. Audit trail for all account status changes

#### User Story 1.4: Session Management
**As a** User,
**I want to** have a secure and persistent session,
**so that** I don't lose my work due to authentication issues.

**Acceptance Criteria:**
1. Session automatically extends with user activity
2. Warning before session expiration with extension option
3. Graceful handling of expired sessions
4. Concurrent session management (multiple browser tabs)
5. Device-based session tracking for security
6. Forced logout capability for administrators

### Epic 2: Entity Management (Stations & Suppliers)

#### User Story 2.1: Station Management
**As a** Manager or Gestionnaire,
**I want to** manage cooperative stations,
**so that** I can maintain accurate organizational structure.

**Acceptance Criteria:**
1. Station creation with required fields: name, internal identifier, address, primary contact
2. Unique constraints on station name and internal identifier
3. Complete address information including street, postal code, city, country
4. Primary contact with name, email, and telephone
5. Active/inactive status management with cascade implications
6. Station deactivation affects associated users and orders
7. Comprehensive search and filtering capabilities
8. Bulk operations for station management
9. Export capabilities for reporting and integration

#### User Story 2.2: Supplier Management
**As a** Manager or Gestionnaire,
**I want to** manage supplier relationships,
**so that** I can maintain a reliable supply network.

**Acceptance Criteria:**
1. Supplier creation with name, SIRET, specialization
2. Multiple sites per supplier with individual contact information
3. Document management for certifications and agreements
4. Site-specific information including addresses and contacts
5. Principal site designation for primary operations
6. Cascade deactivation: supplier → sites → users
7. Document upload and management (PDFs, certificates)
8. Supplier performance tracking and rating
9. Integration with article pricing and availability

#### User Story 2.3: Document Management
**As a** Supplier Representative,
**I want to** upload and manage relevant documents,
**so that** I can maintain compliance and provide transparency.

**Acceptance Criteria:**
1. Document upload to MinIO storage with metadata
2. Support for PDF documents with preview capability
3. Document categorization (certifications, agreements, technical specs)
4. Version control and expiration date tracking
5. Access control based on user roles and relationships
6. Document viewer integration in the application
7. Automatic cleanup of expired documents
8. Bulk document operations

### Epic 3: Article Catalog Management

#### User Story 3.1: Article Creation and Management
**As a** Manager or Gestionnaire,
**I want to** maintain a comprehensive article catalog,
**so that** stations can order from standardized products.

**Acceptance Criteria:**
1. Article creation with unique code, designation, and category
2. Category management from predefined list (Alvéole, Barquette, Etiquette, Film, Plaques)
3. Multiple supplier associations per article with distinct pricing
4. Supplier-specific information: reference codes, pricing, packaging details
5. Image upload and management for articles
6. Active/inactive status with impact on ordering capabilities
7. Bulk import/export capabilities for catalog management
8. Search and filtering across all article attributes
9. Price history tracking and analysis
10. Integration with supplier catalogs and pricing updates

#### User Story 3.2: Multi-Supplier Pricing
**As a** Procurement Specialist,
**I want to** compare pricing across suppliers for each article,
**so that** I can make cost-effective purchasing decisions.

**Acceptance Criteria:**
1. Multiple supplier entries per article with individual pricing
2. Supplier-specific reference codes and packaging information
3. Price comparison tools and analytics
4. Historical pricing data for trend analysis
5. Automated price update notifications
6. Volume-based pricing tiers
7. Currency and unit of measure standardization
8. Price validity periods and expiration management

#### User Story 3.3: Article Search and Discovery
**As a** Station Staff member,
**I want to** easily find and browse articles,
**so that** I can quickly build orders for my station.

**Acceptance Criteria:**
1. Advanced search with multiple filters (category, supplier, price range)
2. Free-text search across designation and supplier information
3. Category-based browsing with visual organization
4. Recently ordered and favorite article shortcuts
5. Supplier availability indicators
6. Mobile-responsive catalog interface
7. Barcode scanning capability for quick lookup
8. Integration with ordering workflow

### Epic 4: Shopping Cart and Order Creation

#### User Story 4.1: Shopping Cart Management
**As a** Station Staff member,
**I want to** build orders using a shopping cart interface,
**so that** I can efficiently manage multiple items before submitting.

**Acceptance Criteria:**
1. Add articles to cart with quantity selection
2. Multiple supplier items in single cart session
3. Real-time pricing calculation and total display
4. Cart persistence across browser sessions
5. Quantity modification and item removal
6. Supplier-based cart organization and splitting
7. Save cart as draft for later completion
8. Cart validation before order submission
9. Integration with article catalog and search
10. Mobile-optimized cart interface

#### User Story 4.2: Order Submission and Validation
**As a** Station Staff member,
**I want to** submit my cart as formal orders,
**so that** suppliers receive accurate purchase requests.

**Acceptance Criteria:**
1. Cart automatically split into separate orders per supplier
2. Global order creation linking related supplier orders
3. Unique order number generation for tracking
4. Order total calculation with validation
5. Submission confirmation with order details
6. Email notifications to relevant parties
7. Order history and reorder capabilities
8. Integration with approval workflows if required
9. Order modification capabilities within time limits
10. Exception handling for unavailable items

### Epic 5: Order Lifecycle Management

#### User Story 5.1: Order Status Workflow
**As a** Stakeholder (Station/Supplier/Manager),
**I want to** track orders through their complete lifecycle,
**so that** I have visibility into fulfillment progress.

**Acceptance Criteria:**
1. Seven-stage workflow: Enregistrée → Confirmée → Expédiée → Réceptionnée → Clôturée → Facturée → Archivée
2. Role-based status transition permissions
3. Required information for each status transition
4. Automatic status history tracking with timestamps and users
5. Email notifications for status changes
6. Status aggregation for global orders
7. Exception handling and rejection workflows
8. Bulk status updates for efficiency
9. SLA tracking and performance metrics
10. Integration with supplier and logistics systems

#### User Story 5.2: Order Confirmation by Suppliers
**As a** Supplier Representative,
**I want to** confirm orders with delivery details,
**so that** customers have accurate expectations.

**Acceptance Criteria:**
1. Order review interface with complete details
2. Line-by-line confirmation with delivery dates
3. Partial confirmation for unavailable items
4. Pricing validation and adjustment capabilities
5. Delivery date commitments
6. Rejection workflow with reason codes
7. Alternative product suggestions
8. Confirmation deadline management
9. Automatic escalation for overdue confirmations
10. Integration with supplier inventory systems

#### User Story 5.3: Shipping and Delivery Management
**As a** Supplier Representative,
**I want to** manage shipping and provide tracking information,
**so that** customers can prepare for deliveries.

**Acceptance Criteria:**
1. Shipping status update with carrier and tracking number
2. Delivery document upload (delivery notes, invoices)
3. Estimated and actual delivery date tracking
4. Integration with shipping carrier APIs
5. Delivery confirmation requirements
6. Exception handling for shipping issues
7. Proof of delivery documentation
8. Customer notification automation
9. Damage and loss reporting workflows
10. Performance analytics for shipping efficiency

#### User Story 5.4: Order Reception and Quality Control
**As a** Station Staff member,
**I want to** receive and validate delivered orders,
**so that** I can ensure quality and update inventory.

**Acceptance Criteria:**
1. Reception interface with order and delivery details
2. Quantity verification and discrepancy reporting
3. Quality control checklist and photo documentation
4. Non-conformity reporting with supplier notification
5. Signed delivery note upload for proof of receipt
6. Automatic stock level updates upon reception
7. Partial reception handling
8. Rejection and return workflows
9. Integration with inventory management
10. Performance metrics for reception efficiency

### Epic 6: Inter-Station Transfer Management

#### User Story 6.1: Transfer Request Creation
**As a** Station Staff member,
**I want to** request stock transfers from other stations,
**so that** I can optimize inventory distribution.

**Acceptance Criteria:**
1. Transfer request creation with source and destination stations
2. Multi-article transfer requests with quantities
3. Justification and priority level assignment
4. Stock availability checking at source station
5. Unique transfer reference generation
6. Request validation and submission
7. Automatic notifications to source station
8. Request modification within time limits
9. Integration with inventory visibility
10. Transfer request history and analytics

#### User Story 6.2: Transfer Request Processing
**As a** Source Station Staff member,
**I want to** review and process transfer requests,
**so that** I can support network-wide inventory optimization.

**Acceptance Criteria:**
1. Transfer request review interface with complete details
2. Stock availability verification
3. Approval/rejection workflow with reason codes
4. Quantity modification capabilities
5. Priority-based request queue management
6. Bulk processing for multiple requests
7. Alternative suggestions for unavailable items
8. Request escalation for complex cases
9. Performance tracking for response times
10. Integration with local inventory planning

#### User Story 6.3: Transfer Execution and Tracking
**As a** Station Staff member (source or destination),
**I want to** execute and track approved transfers,
**so that** physical movement matches system records.

**Acceptance Criteria:**
1. Transfer execution workflow with status updates
2. Shipping documentation and tracking
3. Real-time status visibility for both stations
4. Inventory updates at shipment and receipt
5. Quality control and discrepancy reporting
6. Photo documentation for condition verification
7. Exception handling for damages or losses
8. Performance metrics for transfer efficiency
9. Integration with logistics planning
10. Cost allocation and billing if applicable

### Epic 7: Inventory Management

#### User Story 7.1: Stock Level Tracking
**As a** Station Staff member,
**I want to** monitor current stock levels,
**so that** I can make informed ordering and transfer decisions.

**Acceptance Criteria:**
1. Real-time stock level display by article and location
2. Low stock alerts and reorder point notifications
3. Historical stock movement tracking
4. Integration with order and transfer activities
5. Manual stock adjustment capabilities
6. Cycle counting and inventory reconciliation
7. Stock valuation and aging analysis
8. Multi-location visibility for transfer planning
9. Mobile interface for warehouse operations
10. Export capabilities for external analysis

#### User Story 7.2: Inventory Forecasting
**As a** Manager or Gestionnaire,
**I want to** forecast demand and plan inventory,
**so that** I can optimize stock levels across the network.

**Acceptance Criteria:**
1. Campaign-based forecasting (e.g., seasonal periods)
2. Weekly demand planning with quantity estimates
3. Historical consumption analysis
4. Multi-factor forecasting (seasonality, trends, events)
5. Collaborative forecasting with station input
6. Forecast accuracy tracking and improvement
7. Automatic reorder point calculation
8. Integration with supplier capacity planning
9. Exception reporting for demand anomalies
10. Forecasting model performance analytics

### Epic 8: Analytics and Reporting

#### User Story 8.1: Operational Dashboards
**As a** Manager or Gestionnaire,
**I want to** monitor system performance through dashboards,
**so that** I can identify issues and opportunities.

**Acceptance Criteria:**
1. Real-time KPI dashboard with key metrics
2. Order processing performance indicators
3. Supplier performance scorecards
4. Inventory turnover and optimization metrics
5. User activity and adoption analytics
6. Exception and alert monitoring
7. Customizable dashboard layouts
8. Mobile-responsive dashboard design
9. Automated report generation and distribution
10. Integration with external BI tools

#### User Story 8.2: Financial Reporting
**As a** Manager or Finance Team member,
**I want to** analyze costs and financial performance,
**so that** I can optimize procurement spending.

**Acceptance Criteria:**
1. Spend analysis by supplier, category, and station
2. Cost trend analysis and budget variance reporting
3. Savings tracking from process improvements
4. Supplier performance vs. cost analysis
5. Inventory carrying cost calculations
6. Price inflation and market trend analysis
7. Contract compliance and pricing verification
8. Export capabilities for financial system integration
9. Multi-currency support for international suppliers
10. Audit trail and compliance reporting

### Epic 2: Article & Supplier Management

#### User Story 2.1: Article Catalog Management
*   **As an** Administrator,
*   **I want to** create and manage a central catalog of packaging articles,
*   **so that** all stations order from a standardized list.

**Acceptance Criteria:**
1.  An article is defined by a unique `codeArticle` and a `designation` (name).
2.  An article can be assigned to a `categorie` (e.g., "Cartons", "Sachets").
3.  An article can be associated with one or more suppliers.
4.  For each associated supplier, the following information must be stored:
    *   Supplier ID (`fournisseurId`).
    *   Supplier-specific reference code (`referenceFournisseur`).
    *   Unit price (`prixUnitaire`).
    *   Packaging information (`uniteConditionnement`, `quantiteParConditionnement`).
    *   An optional image URL and associated technical documents.
5.  Articles can be marked as active or inactive. Inactive articles should not appear in selection lists for new orders.

### Epic 3: Order Lifecycle Management

#### User Story 3.1: Create a Station Order
*   **As** Station Staff,
*   **I want to** create a new order for articles from a specific supplier,
*   **so that** I can replenish my station's stock.

**Acceptance Criteria:**
1.  An order is created for a single station and a single supplier.
2.  The order must contain at least one article line.
3.  Each article line must specify:
    *   The article ID (`articleId`).
    *   The quantity ordered (`quantiteCommandee`).
    *   The unit price at the time of order (`prixUnitaire`).
4.  The system must generate a unique, human-readable order number (`numeroCommande`).
5.  The initial status of a new order is **"Enregistrée"** (Registered).
6.  The total order amount (`montantTotalHT`) is calculated and stored.
7.  An entry is added to the order's status history (`historiqueStatuts`).

#### User Story 3.2: Process an Order
*   **As** Supplier Staff or an Administrator,
*   **I want to** update the status of an order as it moves through the fulfillment process,
*   **so that** all stakeholders have real-time visibility.

**Acceptance Criteria:**
1.  The order workflow follows a strict sequence of statuses: `Enregistrée` -> `Confirmée` -> `Expédiée` -> `Réceptionnée` -> `Clôturée`.
2.  **Transition to "Confirmée"**:
    *   Can be performed by a Supplier or Admin.
    *   Requires confirming the delivery date (`dateLivraisonConfirmee`) for each article line.
3.  **Transition to "Expédiée"**:
    *   Can be performed by a Supplier or Admin.
    *   Requires providing shipping information: `transporteur`, `numeroSuivi`, and a URL to the shipping document (`bonLivraisonUrl`).
4.  **Transition to "Réceptionnée"**:
    *   Can be performed by Station Staff or an Admin.
    *   Requires specifying the quantity received (`quantiteRecue`) for each article line.
    *   Requires uploading a signed delivery note (`bonLivraisonEmargeUrl`).
    *   The user can optionally report non-conformities (`nonConformitesReception`).
5.  Each status change must be logged in the `historiqueStatuts` with the user ID and timestamp.

### Epic 4: Inter-Station Stock Transfers

#### User Story 4.1: Request a Stock Transfer
*   **As** Station Staff,
*   **I want to** request a transfer of articles from another station,
*   **so that** I can quickly acquire stock without placing a new supplier order.

**Acceptance Criteria:**
1.  A transfer request is created by a destination station (`stationDestinationId`) and targets a source station (`stationSourceId`).
2.  The request must contain one or more articles with the quantity requested (`quantiteDemandee`).
3.  The system generates a unique transfer reference number (`referenceTransfert`).
4.  The initial status of the request is **"Enregistrée"**.

#### User Story 4.2: Process a Stock Transfer
*   **As** Staff from the source or destination station,
*   **I want to** update the status of a transfer request,
*   **so that** the physical movement of goods is accurately reflected in the system.

**Acceptance Criteria:**
1.  The transfer workflow follows a sequence of statuses: `Enregistrée` -> `Confirmée` / `Rejetée` -> `Expédiée` -> `Réceptionnée` -> `Clôturée`.
2.  **Transition to "Confirmée" or "Rejetée"** (by Source Station Staff):
    *   To confirm, the source station must specify the quantity they agree to send (`quantiteConfirmee`) for each article.
    *   To reject, the source station must provide a reason (`motifRejet`).
3.  **Transition to "Expédiée"** (by Source Station Staff):
    *   Requires uploading a shipping document (`bonLivraisonUrl`).
    *   This action should logically decrement the stock at the source station (See Epic 5).
4.  **Transition to "Réceptionnée"** (by Destination Station Staff):
    *   Requires specifying the quantity received (`quantiteRecue`) for each article.
    *   Requires uploading a signed delivery note (`bonLivraisonEmargeUrl`).
    *   This action should logically increment the stock at the destination station (See Epic 5).

### Epic 5: Inventory Management

#### User Story 5.1: Track Station Stock
*   **As** Station Staff or an Administrator,
*   **I want to** view the current inventory levels for any article at a specific station,
*   **so that** I can make informed decisions about ordering and transfers.

**Acceptance Criteria:**
1.  The system maintains a `StockStation` collection that links a `stationId`, an `articleId`, and a `quantite`.
2.  Stock levels must be automatically updated when a transfer is **shipped** (stock decreases at source) and **received** (stock increases at destination).
3.  Stock levels must be automatically updated when a supplier order is **received** (stock increases at the station).
4.  The system must provide an interface to perform manual stock adjustments or initial stock takes (`dateInventaire`).

## 6. Data Requirements

### 6.1 Data Model Overview

**Core Entities:**
- **Users**: Authentication and role management
- **Stations**: Cooperative operational locations
- **Fournisseurs**: Supplier organizations with multiple sites
- **Articles**: Product catalog with multi-supplier relationships
- **Commandes**: Individual supplier orders
- **CommandesGlobales**: Aggregated station orders
- **DemandesTransfert**: Inter-station transfer requests
- **Stocks**: Inventory levels by location and article
- **Previsions**: Demand forecasting data
- **ListesAchat**: Shopping cart functionality

**Data Relationships:**
- Users have dynamic associations with Stations or Fournisseurs
- Articles support many-to-many relationships with Fournisseurs
- Orders aggregate into Global Orders for station-level management
- Stock levels maintained separately for Stations and Suppliers
- Transfer requests create audit trails between stations

### 6.2 Data Specifications

#### 6.2.1 User Entity
- **email**: String, unique, required, validated format
- **password**: String, required, bcrypt hashed
- **nomComplet**: String, required, full name
- **role**: Enum (Manager, Gestionnaire, Station, Fournisseur)
- **entiteId**: ObjectId, dynamic reference based on role
- **entiteModel**: String, specifies reference type
- **isActive**: Boolean, soft delete flag
- **Audit**: createdAt, updatedAt timestamps

#### 6.2.2 Article Entity
- **codeArticle**: String, unique, required identifier
- **designation**: String, required, product name
- **categorie**: Enum (predefined packaging categories)
- **isActive**: Boolean, controls availability
- **fournisseurs**: Array of supplier relationships with embedded pricing
- **Audit**: creation and modification tracking

#### 6.2.3 Order Workflow Entities
- **numeroCommande**: String, unique, human-readable
- **statut**: Enum, workflow state management
- **historiqueStatuts**: Array, complete audit trail
- **articles**: Embedded order lines with pricing
- **montantTotalHT**: Calculated total amount
- **Shipping/Reception**: Document URLs and metadata

### 6.3 Data Validation Rules

**Field-Level Validation:**
- Email format and uniqueness validation
- Password complexity requirements
- Required field enforcement
- Numeric range validations
- Date format and logical validations

**Business Logic Validation:**
- Role-based entity association requirements
- Workflow state transition rules
- Inventory quantity logical constraints
- Price and amount calculation verification
- Document upload type and size restrictions

**Cross-Entity Validation:**
- Order total consistency across line items
- Stock level adequacy for transfer requests
- User permission validation for entity access
- Supplier availability for article associations

### 6.4 Data Migration & Import

**Seeding Strategy:**
- Comprehensive test data generation for development
- Realistic supplier and article data from industry sources
- User account creation with proper role associations
- Sample orders and transfers for workflow testing
- Performance testing data sets for scalability validation

**Import Capabilities:**
- CSV import for articles with supplier associations
- Bulk user creation with role assignments
- Supplier catalog integration and synchronization
- Price update imports with validation
- Historical data migration from legacy systems

## 7. Integration Requirements

### 7.1 External System Integrations

#### 7.1.1 MinIO Object Storage
- **Purpose**: Document and image storage
- **Integration Type**: S3-compatible API
- **Data Exchange**: Binary files (PDFs, images)
- **Authentication**: Access key based
- **Error Handling**: Retry logic and fallback strategies

#### 7.1.2 Email Service Integration
- **Purpose**: Notifications and communications
- **Integration Type**: SMTP or API-based service
- **Data Exchange**: HTML/text email content
- **Authentication**: Service-specific credentials
- **Templates**: Standardized email templates for workflows

#### 7.1.3 Future ERP Integration
- **Purpose**: Financial and operational data synchronization
- **Integration Type**: REST API or file-based
- **Data Exchange**: Orders, invoices, inventory updates
- **Authentication**: OAuth 2.0 or API keys
- **Frequency**: Real-time and batch processing

### 7.2 API Requirements

**API Design Standards:**
- RESTful architecture with consistent resource naming
- JSON data format for all exchanges
- HTTP status codes for standardized responses
- Pagination for large data sets (limit: 100 items)
- Rate limiting to prevent abuse
- Comprehensive error response format

**Authentication & Security:**
- JWT token-based authentication
- Role-based endpoint access control
- HTTPS enforcement for all communications
- Input validation and sanitization
- SQL injection and XSS protection

**Documentation & Testing:**
- OpenAPI/Swagger specification
- Interactive API documentation
- Automated testing for all endpoints
- Integration testing with realistic data
- Performance testing under load

## 8. Non-Functional Requirements

### 8.1 Performance Requirements

**Response Time Targets:**
- API responses: < 500ms for simple queries
- Complex searches: < 2 seconds
- Page load times: < 3 seconds initial, < 1 second navigation
- File uploads: Progress indicators for files > 1MB
- Dashboard refresh: < 1 second for cached data

**Throughput Requirements:**
- Concurrent users: 100+ simultaneous active users
- Order processing: 1000+ orders per hour
- Database queries: 10,000+ queries per hour
- File storage: 10GB+ document storage capacity
- Network bandwidth: Optimized for rural internet connections

**Scalability Targets:**
- Horizontal scaling capability for application tier
- Database partitioning for large data sets
- CDN integration for static assets
- Caching strategies for frequently accessed data
- Load balancing for high availability

### 8.2 Security Requirements

**Data Protection:**
- Encryption at rest for sensitive data
- Encryption in transit (HTTPS/TLS 1.3)
- Password hashing with bcrypt (salt rounds: 10+)
- Secure session management
- Data anonymization for development/testing

**Access Control:**
- Multi-factor authentication for administrative accounts
- Role-based access control with principle of least privilege
- Session timeout and automatic logout
- Account lockout after failed login attempts
- Audit logging for all security events

**Infrastructure Security:**
- Firewall configuration and network segmentation
- Regular security updates and patch management
- Vulnerability scanning and penetration testing
- Backup encryption and secure storage
- Incident response and recovery procedures

### 8.3 Reliability & Availability

**Uptime Requirements:**
- 99.5% availability during business hours (8 AM - 8 PM)
- 99% availability during extended hours
- Maximum 4 hours downtime per month for maintenance
- Recovery time objective (RTO): < 2 hours
- Recovery point objective (RPO): < 15 minutes

**Backup & Recovery:**
- Daily automated database backups
- Real-time file storage replication
- Point-in-time recovery capability
- Disaster recovery testing quarterly
- Cross-region backup storage

**Monitoring & Alerting:**
- Real-time application performance monitoring
- Database performance and capacity monitoring
- Infrastructure health monitoring
- User experience monitoring
- Automated alerting for critical issues

### 8.4 Usability Requirements

**User Experience Standards:**
- Intuitive navigation with < 3 clicks to any feature
- Responsive design for desktop, tablet, and mobile
- Accessibility compliance (WCAG 2.1 Level AA)
- Progressive web app capabilities
- Offline functionality for critical operations

**User Interface Guidelines:**
- Consistent design language and component library
- Fast loading with skeleton screens and optimistic updates
- Clear error messages and recovery guidance
- Contextual help and onboarding flows
- Keyboard navigation support

**Performance Perception:**
- Loading indicators for operations > 500ms
- Optimistic UI updates for immediate feedback
- Progressive disclosure for complex forms
- Debounced search with real-time results
- Cached data for frequently accessed information

### 8.5 Compatibility Requirements

**Browser Support:**
- Chrome 90+ (primary target)
- Firefox 88+ (secondary support)
- Safari 14+ (secondary support)
- Edge 90+ (secondary support)
- Mobile browsers on iOS 14+ and Android 10+

**Device Compatibility:**
- Desktop: 1024x768 minimum resolution
- Tablet: iPad and Android tablets
- Mobile: iOS and Android smartphones
- Touch-friendly interface design
- High-DPI display support

**Operating System:**
- Backend: Linux (Ubuntu 20.04 LTS or equivalent)
- Database: MongoDB 4.4+
- Container: Docker and Docker Compose
- Cloud: Compatible with major cloud providers

### 8.6 Compliance & Regulatory Requirements

**Data Privacy:**
- GDPR compliance for EU data subjects
- Data minimization and purpose limitation
- Right to erasure and data portability
- Privacy by design implementation
- Data processing agreements with suppliers

**Business Compliance:**
- Audit trail requirements for financial transactions
- Document retention policies
- Anti-corruption and fair trading compliance
- Environmental reporting capabilities
- Industry-specific packaging regulations

**Technical Compliance:**
- ISO 27001 information security management
- SOC 2 Type II controls and reporting
- PCI DSS compliance if handling payments
- Accessibility standards (WCAG 2.1)
- Open source license compliance

## 9. Success Metrics & KPIs

### 9.1 Business Metrics

**Operational Efficiency:**
- Order processing time reduction: Target 40%
- Inventory turnover improvement: Target 25%
- Stockout incident reduction: Target 30%
- Manual process elimination: Target 80%
- Cost per transaction reduction: Target 20%

**User Adoption:**
- Active user ratio: Target 95% within 3 months
- Feature utilization rate: Target 80% for core features
- User satisfaction score: Target 8.5/10
- Training completion rate: Target 100%
- Support ticket volume: < 5% of total transactions

**Financial Impact:**
- Total cost of ownership reduction: Target 15%
- Procurement cost savings: Target 10%
- Administrative cost reduction: Target 30%
- Return on investment: Target 200% within 2 years
- Payback period: Target 18 months

### 9.2 Technical Metrics

**Performance:**
- Average response time: < 500ms
- 95th percentile response time: < 2 seconds
- System availability: > 99.5%
- Error rate: < 0.1% of transactions
- User session duration: > 15 minutes average

**Quality:**
- Bug density: < 1 critical bug per 1000 function points
- Security vulnerability score: Zero critical/high severity
- Code coverage: > 80% for backend, > 70% for frontend
- Performance regression: < 5% between releases
- User-reported issues: < 2% of total transactions

### 9.3 User Experience Metrics

**Usability:**
- Task completion rate: > 95% for core workflows
- Time to complete key tasks: 50% reduction from baseline
- User error rate: < 5% of user actions
- Help documentation usage: < 10% of users per session
- Mobile usage satisfaction: > 8/10 rating

**Engagement:**
- Daily active users: > 80% of registered users
- Feature adoption rate: > 70% within 30 days
- User retention rate: > 90% after 6 months
- Session frequency: > 3 sessions per week per active user
- User-generated content: > 50% of eligible actions

These comprehensive requirements provide a detailed foundation for building a world-class packaging management system that will transform cooperative operations and deliver measurable business value.