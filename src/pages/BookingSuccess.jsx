import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Car, Navigation } from 'lucide-react';

export default function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const bookingData = location.state;

  useEffect(() => {
    // If no state is passed, redirect to home
    if (!bookingData) {
      navigate('/');
    } else {
      setTimeout(() => setShow(true), 100);
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex items-center justify-center">
      <div className="max-w-xl w-full px-4 sm:px-6">
        
        <div className={`transition-all duration-700 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-500/20 mb-6 border border-amber-500/30">
              <Clock size={48} className="text-amber-400 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Request Sent to Manager!
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Your service request is currently <span className="text-amber-300 font-semibold">on hold</span> awaiting manager slot confirmation. You will receive an immediate update or timing proposal.
            </p>
          </div>

          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Clock size={100} />
            </div>
            
            <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-6 relative z-10">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Booking ID</p>
                <p className="text-xl font-mono text-white font-bold">{bookingData.bookingId}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                <span className="inline-block bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-500/30 animate-pulse">
                  ⏳ Pending Approval
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Car size={14} /> Vehicle</p>
                <p className="text-white font-medium">{bookingData.brand} {bookingData.model}</p>
                <p className="text-xs text-gray-400">{bookingData.plateNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><CheckCircle size={14} /> Service</p>
                <p className="text-white font-medium">{bookingData.service?.name}</p>
                <p className="text-xs text-gray-400">Est: {bookingData.service?.estimatedTime}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Calendar size={14} /> Date</p>
                <p className="text-white font-medium">{bookingData.date}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-1"><Clock size={14} /> Time</p>
                <p className="text-white font-medium">{bookingData.time}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to={`/booking/${bookingData.bookingId}`}
              className="flex-1 flex justify-center items-center gap-2 text-[#050505] font-bold py-4 px-6 rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] text-center"
              style={{ background: 'linear-gradient(135deg, #d4af37, #b7791f)' }}
            >
              Track Booking <Navigation size={18} />
            </Link>
            
            <Link 
              to="/my-garage"
              className="flex-1 flex justify-center items-center gap-2 bg-white/5 border border-white/10 text-white font-bold py-4 px-6 rounded-xl hover:bg-white/10 transition-all text-center"
            >
              Go to My Garage
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
