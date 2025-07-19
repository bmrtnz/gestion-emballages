# Design Dossier (DD) - Gestion Emballages

## 1. Design Philosophy & Approach

The design of the Gestion Emballages application prioritizes **functionality, clarity, and efficiency**. As a data-intensive, business-oriented tool, the user interface (UI) is crafted to be clean, intuitive, and responsive.

The core design principles are:
- **Utility-First:** Leveraging TailwindCSS, the design is built from low-level utility classes, ensuring consistency and rapid development.
- **Component-Based:** The UI is a collection of reusable Vue.js components, which simplifies maintenance and ensures a consistent look and feel.
- **Responsive:** The application is designed to be fully usable across a range of screen sizes, from mobile devices to large desktop monitors.
- **Data-Driven:** The primary focus is on presenting data clearly through tables, forms, and dashboards, enabling users to perform their tasks efficiently.

## 2. Layout & Views

### 2.1. Main Layout
The application uses a consistent global layout, which includes:
- **A persistent navigation sidebar/header:** Provides access to all major sections of the application (e.g., Dashboard, Articles, Orders).
- **A main content area:** Where the primary content of each view is rendered.
- **User Profile/Logout:** Typically located in the top-right corner.

### 2.2. Key Views & Pages
The application is divided into several views, corresponding to the core features:
- **Login:** A dedicated page for user authentication.
- **Dashboard:** The landing page after login, providing a summary of key metrics and recent activity.
- **Article Management:** Views for listing, creating, and editing articles.
- **Order Management:** Pages for viewing order lists, order details, and creating new orders.
- **Stock Management:** Views displaying inventory levels for stations and suppliers.
- **User/Station/Supplier Management:** Administrative pages with data tables for managing these entities.

## 3. UI Components

The UI is constructed from a library of reusable Vue.js components located in `frontend/src/components/`. Key component categories include:

- **Layout:** `Navbar.vue`, `Sidebar.vue`, `AppLayout.vue`.
- **UI Primitives:** `Button.vue`, `Input.vue`, `Card.vue`, `Modal.vue`.
- **Data Display:**
    - `ArticleList.vue`: Renders a list or table of articles.
    - `CommandeTable.vue`: A table for displaying orders with sorting and filtering.
    - Generic `DataTable.vue` for displaying various data types.
- **Forms:**
    - `LoginForm.vue`: The user login form.
    - `ArticleForm.vue`: Form for creating or editing an article.
    - `CommandeForm.vue`: Form for creating a new order.
- **User-Specific:** Components related to user profiles and settings.

## 4. Styling & Branding

- **CSS Framework:** **TailwindCSS** is the primary framework. Customizations and base styles are defined in `tailwind.config.js` and `src/assets/main.css`.
- **Fonts:** The project uses a set of clean, sans-serif fonts for readability (defined in the CSS).
- **Color Palette:** The color scheme is professional and minimalistic, using a primary brand color for accents and interactive elements, with a neutral palette for text and backgrounds.
- **Icons:** A consistent icon set is used to enhance visual communication and draw attention to actions.
- **Assets:** The `public/` and `src/assets/` directories contain static assets like the favicon and any brand logos.

## 5. User Interaction & State

- **Reactivity:** As a Single Page Application (SPA), transitions between views are handled client-side by Vue Router, providing a fast and fluid user experience.
- **State Management:** **Pinia** is used to manage global application state. This includes the authenticated user's information, session tokens, and potentially cached data to reduce API calls.
- **Notifications:** The application should provide user feedback through non-intrusive notifications (e.g., "toast" popups) for actions like successful saves or errors.
- **Data Loading & Errors:** Components display loading indicators while fetching data and show clear error messages if an API call fails.
