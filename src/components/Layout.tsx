
import React, { useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header / Top Bar */}
                <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div className="flex items-center gap-2 text-primary">
                            <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                            <span className="font-bold text-slate-900 dark:text-white">Finanças</span>
                        </div>
                    </div>

                    <div className="size-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeTDJvv8e1uPt1Kul9xsZeyYwF4xYhSFKp0C5SOE83UngKI00bTU5-ZowdUM3zGRbHbJ_ZhZRLHa1_a1q6UzahHoSPvkUopyggyHxBYltTAYXrynQTh9c1-vpaAx9JrofJ1tqESBinJ7uSpR4bTWuGyDchB2ZgUTTJ7qSDTekRrVD1-CaMRp9-VZ9N48sNxrdIvq5kBuqTsNRwjsT9m-iEHeZ3ZVS37-6n1XqtSNXIcPrRTLF-MtmLcMcwR8Rr_YtHa2m0qXNxj14A"
                            alt="User"
                        />
                    </div>
                </header>

                {/* Dynamic Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
