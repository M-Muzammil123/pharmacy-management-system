import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as db from '../services/db';
import { resetSupabase } from '../lib/supabase';

const PharmacyContext = createContext();

const INITIAL_PRODUCTS = [
    { id: '1', itemCode: '001', name: 'Paracetamol 500mg', batch: 'B123', expiry: '2025-12-31', price: 5.00, stock: 100, category: 'Medicine' },
    { id: '2', itemCode: '002', name: 'Amoxicillin 250mg', batch: 'B124', expiry: '2024-10-20', price: 12.50, stock: 50, category: 'Antibiotic' },
    { id: '3', itemCode: '003', name: 'Vitamin C 1000mg', batch: 'B125', expiry: '2026-01-15', price: 8.00, stock: 200, category: 'Supplement' },
    { id: '4', itemCode: '004', name: 'Ibuprofen 400mg', batch: 'B126', expiry: '2025-06-30', price: 6.50, stock: 80, category: 'Medicine' },
    { id: '5', itemCode: '005', name: 'Cetirizine 10mg', batch: 'B127', expiry: '2025-08-15', price: 4.00, stock: 120, category: 'Allergy' },
];

const INITIAL_CUSTOMERS = [
    { id: '1', name: 'Dr. Gulam Murtaza', phone: '0300-1234567', region: 'Gulshan Ravi', address: 'Bismillah Chowk', balance: 6070.00 },
    { id: '2', name: 'Pharmacy One', phone: '0321-9876543', region: 'Johar Town', address: 'Main Blvd', balance: 0.00 },
];

export const PharmacyProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('pharmacy_settings');
        return saved ? JSON.parse(saved) : {
            name: 'PharmaPro',
            address: '123 Medical Center, Main Road',
            phone: '0300-0000000',
            license: 'L-123456'
        };
    });

    // Load data on mount or settings change
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Reset Supabase client to pick up new settings
                resetSupabase();

                const [loadedProducts, loadedCustomers, loadedInvoices] = await Promise.all([
                    db.getProducts(),
                    db.getCustomers(),
                    db.getInvoices()
                ]);

                // Initialize with defaults if empty (only for local storage usually)
                if (loadedProducts.length === 0 && !localStorage.getItem('pharmacy_products')) {
                    setProducts(INITIAL_PRODUCTS);
                    localStorage.setItem('pharmacy_products', JSON.stringify(INITIAL_PRODUCTS));
                } else {
                    setProducts(loadedProducts);
                }

                if (loadedCustomers.length === 0 && !localStorage.getItem('pharmacy_customers')) {
                    setCustomers(INITIAL_CUSTOMERS);
                    localStorage.setItem('pharmacy_customers', JSON.stringify(INITIAL_CUSTOMERS));
                } else {
                    setCustomers(loadedCustomers);
                }

                setInvoices(loadedInvoices);
            } catch (error) {
                console.error("Failed to load data:", error);
                alert("Error loading data. Check database configuration.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [settings]);

    useEffect(() => {
        localStorage.setItem('pharmacy_settings', JSON.stringify(settings));
    }, [settings]);

    // Product Actions
    const addProduct = async (product) => {
        const newProduct = await db.saveProduct(product);
        setProducts(prev => [...prev, newProduct]);
    };

    const updateProduct = async (id, updatedProduct) => {
        await db.updateProduct(id, updatedProduct);
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
    };

    const deleteProduct = async (id) => {
        await db.deleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    // Customer Actions
    const addCustomer = async (customer) => {
        const newCustomer = await db.saveCustomer(customer);
        setCustomers(prev => [...prev, newCustomer]);
    };

    const updateCustomer = async (id, updatedCustomer) => {
        await db.updateCustomer(id, updatedCustomer);
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedCustomer } : c));
    };

    const deleteCustomer = async (id) => {
        await db.deleteCustomer(id);
        setCustomers(prev => prev.filter(c => c.id !== id));
    };

    // Cart Actions
    const addToCart = (product) => {
        setCart(prevCart => {
            // Check if product already exists in cart
            const existingItemIndex = prevCart.findIndex(item => item.id === product.id);

            if (existingItemIndex !== -1) {
                // Product already in cart, increment quantity
                const updatedCart = [...prevCart];
                updatedCart[existingItemIndex] = {
                    ...updatedCart[existingItemIndex],
                    quantity: updatedCart[existingItemIndex].quantity + 1
                };
                return updatedCart;
            } else {
                // New product, add to cart
                return [...prevCart, {
                    ...product,
                    quantity: 1,
                    bonus: 0,
                    discount: 0
                }];
            }
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateCartItem = (productId, updates) => {
        setCart(prev => prev.map(item => item.id === productId ? { ...item, ...updates } : item));
    };

    const clearCart = () => setCart([]);

    // POS Actions
    const completeSale = async (customerId) => {
        if (cart.length === 0) return;

        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const totalAmount = cart.reduce((sum, item) => {
            const gross = item.price * item.quantity;
            const discountAmount = (gross * (item.discount || 0)) / 100;
            return sum + (gross - discountAmount);
        }, 0);

        const discountTotal = subtotal - totalAmount;

        // Generate Invoice Number (INV-YYYYMMDD-XXXX)
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

        const customer = customers.find(c => c.id === customerId);

        const newInvoice = {
            id: uuidv4(),
            invoice_number: invoiceNumber,
            customer_id: customerId,
            customer_name: customer ? customer.name : 'Unknown',
            date: new Date().toISOString().split('T')[0], // DATE format: YYYY-MM-DD
            subtotal: subtotal,
            discount: discountTotal,
            total: totalAmount,
            payment_method: 'Cash', // Default for now
            items: cart.map(item => ({
                item_code: item.itemCode || 'N/A',
                name: item.name,
                batch: item.batch,
                expiry: item.expiry,
                quantity: item.quantity,
                price: item.price,
                bonus: item.bonus || 0,
                discount: item.discount || 0
            }))
        };

        // Update stock
        for (const item of cart) {
            const product = products.find(p => p.id === item.id);
            if (product) {
                const newStock = product.stock - (item.quantity + (item.bonus || 0));
                await updateProduct(product.id, { stock: newStock });
            }
        }

        // Update Customer Balance
        if (customerId && customer) {
            await updateCustomer(customerId, { balance: customer.balance + totalAmount });
        }

        await db.saveInvoice(newInvoice);
        setInvoices(prev => [newInvoice, ...prev]);
        clearCart();
        return newInvoice.invoice_number;
    };

    return (
        <PharmacyContext.Provider value={{
            products, addProduct, updateProduct, deleteProduct,
            customers, addCustomer, updateCustomer, deleteCustomer,
            cart, addToCart, removeFromCart, updateCartItem, clearCart,
            invoices, completeSale,
            settings, setSettings,
            loading
        }}>
            {children}
        </PharmacyContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePharmacy = () => useContext(PharmacyContext);
