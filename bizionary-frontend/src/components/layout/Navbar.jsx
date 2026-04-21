import React, { useState } from 'react';
import { Search, Settings, User, LogOut, FileText, AlertTriangle, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <header className="h-24 bg-surface dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 z-20 sticky top-0 transition-colors duration-300">
            {/* Mobile Sidebar Toggle */}
            <div className="flex justify-center items-center md:hidden mr-4">
                <button 
                    onClick={onToggleSidebar}
                    className="p-2 text-textMuted dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Search Bar - Left Side */}
            <div className="flex-1 max-w-xl">
                <div className="relative flex items-center w-full h-11 rounded-xl bg-background dark:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary border border-transparent dark:border-slate-700 transition-all overflow-hidden shadow-sm">
                    <div className="grid place-items-center h-full w-12 text-gray-400">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        className="peer h-full w-full outline-none text-sm text-textMain dark:text-gray-100 bg-transparent pr-2 placeholder-gray-400 dark:placeholder-gray-500"
                        type="text"
                        id="search"
                        placeholder="Search transactions, customers, stock..."
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4 pl-4 md:pl-6 relative">
                {/* Settings */}
                <div className="flex items-center space-x-3 relative">
                    <button 
                        onClick={() => navigate('/settings')}
                        className="p-2.5 text-textMuted dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-sky-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-background dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm"
                    >
                        <Settings className="h-5 w-5" />
                    </button>
                    <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-2"></div>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3 group cursor-pointer relative">
                    <div className="hidden md:flex flex-col items-end text-sm">
                        <p className="font-bold text-textMain dark:text-white leading-snug">{user?.name || 'User'}</p>
                        <p className="text-xs text-textMuted dark:text-gray-400">{user?.email || 'Admin'}</p>
                    </div>

                    <div className="h-11 w-11 rounded-full bg-sky-100 dark:bg-primary/20 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-primary font-bold overflow-hidden relative transition-transform duration-300 group-hover:scale-105">
                        {/* Fallback to simple icon since we don't have an actual image asset */}
                        <User className="h-6 w-6 text-primary" />
                    </div>

                    <button
                        onClick={logout}
                        className="absolute -right-2 top-10 mt-2 p-2 text-white bg-danger rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-md invisible group-hover:visible hover:scale-105 active:scale-95 z-50"
                        title="Logout"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
