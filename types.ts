
export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  created_at: string;
}

export interface ServiceInquiry {
  id: string;
  client_name: string;
  email: string;
  message: string;
  service_type: string;
  created_at: string;
  read?: boolean;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  image_url: string;
  purchase_link: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  headline?: string;
  bio?: string;
  avatar_url?: string;
}

// Helper type for Supabase responses
export type DbResult<T> = {
  data: T | null;
  error: Error | null;
};
