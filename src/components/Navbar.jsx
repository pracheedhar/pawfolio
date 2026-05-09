import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const { user } = useAppContext();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/discover', label: 'Discover' },
    { path: '/about', label: 'About' },
  ];

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
                className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-full leading-5 bg-[#B0C4DE]/40 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#B0C4DE] focus:ring-1 focus:ring-[#B0C4DE] sm:text-sm transition-colors"
              />
            </div>

            {/* Notification */}
            <button className="text-gray-500 hover:text-black transition-colors p-1 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-red-500 rounded-full"></span>
            </button>

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
