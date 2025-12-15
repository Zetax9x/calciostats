import {
    Table2, Calendar, Trophy, Users,
    BarChart3, Tv, Video,
    Flag, CircleDot
} from 'lucide-react';
import { motion } from 'framer-motion';

interface LeagueSidebarProps {
    activeSection: string;
    onSelect: (section: string) => void;
}

const MENU_ITEMS = [
    { id: 'classifica', label: 'Classifica', icon: Table2 },
    { id: 'partite', label: 'Partite', icon: Calendar },
    { id: 'risultati', label: 'Risultati', icon: CircleDot },
    { id: 'leaders', label: 'Marcatori', icon: Trophy },
    { id: 'players', label: 'Giocatori', icon: Users },
    { id: 'stats', label: 'Statistiche', icon: BarChart3 },
    { id: 'venues', label: 'Stadi', icon: Flag },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'media', label: 'Media', icon: Video },
];

export const LeagueSidebar = ({ activeSection, onSelect }: LeagueSidebarProps) => {
    return (
        <div className="w-full lg:w-60 flex-shrink-0">
            {/* Desktop: Vertical Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:flex flex-col gap-1.5 glass-card p-4 sticky top-28"
            >
                <h3 className="text-gray-400 text-xs font-semibold uppercase mb-3 px-3 tracking-wider">Navigazione</h3>
                {MENU_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => onSelect(item.id)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-primary-400 border border-primary-500/30 shadow-glow-sm'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-primary-400' : 'text-gray-400'}`} />
                            {item.label}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* Mobile/Tablet: Horizontal Scroll */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-4 scrollbar-hide">
                <div className="flex gap-2">
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-glow-sm'
                                    : 'bg-gray-100 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
