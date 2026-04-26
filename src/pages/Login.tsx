import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login({ onSignUp }: { onSignUp: () => void }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Welcome back to CART$Y Vendor!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="w-full max-w-[450px]">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent mb-4">Vendor Access</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none mb-4">
              Sign In
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Manage your architectural wardrobe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-mono text-sm placeholder:text-muted-foreground/30"
                  placeholder="vendor@luxe.com"
                  required
                />
              </div>

              <div className="group relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground group-focus-within:text-accent transition-colors">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-mono text-sm placeholder:text-muted-foreground/30"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-foreground text-background font-mono text-[11px] uppercase tracking-[0.3em] py-5 flex items-center justify-center gap-3 group hover:bg-accent hover:text-background transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Enter Portal'}
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>
          </form>
          <div className="mt-12 text-center space-y-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Don't have a vendor account?
            </p>
            <button
              onClick={onSignUp}
              className="font-mono text-[10px] uppercase tracking-widest text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-all bg-transparent"
            >
              Request Access
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
