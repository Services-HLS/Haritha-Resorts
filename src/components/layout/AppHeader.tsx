import { useProperty } from '@/contexts/PropertyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogOut, Building2, Menu } from 'lucide-react';

interface AppHeaderProps {
  onMenuToggle?: () => void;
}

export function AppHeader({ onMenuToggle }: AppHeaderProps) {
  const { currentProperty, setCurrentProperty, allProperties } = useProperty();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handlePropertyChange = (id: string) => {
    if (id === 'all') {
      setCurrentProperty({ id: 'all' } as any);
      navigate('/property/all/dashboard');
      return;
    }
    const prop = allProperties.find(p => p.id === id);
    if (prop) {
      setCurrentProperty(prop);
      navigate(`/property/${prop.id}/dashboard`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-card border-b flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3 shrink-0">
        {onMenuToggle && currentProperty && (
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={onMenuToggle}>
            <Menu className="h-4 w-4" />
          </Button>
        )}
        <div className="hidden sm:flex items-center justify-center shrink-0 bg-white rounded-lg p-1 mx-2 h-11 w-11 shadow-sm border border-slate-100 overflow-hidden">
          <img src="/Haritha_logo.svg" alt="Haritha Logo" className="h-full w-full object-contain" />
        </div>
        {user?.role === 'Super Admin' ? (
          <Select value={currentProperty?.id || 'all'} onValueChange={handlePropertyChange}>
            <SelectTrigger className="w-[180px] sm:w-[260px] h-9 text-sm">
              <SelectValue placeholder="All Properties" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">All Properties — Global Dashboard</SelectItem>
              {allProperties.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="font-medium text-sm text-foreground">
            {currentProperty?.name || 'Property Dashboard'}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </Button>
      </div>
    </header>
  );
}
