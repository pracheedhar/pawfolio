import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Calendar, Scissors, Stethoscope, Dumbbell, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const notifications = [
  {
    id: 1,
    icon: <Stethoscope className="h-4 w-4 text-blue-500" />,
    title: 'Vet Appointment',
    desc: 'Dr. Smith scheduled for Max — Tomorrow 10:00 AM',
    time: '2h ago',
    color: 'bg-blue-50',
  },
  {
    id: 2,
    icon: <Scissors className="h-4 w-4 text-pink-500" />,
    title: 'Grooming Session',
    desc: 'Bella\'s grooming confirmed at PawSpa — Fri 2:00 PM',
    time: '5h ago',
    color: 'bg-pink-50',
  },
  {
    id: 3,
    icon: <Calendar className="h-4 w-4 text-green-500" />,
    title: 'Vet Follow-up',
    desc: 'Vaccination booster due for Max next week',
    time: '1d ago',
    color: 'bg-green-50',
  },
  {
    id: 4,
    icon: <Dumbbell className="h-4 w-4 text-orange-500" />,
    title: 'Training Class',
    desc: 'Agility training with Coach Alex — Sat 9:00 AM',
    time: '1d ago',
    color: 'bg-orange-50',
  },
  {
    id: 5,
    icon: <Stethoscope className="h-4 w-4 text-purple-500" />,
    title: 'Medic Reminder',
    desc: 'Flea & tick medicine due for Bella this Sunday',
    time: '2d ago',
    color: 'bg-purple-50',
  },
];

const Navbar = () => {
  const { user } = useAppContext();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/discover', label: 'Discover' },
    { path: '/about', label: 'About' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-1">
            <span className="font-bold text-2xl tracking-tight text-black">Pawfolio</span>
            <span className="text-2xl">🐾</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-full font-medium transition-colors ${
                    isActive
                      ? 'bg-[#B0C4DE] text-black shadow-sm'
                      : 'text-gray-700 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-full leading-5 bg-[#B0C4DE]/40 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#B0C4DE] focus:ring-1 focus:ring-[#B0C4DE] sm:text-sm transition-colors"
              />
            </div>

            {/* Notification */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="text-gray-500 hover:text-black transition-colors p-1 relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              </button>

              {/* Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Notification Items */}
                  <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className={`flex-shrink-0 rounded-full p-2 mt-0.5 ${n.color}`}>
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{n.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 text-center">
                    <button className="text-xs text-[#7a9bbf] font-medium hover:text-black transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <Link to="/profile" className="flex items-center">
              <img
                src={user?.avatar || 'https://i.pravatar.cc/150?img=11'}
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover border border-gray-200"
              />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
