import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-slate-400 mt-auto">
                <p className="text-sm">
                    &copy; {new Date().getFullYear()} CyberShield. An academic project tool. Not legally binding.
                </p>
            </footer>
        </div>
    );
};

export default Layout;
