import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@hms.gov.in');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate('/');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-black">
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 z-0 scale-105 animate-subtle-zoom"
        style={{
          backgroundImage: 'url("/login-bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.5) contrast(1.1)'
        }}
      />

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 z-1 bg-gradient-to-tr from-black/80 via-black/30 to-primary/20" />

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Header Section - More Compact */}
        <div className="text-center mb-5 animate-fade-in-down w-full">
          <div className="inline-flex items-center justify-center mb-4 p-4 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/50">
            <img
              src="/Haritha_logo.svg"
              alt="Haritha Resorts Logo"
              className="h-[100px] w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            Haritha Resorts
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="h-[1px] w-6 bg-primary-foreground/30" />
            <p className="text-primary-foreground/90 font-medium text-[10px] tracking-widest uppercase">
              HMS Administration
            </p>
            <div className="h-[1px] w-6 bg-primary-foreground/30" />
          </div>
        </div>

        {/* Login Form Card - Fixed Height/Compact */}
        <div className="w-full bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/20 overflow-hidden animate-fade-in-up">
          <div className="px-8 pt-8 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-foreground/70 text-xs font-bold px-1 uppercase tracking-wider">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@hms.gov.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-secondary/50 border-transparent focus:border-primary/30 h-11 px-4 rounded-xl transition-all text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="password" className="text-foreground/70 text-xs font-bold uppercase tracking-wider">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-secondary/50 border-transparent focus:border-primary/30 h-11 px-4 rounded-xl transition-all text-sm"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-[11px] text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 animate-shake">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-[0.98] mt-2">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Portal
              </Button>
            </form>
          </div>

          {/* Demo Accounts - Grid Layout for Compactness */}
          <div className="bg-secondary/40 px-6 py-5 mt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">Quick Login (Demo)</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <div
                className="flex justify-between items-center text-[10px] p-2 bg-white/60 rounded-lg cursor-pointer hover:bg-white transition-all border border-transparent hover:border-primary/20"
                onClick={() => { setEmail('admin@hms.gov.in'); setPassword('admin123'); }}
              >
                <span className="text-muted-foreground font-medium">Administrator</span>
                <code className="text-primary font-bold">admin / admin123</code>
              </div>
              <div
                className="flex justify-between items-center text-[10px] p-2 bg-white/60 rounded-lg cursor-pointer hover:bg-white transition-all border border-transparent hover:border-primary/20"
                onClick={() => { setEmail('araku@hms.gov.in'); setPassword('password123'); }}
              >
                <span className="text-muted-foreground font-medium">Haritha Valley Resort</span>
                <code className="text-primary font-bold">araku / pass123</code>
              </div>
              <div
                className="flex justify-between items-center text-[10px] p-2 bg-white/60 rounded-lg cursor-pointer hover:bg-white transition-all border border-transparent hover:border-primary/20"
                onClick={() => { setEmail('rushikonda@hms.gov.in'); setPassword('password123'); }}
              >
                <span className="text-muted-foreground font-medium">Mayuri Hill Resort</span>
                <code className="text-primary font-bold">rushikonda / pass123</code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center animate-fade-in">
          <p className="text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold">
            © 2026 AP Tourism Department • Secure HMS v2.4
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes subtle-zoom {
          0% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1.05); }
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-subtle-zoom { animation: subtle-zoom 20s ease-in-out infinite; }
        .animate-fade-in-down { animation: fade-in-down 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out 0.1s forwards; opacity: 0; }
        .animate-fade-in { animation: fade-in 1s ease-out 0.5s forwards; opacity: 0; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        
        /* Perspective correction for zooming */
        .perspective-1000 { perspective: 1000px; }
      `}} />
    </div>
  );
}


