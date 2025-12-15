import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { to: '/', label: 'Campionati', icon: Home },
        { to: '/live', label: 'Live', icon: Trophy },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen text-gray-800 flex flex-col relative overflow-x-hidden">
            {/* Background Orbs */}
            <div className="orb-primary w-96 h-96 -top-48 -left-48" />
            <div className="orb-secondary w-80 h-80 top-1/2 -right-40" style={{ animationDelay: '-4s' }} />

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 safe-top">
                <div className="mx-4 mt-4">
                    <div className="max-w-7xl mx-auto glass-card px-5 py-3">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link
                                to="/"
                                className="flex items-center gap-3 group"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 13v1c0 1.1.9 2 2 2v1.93zM17.9 17.39c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                                    </svg>
                                </div>
                                <span className="text-xl font-display font-bold text-gradient hidden sm:block">
                                    CalcioStats
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-2">
                                {navLinks.map(({ to, label, icon: Icon }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(to)
                                            ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/20 text-primary-400 border border-primary-500/30'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        <AnimatePresence>
                            {mobileMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="md:hidden overflow-hidden"
                                >
                                    <nav className="pt-4 pb-2 space-y-1 border-t border-gray-200 mt-3">
                                        {navLinks.map(({ to, label, icon: Icon }) => (
                                            <Link
                                                key={to}
                                                to={to}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive(to)
                                                    ? 'bg-primary-500/10 text-primary-400'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                {label}
                                            </Link>
                                        ))}
                                    </nav>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow pt-24 pb-8 relative z-10 overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-hidden">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="glass-card p-6 text-center">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} <span className="text-gradient font-semibold">CalcioStats</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
