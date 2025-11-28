import React, { useState, useRef } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { FileText, Calendar, DollarSign, Package, Printer, Trash2, Search, Filter, Download } from 'lucide-react';
import InvoicePrint from '../components/InvoicePrint';

const Invoices = () => {
    const { invoices, deleteInvoice, customers, settings } = usePharmacy();
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter invoices based on search
    const filteredInvoices = invoices.filter(invoice => {
        const searchLower = searchTerm.toLowerCase();
        return (
            invoice.invoice_number?.toLowerCase().includes(searchLower) ||
            invoice.customer_name?.toLowerCase().includes(searchLower) ||
            invoice.id.toLowerCase().includes(searchLower)
        );
    });

    const handleDelete = async (invoice) => {
        try {
            await deleteInvoice(invoice.id);
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Failed to delete invoice. Please try again.');
        }
    };

    // Quick print handler - opens print dialog directly
    const handleQuickPrint = async (invoice) => {
        // Clear any previous selection first
        setSelectedInvoice(null);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Set new invoice
        setSelectedInvoice(invoice);
        // Small delay to ensure modal renders before printing
        setTimeout(() => {
            window.print();
            // Close modal after print to prevent data mixing
            setTimeout(() => setSelectedInvoice(null), 1000);
        }, 400);
    };

    // Quick download handler - generates PDF directly
    const handleQuickDownload = async (invoice) => {
        // Clear any previous selection first
        setSelectedInvoice(null);
        await new Promise(resolve => setTimeout(resolve, 100));

        // Set new invoice
        setSelectedInvoice(invoice);
        // Wait for modal to render and content to be available
        await new Promise(resolve => setTimeout(resolve, 600));

        // Trigger download from InvoicePrint component
        const downloadButton = document.querySelector('[title="Download as PDF"]');
        if (downloadButton) {
            downloadButton.click();
            // Close modal after download starts to prevent data mixing
            setTimeout(() => setSelectedInvoice(null), 1500);
        }
    };

    // Calculate total revenue
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">📄 Invoices</h1>
                    <p className="text-gray-600">View and manage all your sales invoices</p>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-4 min-w-[180px]">
                        <div className="text-sm opacity-90 mb-1">Total Invoices</div>
                        <div className="text-3xl font-bold">{invoices.length}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-4 min-w-[180px]">
                        <div className="text-sm opacity-90 mb-1">Total Revenue</div>
                        <div className="text-3xl font-bold">Rs. {totalRevenue.toFixed(0)}</div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="🔍 Search by invoice number or customer name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-600">
                        Found {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                            <tr>
                                <th className="p-4 text-sm font-bold text-gray-700">Invoice ID</th>
                                <th className="p-4 text-sm font-bold text-gray-700">Customer</th>
                                <th className="p-4 text-sm font-bold text-gray-700">Date</th>
                                <th className="p-4 text-sm font-bold text-gray-700">Items</th>
                                <th className="p-4 text-sm font-bold text-gray-700">Total Amount</th>
                                <th className="p-4 text-sm font-bold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map((invoice, index) => (
                                    <tr
                                        key={invoice.id}
                                        style={{ animationDelay: `${index * 30}ms` }}
                                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 animate-fade-in group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                                                    <FileText size={20} />
                                                </div>
                                                <span className="font-bold text-blue-600 group-hover:text-blue-700">
                                                    {invoice.invoice_number || `#${invoice.id.slice(0, 8)}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                    {(invoice.customer_name || 'W').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">
                                                        {invoice.customer_name || 'Walk-in Customer'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {customers.find(c => c.id === invoice.customer_id)?.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span className="font-medium">{new Date(invoice.date).toLocaleDateString('en-GB')}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Package size={16} className="text-gray-400" />
                                                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs font-bold shadow-sm">
                                                    {invoice.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={16} className="text-green-500" />
                                                <span className="font-bold text-lg text-gray-900 group-hover:text-green-600 transition-colors">
                                                    Rs. {invoice.total.toFixed(2)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* Quick Print Button */}
                                                <button
                                                    onClick={() => handleQuickPrint(invoice)}
                                                    className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                                                    title="Print Invoice"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                {/* Quick Download Button */}
                                                <button
                                                    onClick={() => handleQuickDownload(invoice)}
                                                    className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                                                    title="Download PDF"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => setDeleteConfirm(invoice)}
                                                    className="inline-flex items-center justify-center w-9 h-9 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                                                    title="Delete Invoice"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                                <FileText size={40} className="opacity-50" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-semibold text-gray-600 mb-1">
                                                    {searchTerm ? 'No invoices found' : 'No invoices yet'}
                                                </p>
                                                <p className="text-sm">
                                                    {searchTerm
                                                        ? 'Try a different search term'
                                                        : 'Complete a sale in POS to generate your first invoice'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Modal */}
            {selectedInvoice && (
                <InvoicePrint
                    invoice={selectedInvoice}
                    customer={customers.find(c => c.id === selectedInvoice.customer_id)}
                    settings={settings}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                                <Trash2 size={28} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Delete Invoice</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete invoice{' '}
                            <span className="font-bold text-blue-600">
                                {deleteConfirm.invoice_number || `#${deleteConfirm.id.slice(0, 8)}`}
                            </span>
                            ?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                Delete Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
