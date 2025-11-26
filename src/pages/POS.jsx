import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, User, Package } from 'lucide-react';
import { useToast } from '../components/Toast';

const POS = () => {
    const { products, customers, cart, addToCart, removeFromCart, updateCartItem, clearCart, completeSale } = usePharmacy();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const { showToast, ToastContainer } = useToast();

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.batch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const cartTotal = cart.reduce((sum, item) => {
        const gross = item.price * item.quantity;
        const discountAmount = (gross * (item.discount || 0)) / 100;
        return sum + (gross - discountAmount);
    }, 0);

    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckout = async () => {
        if (!selectedCustomerId) {
            showToast('Please select a customer first', 'warning');
            return;
        }

        if (cart.length === 0) {
            showToast('Cart is empty. Please add items first', 'warning');
            return;
        }

        if (window.confirm(`Complete sale for Rs. ${cartTotal.toFixed(2)}?`)) {
            setIsProcessing(true);
            try {
                const invoiceNumber = await completeSale(selectedCustomerId);
                if (invoiceNumber) {
                    showToast(`Sale completed! Invoice #${invoiceNumber} generated`, 'success');
                    setSelectedCustomerId('');
                } else {
                    showToast('Failed to create invoice. Please try again', 'error');
                }
            } catch (error) {
                console.error('Error completing sale:', error);
                showToast('Error completing sale: ' + error.message, 'error');
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
            {/* Product Selection Area */}
            <div className="flex-1 flex flex-col gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products to add..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-100 p-6">
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Package size={64} className="mb-4 opacity-50" />
                            <p className="text-lg font-medium">No products found</p>
                            <p className="text-sm">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredProducts.map((product, index) => (
                                <button
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className="group text-left p-5 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 hover:scale-105 animate-fade-in"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors mb-1">
                                                {product.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-medium">{product.category}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-xl text-blue-600 group-hover:text-blue-700">
                                                Rs. {product.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm">
                                        <div className="space-y-1">
                                            <p className="text-gray-600">
                                                <span className="font-medium">Batch:</span> {product.batch}
                                            </p>
                                            {product.expiry && (
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Exp:</span> {new Date(product.expiry).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all ${product.stock <= 0
                                            ? 'bg-gray-100 text-gray-500'
                                            : product.stock < (product.reorder_level || 10)
                                                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white animate-pulse'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                            }`}>
                                            {product.stock <= 0 ? 'Out of Stock' : `Stock: ${product.stock}`}
                                        </span>
                                    </div>

                                    {/* Add to cart indicator */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                                            <Plus size={14} /> Click to add to cart
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Cart Area */}
            <div className="w-full lg:w-[450px] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
                {/* Cart Header */}
                <div className="p-6 border-b border-gray-200 space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <ShoppingCart size={24} className="text-blue-600" />
                            Current Sale
                            {cart.length > 0 && (
                                <span className="ml-2 px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                                    {cart.length}
                                </span>
                            )}
                        </h2>
                        {cart.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition-all"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Customer Selection */}
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={selectedCustomerId}
                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-900"
                        >
                            <option value="">Select Customer</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name} - {customer.phone}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingCart size={64} className="mb-4 opacity-30" />
                            <p className="text-lg font-semibold text-gray-500">Cart is empty</p>
                            <p className="text-sm text-gray-400">Add products to start a sale</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">{item.name}</h4>
                                        <p className="text-xs text-gray-500">Batch: {item.batch}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    {/* Quantity */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Quantity</label>
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateCartItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                                                className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-blue-600"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateCartItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                                                className="w-full text-center bg-transparent font-bold text-gray-900 focus:outline-none"
                                                min="1"
                                            />
                                            <button
                                                onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })}
                                                className="p-1.5 hover:bg-white rounded-md transition-colors text-gray-600 hover:text-blue-600"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bonus */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Bonus</label>
                                        <input
                                            type="number"
                                            value={item.bonus || 0}
                                            onChange={(e) => updateCartItem(item.id, { bonus: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* Discount % */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Discount %</label>
                                        <input
                                            type="number"
                                            value={item.discount || 0}
                                            onChange={(e) => updateCartItem(item.id, { discount: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                        />
                                    </div>

                                    {/* Item Total */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600 mb-1 block">Total</label>
                                        <div className="px-3 py-2 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                            <p className="text-sm font-bold text-blue-700">
                                                Rs. {(() => {
                                                    const gross = item.price * item.quantity;
                                                    const discountAmount = (gross * (item.discount || 0)) / 100;
                                                    return (gross - discountAmount).toFixed(2);
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Summary & Checkout */}
                <div className="p-6 border-t border-gray-200 space-y-4 bg-white rounded-b-xl">
                    {/* Summary */}
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Subtotal:</span>
                            <span className="font-bold text-gray-900">
                                Rs. {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 font-medium">Discount:</span>
                            <span className="font-bold text-red-600">
                                - Rs. {cart.reduce((sum, item) => {
                                    const gross = item.price * item.quantity;
                                    return sum + ((gross * (item.discount || 0)) / 100);
                                }, 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="h-px bg-gray-300 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                Rs. {cartTotal.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Complete Payment Button */}
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
                    >
                        <CreditCard size={24} />
                        {isProcessing ? 'Processing...' : 'Complete Payment'}
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default POS;
