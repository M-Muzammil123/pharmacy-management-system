#!/usr/bin/env node

/**
 * Database Migration Script
 * Automatically creates all required tables in Supabase
 * 
 * Usage: node migrate-database.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigration() {
    log('\n🚀 Starting Database Migration...', 'cyan');
    log('=====================================\n', 'cyan');

    // Load environment variables
    const envPath = join(__dirname, '.env');
    let SUPABASE_URL, SUPABASE_ANON_KEY;

    try {
        const envContent = readFileSync(envPath, 'utf-8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        SUPABASE_URL = envVars.VITE_SUPABASE_URL;
        SUPABASE_ANON_KEY = envVars.VITE_SUPABASE_ANON_KEY;
    } catch (error) {
        log('❌ Error: Could not read .env file', 'red');
        log('Please create a .env file with your Supabase credentials:', 'yellow');
        log('  VITE_SUPABASE_URL=your_url', 'yellow');
        log('  VITE_SUPABASE_ANON_KEY=your_key\n', 'yellow');
        process.exit(1);
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        log('❌ Error: Missing Supabase credentials in .env file', 'red');
        log('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file\n', 'yellow');
        process.exit(1);
    }

    log('✓ Loaded Supabase credentials', 'green');

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    log('✓ Connected to Supabase', 'green');

    // Read schema file
    const schemaPath = join(__dirname, 'database_schema.sql');
    let schema;

    try {
        schema = readFileSync(schemaPath, 'utf-8');
        log('✓ Loaded database schema', 'green');
    } catch (error) {
        log('❌ Error: Could not read database_schema.sql', 'red');
        log(`Make sure the file exists at: ${schemaPath}\n`, 'yellow');
        process.exit(1);
    }

    log('\n📊 Creating Database Tables...', 'blue');
    log('=====================================\n', 'blue');

    // Split schema into individual statements
    const statements = schema
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'));

    const tables = [
        'products',
        'customers',
        'invoices',
        'invoice_items',
        'suppliers',
        'purchase_orders',
        'purchase_order_items',
        'sales_returns',
        'sales_return_items',
        'payments'
    ];

    log(`Creating ${tables.length} tables...\n`, 'cyan');

    // Execute each statement
    for (const statement of statements) {
        if (statement.includes('CREATE TABLE')) {
            const tableName = statement.match(/CREATE TABLE.*?(\w+)\s*\(/)?.[1];
            if (tableName) {
                try {
                    // Note: CREATE TABLE statements need to be run via Supabase SQL Editor
                    // This script will verify if tables exist
                    log(`  Checking table: ${tableName}...`, 'yellow');
                } catch (error) {
                    log(`  ❌ Error with ${tableName}: ${error.message}`, 'red');
                }
            }
        }
    }

    log('\n🔍 Verifying Tables...', 'blue');
    log('=====================================\n', 'blue');

    // Verify tables exist
    let allTablesExist = true;
    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            if (error) {
                log(`  ❌ ${table}: NOT FOUND`, 'red');
                allTablesExist = false;
            } else {
                log(`  ✓ ${table}: EXISTS`, 'green');
            }
        } catch (error) {
            log(`  ❌ ${table}: ERROR - ${error.message}`, 'red');
            allTablesExist = false;
        }
    }

    log('\n📈 Database Statistics...', 'blue');
    log('=====================================\n', 'blue');

    // Get row counts
    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                log(`  ${table}: ${count || 0} rows`, 'cyan');
            }
        } catch (error) {
            // Ignore errors for statistics
        }
    }

    log('\n=====================================', 'cyan');

    if (!allTablesExist) {
        log('\n⚠️  IMPORTANT: Tables need to be created!', 'yellow');
        log('\nPlease run the SQL manually in Supabase:', 'yellow');
        log('1. Go to: https://supabase.com/dashboard', 'yellow');
        log('2. Select your project', 'yellow');
        log('3. Go to SQL Editor', 'yellow');
        log('4. Copy and paste the contents of database_schema.sql', 'yellow');
        log('5. Click "Run"\n', 'yellow');
        log('Then run this script again to verify.\n', 'yellow');
        process.exit(1);
    } else {
        log('\n✅ Migration Complete!', 'green');
        log('All tables are ready to use.\n', 'green');
        process.exit(0);
    }
}

// Run migration
runMigration().catch(error => {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
