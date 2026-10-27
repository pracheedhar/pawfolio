import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bell, Calendar, X } from 'lucide-react';
import { api, mediaUrl } from '../lib/api';
import { useResource } from '../lib/useResource';
import DataState from './DataState';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout, notify } = useAppContext();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  useEffect(() => { const timer = setTimeout(() => setSearch(query), 300); return () => clearTimeout(timer); }, [query]);
  const results = useResource('/services?limit=8&search=' + encodeURIComponent(search));
  const [notifications, setNotifications] = useState([]);
  const [notificationError, setNotificationError] = useState('');
  useEffect(() => {
    let active = true;
    if (user) api('/notifications?limit=100').then(data => { if (active) setNotifications(data.items); }).catch(error => { if (active) setNotificationError(error.message); });
    return () => { active = false; };
  }, [user, location.pathname]);

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
                aria-label="Search services"
                value={query}
                onChange={event => setQuery(event.target.value)}
                className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-full leading-5 bg-[#B0C4DE]/40 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-[#B0C4DE] focus:ring-1 focus:ring-[#B0C4DE] sm:text-sm transition-colors"
              />
            </div>

            {query && <div className="absolute top-16 right-4 bg-white border rounded-xl shadow-xl p-4 w-80 z-50">
              <DataState loading={results.loading} error={results.error} empty={!results.data?.items.length} retry={results.reload} />
              {results.data?.items.map(service => <Link key={service.id} to={`/booking/${service.id}`} onClick={() => setQuery('')} className="block py-2 hover:text-[#6A92C5]">{service.name}</Link>)}
            </div>}
            {/* Notification */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell"
                aria-label="Notifications"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="text-gray-500 hover:text-black transition-colors p-1 relative"
              >
                <Bell className="h-5 w-5" />
                {user && notifications.some(n => !n.read) && <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>}
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
                    {!user && <Link to="/login" className="block p-4 text-sm">Log in to see notifications</Link>}
                    {user && <DataState error={notificationError} empty={!notifications.length} />}
                    {user && notifications.map((n) => (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className={`flex-shrink-0 rounded-full p-2 mt-0.5 bg-blue-50`}>
                          <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.desc}</p>
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 text-center">
                    <button onClick={async () => { try { await api('/notifications/read-all', { method: 'PATCH', body: {} }); setNotifications(items => items.map(n => ({ ...n, read: true }))); notify('Notifications marked as read'); } catch (error) { notify(error.message); } }} disabled={!user} className="text-xs text-[#7a9bbf] font-medium hover:text-black transition-colors">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {user && <button onClick={logout} className="text-sm text-gray-500">Log out</button>}
            {/* Profile */}
            <Link to={user ? "/profile" : "/login"} className="flex items-center">
              <img
                src={mediaUrl(user?.avatar) || '/favicon.svg'}
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
