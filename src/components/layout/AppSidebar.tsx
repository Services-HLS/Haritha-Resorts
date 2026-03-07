import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useProperty } from '@/contexts/PropertyContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, Receipt,
  UtensilsCrossed, Waves, BarChart3, Settings, X, Building2, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { currentProperty, setCurrentProperty } = useProperty();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentProperty) return null;

  const basePath = `/property/${currentProperty.id}`;
  const navItems = [
    { to: `${basePath}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${basePath}/rooms`, label: 'Rooms', icon: BedDouble },
    { to: `${basePath}/bookings`, label: 'Bookings', icon: CalendarCheck },
    { to: `${basePath}/guests`, label: 'Guests', icon: Users },
    { to: `${basePath}/billing`, label: 'Billing & Payments', icon: Receipt },
    ...(currentProperty.hasRestaurant ? [{ to: `${basePath}/restaurant`, label: 'Restaurant', icon: UtensilsCrossed }] : []),
    { to: `${basePath}/amenities`, label: 'Amenities', icon: Waves },
    { to: `${basePath}/reports`, label: 'Reports', icon: BarChart3 },
    { to: `${basePath}/settings`, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {open && <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed lg:static z-50 top-0 left-0 h-full w-60 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/Haritha_logo.svg" alt="Haritha Logo" className="h-10 w-10 shrink-0 object-contain" />
            <span className="text-sm font-semibold truncate">{currentProperty.name}</span>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden h-7 w-7 text-sidebar-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {user?.role === 'Super Admin' && (
          <div className="p-3 border-b border-sidebar-border shrink-0">
            <Button
              variant="secondary"
              className="w-full justify-start text-xs h-9 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-foreground border border-sidebar-border/50"
              onClick={() => {
                setCurrentProperty(null);
                navigate('/');
                onClose();
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Global Dashboard
            </Button>
          </div>
        )}

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50">{currentProperty.location}</p>
        </div>
      </aside>
    </>
  );
}
