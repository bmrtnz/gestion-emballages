# Product Requirement Dossier (PRD) - Gestion Emballages

## 1. Introduction

### 1.1. Project Vision
**Gestion Emballages** is a comprehensive web application designed to be the central nervous system for managing packaging materials across a network of operational stations and external suppliers. The system aims to replace manual, error-prone processes with a streamlined, digital workflow. It provides real-time visibility into stock levels, automates order processing, facilitates inter-station transfers, and offers data-driven insights for forecasting and procurement.

### 1.2. Target Audience
The primary users of this application are:
*   **Administrators/Managers:** Oversee the entire system, manage master data (users, articles, entities), and have visibility into all operations.
*   **Station Staff:** Responsible for day-to-day inventory management at their specific location. Their primary tasks are ordering new stock and managing internal transfers.
*   **Supplier Staff:** External users who receive and process orders for the articles they provide.

---

## 2. User Roles & Permissions

The system is built around a role-based access control (RBAC) model.

| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Admin** | Super user with unrestricted access. | - Create/Read/Update/Delete (CRUD) on all data: Users, Articles, Stations, Suppliers.<br>- View and manage all orders and transfers.<br>- Access system-wide dashboards and reports. |
| **Station** | User associated with a specific operational station. | - Create and manage orders for their station.<br>- Create and manage stock transfer requests (both sending and receiving).<br>- View and manage their station's inventory.<br>- View the global article catalog. |
| **Fournisseur** | User associated with a specific supplier company. | - View and process incoming orders assigned to them.<br>- Update the status of their orders (e.g., confirm, ship).<br>- Manage their specific article information (e.g., pricing, references). |

---

## 3. Functional Requirements (Epics & User Stories)

### Epic 1: Identity & Access Management

#### User Story 1.1: User Registration
*   **As an** Administrator,
*   **I want to** create new user accounts,
*   **so that** I can grant access to new employees and partners.

**Acceptance Criteria:**
1.  A user account is defined by a unique email address, a full name (`nomComplet`), a role, and a password.
2.  The password must be at least 6 characters long.
3.  The email address must be in a valid format.
4.  The role must be one of the predefined system roles (`Admin`, `Station`, `Fournisseur`).
5.  If the role is `Station` or `Fournisseur`, an associated entity (`entiteId`) from the list of stations or suppliers **must** be assigned.
6.  A user cannot be created if an account with the same email already exists.
7.  The password must be securely hashed before being stored in the database.
8.  By default, a new user account is created with an `isActive` status of `true`.

#### User Story 1.2: User Authentication
*   **As a** User,
*   **I want to** log in to the application with my email and password,
*   **so that** I can access the features corresponding to my role.

**Acceptance Criteria:**
1.  The system must provide a login interface for entering an email and password.
2.  Upon successful authentication, the system generates a JSON Web Token (JWT).
3.  The JWT payload must contain the user's ID, role, and associated entity ID (`entiteId`).
4.  The JWT must have an expiration period (e.g., 24 hours).
5.  The user's profile information (name, email, role) and the JWT are returned to the client.
6.  If authentication fails (invalid credentials), a clear error message is displayed.
7.  Users with an `isActive` status of `false` cannot log in.

#### User Story 1.3: User Deactivation/Reactivation
*   **As an** Administrator,
*   **I want to** deactivate and reactivate user accounts,
*   **so that** I can manage access for employees who leave or return.

**Acceptance Criteria:**
1.  Deactivation is a "soft delete." The user's `isActive` flag is set to `false`.
2.  A deactivated user cannot log in or access any API endpoints.
3.  An administrator can reactivate an account by setting the `isActive` flag back to `true`.
4.  The user's data and history remain in the system upon deactivation.

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

## 4. Non-Functional Requirements

*   **Security:** All API endpoints must be protected and accessible only to authenticated users with the appropriate roles. Input data must be validated to prevent injection attacks.
*   **Performance:** API responses, especially for lists (users, orders), must be paginated to ensure fast load times. Database queries should be optimized with indexes on frequently searched fields.
*   **Usability:** The user interface must be responsive and provide clear feedback to the user (e.g., loading indicators, success/error notifications).
*   **Auditability:** All significant actions (status changes, creation, updates) must be timestamped and associated with the user who performed the action.