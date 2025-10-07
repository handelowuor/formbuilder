# Dynamic Form Builder Application

A comprehensive React-based form builder application that allows users to create, configure, and manage custom forms with advanced validation, dependencies, and API integration capabilities.

## 🚀 Features

### Core Functionality
- **Dynamic Form Creation**: Create forms with multiple sections and various field types
- **Field Type Management**: Support for text, number, dropdown, checkbox, date, lookup, and formula fields
- **Advanced Validation**: Custom validation rules with real-time feedback
- **Field Dependencies**: Conditional field visibility based on other field values
- **Multi-Country Support**: Support for Uganda (UG) and Kenya (KE) regions
- **Question Library**: Reusable question templates across forms
- **Form Preview**: Real-time preview of forms before publishing
- **Version Control**: Track form changes and publish history
- **API Integration**: Connect fields to external APIs for dynamic options

### Advanced Features
- **Bulk Operations**: Import/export questions and sections via CSV
- **Form Analytics**: Comprehensive analytics dashboard with submission tracking
- **Template Management**: Create and manage reusable question templates
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Dark Mode Support**: Built-in theme switching capabilities
- **Real-time Validation**: Instant feedback on form configuration

## 🏗️ Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 with App Router
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React hooks and context
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

### Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles and CSS variables
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Main application entry point
│   └── tempobook/               # Storyboard components for development
│       └── storyboards/         # Individual component showcases
├── components/                   # React components
│   ├── form-builder/            # Form builder specific components
│   │   ├── form-builder-dashboard.tsx    # Main dashboard
│   │   ├── form-editor.tsx              # Form editing interface
│   │   ├── section-manager.tsx          # Section management
│   │   ├── question-manager.tsx         # Question management
│   │   ├── field-configuration-panel.tsx # Field configuration
│   │   ├── field-type-selector.tsx      # Field type selection
│   │   ├── form-preview.tsx             # Form preview functionality
│   │   ├── published-forms-view.tsx     # Published forms management
│   │   └── question-library.tsx         # Question template library
│   ├── theme-provider.tsx       # Theme context provider
│   └── ui/                      # Reusable UI components (shadcn/ui)
├── lib/                         # Utility libraries
│   ├── api/                     # API client and endpoints
│   │   └── form-builder-api.ts  # Form builder API client
│   └── utils.ts                 # Utility functions
├── types/                       # TypeScript type definitions
│   └── form-builder.ts          # Form builder types and interfaces
└── data/                        # Test data and mock responses
    └── test-data.ts             # Mock data for development
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun package manager

### Installation Steps

1. **Clone or create the project directory**
   ```bash
   mkdir dynamic-form-builder
   cd dynamic-form-builder
   ```

2. **Copy all project files** to the directory following the structure above

3. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Key Components Overview

### 1. Form Builder Dashboard (`form-builder-dashboard.tsx`)
**Purpose**: Main entry point and navigation hub
**Features**:
- Country selection (Uganda/Kenya)
- Form listing with search and filters
- Quick action cards for creating forms, viewing published forms, and managing templates
- Statistics overview
- Responsive grid/list view toggle

### 2. Form Editor (`form-editor.tsx`)
**Purpose**: Main form editing interface
**Features**:
- Form metadata editing (name, description)
- Section management integration
- Form preview functionality
- Publishing and archiving capabilities
- Form history tracking
- Save/publish workflow

### 3. Section Manager (`section-manager.tsx`)
**Purpose**: Manage form sections and their organization
**Features**:
- Create, edit, and delete sections
- Section ordering and activation
- Expandable section view with question management
- Bulk section operations

### 4. Question Manager (`question-manager.tsx`)
**Purpose**: Manage questions within sections
**Features**:
- Create questions from scratch or templates
- Question editing and configuration
- Question reordering and moving between sections
- Template library integration
- API endpoint testing for dynamic options

### 5. Field Configuration Panel (`field-configuration-panel.tsx`)
**Purpose**: Detailed field configuration interface
**Features**:
- Field-specific configuration options
- Validation rule management
- Picklist value management
- Advanced settings (dependencies, storage options)
- Template usage tracking

### 6. Question Library (`question-library.tsx`)
**Purpose**: Manage reusable question templates
**Features**:
- Template creation and editing
- Category and tag management
- Search and filtering capabilities
- Template usage analytics
- Import/export functionality

### 7. Form Preview (`form-preview.tsx`)
**Purpose**: Real-time form preview and testing
**Features**:
- Live form rendering
- Validation testing
- Responsive preview
- Form submission simulation

## 🔌 API Integration

### API Client (`form-builder-api.ts`)
The application uses a mock API client that simulates real backend interactions:

**Key API Modules**:
- `formApi`: Form CRUD operations, publishing, archiving
- `sectionApi`: Section management and organization
- `questionApi`: Question management and template integration
- `templateApi`: Question template library management
- `regionApi`: Multi-country region management
- `validationApi`: Form and field validation
- `analyticsApi`: Form analytics and reporting

**Mock Data**: All API calls return realistic mock data from `test-data.ts` for development and testing.

## 🎨 Styling System

### Design Tokens
The application uses a comprehensive design system defined in `globals.css`:

- **Colors**: Primary, secondary, accent colors with dark mode variants
- **Typography**: Consistent font sizing and spacing
- **Components**: Reusable component classes with hover effects
- **Animations**: Smooth transitions and micro-interactions
- **Glassmorphism**: Modern glass-like UI effects

### Key CSS Classes
- `.form-builder-card`: Standard card styling with backdrop blur
- `.form-builder-button-primary`: Primary button with gradient
- `.form-builder-canvas`: Main application background with gradients
- `.status-*`: Status indicator classes for different states
- `.field-type-*`: Field type indicator classes

## 📊 Data Models

### Core Types (from `form-builder.ts`)

```typescript
// Main form structure
interface Form {
  id: number;
  name: string;
  slug: string;
  description?: string;
  formType: FormType;
  companyRegionId: number;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
}

// Form sections
interface FormSection {
  id: number;
  formId: number;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  status: string;
}

// Form questions
interface FormQuestion {
  id: number;
  formId: number;
  sectionId: number;
  order: number;
  tkey: string;
  label: string;
  answerType: AnswerType;
  required: boolean;
  validation: Record<string, any>;
  options: any[];
}

// Question templates
interface QuestionTemplate {
  id: number;
  tkey: string;
  label: string;
  answerType: AnswerType;
  validationJson: Record<string, any>;
  availableRegions: number[];
  isGlobal: boolean;
  category?: string;
}
```

## 🌍 Multi-Country Support

The application supports multiple countries with region-specific configurations:

- **Uganda (UG)**: Region ID 1
- **Kenya (KE)**: Region ID 5

Features:
- Country-specific form templates
- Region-based question libraries
- Localized validation rules
- Currency and format preferences

## 🔄 Development Workflow

### Adding New Field Types
1. Update `AnswerType` in `types/form-builder.ts`
2. Add field type to `field-type-selector.tsx`
3. Implement rendering in `form-preview.tsx`
4. Add configuration options in `field-configuration-panel.tsx`
5. Update validation logic in `question-manager.tsx`

### Creating New Components
1. Follow the established component structure
2. Use TypeScript for type safety
3. Implement responsive design with Tailwind CSS
4. Add proper error handling and loading states
5. Include accessibility features

### Testing Components
Use the storyboard system in `src/app/tempobook/storyboards/` to test components in isolation.

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Configuration
The application uses environment variables for API configuration:
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXT_PUBLIC_JWT_TOKEN`: Authentication token

## 🔧 Configuration Files

### Key Configuration Files
- `next.config.js`: Next.js configuration with image domains
- `tailwind.config.ts`: Tailwind CSS configuration with custom theme
- `tsconfig.json`: TypeScript configuration with path aliases
- `components.json`: shadcn/ui component configuration
- `tempo.config.json`: Typography and design system configuration

## 🎯 Usage Guide

### Creating a New Form
1. Navigate to the dashboard
2. Select your country (Uganda/Kenya)
3. Click "Create Form"
4. Configure form details (name, description, type)
5. Add sections using the Section Manager
6. Add questions to sections using the Question Manager
7. Configure field properties and validation
8. Preview the form
9. Publish when ready

### Managing Question Templates
1. Navigate to "Question Library"
2. Browse existing templates or create new ones
3. Configure template properties (type, validation, storage)
4. Set availability regions
5. Use templates when creating questions

### Form Analytics
1. Navigate to "Published Forms"
2. Select a form to view analytics
3. Review submission statistics
4. Analyze completion rates and drop-off points
5. Export data as needed

## 🤝 Contributing

When contributing to this project:
1. Follow the established code structure
2. Use TypeScript for all new code
3. Implement responsive design patterns
4. Add proper error handling
5. Include loading states for async operations
6. Test components using the storyboard system

## 📝 Notes for Developers

### Important Implementation Details
1. **Mock API**: The application currently uses mock data. Replace `form-builder-api.ts` with real API calls when backend is available.
2. **State Management**: Uses React hooks and context. Consider Redux/Zustand for complex state needs.
3. **Validation**: Client-side validation is implemented. Ensure server-side validation matches.
4. **File Structure**: Maintain the established folder structure for consistency.
5. **Responsive Design**: All components are designed to work on mobile and desktop.

### Performance Considerations
1. **Lazy Loading**: Consider implementing lazy loading for large forms
2. **Virtualization**: Use virtual scrolling for large question lists
3. **Caching**: Implement proper caching for API responses
4. **Bundle Size**: Monitor and optimize bundle size regularly

### Security Considerations
1. **Input Validation**: Always validate user inputs
2. **XSS Prevention**: Sanitize user-generated content
3. **API Security**: Implement proper authentication and authorization
4. **Data Encryption**: Encrypt sensitive form data

This documentation provides a comprehensive overview of the Dynamic Form Builder application. The codebase is well-structured, fully functional, and ready for development or deployment.
