# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **JSONL Parser** web application developed using Amazon's Kiro editor. Originally a simple JSON/JSONL parsing tool, it has evolved into a comprehensive content hub for developers working with JSON data, featuring educational tutorials, data manipulation tools, reference guides, and a sample data library.

### Target Users
Developers, data analysts, and anyone working with JSON data who needs efficient visualization and exploration of complex nested structures.

### Key Value Propositions
1. **Instant Visualization**: Real-time parsing and tree display
2. **Large Data Handling**: Optimized for datasets with 1000+ nodes
3. **User Experience**: Responsive design, keyboard shortcuts, contextual help
4. **Reliability**: Comprehensive error handling and partial parsing support

### Current Development Status
**Core Features**: ✅ Complete
- JSON/JSONL parsing and tree visualization
- Internationalization (English/Korean)
- Basic UI components and responsive design

**Content Expansion**: ✅ Mostly Complete
- Educational tutorials and learning center
- Additional data manipulation tools
- Reference guides and sample library
- Google AdSense integration

**In Progress/Remaining**:
- [ ] User preference tracking system
- [ ] Performance optimizations
- [ ] SEO enhancements and metadata optimization
- [ ] Comprehensive testing coverage

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Development server with hot reload (localhost:5173)
npm run dev

# Production build to dist/
npm run build

# Preview production build locally
npm run preview

# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

### Development Workflow
- Use `npm run dev` for local development on `localhost:5173`
- Always run `npm run test` before committing changes
- Use `npm run build` to verify production readiness
- TypeScript strict mode is enabled with comprehensive linting rules

## Architecture Overview

### Tech Stack
- **Vue 3** with Composition API (`<script setup>` syntax)
- **TypeScript** in strict mode with comprehensive type definitions
- **Pinia** for state management using Composition API patterns
- **Vue Router 4** for client-side routing
- **Vite** as build tool with HMR support
- **Vitest** for testing with jsdom environment
- **Highlight.js** for syntax highlighting
- **Marked** for markdown processing
- **Lucide Vue Next** for consistent icon representation

### Project Structure (Kiro-Based)
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Cross-feature shared components
│   ├── feature/        # Feature-specific components (InputPanel, OutputPanel)
│   ├── ui/             # Base UI building blocks (TreeNode, TextEditor)
│   ├── icons/          # Icon components with consistent API
│   ├── tools/          # Tool-specific functionality components
│   ├── reference/      # Help and documentation components
│   └── transitions/    # Animation and transition components
├── pages/              # Route-level page components
├── layouts/            # Layout wrapper components
├── stores/             # Pinia state management
├── router/             # Vue Router setup
├── composables/        # Reusable composition functions
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global CSS files
├── locales/            # Internationalization files
├── services/           # External service integrations
├── constants/          # Application constants
├── content/            # Content management (guides, tutorials, samples)
└── __tests__/          # Test files and setup
```

### Component Naming Conventions
- **Components**: PascalCase (e.g., `TreeNode.vue`, `JsonEditor.vue`)
- **Pages**: PascalCase with "Page" suffix (e.g., `HomePage.vue`, `TutorialPage.vue`)
- **Stores**: camelCase with "Store" suffix (e.g., `jsonTreeStore`, `i18nStore`)
- **Composables**: camelCase with "use" prefix (e.g., `useJsonParser`, `useKeyboard`)
- **Types/Interfaces**: PascalCase (e.g., `ParsedNode`, `JsonTreeState`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `LOCAL_STORAGE_KEYS`, `DEFAULT_CONFIG`)

### Core Store Pattern (`jsonTreeStore`)
The main Pinia store manages:
- JSON/JSONL input text and parsing state
- Parsed tree data with caching mechanism (10 items, 5-minute expiration)
- Error states and loading indicators
- Auto-save to localStorage functionality
- Input type detection (JSON vs JSONL)

### Key Features Implementation
- **Lazy Loading**: Tree nodes with >50 children use progressive loading with "Show More" buttons
- **Caching**: Parse results cached with 5-minute expiration to optimize performance
- **Auto-Detection**: Automatic JSON vs JSONL format detection using multi-line validation
- **Responsive Design**: Mobile-first approach with 768px/1024px breakpoints
- **i18n Support**: Korean/English localization via vue-i18n
- **Performance Optimization**: Component memoization, virtual scrolling preparation, memory monitoring

### Data Processing Architecture
- **JSON Parsing**: Standard JSON.parse with detailed error reporting and position information
- **JSONL Detection**: Multi-line validation with per-line JSON parsing support
- **Tree Generation**: Recursive node creation with data type detection and lazy loading
- **Error Handling**: Comprehensive validation with user-friendly messages and partial parsing success
- **Data Types**: Color-coded visualization (Object: purple, Array: orange, String: green, Number: blue, Boolean: yellow, Null: gray)

### Testing Strategy
- **Unit Tests**: Store logic, utility functions, validators (`src/__tests__/`)
- **Component Tests**: Vue component rendering and interactions using Vue Test Utils
- **Integration Tests**: Full application workflow testing including i18n integration
- **E2E Tests**: Complete user scenarios
- **Setup**: Global test environment configured in `src/__tests__/setup.ts`

### Content Management System
The application includes a comprehensive content system:
- **Guides**: Advanced usage, API development, data processing
- **Tutorials**: Beginner, intermediate, and advanced JSON parsing guides
- **Samples**: API responses, configurations, datasets
- **Reference**: Best practices, patterns, syntax guides

### Analytics & User Tracking
- Google Analytics 4 integration for user behavior tracking
- Client-side analytics with privacy considerations
- Performance monitoring capabilities
- Google AdSense integration for monetization

### Implementation Progress Tracking
Based on the Kiro specs, the project follows a structured development approach with three main phases:

1. **json-tree-viewer**: ✅ Core parsing functionality - Complete
2. **internationalization**: ✅ Multi-language support - Complete  
3. **monetization-content-expansion**: 🔄 Content hub expansion - Mostly Complete

### Key Remaining Tasks
From the current Kiro task specifications:
- User preference tracking system (localStorage-based)
- Mobile optimization and accessibility improvements
- Performance optimizations and code splitting
- Comprehensive testing coverage
- SEO metadata optimization

### Development Workflow with Kiro
This project uses Amazon's Kiro editor specifications for structured development:
- Requirements are defined in `.kiro/specs/[feature]/requirements.md`
- Design documents in `.kiro/specs/[feature]/design.md`  
- Implementation tracking in `.kiro/specs/[feature]/tasks.md`
- Product and technical steering documents guide overall direction

This Kiro-developed application emphasizes performance, accessibility, internationalization, and comprehensive user support through integrated help systems and extensive content management.