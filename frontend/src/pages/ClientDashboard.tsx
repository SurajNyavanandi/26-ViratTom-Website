import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, AlertCircle, FileText, Clock, Send, ArrowRight, LogOut, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { ClientProject } from '@/types';
import { formatCurrency } from '@/lib/utils';

export const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ area: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [payingAdvance, setPayingAdvance] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  const [project, setProject] = useState<ClientProject | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    navigate('/client-login');
  };

  const fetchProject = async () => {
    const token = localStorage.getItem('client_token');
    try {
      const res = await fetch('/api/client/project', {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      });
      if (res.status === 401) {
        localStorage.removeItem('client_token');
        window.location.href = '/client-login';
        return;
      }
      const data = await res.json().catch(() => null);
      if (data && !data.error && data.id) {
        setProject(data);
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error("Error fetching project:", err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('client_token');
    fetch('/api/client/project', {
      headers: {
        'Authorization': `Bearer ${token || ''}`
      }
    })
      .then(async res => {
        if (res.status === 401) {
          localStorage.removeItem('client_token');
          window.location.href = '/client-login';
          return;
        }
        const data = await res.json().catch(() => null);
        if (isMounted) {
          if (data && !data.error && data.id) {
            setProject(data);
          } else {
            setProject(null);
          }
        }
      })
      .catch(err => {
        console.error("Error fetching project:", err);
        if (isMounted) setProject(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayAdvance = async () => {
    if (!project) return;
    setPayingAdvance(true);
    const token = localStorage.getItem('client_token');
    const advanceAmount = project.advanceAmount || (project.totalBudget ? Math.round(project.totalBudget * 0.2) : 5000);

    try {
      console.log(`[Client Portal] Requesting Razorpay Order for 20% advance (₹${advanceAmount})...`);
      const orderRes = await fetch('/api/client/create-razorpay-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        }
      });
      const orderData = await orderRes.json().catch(() => ({}));

      if (!orderRes.ok || !orderData.success) {
        console.warn('[Razorpay Order] Server returned order issue:', orderData);
        const proceedDirect = window.confirm(
          `Razorpay Gateway Notice:\n${orderData.error || 'Razorpay order creation could not be initialized.'}\n\nWould you like to simulate direct advance booking confirmation for testing?`
        );
        if (proceedDirect) {
          const directRes = await fetch('/api/client/confirm-advance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token || ''}`
            },
            body: JSON.stringify({
              amount: advanceAmount,
              paymentMethod: 'Direct Payment / Gateway Simulation',
              transactionId: `TXN_${Date.now()}`
            })
          });
          const directData = await directRes.json();
          if (directData.success && directData.project) {
            setProject(directData.project);
            setPaymentSuccessMsg('20% Advance Payment confirmed! Your project dashboard is now fully unlocked.');
          }
        }
        setPayingAdvance(false);
        return;
      }

      // Load Razorpay SDK Script if not yet loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !(window as any).Razorpay) {
        alert('Failed to load Razorpay Payment Gateway. Please check your network connection.');
        setPayingAdvance(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ViratTom',
        description: `20% Advance Booking - ${orderData.projectName || project.title}`,
        image: '/favicon.svg',
        order_id: orderData.orderId,
        handler: async function (response: any) {
          console.log('[Razorpay Modal] Payment success response received:', response);
          try {
            const verifyRes = await fetch('/api/client/verify-razorpay-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token || ''}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setProject(verifyData.project);
              setPaymentSuccessMsg('20% Advance Payment verified via Razorpay! Your project workspace is now fully unlocked.');
            } else {
              alert(verifyData.error || 'Payment signature verification failed.');
            }
          } catch (e) {
            console.error('[Razorpay Verification Network Error]:', e);
            alert('Failed to verify payment with server.');
          } finally {
            setPayingAdvance(false);
          }
        },
        prefill: {
          name: orderData.clientName || project.clientName || '',
          contact: (orderData.clientPhone || project.clientPhone || '').replace(/\D/g, '').slice(-10),
          email: orderData.clientEmail || project.clientEmail || ''
        },
        theme: {
          color: '#0071E3'
        },
        modal: {
          ondismiss: function () {
            console.log('[Razorpay Modal] Dismissed by client.');
            setPayingAdvance(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('[Razorpay Payment Failed]', response.error);
        alert(`Payment failed: ${response.error?.description || 'Transaction was declined.'}`);
        setPayingAdvance(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('[Client Portal] Advance payment error:', err);
      alert(err.message || 'Unable to process payment. Please try again.');
      setPayingAdvance(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('client_token');
    try {
      const res = await fetch('/api/client/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({ text: `[${feedbackForm.area}] ${feedbackForm.description}` })
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (e) {
      console.error(e);
    }
    setFeedbackSubmitted(true);
  };

  const renderDashboardHeader = () => (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border-b border-apple-gray-200 dark:border-[#38383A]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            to="/" 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-apple-gray-100 dark:bg-[#2C2C2E] border border-apple-gray-200 dark:border-[#38383A] text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white transition-all cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="uppercase tracking-widest text-[13px] sm:text-[14px] font-semibold text-apple-black dark:text-white">
            VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span>
            <span className="ml-2 px-2 py-0.5 text-[10px] rounded-md bg-apple-blue/10 text-apple-blue font-bold uppercase tracking-wider">Client</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium text-apple-red hover:bg-apple-red/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-apple-black text-apple-black dark:text-white antialiased">
        {renderDashboardHeader()}
        <div className="flex-1 flex items-center justify-center py-20 text-center text-apple-gray-400">
          Loading project workspace from server...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-apple-black text-apple-black dark:text-white antialiased">
        {renderDashboardHeader()}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full py-16 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-apple-gray-100 dark:bg-[#2C2C2E] flex items-center justify-center mx-auto text-apple-gray-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-[20px] font-bold text-apple-black dark:text-white">No Project Found</h2>
            <p className="text-[14px] text-apple-gray-500">
              No active project is linked to this mobile number.
            </p>
            <Button onClick={() => window.location.href = '/'}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const totalBudget = project.totalBudget || 0;
  const advanceAmount = project.advanceAmount || Math.round(totalBudget * 0.2);
  const remainingAmount = Math.max(0, totalBudget - advanceAmount);

  // If 20% advance is not yet paid, present the 20% Booking & Unlock Gate
  if (!project.advancePaid) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-apple-black text-apple-black dark:text-white antialiased">
        {renderDashboardHeader()}
        <div className="max-w-2xl w-full mx-auto space-y-6 py-8 px-4 sm:px-6">
        {paymentSuccessMsg && (
          <div className="p-4 rounded-2xl bg-apple-green/10 border border-apple-green/20 text-apple-green font-medium text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-apple-black dark:text-white">
            {project.title}
          </h1>
          <p className="text-[15px] text-apple-gray-500 dark:text-apple-gray-400">
            20% advance booking required to activate workspace.
          </p>
        </div>

        {/* 20% Advance Breakdown Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-md space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-apple-gray-50 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A]">
            <div>
              <span className="text-[12px] text-apple-gray-400 font-medium uppercase tracking-wider block mb-1">Total</span>
              <span className="text-[20px] font-bold text-apple-black dark:text-white">₹{totalBudget.toLocaleString('en-IN')}</span>
            </div>
            <div className="sm:border-l sm:border-r border-apple-gray-200 dark:border-[#38383A] sm:px-4">
              <span className="text-[12px] text-apple-blue font-semibold uppercase tracking-wider block mb-1">20% Advance</span>
              <span className="text-[22px] font-extrabold text-apple-blue">₹{advanceAmount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[12px] text-apple-gray-400 font-medium uppercase tracking-wider block mb-1">On Delivery</span>
              <span className="text-[20px] font-bold text-apple-gray-600 dark:text-apple-gray-300">₹{remainingAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button 
            onClick={handlePayAdvance} 
            className="w-full h-12 rounded-2xl text-[15px] font-bold gap-2 shadow-md shadow-apple-blue/20"
            isLoading={payingAdvance}
          >
            <span>Pay ₹{advanceAmount.toLocaleString('en-IN')} Advance</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
        </div>
      </div>
    );
  }

  // If 20% advance is paid, render full client dashboard
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-apple-black text-apple-black dark:text-white antialiased">
      {renderDashboardHeader()}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[34px] font-bold tracking-tight text-apple-black dark:text-white">
            {project.title}
          </h1>
          <p className="text-[13px] text-apple-gray-500 mt-1">
            Total Budget: ₹{totalBudget.toLocaleString('en-IN')} • 20% Advance: ₹{advanceAmount.toLocaleString('en-IN')} (Paid)
          </p>
        </div>
        <span className="self-start sm:self-auto px-3.5 py-1.5 rounded-full bg-apple-green/10 text-apple-green text-[13px] font-medium inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-apple-green" />
          {project.status || 'Active'}
        </span>
      </div>

      {/* Responsive Horizontal Tabs */}
      <div className="border-b border-apple-gray-200 dark:border-[#38383A] overflow-x-auto no-scrollbar">
        <div className="flex space-x-6 sm:space-x-8 min-w-max pb-px">
          {[
            { id: 'overview', label: 'Timeline & Milestones' },
            { id: 'billing', label: 'Billing & Payments' },
            { id: 'feedback', label: 'Change Requests' },
            { id: 'vault', label: 'Deliverables' }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-[14px] sm:text-[15px] font-medium whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id 
                  ? 'text-apple-blue border-apple-blue font-semibold' 
                  : 'text-apple-gray-500 hover:text-black dark:hover:text-white border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-apple-black dark:text-white">
              Project Milestones
            </h2>
            <Card className="p-0 overflow-hidden border border-apple-gray-200 dark:border-[#38383A]">
              <div className="divide-y divide-apple-gray-200 dark:divide-[#38383A]">
                {project.milestones && project.milestones.length > 0 ? (
                  project.milestones.map((m: any, i: number) => (
                    <div key={i} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        {m.completed ? (
                          <CheckCircle className="text-apple-green h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                        ) : (
                          <Clock className="text-apple-gray-400 h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-semibold text-[15px] sm:text-[16px] text-apple-black dark:text-white">
                            {m.task}
                          </h4>
                          <p className="text-[13px] text-apple-gray-500">
                            Target: {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[12px] sm:text-[13px] font-semibold px-2.5 py-1 rounded-full self-start sm:self-auto ${
                        m.completed 
                          ? 'bg-apple-green/10 text-apple-green' 
                          : 'bg-apple-gray-100 dark:bg-[#2C2C2E] text-apple-gray-500 dark:text-apple-gray-400'
                      }`}>
                        {m.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-apple-gray-400 text-[14px]">
                    No milestones scheduled yet.
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight mb-4 sm:mb-6 text-apple-black dark:text-white">
              Quick Actions
            </h2>
            <Card className="space-y-3 p-5 sm:p-6 border border-apple-gray-200 dark:border-[#38383A] rounded-2xl">
              <Button className="w-full rounded-xl" onClick={() => setActiveTab('feedback')}>
                Request Change / Revision
              </Button>
              <Button variant="secondary" className="w-full rounded-xl" onClick={() => setActiveTab('billing')}>
                View Invoices & Billing
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab: Billing */}
      {activeTab === 'billing' && (
        <Card className="max-w-2xl p-5 sm:p-8 rounded-3xl border border-apple-gray-200 dark:border-[#38383A]">
          <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight mb-6 text-apple-black dark:text-white">
            Billing & Invoices
          </h2>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 bg-apple-green/10 border border-apple-green/20 rounded-2xl gap-3">
              <div>
                <h4 className="font-semibold text-[15px] sm:text-[16px] text-apple-black dark:text-white">
                  20% Booking Advance (₹{advanceAmount.toLocaleString('en-IN')})
                </h4>
                <p className="text-[13px] text-apple-gray-500">Confirmed & Activated</p>
              </div>
              <span className="text-apple-green font-semibold text-[14px] flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle className="h-4 w-4"/> Paid
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border border-apple-gray-200 dark:border-[#38383A] rounded-2xl gap-3">
              <div>
                <h4 className="font-semibold text-[15px] sm:text-[16px] text-apple-black dark:text-white">
                  Final Handover Balance (80% — ₹{remainingAmount.toLocaleString('en-IN')})
                </h4>
                <p className="text-[13px] text-apple-gray-500">Due upon final delivery & sign-off</p>
              </div>
              {project.finalPaid ? (
                 <span className="text-apple-green font-semibold">Paid</span>
              ) : (
                <span className="text-[13px] text-apple-gray-400 font-medium self-start sm:self-auto px-3 py-1.5 rounded-full bg-apple-gray-100 dark:bg-[#2C2C2E]">
                  Due at Handover
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Feedback */}
      {activeTab === 'feedback' && (
        <Card className="max-w-2xl p-5 sm:p-8 rounded-3xl border border-apple-gray-200 dark:border-[#38383A]">
          <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight mb-6 text-apple-black dark:text-white">
            Change Request & Feedback
          </h2>
          
          {feedbackSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-12 w-12 text-apple-green mx-auto" />
              <h3 className="text-[18px] font-semibold text-apple-black dark:text-white">Submitted</h3>
              <p className="text-[14px] text-apple-gray-500 max-w-sm mx-auto">
                Your request has been recorded.
              </p>
              <Button variant="outline" onClick={() => setFeedbackSubmitted(false)} className="rounded-xl text-[13px]">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              <div>
                <label className="block text-[14px] font-medium mb-1.5 text-apple-black dark:text-white">
                  Page / Section
                </label>
                <Input 
                  placeholder="e.g. Navigation or Checkout" 
                  value={feedbackForm.area}
                  onChange={e => setFeedbackForm({...feedbackForm, area: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium mb-1.5 text-apple-black dark:text-white">
                  Description
                </label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-xl border border-apple-gray-300 bg-white px-3.5 py-2.5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue dark:border-[#38383A] dark:bg-[#1C1C1E] dark:text-white leading-relaxed"
                  placeholder="Details of required changes..."
                  value={feedbackForm.description}
                  onChange={e => setFeedbackForm({...feedbackForm, description: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 text-[14px] gap-2">
                <Send className="h-4 w-4" /> Submit
              </Button>
            </form>
          )}
        </Card>
      )}

      {/* Tab: Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
           <div>
             <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-apple-black dark:text-white">
               Deliverables
             </h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
             {project.deliverables && project.deliverables.length > 0 ? (
               project.deliverables.map((item: any, i: number) => (
                  <Card key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4 rounded-2xl border border-apple-gray-200 dark:border-[#38383A]">
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue shrink-0">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[15px] sm:text-[16px] text-apple-black dark:text-white">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                    {item.locked && !project.finalPaid ? (
                      <div className="flex items-center text-[13px] text-apple-orange gap-1.5 font-medium bg-apple-orange/10 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Delivery Balance Required</span>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="rounded-xl text-[13px] self-start sm:self-auto">
                        Download
                      </Button>
                    )}
                  </Card>
               ))
             ) : (
               <div className="p-8 text-center text-apple-gray-400 text-[14px] col-span-2">
                 No deliverables available yet.
               </div>
             )}
           </div>
        </div>
      )}
        </div>
      </main>
    </div>
  );
};

