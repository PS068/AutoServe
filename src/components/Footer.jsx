import { Link } from 'react-router-dom';
import GearLogo from './GearLogo';

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-white border-t border-white/5 relative z-10" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <GearLogo size={34} />
              <span className="text-xl font-bold tracking-tight text-white">
                Auto<span className="text-accent font-light">Serve</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Premium vehicle care and dealership-quality servicing. Book instantly and track every step.
            </p>
          </div>

          {/* Garage */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Garage</h4>
            <ul className="space-y-3">
              {['Services', 'How it Works', 'Pricing', 'Reviews'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Account</h4>
            <ul className="space-y-3">
              {['My Garage', 'Track Service', 'Login', 'Help Center'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">Legal</h4>
            <ul className="space-y-3">
              {['Contact Us', 'Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2026 PS. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-accent text-sm transition-colors">Instagram</a>
            <a href="#" className="text-gray-500 hover:text-accent text-sm transition-colors">Twitter</a>
            <a href="#" className="text-gray-500 hover:text-accent text-sm transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
