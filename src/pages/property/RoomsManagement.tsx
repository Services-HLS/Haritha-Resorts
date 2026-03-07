import { useState } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { Room, RoomType, RoomStatus } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Plus, Eye } from 'lucide-react';
import { DataTablePagination } from '@/components/DataTablePagination';
import { BookingFormModal } from '@/components/BookingFormModal';
import { useNavigate } from 'react-router-dom';

const statusBadge = (status: string) => {
  if (status === 'Booked') return <Badge className="bg-green-600 hover:bg-green-700">{status}</Badge>;
  if (status === 'Blocked') return <Badge className="bg-blocked hover:opacity-90">{status}</Badge>;
  if (status === 'Under Maintenance') return <Badge className="bg-orange-500 hover:bg-orange-600">{status}</Badge>;
  return <Badge className="bg-slate-500 hover:bg-slate-600">{status}</Badge>;
};

export default function RoomsManagement() {
  const { currentProperty } = useProperty();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [floorFilter, setFloorFilter] = useState<string>('all');
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);

  if (!currentProperty) return null;

  const getComputedRoomStatus = (room: Room) => {
    const activeBooking = currentProperty.bookings.find(b =>
      b.roomId === room.id &&
      b.status !== 'Cancelled' &&
      b.checkIn <= dateFilter && b.checkOut > dateFilter
    );
    if (!activeBooking) return 'Available';
    if (activeBooking.status === 'Maintenance') return 'Under Maintenance';
    if (activeBooking.status === 'Blocked') return 'Blocked';
    return 'Booked';
  };

  const floors = [...new Set(currentProperty.rooms.map(r => r.floor))].sort();
  const filtered = currentProperty.rooms.filter(r =>
    (typeFilter === 'all' || r.type === typeFilter) &&
    (statusFilter === 'all' || getComputedRoomStatus(r) === statusFilter) &&
    (floorFilter === 'all' || r.floor === Number(floorFilter))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when filters change
  useState(() => setCurrentPage(1));

  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Rooms Management</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="shadow-sm" onClick={() => setShowNewRoomForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Room
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm" onClick={() => setShowBookingForm(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Booking
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex bg-background border rounded-md">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-[140px] border-0 h-9"
            title="Filter by Date"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Room Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(['Standard', 'Deluxe', 'Suite', 'Premium', 'Cottage'] as RoomType[]).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {['Available', 'Booked', 'Blocked', 'Under Maintenance'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={floorFilter} onValueChange={setFloorFilter}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue placeholder="Floor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {floors.map(f => <SelectItem key={f} value={String(f)}>Floor {f}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-lg border card-shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {currentProperty.id === 'all' && <TableHead>Property</TableHead>}
              <TableHead>Room</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price/Night</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(room => (
              <TableRow key={`${(room as any).propertyId || ''}-${room.id}`}>
                {currentProperty.id === 'all' && <TableCell className="font-semibold text-primary truncate max-w-[150px]" title={(room as any).propertyName}>{(room as any).propertyName}</TableCell>}
                <TableCell className="font-medium">{room.number}</TableCell>
                <TableCell>{room.type}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>{statusBadge(getComputedRoomStatus(room))}</TableCell>
                <TableCell>₹{room.pricePerNight.toLocaleString()}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" onClick={() => navigate(`/property/${(room as any).propertyId || currentProperty.id}/rooms/${room.id}`)} title="View Details">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100" onClick={() => setEditRoom(room)} title="Edit Room">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTablePagination
          totalItems={filtered.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      <Dialog open={!!editRoom} onOpenChange={() => setEditRoom(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Room {editRoom?.number}</DialogTitle></DialogHeader>
          {editRoom && (
            <div className="space-y-3">
              <div><Label>Room Number</Label><Input value={editRoom.number} readOnly className="mt-1" /></div>
              <div><Label>Type</Label><Input value={editRoom.type} readOnly className="mt-1" /></div>
              <div><Label>Status</Label><Input value={getComputedRoomStatus(editRoom)} readOnly className="mt-1" /></div>
              <div><Label>Price per Night</Label><Input value={`₹${editRoom.pricePerNight}`} readOnly className="mt-1" /></div>
              <Button className="w-full" onClick={() => setEditRoom(null)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showNewRoomForm} onOpenChange={setShowNewRoomForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Room</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Room Number *</Label><Input placeholder="e.g. 101" className="mt-1" /></div>
            <div>
              <Label>Room Type *</Label>
              <Select defaultValue="Standard">
                <SelectTrigger className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {(['Standard', 'Deluxe', 'Suite', 'Premium', 'Cottage'] as RoomType[]).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Floor Level *</Label><Input type="number" placeholder="e.g. 1" className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price per Night (₹) *</Label><Input type="number" placeholder="e.g. 2500" className="mt-1" /></div>
              <div><Label>Capacity (Guests) *</Label><Input type="number" placeholder="e.g. 2" className="mt-1" /></div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button variant="outline" onClick={() => setShowNewRoomForm(false)}>Cancel</Button>
              <Button onClick={() => setShowNewRoomForm(false)}>Save Room</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showBookingForm && (
        <BookingFormModal
          open={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          fixedPropertyId={currentProperty.id}
        />
      )}
    </div>
  );
}
