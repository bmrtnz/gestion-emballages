# Design Dossier (DD) - Gestion Emballages

## 1. Executive Summary

### 1.1 Design Vision
The Gestion Emballages design system implements a modern, accessible, and scalable design language that supports complex business workflows while maintaining simplicity and elegance. The design prioritizes functionality, clarity, and efficiency for data-intensive cooperative management operations.

### 1.2 Design Principles
- **Utility-First Architecture**: TailwindCSS foundation with systematic design tokens
- **Component-Driven Development**: Reusable Vue.js components with consistent patterns
- **Responsive-First Design**: Mobile-optimized with progressive enhancement
- **Data-Centric Interface**: Optimized for complex business data presentation
- **Accessibility by Design**: WCAG 2.1 compliance with inclusive interaction patterns

### 1.3 Design Goals
- **User Efficiency**: Minimize cognitive load for complex business processes
- **Visual Consistency**: Coherent experience across all user touchpoints
- **Scalable Systems**: Design patterns that grow with business complexity
- **Brand Alignment**: Professional aesthetic supporting cooperative values
- **Performance Optimization**: Design decisions that enhance application performance

## 2. Design Strategy & Philosophy

### 2.1 Design Methodology
**Human-Centered Design Process**:
1. **Research**: User interviews, workflow analysis, competitive research
2. **Define**: Problem statements, design requirements, success metrics
3. **Ideate**: Design concepts, pattern exploration, prototyping
4. **Design**: High-fidelity designs, component specifications, interactions
5. **Test**: Usability testing, accessibility validation, performance impact
6. **Iterate**: Continuous refinement based on user feedback

**Design System Approach**:
- **Atomic Design**: Building from design tokens to complex layouts
- **Systematic Thinking**: Consistent patterns across all interface elements
- **Documentation-Driven**: Comprehensive guidelines for implementation
- **Version Control**: Systematic versioning of design components and patterns

### 2.2 User-Centered Approach
**Primary User Considerations**:
- **Cognitive Load**: Simplified complex workflows with clear visual hierarchy
- **Efficiency**: Optimized task completion with minimal friction
- **Error Prevention**: Clear affordances and confirmation patterns
- **Learning Curve**: Intuitive interactions with contextual guidance

**Role-Based Experience Design**:
- **Managers**: Executive dashboards with high-level analytics
- **Station Staff**: Task-focused interfaces for daily operations
- **Suppliers**: Order-centric workflows with clear status tracking
- **Mobile Users**: Touch-optimized interactions for field operations

### 2.3 Business Context Integration
**Cooperative Industry Alignment**:
- Professional aesthetic supporting business credibility
- Data transparency supporting collaborative decision-making
- Efficiency-focused design reducing operational overhead
- Scalable patterns accommodating network growth

## 3. Visual Design System

### 3.1 Brand & Identity

**Brand Positioning**:
- **Professional**: Serious business tool for cooperative management
- **Collaborative**: Supporting teamwork and transparency
- **Efficient**: Streamlined operations and reduced complexity
- **Trustworthy**: Reliable platform for critical business processes

**Visual Identity Elements**:
- Clean, modern aesthetic with purposeful simplicity
- Cooperative industry color associations (blues, greens, earth tones)
- Typography emphasizing readability and professionalism
- Iconography supporting quick recognition and navigation

### 3.2 Color System

**Primary Brand Colors**:
```css
/* Primary Gradient (Pink/Magenta) */
primary-50:  #fdf2f7   /* Lightest background */
primary-100: #fce7f1   /* Light backgrounds */
primary-200: #f8d3e1   /* Subtle accents */
primary-300: #f2abd4   /* Hover states */
primary-400: #e879bc   /* Active elements */
primary-500: #d946a0   /* Primary brand */
primary-600: #c2379b   /* Emphasis */
primary-700: #a3277f   /* Strong emphasis */
primary-800: #862167   /* Dark emphasis */
primary-900: #701a56   /* Darkest */
primary-950: #580a34   /* High contrast */
```

**Secondary Colors**:
```css
/* Accent Blue */
accent-500: #0ea5e9     /* Secondary actions */
accent-600: #0284c7     /* Secondary emphasis */

/* Sunshine Yellow */
sunshine-500: #eab308   /* Attention, warnings */
sunshine-600: #ca8a04   /* Warning emphasis */

/* Energy Coral/Pink */
energy-500: #f97316     /* Energy, notifications */
energy-600: #ea580c     /* Energy emphasis */
```

**Semantic Colors**:
```css
/* Success */
success-50:  #ecfdf5
success-500: #10b981   /* Success states */
success-600: #059669   /* Success emphasis */

/* Warning */
warning-50:  #fffbeb
warning-500: #f59e0b   /* Warning states */
warning-600: #d97706   /* Warning emphasis */

/* Error */
error-50:    #fef2f2
error-500:   #ef4444   /* Error states */
error-600:   #dc2626   /* Error emphasis */

/* Gray Scale */
gray-25:     #fcfcfd   /* Lightest background */
gray-50:     #f9fafb   /* Light background */
gray-100:    #f3f4f6   /* Subtle background */
gray-200:    #e5e7eb   /* Borders */
gray-300:    #d1d5db   /* Disabled states */
gray-400:    #9ca3af   /* Placeholder text */
gray-500:    #6b7280   /* Secondary text */
gray-600:    #4b5563   /* Primary text */
gray-700:    #374151   /* Emphasized text */
gray-800:    #1f2937   /* High contrast text */
gray-900:    #111827   /* Maximum contrast */
gray-950:    #030712   /* Absolute black */
```

**Color Usage Principles**:
- Primary colors for main actions and brand elements
- Secondary colors for supporting actions and navigation
- Semantic colors for status communication and feedback
- Gray scale for text hierarchy and structural elements
- High contrast ratios meeting WCAG AA standards

### 3.3 Typography System

**Font Stack**:
```css
/* Display Font - Poppins */
font-family: 'Poppins', ui-sans-serif, system-ui, sans-serif;
font-weights: 300, 400, 500, 600, 700, 800

/* Body Font - Inter */
font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
font-weights: 300, 400, 500, 600, 700
```

**Typography Scale**:
```css
/* Headings */
text-xs:    0.75rem   (12px)  /* Small labels */
text-sm:    0.875rem  (14px)  /* Secondary text */
text-base:  1rem      (16px)  /* Body text */
text-lg:    1.125rem  (18px)  /* Emphasized body */
text-xl:    1.25rem   (20px)  /* Small headings */
text-2xl:   1.5rem    (24px)  /* Medium headings */
text-3xl:   1.875rem  (30px)  /* Large headings */
text-4xl:   2.25rem   (36px)  /* Display headings */
text-5xl:   3rem      (48px)  /* Hero headings */
```

**Typography Hierarchy**:
- **H1 (text-4xl)**: Page titles, main headings
- **H2 (text-3xl)**: Section headings, card titles
- **H3 (text-2xl)**: Subsection headings
- **H4 (text-xl)**: Component headings
- **Body (text-base)**: Primary content text
- **Caption (text-sm)**: Secondary information, metadata
- **Label (text-xs)**: Form labels, tags, micro-content

**Typography Usage**:
- Poppins for headings and display elements
- Inter for body text and interface elements
- Consistent line-height ratios for readability
- Responsive typography scaling across breakpoints

### 3.4 Iconography System

**Icon Library**: Heroicons 2.0
- **24px Outline**: Primary interface icons
- **20px Solid**: Compact interface elements
- **Consistent Style**: Unified visual language
- **Semantic Usage**: Icons match their functional meaning

**Icon Categories**:
```javascript
// Navigation Icons
Home, Dashboard, Users, Settings, Search, Filter

// Action Icons
Plus, Edit, Delete, Save, Cancel, Upload, Download

// Status Icons
Check, X, Alert, Info, Warning, Success, Error

// Business Icons
Package, Truck, Building, User, Document, Chart

// UI Icons
ChevronDown, ChevronUp, Menu, Close, More, External
```

**Icon Usage Principles**:
- Consistent sizing (h-4 w-4, h-5 w-5, h-6 w-6)
- Proper contrast against backgrounds
- Meaningful icons that enhance comprehension
- Accessible with appropriate ARIA labels

### 3.5 Spacing & Layout System

**Spacing Scale** (based on 0.25rem = 4px):
```css
0:    0px
0.5:  2px    /* Micro spacing */
1:    4px    /* Minimal spacing */
1.5:  6px    /* Tight spacing */
2:    8px    /* Small spacing */
2.5:  10px   /* Compact spacing */
3:    12px   /* Standard spacing */
4:    16px   /* Medium spacing */
5:    20px   /* Large spacing */
6:    24px   /* Extra large spacing */
8:    32px   /* Section spacing */
10:   40px   /* Component spacing */
12:   48px   /* Layout spacing */
16:   64px   /* Major layout spacing */
20:   80px   /* Page section spacing */
24:   96px   /* Major page spacing */
```

**Border Radius Scale**:
```css
rounded-none:     0px
rounded-sm:       2px    /* Subtle rounding */
rounded:          4px    /* Standard rounding */
rounded-md:       6px    /* Medium rounding */
rounded-lg:       8px    /* Large rounding */
rounded-xl:       12px   /* Extra large rounding */
rounded-2xl:      16px   /* Component rounding */
rounded-3xl:      24px   /* Card rounding */
rounded-full:     9999px /* Circular elements */
```

**Layout Grid System**:
- **Container**: Maximum width with responsive breakpoints
- **Grid**: CSS Grid for complex layouts
- **Flexbox**: Flexible component arrangements
- **Responsive**: Mobile-first responsive design patterns

## 4. Component Design System

### 4.1 Design Token System

**Color Tokens**:
```javascript
const colorTokens = {
  // Semantic tokens
  'color-primary': 'primary-600',
  'color-secondary': 'gray-600',
  'color-success': 'success-500',
  'color-warning': 'warning-500',
  'color-error': 'error-500',
  
  // Background tokens
  'bg-default': 'white',
  'bg-subtle': 'gray-50',
  'bg-muted': 'gray-100',
  'bg-emphasis': 'gray-900',
  
  // Border tokens
  'border-default': 'gray-200',
  'border-muted': 'gray-100',
  'border-emphasis': 'gray-300'
};
```

**Spacing Tokens**:
```javascript
const spacingTokens = {
  'space-xs': '0.5rem',    // 8px
  'space-sm': '0.75rem',   // 12px
  'space-md': '1rem',      // 16px
  'space-lg': '1.5rem',    // 24px
  'space-xl': '2rem',      // 32px
  'space-2xl': '3rem'      // 48px
};
```

**Shadow Tokens**:
```javascript
const shadowTokens = {
  'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  'shadow-colored-primary': '0 4px 6px -1px rgb(217 70 160 / 0.2)',
  'shadow-colored-success': '0 4px 6px -1px rgb(16 185 129 / 0.2)'
};
```

### 4.2 Foundation Components

#### 4.2.1 Button Component System

**Button Variants** (Class Variance Authority Implementation):
```javascript
const buttonVariants = {
  variant: {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-colored-primary',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
    danger: 'bg-gradient-to-r from-error-500 to-error-600 text-white',
    accent: 'bg-gradient-to-r from-accent-500 to-accent-600 text-white',
    sunshine: 'bg-gradient-to-r from-sunshine-500 to-sunshine-600 text-white'
  },
  size: {
    xs: 'px-2 py-1 text-xs rounded-md',
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
    xl: 'px-8 py-4 text-lg rounded-xl'
  }
};
```

**Button States**:
- **Default**: Normal interactive state
- **Hover**: Enhanced visual feedback (-translate-y-0.5, enhanced shadow)
- **Active**: Pressed state (scale-95)
- **Focus**: Keyboard focus with ring
- **Disabled**: Reduced opacity (opacity-50)
- **Loading**: Spinner animation with disabled state

#### 4.2.2 Input Component System

**Input Variants**:
```css
/* Default Input */
.input-default {
  @apply block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 
         ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 
         focus:ring-2 focus:ring-inset focus:ring-primary-500 
         focus:shadow-colored-primary;
}

/* Filled Input */
.input-filled {
  @apply block w-full rounded-2xl border-0 px-4 py-3 text-gray-900 
         bg-gray-50 ring-1 ring-inset ring-gray-100 
         focus:bg-white focus:ring-primary-500;
}
```

**Input States**:
- **Default**: Normal input state
- **Focus**: Enhanced ring and shadow
- **Error**: Red ring and error styling
- **Success**: Green ring and success styling
- **Disabled**: Grayed out with reduced interaction

#### 4.2.3 Card Component System

**Card Variants**:
```javascript
const cardVariants = {
  variant: {
    default: 'bg-white border border-gray-200 rounded-3xl shadow-sm',
    outline: 'bg-white border border-gray-300 rounded-3xl',
    ghost: 'bg-transparent rounded-3xl',
    elevated: 'bg-white rounded-3xl shadow-lg'
  },
  padding: {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
};
```

**Card Interactions**:
- **Hover**: Subtle lift (-translate-y-0.5)
- **Click**: Scale animation (scale-95)
- **Focus**: Keyboard focus ring

#### 4.2.4 Modal & Overlay Components

**Modal System**:
- **HeadlessUI Dialog**: Accessible modal foundation
- **Backdrop**: Blur effect with opacity transition
- **Panel**: Centered with smooth animations
- **Focus Management**: Automatic focus trapping
- **Sizes**: sm (max-w-md), md (max-w-lg), lg (max-w-2xl), xl (max-w-4xl)

**SlidePanel System**:
- **Right-side drawer**: For detailed forms and content
- **Smooth transitions**: Transform and opacity animations
- **Size variants**: Responsive width management
- **Close handling**: Multiple close interaction patterns

### 4.3 Layout Components

#### 4.3.1 Application Layout

**AppLayout Structure**:
```vue
<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
    <!-- Backdrop blur for modern aesthetic -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary-100/20 via-transparent to-sunshine-100/20 backdrop-blur-3xl"></div>
    
    <!-- Sidebar (Desktop) -->
    <SideBar class="hidden lg:block fixed left-0 top-0 h-full w-72" />
    
    <!-- Mobile Header -->
    <MobileHeader class="lg:hidden" />
    
    <!-- Main Content -->
    <main class="lg:pl-72 relative">
      <div class="p-6">
        <slot />
      </div>
    </main>
  </div>
</template>
```

**Responsive Breakpoints**:
```css
/* Mobile First Breakpoints */
sm:  640px   /* Small devices */
md:  768px   /* Medium devices (tablets) */
lg:  1024px  /* Large devices (desktops) */
xl:  1280px  /* Extra large devices */
2xl: 1536px  /* 2x extra large devices */
```

#### 4.3.2 Sidebar Navigation

**Sidebar Features**:
- **Role-based Menu Filtering**: Dynamic menu based on user permissions
- **Hierarchical Structure**: GESTION and PARAMETRES sections
- **User Profile Section**: Avatar with initials, name, role
- **Search Integration**: Built-in search functionality
- **Mobile Adaptation**: Overlay modal on small screens

**Menu Structure**:
```javascript
const menuStructure = {
  navigation: [
    { name: 'Tableau de Bord', icon: 'ChartBarIcon', href: '/dashboard' },
    { name: 'Analyses', icon: 'ChartPieIcon', href: '/analytics' }
  ],
  gestion: [
    { name: 'Commandes', icon: 'ClipboardDocumentListIcon', href: '/commandes' },
    { name: 'Transferts', icon: 'ArrowPathIcon', href: '/transferts' },
    { name: 'Stocks', icon: 'ArchiveBoxIcon', href: '/stocks' },
    { name: 'Prévisions', icon: 'CalendarDaysIcon', href: '/previsions' }
  ],
  parametres: [
    { name: 'Articles', icon: 'CubeIcon', href: '/articles' },
    { name: 'Fournisseurs', icon: 'BuildingOffice2Icon', href: '/fournisseurs' },
    { name: 'Stations', icon: 'MapPinIcon', href: '/stations' },
    { name: 'Utilisateurs', icon: 'UsersIcon', href: '/users' }
  ]
};
```

### 4.4 Data Display Components

#### 4.4.1 List Page Design System

**Standardized List Pattern**:
```vue
<template>
  <div class="space-y-6">
    <!-- Search and Filters Section -->
    <div class="space-y-4">
      <!-- Control Bar -->
      <div class="flex items-center space-x-4">
        <!-- Tree Toggle (if applicable) -->
        <button @click="toggleTreeState" 
                class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <ChevronDoubleUpIcon v-if="isTreeExpanded" class="h-4 w-4" />
          <ChevronDoubleDownIcon v-else class="h-4 w-4" />
          <span class="hidden md:inline">{{ isTreeExpanded ? 'Réduire' : 'Développer' }}</span>
        </button>
        
        <!-- Filters Toggle -->
        <button @click="showFilters = !showFilters"
                class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <FunnelIcon class="h-4 w-4" />
          <span>Filtres</span>
          <span v-if="activeFiltersCount > 0" 
                class="ml-1 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
            {{ activeFiltersCount }}
          </span>
        </button>
        
        <!-- Search Input -->
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input v-model="searchQuery"
                 type="text"
                 placeholder="Rechercher..."
                 class="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
        </div>
      </div>
      
      <!-- Filters Panel -->
      <div v-if="showFilters" class="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <!-- Filter Controls -->
        </div>
        <div class="flex justify-end">
          <Button variant="outline" @click="clearFilters">
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Content Area -->
    <!-- Mobile View -->
    <div class="block md:hidden space-y-4">
      <!-- Mobile cards -->
    </div>
    
    <!-- Desktop View -->
    <div class="hidden md:block">
      <!-- Desktop table -->
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-lg">
      <!-- Pagination controls -->
    </div>
  </div>
</template>
```

#### 4.4.2 Table Components

**Table Design System**:
- **Responsive Tables**: Hide columns on smaller screens
- **Sortable Headers**: Click to sort with visual indicators
- **Row Actions**: Consistent action button placement
- **Status Indicators**: Color-coded status badges
- **Pagination**: Integrated pagination controls

#### 4.4.3 Form Components

**Form Field Pattern**:
```vue
<template>
  <div class="space-y-2">
    <!-- Label -->
    <label v-if="label" 
           :for="fieldId" 
           class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-error-500">*</span>
    </label>
    
    <!-- Description -->
    <p v-if="description" 
       class="text-sm text-gray-500">
      {{ description }}
    </p>
    
    <!-- Input Slot -->
    <slot name="input" :value="modelValue" :update="handleUpdate">
      <Input v-bind="inputProps" />
    </slot>
    
    <!-- Error Message -->
    <p v-if="error" 
       class="text-sm text-error-600">
      {{ error }}
    </p>
    
    <!-- Success Message -->
    <p v-if="success" 
       class="text-sm text-success-600">
      {{ success }}
    </p>
  </div>
</template>
```

## 5. Responsive & Adaptive Design

### 5.1 Mobile-First Strategy

**Design Approach**:
1. **Start with Mobile**: Design for smallest screen first
2. **Progressive Enhancement**: Add features for larger screens
3. **Touch-First**: Optimize for touch interactions
4. **Performance-Conscious**: Minimize resource usage on mobile

**Mobile Optimizations**:
- **Touch Targets**: Minimum 44px touch targets
- **Simplified Navigation**: Collapsible mobile menu
- **Card-Based Layout**: Easier scanning on small screens
- **Reduced Information Density**: Focus on essential information
- **Gesture Support**: Swipe and touch interactions

### 5.2 Responsive Patterns

**Navigation Adaptation**:
```css
/* Desktop: Fixed Sidebar */
.sidebar {
  @apply hidden lg:block fixed left-0 top-0 h-full w-72 z-50;
}

/* Mobile: Overlay Modal */
.mobile-menu {
  @apply lg:hidden fixed inset-0 z-50;
}
```

**Content Adaptation**:
```css
/* Mobile: Card Layout */
.content-mobile {
  @apply block md:hidden space-y-4;
}

/* Desktop: Table Layout */
.content-desktop {
  @apply hidden md:block;
}
```

**Typography Scaling**:
```css
/* Responsive Typography */
.heading-responsive {
  @apply text-2xl md:text-3xl lg:text-4xl;
}

.body-responsive {
  @apply text-sm md:text-base;
}
```

### 5.3 Performance Considerations

**Design Impact on Performance**:
- **Image Optimization**: WebP format with fallbacks
- **Icon Optimization**: SVG icons with sprite sheets
- **CSS Optimization**: Purged unused classes
- **Animation Performance**: GPU-accelerated transforms
- **Layout Stability**: Avoid layout shifts

## 6. Animation & Interaction Design

### 6.1 Animation System

**Animation Principles**:
- **Purposeful**: Animations serve functional purposes
- **Subtle**: Gentle, non-distracting movements
- **Consistent**: Unified timing and easing
- **Accessible**: Respects prefers-reduced-motion

**Custom Animations**:
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@keyframes bounce-gentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
```

**Animation Usage**:
- **Page Transitions**: Smooth page-to-page navigation
- **Component Entrance**: Elements appearing on screen
- **Hover Effects**: Interactive feedback
- **Loading States**: Progress and activity indicators
- **Form Validation**: Success and error animations

### 6.2 Interaction Patterns

**Micro-Interactions**:
- **Button Hover**: Subtle lift and shadow enhancement
- **Card Hover**: Gentle elevation change
- **Input Focus**: Ring animation and shadow
- **Link Hover**: Color transition
- **Icon Hover**: Scale or rotation effects

**Gesture Support**:
- **Touch**: Optimized touch targets and feedback
- **Keyboard**: Complete keyboard navigation
- **Mouse**: Hover states and click feedback
- **Focus**: Clear focus indicators

### 6.3 Loading & Feedback

**Loading States**:
- **Skeleton Screens**: Content shape previews
- **Progress Indicators**: Linear and circular progress
- **Spinner Components**: Various loading spinners
- **Optimistic Updates**: Immediate UI feedback

**Feedback Patterns**:
- **Success Messages**: Green checkmark with message
- **Error Messages**: Red alert with clear description
- **Warning Messages**: Amber caution with context
- **Info Messages**: Blue information with details

## 7. Accessibility & Inclusive Design

### 7.1 WCAG 2.1 Compliance

**Level AA Compliance**:
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Alternative Text**: Meaningful alt text for images

**Accessibility Features**:
- **Skip Links**: Jump to main content
- **Landmark Roles**: Proper page structure
- **Form Labels**: Associated labels for all inputs
- **Error Identification**: Clear error descriptions
- **Consistent Navigation**: Predictable navigation patterns

### 7.2 Inclusive Design Practices

**Universal Design**:
- **Clear Language**: Simple, understandable content
- **Multiple Input Methods**: Mouse, keyboard, touch, voice
- **Flexible Layouts**: Accommodate different viewing preferences
- **Error Recovery**: Clear paths to fix mistakes
- **Consistent Patterns**: Predictable interaction models

**Cognitive Accessibility**:
- **Clear Information Hierarchy**: Logical content structure
- **Reduced Cognitive Load**: Simplified complex tasks
- **Progress Indicators**: Clear task completion status
- **Contextual Help**: Inline assistance and guidance
- **Error Prevention**: Form validation and confirmation

### 7.3 Assistive Technology Support

**Screen Reader Optimization**:
- **Semantic HTML**: Proper heading structure
- **ARIA Labels**: Descriptive labels for complex UI
- **Live Regions**: Dynamic content announcements
- **Focus Management**: Logical tab order
- **Alternative Content**: Text alternatives for visual content

**Keyboard Navigation**:
- **Tab Order**: Logical navigation sequence
- **Keyboard Shortcuts**: Efficient keyboard access
- **Focus Trapping**: Modal and dropdown focus management
- **Escape Routes**: Consistent escape patterns
- **Visual Focus**: Clear focus indicators

## 8. Performance & Optimization

### 8.1 Design Performance Impact

**Optimization Strategies**:
- **CSS Purging**: Remove unused Tailwind classes
- **Image Optimization**: Responsive images with WebP
- **Icon Sprites**: Reduce HTTP requests
- **Critical CSS**: Inline critical styles
- **Lazy Loading**: Defer non-critical resources

**Performance Metrics**:
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100 milliseconds
- **Core Web Vitals**: Meeting all thresholds

### 8.2 Component Performance

**Efficient Components**:
- **Virtual Scrolling**: Large lists and tables
- **Debounced Inputs**: Search and filter inputs
- **Memoized Computations**: Expensive calculations
- **Lazy Components**: Defer heavy components
- **Optimized Animations**: GPU-accelerated transforms

### 8.3 Bundle Optimization

**Build Optimizations**:
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Separate vendor bundles
- **Compression**: Gzip and Brotli compression
- **Caching**: Long-term caching strategies
- **Minification**: Optimized production builds

## 9. Design Documentation & Maintenance

### 9.1 Component Documentation

**Documentation Structure**:
- **Component Overview**: Purpose and usage
- **Props Interface**: Input parameters and types
- **Event Interface**: Emitted events and payloads
- **Slot Interface**: Available content slots
- **Examples**: Usage examples and variations
- **Accessibility**: ARIA roles and keyboard support

**Style Guide Format**:
```markdown
## Button Component

### Overview
The Button component provides consistent interactive elements across the application.

### Usage
```vue
<Button variant="primary" size="md" @click="handleClick">
  Click me
</Button>
```

### Props
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `disabled`: boolean
- `loading`: boolean

### Accessibility
- Keyboard navigable with Tab
- Screen reader friendly with proper labels
- High contrast mode support
```

### 9.2 Design System Maintenance

**Version Control**:
- **Semantic Versioning**: Major.minor.patch versioning
- **Change Documentation**: Detailed change logs
- **Migration Guides**: Upgrade instructions
- **Deprecation Notices**: Advance warning for changes
- **Release Notes**: Feature and fix summaries

**Quality Assurance**:
- **Design Reviews**: Regular component audits
- **Accessibility Testing**: Automated and manual testing
- **Cross-browser Testing**: Multiple browser validation
- **Performance Monitoring**: Component performance tracking
- **User Feedback**: Continuous improvement based on usage

### 9.3 Implementation Guidelines

**Developer Handoff**:
- **Figma to Code**: Design-to-development workflow
- **Component Specifications**: Detailed implementation specs
- **Interaction Specifications**: Animation and state details
- **Responsive Specifications**: Breakpoint behaviors
- **Accessibility Requirements**: Implementation checklist

**Code Standards**:
- **Vue.js Best Practices**: Component composition guidelines
- **TailwindCSS Usage**: Utility class organization
- **TypeScript Integration**: Type-safe component props
- **Testing Requirements**: Component testing standards
- **Documentation Standards**: Inline code documentation

---

## 10. Recent Design Changes & Updates

### 10.1 ArticlePage Filter Defaults Enhancement (Latest)
**Date**: 2025-01-03  
**Component**: Article List Filters  
**Files Modified**: `frontend/src/composables/articles/useArticleFilters.js`

**Design Change**: 
- **Default Status Filter**: Changed from showing all articles to showing only active articles by default
- **Filter Reset Behavior**: Clear filters now resets to active articles instead of all articles

**UX Rationale**:
- **Cognitive Load Reduction**: Users primarily work with active articles, removing need for manual filtering
- **Workflow Efficiency**: Reduces clicks and time to access relevant content
- **Data Quality**: Inactive articles are typically archive/legacy data, less relevant for daily operations
- **Consistency**: Aligns with common enterprise application patterns where active items are shown by default

**Visual Impact**:
- Filter dropdown shows "Actif" as selected by default
- Filter badge count reflects active filter when page loads
- Clear filters maintains user-expected behavior by returning to active state

**Accessibility Considerations**:
- Screen readers announce default filter state
- Filter status is clearly indicated visually
- No impact on keyboard navigation or focus management

**Implementation Notes**:
- Maintains backward compatibility with existing filter logic
- No changes required to component templates or styling
- Filter behavior is controlled through composable state management

This comprehensive design system provides the foundation for building a world-class packaging management interface that is accessible, performant, and scalable while maintaining visual consistency and supporting complex business workflows.