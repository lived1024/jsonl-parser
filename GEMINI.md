# Gemini Project Context: JSONL Parser

This document provides essential context about the JSONL Parser project for the Gemini agent.

## Project Overview

This is a web-based utility designed to parse and visualize JSON (JavaScript Object Notation) and JSONL (JSON Lines) data. It provides an interactive tree view of the data, making it easier for users to inspect and understand complex JSON structures. The application is built as a single-page application (SPA).

The project has recently expanded beyond a simple tool into a comprehensive content hub for developers working with JSON. It now includes educational tutorials, additional data manipulation tools, reference guides, and a library of sample data. Monetization is implemented through Google AdSense.

The application supports internationalization (i18n) with English and Korean languages.

**Current Status:** The core parser and i18n features are complete. The content expansion and monetization features are partially implemented. Key remaining tasks include implementing analytics, final performance optimizations, comprehensive testing, and SEO enhancements.

## Tech Stack

- **Framework**: Vue 3 (using the Composition API and `<script setup>`)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Language**: TypeScript
- **Routing**: Vue Router
- **Testing**: Vitest with Vue Test Utils
- **Styling**: Standard CSS, with scoped styles within Vue components.

## Project Structure

- `src/`: Contains all the application source code.
  - `src/components/`: Reusable Vue components.
    - `ui/`: General-purpose UI elements (e.g., `LanguageSelector.vue`).
    - `feature/`: Components implementing core features (e.g., `InputPanel.vue`, `OutputPanel.vue`).
    - `common/`: Components for the expanded content site (e.g., `AdSenseContainer.vue`, `MainNavigation.vue`).
  - `src/composables/`: Vue Composition API functions (e.g., `useI18n.ts`).
  - `src/stores/`: Pinia state management stores (e.g., `jsonTreeStore.ts`, `i18nStore.ts`).
  - `src/locales/`: Translation files for internationalization.
  - `src/router/`: Vue Router configuration, including routes for content sections.
  - `src/types/`: TypeScript type definitions.
  - `src/content/`: Static content (Markdown files) for tutorials, guides, etc.
  - `src/__tests__/`: Test files written with Vitest.
- `package.json`: Defines project dependencies and scripts.
- `vite.config.ts`: Vite build configuration.
- `tsconfig.json`: TypeScript compiler options.

## Development & Testing

- **Package Manager**: `npm` is used for dependency management.
- **Running Locally**: Use `npm run dev` to start the Vite development server.
- **Building**: Use `npm run build` to create a production build.
- **Testing**: Use `npm run test` to execute the test suite with Vitest. Test files are co-located within the `src` directory under `__tests__` subdirectories.

## Internationalization (i18n)

The application supports multiple languages (English and Korean) using a custom i18n implementation.

- **State Management**: `src/stores/i18nStore.ts` (Pinia store) manages the current language and loads translations.
- **Composable**: `src/composables/useI18n.ts` provides the `t()` function for translating text in components.
- **Translations**: Language files are located in `src/locales/`.
- **UI**: The `src/components/ui/LanguageSelector.vue` component allows users to switch languages.
- **Persistence**: The selected language is saved to `localStorage` to persist across sessions.
