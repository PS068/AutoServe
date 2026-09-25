import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar, Clock, Car, Settings, Check, MapPin, ShieldCheck, Tag, Sparkles, FileText, AlertTriangle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { db, rtdb } from '../firebase';
import { services, timeSlots, vehicleTypes, initialOffers } from '../data/dummyData';
import BookingStepper from '../components/BookingStepper';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastNotification';

const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23141414'/%3E%3Cstop offset='100%25' stop-color='%23080808'/%3E%3C/linearGradient%3E%3ClinearGradient id='gold' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23d4af37'/%3E%3Cstop offset='100%25' stop-color='%23b7791f'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Ccircle cx='400' cy='200' r='60' fill='%23222' stroke='url(%23gold)' stroke-width='2' opacity='0.6'/%3E%3Cpath d='M380 180 L420 220 M420 180 L380 220' stroke='url(%23gold)' stroke-width='4' stroke-linecap='round'/%3E%3Ctext x='400' y='300' font-family='sans-serif' font-size='22' font-weight='800' fill='%23d4af37' text-anchor='middle' letter-spacing='2'%3EAUTOSERVE%3C/text%3E%3Ctext x='400' y='330' font-family='sans-serif' font-size='13' fill='%23888' text-anchor='middle'%3EPREMIUM AUTOMOTIVE SERVICE%3C/text%3E%3C/svg%3E";

export default function BookService() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [pickupServiceAvailable, setPickupServiceAvailable] = useState(() => {
    try {
      const saved = localStorage.getItem('autoserve_pickup_available');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [pickupUnavailableReason, setPickupUnavailableReason] = useState(() => {
    try {
      return localStorage.getItem('autoserve_pickup_reason') || 'Doorstep valet pickup is temporarily paused due to heavy bay traffic & rain conditions. Workshop Drive-In appointments only.';
    } catch {
      return 'Doorstep valet pickup is temporarily paused due to heavy bay traffic & rain conditions. Workshop Drive-In appointments only.';
    }
  });

  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    vehicleType: 'Car',
    brand: '',
    model: '',
    plateNumber: '',
    fuelType: 'Petrol',
    serviceId: null,
    date: '',
    time: '',
    isUrgent: false,
    customRequirements: '',
    location: {
      city: 'Mumbai',
      address: '',
      pincode: '',
      pickupType: pickupServiceAvailable ? 'Doorstep Pickup & Drop' : 'Self Drive-In to Bay'
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'garageConfig'));
        if (configDoc.exists()) {
          const data = configDoc.data();
          if (typeof data.pickupServiceAvailable === 'boolean') {
            setPickupServiceAvailable(data.pickupServiceAvailable);
            localStorage.setItem('autoserve_pickup_available', JSON.stringify(data.pickupServiceAvailable));
            if (!data.pickupServiceAvailable) {
              setBookingData(prev => ({
                ...prev,
                location: { ...prev.location, pickupType: 'Self Drive-In to Bay' }
              }));
            }
          }
          if (data.pickupUnavailableReason) {
            setPickupUnavailableReason(data.pickupUnavailableReason);
            localStorage.setItem('autoserve_pickup_reason', data.pickupUnavailableReason);
          }
        }
      } catch (e) {
        console.warn('Config load note:', e);
      }
    }
    loadConfig();
  }, []);

  // Load manager offers
  const offers = (() => {
    try {
      const saved = localStorage.getItem('autoserve_manager_offers');
      return saved ? JSON.parse(saved) : initialOffers;
    } catch {
      return initialOffers;
    }
  })();

  const [defaultUrgentCharge] = useState(() => {
    try {
      const saved = localStorage.getItem('autoserve_default_urgent_surcharge');
      return saved ? Number(saved) : 500;
    } catch {
      return 500;
    }
  });

  const nextStep = () => {
    if (step === 1 && (!bookingData.vehicleType || !bookingData.brand || !bookingData.plateNumber)) {
      addToast('Please complete required vehicle details.', 'error');
      return;
    }
    if (step === 2 && !bookingData.serviceId) {
      addToast('Please choose a service package.', 'error');
      return;
    }
    if (step === 3 && (!bookingData.date || !bookingData.time)) {
      addToast('Please select your preferred service date and time.', 'error');
      return;
    }
    setStep(s => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleConfirm = async () => {
    const selectedService = services.find(s => s.id === bookingData.serviceId);
    
    const customerId = isAuthenticated && currentUser?.uid ? currentUser.uid : null;
    const customerName = isAuthenticated && currentUser?.name ? currentUser.name : 'Customer';
    const customerPhone = isAuthenticated && currentUser?.phone ? currentUser.phone : null;

    const payload = {
      customerId: customerId,
      customerName: customerName,
      customerPhone: customerPhone,
      vehicleType: bookingData.vehicleType,
      vehicleModel: bookingData.model ? `${bookingData.brand} ${bookingData.model}` : bookingData.brand,
      brand: bookingData.brand,
      model: bookingData.model || '',
      plateNumber: bookingData.plateNumber.toUpperCase(),
      fuelType: bookingData.fuelType,
      serviceId: bookingData.serviceId,
      serviceType: selectedService?.name || 'General Service',
      customRequirements: bookingData.customRequirements || '',
      quotationStatus: bookingData.customRequirements ? 'QUOTED_PENDING_APPROVAL' : 'STANDARD',
      extraWorkBill: 0,
      extraWorkDescription: '',
      customWorkConfirmedByCustomer: false,
      requestedDate: bookingData.date,
      requestedTime: bookingData.time,
      preferredDate: bookingData.date,
      preferredTime: bookingData.time,
      isUrgent: Boolean(bookingData.isUrgent),
      urgentSurcharge: bookingData.isUrgent ? defaultUrgentCharge : 0,
      location: bookingData.location,
      status: 'Pending Approval',
      requestStatus: 'PENDING_APPROVAL', // 'PENDING_APPROVAL' | 'CONFIRMED' | 'PROPOSAL_SENT' | 'EXPIRED' | 'REJECTED'
      managerProposal: null,
      proposalExpiresAt: null,
      finalBill: 0,
      mechanicNotes: 'Request sent to Garage Manager. Slot is on hold awaiting manager confirmation & workload review.',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };


    try {
      setIsSubmitting(true);
      const docRef = await addDoc(collection(db, 'bookings'), payload);

      try {
        await set(ref(rtdb, `bookings/${docRef.id}`), {
          bookingId: docRef.id,
          ...payload,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (rtdbError) {
        console.warn('Realtime Database mirror failed:', rtdbError);
      }

      addToast('Vehicle service successfully booked! Garage manager will review your appointment.', 'success');

      navigate('/booking-success', {
        state: {
          bookingId: docRef.id,
          ...bookingData,
          service: selectedService
        }
      });
    } catch (error) {
      console.error('Booking save failed:', error);
      addToast(`Unable to save booking: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = services.find(s => s.id === bookingData.serviceId);

  return (
    <div className="min-h-screen bg-[#050505] pt-24 pb-20 animate-fade-in text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-3">
            <ShieldCheck size={14} /> Official Verified Service Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Book Vehicle Service</h1>
          <p className="text-gray-400 text-sm">Schedule appointment with certified technicians.</p>
        </div>

        {/* Stepper */}
        <div className="mb-10">
          <BookingStepper currentStep={step} />
        </div>

        {/* Form Container */}
        <div className="glass-panel border border-white/10 rounded-3xl p-4 sm:p-6 md:p-10 shadow-2xl">
          
          {/* STEP 1: VEHICLE DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Car className="text-accent" size={22} /> Step 1: Vehicle Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Vehicle Category</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {vehicleTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBookingData({...bookingData, vehicleType: type})}
                        className={`py-2.5 px-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 text-center ${
                          bookingData.vehicleType === type 
                            ? 'border-accent bg-accent/10 text-accent shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                            : 'border-white/10 text-gray-400 hover:border-white/20 bg-white/5'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Fuel / Powertrain Type</label>
                  <select 
                    value={bookingData.fuelType}
                    onChange={(e) => setBookingData({...bookingData, fuelType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-all"
                  >
                    <option className="bg-[#111] text-white">Petrol</option>
                    <option className="bg-[#111] text-white">Diesel</option>
                    <option className="bg-[#111] text-white">Electric (EV)</option>
                    <option className="bg-[#111] text-white">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Brand / Manufacturer</label>
                  <input 
                    type="text" 
                    placeholder="e.g. BMW, Tesla, Tata" 
                    value={bookingData.brand}
                    onChange={(e) => setBookingData({...bookingData, brand: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-all placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Model <span className="text-gray-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 3 Series, Nexon, Creta (optional)" 
                    value={bookingData.model}
                    onChange={(e) => setBookingData({...bookingData, model: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-all placeholder-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Registration License Plate</label>
                  <input 
                    type="text" 
                    placeholder="e.g. MH 02 AB 1234" 
                    value={bookingData.plateNumber}
                    onChange={(e) => setBookingData({...bookingData, plateNumber: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-all font-mono uppercase placeholder-gray-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT SERVICE */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Settings className="text-accent" size={22} /> Step 2: Select Service Scope
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => (
                  <div 
                    key={service.id}
                    onClick={() => setBookingData({...bookingData, serviceId: service.id})}
                    className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      bookingData.serviceId === service.id 
                        ? 'border-accent shadow-[0_0_20px_rgba(212,175,55,0.25)] bg-accent/5' 
                        : 'border-white/10 hover:border-white/25 bg-white/5'
                    }`}
                  >
                    <div className="h-28 w-full overflow-hidden relative bg-[#111]">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
                      {bookingData.serviceId === service.id && (
                        <div className="absolute top-3 right-3 z-20 bg-accent text-[#050505] rounded-full p-1 shadow-md">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                      <img 
                        src={service.image || fallbackImage} 
                        alt={service.name} 
                        className="w-full h-28 object-cover relative z-0"
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                      />
                    </div>
                    <div className="p-4 relative z-20">
                      <h3 className="text-base font-bold text-white mb-1">{service.name}</h3>
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{service.description}</p>
                      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                        <span className="text-gray-400 flex items-center gap-1">
                          <Clock size={12} /> Est. {service.estimatedTime}
                        </span>
                        <span className="text-accent font-semibold text-[11px] bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                          Manager Quote on Inspection
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Extra Right: Explain What Specific Service / Issues Needed (In Written) */}
              <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <FileText size={16} className="text-accent" />
                    Explain Specific Service / Issues Needed <span className="text-accent lowercase font-normal">(In Written)</span>
                  </label>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-accent/15 text-accent font-bold border border-accent/20">
                    Custom Written Request
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Have special requests, engine vibrations, specific sounds, or extra part replacements? Describe them below. Our garage manager will inspect these written notes, prepare an itemized quote, and send it for your confirmation before starting work.
                </p>
                <textarea
                  rows={3}
                  value={bookingData.customRequirements}
                  onChange={(e) => setBookingData({ ...bookingData, customRequirements: e.target.value })}
                  placeholder="e.g. Strange clicking noise from front-left suspension during turns; also check AC airflow and wiper blade wear..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-xs placeholder-gray-500 outline-none focus:border-accent transition-all resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* STEP 3: PICK DATE, TIME & LOCATION */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="text-accent" size={22} /> Step 3: Schedule, Location & Priority
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Service Appointment Date</label>
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent transition-all"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Service Mode</label>
                    {!pickupServiceAvailable && (
                      <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        Pickup Temporarily Paused
                      </span>
                    )}
                  </div>

                  {!pickupServiceAvailable && (
                    <div className="mb-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 animate-fade-in shadow-inner">
                      <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block font-bold">Doorstep Pickup Service Currently Paused</strong>
                        <p className="text-[11px] text-amber-200/90 leading-relaxed mt-0.5">
                          {pickupUnavailableReason || 'Our doorstep valet fleet is temporarily unavailable. All appointments are currently accepted as Direct Workshop Drive-In only.'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {[
                      { id: 'Doorstep Pickup & Drop', label: 'Doorstep Pickup & Drop', disabled: !pickupServiceAvailable },
                      { id: 'Self Drive-In to Bay', label: 'Self Drive-In to Bay', disabled: false }
                    ].map(mode => {
                      const isSelected = bookingData.location.pickupType === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          disabled={mode.disabled}
                          onClick={() => {
                            if (mode.disabled) {
                              addToast('Doorstep Pickup is currently paused by garage management.', 'info');
                              return;
                            }
                            setBookingData({
                              ...bookingData, 
                              location: { ...bookingData.location, pickupType: mode.id }
                            });
                          }}
                          className={`flex-1 py-2.5 px-2 sm:px-3 rounded-xl border text-[11px] sm:text-xs font-semibold transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                            mode.disabled
                              ? 'opacity-40 border-white/5 bg-white/5 cursor-not-allowed text-gray-500'
                              : isSelected 
                              ? 'border-accent bg-accent/15 text-accent shadow-[0_0_10px_rgba(212,175,55,0.2)]' 
                              : 'border-white/10 text-gray-400 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <span>{mode.label}</span>
                          {mode.disabled && (
                            <span className="text-[9px] text-rose-400 font-bold uppercase">(Unavailable)</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Available Service Time Slots</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setBookingData({...bookingData, time})}
                      className={`py-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                        bookingData.time === time 
                          ? 'border-accent bg-accent/15 text-accent shadow-[0_0_12px_rgba(212,175,55,0.25)]' 
                          : 'border-white/10 text-gray-400 hover:border-white/30 bg-white/5'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Input Block */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <MapPin size={16} className="text-accent" /> Service & Pickup Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">City / Region</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai, Pune, Thane" 
                      value={bookingData.location.city}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        location: { ...bookingData.location, city: e.target.value }
                      })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-accent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">Address / Landmark / Area</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Apt 402, Sea Crest Towers, Bandra West" 
                      value={bookingData.location.address}
                      onChange={(e) => setBookingData({
                        ...bookingData,
                        location: { ...bookingData.location, address: e.target.value }
                      })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Urgent Express Service Block */}
              <div 
                onClick={() => setBookingData({...bookingData, isUrgent: !bookingData.isUrgent})}
                className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-start gap-3 sm:gap-4 ${
                  bookingData.isUrgent 
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:border-amber-400/40'
                }`}
              >
                <input 
                  type="checkbox" 
                  checked={bookingData.isUrgent}
                  onChange={() => {}} // Handled by container click
                  className="mt-1 w-5 h-5 rounded accent-amber-500 cursor-pointer shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs sm:text-sm font-extrabold text-white">
                      ⚡ Need Urgent Express Service? (+₹{defaultUrgentCharge} Bay Priority Charge)
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Express Bay
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Flags your vehicle for immediate priority diagnostics, front-of-the-queue bay allocation, and expedited turnaround with standard ₹{defaultUrgentCharge} surcharge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-accent" size={22} /> Step 4: Review Appointment Request
              </h2>
              
              <div className="glass-card border border-white/10 rounded-2xl overflow-hidden p-4 sm:p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base">AutoServe Certified Service Center</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-accent" /> Automotive Tech District • {bookingData.location.city || 'City Bay'}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent/20 border border-accent/40 rounded-xl flex items-center justify-center text-accent font-bold text-sm">
                    AS
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider mb-1">Vehicle</p>
                    <p className="text-white font-semibold text-sm">{bookingData.brand} {bookingData.model || ''}</p>
                    <p className="text-gray-400 font-mono mt-0.5">{bookingData.plateNumber} • {bookingData.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 uppercase tracking-wider mb-1">Service & Priority</p>
                    <p className="text-white font-semibold text-sm">{selectedService?.name}</p>
                    <p className="text-gray-400 mt-0.5">
                      {bookingData.isUrgent ? (
                        <span className="text-amber-400 font-bold">⚡ Urgent Express (+₹{defaultUrgentCharge} Surcharge)</span>
                      ) : (
                        'Standard Schedule'
                      )}
                    </p>
                  </div>
                  <div className="sm:col-span-2 md:col-span-1">
                    <p className="text-gray-500 uppercase tracking-wider mb-1">Scheduled Date & Time</p>
                    <p className="text-white font-semibold text-sm">{bookingData.date || '—'}</p>
                    <p className="text-gray-400 mt-0.5">{bookingData.time || '—'}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 text-xs">
                  <span className="text-gray-400 block mb-0.5 font-medium">Service Mode & Address:</span>
                  <span className="text-white font-semibold">{bookingData.location.pickupType}</span>
                  {bookingData.location.address && (
                    <span className="text-gray-400 block mt-0.5">{bookingData.location.address}, {bookingData.location.city}</span>
                  )}
                </div>

                {/* Customer Contact & Phone Confirmation Details */}
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-gray-400 block text-[11px]">Booking Customer Contact:</span>
                    <span className="text-white font-bold">{currentUser?.name || 'Customer'} • <span className="font-mono text-emerald-300">{currentUser?.phone || '+91 9876543210'}</span></span>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full w-fit">
                    <ShieldCheck size={13} /> Phone Confirmed
                  </span>
                </div>

                {/* Customer Written Special Instructions */}
                {bookingData.customRequirements && (
                  <div className="p-3.5 bg-accent/10 border border-accent/25 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-accent font-bold flex items-center gap-1.5">
                        <FileText size={13} /> Your Written Custom Service Notes:
                      </span>
                      <span className="text-[10px] text-accent/80 font-mono">Manager Review & Quote</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed italic">
                      "{bookingData.customRequirements}"
                    </p>
                  </div>
                )}

                <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-xs space-y-1 text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <Sparkles size={14} className="text-accent" /> Manager Transparent Pricing & Seasonal Offers:
                  </div>
                  <p className="leading-relaxed">
                    Once your vehicle arrives at the bay, our certified garage manager conducts physical diagnostics, applies applicable seasonal promo discounts/offers, and sends an itemized digital breakdown directly for your live review.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            {step > 1 ? (
              <button 
                type="button"
                onClick={prevStep}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors py-2 px-4 rounded-xl hover:bg-white/5"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button 
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && (!bookingData.brand || !bookingData.plateNumber)) ||
                  (step === 2 && !bookingData.serviceId) ||
                  (step === 3 && (!bookingData.date || !bookingData.time))
                }
                className="flex items-center gap-2 bg-white text-[#050505] text-xs font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex items-center gap-2 text-[#050505] text-xs font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #d4af37, #b7791f)' }}
              >
                {isSubmitting ? 'Registering Booking...' : 'Confirm & Request Service'} <CheckCircle2 size={16} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
