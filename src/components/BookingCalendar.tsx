import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Booking } from '@/data/mockData';

interface BookingCalendarProps {
  bookings: Booking[];
  totalRooms?: number;
  className?: string;
  onDateClick?: (date: string) => void;
}

export function BookingCalendar({ bookings, totalRooms = 30, className, onDateClick }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  function getDayData(dateStr: string) {
    const dayBookings = bookings.filter(b => b.checkIn <= dateStr && b.checkOut > dateStr);

    const counts = {
      Booked: 0,
      Maintenance: 0,
      Blocked: 0
    };

    dayBookings.forEach(b => {
      if (b.status === 'Maintenance') counts.Maintenance++;
      else if (b.status === 'Blocked') counts.Blocked++;
      else if (b.status !== 'Cancelled') counts.Booked++;
    });

    return counts;
  }

  const statusConfig: Record<string, { label: string, classes: string }> = {
    Booked: { label: 'Bk', classes: 'bg-green-100 text-green-700 border-green-200 uppercase font-bold text-[10px]' },
    Blocked: { label: 'Blk', classes: 'bg-red-100 text-red-700 border-red-200 uppercase font-bold text-[10px]' },
    Maintenance: { label: 'Mnt', classes: 'bg-orange-100 text-orange-700 border-orange-200 uppercase font-bold text-[10px]' }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={cn('bg-card rounded-lg p-5 card-shadow border', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-semibold text-sm">Booking Calendar</h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prev}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium w-36 text-center">{monthName}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={next}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map(d => <div key={d} className="text-xs text-muted-foreground font-medium py-1">{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const data = getDayData(dateStr);
          const totalCount = data.Booked + data.Maintenance + data.Blocked;

          const hasData = totalCount > 0;

          return (
            <div
              key={day}
              onClick={() => onDateClick?.(dateStr)}
              className={cn(
                'flex flex-col items-center justify-start py-1 text-xs rounded-lg min-h-[68px] transition-all duration-200 border',
                hasData ? 'bg-slate-50 border-slate-200' : 'bg-transparent border-transparent text-foreground hover:bg-accent/50',
                onDateClick ? 'cursor-pointer hover:border-primary/50' : 'cursor-default'
              )}
            >
              <span className={cn("text-[13px] font-medium leading-none mb-1", hasData ? "text-slate-800" : "text-muted-foreground")}>{day}</span>

              {hasData && (
                <div className="flex flex-col gap-[2px] w-full px-1 mt-auto mb-0.5">
                  {Object.entries(data).map(([key, count]) => {
                    if (key === 'totalCount' || count === 0) return null;
                    const config = statusConfig[key];
                    return (
                      <div key={key} className={cn("text-[10px] font-bold leading-[12px] py-[1px] w-full rounded-sm border text-center", config?.classes)} title={`${count} ${key}`}>
                        {count as number} {config?.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-5 text-xs justify-center text-muted-foreground border-t pt-4">
        {Object.entries(statusConfig).map(([status, config]) => (
          <span key={status} className="flex items-center gap-1.5 whitespace-nowrap">
            <span className={cn("text-[10px] font-bold rounded-sm border px-1 py-0.5 leading-none", config.classes)}>{config.label}</span> {status}
          </span>
        ))}
      </div>
    </div>
  );
}
