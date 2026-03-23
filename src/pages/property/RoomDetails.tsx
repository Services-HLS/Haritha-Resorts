import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '@/contexts/PropertyContext';
import { BookingCalendar } from '@/components/BookingCalendar';
import { BookingFormModal } from '@/components/BookingFormModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, CalendarPlus, Pencil, LayoutList, CalendarDays } from 'lucide-react';

const statusBadge = (status: string) => {
    const map: Record<string, string> = {
        Available: 'success', Occupied: 'destructive', Cleaning: 'warning', Maintenance: 'destructive-outline', Blocked: 'secondary'
    };
    return <Badge variant={(map[status] || 'default') as any}>{status}</Badge>;
};

export default function RoomDetails() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const { currentProperty } = useProperty();

    const [showBookingForm, setShowBookingForm] = useState(false);
    const [bookingDate, setBookingDate] = useState<string | undefined>();
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    if (!currentProperty || !roomId) return null;

    const room = currentProperty.rooms.find(r => r.id === roomId);

    if (!room) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Room not found</h2>
                <Button onClick={() => navigate(`/property/${currentProperty.id}/rooms`)}>Back to Rooms</Button>
            </div>
        );
    }

    const roomBookings = currentProperty.bookings.filter(b => b.roomId === room.id);
    const activeBookings = roomBookings.filter(b => !!b.id && b.status !== 'Cancelled');

    // Sort bookings by check-in date
    const upcomingBookings = [...activeBookings].sort((a, b) => new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime());

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/property/${currentProperty.id}/rooms`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold">Room {room.number} Details</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => navigate(`/property/${currentProperty.id}/rooms`)}>
                        <Pencil className="h-4 w-4 mr-2" /> Quick Edit (Rooms Page)
                    </Button>
                    <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => setShowBookingForm(true)}>
                        <CalendarPlus className="h-4 w-4 mr-2" /> Book This Room
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-[400px] grid-cols-2 mb-6">
                    <TabsTrigger value="overview"><LayoutList className="h-4 w-4 mr-2" /> Overview & Bookings</TabsTrigger>
                    <TabsTrigger value="calendar"><CalendarDays className="h-4 w-4 mr-2" /> Interactive Calendar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="bg-card rounded-lg border card-shadow overflow-hidden">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold text-lg">Room Overview</h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Current Status</TableHead>
                                    <TableHead>Room Type</TableHead>
                                    <TableHead>Floor Level</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Price / Night</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{statusBadge(room.status)}</TableCell>
                                    <TableCell className="font-medium">{room.type}</TableCell>
                                    <TableCell>Floor {room.floor}</TableCell>
                                    <TableCell>{room.capacity} Guests</TableCell>
                                    <TableCell className="font-semibold text-green-600">₹{room.pricePerNight.toLocaleString()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <div className="bg-card rounded-lg border card-shadow overflow-hidden">
                        <div className="p-4 border-b bg-muted/20">
                            <h3 className="font-semibold text-lg">Upcoming & Active Bookings</h3>
                        </div>
                        {upcomingBookings.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Guest Name</TableHead>
                                        <TableHead>Check-In</TableHead>
                                        <TableHead>Check-Out</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Total Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingBookings.map(b => (
                                        <TableRow key={b.id}>
                                            <TableCell className="font-medium">{b.guestName || '-'}</TableCell>
                                            <TableCell>{new Date(b.checkIn).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(b.checkOut).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.status === 'Maintenance' ? 'bg-orange-100 text-orange-800' : b.status === 'Blocked' ? 'bg-red-100 text-red-600 border-red-200 border' : 'bg-yellow-50 text-yellow-700 border-yellow-100 border'}`}>
                                                    {b.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>₹{b.totalAmount.toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                No active or upcoming bookings for this room.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="calendar">
                    <div className="max-w-3xl">
                        <BookingCalendar
                            bookings={roomBookings}
                            totalRooms={1}
                            className="w-full"
                            onDateClick={(d) => {
                                const existing = roomBookings.find(b => b.status !== 'Cancelled' && b.checkIn <= d && b.checkOut >= d);
                                if (existing) {
                                    setSelectedBooking(existing);
                                } else {
                                    setBookingDate(d);
                                    setSelectedBooking(null);
                                }
                                setShowBookingForm(true);
                            }}
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {showBookingForm && (
                <BookingFormModal
                    open={showBookingForm}
                    onClose={() => {
                        setShowBookingForm(false);
                        setBookingDate(undefined);
                        setSelectedBooking(null);
                    }}
                    initialData={selectedBooking}
                    fixedPropertyId={currentProperty.id}
                    initialDate={bookingDate}
                    initialRoomId={room.id}
                    initialRoomType={room.type}
                />
            )}
        </div>
    );
}
