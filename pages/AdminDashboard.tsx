import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MessageSquare, LogOut, Plus, Trash2, Edit2, ShoppingBag, Upload, Loader2, ImageIcon, User } from 'lucide-react';
import { api } from '../supabaseClient';
import { Project, Product, ServiceInquiry, Profile } from '../types';
import { Button } from '../components/ui/Button';

// --- HELPER COMPONENT FOR IMAGE UPLOAD ---
const ImageUpload = ({ 
  bucket, 
  value, 
  onChange, 
  onUploadStart, 
  onUploadEnd,
  label = "Cover Image"
}: { 
  bucket: 'projects' | 'products' | 'avatars';
  value: string;
  onChange: (url: string) => void;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  label?: string;
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      onUploadStart();
      const url = await api.storage.upload(bucket, file);
      onChange(url);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error.message || 'Unknown error'));
    } finally {
      setUploading(false);
      onUploadEnd();
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-400">{label}</label>
      <label className="block w-full cursor-pointer bg-background border border-dashed border-zinc-700 rounded-lg p-6 text-center hover:bg-zinc-800/50 transition-all group">
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center justify-center text-zinc-500 py-4">
             <Loader2 className="animate-spin mb-2" size={24} />
             <span className="text-xs">Uploading to Supabase...</span>
          </div>
        ) : value ? (
          <div className="relative group/preview">
             <img src={value} alt="Preview" className="h-40 mx-auto rounded-lg object-contain shadow-lg bg-zinc-900" />
             <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover/preview:opacity-100 transition-opacity rounded-lg">
                <span className="text-white text-xs font-medium flex items-center gap-2">
                  <Upload size={14} /> Change Image
                </span>
             </div>
          </div>
        ) : (
          <div className="py-4 text-zinc-500 group-hover:text-zinc-300 transition-colors">
             <Upload className="mx-auto mb-3 opacity-50" size={32} />
             <p className="text-sm font-medium">Click to upload image</p>
             <p className="text-xs text-zinc-600 mt-1">PNG, JPG up to 5MB</p>
          </div>
        )}
      </label>
    </div>
  );
};

// --- PROJECTS MANAGER ---

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', category: '', description: '', image_url: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (isUploading) return;
    setLoading(true);
    try {
      await api.projects.create(formData);
      setFormData({ title: '', category: '', description: '', image_url: '' });
      setIsFormOpen(false);
      loadProjects();
    } catch (e) {
      alert('Error creating project');
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-border mb-8 space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Title</label>
              <input placeholder="Project Title" required className="bg-background border border-border rounded-lg p-2 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Category</label>
              <input placeholder="Branding, UI/UX..." required className="bg-background border border-border rounded-lg p-2 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
            </div>
          </div>
          
          <ImageUpload 
            bucket="projects"
            value={formData.image_url}
            onChange={(url) => setFormData({...formData, image_url: url})}
            onUploadStart={() => setIsUploading(true)}
            onUploadEnd={() => setIsUploading(false)}
          />

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Description</label>
            <textarea placeholder="Short description of the project..." className="bg-background border border-border rounded-lg p-2 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" rows={3}
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <Button type="submit" isLoading={loading || isUploading} disabled={!formData.image_url || loading || isUploading}>
            {isUploading ? 'Uploading Image...' : 'Create Project'}
          </Button>
        </form>
      )}

      <div className="grid gap-4">
        {projects.map(p => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg hover:border-zinc-700 transition-colors">
             <div className="flex items-center gap-4">
               <div className="w-16 h-12 bg-zinc-800 rounded overflow-hidden">
                 <img src={p.image_url} alt="" className="w-full h-full object-cover" />
               </div>
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

// --- PRODUCTS MANAGER ---

const ProductsManager = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', price: 0, image_url: '', purchase_link: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(false);
  
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
      if (isUploading) return;
      setLoading(true);
      try {
        await api.products.create(formData);
        setFormData({ title: '', price: 0, image_url: '', purchase_link: '' });
        setIsFormOpen(false);
        loadProducts();
      } catch (e) {
        alert('Error creating product');
      } finally {
        setLoading(false);
      }
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
          <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-border mb-8 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Product Title</label>
                <input placeholder="E.g. Icon Pack Vol. 1" required className="bg-background border border-border rounded-lg p-2 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500">Price ($)</label>
                <input type="number" placeholder="29.99" required className="bg-background border border-border rounded-lg p-2 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                  value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
              </div>
            </div>

            <ImageUpload 
              bucket="products"
              value={formData.image_url}
              onChange={(url) => setFormData({...formData, image_url: url})}
              onUploadStart={() => setIsUploading(true)}
              onUploadEnd={() => setIsUploading(false)}
            />
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Purchase Link</label>
              <input placeholder="https://gumroad.com/l/your-product" required className="bg-background border border-border rounded-lg p-2 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                value={formData.purchase_link} onChange={e => setFormData({...formData, purchase_link: e.target.value})} />
              <p className="text-[10px] text-zinc-500">
                  * Link to Gumroad, LemonSqueezy, or Shopify.
              </p>
            </div>
            
            <Button type="submit" isLoading={loading || isUploading} disabled={!formData.image_url || loading || isUploading}>
              {isUploading ? 'Uploading Image...' : 'Create Product'}
            </Button>
          </form>
        )}
  
        <div className="grid gap-4">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg hover:border-zinc-700 transition-colors">
               <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-zinc-800 rounded overflow-hidden">
                   <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                 </div>
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

// --- PROFILE MANAGER ---
const ProfileManager = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        const data = await api.profiles.getMine();
        if (data) setProfile(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setLoading(true);
        try {
            await api.profiles.update(profile.id, {
                full_name: profile.full_name,
                headline: profile.headline,
                bio: profile.bio,
                avatar_url: profile.avatar_url
            });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error(error);
            setMessage('Error updating profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return <div className="p-4 text-zinc-500">Loading profile...</div>;

    return (
        <div className="max-w-xl">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                {message && <span className={`text-xs px-2 py-1 rounded ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>{message}</span>}
            </div>

            <form onSubmit={handleSave} className="space-y-6 bg-surface p-6 rounded-xl border border-border">
                <ImageUpload 
                    bucket="avatars"
                    label="Main Photo (Hero Image)"
                    value={profile.avatar_url || ''}
                    onChange={(url) => setProfile({...profile, avatar_url: url})}
                    onUploadStart={() => setIsUploading(true)}
                    onUploadEnd={() => setIsUploading(false)}
                />

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Name (Large Title)</label>
                    <input 
                        value={profile.full_name || ''} 
                        onChange={e => setProfile({...profile, full_name: e.target.value})}
                        className="bg-background border border-border rounded-lg p-3 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                        placeholder="e.g. Mikhail Gerges"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Job Position (Headline)</label>
                    <input 
                        value={profile.headline || ''} 
                        onChange={e => setProfile({...profile, headline: e.target.value})}
                        className="bg-background border border-border rounded-lg p-3 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                        placeholder="e.g. Senior Graphic Designer"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500">Description (Bio)</label>
                    <textarea 
                        rows={4}
                        value={profile.bio || ''} 
                        onChange={e => setProfile({...profile, bio: e.target.value})}
                        className="bg-background border border-border rounded-lg p-3 text-white w-full focus:ring-2 focus:ring-zinc-700 outline-none" 
                        placeholder="Tell the world about yourself..."
                    />
                </div>

                <Button type="submit" isLoading={loading || isUploading} disabled={loading || isUploading} className="w-full">
                    Save Changes
                </Button>
            </form>
        </div>
    );
}

// MAIN DASHBOARD COMPONENT

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'products' | 'inquiries' | 'profile'>('projects');
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
            <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}
            >
                <User size={18} /> Profile
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
            {['projects', 'products', 'inquiries', 'profile'].map((t) => (
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
            {activeTab === 'profile' && <ProfileManager />}
        </div>
      </main>
    </div>
  );
};