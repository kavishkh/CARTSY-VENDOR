import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import { LayoutGrid, Package, PlusCircle, LogOut, Settings, Bell, User as UserIcon, ShoppingBag } from 'lucide-react';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [productToEdit, setProductToEdit] = useState<any | null>(null);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' 
      ? <Login onSignUp={() => setAuthMode('signup')} /> 
      : <Signup onSignIn={() => setAuthMode('login')} />;
  }

  const navigateTo = (page: string) => {
    setActivePage(page);
    setProductToEdit(null);
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-mono">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col pt-12 shrink-0 bg-background sticky top-0 h-screen overflow-y-auto">
        <div className="px-8 pb-8 border-b border-border mb-8">
          <div className="font-display text-2xl font-bold tracking-tight text-accent">CART$Y</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Vendor Portal</div>
        </div>

        <nav className="flex-1">
          <div className="px-8 text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-4">Main Menu</div>
          <button 
            className={`w-full flex items-center gap-3 px-8 py-3 text-sm transition-all text-left ${activePage === 'dashboard' ? 'text-accent border-r-2 border-accent bg-accent/10' : 'text-muted-foreground hover:bg-border/50 hover:text-foreground'}`}
            onClick={() => navigateTo('dashboard')}
          >
            <LayoutGrid size={16} /> Dashboard
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-8 py-3 text-sm transition-all text-left ${activePage === 'products' || activePage === 'edit-product' ? 'text-accent border-r-2 border-accent bg-accent/10' : 'text-muted-foreground hover:bg-border/50 hover:text-foreground'}`}
            onClick={() => navigateTo('products')}
          >
            <Package size={16} /> My Inventory
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-8 py-3 text-sm transition-all text-left ${activePage === 'orders' ? 'text-accent border-r-2 border-accent bg-accent/10' : 'text-muted-foreground hover:bg-border/50 hover:text-foreground'}`}
            onClick={() => navigateTo('orders')}
          >
            <ShoppingBag size={16} /> My Orders
          </button>
          <button 
            className={`w-full flex items-center gap-3 px-8 py-3 text-sm transition-all text-left ${activePage === 'add-product' ? 'text-accent border-r-2 border-accent bg-accent/10' : 'text-muted-foreground hover:bg-border/50 hover:text-foreground'}`}
            onClick={() => navigateTo('add-product')}
          >
            <PlusCircle size={16} /> Add Product
          </button>

          <div className="px-8 text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-8 mb-4">Store Management</div>
          <button className="w-full flex items-center gap-3 px-8 py-3 text-sm text-left text-muted-foreground hover:bg-border/50 hover:text-foreground transition-all">
            <Bell size={16} /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-8 py-3 text-sm text-left text-muted-foreground hover:bg-border/50 hover:text-foreground transition-all">
            <Settings size={16} /> Store Settings
          </button>
        </nav>

        <div className="mt-8 pt-8 border-t border-border px-8 pb-8">
          <button className="flex items-center gap-3 text-sm text-destructive hover:text-destructive/80 transition-all font-mono" onClick={signOut}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto max-h-screen">
        <header className="flex justify-end mb-12 items-center">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-foreground">{user.email?.split('@')[0]}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Verified Vendor</div>
            </div>
            <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center bg-card">
              <UserIcon size={18} className="text-accent" />
            </div>
          </div>
        </header>

        {activePage === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
        {activePage === 'products' && (
          <ProductList 
            onEdit={(product) => {
              setProductToEdit(product);
              setActivePage('edit-product');
            }} 
          />
        )}
        {activePage === 'orders' && <Orders />}
        {activePage === 'add-product' && <AddProduct onBack={() => navigateTo('dashboard')} />}
        {activePage === 'edit-product' && (
          <AddProduct 
            productToEdit={productToEdit} 
            onBack={() => navigateTo('products')} 
          />
        )}
      </main>
    </div>
  );
}

import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster theme="dark" position="bottom-right" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
}

export default App;
