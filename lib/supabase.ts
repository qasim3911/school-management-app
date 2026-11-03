import { createClient, SupabaseClient } from '@supabase/supabase-js';

// .env.local se lega
const ENV_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function getStoredSupabaseConfig(): { url: string; anonKey: string; isConfigured: boolean; source: 'env' | 'browser' | 'none' } {
  const url = ENV_SUPABASE_URL || DEFAULT_URL;
  const anonKey = ENV_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  if (url && anonKey) {
    return { url, anonKey, isConfigured: true, source: 'env' };
  }
  return { url: '', anonKey: '', isConfigured: false, source: 'none' };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  console.log('Config save disabled, using env only');
}

export function clearStoredSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pk_school_saas_sb_url');
    localStorage.removeItem('pk_school_saas_sb_key');
  }
}

const DEFAULT_URL = 'https://uyduqmpznuojgjumvyuf.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_kqMnERPNde_tbuw2i-bmLQ_vC9Dv2W8';

export const supabase: SupabaseClient = createClient(
  ENV_SUPABASE_URL || DEFAULT_URL,
  ENV_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export function getSupabaseClient(): SupabaseClient {
  return supabase;
}

export interface SupabaseInspectionReport {
  connected: boolean;
  statusMessage: string;
  url: string;
  existingTables: string[];
  accessibleTables: string[];
  permissionDeniedTables: string[];
  missingTables: string[];
  requiresSchemaSetup: boolean;
  storageBuckets: string[];
  storageConnected: boolean;
  authConnected: boolean;
  postgresHint?: string;
}

export const REQUIRED_TABLES = [
  'school_applications',
  'subscription_plans',
  'subscription_payments',
  'admission_letters',
  'fee_items',
  'student_attendance',
  'exam_results',
  'syllabus_items',
  'account_transactions',
  'transport_routes',
  'library_books',
  'inventory_items',
  'whatsapp_messages',
  'school_events',
  'audit_logs',
  'admin_audit_logs',
];

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<SupabaseInspectionReport> {
  const config = getStoredSupabaseConfig();
  const testUrl = customUrl || config.url || DEFAULT_URL;
  const testKey = customKey || config.anonKey || DEFAULT_ANON_KEY;

  if (!testUrl || !testKey) {
    return {
      connected: false,
      statusMessage: 'Supabase credentials are not configured in .env.local',
      url: '',
      existingTables: [],
      accessibleTables: [],
      permissionDeniedTables: [],
      missingTables: REQUIRED_TABLES,
      requiresSchemaSetup: true,
      storageBuckets: [],
      storageConnected: false,
      authConnected: false,
    };
  }
  try {
    const tempClient = createClient(testUrl, testKey);
    const accessible: string[] = [];
    const permissionDenied: string[] = [];
    const missing: string[] = [];
    for (const table of REQUIRED_TABLES) {
      try {
        const { error } = await tempClient.from(table).select('id').limit(1);
        if (error) {
          if (error.code === 'PGRST205' || error.code === '42P01') missing.push(table);
          else permissionDenied.push(table);
        } else {
          accessible.push(table);
        }
      } catch {
        missing.push(table);
      }
    }
    return {
      connected: true,
      statusMessage: `Connected: ${accessible.length} tables accessible`,
      url: config.url,
      existingTables: [...accessible, ...permissionDenied],
      accessibleTables: accessible,
      permissionDeniedTables: permissionDenied,
      missingTables: missing,
      requiresSchemaSetup: permissionDenied.length > 0 || missing.length > 0,
      storageBuckets: [],
      storageConnected: true,
      authConnected: true,
    };
  } catch (err: any) {
    return {
      connected: false,
      statusMessage: `Connection error: ${err.message}`,
      url: config.url,
      existingTables: [],
      accessibleTables: [],
      permissionDeniedTables: [],
      missingTables: REQUIRED_TABLES,
      requiresSchemaSetup: true,
      storageBuckets: [],
      storageConnected: false,
      authConnected: false,
    };
  }
}

export async function uploadToSupabaseStorage(
  bucket: 'school-assets' | 'student-documents' | 'staff-documents' | 'payment-proofs',
  filePath: string,
  file: File | Blob
): Promise<{ url: string | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { url: null, error: 'Supabase client not initialized' };
  try {
    const { data, error } = await client.storage.from(bucket).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) return { url: null, error: error.message };
    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message };
  }
}

export async function supabaseSignUpSchool(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<{ user: any | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { user: null, error: 'Supabase not configured' };
  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { role: 'school_admin', ...metadata } },
    });
    if (error) return { user: null, error: error.message };
    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message };
  }
}

export async function supabaseSignInSchool(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) return { session: null, user: null, error: 'Supabase not configured' };
  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { session: null, user: null, error: error.message };
    return { session: data.session, user: data.user, error: null };
  } catch (err: any) {
    return { session: null, user: null, error: err.message };
  }
}

export async function supabaseResetPassword(email: string, redirectTo?: string) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Not configured' };
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectTo || `${origin}/school/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function supabaseUpdatePassword(newPassword: string) {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Not configured' };
  try {
    const { error } = await client.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function supabaseSignOut() {
  const client = getSupabaseClient();
  if (!client) return { error: null };
  try {
    const { error } = await client.auth.signOut();
    return { error: error ? error.message : null };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function supabaseGetCurrentUser() {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data: { user } } = await client.auth.getUser();
    return user;
  } catch {
    return null;
  }
}