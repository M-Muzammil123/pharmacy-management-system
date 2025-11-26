import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FileText, Menu, X, User, Settings as SettingsIcon, Truck } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { usePharmacy } from '../context/PharmacyContext';

// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={clsx(
            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
            active
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
        )}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </Link>
);

const MainLayout = ({ children }) => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { settings } = usePharmacy();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
        { icon: Package, label: 'Inventory', to: '/inventory' },
        { icon: Truck, label: 'Suppliers', to: '/suppliers' },
        { icon: ShoppingCart, label: 'Point of Sale', to: '/pos' },
        { icon: User, label: 'Customers', to: '/customers' },
        { icon: FileText, label: 'Invoices', to: '/invoices' },
        { icon: SettingsIcon, label: 'Settings', to: '/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-10">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <span className="bg-blue-600 text-white p-1 rounded">Rx</span>
                        {settings?.name || 'PharmaPro'}
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            icon={item.icon}
                            label={item.label}
                            to={item.to}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            AD
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">Pharmacist</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-20 flex items-center justify-between px-4">
                <h1 className="text-xl font-bold text-blue-600">PharmaPro</h1>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-white z-10 pt-20 px-4 space-y-2">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            icon={item.icon}
                            label={item.label}
                            to={item.to}
                            active={location.pathname === item.to}
                        />
                    ))}
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 transition-all duration-200">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
