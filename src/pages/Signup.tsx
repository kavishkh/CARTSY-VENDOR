import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Signup({ onSignIn }: { onSignIn: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data?.session) {
        toast.success('Welcome to CART$Y Vendor!', {
          description: 'Your portal access is now active.',
        });
        window.location.reload(); // Refresh to update auth state
      } else {
        toast.success('Registration Sent', {
          description: 'Please check your email to confirm your vendor access.',
        });
        onSignIn();
      }
    } catch (error: any) {
      toast.error('Registration Failed', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="w-full max-w-[450px]">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-accent mb-4">Vendor Registration</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold uppercase tracking-tight leading-none mb-4">
              Join Portal
            </h1>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Become an architectural partner
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-8">
            <div className="space-y-6">
              <div className="group relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-mono text-sm placeholder:text-muted-foreground/30"
                  placeholder="VENDOR NAME"
                  required
                />
              </div>

              <div className="group relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-mono text-sm placeholder:text-muted-foreground/30"
                  placeholder="vendor@company.com"
                  required
                />
              </div>

              <div className="group relative">
                <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2 group-focus-within:text-accent transition-colors">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-border py-3 px-0 outline-none focus:border-accent transition-all font-mono text-sm placeholder:text-muted-foreground/30"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-foreground text-background font-mono text-[11px] uppercase tracking-[0.3em] py-5 flex items-center justify-center gap-3 group hover:bg-accent hover:text-background transition-all disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Create Account'}
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </div>
          </form>

          <div className="mt-12 text-center space-y-4">
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Already have an account?
            </p>
            <button
              onClick={onSignIn}
              className="font-mono text-[10px] uppercase tracking-widest text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-all bg-transparent"
            >
              Sign In to Portal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
