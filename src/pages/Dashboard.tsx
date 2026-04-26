import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Package, TrendingUp, Tag, ExternalLink, Plus, LayoutGrid, ArrowRight, RefreshCw } from 'lucide-react';
import { seedDatabase } from '../utils/seeder';

interface Stats {
  totalProducts: number;
  myProducts: number;
  categories: number;
  avgPrice: number;
}

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, myProducts: 0, categories: 0, avgPrice: 0 });
  const [isSyncing, setIsSyncing] = useState(false);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);
    
    // Fetch EVERYTHING for total stats
    const { data: allData } = await supabase.from('products').select('*');
    
    // Fetch only this vendor's products
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load dashboard data');
    } else if (allData && data) {
      const cats = new Set(data.map((p: any) => p.category));
      const prices = data.map((p: any) => {
        const val = parseInt(p.price.replace(/[₹,]/g, ''));
        return isNaN(val) ? 0 : val;
      });
      const avg = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;

      setStats({
        totalProducts: allData.length,
        myProducts: data.length,
        categories: cats.size,
        avgPrice: avg,
      });
      setRecentProducts(data.slice(0, 4));
    }
    setLoading(false);
  }

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await seedDatabase();
      if (result.count > 0) {
        toast.success(`Synced ${result.count} pieces to the database`);
        fetchDashboardData();
      } else {
        toast.info('Database already contains initial catalog');
      }
    } catch (err: any) {
      toast.error(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-display font-bold uppercase tracking-tight mb-2">Architectural Dashboard</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em]">Overview of your curated collective</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="border border-border px-6 py-3 font-mono text-[11px] uppercase tracking-widest flex items-center gap-2 hover:bg-border transition-all font-bold disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> Sync Catalog
          </button>
          <button 
            onClick={() => onNavigate('add-product')}
            className="bg-accent text-background px-6 py-3 font-mono text-[11px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all font-bold"
          >
            <Plus size={16} /> Add New Entry
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border border-border p-8 bg-card/30 backdrop-blur-sm group hover:border-accent/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <Package size={20} className="text-accent" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Inventory</span>
          </div>
          <div className="text-4xl font-bold mb-1 tracking-tighter">{stats.myProducts} / {stats.totalProducts}</div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest italic">My pieces / Total collective</p>
        </div>

        <div className="border border-border p-8 bg-card/30 backdrop-blur-sm group hover:border-accent/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <Tag size={20} className="text-accent" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Curation</span>
          </div>
          <div className="text-4xl font-bold mb-1 tracking-tighter">{stats.categories}</div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest italic">Distinct categories</p>
        </div>

        <div className="border border-border p-8 bg-card/30 backdrop-blur-sm group hover:border-accent/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <TrendingUp size={20} className="text-accent" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Valuation</span>
          </div>
          <div className="text-4xl font-bold mb-1 tracking-tighter">₹{stats.avgPrice.toLocaleString()}</div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest italic">Average piece value</p>
        </div>
      </div>

      {/* Quick Actions / Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 border border-border p-0 bg-card/10">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xs uppercase tracking-[0.3em] font-bold">Recent Acquisitions</h2>
            <button 
              onClick={() => onNavigate('products')}
              className="text-[10px] font-mono text-accent uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
            >
              View Full Archive <ArrowRight size={12} />
            </button>
          </div>
          
          <div className="divide-y divide-border/50">
            {recentProducts.length > 0 ? (
              recentProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-border/20 transition-all group">
                  <div className="w-12 h-12 border border-border overflow-hidden shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate uppercase">{p.name}</div>
                    <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.1em]">{p.category}</div>
                  </div>
                  <div className="text-sm font-bold text-accent">{p.price}</div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4 italic text-balance">
                  Your architectural archive is currently empty. Begin adding pieces to see your collection analytics.
                </p>
                <button 
                  onClick={() => onNavigate('add-product')}
                  className="text-xs font-mono text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-all uppercase tracking-widest"
                >
                  Start Listing
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="border border-border p-8 bg-accent text-background flex flex-col justify-between h-full group">
          <div>
            <LayoutGrid size={32} className="mb-6 opacity-80" />
            <h2 className="text-3xl font-display font-bold uppercase leading-none mb-4 tracking-tighter">Live Concept Store</h2>
            <p className="text-[11px] font-mono uppercase tracking-widest leading-relaxed opacity-90">
              Your curated pieces are synchronized in real-time with the main collective archive at CART$Y.in.
            </p>
          </div>
          <div className="pt-8">
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold mb-4">Status: Operating</div>
            <a 
              href="http://localhost:8080" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest font-bold border-b-2 border-background w-fit pb-1 group-hover:gap-4 transition-all"
            >
              Public Link <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
