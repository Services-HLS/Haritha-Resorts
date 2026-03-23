import { useParams, useNavigate } from 'react-router-dom';
import { useProperty } from '@/contexts/PropertyContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    Calendar as CalendarIcon,
    Clock,
    User,
    DoorOpen,
    Edit2,
    ArrowLeft,
    Settings,
    AlertCircle,
    Construction
} from 'lucide-react';
import { useState } from 'react';
import { BookingFormModal } from '@/components/BookingFormModal';
import { Booking } from '@/data/mockData';

export default function DayView() {
    const { id, date } = useParams<{ id: string; date: string }>();
    const navigate = useNavigate();
    const { allProperties } = useProperty();

    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const property = allProperties.find(p => p.id === id);

    // Filter activities for this date
    const dayActivities = id === 'all'
        ? allProperties.flatMap(p => p.bookings.map(b => ({ ...b, propertyId: p.id }))).filter(b =>
            b.status !== 'Cancelled' &&
            b.checkIn <= (date || '') &&
            b.checkOut >= (date || '')
        )
        : (property?.bookings || []).filter(b =>
            b.status !== 'Cancelled' &&
            b.checkIn <= (date || '') &&
            b.checkOut >= (date || '')
        );

    if ((!property && id !== 'all') || !date) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Confirmed':
            case 'Checked-In':
            case 'Checked-Out':
            case 'Completed':
                return <Badge className="bg-green-100 text-green-700 border-green-200">Booked</Badge>;
            case 'Blocked':
                return <Badge className="bg-red-100 text-red-700 border-red-200">Blocked</Badge>;
            case 'Maintenance':
                return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Maintenance</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Maintenance': return <Construction className="h-5 w-5 text-orange-500" />;
            case 'Blocked': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <User className="h-5 w-5 text-green-600" />;
        }
    };

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="rounded-full hover:bg-primary/10 text-primary"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Daily Schedule</h1>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(date)}
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="px-4 py-1 text-sm font-semibold border-primary/20 bg-primary/5 text-primary">
                    {dayActivities.length} Activities Found
                </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {dayActivities.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-dashed p-12 text-center">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground">No activities scheduled for this day</h3>
                        <Button
                            variant="outline"
                            className="mt-4 border-primary text-primary"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                    </div>
                ) : (
                    dayActivities.map((activity) => (
                        <div
                            key={activity.id}
                            className="bg-card rounded-xl border card-shadow overflow-hidden hover:border-primary/40 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className={`w-2 md:w-3 self-stretch ${activity.status === 'Maintenance' ? 'bg-orange-500' :
                                    activity.status === 'Blocked' ? 'bg-red-500' : 'bg-green-600'
                                    }`} />

                                <div className="flex-1 p-5 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${activity.status === 'Maintenance' ? 'bg-orange-50' :
                                            activity.status === 'Blocked' ? 'bg-red-50' : 'bg-green-50'
                                            }`}>
                                            {getStatusIcon(activity.status)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-tight">{activity.guestName}</h3>
                                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1">
                                                <Clock className="h-3 w-3" />
                                                {activity.checkIn.split('T')[1]} - {activity.checkOut.split('T')[1]}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <DoorOpen className="h-4 w-4 text-primary/60" />
                                            <span className="text-sm font-semibold">Room {activity.roomNumber}</span>
                                        </div>
                                        {getStatusBadge(activity.status)}
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration</p>
                                        <p className="text-sm font-medium">Check-in: {activity.checkIn.split('T')[0]}</p>
                                        <p className="text-sm font-medium text-muted-foreground">Check-out: {activity.checkOut.split('T')[0]}</p>
                                    </div>

                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="group-hover:border-primary/50 group-hover:text-primary transition-all rounded-lg"
                                            onClick={() => {
                                                setSelectedBooking(activity);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showEditModal && selectedBooking && (
                <BookingFormModal
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedBooking(null);
                    }}
                    initialData={selectedBooking}
                    fixedPropertyId={id !== 'all' ? id : selectedBooking.propertyId}
                />
            )}
        </div>
    );
}
