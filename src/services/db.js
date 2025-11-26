import { v4 as uuidv4 } from 'uuid';
import { getSupabase } from '../lib/supabase';

// Helper to check if we should use DB
const shouldUseDB = () => !!getSupabase();

// --- Products ---
export const getProducts = async () => {
    if (shouldUseDB()) {
        const { data, error } = await getSupabase().from('products').select('*');
        if (error) throw error;
        return data;
    }
    const saved = localStorage.getItem('pharmacy_products');
    return saved ? JSON.parse(saved) : [];
};

export const saveProduct = async (product) => {
    const newProduct = { ...product, id: product.id || uuidv4() };
    if (shouldUseDB()) {
        const dbProduct = {
            id: newProduct.id,
            item_code: newProduct.itemCode || newProduct.item_code,
            name: newProduct.name,
            batch: newProduct.batch,
            category: newProduct.category,
            price: newProduct.price,
            stock: newProduct.stock,
            expiry: newProduct.expiry
        };
        const { error } = await getSupabase().from('products').upsert(dbProduct);
        if (error) throw error;
        return newProduct;
    }
    const products = await getProducts();
    const updated = [...products, newProduct];
    localStorage.setItem('pharmacy_products', JSON.stringify(updated));
    return newProduct;
};

export const updateProduct = async (id, updates) => {
    if (shouldUseDB()) {
        const dbUpdates = { ...updates };
        if (dbUpdates.itemCode) {
            dbUpdates.item_code = dbUpdates.itemCode;
            delete dbUpdates.itemCode;
        }
        // Filter out unknown fields if necessary, but update usually takes partial
        // We should ensure we don't send extra fields that might cause error
        const validFields = ['item_code', 'name', 'batch', 'category', 'price', 'stock', 'expiry'];
        const cleanUpdates = {};
        Object.keys(dbUpdates).forEach(key => {
            if (validFields.includes(key)) cleanUpdates[key] = dbUpdates[key];
        });

        const { error } = await getSupabase().from('products').update(cleanUpdates).eq('id', id);
        if (error) throw error;
        return;
    }
    const products = await getProducts();
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
    localStorage.setItem('pharmacy_products', JSON.stringify(updated));
};

export const deleteProduct = async (id) => {
    if (shouldUseDB()) {
        const { error } = await getSupabase().from('products').delete().eq('id', id);
        if (error) throw error;
        return;
    }
    const products = await getProducts();
    const updated = products.filter(p => p.id !== id);
    localStorage.setItem('pharmacy_products', JSON.stringify(updated));
};

// --- Customers ---
export const getCustomers = async () => {
    if (shouldUseDB()) {
        const { data, error } = await getSupabase().from('customers').select('*');
        if (error) throw error;
        return data;
    }
    const saved = localStorage.getItem('pharmacy_customers');
    return saved ? JSON.parse(saved) : [];
};

export const saveCustomer = async (customer) => {
    const newCustomer = { ...customer, id: customer.id || uuidv4() };
    if (shouldUseDB()) {
        const dbCustomer = {
            id: newCustomer.id,
            name: newCustomer.name,
            phone: newCustomer.phone,
            email: newCustomer.email,
            address: newCustomer.address
        };

        // Only add balance if the column exists (to prevent errors)
        if (newCustomer.balance !== undefined) {
            dbCustomer.balance = newCustomer.balance || 0;
        }

        const { error } = await getSupabase().from('customers').upsert(dbCustomer);
        if (error) {
            // If balance column error, try without balance
            if (error.code === 'PGRST204' && error.message.includes('balance')) {
                console.warn('Balance column not found, saving without it');
                delete dbCustomer.balance;
                const { error: retryError } = await getSupabase().from('customers').upsert(dbCustomer);
                if (retryError) throw retryError;
                return newCustomer;
            }
            throw error;
        }
        return newCustomer;
    }
    const customers = await getCustomers();
    const updated = [...customers, newCustomer];
    localStorage.setItem('pharmacy_customers', JSON.stringify(updated));
    return newCustomer;
};

export const updateCustomer = async (id, updates) => {
    if (shouldUseDB()) {
        // Filter valid fields
        const dbUpdates = {
            name: updates.name,
            phone: updates.phone,
            email: updates.email,
            address: updates.address
        };

        // Only add balance if provided
        if (updates.balance !== undefined) {
            dbUpdates.balance = updates.balance;
        }

        const { error } = await getSupabase()
            .from('customers')
            .update(dbUpdates)
            .eq('id', id);

        if (error) {
            // If balance column error, try without balance
            if (error.code === 'PGRST204' && error.message.includes('balance')) {
                console.warn('Balance column not found, updating without it');
                delete dbUpdates.balance;
                const { error: retryError } = await getSupabase()
                    .from('customers')
                    .update(dbUpdates)
                    .eq('id', id);
                if (retryError) throw retryError;
                return;
            }
            throw error;
        }
        return;
    }
    const customers = await getCustomers();
    const updated = customers.map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem('pharmacy_customers', JSON.stringify(updated));
};

export const deleteCustomer = async (id) => {
    if (shouldUseDB()) {
        const { error } = await getSupabase().from('customers').delete().eq('id', id);
        if (error) throw error;
        return;
    }
    const customers = await getCustomers();
    const updated = customers.filter(c => c.id !== id);
    localStorage.setItem('pharmacy_customers', JSON.stringify(updated));
};

// --- Invoices ---
export const getInvoices = async () => {
    if (shouldUseDB()) {
        const { data, error } = await getSupabase().from('invoices').select('*, items:invoice_items(*)').order('date', { ascending: false });
        if (error) throw error;
        return data;
    }
    const saved = localStorage.getItem('pharmacy_invoices');
    return saved ? JSON.parse(saved) : [];
};

export const saveInvoice = async (invoice) => {
    console.log('saveInvoice called with:', invoice);

    if (shouldUseDB()) {
        try {
            // Separate invoice and items
            const { items, ...invoiceData } = invoice;

            // Ensure we only send fields that exist in the database
            const dbInvoice = {
                id: invoiceData.id,
                invoice_number: invoiceData.invoice_number,
                customer_id: invoiceData.customer_id,
                customer_name: invoiceData.customer_name,
                date: invoiceData.date,
                subtotal: invoiceData.subtotal,
                discount: invoiceData.discount,
                total: invoiceData.total
            };

            console.log('Saving invoice to Supabase:', dbInvoice);
            const { data: invData, error: invError } = await getSupabase().from('invoices').insert(dbInvoice).select();
            if (invError) {
                console.error('Error saving invoice:', invError);
                throw invError;
            }
            console.log('Invoice saved successfully:', invData);

            const itemsWithInvoiceId = items.map(item => ({
                invoice_id: invoice.id,
                item_code: item.item_code,
                name: item.name,
                batch: item.batch,
                expiry: item.expiry,
                quantity: item.quantity,
                price: item.price,
                bonus: item.bonus || 0,
                discount: item.discount || 0
            }));

            console.log('Saving invoice items to Supabase:', itemsWithInvoiceId);
            const { data: itemsData, error: itemsError } = await getSupabase().from('invoice_items').insert(itemsWithInvoiceId).select();
            if (itemsError) {
                console.error('Error saving invoice items:', itemsError);
                throw itemsError;
            }
            console.log('Invoice items saved successfully:', itemsData);

            return invoice;
        } catch (error) {
            console.error('Failed to save invoice to Supabase:', error);
            throw error;
        }
    }
    const invoices = await getInvoices();
    const updated = [invoice, ...invoices];
    localStorage.setItem('pharmacy_invoices', JSON.stringify(updated));
    return invoice;
};

// --- Suppliers ---
export const getSuppliers = async () => {
    if (shouldUseDB()) {
        const { data, error } = await getSupabase().from('suppliers').select('*');
        if (error) throw error;
        return data;
    }
    const saved = localStorage.getItem('pharmacy_suppliers');
    return saved ? JSON.parse(saved) : [];
};

export const saveSupplier = async (supplier) => {
    const newSupplier = { ...supplier, id: supplier.id || uuidv4() };
    if (shouldUseDB()) {
        const { error } = await getSupabase().from('suppliers').upsert(newSupplier);
        if (error) throw error;
        return newSupplier;
    }
    const suppliers = await getSuppliers();
    const updated = [...suppliers, newSupplier];
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(updated));
    return newSupplier;
};

export const updateSupplier = async (id, updates) => {
    if (shouldUseDB()) {
        const { error } = await getSupabase()
            .from('suppliers')
            .update(updates)
            .eq('id', id);
        if (error) throw error;
        return;
    }
    const suppliers = await getSuppliers();
    const updated = suppliers.map(s => s.id === id ? { ...s, ...updates } : s);
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(updated));
};

export const deleteSupplier = async (id) => {
    if (shouldUseDB()) {
        const { error } = await getSupabase().from('suppliers').delete().eq('id', id);
        if (error) throw error;
        return;
    }
    const suppliers = await getSuppliers();
    const updated = suppliers.filter(s => s.id !== id);
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(updated));
};
