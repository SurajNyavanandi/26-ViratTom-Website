import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Send, 
  ArrowRight, 
  LogOut, 
  ArrowLeft,
  CreditCard,
  ExternalLink,
  Globe,
  MessageSquare,
  HelpCircle,
  Check,
  Sparkles
} from 'lucide-react';
import type { ClientProject } from '@/types';
import { Validation } from '@/utils/validation';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { apiUrl, formatCurrency } from '@/utils/utils';

interface ProjectQueryItem {
  id: string | number;
  text: string;
  response?: string;
  status: 'pending' | 'fixed' | 'current';
  createdAt: string;
}

export const ClientDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ClientProject | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  
  // Query submission state
  const [newQueryText, setNewQueryText] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [queryCategoryFilter, setQueryCategoryFilter] = useState<'all' | 'pending' | 'fixed'>('all');
  const [querySuccessNotice, setQuerySuccessNotice] = useState<string | null>(null);

  const navigate = useNavigate();

  // Shared Payment Hook
  const {
    loading: paymentProcessing,
    errorMessage: paymentError,
    successMessage: paymentSuccessMsg,
    processProjectAdvance,
  } = usePaymentMethods();

  const handleLogout = useCallback(() => {
    Validation.removeStorageItem('client_token');
    Validation.removeStorageItem('selected_project_id');
    navigate('/client-login');
  }, [navigate]);

  const loadProjects = useCallback(async (selectedId?: string) => {
    const token = localStorage.getItem('client_token');
    if (!token) {
      navigate('/client-login', { replace: true });
      return;
    }

    try {
      const projectsRes = await fetch(apiUrl('/api/client/projects'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (projectsRes.status === 401) {
        Validation.removeStorageItem('client_token');
        navigate('/client-login', { replace: true });
        return;
      }

      const projectsData = await projectsRes.json().catch(() => ({}));
      const projectList: ClientProject[] = projectsData.projects || [];
      setProjects(projectList);

      const targetId = selectedId || localStorage.getItem('selected_project_id') || projectList[0]?.id || '';
      const projectUrl = targetId ? apiUrl(`/api/client/project?projectId=${targetId}`) : apiUrl('/api/client/project');
      const projectRes = await fetch(projectUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const singleData = await projectRes.json().catch(() => null);
      if (singleData && !singleData.error && singleData.id) {
        setProject(singleData);
        localStorage.setItem('selected_project_id', singleData.id);
      } else if (projectList.length > 0) {
        setProject(projectList[0]);
        localStorage.setItem('selected_project_id', projectList[0].id);
      } else {
        setProject(null);
      }
    } catch (err) {
      console.error('Error fetching client projects:', err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSwitchProject = useCallback(
    (targetId: string) => {
      setLoading(true);
      loadProjects(targetId);
    },
    [loadProjects]
  );

  const handlePayAdvance = useCallback(() => {
    if (!project) return;
    processProjectAdvance({
      project,
      onSuccess: (updated) => {
        setProject(updated);
      },
    });
  }, [project, processProjectAdvance]);

  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueryText.trim()) return;
    setSubmittingQuery(true);
    setQuerySuccessNotice(null);

    const token = localStorage.getItem('client_token');
    try {
      const res = await fetch(apiUrl('/api/client/feedback'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ text: newQueryText.trim() }),
      });
      const data = await res.json();
      if (data.success && data.project) {
        setProject(data.project);
        setNewQueryText('');
        setQuerySuccessNotice('Your query has been sent to our admin team!');
        setTimeout(() => setQuerySuccessNotice(null), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingQuery(false);
    }
  };

  const renderDashboardHeader = () => (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md border-b border-apple-gray-200 dark:border-[#38383A]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-apple-gray-100 dark:bg-[#2C2C2E] border border-apple-gray-200 dark:border-[#38383A] text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white transition-all cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="uppercase tracking-widest text-[13px] sm:text-[14px] font-semibold text-apple-black dark:text-white">
            VI<span className="font-bold text-apple-blue">R</span>
            <span className="font-bold text-apple-blue">A</span>T TO
            <span className="font-bold text-apple-blue">M</span>
            <span className="ml-2 px-2 py-0.5 text-[10px] rounded-md bg-apple-blue/10 text-apple-blue font-bold uppercase tracking-wider">
              Client Portal
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {projects.length > 1 && (
            <div className="flex items-center gap-1.5 mr-1">
              <span className="text-[11px] font-semibold text-apple-gray-400 uppercase tracking-wider hidden md:inline">
                Project:
              </span>
              <select
                value={project?.id || ''}
                onChange={(e) => handleSwitchProject(e.target.value)}
                className="text-[12px] font-semibold px-2.5 py-1.5 rounded-xl bg-apple-gray-100 dark:bg-[#2C2C2E] border border-apple-gray-200 dark:border-[#38383A] text-apple-black dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-apple-blue"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} {p.advancePaid ? '• Active' : '• 20% Pending'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium text-apple-red hover:bg-apple-red/10 transition-colors cursor-pointer"
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
          Loading client workspace...
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
            <h2 className="text-[20px] font-semibold text-apple-black dark:text-white">No Project Found</h2>
            <p className="text-[14px] text-apple-gray-500">
              No active project is linked to this account.
            </p>
            <Button onClick={() => (window.location.href = '/')}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const totalBudget = project.totalBudget || 25000;
  const advanceAmount = project.advanceAmount || Validation.calculateAdvance(totalBudget, 20);
  const remainingAmount = Math.max(0, totalBudget - advanceAmount);

  // Extract queries / feedback items
  const rawQueries = (project.feedback || []).map((f: any) => {
    const isFixed = f.resolved || f.text.toLowerCase().includes('[resolved]') || f.text.toLowerCase().includes('[fixed]');
    return {
      id: f.id || Math.random().toString(),
      text: f.text.replace(/\[resolved\]|\[fixed\]/gi, '').trim(),
      response: f.response || (isFixed ? 'Resolved and updated on your live project.' : undefined),
      status: isFixed ? 'fixed' : 'pending',
      createdAt: f.time || 'Recently',
    } as ProjectQueryItem;
  });

  const filteredQueries = rawQueries.filter((q) => {
    if (queryCategoryFilter === 'pending') return q.status === 'pending';
    if (queryCategoryFilter === 'fixed') return q.status === 'fixed';
    return true;
  });

  // Find live link deliverable if available
  const liveDeliverable = (project.deliverables || []).find(
    (d: any) => d.url && d.url.startsWith('http') && !d.url.includes('#')
  );
  const liveUrl = liveDeliverable?.url || 'https://virattom.com';

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD] dark:bg-apple-black text-apple-black dark:text-white antialiased">
      {renderDashboardHeader()}

      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Workspace Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1C1C1E] p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-2xs">
          <div>
            <span className="text-[12px] font-semibold text-apple-blue uppercase tracking-wider block mb-1">
              {project.type || 'Custom Application'}
            </span>
            <h1 className="text-[22px] sm:text-[28px] font-semibold tracking-tight text-apple-black dark:text-white">
              {project.title}
            </h1>
            <p className="text-[13px] text-apple-gray-500 mt-1">
              Client: <strong className="text-apple-black dark:text-white font-medium">{project.clientName || 'Valued Client'}</strong> ({project.clientPhone})
            </p>
          </div>
          <div className="self-start sm:self-auto flex items-center gap-2">
            <span className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-1.5 ${
              project.advancePaid
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-amber-500/10 text-amber-600'
            }`}>
              <span className={`h-2 w-2 rounded-full ${project.advancePaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {project.advancePaid ? '20% Advance Confirmed' : '20% Advance Pending'}
            </span>
          </div>
        </div>

        {paymentSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-medium text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{paymentSuccessMsg}</span>
          </div>
        )}

        {paymentError && (
          <div className="p-4 rounded-2xl bg-apple-red/10 border border-apple-red/20 text-apple-red font-medium text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{paymentError}</span>
          </div>
        )}

        {/* SECTION 1: Payment Breakdown & Status */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-apple-blue" />
            <h2 className="text-[18px] font-semibold text-apple-black dark:text-white">
              1. Payment Breakdown &amp; Financial Status
            </h2>
          </div>

          <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] shadow-2xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-apple-gray-50 dark:bg-[#2C2C2E]/60 border border-apple-gray-200/80 dark:border-[#38383A]">
                <span className="text-[11.5px] text-apple-gray-500 uppercase tracking-wider font-semibold block mb-1">
                  Total Budget
                </span>
                <span className="text-[22px] font-bold text-apple-black dark:text-white">
                  {formatCurrency(totalBudget)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-apple-blue/5 dark:bg-apple-blue/10 border border-apple-blue/20">
                <span className="text-[11.5px] text-apple-blue uppercase tracking-wider font-semibold block mb-1">
                  20% Advance Booking
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[22px] font-bold text-apple-blue">
                    {formatCurrency(advanceAmount)}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    project.advancePaid ? 'bg-emerald-500/15 text-emerald-600' : 'bg-amber-500/15 text-amber-600'
                  }`}>
                    {project.advancePaid ? 'PAID' : 'DUE'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-apple-gray-50 dark:bg-[#2C2C2E]/60 border border-apple-gray-200/80 dark:border-[#38383A]">
                <span className="text-[11.5px] text-apple-gray-500 uppercase tracking-wider font-semibold block mb-1">
                  Balance on Handover (80%)
                </span>
                <span className="text-[22px] font-bold text-apple-gray-700 dark:text-apple-gray-300">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
            </div>

            {!project.advancePaid && (
              <Button
                onClick={handlePayAdvance}
                className="w-full h-12 rounded-2xl text-[15px] font-semibold gap-2 shadow-md shadow-apple-blue/20"
                isLoading={paymentProcessing}
                disabled={paymentProcessing}
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay {formatCurrency(advanceAmount)} Advance Now</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            )}
          </Card>
        </section>

        {/* SECTION 2: Live Deployed Link */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-apple-blue" />
            <h2 className="text-[18px] font-semibold text-apple-black dark:text-white">
              2. Live Deployed Web Application
            </h2>
          </div>

          <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Cloud Deployment
                </span>
                <h3 className="text-[16px] font-semibold text-apple-black dark:text-white">
                  {project.title} Preview URL
                </h3>
                <p className="text-[13px] text-apple-gray-500 font-mono underline truncate max-w-md">
                  {liveUrl}
                </p>
              </div>

              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-apple-black dark:bg-white text-white dark:text-apple-black hover:opacity-90 font-semibold text-[13.5px] shadow-sm transition-all shrink-0 cursor-pointer"
              >
                <span>Open Live Project</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </Card>
        </section>

        {/* SECTION 3: Project Queries */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-apple-blue" />
              <h2 className="text-[18px] font-semibold text-apple-black dark:text-white">
                3. Project Queries &amp; Support
              </h2>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-apple-gray-100 dark:bg-[#2C2C2E] p-1 rounded-xl border border-apple-gray-200/80 dark:border-[#38383A]">
              {(['all', 'pending', 'fixed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setQueryCategoryFilter(filter)}
                  className={`px-3 py-1 text-[12px] font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                    queryCategoryFilter === filter
                      ? 'bg-white dark:bg-[#1C1C1E] text-apple-black dark:text-white shadow-2xs'
                      : 'text-apple-gray-500 hover:text-apple-black dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] shadow-2xs space-y-6">
            {/* Ask query input form */}
            <form onSubmit={handleSendQuery} className="space-y-3">
              <label className="block text-[13.5px] font-semibold text-apple-black dark:text-white">
                Submit a new query or change request
              </label>
              <div className="flex gap-2">
                <Input
                  value={newQueryText}
                  onChange={(e) => setNewQueryText(e.target.value)}
                  placeholder="Type your question or query here (e.g. 'Add logo to header' or 'Update contact number')..."
                  className="flex-1 h-11 text-[13.5px] rounded-xl"
                  required
                />
                <Button
                  type="submit"
                  disabled={submittingQuery || !newQueryText.trim()}
                  isLoading={submittingQuery}
                  className="h-11 px-5 rounded-xl text-[13.5px] font-semibold gap-2 shrink-0"
                >
                  <Send className="h-4 w-4" />
                  <span>Send</span>
                </Button>
              </div>
              {querySuccessNotice && (
                <p className="text-[12.5px] font-medium text-emerald-600 flex items-center gap-1.5 animate-fade-in">
                  <Check className="h-3.5 w-3.5" />
                  {querySuccessNotice}
                </p>
              )}
            </form>

            {/* Query List */}
            <div className="space-y-3 pt-2 border-t border-apple-gray-200 dark:border-[#38383A]">
              <h3 className="text-[14px] font-semibold text-apple-black dark:text-white flex items-center justify-between">
                <span>Submitted Queries ({filteredQueries.length})</span>
              </h3>

              {filteredQueries.length > 0 ? (
                <div className="space-y-3">
                  {filteredQueries.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-2xl border border-apple-gray-200/80 dark:border-[#38383A] bg-apple-gray-50/70 dark:bg-[#2C2C2E]/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                          q.status === 'fixed'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {q.status === 'fixed' ? '✓ Fixed / Resolved' : '• Pending Admin Response'}
                        </span>
                        <span className="text-[11.5px] text-apple-gray-400">{q.createdAt}</span>
                      </div>

                      <p className="text-[13.5px] font-medium text-apple-black dark:text-white leading-relaxed">
                        "{q.text}"
                      </p>

                      {q.response && (
                        <div className="p-3 rounded-xl bg-apple-blue/5 border border-apple-blue/15 text-[12.5px] text-apple-gray-700 dark:text-apple-gray-300 flex items-start gap-2 mt-2">
                          <Sparkles className="h-4 w-4 text-apple-blue shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-apple-blue font-semibold block text-[11px] uppercase tracking-wider mb-0.5">
                              Admin Response:
                            </strong>
                            <span>{q.response}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-apple-gray-400 text-[13.5px]">
                  No {queryCategoryFilter !== 'all' ? queryCategoryFilter : ''} queries found.
                </div>
              )}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
};
