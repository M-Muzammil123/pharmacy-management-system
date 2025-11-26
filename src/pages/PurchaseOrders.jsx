import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Save, Package, CheckCircle, XCircle } from 'lucide-react';
import * as db from '../services/db';

const PurchaseOrders = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPO, setEditingPO] = useState(null);
    const [formData, setFormData] = useState({
        supplier_id: '',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        notes: '',
        items: []
    });
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [pos, sups, prods] = await Promise.all([
                db.getPurchaseOrders(),
                db.getSuppliers(),
                db.getProducts()
            ]);
            setPurchaseOrders(pos);
            setSuppliers(sups);
            setProducts(prods);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const filteredPOs = purchaseOrders.filter(po =>
        po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (suppliers.find(s => s.id === po.supplier_id)?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (po = null) => {
        if (po) {
            setEditingPO(po);
            setFormData({ ...po });
        } else {
            setEditingPO(null);
            setFormData({
                supplier_id: '',
                order_date: new Date().toISOString().split('T')[0],
                expected_delivery: '',
                notes: '',
                items: []
            });
        }
        setIsModalOpen(true);
    };

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0 || unitPrice <= 0) {
            alert('Please select a product and enter valid quantity and price');
            return;
        }

        const product = products.find(p => p.id === selectedProduct);
        const total = quantity * unitPrice;

        const newItem = {
            product_id: selectedProduct,
            name: product.name,
            quantity: parseInt(quantity),
            unit_price: parseFloat(unitPrice),
            total: total,
            received_quantity: 0
        };

        setFormData({
            ...formData,
            items: [...formData.items, newItem]
        });

        setSelectedProduct('');
        setQuantity(1);
        setUnitPrice(0);
    };

    const handleRemoveItem = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.items.length === 0) {
            alert('Please add at least one item to the purchase order');
            return;
        }

        try {
            const totalAmount = formData.items.reduce((sum, item) => sum + item.total, 0);
            const poData = {
                ...formData,
                total_amount: totalAmount,
                status: 'pending'
            };

            if (editingPO) {
                await db.updatePurchaseOrder(editingPO.id, poData);
            } else {
                await db.savePurchaseOrder(poData);
            }

            await loadData();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving purchase order:', error);
            alert('Failed to save purchase order: ' + error.message);
        }
    };

    const handleMarkReceived = async (po) => {
        if (window.confirm('Mark this purchase order as received? This will update stock levels.')) {
            try {
                await db.receivePurchaseOrder(po.id);
                await loadData();
                alert('Purchase order marked as received and stock updated!');
            } catch (error) {
                console.error('Error receiving PO:', error);
                alert('Failed to receive purchase order: ' + error.message);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this purchase order?')) {
            try {
                await db.deletePurchaseOrder(id);
                await loadData();
            } catch (error) {
                console.error('Error deleting purchase order:', error);
                alert('Failed to delete purchase order: ' + error.message);
            }
        }
    };

    const getSupplierName = (supplierId) => {
        return suppliers.find(s => s.id === supplierId)?.name || 'Unknown';
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-700',
            received: 'bg-green-100 text-green-700',
            partial: 'bg-blue-100 text-blue-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return styles[status] || styles.pending;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
                    <p className="text-gray-500">Manage purchase orders and track deliveries.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    New Purchase Order
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search purchase orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                            <tr>
                                <th className="p-4">PO Number</th>
                                <th className="p-4">Supplier</th>
                                <th className="p-4">Order Date</th>
                                <th className="p-4">Expected Delivery</th>
                                <th className="p-4">Total Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPOs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        <Package className="mx-auto mb-2 text-gray-300" size={48} />
                                        <p>No purchase orders found.</p>
                                        <p className="text-sm">Create your first purchase order to get started.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPOs.map((po) => (
                                    <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{po.po_number}</td>
                                        <td className="p-4 text-gray-600">{getSupplierName(po.supplier_id)}</td>
                                        <td className="p-4 text-gray-600">{new Date(po.order_date).toLocaleDateString()}</td>
                                        <td className="p-4 text-gray-600">{po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : '-'}</td>
                                        <td className="p-4 font-medium text-gray-900">Rs. {po.total_amount?.toFixed(2) || '0.00'}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(po.status)}`}>
                                                {po.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {po.status === 'pending' && (
                                                <button
                                                    onClick={() => handleMarkReceived(po)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Mark as Received"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleOpenModal(po)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(po.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingPO ? 'Edit Purchase Order' : 'New Purchase Order'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                                    <select
                                        required
                                        value={formData.supplier_id}
                                        onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(supplier => (
                                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.order_date}
                                        onChange={e => setFormData({ ...formData, order_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery</label>
                                    <input
                                        type="date"
                                        value={formData.expected_delivery}
                                        onChange={e => setFormData({ ...formData, expected_delivery: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <input
                                        type="text"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Optional notes"
                                    />
                                </div>
                            </div>

                            {/* Add Items Section */}
                            <div className="border-t pt-4">
                                <h3 className="font-bold text-gray-900 mb-4">Add Items</h3>
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                                        <select
                                            value={selectedProduct}
                                            onChange={e => setSelectedProduct(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Product</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>{product.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={e => setQuantity(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={unitPrice}
                                            onChange={e => setUnitPrice(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Add Item
                                </button>
                            </div>

                            {/* Items List */}
                            {formData.items.length > 0 && (
                                <div className="border-t pt-4">
                                    <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="p-2 text-left">Product</th>
                                                <th className="p-2 text-right">Quantity</th>
                                                <th className="p-2 text-right">Unit Price</th>
                                                <th className="p-2 text-right">Total</th>
                                                <th className="p-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="p-2">{item.name}</td>
                                                    <td className="p-2 text-right">{item.quantity}</td>
                                                    <td className="p-2 text-right">Rs. {item.unit_price.toFixed(2)}</td>
                                                    <td className="p-2 text-right font-medium">Rs. {item.total.toFixed(2)}</td>
                                                    <td className="p-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="border-t-2 font-bold">
                                                <td colSpan="3" className="p-2 text-right">Total Amount:</td>
                                                <td className="p-2 text-right">
                                                    Rs. {formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="pt-4 border-t">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={20} />
                                    Save Purchase Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
