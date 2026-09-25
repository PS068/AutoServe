// AutoServe Data & Schema Definitions

// 1. Collections: users (Default fresh setup: Administrator only)
export const users = [
  {
    uid: 'admin-1',
    name: 'AutoServe Administrator',
    email: 'admin@autoserve.com',
    role: 'admin',
    phone: '+91 9876500000',
    createdAt: new Date().toISOString(),
  }
];

// 2. Collections: bookings (Fresh empty database)
export const bookings = [];

// 3. Manager Promotional Offers & Dynamic Pricing Registry
export const initialOffers = [
  {
    id: 'off-1',
    code: 'MONSOON2026',
    title: 'Monsoon Splash & Brake Shield',
    discountType: 'percentage',
    discountValue: 20,
    isSeasonal: true,
    seasonName: 'Monsoon Care',
    validUntil: '2026-09-30',
    description: 'Special 20% seasonal monsoon discount on wiper blades, brake skim, underbody rust coating.',
    applicableService: 'All Services',
    active: true,
    createdAt: '2026-05-01'
  },
  {
    id: 'off-2',
    code: 'FESTIVE25',
    title: 'Diwali & Festive Sparkle',
    discountType: 'percentage',
    discountValue: 25,
    isSeasonal: true,
    seasonName: 'Festive Season',
    validUntil: '2026-11-30',
    description: 'Festive celebration 25% discount on full multi-point vehicle service and interior detailing.',
    applicableService: 'Full Service',
    active: true,
    createdAt: '2026-05-01'
  },
  {
    id: 'off-3',
    code: 'SUMMERAC',
    title: 'Summer AC Chill Surge',
    discountType: 'flat',
    discountValue: 500,
    isSeasonal: true,
    seasonName: 'Summer Season',
    validUntil: '2026-06-30',
    description: 'Flat ₹500 seasonal waiver on air conditioning compressor gas refill and cabin sanitizer.',
    applicableService: 'AC Service',
    active: true,
    createdAt: '2026-05-10'
  },
  {
    id: 'off-4',
    code: 'FREEOILCHECK',
    title: 'Complimentary Fluid Diagnostics',
    discountType: 'flat',
    discountValue: 300,
    isSeasonal: false,
    seasonName: 'General Promo',
    validUntil: '2026-12-31',
    description: 'Flat ₹300 waiver on synthetic oil and fluid diagnostic charges.',
    applicableService: 'Oil Change',
    active: true,
    createdAt: '2026-05-05'
  }
];

// 4. Collections: bookingChats (Fresh empty)
export const bookingChats = [];

// 5. Collections: bookingStatusLogs (Fresh empty)
export const bookingStatusLogs = [];

// ─── HELPERS & SERVICES ─────────────────────────────────────────

export const vehicleTypes = ['Car', 'Bike', 'SUV'];
export const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
];

export const STATUS_FLOW = [
  'Pending Approval',
  'Booked',
  'Received',
  'Inspecting',
  'Servicing',
  'Washing',
  'Ready',
  'Delivered',
  'Reschedule Proposed',
  'Failed / Expired'
];


export const services = [
  {
    id: 's0',
    name: 'Minor Service',
    description: 'Essential 25-point health inspection, vital fluids top-up, battery terminal cleaning, tire pressure adjustment, and safety check.',
    badge: 'Express Maintenance',
    estimatedTime: '30 - 45 Mins',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's1',
    name: 'Full Service',
    description: 'Comprehensive 40-point check, oil change, filter replacement, fluid top-up, and full exterior wash.',
    badge: 'Popular',
    estimatedTime: '3 - 4 Hours',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's2',
    name: 'Oil Change',
    description: 'Premium synthetic engine oil flush, replacement, and OEM certified oil filter replacement.',
    badge: 'Quick Service',
    estimatedTime: '45 Mins',
    image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's3',
    name: 'AC Service',
    description: 'Gas refill, evaporator coil cleaning, cabin filter renewal, and vent sanitization for peak cooling.',
    badge: 'Seasonal',
    estimatedTime: '1.5 Hours',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's4',
    name: 'Brake Repair',
    description: 'Brake pad replacement, disc skimming, caliper inspection, and DOT4 fluid line flush.',
    badge: 'Safety',
    estimatedTime: '2 Hours',
    image: 'https://images.unsplash.com/photo-1600790142055-619df03207e6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's5',
    name: 'Denting & Painting',
    description: 'Precision computerized color matching, scratch restoration, and dent removal with original OEM finish.',
    badge: 'Bodywork',
    estimatedTime: '1 - 2 Days',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 's6',
    name: 'Wheel Alignment',
    description: '3D laser-guided wheel alignment, computerized tire balancing, and suspension geometry tuning.',
    badge: 'Precision',
    estimatedTime: '1 Hour',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=800&q=80'
  }
];
