import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { GlobalHeader } from './GlobalHeader';
import { GlobalFooter } from './GlobalFooter';
import { ChatBot } from '../ChatBot';
import { useProperty } from '@/contexts/PropertyContext';
import { GlobalFilterBar } from './GlobalFilterBar';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentProperty } = useProperty();

  return (
    <div className="flex h-screen w-full overflow-hidden text-foreground bg-background">
      {currentProperty && <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <GlobalHeader />
        <AppHeader onMenuToggle={() => setSidebarOpen(v => !v)} />
        {currentProperty?.id === 'all' && <GlobalFilterBar />}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in w-full min-w-0 bg-background/50">
          <Outlet />
        </main>
        <GlobalFooter />
        <ChatBot />
      </div>
    </div>
  );
}
