import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ShoppingBag, MapPin, User, Phone, Calendar, Clock, CheckCircle2, Truck, Loader2, Search } from 'lucide-react';

interface OrderItemWithDetails {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: string;
  size: string;
  created_at: string;
  product: {
    name: string;
    image: string;
    price: string;
    quantity: number; // Stock left
  };
  order: {
    status: string;
    shipping_address: string;
    full_name: string;
    phone: string;
    created_at: string;
  };
}

export default function Orders() {
  const { user } = useAuth();
  const [orderItems, setOrderItems] = useState<OrderItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  async function fetchOrders() {
    setLoading(true);
    try {
      // 1. Fetch this vendor's products
      const { data: myProducts, error: productsError } = await supabase
        .from('products')
        .select('id, name, image, price, quantity')
        .eq('vendor_id', user?.id);

      if (productsError) throw productsError;

      if (!myProducts || myProducts.length === 0) {
        setOrderItems([]);
        setLoading(false);
        return;
      }

      const productMap = new Map(myProducts.map(p => [p.id, p]));
      const productIds = myProducts.map(p => p.id);

      // 2. Fetch order items for these products
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          product_id,
          quantity,
          price_at_time,
          size,
          created_at
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      if (!items || items.length === 0) {
        setOrderItems([]);
        setLoading(false);
        return;
      }

      // 3. Fetch parent order details for these order items
      const orderIds = Array.from(new Set(items.map(item => item.order_id)));
      
      const { data: parentOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, status, shipping_address, full_name, phone, created_at')
        .in('id', orderIds);

      if (ordersError) throw ordersError;

      const orderMap = new Map(parentOrders?.map(o => [o.id, o]) || []);

      // 4. Combine into complete structured objects
      const combinedData: OrderItemWithDetails[] = items
        .map(item => {
          const product = productMap.get(item.product_id);
          const order = orderMap.get(item.order_id);
          return {
            ...item,
            product: {
              name: product?.name || 'Unknown Product',
              image: product?.image || '',
              price: product?.price || item.price_at_time,
              quantity: product?.quantity ?? 0
            },
            order: {
              status: order?.status || 'placed',
              shipping_address: order?.shipping_address || 'No Address Provided',
              full_name: order?.full_name || 'Anonymous Customer',
              phone: order?.phone || 'N/A',
              created_at: order?.created_at || item.created_at
            }
          };
        })
        .filter(item => item.order !== undefined);

      setOrderItems(combinedData);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load active orders');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      
      // Update local state
      setOrderItems(prev => prev.map(item => {
        if (item.order_id === orderId) {
          return {
            ...item,
            order: {
              ...item.order,
              status: newStatus
            }
          };
        }
        return item;
      }));
    } catch (err: any) {
      toast.error(`Update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'processing':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-accent/10 text-accent border-accent/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 size={12} className="text-emerald-400" />;
      case 'shipped':
        return <Truck size={12} className="text-blue-400" />;
      case 'processing':
        return <Loader2 size={12} className="text-amber-400 animate-spin" />;
      default:
        return <Clock size={12} className="text-accent" />;
    }
  };

  const filteredItems = orderItems.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = 
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.order.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.order.shipping_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
          <h1 className="text-5xl font-display font-bold uppercase tracking-tight mb-2">Acquisition Orders</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.2em]">Live customer requests & dispatch hub</p>
        </div>
      </header>

      {/* Filter and search toolbar */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-card/5 border-border border p-6">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={16} />
          <input 
            type="text"
            placeholder="SEARCH ORDERS (PRODUCT, NAME, ADDRESS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-border py-2 pl-12 pr-4 outline-none focus:border-accent font-mono text-[11px] uppercase tracking-widest placeholder:text-muted-foreground/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['all', 'processing', 'shipped', 'delivered'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 border font-mono text-[9px] uppercase tracking-widest transition-all ${
                statusFilter === status 
                  ? 'bg-accent text-background border-accent font-bold' 
                  : 'border-border hover:bg-border'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="space-y-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="border border-border bg-card/10 hover:border-accent/30 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 overflow-hidden"
            >
              {/* Product Info Column */}
              <div className="lg:col-span-4 p-8 border-b lg:border-b-0 lg:border-r border-border flex gap-6 bg-card/5">
                <div className="w-24 h-32 border border-border overflow-hidden shrink-0 grayscale hover:grayscale-0 transition-all duration-500">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-tight mb-1">{item.product.name}</h3>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Size: <span className="text-foreground font-bold">{item.size}</span>
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-1">
                      Qty Ordered: <span className="text-foreground font-bold">{item.quantity}</span>
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Valuation at placement</p>
                    <div className="text-accent font-bold text-sm tracking-tighter">{item.price_at_time}</div>
                  </div>
                </div>
              </div>

              {/* Customer and Shipping Column */}
              <div className="lg:col-span-5 p-8 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={14} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Purchaser</p>
                      <p className="text-xs uppercase font-bold tracking-wider">{item.order.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone size={14} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Contact details</p>
                      <p className="text-xs font-mono">{item.order.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={14} className="text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Destination Address</p>
                      <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide leading-relaxed">{item.order.shipping_address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} className="text-muted-foreground" />
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                      {new Date(item.order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-muted-foreground" />
                    <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                      {new Date(item.order.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Action Column */}
              <div className="lg:col-span-3 p-8 flex flex-col justify-between gap-6 bg-card/5">
                <div>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Order Status</p>
                  <div className={`flex items-center gap-2 px-3 py-1.5 border w-fit uppercase font-mono text-[9px] tracking-widest font-bold ${getStatusBadgeClass(item.order.status)}`}>
                    {getStatusIcon(item.order.status)}
                    <span>{item.order.status}</span>
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mt-4">
                    Current stock left: <span className={item.product.quantity <= 3 ? "text-destructive font-bold" : "text-foreground font-bold"}>{item.product.quantity} units</span>
                  </div>
                </div>

                {item.order.status.toLowerCase() !== 'delivered' && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">Change state</p>
                    {item.order.status.toLowerCase() === 'processing' && (
                      <button
                        onClick={() => handleUpdateStatus(item.order_id, 'shipped')}
                        disabled={updatingId === item.order_id}
                        className="w-full bg-foreground text-background py-2.5 font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-accent transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updatingId === item.order_id ? <Loader2 size={12} className="animate-spin" /> : <Truck size={12} />}
                        Dispatch Order
                      </button>
                    )}
                    {item.order.status.toLowerCase() === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(item.order_id, 'delivered')}
                        disabled={updatingId === item.order_id}
                        className="w-full bg-emerald-500 text-background py-2.5 font-mono text-[9px] uppercase tracking-widest font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updatingId === item.order_id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Complete Delivery
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border p-24 text-center bg-card/5">
          <div className="w-16 h-16 border border-border mx-auto mb-8 flex items-center justify-center text-muted-foreground/20">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-2">No Acquisitions Found</h2>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            {statusFilter !== 'all' || searchQuery ? 'No items match your active filters' : 'Orders placed for your curated catalog will appear here'}
          </p>
        </div>
      )}
    </div>
  );
}
