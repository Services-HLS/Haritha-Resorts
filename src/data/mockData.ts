// ===== TYPES =====
export interface Owner {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  propertyId?: string;
}

export type RoomStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance' | 'Blocked';
export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Premium' | 'Cottage';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Checked-In' | 'Checked-Out' | 'Completed' | 'Cancelled' | 'Maintenance' | 'Blocked';
export type PaymentStatus = 'Paid' | 'Partial' | 'Unpaid';
export type PaymentType = 'Cash' | 'Card' | 'UPI';
export type OrderStatus = 'Preparing' | 'Served' | 'Cancelled';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  status: RoomStatus;
  pricePerNight: number;
  capacity: number;
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  propertyId?: string; // Add propertyId reference
  roomId: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentType?: PaymentType;
  totalAmount: number;
  paidAmount?: number;
  adults?: number;
  children?: number;
  extraBeds?: number;
  addOns?: string[];
  bookingDate: string;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  idType: string;
  idNumber: string;
  totalStays: number;
  totalSpent: number;
  bookings: string[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  bookingId: string;
  guestName: string;
  date: string;
  dueDate: string;
  status: PaymentStatus;
  items: InvoiceItem[];
  total: number;
  tax: number;
  grandTotal: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

export interface RestaurantOrder {
  id: string;
  tableNumber: number;
  items: { menuItem: MenuItem; quantity: number }[];
  status: OrderStatus;
  total: number;
  timestamp: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  propertyId?: string;
}

export interface Property {
  id: string;
  name: string;
  location: string;
  hasRestaurant: boolean;
  hasPool: boolean;
  hasPlayzone: boolean;
  totalRooms: number;
  taxPercentage: number;
  rooms: Room[];
  bookings: Booking[];
  guests: Guest[];
  invoices: Invoice[];
  expenses: Expense[];
  orders: RestaurantOrder[];
  menuItems: MenuItem[];
}

// ===== OWNER =====
export const users: Owner[] = [
  {
    id: 'owner-1',
    name: 'Super Admin',
    email: 'admin@hms.gov.in',
    password: 'admin123',
    role: 'Super Admin',
  },
  {
    id: 'user-1',
    name: 'Araku Valley User',
    email: 'araku@hms.gov.in',
    password: 'password123',
    role: 'Property Manager',
    propertyId: 'prop-1',
  },
  {
    id: 'user-2',
    name: 'Rushikonda User',
    email: 'rushikonda@hms.gov.in',
    password: 'password123',
    role: 'Property Manager',
    propertyId: 'prop-2',
  }
];

// ===== HELPERS =====
const roomTypes: RoomType[] = ['Standard', 'Deluxe', 'Suite', 'Premium', 'Cottage'];
const roomStatuses: RoomStatus[] = ['Available', 'Occupied', 'Cleaning', 'Maintenance', 'Blocked'];
const bookingStatuses: BookingStatus[] = ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Completed', 'Cancelled', 'Maintenance', 'Blocked'];
const paymentStatuses: PaymentStatus[] = ['Paid', 'Partial', 'Unpaid'];
const orderStatuses: OrderStatus[] = ['Preparing', 'Served', 'Cancelled'];

const firstNames = ['Amit', 'Priya', 'Suresh', 'Kavita', 'Rahul', 'Anjali', 'Vikram', 'Meera', 'Deepak', 'Sunita', 'Arjun', 'Neha', 'Rohan', 'Divya', 'Manish', 'Pooja', 'Arun', 'Rekha', 'Sanjay', 'Lakshmi'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Verma', 'Gupta', 'Kumar', 'Reddy', 'Nair', 'Joshi', 'Mishra', 'Das', 'Rao', 'Iyer', 'Pillai', 'Desai', 'Mehta', 'Shah', 'Bhat', 'Menon', 'Chauhan'];

const menuCategories = [
  { category: 'Starters', items: ['Paneer Tikka', 'Chicken 65', 'Veg Spring Roll', 'Fish Fry', 'Aloo Tikki'] },
  { category: 'Main Course', items: ['Butter Chicken', 'Dal Makhani', 'Biryani', 'Paneer Butter Masala', 'Fish Curry'] },
  { category: 'Beverages', items: ['Masala Chai', 'Fresh Lime Soda', 'Mango Lassi', 'Coffee', 'Mineral Water'] },
  { category: 'Desserts', items: ['Gulab Jamun', 'Rasmalai', 'Ice Cream', 'Kheer', 'Jalebi'] },
];

// Simple Seeded PRNG to ensure data doesn't change on page refresh
function seedRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}
const rng = seedRandom(12345); // Fixed seed

function rand(min: number, max: number) { return Math.floor(rng() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rand(0, arr.length - 1)]; }
function guestName() { return `${pick(firstNames)} ${pick(lastNames)}`; }
function dateStr(daysOffset: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

function generateRooms(count: number): Room[] {
  const rooms: Room[] = [];
  for (let i = 1; i <= count; i++) {
    const floor = Math.ceil(i / 10);
    // Increase probability of Active States
    const sSeed = rng();
    let status: RoomStatus = 'Available';
    if (sSeed < 0.20) status = 'Occupied';      // 20% Occupied
    else if (sSeed < 0.28) status = 'Cleaning'; // 8% Cleaning
    else if (sSeed < 0.35) status = 'Maintenance'; // 7% Maintenance
    else if (sSeed < 0.42) status = 'Blocked';     // 7% Blocked
    // 58% Available

    rooms.push({
      id: `room-${i}`,
      number: `${floor}${String(i % 10 || 10).padStart(2, '0')}`,
      type: pick(roomTypes),
      floor,
      status,
      pricePerNight: pick([1500, 2000, 2500, 3500, 5000, 7500, 10000]),
      capacity: pick([1, 2, 2, 3, 4]),
    });
  }
  return rooms;
}

function generateIntelligentBookings(rooms: Room[], isMainResort: boolean): Booking[] {
  const bookings: Booking[] = [];

  // Guaranteed Data for ALL resorts to ensure global filters work perfectly
  // 1. Guaranteed Booked (starts and ends before today)
  bookings.push({
    id: `bk-guar-booked-${rooms[0].id}`,
    guestName: guestName(),
    guestEmail: 'active@email.com',
    guestPhone: '+91 88888 11111',
    roomId: rooms[0].id,
    roomNumber: rooms[0].number,
    checkIn: dateStr(-10),
    checkOut: dateStr(-5),
    status: 'Confirmed', // Keeps the "Booked" tag
    bookingDate: dateStr(-12),
    paymentStatus: 'Paid',
    totalAmount: rooms[0].pricePerNight * 5,
    paidAmount: rooms[0].pricePerNight * 5,
  });

  // 2. Guaranteed Under Maintenance (starts and ends before today)
  bookings.push({
    id: `bk-guar-maint-${rooms[1].id}`,
    guestName: 'Annual Maintenance',
    guestEmail: 'admin@hms.gov.in',
    guestPhone: 'Internal',
    roomId: rooms[1].id,
    roomNumber: rooms[1].number,
    checkIn: dateStr(-4),
    checkOut: dateStr(-1),
    status: 'Maintenance',
    bookingDate: dateStr(-5),
    paymentStatus: 'Unpaid',
    totalAmount: 0,
    paidAmount: 0,
  });

  // 3. Guaranteed Blocked (starts in the future)
  bookings.push({
    id: `bk-guar-block-${rooms[2].id}`,
    guestName: 'Admin Block',
    guestEmail: 'admin@hms.gov.in',
    guestPhone: 'Internal',
    roomId: rooms[2].id,
    roomNumber: rooms[2].number,
    checkIn: dateStr(2),
    checkOut: dateStr(5),
    status: 'Blocked',
    bookingDate: dateStr(0),
    paymentStatus: 'Unpaid',
    totalAmount: 0,
    paidAmount: 0,
  });

  // 4. Guaranteed Check-In Today (active guest booking)
  bookings.push({
    id: `bk-guar-checkin-today-${rooms[3].id}`,
    guestName: guestName(),
    guestEmail: 'checkin.today@email.com',
    guestPhone: '+91 77777 11111',
    roomId: rooms[3].id,
    roomNumber: rooms[3].number,
    checkIn: `${dateStr(0)}T12:00`,
    checkOut: `${dateStr(2)}T11:00`,
    status: 'Confirmed',
    bookingDate: dateStr(-1),
    paymentStatus: 'Partial',
    totalAmount: rooms[3].pricePerNight * 2,
    paidAmount: Math.round((rooms[3].pricePerNight * 2) * 0.5),
  });

  // 5. Guaranteed Check-Out Today (guest stay ending today)
  bookings.push({
    id: `bk-guar-checkout-today-${rooms[4].id}`,
    guestName: guestName(),
    guestEmail: 'checkout.today@email.com',
    guestPhone: '+91 66666 22222',
    roomId: rooms[4].id,
    roomNumber: rooms[4].number,
    checkIn: `${dateStr(-2)}T12:00`,
    checkOut: `${dateStr(0)}T11:00`,
    status: 'Checked-Out',
    bookingDate: dateStr(-3),
    paymentStatus: 'Paid',
    totalAmount: rooms[4].pricePerNight * 2,
    paidAmount: rooms[4].pricePerNight * 2,
  });

  rooms.forEach((room, index) => {
    // Skip random generation for the guaranteed rooms
    if (index < 5) return;
    // 1. PAST DATA (-30 to -1 days)
    // Only for main resorts to save huge space
    if (isMainResort) {
      const pastCount = rand(2, 4); // Reduced from 18 to save space
      let currentOffset = -30;

      for (let j = 0; j < pastCount; j++) {
        const stay = rand(1, 4);
        const gap = rand(1, 5);
        const checkInOffset = currentOffset + gap;
        const checkOutOffset = checkInOffset + stay;

        if (checkOutOffset >= 0) break;

        const status = pick(['Completed', 'Checked-Out'] as BookingStatus[]);
        bookings.push({
          id: `bk-past-${room.id}-${j}`,
          guestName: guestName(),
          guestEmail: 'guest@email.com',
          guestPhone: '+91 99999 00000',
          roomId: room.id,
          roomNumber: room.number,
          checkIn: dateStr(checkInOffset),
          checkOut: dateStr(checkOutOffset),
          status,
          bookingDate: dateStr(checkInOffset - 5),
          paymentStatus: 'Paid',
          totalAmount: room.pricePerNight * stay,
        });
        currentOffset = checkOutOffset;
      }
    }

    // 2. PRESENT DATA (Today)
    const seed = rng();
    const isOccupiedToday = isMainResort ? seed < 0.75 : seed < 0.1;

    if (isOccupiedToday) {
      let status: BookingStatus = rng() < 0.2 ? 'Checked-In' : 'Confirmed';
      let gName = guestName();
      let isSpecial = false;

      const startOffset = rand(-2, 0);
      const stay = rand(2, 5);
      const isBookingToday = rng() < 0.4;
      const bDate = isBookingToday ? dateStr(0) : dateStr(startOffset - 2);

      const totalAmount = room.pricePerNight * stay;
      const paidAmount = (status === 'Checked-In' || status === 'Confirmed') ? totalAmount * (rng() < 0.5 ? 1 : 0.5) : 0;
      const paymentStatus = isSpecial ? 'Unpaid' : (paidAmount === totalAmount ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Unpaid'));

      bookings.push({
        id: `bk-today-${room.id}`,
        guestName: gName,
        guestEmail: isSpecial ? 'admin@hms.gov.in' : 'guest@email.com',
        guestPhone: isSpecial ? 'Internal' : '+91 88888 11111',
        roomId: room.id,
        roomNumber: room.number,
        checkIn: dateStr(startOffset),
        checkOut: dateStr(startOffset + stay),
        status,
        bookingDate: bDate,
        paymentStatus: paymentStatus as any,
        totalAmount: isSpecial ? 0 : totalAmount,
        paidAmount: isSpecial ? 0 : paidAmount,
      });
    }

    // 3. FUTURE DATA
    if (isMainResort && rng() < 0.3) {
      const offset = rand(5, 15);
      const stay = rand(1, 3);
      bookings.push({
        id: `bk-future-${room.id}`,
        guestName: guestName(),
        guestEmail: 'future@email.com',
        guestPhone: '+91 77777 22222',
        roomId: room.id,
        roomNumber: room.number,
        checkIn: dateStr(offset),
        checkOut: dateStr(offset + stay),
        status: 'Confirmed',
        bookingDate: dateStr(0),
        paymentStatus: 'Pending' as any,
        totalAmount: room.pricePerNight * stay,
      });
    }
  });

  return bookings;
}

function generateGuests(bookings: Booking[]): Guest[] {
  const guestMap = new Map<string, Guest>();
  bookings.forEach((b, i) => {
    if (!guestMap.has(b.guestName)) {
      guestMap.set(b.guestName, {
        id: `guest-${i + 1}`,
        name: b.guestName,
        email: b.guestEmail,
        phone: b.guestPhone,
        idType: pick(['Aadhaar', 'Passport', 'Driving License', 'Voter ID']),
        idNumber: `${pick(['XXXX', 'ABCD'])}${rand(1000, 9999)}`,
        totalStays: 0,
        totalSpent: 0,
        bookings: [],
      });
    }
    const g = guestMap.get(b.guestName)!;
    g.totalStays++;
    g.totalSpent += b.totalAmount;
    g.bookings.push(b.id);
  });
  return Array.from(guestMap.values());
}

function generateInvoices(bookings: Booking[], hasRestaurant: boolean, hasPool: boolean, taxPct: number): Invoice[] {
  return bookings.filter(b => b.status !== 'Cancelled').slice(0, 15).map((b, i) => {
    const items: InvoiceItem[] = [
      { description: 'Room Charges', quantity: rand(1, 7), rate: rand(1500, 10000), amount: b.totalAmount },
    ];
    if (hasRestaurant) items.push({ description: 'Restaurant Charges', quantity: 1, rate: rand(500, 3000), amount: rand(500, 3000) });
    if (hasPool) items.push({ description: 'Pool Access', quantity: rand(1, 3), rate: 500, amount: rand(500, 1500) });
    const total = items.reduce((s, it) => s + it.amount, 0);
    const tax = Math.round(total * taxPct / 100);
    return {
      id: `inv-${i + 1}`,
      bookingId: b.id,
      guestName: b.guestName,
      date: b.checkIn,
      dueDate: b.checkOut,
      status: b.paymentStatus,
      items,
      total,
      tax,
      grandTotal: total + tax,
    };
  });
}

function generateMenuItems(): MenuItem[] {
  const items: MenuItem[] = [];
  menuCategories.forEach(cat => {
    cat.items.forEach((name, i) => {
      items.push({ id: `menu-${cat.category}-${i}`, name, category: cat.category, price: rand(50, 800) });
    });
  });
  return items;
}

function generateOrders(menuItems: MenuItem[]): RestaurantOrder[] {
  const orders: RestaurantOrder[] = [];
  for (let i = 0; i < 12; i++) {
    const itemCount = rand(1, 4);
    const orderItems = Array.from({ length: itemCount }, () => ({
      menuItem: pick(menuItems),
      quantity: rand(1, 3),
    }));
    orders.push({
      id: `ord-${i + 1}`,
      tableNumber: rand(1, 20),
      items: orderItems,
      status: pick(orderStatuses),
      total: orderItems.reduce((s, it) => s + it.menuItem.price * it.quantity, 0),
      timestamp: new Date(Date.now() - rand(0, 86400000 * 3)).toISOString(),
    });
  }
  return orders;
}

function generateExpenses(count: number): Expense[] {
  const categories = [
    { cat: 'Electricity', desc: 'Monthly electricity bill payment' },
    { cat: 'Water', desc: 'Water supply and processing charges' },
    { cat: 'Staff Salary', desc: 'Property staff and security wages' },
    { cat: 'Maintenance', desc: 'General hardware and room repairs' },
    { cat: 'Cleaning Supplies', desc: 'Detergents, sanitizers and toiletries' },
    { cat: 'Food & Beverage', desc: 'Raw materials and kitchen inventory' },
    { cat: 'Marketing', desc: 'Local advertising and brochure printing' },
    { cat: 'Laundry', desc: 'Linen and uniform professional cleaning' }
  ];

  const expenses: Expense[] = [];
  for (let i = 0; i < count; i++) {
    const item = pick(categories);
    expenses.push({
      id: `exp-${i + 1}`,
      category: item.cat,
      amount: rand(1000, 5000),
      description: item.desc,
      date: dateStr(rand(-15, 0)), // More recent expenses
    });
  }
  return expenses;
}

const realPropertiesData = [
  { name: 'Haritha Valley Resort', location: 'Araku Valley, Alluri Sitharama Raju, Andhra Pradesh', hasRestaurant: true, hasPool: true, hasPlayzone: true },
  { name: 'Mayuri Hill Resort', location: 'Araku Valley, Alluri Sitharama Raju, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Ananthagiri Resort', location: 'Ananthagiri, Alluri Sitharama Raju, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Jungle Bells', location: 'Tyda, Alluri Sitharama Raju, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Coconut Country Resort', location: 'Dindi, Konaseema, Andhra Pradesh', hasRestaurant: true, hasPool: true, hasPlayzone: true },
  { name: 'Suryalanka Beach Resort', location: 'Bapatla, Bapatla, Andhra Pradesh', hasRestaurant: true, hasPool: true, hasPlayzone: true },
  { name: 'Horsley Hills Resort', location: 'Horsley Hills, Annamayya, Andhra Pradesh', hasRestaurant: true, hasPool: true, hasPlayzone: true },
  { name: 'Bhavani Island Resort', location: 'Vijayawada, NTR, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Berm Park Hotel', location: 'Vijayawada, NTR, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Yatrinivas', location: 'Visakhapatnam, Visakhapatnam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Rushikonda Beach Resort', location: 'Visakhapatnam, Visakhapatnam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Gandikota Resort', location: 'Gandikota, Kadapa, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Orvakal Rock Garden', location: 'Kurnool, Kurnool, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Vijay Vihar', location: 'Nagarjuna Sagar, Palnadu, Andhra Pradesh', hasRestaurant: true, hasPool: true, hasPlayzone: true },
  { name: 'Ettipotala Resort', location: 'Macherla, Palnadu, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Mypadu Beach Resort', location: 'Nellore, Nellore, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Kailasakona Resort', location: 'Chittoor, Chittoor, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Lambasingi Resort', location: 'Lambasingi, Alluri Sitharama Raju, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Srisailam Haritha', location: 'Srisailam, Nandyal, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Ahobilam Haritha', location: 'Ahobilam, Nandyal, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Lepakshi Haritha', location: 'Lepakshi, Sri Sathya Sai, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Mahanandi Haritha', location: 'Mahanandi, Nandyal, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Dwaraka Tirumala Haritha', location: 'West Godavari, Eluru, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Srikalahasti Haritha', location: 'Chittoor, Tirupati, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Tirupati Haritha', location: 'Tirupati, Tirupati, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Kurnool Haritha (City)', location: 'Kurnool, Kurnool, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Kadapa Haritha', location: 'Kadapa, Kadapa, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Nellore Haritha (City)', location: 'Nellore, Nellore, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Kalingapatnam Beach', location: 'Srikakulam, Srikakulam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Baruva Beach Resort', location: 'Srikakulam, Srikakulam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Arasavalli Haritha', location: 'Srikakulam, Srikakulam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Srimukhalingam Haritha', location: 'Srikakulam, Srikakulam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Vizianagaram Haritha', location: 'Vizianagaram, Vizianagaram, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'RK Beach Hotel', location: 'Visakhapatnam, Visakhapatnam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Simhachalam Haritha', location: 'Visakhapatnam, Visakhapatnam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Hope Island Gateway', location: 'Kakinada, Kakinada, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Pithapuram Haritha', location: 'East Godavari, Kakinada, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Antarvedi Resort', location: 'East Godavari, Konaseema, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Rajahmundry Haritha', location: 'Rajahmundry, East Godavari, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Palakollu Haritha', location: 'West Godavari, West Godavari, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Eluru Haritha', location: 'West Godavari, Eluru, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Machilipatnam Haritha', location: 'Krishna, Krishna, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Amaravati Haritha', location: 'Amaravati, Guntur, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Mangalagiri Haritha', location: 'Guntur, Guntur, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Kotappakonda Resort', location: 'Guntur, Palnadu, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Vodarevu Beach Resort', location: 'Chirala, Bapatla, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Ongole Haritha', location: 'Ongole, Prakasam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Singarayakonda Haritha', location: 'Prakasam, Prakasam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Kanigiri Haritha', location: 'Prakasam, Prakasam, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Penchalakona Haritha', location: 'Nellore, Nellore, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Venkatagiri Haritha', location: 'Nellore, Tirupati, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Somasila Resort', location: 'Nellore, Nellore, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Tirumala (Way-side)', location: 'Tirupati Foothills, Tirupati, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Chandragiri Haritha', location: 'Chittoor, Tirupati, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Kanipakam Haritha', location: 'Chittoor, Chittoor, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Kuppam Haritha', location: 'Chittoor, Chittoor, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Madanapalle Haritha', location: 'Chittoor, Annamayya, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Vontimitta Haritha', location: 'Kadapa, Kadapa, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Idupulapaya Haritha', location: 'Kadapa, Kadapa, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Gandi Kshetram', location: 'Kadapa, Kadapa, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Adoni Haritha', location: 'Kurnool, Kurnool, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Mantralayam Haritha', location: 'Kurnool, Kurnool, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Yaganti Haritha', location: 'Kurnool, Nandyal, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Alampur Haritha', location: 'Jogulamba Border, Jogulamba Gadwal, Telangana', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Belum Caves Resort', location: 'Kurnool, Nandyal, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: true },
  { name: 'Dharmavaram Haritha', location: 'Anantapur, Sri Sathya Sai, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
  { name: 'Anantapur Haritha (City)', location: 'Anantapur, Anantapur, Andhra Pradesh', hasRestaurant: true, hasPool: false, hasPlayzone: false },
];

export const properties: Property[] = realPropertiesData.map((data, i) => {
  const isMainResort = (i === 0 || i === 1); // Haritha Valley (0) and Mayuri Hill (1)
  const totalRooms = isMainResort ? rand(30, 45) : rand(10, 20); // Reduced room counts to save space
  const taxPct = pick([5, 12]);
  const rooms = generateRooms(totalRooms);
  const bookings = generateIntelligentBookings(rooms, isMainResort);
  const menuItems = (isMainResort && data.hasRestaurant) ? generateMenuItems() : [];

  return {
    id: `prop-${i + 1}`,
    name: data.name,
    location: data.location,
    hasRestaurant: data.hasRestaurant,
    hasPool: data.hasPool,
    hasPlayzone: data.hasPlayzone,
    totalRooms,
    taxPercentage: taxPct,
    rooms,
    bookings,
    guests: isMainResort ? generateGuests(bookings) : [],
    invoices: isMainResort ? generateInvoices(bookings, data.hasRestaurant, data.hasPool, taxPct) : [],
    expenses: isMainResort ? generateExpenses(rand(20, 30)) : [],
    orders: (isMainResort && data.hasRestaurant) ? generateOrders(menuItems) : [],
    menuItems,
  };
});

// ===== AGGREGATE STATS =====
export function getGlobalStats() {
  const today = new Date().toISOString().split('T')[0];
  const toDateOnly = (value: string) => (value || '').split('T')[0];
  let totalRooms = 0, totalBookings = 0, todayCheckIns = 0, todayCheckOuts = 0, totalRevenue = 0, totalExpenses = 0, occupiedRooms = 0;
  properties.forEach(p => {
    totalRooms += p.totalRooms;
    totalBookings += p.bookings.length;
    occupiedRooms += p.rooms.filter(r => r.status === 'Occupied').length;
    p.bookings.forEach(b => {
      if (!['Cancelled', 'Maintenance', 'Blocked'].includes(b.status) && toDateOnly(b.checkIn) === today) todayCheckIns++;
      if (!['Cancelled', 'Maintenance', 'Blocked'].includes(b.status) && toDateOnly(b.checkOut) === today) todayCheckOuts++;
      if (!['Cancelled', 'Maintenance', 'Blocked'].includes(b.status)) totalRevenue += b.totalAmount;
    });
    (p.expenses || []).forEach(e => {
      totalExpenses += e.amount;
    });
  });
  return {
    totalProperties: properties.length,
    totalRooms,
    todayCheckIns,
    todayCheckOuts,
    totalBookings,
    occupancyPercentage: Math.round((occupiedRooms / totalRooms) * 100),
    totalRevenue,
    totalExpenses,
  };
}

export function getPropertyStats(property: Property, fStart?: string, fEnd?: string) {
  const today = new Date().toISOString().split('T')[0];
  const toDateOnly = (value: string) => (value || '').split('T')[0];
  const inDateRange = (value: string, start: string, end: string) => {
    const d = toDateOnly(value);
    return d >= start && d <= end;
  };

  // If NO date range is provided, show the "Entire Data" (Current real-time status of rooms)
  if (!fStart || fStart === '') {
    const bookCount = property.rooms.filter(r => r.status === 'Occupied' || r.status === 'Cleaning').length;
    const maintCount = property.rooms.filter(r => r.status === 'Maintenance').length;
    const blockCount = property.rooms.filter(r => r.status === 'Blocked').length;
    const available = property.rooms.filter(r => r.status === 'Available').length;
    const occupied = property.rooms.length - available;

    // Financials for "Entire Data" mode are typically all-time
    const revenue = property.bookings.reduce((s, b) => {
      if (!['Cancelled', 'Maintenance', 'Blocked'].includes(b.status)) {
        return s + (b.paidAmount || (b.paymentStatus === 'Paid' ? b.totalAmount : 0));
      }
      return s;
    }, 0);
    const expenses = (property.expenses || []).reduce((s, e) => s + e.amount, 0);

    return {
      occupied,
      available,
      todayBookings: property.bookings.filter(b => !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status)).length,
      todayCheckIns: property.bookings.filter(b => !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status) && toDateOnly(b.checkIn) === today).length,
      todayCheckOuts: property.bookings.filter(b => !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status) && toDateOnly(b.checkOut) === today).length,
      revenue,
      expenses,
      totalRooms: property.totalRooms || property.rooms.length,
      bookCount,
      maintCount,
      blockCount
    };
  }

  // Otherwise, calculate stats for the specific filtered date range
  const start = fStart;
  const end = fEnd || fStart;

  const bookCount = property.rooms.filter(r => {
    return property.bookings.some(b =>
      b.roomId === r.id &&
      !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status) &&
      (b.checkIn <= end && b.checkOut >= start)
    );
  }).length;

  const maintCount = property.rooms.filter(r => {
    return property.bookings.some(b =>
      b.roomId === r.id &&
      b.status === 'Maintenance' &&
      (b.checkIn <= end && b.checkOut >= start)
    );
  }).length;

  const blockCount = property.rooms.filter(r => {
    return property.bookings.some(b =>
      b.roomId === r.id &&
      b.status === 'Blocked' &&
      (b.checkIn <= end && b.checkOut >= start)
    );
  }).length;

  const occupied = bookCount + maintCount + blockCount;
  const available = Math.max(0, (property.totalRooms || property.rooms.length) - occupied);

  const todayBookings = property.bookings.filter(b => inDateRange((b.bookingDate || b.checkIn), start, end) && b.status !== 'Cancelled').length;
  const todayCheckIns = property.bookings.filter(b => !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status) && inDateRange(b.checkIn, start, end)).length;
  const todayCheckOuts = property.bookings.filter(b => !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status) && inDateRange(b.checkOut, start, end)).length;

  const revenue = property.bookings.reduce((s, b) => {
    const date = b.bookingDate || b.checkIn;
    if (inDateRange(date, start, end) && !['Cancelled', 'Maintenance', 'Blocked'].includes(b.status)) {
      const amount = b.paidAmount || (b.paymentStatus === 'Paid' ? b.totalAmount : 0);
      return s + amount;
    }
    return s;
  }, 0);

  const expenses = (property.expenses || []).filter(e => inDateRange(e.date, start, end)).reduce((s, e) => s + e.amount, 0);

  return { occupied, available, todayBookings, todayCheckIns, todayCheckOuts, revenue, expenses, totalRooms: property.totalRooms || property.rooms.length, bookCount, maintCount, blockCount };
}
