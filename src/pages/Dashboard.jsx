import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <span className="text-sm font-medium text-green-600 flex items-center gap-1">
                    <TrendingUp size={16} />
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
);

const Dashboard = () => {
    const { products, invoices } = usePharmacy();

    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const lowStockItems = products.filter(p => p.stock <= (p.reorder_level || 20));
    const needsReorder = products.filter(p => p.stock < (p.reorder_level || 10));
    const recentSales = invoices.slice(0, 5);
    const totalProducts = products.length;
    const todaySales = invoices
        .filter(inv => new Date(inv.date).toDateString() === new Date().toDateString())
        .reduce((sum, inv) => sum + inv.total, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`Rs. ${totalSales.toFixed(2)}`}
                    icon={DollarSign}
                    color="bg-blue-500"
                    trend="+12.5%"
                />
                <StatCard
                    title="Today's Sales"
                    value={`Rs. ${todaySales.toFixed(2)}`}
                    icon={TrendingUp}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Products"
                    value={totalProducts}
                    icon={Package}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Low Stock Alerts"
                    value={lowStockItems.length}
                    icon={AlertTriangle}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Sales</h2>
                    <div className="space-y-4">
                        {invoices.slice(0, 5).map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                        Rs
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Invoice #{invoice.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">Rs. {invoice.total.toFixed(2)}</span>
                            </div>
                        ))}
                        {invoices.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No recent sales found.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Low Stock Items</h2>
                    <div className="space-y-4">
                        {products.filter(p => p.stock < 20).slice(0, 5).map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900">{product.name}</p>
                                    <p className="text-xs text-gray-500">Batch: {product.batch}</p>
                                </div>
                                <div className="text-right">
                                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">
                                        {product.stock} left
                                    </span>
                                </div>
                            </div>
                        ))}
                        {products.filter(p => p.stock < 20).length === 0 && (
                            <p className="text-gray-500 text-center py-4">All items are well stocked.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
