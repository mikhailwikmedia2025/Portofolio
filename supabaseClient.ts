import { createClient } from '@supabase/supabase-js';
import { Project, Product, ServiceInquiry } from './types';

// NOTE: In a real Next.js app, these would be process.env.NEXT_PUBLIC_SUPABASE_URL
// For this demo, we check if they exist, otherwise we fallback to Mock Mode.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isMockMode = !SUPABASE_URL || !SUPABASE_ANON_KEY;

export const supabase = !isMockMode
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// --- MOCK DATA ---
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Neon Drift',
    description: 'Automotive cyberpunk brand identity.',
    image_url: 'https://picsum.photos/800/600?random=1',
    category: 'Branding',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Aerospace UI',
    description: 'Flight control system dashboard interface.',
    image_url: 'https://picsum.photos/800/600?random=2',
    category: 'UI/UX',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Eco packaging',
    description: 'Sustainable packaging for organic cosmetics.',
    image_url: 'https://picsum.photos/800/600?random=3',
    category: 'Packaging',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Minimalist Arch',
    description: 'Architectural photography portfolio site.',
    image_url: 'https://picsum.photos/800/600?random=4',
    category: 'Web Design',
    created_at: new Date().toISOString(),
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Cyberpunk Vector Pack',
    price: 29.99,
    image_url: 'https://picsum.photos/400/400?random=10',
    purchase_link: 'https://gumroad.com',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Glassmorphism UI Kit',
    price: 49.00,
    image_url: 'https://picsum.photos/400/400?random=11',
    purchase_link: 'https://lemonsqueezy.com',
    created_at: new Date().toISOString(),
  },
];

const MOCK_INQUIRIES: ServiceInquiry[] = [
  {
    id: '1',
    client_name: 'Alice Johnson',
    email: 'alice@example.com',
    message: 'I need a rebranding for my tech startup.',
    service_type: 'Branding',
    created_at: new Date().toISOString(),
    read: false,
  },
];

// --- SERVICE LAYER ---

export const api = {
  projects: {
    list: async (): Promise<Project[]> => {
      if (isMockMode) return MOCK_PROJECTS;
      const { data, error } = await supabase!.from('projects').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (project: Omit<Project, 'id' | 'created_at'>) => {
      if (isMockMode) {
        const newProject = { ...project, id: Math.random().toString(), created_at: new Date().toISOString() };
        MOCK_PROJECTS.unshift(newProject);
        return newProject;
      }
      const { data, error } = await supabase!.from('projects').insert(project).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
        if (isMockMode) {
            const index = MOCK_PROJECTS.findIndex(p => p.id === id);
            if (index > -1) MOCK_PROJECTS.splice(index, 1);
            return;
        }
        const { error } = await supabase!.from('projects').delete().eq('id', id);
        if (error) throw error;
    }
  },
  products: {
    list: async (): Promise<Product[]> => {
      if (isMockMode) return MOCK_PRODUCTS;
      const { data, error } = await supabase!.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (product: Omit<Product, 'id' | 'created_at'>) => {
        if (isMockMode) {
            const newProd = { ...product, id: Math.random().toString(), created_at: new Date().toISOString() };
            MOCK_PRODUCTS.unshift(newProd);
            return newProd;
        }
        const { data, error } = await supabase!.from('products').insert(product).select().single();
        if (error) throw error;
        return data;
    },
    delete: async (id: string) => {
        if(isMockMode) {
            const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
            if (index > -1) MOCK_PRODUCTS.splice(index, 1);
            return;
        }
        const { error } = await supabase!.from('products').delete().eq('id', id);
        if (error) throw error;
    }
  },
  inquiries: {
    list: async (): Promise<ServiceInquiry[]> => {
      if (isMockMode) return MOCK_INQUIRIES;
      const { data, error } = await supabase!.from('services_inquiries').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (inquiry: Omit<ServiceInquiry, 'id' | 'created_at'>) => {
      if (isMockMode) {
        const newInq = { ...inquiry, id: Math.random().toString(), created_at: new Date().toISOString() };
        MOCK_INQUIRIES.unshift(newInq);
        return newInq;
      }
      const { data, error } = await supabase!.from('services_inquiries').insert(inquiry).select().single();
      if (error) throw error;
      return data;
    },
  },
  auth: {
    signIn: async (email: string, password: string) => {
      if (isMockMode) {
        if (email === 'admin@lumina.com' && password === 'admin') {
          return { user: { id: 'admin', email }, error: null };
        }
        return { user: null, error: { message: 'Invalid mock credentials. Use admin@lumina.com / admin' } };
      }
      return await supabase!.auth.signInWithPassword({ email, password });
    },
    signOut: async () => {
      if (isMockMode) return;
      return await supabase!.auth.signOut();
    },
    getUser: async () => {
        if (isMockMode) return { data: { user: null }, error: null }; // Start logged out in mock for demo
        return await supabase!.auth.getUser();
    }
  }
};
