import { createClient } from '@supabase/supabase-js';

let supabase = null;

// Hardcoded fallback configuration for production builds
const FALLBACK_SUPABASE_URL = 'https://bswtpqxgzuzvxbrwaenk.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzd3RwcXhnenV6dnhicndhZW5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODI1NTgsImV4cCI6MjA3OTU1ODU1OH0.7vtOpleD6pwC14521Ion_ZOirLxgKbwLrOXoujlqgIY';

export const getSupabase = () => {
    if (supabase) return supabase;

    console.log('[Supabase] Initializing Supabase client...');

    // Priority 1: Local Storage (Client Override)
    const settings = localStorage.getItem('pharmacy_settings');
    if (settings) {
        try {
            const { dbUrl, apiKey } = JSON.parse(settings);
            if (dbUrl && apiKey) {
                console.log('[Supabase] Using credentials from localStorage');
                supabase = createClient(dbUrl, apiKey);
                return supabase;
            }
        } catch (error) {
            console.error('[Supabase] Error parsing localStorage settings:', error);
        }
    }

    // Priority 2: Environment Variables (Default Service)
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log('[Supabase] Environment variables:', {
        hasUrl: !!envUrl,
        hasKey: !!envKey,
        url: envUrl ? envUrl.substring(0, 30) + '...' : 'undefined'
    });

    if (envUrl && envKey) {
        console.log('[Supabase] Using credentials from environment variables');
        supabase = createClient(envUrl, envKey);
        return supabase;
    }

    // Priority 3: Hardcoded Fallback (Production Build)
    console.warn('[Supabase] Environment variables not found, using hardcoded fallback');
    console.log('[Supabase] This is expected in production builds');
    
    if (FALLBACK_SUPABASE_URL && FALLBACK_SUPABASE_ANON_KEY) {
        supabase = createClient(FALLBACK_SUPABASE_URL, FALLBACK_SUPABASE_ANON_KEY);
        console.log('[Supabase] Successfully initialized with fallback credentials');
        return supabase;
    }

    console.error('[Supabase] CRITICAL: No Supabase configuration available!');
    console.error('[Supabase] App will run in offline mode (localStorage only)');
    return null;
};

export const resetSupabase = () => {
    supabase = null;
};
