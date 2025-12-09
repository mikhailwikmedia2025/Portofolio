import { createClient } from '@supabase/supabase-js';
import { Project, Product, ServiceInquiry } from './types';

// Strictly use import.meta.env.VITE_...
// We use @ts-ignore to avoid TypeScript errors if types aren't perfect, 
// but we want the runtime behavior of reading Vite env vars.
// @ts-ignore
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('--- Supabase Configuration ---');
console.log('VITE_SUPABASE_URL:', SUPABASE_URL ? 'Loaded' : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Loaded' : 'MISSING');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('CRITICAL ERROR: Supabase environment variables are missing.');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.');
}

// Initialize Supabase Client
// If keys are missing, this client will likely fail on requests, which is the intended "real error" behavior.
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// --- SERVICE LAYER ---
// No mock fallbacks. All calls go directly to Supabase.

export const api = {
  storage: {
    upload: async (bucket: 'projects' | 'products', file: File): Promise<string> => {
      // 1. Sanitize filename and create a unique path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data.publicUrl;
    }
  },
  projects: {
    list: async (): Promise<Project[]> => {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (project: Omit<Project, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('projects').insert(project).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
    }
  },
  products: {
    list: async (): Promise<Product[]> => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (product: Omit<Product, 'id' | 'created_at'>) => {
        const { data, error } = await supabase.from('products').insert(product).select().single();
        if (error) throw error;
        return data;
    },
    delete: async (id: string) => {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
    }
  },
  inquiries: {
    list: async (): Promise<ServiceInquiry[]> => {
      const { data, error } = await supabase.from('services_inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (inquiry: Omit<ServiceInquiry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('services_inquiries').insert(inquiry).select().single();
      if (error) throw error;
      return data;
    },
  },
  auth: {
    signIn: async (email: string, password: string) => {
      return await supabase.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      return await supabase.auth.signOut();
    },
    getUser: async () => {
        return await supabase.auth.getUser();
    }
  }
};