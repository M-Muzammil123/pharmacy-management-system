import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Plus, Search, Edit2, Trash2, X, Save } from 'lucide-react';
import { useToast } from '../components/Toast';

const Inventory = () => {
    const { products, addProduct, updateProduct, deleteProduct } = usePharmacy();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const { showToast, ToastContainer } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        batch: '',
        expiry: '',
        price: '',
        stock: '',
        category: '',
        itemCode: '',
        reorder_level: 10,
        optimum_level: 50
    });

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.batch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...product });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                batch: '',
                expiry: '',
                price: '',
                stock: '',
                category: '',
                itemCode: '',
                reorder_level: 10,
                optimum_level: 50
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                reorder_level: parseInt(formData.reorder_level) || 10,
                optimum_level: parseInt(formData.optimum_level) || 50
            };

            if (editingProduct) {
                updateProduct(editingProduct.id, productData);
                showToast(`${productData.name} updated successfully!`, 'success');
            } else {
                addProduct(productData);
                showToast(`${productData.name} added to inventory!`, 'success');
            }

            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                batch: '',
                expiry: '',
                price: '',
                stock: '',
                category: '',
                itemCode: '',
                reorder_level: 10,
                optimum_level: 50
            });
        } catch (error) {
            showToast('Error saving product: ' + error.message, 'error');
        }
    };

    const handleDelete = (id) => {
        const product = products.find(p => p.id === id);
        if (window.confirm(`Are you sure you want to delete ${product?.name}?`)) {
            try {
                deleteProduct(id);
                showToast(`${product?.name} deleted successfully!`, 'success');
            } catch (error) {
                showToast('Error deleting product: ' + error.message, 'error');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-gray-500">Manage your product stock and details.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 font-semibold text-sm border-b-2 border-gray-200">
                            <tr>
                                <th className="p-4">Item Code</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Batch</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Expiry</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product, index) => (
                                <tr
                                    key={product.id}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 animate-fade-in group"
                                >
                                    <td className="p-4">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            {product.item_code || product.itemCode || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                            {product.name}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium">{product.batch}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600 font-medium">{product.expiry}</td>
                                    <td className="p-4">
                                        <span className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                            Rs. {product.price.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-all ${product.stock <= 0
                                                ? 'bg-gray-100 text-gray-500'
                                                : product.stock <= (product.reorder_level || 20)
                                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                                }`}>
                                                {product.stock}
                                            </span>
                                            {product.stock <= (product.reorder_level || 20) && product.stock > 0 && (
                                                <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                                    ⚠️ Low
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(product)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                                                title="Edit Product"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                                                title="Delete Product"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-gray-500">
                                        No products found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                                    <input
                                        type="text"
                                        value={formData.itemCode || formData.item_code || ''}
                                        onChange={e => setFormData({ ...formData, itemCode: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Batch No</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.batch}
                                            onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.stock}
                                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.expiry}
                                        onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                                        <input
                                            type="number"
                                            value={formData.reorder_level || 10}
                                            onChange={e => setFormData({ ...formData, reorder_level: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="10"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Alert when stock falls below this level</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Optimum Level</label>
                                        <input
                                            type="number"
                                            value={formData.optimum_level || 50}
                                            onChange={e => setFormData({ ...formData, optimum_level: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="50"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Ideal stock quantity</p>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={20} />
                                        Save Product
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            <ToastContainer />
        </div >
    );
};

export default Inventory;
