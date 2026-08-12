import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-8 h-8 text-blue-500" />
                        <Link to="/" className="font-bold text-xl tracking-wide text-gray-100">CyberShield</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition">Dashboard</Link>
                                <Link to="/complaints" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition">Complaints</Link>
                                <Link to="/profile" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-slate-800 hover:bg-slate-700 transition">
                                    <User className="w-4 h-4" />
                                    <span>{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-1 px-4 py-2 bg-red-500/10 text-red-500 rounded-md text-sm font-medium hover:bg-red-500/20 transition"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition">Login</Link>
                                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow shadow-blue-500/30 transition">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
