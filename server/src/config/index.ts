import dotenv from 'dotenv';
dotenv.config();

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  clientUrl: string;
  geminiApiKey?: string;
  supabaseUrl?: string;
  supabaseSecretKey?: string;
  supabasePublishableKey?: string;
  auditSigningSecret: string;
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  auditSigningSecret: process.env.AUDIT_SIGNING_SECRET || 'scopeseal-default-secure-audit-signing-secret'
};
