# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# 🎨 EDIFICA Frontend

Sistema de Gestión de Presupuestos de Construcción - Interfaz Web

## 🚀 Tecnologías

- React 18
- TypeScript
- Material-UI v6
- Vite
- React Router v6

## 📋 Requisitos

- Node.js 18+
- npm o yarn

## ⚙️ Instalación

### 1. Clonar repositorio
```bash
git clone https://github.com/AlexanderSP6/edifica-frontend.git
cd edifica-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar URL del API

Editar `src/services/client.ts` línea 5:
```typescript
baseURL: 'http://localhost:80/api', // Cambiar según tu entorno
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

### 5. Acceder

http://localhost:5173

## 👥 Usuarios Demo

Usar las credenciales creadas en el backend.

## 📁 Estructura
```
src/
├── auth/              # Autenticación
├── components/        # Componentes reutilizables
├── hooks/             # Custom hooks
├── pages/             # Páginas
├── services/          # API services
├── types/             # TypeScript types
└── utils/             # Utilidades
```

## 🎨 Características

- Sistema de autenticación con JWT
- Dashboard con métricas
- Gestión de presupuestos (B-1 y B-2)
- Gestión de clientes
- Exportación a PDF
- Sistema de roles y permisos

## 🛠️ Comandos
```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview producción
npm run preview

```

## 🔗 Backend

Este frontend requiere el backend:  
https://github.com/AlexanderSP6/edifica-backend

## 📝 Autor
  
Proyecto de Grado 
Email: 

---

**Versión:** 1.0.0 | **Fecha:** Diciembre 2025
