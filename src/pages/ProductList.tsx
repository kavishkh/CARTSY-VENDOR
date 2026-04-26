import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, Edit, ExternalLink, MoreVertical, LayoutGrid, List as ListIcon, X, Filter } from 'lucide-react';

export default function ProductList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  async function fetchProducts() {
    setLoading(true);
    // Fetch all products to ensure "both databases look same"
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load pieces');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the collective?`)) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error removing piece');
    } else {
      toast.success(`${name} removed successfully`);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-5xl font-display font-bold uppercase tracking-tight mb-2">Inventory Archive</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em]">Curation of your piece history</p>
        </div>
        
        <div className="flex items-center gap-4 border border-border p-1 bg-card/10">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-accent text-background' : 'hover:bg-border'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 transition-all ${viewMode === 'list' ? 'bg-accent text-background' : 'hover:bg-border'}`}
          >
            <ListIcon size={18} />
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-card/5 border-border border p-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={16} />
          <input 
            type="text"
            placeholder="SEARCH CATALOGUE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-border py-2 pl-12 pr-4 outline-none focus:border-accent font-mono text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest italic font-bold">
            Displaying {filteredProducts.length} of {products.length} pieces
          </div>
          <button className="flex items-center gap-2 border border-border px-4 py-2 text-[10px] uppercase font-mono tracking-widest hover:bg-border transition-all">
            <Filter size={12} /> Filter
          </button>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((p) => (
              <div key={p.id} className="group border border-border bg-card/20 hover:border-accent/40 transition-all duration-500 overflow-hidden relative">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 pointer-events-none group-hover:pointer-events-auto">
                    {p.vendor_id === user?.id ? (
                      <>
                        <button 
                          onClick={() => handleDelete(p.id, p.name)}
                          className="w-10 h-10 bg-destructive text-white flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button className="w-10 h-10 bg-accent text-background flex items-center justify-center hover:scale-110 transition-transform pointer-events-auto">
                          <Edit size={18} />
                        </button>
                      </>
                    ) : (
                      <div className="bg-background/80 px-4 py-2 font-mono text-[9px] uppercase tracking-widest text-foreground pointer-events-auto">
                        Global Piece (Read Only)
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="text-[9px] font-mono uppercase tracking-[0.3em] bg-accent text-background px-3 py-1 font-bold">
                      {p.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-tight truncate">{p.name}</h3>
                    <div className="text-accent font-bold text-sm tracking-tighter">{p.price}</div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest italic">{p.gender} collection</span>
                    <button className="text-muted-foreground hover:text-accent transition-colors">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border overflow-hidden bg-card/5">
            <table className="w-full text-left font-mono">
              <thead className="bg-border/30 border-b border-border text-[10px] uppercase tracking-[0.2em] font-bold">
                <tr>
                  <th className="px-8 py-4">Piece</th>
                  <th className="px-8 py-4">Category</th>
                  <th className="px-8 py-4">Valuation</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-border/10 transition-all group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 border border-border grayscale group-hover:grayscale-0 transition-all">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="font-bold uppercase tracking-tight">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 uppercase tracking-widest text-[10px]">{p.category}</td>
                    <td className="px-8 py-4 font-bold text-accent">{p.price}</td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="uppercase text-[9px] tracking-widest">Active</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                       <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         {p.vendor_id === user?.id ? (
                           <>
                             <button className="p-2 hover:text-accent transition-colors"><Edit size={16} /></button>
                             <button onClick={() => handleDelete(p.id, p.name)} className="p-2 hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                           </>
                         ) : (
                           <span className="text-[9px] font-mono text-muted-foreground uppercase py-2">Read Only</span>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="border border-dashed border-border p-24 text-center bg-card/5">
          <div className="w-16 h-16 border border-border mx-auto mb-8 flex items-center justify-center text-muted-foreground/20">
            <LayoutGrid size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">No items found in your archive</h2>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-8">Refine your search or start a new curation</p>
          <button className="bg-foreground text-background px-8 py-4 font-mono text-[11px] uppercase tracking-widest hover:bg-accent transition-all font-bold">
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
