import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { FileText, Calendar, DollarSign, Package, Printer } from 'lucide-react';
import InvoicePrint from '../components/InvoicePrint';

const Invoices = () => {
    const { invoices, customers } = usePharmacy();
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const getCustomerName = (id) => {
        const customer = customers.find(c => c.id === id);
        return customer ? customer.name : 'Walk-in Customer';
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <p className="text-gray-500">View and manage past transactions.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">
                            <tr>
                                <th className="p-4">Invoice ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Total Amount</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((invoice, index) => (
                                <tr
                                    key={invoice.id}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 animate-fade-in group"
                                >
                                    <td className="p-4">
                                        <span className="font-bold text-blue-600 group-hover:text-blue-700">
                                            {invoice.invoice_number || `#${invoice.id.slice(0, 8)}`}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                {(invoice.customer_name || getCustomerName(invoice.customer_id || invoice.customerId)).charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {invoice.customer_name || getCustomerName(invoice.customer_id || invoice.customerId)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span className="font-medium">{new Date(invoice.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Package size={16} className="text-gray-400" />
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold">
                                                {invoice.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                            Rs. {invoice.total.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => setSelectedInvoice(invoice)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                        >
                                            <Printer size={16} />
                                            Print
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3 text-gray-400">
                                            <FileText size={64} className="opacity-50" />
                                            <p className="text-lg font-semibold text-gray-600">No invoices found</p>
                                            <p className="text-sm">Complete a sale in POS to generate your first invoice</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedInvoice && (
                <InvoicePrint
                    invoice={selectedInvoice}
                    onClose={() => setSelectedInvoice(null)}
                />
            )}
        </div>
    );
};

export default Invoices;
