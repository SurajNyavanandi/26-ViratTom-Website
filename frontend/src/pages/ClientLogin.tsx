import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { sanitizePhone } from '@/lib/utils';

export const ClientLogin = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = sanitizePhone(phone);
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
          if (res.status === 403 || res.status === 404) {
            data = { error: 'No active project is registered under this phone number. Please submit an inquiry or contact the developer.' };
          } else {
            data = { error: `Server error (${res.status}). Please try again in a moment.` };
          }
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
      setError(err?.message || 'Unable to connect to the server. Please check your connection and try again.');
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
            <h1 className="text-[22px] sm:text-[26px] font-bold tracking-tight">Client Portal</h1>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[14px] font-medium mb-2">Mobile Number</label>
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
                    setPhone(sanitizePhone(e.target.value));
                    if (error) setError('');
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-apple-red/10 border border-apple-red/20 text-apple-red text-[13px] text-left flex items-start gap-2.5 leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl h-12 text-[15px] font-semibold" isLoading={loading}>
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

