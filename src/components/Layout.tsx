import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, Home, Trophy } from 'lucide-react';
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
        <div className="min-h-screen text-dark-200 flex flex-col relative overflow-x-hidden">
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
                                    <Zap className="w-5 h-5 text-white" />
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
                                            : 'text-dark-400 hover:text-white hover:bg-white/5'
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
                                className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5 text-dark-300" />
                                ) : (
                                    <Menu className="w-5 h-5 text-dark-300" />
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
                                    <nav className="pt-4 pb-2 space-y-1 border-t border-white/10 mt-3">
                                        {navLinks.map(({ to, label, icon: Icon }) => (
                                            <Link
                                                key={to}
                                                to={to}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive(to)
                                                    ? 'bg-primary-500/10 text-primary-400'
                                                    : 'text-dark-400 hover:text-white hover:bg-white/5'
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
            <main className="flex-grow pt-24 pb-8 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-8 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="glass-card p-6 text-center">
                        <p className="text-dark-500 text-sm">
                            © {new Date().getFullYear()} <span className="text-gradient font-semibold">CalcioStats</span> · Dati forniti da SoccersAPI
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
