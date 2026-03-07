import { useProperty } from '@/contexts/PropertyContext';
import { getPropertyStats } from '@/data/mockData';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '@/components/DashboardCard';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingFormModal } from '@/components/BookingFormModal';
import { Button } from '@/components/ui/button';
import { BedDouble, CheckCircle, XCircle, CalendarCheck, CalendarMinus, IndianRupee, BookOpen, Plus, Wallet } from 'lucide-react';

export default function PropertyDashboard() {
  const { currentProperty } = useProperty();
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateRange, setDateRange] = useState({ from: todayStr, to: todayStr });
  const [showFilters, setShowFilters] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  if (!currentProperty) return null;

  const stats = getPropertyStats(currentProperty, dateRange.from, dateRange.to);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">{currentProperty.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{currentProperty.location}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-primary/10 border-primary' : ''}>
            <CalendarCheck className="h-4 w-4 mr-2" />
            {dateRange.from === dateRange.to ? dateRange.from : `${dateRange.from} - ${dateRange.to}`}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90 shadow-sm" onClick={() => { setInitialDate(undefined); setShowNewBooking(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-card border rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">From Date</label>
            <input type="date" value={dateRange.from} onChange={e => setDateRange({ ...dateRange, from: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">To Date</label>
            <input type="date" value={dateRange.to} onChange={e => setDateRange({ ...dateRange, to: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <DashboardCard title="Total Rooms" value={stats.totalRooms} icon={BedDouble} />
        <DashboardCard title="Available" value={stats.available} icon={CheckCircle} variant="default" />
        <DashboardCard title="Booked" value={stats.bookCount} icon={BookOpen} variant="success" />
        <DashboardCard title="Blocked" value={stats.blockCount} icon={XCircle} variant="destructive" />
        <DashboardCard title="Maintenance" value={stats.maintCount} icon={XCircle} variant="warning" />
        <DashboardCard title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} icon={IndianRupee} variant="success" />
      </div>

      <BookingCalendar
        bookings={currentProperty.bookings}
        totalRooms={currentProperty.totalRooms}
        onDateClick={(d) => {
          const dayBookings = currentProperty.bookings.filter(b => b.status !== 'Cancelled' && b.checkIn <= d && b.checkOut > d);
          if (dayBookings.length >= 2) {
            navigate(`/property/${currentProperty.id}/day-view/${d}`);
          } else if (dayBookings.length === 1) {
            setSelectedBooking(dayBookings[0]);
            setInitialDate(undefined);
            setShowNewBooking(true);
          } else {
            setSelectedBooking(null);
            setInitialDate(d);
            setShowNewBooking(true);
          }
        }}
      />

      {showNewBooking && (
        <BookingFormModal
          open={showNewBooking}
          onClose={() => { setShowNewBooking(false); setSelectedBooking(null); }}
          fixedPropertyId={currentProperty.id}
          initialDate={initialDate}
          initialData={selectedBooking}
        />
      )}
    </div>
  );
}
