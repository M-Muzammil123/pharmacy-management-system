import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { format } from 'date-fns';
import { X } from 'lucide-react';

const InvoicePrint = ({ invoice, onClose }) => {
    const { customers, settings } = usePharmacy();
    const customer = customers.find(c => c.id === (invoice.customer_id || invoice.customerId));

    // Calculations
    const grossAmount = invoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = invoice.items.reduce((sum, item) => {
        const itemGross = item.price * item.quantity;
        return sum + (itemGross * (item.discount || 0) / 100);
    }, 0);
    const invoiceTotal = grossAmount - discountAmount;
    const previousBalance = customer?.balance || 0;
    const totalAmount = invoiceTotal + previousBalance;
    const totalItems = invoice.items.reduce((sum, item) => sum + item.quantity, 0);

    // Convert number to words (simplified)
    const numberToWords = (num) => {
        const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

        if (num === 0) return 'zero';

        let words = '';
        const thousand = Math.floor(num / 1000);
        const hundred = Math.floor((num % 1000) / 100);
        const ten = Math.floor((num % 100) / 10);
        const one = Math.floor(num % 10);

        if (thousand > 0) {
            words += ones[thousand] + ' thousand ';
        }
        if (hundred > 0) {
            words += ones[hundred] + ' hundred ';
        }
        if (ten === 1) {
            words += teens[one] + ' ';
        } else {
            if (ten > 0) words += tens[ten] + ' ';
            if (one > 0) words += ones[one] + ' ';
        }

        const decimal = Math.round((num - Math.floor(num)) * 100);
        if (decimal > 0) {
            words += `and ${decimal}/100`;
        }

        return `Rupees ${words.trim()} Only`;
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl shadow-2xl relative print:shadow-none print:max-w-none">
                {/* Close button - hidden when printing */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full print:hidden"
                >
                    <X size={24} />
                </button>

                {/* Print button - hidden when printing */}
                <div className="p-4 border-b print:hidden">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Print Invoice
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="p-8 print:p-6">
                    {/* Header */}
                    <div className="border-2 border-black mb-4">
                        <div className="flex justify-between items-start p-4">
                            <div className="border-2 border-black px-4 py-2">
                                <div className="font-bold text-lg">Estimate</div>
                            </div>
                            <div className="text-right">
                                <h1 className="font-bold text-2xl uppercase">{settings?.name || 'PharmaPro'}</h1>
                                <p className="text-sm">{settings?.address || 'Pharmacy Address'}</p>
                                <p className="text-sm">Phone: {settings?.phone || 'N/A'}</p>
                                <p className="text-sm">License: {settings?.license || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Invoice Details Grid */}
                        <div className="grid grid-cols-2 gap-4 p-4 border-t-2 border-black text-sm">
                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="font-bold w-32">Invoice #:</span>
                                    <span>{invoice.invoice_number || invoice.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-32">Invoice Date:</span>
                                    <span>{format(new Date(invoice.date), 'dd/MM/yyyy')}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-32">Sale Order #:</span>
                                    <span>{invoice.invoice_number || invoice.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-32">Sale Order Type:</span>
                                    <span>REGULAR</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-32">Refrence Date:</span>
                                    <span>{format(new Date(invoice.date), 'dd/MM/yyyy')}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-32">Receiving No:</span>
                                    <span>-</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex">
                                    <span className="font-bold w-28">Customer:</span>
                                    <span>{invoice.customer_name || customer?.name || 'Walk-in'}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-28">Region:</span>
                                    <span>-</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-28">License #:</span>
                                    <span>-</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-28">Delivery Man:</span>
                                    <span>-</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-28">Remarks:</span>
                                    <span>{invoice.payment_method || 'Cash'}</span>
                                </div>
                                <div className="flex">
                                    <span className="font-bold w-28">Ship To:</span>
                                    <span>-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full border-2 border-black text-xs mb-4">
                        <thead>
                            <tr className="border-b-2 border-black bg-gray-100">
                                <th className="border-r border-black p-1 text-left">Item Code</th>
                                <th className="border-r border-black p-1 text-left">Item Name</th>
                                <th className="border-r border-black p-1 text-center">Batch</th>
                                <th className="border-r border-black p-1 text-center">Expiry</th>
                                <th className="border-r border-black p-1 text-right">Quantity</th>
                                <th className="border-r border-black p-1 text-right">Bonus</th>
                                <th className="border-r border-black p-1 text-right">Rate</th>
                                <th className="border-r border-black p-1 text-right">Gross</th>
                                <th className="border-r border-black p-1 text-right">Disc%</th>
                                <th className="p-1 text-right">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, idx) => {
                                const itemGross = item.price * item.quantity;
                                const itemDiscount = (itemGross * (item.discount || 0)) / 100;
                                const netAmount = itemGross - itemDiscount;

                                return (
                                    <tr key={idx} className="border-b border-gray-300">
                                        <td className="border-r border-black p-1">{item.item_code || item.itemCode || '-'}</td>
                                        <td className="border-r border-black p-1">{item.name}</td>
                                        <td className="border-r border-black p-1 text-center">{item.batch}</td>
                                        <td className="border-r border-black p-1 text-center">{item.expiry}</td>
                                        <td className="border-r border-black p-1 text-right">{item.quantity}</td>
                                        <td className="border-r border-black p-1 text-right">{item.bonus || 0}</td>
                                        <td className="border-r border-black p-1 text-right">{item.price.toFixed(2)}</td>
                                        <td className="border-r border-black p-1 text-right">{itemGross.toFixed(2)}</td>
                                        <td className="border-r border-black p-1 text-right">{(item.discount || 0).toFixed(2)}</td>
                                        <td className="p-1 text-right font-bold">{netAmount.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                            <tr className="border-t-2 border-black font-bold">
                                <td colSpan="4" className="border-r border-black p-1">Total Items: {totalItems}</td>
                                <td className="border-r border-black p-1 text-right">{totalItems}</td>
                                <td className="border-r border-black p-1"></td>
                                <td className="border-r border-black p-1"></td>
                                <td className="border-r border-black p-1"></td>
                                <td className="border-r border-black p-1"></td>
                                <td className="p-1 text-right">{invoiceTotal.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="flex justify-between items-start">
                        <div className="text-sm">
                            <p className="font-bold">Previous Balance: ={previousBalance.toFixed(2)}</p>
                            <p className="text-xs mt-2">Page 1 of 1</p>
                        </div>

                        <div className="text-right space-y-1 text-sm">
                            <div className="flex justify-between gap-8">
                                <span className="font-bold">Gross Amount:</span>
                                <span>={grossAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                                <span className="font-bold">Discount Amount:</span>
                                <span>={discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-8 border-t border-black pt-1">
                                <span className="font-bold">Invoice Total:</span>
                                <span className="font-bold">{invoiceTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between gap-8">
                                <span className="font-bold">Credit Note:</span>
                                <span>0.00</span>
                            </div>
                            <div className="flex justify-between gap-8 border-t-2 border-black pt-1">
                                <span className="font-bold">Total Amount:</span>
                                <span className="font-bold text-lg">{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mt-4 border-t-2 border-black pt-2 text-sm">
                        <p className="text-center">--{numberToWords(totalAmount)}--</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:block, .print\\:block * {
                        visibility: visible;
                    }
                    @page {
                        size: A4;
                        margin: 0.5cm;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoicePrint;
