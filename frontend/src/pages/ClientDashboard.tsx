import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, AlertCircle, FileText, UploadCloud, Clock, Send, Lock, CreditCard, Sparkles, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ area: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [payingAdvance, setPayingAdvance] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  const [project, setProject] = useState<any>({
    title: "Web & Mobile App Project",
    status: "Active",
    totalBudget: 25000,
    advancePercentage: 20,
    advanceAmount: 5000,
    advancePaid: false,
    finalPaid: false,
    clientPortalApproved: true,
    milestones: [],
    deliverables: [],
    paymentHistory: []
  });

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
      if (data && !data.error) {
        setProject(data);
      }
    } catch (err) {
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, []);

  const handlePayAdvance = async () => {
    setPayingAdvance(true);
    const token = localStorage.getItem('client_token');
    const advanceAmount = project.advanceAmount || (project.totalBudget ? Math.round(project.totalBudget * 0.2) : 5000);

    try {
      console.log(`[Client Portal] Initiating 20% advance payment of ₹${advanceAmount}...`);
      const res = await fetch('/api/client/confirm-advance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          amount: advanceAmount,
          paymentMethod: 'UPI / Online Razorpay',
          transactionId: `PAY_ADV_${Date.now()}`
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        console.log('[Client Portal] Advance payment confirmed! Project workspace unlocked.');
        setProject(data.project);
        setPaymentSuccessMsg('20% Advance Payment received! Your project dashboard is now fully unlocked.');
      } else {
        alert(data.error || 'Payment processing error. Please try again.');
      }
    } catch (err) {
      console.error('[Client Portal] Advance payment error:', err);
      alert('Unable to process payment. Please try again.');
    } finally {
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

  const totalBudget = project.totalBudget || 25000;
  const advanceAmount = project.advanceAmount || Math.round(totalBudget * 0.2);
  const remainingAmount = totalBudget - advanceAmount;

  if (loading) {
    return (
      <div className="py-20 text-center text-apple-gray-400">
        Loading project workspace...
      </div>
    );
  }

  // If 20% advance is not yet paid, present the 20% Booking & Unlock Gate
  if (!project.advancePaid) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-6">
        {paymentSuccessMsg && (
          <div className="p-4 rounded-2xl bg-apple-green/10 border border-apple-green/20 text-apple-green font-medium text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-apple-blue/10 text-apple-blue text-[13px] font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Admin Approved • Project Onboarding</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-apple-black dark:text-white">
            {project.title}
          </h1>
          <p className="text-[15px] sm:text-[16px] text-apple-gray-500 dark:text-apple-gray-400 max-w-xl mx-auto">
            Your project has been approved by the administrator. To officially kick off development and unlock your live project dashboard, please confirm the 20% initial advance payment.
          </p>
        </div>

        {/* 20% Advance Breakdown Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6 sm:p-8 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-md space-y-6">
            <h3 className="text-[18px] sm:text-[20px] font-bold text-apple-black dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-apple-blue" />
              <span>Project Commercials & Booking</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-apple-gray-50 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A]">
              <div>
                <span className="text-[12px] text-apple-gray-400 font-medium uppercase tracking-wider block mb-1">Total Budget</span>
                <span className="text-[20px] font-bold text-apple-black dark:text-white">₹{totalBudget.toLocaleString('en-IN')}</span>
              </div>
              <div className="sm:border-l sm:border-r border-apple-gray-200 dark:border-[#38383A] sm:px-4">
                <span className="text-[12px] text-apple-blue font-semibold uppercase tracking-wider block mb-1">20% Booking Advance</span>
                <span className="text-[22px] font-extrabold text-apple-blue">₹{advanceAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[12px] text-apple-gray-400 font-medium uppercase tracking-wider block mb-1">Balance Due on Delivery</span>
                <span className="text-[20px] font-bold text-apple-gray-600 dark:text-apple-gray-300">₹{remainingAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-3 text-[14px]">
              <h4 className="font-semibold text-apple-black dark:text-white">What is unlocked upon 20% advance payment:</h4>
              <ul className="space-y-2 text-apple-gray-600 dark:text-apple-gray-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-apple-green shrink-0" />
                  <span>Real-time milestone tracking & sprint schedules</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-apple-green shrink-0" />
                  <span>Live staging and demo access preview</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-apple-green shrink-0" />
                  <span>Interactive change request & revision desk</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle className="h-4 w-4 text-apple-green shrink-0" />
                  <span>Secure deliverables vault & source code releases</span>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <Button 
                onClick={handlePayAdvance} 
                className="w-full h-13 rounded-2xl text-[16px] font-bold gap-2 shadow-lg shadow-apple-blue/20"
                isLoading={payingAdvance}
              >
                <span>Pay 20% Advance (₹{advanceAmount.toLocaleString('en-IN')})</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-[12px] text-center text-apple-gray-400 mt-2.5">
                Instant UPI, Cards, NetBanking supported via Razorpay / Direct Gateway
              </p>
            </div>
          </Card>

          {/* Quick Scope Preview Card */}
          <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] flex flex-col justify-between space-y-6">
            <div>
              <div className="h-10 w-10 rounded-xl bg-apple-blue/10 flex items-center justify-center text-apple-blue mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-[16px] text-apple-black dark:text-white mb-2">
                100% Milestone Guarantee
              </h4>
              <p className="text-[13px] text-apple-gray-500 dark:text-apple-gray-400 leading-relaxed">
                Work begins immediately following your advance confirmation. Remaining 80% is payable only upon final milestone review and satisfaction.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-apple-gray-50 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[12px] text-apple-gray-500 space-y-1">
              <div><strong>Client Phone:</strong> +91 {project.clientPhone || 'Registered'}</div>
              <div><strong>Status:</strong> Awaiting Initial Advance</div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If 20% advance is paid, render full client dashboard
  return (
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
                    No milestones scheduled yet. Your project lead will add milestones shortly.
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
          <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight mb-2 text-apple-black dark:text-white">
            Change Request & Feedback
          </h2>
          <p className="text-[14px] text-apple-gray-500 mb-6">
            Submit revisions, scope adjustments, or design edits directly to the development team.
          </p>
          
          {feedbackSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-12 w-12 text-apple-green mx-auto" />
              <h3 className="text-[18px] font-semibold text-apple-black dark:text-white">Feedback Submitted</h3>
              <p className="text-[14px] text-apple-gray-500 max-w-sm mx-auto">
                Your change request has been recorded and assigned to the development lead.
              </p>
              <Button variant="outline" onClick={() => setFeedbackSubmitted(false)} className="rounded-xl text-[13px]">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-5">
              <div>
                <label className="block text-[14px] font-medium mb-1.5 text-apple-black dark:text-white">
                  Page URL / Area
                </label>
                <Input 
                  placeholder="e.g. Home page banner or Checkout screen" 
                  value={feedbackForm.area}
                  onChange={e => setFeedbackForm({...feedbackForm, area: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-[14px] font-medium mb-1.5 text-apple-black dark:text-white">
                  Feedback Description
                </label>
                <textarea 
                  className="flex min-h-[120px] w-full rounded-xl border border-apple-gray-300 bg-white px-3.5 py-2.5 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue dark:border-[#38383A] dark:bg-[#1C1C1E] dark:text-white leading-relaxed"
                  placeholder="Describe what needs to be changed..."
                  value={feedbackForm.description}
                  onChange={e => setFeedbackForm({...feedbackForm, description: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-xl h-11 text-[14px] gap-2">
                <Send className="h-4 w-4" /> Submit Feedback
              </Button>
            </form>
          )}
        </Card>
      )}

      {/* Tab: Vault */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
           <div>
             <h2 className="text-[20px] sm:text-[24px] font-bold tracking-tight mb-1 text-apple-black dark:text-white">
               Deliverables Vault
             </h2>
             <p className="text-[14px] text-apple-gray-500">
               Project builds, designs, assets, and source releases.
             </p>
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
                        <p className="text-[12px] text-apple-gray-500">Deliverable package</p>
                      </div>
                    </div>
                    {item.locked && !project.finalPaid ? (
                      <div className="flex items-center text-[13px] text-apple-orange gap-1.5 font-medium bg-apple-orange/10 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Handover Balance Required</span>
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
                 Deliverables will appear here as each milestone is completed.
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

