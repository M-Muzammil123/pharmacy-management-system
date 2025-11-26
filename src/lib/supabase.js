import { createClient } from '@supabase/supabase-js';

let supabase = null;

export const getSupabase = () => {
    if (supabase) return supabase;

    // Priority 1: Local Storage (Client Override)
    const settings = localStorage.getItem('pharmacy_settings');
    if (settings) {
        const { dbUrl, apiKey } = JSON.parse(settings);
        if (dbUrl && apiKey) {
            supabase = createClient(dbUrl, apiKey);
            return supabase;
        }
    }

    // Priority 2: Environment Variables (Default Service)
    const envUrl = import.meta.env.VITE_SUPABASE_URL;
    const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (envUrl && envKey) {
        supabase = createClient(envUrl, envKey);
        return supabase;
    }

    return null;
};

export const resetSupabase = () => {
    supabase = null;
};
