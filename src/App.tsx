// App.tsx
import React from 'react';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from '../src/routes/AppRoutes'; 

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;

