# Architecture Requirement Dossier (ARD) - Gestion Emballages

## 1. System Overview

The Gestion Emballages application is designed as a modern, containerized web application with a clear separation of concerns between its components. The architecture is composed of four primary services: a frontend web client, a backend API, a database, and an object storage service.

This architecture is designed for scalability, maintainability, and deployment flexibility, using Docker for local development and a Platform-as-a-Service (PaaS) provider like Render for production.

## 2. Technology Stack

| Component         | Technology / Framework                                       | Description                                                              |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| **Frontend**      | Vue.js (v3), Vite, Pinia, TailwindCSS, Axios                 | A reactive Single Page Application (SPA) for a dynamic user experience.  |
| **Backend**       | Node.js, Express.js, Mongoose                                | A RESTful API server to handle business logic and data processing.       |
| **Database**      | MongoDB                                                      | A NoSQL document database to store application data like users and orders. |
| **Object Storage**| Minio                                                        | An S3-compatible object storage for handling file uploads.               |
| **Deployment**    | Docker (with Docker Compose), Render.io                      | Containerization for consistent environments and PaaS for managed hosting. |

## 3. Architectural Diagram (Logical)

The following diagram illustrates the logical flow of communication between the system's components.

```
[User via Browser]
       |
       v
[Frontend (Vue.js on Render Static Hosting)]
       |  (HTTPS API Requests)
       v
[Backend (Node.js on Render Web Service)]
       |
       +------------------+
       |                  |
       v                  v
[Database]         [Object Storage]
(MongoDB on          (Minio on
Render Private Svc)  Render Private Svc)
```

## 4. Component Breakdown

### 4.1. Frontend
- **Framework:** Vue.js (Composition API).
- **Build Tool:** Vite for fast development and optimized builds.
- **State Management:** Pinia for centralized, type-safe state management (e.g., user session, cached data).
- **Styling:** TailwindCSS for a utility-first, responsive design system.
- **API Communication:** Axios for making HTTP requests to the backend API.
- **Deployment:** Served as a static site, with routing rules to proxy API calls to the backend.

### 4.2. Backend
- **Framework:** Express.js running on Node.js.
- **Architecture:** Follows a standard Model-Service-Controller pattern:
    - **`routes/`**: Defines the API endpoints.
    - **`controllers/`**: Handles incoming requests, validates input, and calls services.
    - **`services/`**: Contains the core business logic.
    - **`models/`**: Defines the Mongoose schemas for database collections.
    - **`middleware/`**: Handles cross-cutting concerns like authentication (`authMiddleware.js`) and error handling.
- **Database Interaction:** Mongoose is used as the Object Document Mapper (ODM) for MongoDB.
- **Authentication:** Implemented using JSON Web Tokens (JWT).

### 4.3. Database
- **Type:** MongoDB (NoSQL Document Store).
- **Schema:** Data is structured into collections defined by Mongoose models, including: `users`, `articles`, `stations`, `fournisseurs`, `commandes`, `stocks`, etc.
- **Deployment:** Runs as a containerized, private service with a persistent disk to ensure data durability.

### 4.4. Object Storage
- **Type:** Minio (S3-Compatible).
- **Purpose:** Stores all user-uploaded binary files (images, documents, etc.).
- **Deployment:** Runs as a containerized, private service with a persistent disk. The backend communicates with it using the S3 protocol.

## 5. Deployment Strategy
- **Local Development:** The entire stack is orchestrated using `docker-compose.yml`, allowing developers to run the full application with a single command.
- **Production:** The application is deployed to Render using the `render.yaml` blueprint file. This automates the deployment of all four services, including the provisioning of persistent disks for the database and storage, ensuring a production-ready setup.
