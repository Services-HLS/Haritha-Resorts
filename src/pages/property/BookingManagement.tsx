import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProperty } from '@/contexts/PropertyContext';
import { Booking, BookingStatus } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingFormModal } from '@/components/BookingFormModal';
import { Eye, Edit, Trash2, Plus, CheckCircle, CreditCard } from 'lucide-react';
import { DataTablePagination } from '@/components/DataTablePagination';

const statusBadge = (s: BookingStatus) => {
  const map: Record<BookingStatus, 'success' | 'warning' | 'destructive'> = {
    Confirmed: 'success',
    Pending: 'warning',
    Cancelled: 'destructive',
    'Checked-In': 'success',
    'Checked-Out': 'warning',
    Completed: 'success',
    Maintenance: 'destructive',
    Blocked: 'destructive'
  };
  return <Badge variant={map[s]}>{s}</Badge>;
};

const paymentBadge = (s: string) => {
  const map: Record<string, 'success' | 'warning' | 'destructive'> = { Paid: 'success', Partial: 'warning', Unpaid: 'destructive' };
  return <Badge variant={map[s] || 'secondary'}>{s}</Badge>;
};

export default function BookingManagement() {
  const { currentProperty, deleteBooking, markPaymentPaid } = useProperty();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Booking | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<Booking | null>(null);
  const [initialDate, setInitialDate] = useState<string | undefined>();

  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFilter, statusFilter]);

  if (!currentProperty) return null;

  let filteredBookings = currentProperty.bookings;

  if (dateFilter) {
    filteredBookings = filteredBookings.filter(b => b.checkIn <= dateFilter && b.checkOut >= dateFilter);
  }

  if (statusFilter !== 'all') {
    filteredBookings = filteredBookings.filter(b => b.status === statusFilter);
  }

  const bookings = filteredBookings;
  const paginatedData = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Booking Management</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-background border rounded-md">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-[140px] border-0 h-9"
              title="Filter by Date"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {['Confirmed', 'Pending', 'Cancelled', 'Checked-In', 'Checked-Out', 'Completed', 'Maintenance', 'Blocked'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm h-9" onClick={() => { setEditData(null); setInitialDate(undefined); setShowForm(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>
      </div>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <div className="bg-card rounded-lg border card-shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {currentProperty.id === 'all' && <TableHead>Property</TableHead>}
                  <TableHead>ID</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map(b => (
                  <TableRow key={`${(b as any).propertyId || ''}-${b.id}`}>
                    {currentProperty.id === 'all' && <TableCell className="font-semibold text-primary truncate max-w-[150px]" title={(b as any).propertyName}>{(b as any).propertyName}</TableCell>}
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell className="font-medium">{b.guestName}</TableCell>
                    <TableCell>{b.roomNumber}</TableCell>
                    <TableCell>{b.checkIn}</TableCell>
                    <TableCell>{b.checkOut}</TableCell>
                    <TableCell>{statusBadge(b.status)}</TableCell>
                    <TableCell>{paymentBadge(b.paymentStatus)}</TableCell>
                    <TableCell>₹{b.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setSelected(b)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" onClick={() => { setEditData(b); setShowForm(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10" onClick={() => { if (confirm('Are you sure you want to delete this booking?')) deleteBooking(b.id, (b as any).propertyId || currentProperty.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <DataTablePagination
              totalItems={bookings.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <BookingCalendar
            bookings={bookings}
            totalRooms={currentProperty.totalRooms}
            onDateClick={(d) => {
              const dayBookings = bookings.filter(b => b.status !== 'Cancelled' && b.checkIn <= d && b.checkOut >= d);
              if (dayBookings.length >= 2) {
                navigate(`/property/${currentProperty.id}/day-view/${d}`);
              } else if (dayBookings.length === 1) {
                setEditData(dayBookings[0]);
                setInitialDate(undefined);
                setShowForm(true);
              } else {
                setEditData(null);
                setInitialDate(d);
                setShowForm(true);
              }
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Booking Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Guest:</span><p className="font-medium">{selected.guestName}</p></div>
                <div><span className="text-muted-foreground">Room:</span><p className="font-medium">{selected.roomNumber}</p></div>
                <div><span className="text-muted-foreground">Check-in:</span><p className="font-medium">{selected.checkIn}</p></div>
                <div><span className="text-muted-foreground">Check-out:</span><p className="font-medium">{selected.checkOut}</p></div>
                <div><span className="text-muted-foreground">Status:</span><div className="mt-0.5">{statusBadge(selected.status)}</div></div>
                <div><span className="text-muted-foreground">Payment:</span><div className="mt-0.5">{paymentBadge(selected.paymentStatus)}</div></div>
                <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{selected.guestPhone}</p></div>
                <div><span className="text-muted-foreground">Total:</span><p className="font-medium">₹{selected.totalAmount.toLocaleString()}</p></div>
              </div>

              {selected.paymentStatus !== 'Paid' && selected.status !== 'Cancelled' && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2">Actions</h4>
                  <div className="flex items-center gap-4 bg-muted/20 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-warning">Pending Balance: ₹{(selected.totalAmount - (selected.paidAmount || 0)).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Collect the remaining balance to finalize payment</p>
                    </div>
                    <Button className="bg-success text-success-foreground shrink-0 hover:bg-success/90" onClick={() => {
                      markPaymentPaid(selected.id, currentProperty.id, selected.totalAmount - (selected.paidAmount || 0));
                      setSelected({ ...selected, paymentStatus: 'Paid', paidAmount: selected.totalAmount });
                    }}>
                      <CheckCircle className="h-4 w-4 mr-2" /> Mark as Fully Paid
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showForm && (
        <BookingFormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          initialData={editData}
          fixedPropertyId={currentProperty.id}
          initialDate={initialDate}
        />
      )}
    </div>
  );
}
