import { useState, useMemo, useEffect } from 'react';
import { useProperty } from '@/contexts/PropertyContext';
import { Booking, Property, RoomType } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface BookingFormModalProps {
    open: boolean;
    onClose: () => void;
    initialData?: Booking | null;
    fixedPropertyId?: string;
    initialDate?: string;
    initialRoomId?: string;
    initialRoomType?: RoomType;
}

export function BookingFormModal({ open, onClose, initialData, fixedPropertyId, initialDate, initialRoomId, initialRoomType }: BookingFormModalProps) {
    const { allProperties, addBooking, updateBooking, deleteBooking, checkRoomAvailability } = useProperty();

    const [propertyId, setPropertyId] = useState<string>(fixedPropertyId || (initialData?.propertyId || ''));
    const [guestName, setGuestName] = useState(initialData?.guestName || '');
    const [guestPhone, setGuestPhone] = useState(initialData?.guestPhone || '');
    const [guestEmail, setGuestEmail] = useState(initialData?.guestEmail || '');

    const today = new Date().toISOString().split('T')[0];
    const defaultCheckIn = (initialDate || today) + 'T12:00';
    const tomorrowStr = initialDate
        ? new Date(new Date(initialDate).getTime() + 86400000).toISOString().split('T')[0]
        : new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const defaultCheckOut = tomorrowStr + 'T11:00';

    const [checkIn, setCheckIn] = useState(initialData?.checkIn || defaultCheckIn);
    const [checkOut, setCheckOut] = useState(initialData?.checkOut || defaultCheckOut);

    const checkInDate = checkIn.split('T')[0] || '';
    const checkInTime = checkIn.split('T')[1]?.substring(0, 5) || '12:00';

    const checkOutDate = checkOut.split('T')[0] || '';
    const checkOutTime = checkOut.split('T')[1]?.substring(0, 5) || '11:00';

    const [roomType, setRoomType] = useState<RoomType | ''>(initialRoomType || '');
    const [roomId, setRoomId] = useState(initialData?.roomId || initialRoomId || '');
    const [adults, setAdults] = useState(initialData?.adults?.toString() || '1');
    const [children, setChildren] = useState(initialData?.children?.toString() || '0');
    const [extraBeds, setExtraBeds] = useState(initialData?.extraBeds?.toString() || '0');

    const [addOns, setAddOns] = useState<string[]>(initialData?.addOns || []);

    const [paymentStatus, setPaymentStatus] = useState<Booking['paymentStatus']>(initialData?.paymentStatus || 'Unpaid');
    const [paymentType, setPaymentType] = useState<Booking['paymentType']>(initialData?.paymentType || 'Cash');
    const [paidAmount, setPaidAmount] = useState(initialData?.paidAmount?.toString() || '');
    const [status, setStatus] = useState<Booking['status']>(initialData?.status || 'Confirmed');
    const [customPrice, setCustomPrice] = useState<string>('');

    // New clear action type selector at the top
    const [actionType, setActionType] = useState<'booking' | 'maintenance' | 'blocked'>(() => {
        if (initialData?.status === 'Maintenance') return 'maintenance';
        if (initialData?.status === 'Blocked') return 'blocked';
        return 'booking';
    });

    // Rehydrate form state whenever modal opens with different booking context.
    // Without this, opening another booked room can show stale or empty details.
    useEffect(() => {
        if (!open) return;

        const freshPropertyId = fixedPropertyId || initialData?.propertyId || '';
        const freshToday = new Date().toISOString().split('T')[0];
        const freshDefaultCheckIn = (initialDate || freshToday) + 'T12:00';
        const freshTomorrowStr = initialDate
            ? new Date(new Date(initialDate).getTime() + 86400000).toISOString().split('T')[0]
            : new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const freshDefaultCheckOut = freshTomorrowStr + 'T11:00';

        const freshCheckIn = initialData?.checkIn || freshDefaultCheckIn;
        const freshCheckOut = initialData?.checkOut || freshDefaultCheckOut;

        const freshProperty = allProperties.find(p => p.id === freshPropertyId);
        const freshRoomId = initialData?.roomId || initialRoomId || '';
        const freshRoom = freshProperty?.rooms.find(r => r.id === freshRoomId);
        const derivedRoomType = initialRoomType || freshRoom?.type || '';

        const freshActionType: 'booking' | 'maintenance' | 'blocked' =
            initialData?.status === 'Maintenance' ? 'maintenance'
                : initialData?.status === 'Blocked' ? 'blocked'
                    : 'booking';

        const freshStatus =
            initialData?.status ||
            (freshActionType === 'maintenance' ? 'Maintenance'
                : freshActionType === 'blocked' ? 'Blocked'
                    : 'Confirmed');

        setPropertyId(freshPropertyId);
        setGuestName(initialData?.guestName || '');
        setGuestPhone(initialData?.guestPhone || '');
        setGuestEmail(initialData?.guestEmail || '');
        setCheckIn(freshCheckIn);
        setCheckOut(freshCheckOut);
        setRoomType(derivedRoomType);
        setRoomId(freshRoomId);
        setAdults(initialData?.adults?.toString() || '1');
        setChildren(initialData?.children?.toString() || '0');
        setExtraBeds(initialData?.extraBeds?.toString() || '0');
        setAddOns(initialData?.addOns || []);
        setPaymentStatus(initialData?.paymentStatus || 'Unpaid');
        setPaymentType(initialData?.paymentType || 'Cash');
        setPaidAmount(initialData?.paidAmount?.toString() || '');
        setStatus(freshStatus);
        setActionType(freshActionType);
        setError('');
    }, [
        open,
        initialData?.id,
        initialData?.propertyId,
        initialData?.roomId,
        initialDate,
        initialRoomId,
        initialRoomType,
        fixedPropertyId,
        allProperties
    ]);

    useEffect(() => {
        if (initialData?.status === 'Maintenance') setActionType('maintenance');
        else if (initialData?.status === 'Blocked') setActionType('blocked');
        else if (initialData) setActionType('booking');
    }, [initialData]);

    useEffect(() => {
        if (actionType === 'maintenance') setStatus('Maintenance');
        else if (actionType === 'blocked') setStatus('Blocked');
        else if (status === 'Maintenance' || status === 'Blocked') setStatus('Confirmed');
    }, [actionType]);

    const [error, setError] = useState('');

    const isInternal = status === 'Maintenance';

    const selectedProperty = useMemo(() => allProperties.find(p => p.id === propertyId), [allProperties, propertyId]);
    const selectedRoom = useMemo(() => selectedProperty?.rooms.find(r => r.id === roomId), [selectedProperty, roomId]);
    const roomCapacity = selectedRoom?.capacity || 2;

    // Derive Room Types Available in Property
    const availableRoomTypes = useMemo(() => {
        if (!selectedProperty) return [];
        return Array.from(new Set(selectedProperty.rooms.map(r => r.type)));
    }, [selectedProperty]);

    // Automatically set first room type if missing
    useEffect(() => {
        if (initialRoomType && !roomType) {
            setRoomType(initialRoomType);
        } else if (availableRoomTypes.length > 0 && !roomType && !initialData) {
            setRoomType(availableRoomTypes[0] as RoomType);
        }
    }, [availableRoomTypes, roomType, initialData, initialRoomType]);

    // Build room options for selected property/date/type with availability marker.
    // This lets users see which rooms are Booked vs Available in the same dropdown.
    const roomOptions = useMemo(() => {
        if (!selectedProperty || !roomType || !checkIn || !checkOut) return [];

        if (initialRoomId) {
            return selectedProperty.rooms
                .filter(r => r.id === initialRoomId)
                .map(r => ({ ...r, isAvailable: true }));
        }

        const possibleRooms = selectedProperty.rooms.filter(r => r.type === roomType);
        return possibleRooms.map(r => ({
            ...r,
            isAvailable: checkRoomAvailability(selectedProperty.id, r.id, checkIn, checkOut, initialData?.id)
        }));
    }, [selectedProperty, roomType, checkIn, checkOut, checkRoomAvailability, initialData, initialRoomId]);

    const availableRoomsList = useMemo(
        () => roomOptions.filter(r => r.isAvailable),
        [roomOptions]
    );

    // Automatically select first available room if current is empty or invalid
    useEffect(() => {
        if (initialRoomId && roomId === initialRoomId) return; // Prevent reset if locked

        if (availableRoomsList.length > 0) {
            if (!roomId || !availableRoomsList.find(r => r.id === roomId)) {
                setRoomId(availableRoomsList[0].id);
            }
        } else {
            setRoomId('');
        }
    }, [availableRoomsList, roomId, initialRoomId]);

    // Auto-calculate extra beds based on capacity vs entered persons
    useEffect(() => {
        const totalPersons = Number(adults) + Number(children);
        if (totalPersons > roomCapacity) {
            setExtraBeds((totalPersons - roomCapacity).toString());
        } else {
            setExtraBeds('0');
        }
    }, [adults, children, roomCapacity]);

    // Price Calculation
    const nights = useMemo(() => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
        return diff > 0 ? diff : 1;
    }, [checkIn, checkOut]);

    useEffect(() => {
        if (roomId && selectedProperty) {
            const room = selectedProperty.rooms.find(r => r.id === roomId);
            if (room) {
                // For existing bookings, use their saved price if available, otherwise fallback to room price
                if (initialData?.totalAmount !== undefined && nights > 0) {
                    setCustomPrice(initialData.totalAmount > 0 ? ((initialData.totalAmount / 1.12) / nights).toFixed(0) : room.pricePerNight.toString());
                } else {
                    setCustomPrice(room.pricePerNight.toString());
                }
            }
        }
    }, [roomId, selectedProperty, initialData, nights]);

    const baseAmount = useMemo(() => {
        if (!selectedProperty || !roomId || isInternal) return 0;
        let base = Number(customPrice) * nights;
        if (Number(extraBeds) > 0) base += (Number(extraBeds) * 300 * nights);
        if (addOns.includes('Restaurant Package')) base += (1500 * nights);
        if (addOns.includes('Pool Access')) base += (500 * nights);
        return base;
    }, [selectedProperty, roomId, nights, addOns, isInternal, customPrice, extraBeds]);

    const gstAmount = useMemo(() => baseAmount * 0.12, [baseAmount]);
    const totalAmount = useMemo(() => baseAmount + gstAmount, [baseAmount, gstAmount]);

    useEffect(() => {
        if (paymentStatus === 'Paid') setPaidAmount(totalAmount.toString());
        else if (paymentStatus === 'Unpaid') setPaidAmount('0');
    }, [paymentStatus, totalAmount]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!propertyId || !roomId || !checkIn || !checkOut) {
            setError('Please fill in all required fields.');
            return;
        }
        if (!isInternal && (!guestName || !guestPhone)) {
            setError('Please fill in all required guest fields.');
            return;
        }
        if (checkIn >= checkOut) {
            setError('Check-out date must be after Check-in date.');
            return;
        }

        if (!checkRoomAvailability(propertyId, roomId, checkIn, checkOut, initialData?.id)) {
            setError('This room is already booked for the selected dates. Please choose another combination.');
            return;
        }

        const roomNumber = selectedProperty?.rooms.find(r => r.id === roomId)?.number || '';

        const newBooking: Booking = {
            id: initialData?.id || `bk-new-${Date.now()}`,
            propertyId,
            roomId,
            roomNumber,
            guestName: isInternal ? (status === 'Maintenance' ? 'System Maintenance' : 'Room Blocked') : guestName,
            guestPhone: isInternal ? 'Internal' : guestPhone,
            guestEmail: isInternal ? '' : guestEmail,
            checkIn,
            checkOut,
            adults: isInternal ? 0 : Number(adults),
            children: isInternal ? 0 : Number(children),
            extraBeds: isInternal ? 0 : Number(extraBeds),
            status,
            paymentStatus: isInternal ? 'Paid' : paymentStatus,
            paymentType: isInternal ? 'Cash' : paymentType,
            totalAmount,
            paidAmount: isInternal ? 0 : (paymentStatus === 'Partial' ? Number(paidAmount) : (paymentStatus === 'Paid' ? totalAmount : 0)),
            addOns: isInternal ? [] : addOns,
            bookingDate: initialData?.bookingDate || new Date().toISOString().split('T')[0],
        };

        let success = false;
        if (initialData) {
            success = updateBooking(newBooking, propertyId);
        } else {
            success = addBooking(newBooking, propertyId);
        }

        if (success) {
            onClose();
        } else {
            setError('Failed to save booking. Please try again.');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {initialData
                            ? 'Edit Details'
                            : actionType === 'blocked' ? 'Block Room'
                                : actionType === 'maintenance' ? 'Schedule Maintenance'
                                    : 'Create New Booking'
                        }
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {error && (
                        <div className="bg-destructive/10 text-destructive border-l-4 border-destructive p-3 rounded text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}

                    {/* Action Type Selector - Only show for new bookings/blocks to prevent confusion */}
                    {!initialData && (
                        <div className="flex bg-muted p-1 gap-1 rounded-xl border shadow-inner">
                            <button
                                type="button"
                                onClick={() => setActionType('booking')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${actionType === 'booking' ? 'bg-yellow-500 text-white shadow-md transform scale-[1.02]' : 'text-muted-foreground hover:bg-background/50'}`}
                            >
                                Guest Booking
                            </button>
                            <button
                                type="button"
                                onClick={() => setActionType('blocked')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${actionType === 'blocked' ? 'bg-slate-500 text-white shadow-md transform scale-[1.02]' : 'text-muted-foreground hover:bg-background/50'}`}
                            >
                                Block Room
                            </button>
                            <button
                                type="button"
                                onClick={() => setActionType('maintenance')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${actionType === 'maintenance' ? 'bg-yellow-500 text-white shadow-md transform scale-[1.02]' : 'text-muted-foreground hover:bg-background/50'}`}
                            >
                                Under Maintenance
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Property Selection */}
                        {!fixedPropertyId && (
                            <div className="col-span-1 md:col-span-2">
                                <Label className="mb-1 block">Property</Label>
                                <select
                                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                                    value={propertyId}
                                    onChange={e => setPropertyId(e.target.value)}
                                    disabled={!!initialData}
                                >
                                    <option value="">Select Property...</option>
                                    {allProperties.map(p => <option key={p.id} value={p.id}>{p.name} - {p.location}</option>)}
                                </select>
                            </div>
                        )}

                        {/* Guest Info */}
                        {!isInternal && (
                            <div className="space-y-4 col-span-1 border rounded-lg p-4 bg-muted/20">
                                <h3 className="font-semibold text-sm border-b pb-2">Guest Information</h3>
                                <div>
                                    <Label>Guest Name *</Label>
                                    <Input required value={guestName} onChange={e => setGuestName(e.target.value)} className="mt-1 bg-background" />
                                </div>
                                <div>
                                    <Label>Phone Number *</Label>
                                    <Input required value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="mt-1 bg-background" />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} className="mt-1 bg-background" />
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                    <div className="flex flex-col gap-1.5 justify-end h-full">
                                        <Label className="leading-tight">Adults <span className="block text-[11px] text-muted-foreground font-normal">(Base: {roomCapacity})</span></Label>
                                        <Input type="number" min="1" value={adults} onChange={e => setAdults(e.target.value)} className="bg-background" />
                                    </div>
                                    <div className="flex flex-col gap-1.5 justify-end h-full">
                                        <Label className="leading-tight">Children <span className="block text-[11px] opacity-0">(Spacer)</span></Label>
                                        <Input type="number" min="0" value={children} onChange={e => setChildren(e.target.value)} className="bg-background" />
                                    </div>
                                    <div className="col-span-2 lg:col-span-1 flex flex-col gap-1.5 justify-end h-full">
                                        <Label className="leading-tight">Extra Beds (+₹300) <span className="block text-[11px] text-muted-foreground font-normal">(Auto exceeds cap)</span></Label>
                                        <Input type="number" min="0" value={extraBeds} onChange={e => setExtraBeds(e.target.value)} className="bg-background" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Room Info */}
                        <div className={`space-y-4 border rounded-lg p-4 bg-success/5 ${isInternal ? 'col-span-1 md:col-span-2' : 'col-span-1'}`}>
                            <h3 className="font-semibold text-sm border-b pb-2">Room & Dates</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>{isInternal ? 'From Date *' : 'Check In Date *'}</Label>
                                    <Input type="date" required value={checkInDate} onChange={e => setCheckIn(`${e.target.value}T${checkInTime}`)} className="mt-1 bg-background" />
                                </div>
                                <div>
                                    <Label>{isInternal ? 'End Date *' : 'Check Out Date *'}</Label>
                                    <Input type="date" required value={checkOutDate} onChange={e => setCheckOut(`${e.target.value}T${checkOutTime}`)} className="mt-1 bg-background" />
                                </div>
                            </div>
                            {!isInternal && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Check In Time *</Label>
                                        <Input type="time" required value={checkInTime} onChange={e => setCheckIn(`${checkInDate}T${e.target.value}`)} className="mt-1 bg-background" />
                                    </div>
                                    <div>
                                        <Label>Check Out Time *</Label>
                                        <Input type="time" required value={checkOutTime} onChange={e => setCheckOut(`${checkOutDate}T${e.target.value}`)} className="mt-1 bg-background" />
                                    </div>
                                </div>
                            )}
                            {!isInternal && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Room Price (₹ / night)</Label>
                                        <Input type="number" required value={customPrice} onChange={e => setCustomPrice(e.target.value)} className="mt-1 bg-background w-full" />
                                    </div>
                                    <div>
                                        <Label>GST (12%)</Label>
                                        <Input type="text" readOnly value={`₹${gstAmount.toLocaleString()}`} className="mt-1 bg-background/50 text-muted-foreground w-full" />
                                    </div>
                                </div>
                            )}
                            <div>
                                <Label>Room Type</Label>
                                <select
                                    className="w-full flex h-10 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                                    value={roomType} onChange={e => setRoomType(e.target.value as RoomType)}
                                    disabled={!!initialRoomId || !!initialData}
                                >
                                    {initialRoomId ? (
                                        <option value={roomType} className="text-muted-foreground">{roomType}</option>
                                    ) : (
                                        availableRoomTypes.map(t => <option key={t} value={t}>{t}</option>)
                                    )}
                                </select>
                            </div>
                            <div>
                                <Label>Select Room *</Label>
                                <select
                                    className="w-full flex h-10 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:bg-muted"
                                    value={roomId} onChange={e => setRoomId(e.target.value)} required
                                    disabled={!!initialRoomId || !!initialData}
                                >
                                    {initialRoomId && roomOptions.length > 0 ? (
                                        <option value={roomId}>Room {roomOptions.find(r => r.id === roomId)?.number || selectedProperty?.rooms.find(r => r.id === roomId)?.number} (Locked to Request)</option>
                                    ) : (
                                        <>
                                            <option value="">-- Choose Available --</option>
                                            {roomOptions.map(r => (
                                                <option key={r.id} value={r.id} disabled={!r.isAvailable}>
                                                    Room {r.number} (₹{r.pricePerNight}/nt) {r.isAvailable ? '- Available' : '- Booked'}
                                                </option>
                                            ))}
                                        </>
                                    )}
                                </select>
                                {availableRoomsList.length === 0 && roomType && (
                                    <p className="text-xs text-destructive mt-1">No rooms of this type available for these dates.</p>
                                )}
                            </div>
                        </div>

                        {/* Payment and Details */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 gap-4">                            {!isInternal && (
                            <div className="border rounded-lg p-4 bg-warning/5 space-y-4 font-medium">
                                <h3 className="font-semibold text-sm border-b pb-2">Payment Details</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Payment Type</Label>
                                        <select
                                            className="w-full h-10 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={paymentType} onChange={e => setPaymentType(e.target.value as Booking['paymentType'])}
                                        >
                                            {['Cash', 'Card', 'UPI'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <Label>Payment Status</Label>
                                        <select
                                            className="w-full h-10 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={paymentStatus} onChange={e => setPaymentStatus(e.target.value as Booking['paymentStatus'])}
                                        >
                                            {['Paid', 'Partial', 'Unpaid'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {paymentStatus === 'Partial' && (
                                    <div>
                                        <Label>Paid Amount (₹)</Label>
                                        <Input type="number" required max={totalAmount} value={paidAmount} onChange={e => setPaidAmount(e.target.value)} className="mt-1 bg-background" />
                                    </div>
                                )}

                                <div className="space-y-2 text-sm border-t pt-4 mt-2 border-primary/10">
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Room Cost (₹{customPrice} x {nights} {nights === 1 ? 'night' : 'nights'})</span>
                                        <span>₹{(Number(customPrice) * nights).toLocaleString()}</span>
                                    </div>
                                    {Number(extraBeds) > 0 && (
                                        <div className="flex justify-between items-center text-muted-foreground">
                                            <span>Extra Beds (₹300 x {extraBeds} {Number(extraBeds) === 1 ? 'bed' : 'beds'} x {nights} {nights === 1 ? 'nt' : 'nts'})</span>
                                            <span>+₹{(Number(extraBeds) * 300 * nights).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-muted-foreground border-b pb-2 mb-2 border-primary/10">
                                        <span>GST (12% on Room + Extra Beds)</span>
                                        <span>+₹{gstAmount.toLocaleString()}</span>
                                    </div>

                                    <div className="bg-primary/10 text-primary p-3 mt-4 rounded-lg flex justify-between items-center text-lg shadow-sm border border-primary/20">
                                        <span>Grand Total:</span>
                                        <span className="font-bold">₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>

                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        {initialData && (
                            <div className="mr-auto">
                                {actionType === 'booking' && new Date(checkIn) > new Date() && (
                                    <Button type="button" variant="destructive" onClick={() => { deleteBooking(initialData.id, propertyId); onClose(); }}>
                                        Cancel Booking
                                    </Button>
                                )}
                                {actionType === 'blocked' && (
                                    <Button type="button" variant="destructive" onClick={() => { deleteBooking(initialData.id, propertyId); onClose(); }}>
                                        Cancel Block
                                    </Button>
                                )}
                                {actionType === 'maintenance' && (
                                    <Button type="button" variant="destructive" onClick={() => { deleteBooking(initialData.id, propertyId); onClose(); }}>
                                        Remove Maintenance
                                    </Button>
                                )}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" className={
                                actionType === 'blocked' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" :
                                    actionType === 'maintenance' ? "bg-warning text-warning-foreground hover:bg-warning/90" :
                                        "bg-success text-success-foreground hover:bg-success/90"
                            }>
                                {initialData
                                    ? 'Save Changes'
                                    : actionType === 'blocked' ? 'Confirm Block'
                                        : actionType === 'maintenance' ? 'Confirm Maintenance'
                                            : 'Confirm New Booking'
                                }
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
