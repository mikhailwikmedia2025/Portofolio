import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Download, ExternalLink, Mail, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { api } from '../supabaseClient';
import { Project, Product } from '../types';

// Components inside Home to share state easily without prop drilling hell in this small app
const SectionHeading = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <div className="mb-12">
    {subtitle && <span className="text-accent text-sm font-semibold tracking-wider uppercase mb-2 block">{subtitle}</span>}
    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{children}</h2>
  </div>
);

export const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', type: 'General', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projData, prodData] = await Promise.all([
          api.projects.list(),
          api.products.list()
        ]);
        setProjects(projData);
        setProducts(prodData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.inquiries.create({
        client_name: formData.name,
        email: formData.email,
        service_type: formData.type,
        message: formData.message
      });
      setSent(true);
      setFormData({ name: '', email: '', type: 'General', message: '' });
    } catch (error) {
      console.error(error);
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-zinc-300 font-sans selection:bg-accent/30 selection:text-accent-100">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="order-2 md:order-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-2">
                Mikhail Gerges Mikhail
              </h1>
              <h2 className="text-2xl md:text-3xl text-zinc-400 font-medium">
                Senior Graphic Designer
              </h2>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-zinc-400 mb-8 max-w-lg leading-relaxed"
            >
              Specializing in branding, visual identity, and digital products. 
              I craft digital experiences that matter, blending minimalist aesthetics with functional precision.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4"
            >
              <Button size="lg" className="rounded-full" onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth'})}>
                View Work
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth'})}>
                Contact Me
              </Button>
            </motion.div>
          </div>

          {/* Profile Image */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-72 h-72 md:w-96 md:h-96"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-accent to-purple-500 rounded-3xl blur-2xl opacity-20" />
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=800&q=80" 
                alt="Mikhail Gerges Mikhail" 
                className="relative z-10 w-full h-full object-cover rounded-3xl border border-zinc-700 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>
          </div>

        </div>
      </section>

      {/* PORTFOLIO GRID */}
      <section id="work" className="py-20 px-4 max-w-7xl mx-auto border-t border-white/5">
        <SectionHeading subtitle="Portfolio">Selected Works</SectionHeading>
        
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
             {[1,2,3,4].map(i => <div key={i} className="aspect-[4/3] bg-zinc-900 rounded-xl" />)}
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-800">
                  <img 
                    src={project.image_url} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="primary" className="rounded-full">View Case Study</Button>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    <p className="text-zinc-500 mt-1">{project.description}</p>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 border border-zinc-800 px-2 py-1 rounded-full uppercase tracking-wide">
                    {project.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading subtitle="Services">What I Can Do For You</SectionHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Branding', desc: 'Logo design, visual identity systems, and brand guidelines.', icon: '❖' },
              { title: 'Web Design', desc: 'Responsive websites, landing pages, and UI/UX design.', icon: '⌘' },
              { title: 'Art Direction', desc: 'Visual strategy for campaigns, photo shoots, and digital content.', icon: '✦' }
            ].map((service, i) => (
              <div key={i} className="p-8 bg-background border border-border rounded-2xl hover:border-zinc-700 transition-colors">
                <div className="text-4xl mb-6 text-zinc-500 font-light">{service.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIGITAL STORE */}
      <section id="store" className="py-20 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
           <SectionHeading subtitle="Shop">Digital Assets</SectionHeading>
           <a href="#" className="hidden md:flex items-center text-sm font-medium text-zinc-400 hover:text-white mb-12">
             View All Products <ArrowRight size={16} className="ml-2" />
           </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-surface border border-border rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <div className="aspect-square bg-zinc-800 rounded-lg mb-4 overflow-hidden relative group">
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                 <a 
                   href={product.purchase_link} 
                   target="_blank" 
                   rel="noreferrer"
                   className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity"
                 >
                    <div className="bg-white text-black p-3 rounded-full">
                      <ArrowUpRight size={20} />
                    </div>
                 </a>
              </div>
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-white">{product.title}</h4>
                <span className="font-bold text-white">${product.price}</span>
              </div>
              <a 
                href={product.purchase_link}
                target="_blank" 
                rel="noreferrer" 
                className="mt-4 block w-full bg-zinc-800 hover:bg-zinc-700 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Buy Now
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT & FOOTER */}
      <section id="contact" className="py-20 bg-surface">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Let's work together.</h2>
            <p className="text-zinc-400">Have a project in mind? Send me a message.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Email</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Service Type</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
              >
                <option>General Inquiry</option>
                <option>Branding Project</option>
                <option>Web Design</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Message</label>
              <textarea 
                rows={4}
                required
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
                placeholder="Tell me about your project..."
              />
            </div>

            <Button type="submit" size="lg" className="w-full" isLoading={sending} disabled={sent}>
              {sent ? <span className="flex items-center gap-2"><CheckCircle2 size={18}/> Message Sent</span> : 'Send Message'}
            </Button>
          </form>
        </div>
      </section>

      <footer className="py-8 border-t border-border bg-background text-center text-sm text-zinc-600">
        <p>&copy; {new Date().getFullYear()} Mikhail Portfolio. All rights reserved.</p>
      </footer>
    </div>
  );
};