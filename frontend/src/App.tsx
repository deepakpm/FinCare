import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <div className="app">
      <AppProvider>
        <AppShell>
          {/* Main content handled inside AppShell */}
        </AppShell>
      </AppProvider>
    </div>
  );
}

export default App;
