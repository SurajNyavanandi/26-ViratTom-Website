import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShieldCheck, Lock, AlertCircle, Sparkles } from 'lucide-react';

export const ClientLogin = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter your 10-digit registered mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      console.log(`[Client Portal] Attempting direct project access for +91${cleanPhone}...`);
      const res = await fetch('/api/client/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          console.warn('[Client Portal] Non-JSON server response:', text.slice(0, 100));
          throw new Error('Server connection was interrupted. Please retry in a moment.');
        }
      }

      if (res.ok && data.token) {
        console.log('[Client Portal] Authenticated successfully. Redirecting to workspace...');
        localStorage.setItem('client_token', data.token);
        navigate('/client');
      } else {
        console.warn('[Client Portal] Access rejected:', data.error);
        setError(data.error || 'No active project is associated with this number. Please contact your administrator.');
      }
    } catch (err: any) {
      console.error('[Client Portal] Network error during sign-in:', err);
      setError(err?.message || 'Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-apple-black text-apple-black dark:text-white">
      {/* Responsive Top Bar */}
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[13px] font-medium text-apple-gray-600 hover:text-black dark:text-apple-gray-300 dark:hover:text-white transition-all shadow-2xs hover:scale-102"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md p-6 sm:p-8 border border-apple-gray-200 dark:border-[#38383A] shadow-lg rounded-3xl">
          <div className="text-center mb-6 sm:mb-8">
            <div className="h-14 w-14 rounded-2xl bg-apple-blue/10 flex items-center justify-center text-apple-blue mx-auto mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight">Client Project Portal</h1>
            <p className="text-[14px] text-apple-gray-500 dark:text-apple-gray-400 mt-2">
              Enter your registered mobile number to access your active project, track progress, and manage deliverables.
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[14px] font-semibold mb-2">Registered Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-apple-gray-400 font-semibold">
                  +91
                </span>
                <Input 
                  type="tel" 
                  required
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className="pl-14 rounded-xl h-12 text-[16px] font-medium"
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                    if (error) setError('');
                  }}
                />
              </div>

              {/* Demo test quick chips */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[12px] text-apple-gray-500">
                <span className="text-[11px] text-apple-gray-400">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setPhone('9876543210');
                    if (error) setError('');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-apple-gray-100 dark:bg-[#2C2C2E] hover:bg-apple-gray-200 dark:hover:bg-[#38383A] text-apple-black dark:text-white font-mono text-[11px] cursor-pointer transition-colors"
                >
                  9876543210 (Demo Client)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhone('9666635009');
                    if (error) setError('');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-apple-gray-100 dark:bg-[#2C2C2E] hover:bg-apple-gray-200 dark:hover:bg-[#38383A] text-apple-black dark:text-white font-mono text-[11px] cursor-pointer transition-colors"
                >
                  9666635009 (Suraj Project)
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-apple-red/10 border border-apple-red/20 text-apple-red text-[13px] text-left flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl h-12 text-[15px] font-semibold" isLoading={loading}>
              Access Project Workspace
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-apple-gray-200 dark:border-[#38383A] text-center">
            <p className="text-[12px] text-apple-gray-400">
              Only numbers approved by the administrator can access client project workspaces.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

