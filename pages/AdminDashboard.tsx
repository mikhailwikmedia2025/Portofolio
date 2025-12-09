import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, LogOut, Plus, Trash2, Edit2, ShoppingBag } from 'lucide-react';
import { api, isMockMode } from '../supabaseClient';
import { Project, Product, ServiceInquiry } from '../types';
import { Button } from '../components/ui/Button';

// SUB-COMPONENTS for Tab Content

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: '', description: '', image_url: '' });

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    const data = await api.projects.list();
    setProjects(data);
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this project?')) {
        await api.projects.delete(id);
        loadProjects();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.projects.create(formData);
    setFormData({ title: '', category: '', description: '', image_url: '' });
    setIsFormOpen(false);
    loadProjects();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Projects</h2>
        <Button onClick={() => setIsFormOpen(!isFormOpen)} size="sm">
            {isFormOpen ? 'Cancel' : <><Plus size={16} className="mr-2"/> New Project</>}
        </Button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-border mb-8 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Title" required className="bg-background border border-border rounded-lg p-2 text-white w-full" 
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <input placeholder="Category" required className="bg-background border border-border rounded-lg p-2 text-white w-full" 
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          </div>
          <input placeholder="Image URL (Supabase URL or Unsplash)" required className="bg-background border border-border rounded-lg p-2 text-white w-full" 
             value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
          <textarea placeholder="Description" className="bg-background border border-border rounded-lg p-2 text-white w-full" rows={3}
             value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <Button type="submit">Create Project</Button>
        </form>
      )}

      <div className="grid gap-4">
        {projects.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
             <div className="flex items-center gap-4">
               <img src={p.image_url} alt="" className="w-12 h-12 rounded object-cover bg-zinc-800" />
               <div>
                 <h4 className="font-medium text-white">{p.title}</h4>
                 <p className="text-xs text-zinc-500">{p.category}</p>
               </div>
             </div>
             <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}><Trash2 size={16}/></Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', price: 0, image_url: '', purchase_link: '' });
  
    useEffect(() => { loadProducts(); }, []);
  
    const loadProducts = async () => {
      const data = await api.products.list();
      setProducts(data);
    };

    const handleDelete = async (id: string) => {
        if(confirm('Delete this product?')) {
            await api.products.delete(id);
            loadProducts();
        }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await api.products.create(formData);
      setFormData({ title: '', price: 0, image_url: '', purchase_link: '' });
      setIsFormOpen(false);
      loadProducts();
    };
  
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Digital Products</h2>
          <Button onClick={() => setIsFormOpen(!isFormOpen)} size="sm">
              {isFormOpen ? 'Cancel' : <><Plus size={16} className="mr-2"/> New Product</>}
          </Button>
        </div>
  
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-border mb-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Product Title" required className="bg-background border border-border rounded-lg p-2 text-white w-full" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <input type="number" placeholder="Price" required className="bg-background border border-border rounded-lg p-2 text-white w-full" 
                value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <input placeholder="Cover Image URL" required className="bg-background border border-border rounded-lg p-2 text-white w-full" 
               value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
            <input placeholder="Purchase Link (Gumroad/LemonSqueezy)" required className="bg-background border border-border rounded-lg p-2 text-white w-full" 
               value={formData.purchase_link} onChange={e => setFormData({...formData, purchase_link: e.target.value})} />
            <p className="text-xs text-zinc-500">
                * Paste your external payment link (e.g., https://gumroad.com/l/xyz) in the Purchase Link field.
            </p>
            <Button type="submit">Create Product</Button>
          </form>
        )}
  
        <div className="grid gap-4">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
               <div className="flex items-center gap-4">
                 <img src={p.image_url} alt="" className="w-12 h-12 rounded object-cover bg-zinc-800" />
                 <div>
                   <h4 className="font-medium text-white">{p.title}</h4>
                   <p className="text-xs text-zinc-500">${p.price} • <a href={p.purchase_link} target="_blank" className="hover:underline text-blue-400">Link</a></p>
                 </div>
               </div>
               <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}><Trash2 size={16}/></Button>
            </div>
          ))}
        </div>
      </div>
    );
};

const InquiriesManager = () => {
    const [inquiries, setInquiries] = useState<ServiceInquiry[]>([]);

    useEffect(() => {
        const load = async () => {
            const data = await api.inquiries.list();
            setInquiries(data);
        }
        load();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold text-white mb-6">Inquiries</h2>
            <div className="space-y-4">
                {inquiries.length === 0 && <p className="text-zinc-500">No messages yet.</p>}
                {inquiries.map(i => (
                    <div key={i.id} className="bg-surface border border-border p-4 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-white">{i.client_name}</span>
                            <span className="text-xs text-zinc-500">{new Date(i.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-zinc-400 mb-2">{i.email} • {i.service_type}</div>
                        <p className="text-zinc-300 text-sm bg-background p-3 rounded">{i.message}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// MAIN DASHBOARD COMPONENT

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'products' | 'inquiries'>('projects');
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
        const { data } = await api.auth.getUser();
        if(!data.user) {
            navigate('/login');
        } else {
            setUser(data.user);
        }
    }
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
      await api.auth.signOut();
      navigate('/login');
  }

  if(!user) return null;

  return (
    <div className="min-h-screen bg-background text-zinc-300 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col">
        <div className="p-6">
            <h1 className="text-xl font-bold text-white">Lumina Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
            <button 
                onClick={() => setActiveTab('projects')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'projects' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
                <LayoutDashboard size={18} /> Projects
            </button>
            <button 
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
                <ShoppingBag size={18} /> Products
            </button>
            <button 
                onClick={() => setActiveTab('inquiries')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'inquiries' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
                <MessageSquare size={18} /> Inquiries
            </button>
        </nav>
        <div className="p-4 border-t border-border">
            <div className="mb-4 text-xs text-zinc-500 truncate px-2">{user.email}</div>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 px-2 py-2 text-sm">
                <LogOut size={16} /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="md:hidden flex justify-between items-center mb-8">
            <h1 className="text-xl font-bold text-white">Admin</h1>
            <button onClick={handleLogout}><LogOut size={20}/></button>
        </div>
        
        {/* Mobile Tabs */}
        <div className="md:hidden flex space-x-2 mb-8 overflow-x-auto pb-2">
            {['projects', 'products', 'inquiries'].map((t) => (
                <button 
                    key={t}
                    onClick={() => setActiveTab(t as any)}
                    className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap ${activeTab === t ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}
                >
                    {t}
                </button>
            ))}
        </div>

        <div className="max-w-4xl mx-auto">
            {activeTab === 'projects' && <ProjectsManager />}
            {activeTab === 'products' && <ProductsManager />}
            {activeTab === 'inquiries' && <InquiriesManager />}
        </div>
      </main>
    </div>
  );
};
