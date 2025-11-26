# PharmaPro - Professional Pharmacy Management System

A modern, full-featured pharmacy management system built with React, Supabase, and Electron.

## 🚀 Features

### Core Features
- **Dashboard** - Overview of sales, inventory, and alerts
- **Inventory Management** - Track products with batch, expiry, and reorder levels
- **Point of Sale (POS)** - Fast checkout with customer selection
- **Customer Management** - Track customer information and balances
- **Invoice Generation** - Professional invoices with all details
- **Settings** - Configure pharmacy details and database

### Advanced Features (Abuzar Pharmacy Compatible)
- **Supplier Management** - Manage supplier contacts and information
- **Purchase Orders** - Create and track purchase orders
- **Reorder Level Alerts** - Smart stock alerts based on custom thresholds
- **Sales Returns** - Handle product returns (Schema ready)
- **Credit Sales Tracking** - Track pending payments (Schema ready)

## 📋 Prerequisites

- Node.js 16+ and npm
- Supabase account (for cloud database)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd antigravity_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Set up database**

   **Option 1: Automated Check (Recommended)**
   ```bash
   npm run migrate
   ```
   This will verify your database and tell you what needs to be done.

   **Option 2: Manual Setup**
   - Go to your Supabase SQL Editor: https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" → "New Query"
   - Copy and paste all contents from `database_schema.sql`
   - Click "Run" (or press Ctrl+Enter)
   - Run `npm run migrate` to verify all tables were created

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🖥️ Desktop App

Build as an Electron desktop application:

```bash
# Build the app
npm run build

# Package for desktop
npm run electron:build
```

## 📊 Database Schema

The complete database schema is in `database_schema.sql`. It includes:

- **products** - Product inventory with reorder levels
- **customers** - Customer information and balances
- **invoices** - Sales invoices with payment tracking
- **invoice_items** - Invoice line items
- **suppliers** - Supplier contacts
- **purchase_orders** - Purchase order management
- **purchase_order_items** - PO line items
- **sales_returns** - Product returns
- **sales_return_items** - Return line items
- **payments** - Payment tracking

## 🎯 Usage

### Quick Start
1. Go to Settings and configure your pharmacy details
2. Add products in Inventory
3. Add suppliers in Suppliers
4. Create customers in Customers
5. Make sales in POS
6. View invoices and print

### Reorder Levels
- Set custom reorder levels for each product
- Dashboard shows low stock alerts
- Visual indicators in inventory table

### Purchase Orders
1. Go to Suppliers → Add suppliers
2. Go to Purchase Orders → Create new PO
3. Select supplier and add products
4. Mark as received to update stock

## 🔧 Configuration

### Database
- Configure in Settings page or via `.env` file
- Supports Supabase cloud database
- Falls back to localStorage for offline mode

### Pharmacy Details
- Name, address, phone, license
- Configurable in Settings page
- Appears on invoices

## 📱 Pages

- `/` - Dashboard
- `/inventory` - Product management
- `/suppliers` - Supplier management
- `/customers` - Customer management
- `/pos` - Point of Sale
- `/invoices` - Invoice history
- `/settings` - Configuration

## 🛡️ Security

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive data
- Secure Supabase authentication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for your pharmacy business.

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- Database powered by Supabase
- Desktop app with Electron
- Icons from Lucide React

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Made with ❤️ for pharmacies everywhere**
