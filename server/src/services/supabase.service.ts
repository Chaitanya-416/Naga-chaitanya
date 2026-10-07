import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (config.supabaseUrl && (config.supabaseSecretKey || config.supabasePublishableKey)) {
    try {
      supabaseClient = createClient(
        config.supabaseUrl,
        config.supabaseSecretKey || config.supabasePublishableKey!
      );
      return supabaseClient;
    } catch (err) {
      console.warn('[Supabase] Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(config.supabaseUrl && (config.supabaseSecretKey || config.supabasePublishableKey));
}
