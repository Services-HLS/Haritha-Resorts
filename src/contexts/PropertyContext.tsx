import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Property, properties as initialProperties, Booking, BookingStatus, RoomStatus, Guest, Invoice } from '@/data/mockData';

export interface GlobalFilters {
  district: string;
  place: string;
  resort: string;
  fromDate: string;
  toDate: string;
}

interface PropertyContextType {
  currentProperty: Property | null;
  setCurrentProperty: (p: Property | null) => void;
  allProperties: Property[];
  globalFilters: GlobalFilters;
  setGlobalFilters: React.Dispatch<React.SetStateAction<GlobalFilters>>;
  addBooking: (booking: Booking, propertyId: string) => boolean;
  updateBooking: (booking: Booking, propertyId: string) => boolean;
  deleteBooking: (bookingId: string, propertyId: string) => void;
  checkRoomAvailability: (propertyId: string, roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => boolean;
  markPaymentPaid: (bookingId: string, propertyId: string, amount: number) => void;
  addRestaurantOrder: (order: any, propertyId: string) => void;
  updateOrderStatus: (orderId: string, status: any, propertyId: string) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export function PropertyProvider({ children }: { children: ReactNode }) {
  // Clear problematic legacy storage keys
  useEffect(() => {
    ['hms_all_properties', 'hms_all_properties_v2', 'hms_all_properties_v3', 'hms_all_properties_v4', 'hms_all_properties_v5', 'hms_all_properties_v6', 'hms_all_properties_v7', 'hms_all_properties_v8', 'hms_all_properties_v9', 'hms_all_properties_v10', 'hms_all_properties_v11'].forEach(key => {
      try { localStorage.removeItem(key); } catch (e) { }
    });
  }, []);

  const [allProperties, setAllProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('hms_all_properties_v12');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return initialProperties;
      }
    }
    return initialProperties;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hms_all_properties_v12', JSON.stringify(allProperties));
    } catch (e) {
      console.warn('LocalStorage quota exceeded. Changes might not persist across sessions.', e);
    }
  }, [allProperties]);

  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [globalFilters, setGlobalFilters] = useState<GlobalFilters>({
    district: 'All',
    place: 'All',
    resort: 'All',
    fromDate: '',
    toDate: '',
  });

  const currentProperty = React.useMemo(() => {
    if (currentPropertyId === 'all') {
      let filteredProps = allProperties;

      if (globalFilters.resort !== 'All') {
        filteredProps = filteredProps.filter(p => p.id === globalFilters.resort);
      } else {
        if (globalFilters.district !== 'All') {
          filteredProps = filteredProps.filter(p => {
            const parts = p.location.split(', ');
            return parts.length >= 2 && parts[1] === globalFilters.district;
          });
        }
        if (globalFilters.place !== 'All') {
          filteredProps = filteredProps.filter(p => p.location.includes(globalFilters.place));
        }
      }

      const fromDate = globalFilters.fromDate;
      const toDate = globalFilters.toDate;

      const resultsOverlap = (start: string, end?: string) => {
        if (!fromDate && !toDate) return true; // Show everything if no date filter active
        const checkOut = end || start;
        const targetTo = toDate || fromDate;
        const targetFrom = fromDate || toDate;
        return (start <= targetTo && checkOut >= targetFrom);
      };

      const outRooms = filteredProps.flatMap(p => p.rooms.map(r => ({ ...r, propertyId: p.id, propertyName: p.name, propertyLocation: p.location })));
      const outBookings = filteredProps.flatMap(p => p.bookings.map(b => ({ ...b, propertyId: p.id, propertyName: p.name, propertyLocation: p.location }))).filter(b => resultsOverlap(b.checkIn, b.checkOut) || (b.bookingDate && resultsOverlap(b.bookingDate)));
      const outGuests = filteredProps.flatMap(p => p.guests.map(g => ({ ...g, propertyId: p.id, propertyName: p.name })));
      const outInvoices = filteredProps.flatMap(p => p.invoices.map(i => ({ ...i, propertyId: p.id }))).filter(i => resultsOverlap(i.date));
      const outExpenses = filteredProps.flatMap(p => p.expenses.map(e => ({ ...e, propertyId: p.id, propertyName: p.name }))).filter(e => resultsOverlap(e.date));
      const outOrders = filteredProps.flatMap(p => (p.orders || []).map(o => ({ ...o, propertyId: p.id, propertyName: p.name }))).filter(o => {
        const orderDate = o.timestamp ? o.timestamp.split('T')[0] : '';
        return orderDate && resultsOverlap(orderDate);
      });
      const outMenuItems = filteredProps.flatMap(p => p.menuItems.map(m => ({ ...m, propertyId: p.id })));

      return {
        id: 'all',
        name: 'All Properties',
        location: 'Statewide Consolidated View',
        hasRestaurant: true,
        hasPool: true,
        hasPlayzone: true,
        totalRooms: filteredProps.reduce((sum, p) => sum + (p.totalRooms || p.rooms.length), 0),
        taxPercentage: 12,
        rooms: outRooms,
        bookings: outBookings,
        guests: outGuests,
        invoices: outInvoices,
        expenses: outExpenses,
        orders: outOrders,
        menuItems: outMenuItems,
      } as unknown as Property;
    }
    return allProperties.find(p => p.id === currentPropertyId) || null;
  }, [allProperties, currentPropertyId, globalFilters]);

  const setCurrentProperty = (p: Property | null) => {
    setCurrentPropertyId(p ? p.id : null);
  };

  const updateRoomStatusHook = (props: Property[]) => {
    const today = new Date().toISOString().split('T')[0];
    return props.map(p => {
      let modified = false;
      const newRooms = p.rooms.map(room => {
        const roomBookings = p.bookings.filter(b => b.roomId === room.id && b.status !== 'Cancelled');

        const activeBooking = roomBookings.find(b =>
          (b.checkIn <= today && b.checkOut > today) &&
          ['Confirmed', 'Checked-In', 'Maintenance', 'Blocked'].includes(b.status)
        );

        let expectedStatus: RoomStatus = room.status;

        if (activeBooking) {
          if (activeBooking.status === 'Maintenance') expectedStatus = 'Maintenance';
          else if (activeBooking.status === 'Blocked') expectedStatus = 'Blocked';
          else expectedStatus = 'Occupied';
        } else if (['Occupied', 'Maintenance', 'Blocked'].includes(room.status)) {
          expectedStatus = 'Available';
        }

        if (expectedStatus !== room.status) {
          modified = true;
          return { ...room, status: expectedStatus };
        }
        return room;
      });

      if (modified) return { ...p, rooms: newRooms };
      return p;
    });
  };

  useEffect(() => {
    // Run Room Status sync
    setAllProperties(prev => updateRoomStatusHook(prev));
  }, []);

  const checkRoomAvailability = (propertyId: string, roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => {
    const property = allProperties.find(p => p.id === propertyId);
    if (!property) return false;

    return !property.bookings.some(b =>
      b.roomId === roomId &&
      b.status !== 'Cancelled' &&
      b.id !== excludeBookingId &&
      (checkIn < b.checkOut && checkOut > b.checkIn)
    );
  };

  const addBooking = (booking: Booking, propertyId: string) => {
    if (!checkRoomAvailability(propertyId, booking.roomId, booking.checkIn, booking.checkOut)) return false;

    setAllProperties(prev => {
      const updated = prev.map(p => {
        if (p.id !== propertyId) return p;

        // Sync Guest
        let newGuests = [...(p.guests || [])];
        if (booking.status !== 'Maintenance' && booking.status !== 'Blocked') {
          const guestIndex = newGuests.findIndex(g => g.email === booking.guestEmail || g.phone === booking.guestPhone);
          if (guestIndex === -1) {
            newGuests.push({
              id: `gst-${Date.now()}`,
              name: booking.guestName,
              email: booking.guestEmail,
              phone: booking.guestPhone,
              idType: 'Aadhar',
              idNumber: 'Pending',
              totalStays: 1,
              totalSpent: booking.totalAmount,
              bookings: [booking.id]
            });
          } else {
            newGuests[guestIndex] = {
              ...newGuests[guestIndex],
              totalStays: newGuests[guestIndex].totalStays + 1,
              totalSpent: newGuests[guestIndex].totalSpent + booking.totalAmount,
              bookings: [...newGuests[guestIndex].bookings, booking.id]
            };
          }
        }

        // Sync Invoice
        const newInvoice: Invoice = {
          id: `inv-${booking.id.split('-').pop() || Date.now()}`,
          bookingId: booking.id,
          guestName: booking.guestName,
          date: booking.bookingDate,
          dueDate: booking.checkIn,
          status: booking.paymentStatus,
          items: [{ description: `Room ${booking.roomNumber} - Stay`, quantity: 1, rate: booking.totalAmount / 1.12, amount: booking.totalAmount / 1.12 }],
          total: booking.totalAmount / 1.12,
          tax: (booking.totalAmount / 1.12) * 0.12,
          grandTotal: booking.totalAmount
        };

        return {
          ...p,
          bookings: [...p.bookings, booking],
          guests: newGuests,
          invoices: [newInvoice, ...(p.invoices || [])]
        };
      });
      return updateRoomStatusHook(updated);
    });
    return true;
  };

  const updateBooking = (booking: Booking, propertyId: string) => {
    if (!checkRoomAvailability(propertyId, booking.roomId, booking.checkIn, booking.checkOut, booking.id)) return false;

    setAllProperties(prev => {
      const updated = prev.map(p => {
        if (p.id !== propertyId) return p;
        const newBookings = p.bookings.map(b => b.id === booking.id ? booking : b);
        const newInvoices = (p.invoices || []).map(inv => {
          if (inv.id.includes(booking.id.split('-').pop() || 'never')) {
            return { ...inv, status: booking.paymentStatus, grandTotal: booking.totalAmount };
          }
          return inv;
        });
        return { ...p, bookings: newBookings, invoices: newInvoices };
      });
      return updateRoomStatusHook(updated);
    });
    return true;
  };

  const deleteBooking = (bookingId: string, propertyId: string) => {
    setAllProperties(prev => {
      const updated = prev.map(p => {
        if (p.id !== propertyId) return p;
        return {
          ...p,
          bookings: p.bookings.filter(b => b.id !== bookingId),
          invoices: (p.invoices || []).filter(inv => !inv.id.includes(bookingId.split('-').pop() || 'never'))
        };
      });
      return updateRoomStatusHook(updated);
    });
  };

  const markPaymentPaid = (bookingId: string, propertyId: string, amount: number) => {
    setAllProperties(prev => prev.map(p => {
      if (p.id !== propertyId) return p;
      return {
        ...p,
        bookings: p.bookings.map(b => {
          if (b.id !== bookingId) return b;
          const newPaidAmount = (b.paidAmount || 0) + amount;
          let newPaymentStatus = b.paymentStatus;
          if (newPaidAmount >= b.totalAmount) newPaymentStatus = 'Paid';
          else if (newPaidAmount > 0) newPaymentStatus = 'Partial';

          return { ...b, paidAmount: newPaidAmount, paymentStatus: newPaymentStatus };
        })
      };
    }));
  };

  const addRestaurantOrder = (order: any, propertyId: string) => {
    setAllProperties(prev => prev.map(p => {
      if (p.id !== propertyId) return p;
      return { ...p, orders: [order, ...p.orders] };
    }));
  };

  const updateOrderStatus = (orderId: string, status: any, propertyId: string) => {
    setAllProperties(prev => prev.map(p => {
      if (p.id !== propertyId) return p;
      return { ...p, orders: (p.orders || []).map(o => o.id === orderId ? { ...o, status } : o) };
    }));
  };

  return (
    <PropertyContext.Provider value={{
      currentProperty, setCurrentProperty, allProperties,
      globalFilters, setGlobalFilters,
      addBooking, updateBooking, deleteBooking, checkRoomAvailability, markPaymentPaid,
      addRestaurantOrder, updateOrderStatus
    } as any}>
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('useProperty must be used within PropertyProvider');
  return ctx;
}
