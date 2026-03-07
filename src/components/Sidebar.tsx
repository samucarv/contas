import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['admin'] },
    { label: 'Gerenciar Usuários', icon: 'group', path: '/users', roles: ['admin'] },
    { label: 'Relatórios', icon: 'analytics', path: '/reports', roles: ['admin', 'user'] },
    { label: 'Configurações', icon: 'settings', path: '/settings', roles: ['admin', 'user'] },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const location = useLocation();
    const { user, signOut, role } = useAuth();

    const filteredItems = navItems.filter(item => item.roles.includes(role || 'user'));

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 
        border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 px-6 py-8">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-2xl font-bold">account_balance_wallet</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Finanças</h1>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {filteredItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                    ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'}
                  `}
                                >
                                    <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-white' : ''}`}>
                                        {item.icon}
                                    </span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section / Logout */}
                    <div className="p-4 mt-auto">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                            <div className="size-10 rounded-full overflow-hidden border-2 border-primary/20">
                                <img
                                    className="w-full h-full object-cover"
                                    alt="User profile"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeTDJvv8e1uPt1Kul9xsZeyYwF4xYhSFKp0C5SOE83UngKI00bTU5-ZowdUM3zGRbHbJ_ZhZRLHa1_a1q6UzahHoSPvkUopyggyHxBYltTAYXrynQTh9c1-vpaAx9JrofJ1tqESBinJ7uSpR4bTWuGyDchB2ZgUTTJ7qSDTekRrVD1-CaMRp9-VZ9N48sNxrdIvq5kBuqTsNRwjsT9m-iEHeZ3ZVS37-6n1XqtSNXIcPrRTLF-MtmLcMcwR8Rr_YtHa2m0qXNxj14A"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Usuário</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={signOut}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                                title="Sair"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
