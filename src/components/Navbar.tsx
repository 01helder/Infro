import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Library, LayoutDashboard, User, Search, Share2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Market', path: '/' },
    { icon: Library, label: 'Library', path: '/library', auth: true },
    { icon: Share2, label: 'Affiliate', path: '/affiliate', auth: true },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', auth: true, role: 'creator' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Top Navbar */}
      <nav className="hidden md:flex sticky top-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-4xl mx-auto w-full px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600">InfoMarket</Link>
          
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              (!item.auth || user) && (!item.role || user?.role === item.role) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors",
                    isActive(item.path) ? "text-indigo-600" : "text-gray-500 hover:text-indigo-600"
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              )
            ))}
            
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                  <p className="text-[10px] text-gray-500">${user.balance.toFixed(2)}</p>
                </div>
                <button onClick={logout} className="text-gray-500 hover:text-red-600">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 h-16 flex items-center justify-between">
        {navItems.map((item) => (
          (!item.auth || user) && (!item.role || user?.role === item.role) && (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive(item.path) ? "text-indigo-600" : "text-gray-400"
              )}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        ))}
        
        {user ? (
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 text-gray-400"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive('/login') ? "text-indigo-600" : "text-gray-400"
            )}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Login</span>
          </Link>
        )}
      </nav>
    </>
  );
};

export default Navbar;
