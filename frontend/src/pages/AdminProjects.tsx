import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Globe, 
  MessageSquare,
  Save,
  Trash2,
  Check,
  Edit2,
  DollarSign,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import type { ClientProject } from '@/types';
import { formatCurrency, apiUrl } from '@/lib/utils';

export const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [clientPhone, setClientPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Live App/Website URL state
  const [liveUrl, setLiveUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlSavedSuccess, setUrlSavedSuccess] = useState(false);

  // New Client Project Modal
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectPhone, setNewProjectPhone] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('25000');
  const [newProjectUrl, setNewProjectUrl] = useState('');

  // Fetch projects on load
  const fetchProjects = async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(apiUrl('/api/admin/projects'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setProjects(data);
        const currentId = selectedProjectId || data[0].id || (data[0] as any)._id;
        setSelectedProjectId(currentId);
        const active = data.find((p: any) => (p.id || p._id) === currentId) || data[0];
        setClientPhone(active.clientPhone || '');
        setLiveUrl(active.liveUrl || (active.deliverables && active.deliverables[0]?.url !== '#' ? active.deliverables[0].url : ''));
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('[AdminProjects] Fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const currentProject = projects.find(p => (p.id || (p as any)._id) === selectedProjectId) || projects[0] || null;

  // Sync state when selected project changes
  useEffect(() => {
    if (currentProject) {
      setClientPhone(currentProject.clientPhone || '');
      const url = (currentProject as any).liveUrl || 
                 (currentProject.deliverables && currentProject.deliverables[0]?.url !== '#' ? currentProject.deliverables[0].url : '');
      setLiveUrl(url);
    }
  }, [selectedProjectId, currentProject]);

  // Update Live App/Website URL
  const handleSaveLiveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    const token = localStorage.getItem('admin_token') || '';
    
    let cleanUrl = liveUrl.trim();
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'https://' + cleanUrl;
    }

    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          liveUrl: cleanUrl,
          deliverables: [
            { name: 'Live Deployed Website / App', url: cleanUrl || '#', locked: false }
          ]
        })
      });

      setUrlSavedSuccess(true);
      setIsEditingUrl(false);
      setLiveUrl(cleanUrl);
      setTimeout(() => setUrlSavedSuccess(false), 2500);
      fetchProjects();
    } catch (err) {
      console.error('Error saving live URL:', err);
    }
  };

  // Toggle Payment Status
  const handleTogglePaymentStatus = async (field: 'advancePaid' | 'finalPaid') => {
    if (!currentProject) return;
    const currentVal = Boolean((currentProject as any)[field]);
    const token = localStorage.getItem('admin_token') || '';
    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: !currentVal })
      });
      fetchProjects();
    } catch (err) {
      console.error('Error updating payment status:', err);
    }
  };

  // Resolve / Fix Client Query
  const handleToggleQueryStatus = async (queryId: number) => {
    if (!currentProject) return;
    const currentFeedback = currentProject.feedback || [];
    const updatedFeedback = currentFeedback.map((item: any) => {
      if (item.id === queryId) {
        return { ...item, resolved: !item.resolved };
      }
      return item;
    });

    const token = localStorage.getItem('admin_token') || '';
    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback: updatedFeedback })
      });
      fetchProjects();
    } catch (err) {
      console.error('Error toggling query resolution:', err);
    }
  };

  // Delete Client Query
  const handleDeleteQuery = async (queryId: number) => {
    if (!currentProject) return;
    if (!window.confirm('Delete this client query?')) return;

    const updatedFeedback = (currentProject.feedback || []).filter((item: any) => item.id !== queryId);
    const token = localStorage.getItem('admin_token') || '';
    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ feedback: updatedFeedback })
      });
      fetchProjects();
    } catch (err) {
      console.error('Error deleting query:', err);
    }
  };

  // Save Client Phone
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = clientPhone.replace(/\D/g, '').slice(-10);
    const token = localStorage.getItem('admin_token') || '';
    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clientPhone: cleanPhone })
      });
      setIsEditingPhone(false);
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  // Create New Client Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !newProjectPhone.trim()) return;
    const token = localStorage.getItem('admin_token') || '';
    try {
      let cleanUrl = newProjectUrl.trim();
      if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      const res = await fetch(apiUrl('/api/admin/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newProjectTitle.trim(),
          clientPhone: newProjectPhone.trim(),
          totalBudget: Number(newProjectBudget) || 25000,
          liveUrl: cleanUrl,
          deliverables: [{ name: 'Live Deployed Website / App', url: cleanUrl || '#', locked: false }]
        })
      });
      const created = await res.json();
      if (created && created.id) {
        setShowAddProject(false);
        setNewProjectTitle('');
        setNewProjectPhone('');
        setNewProjectBudget('25000');
        setNewProjectUrl('');
        setSelectedProjectId(created.id);
        fetchProjects();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const queries = currentProject?.feedback || [];
  const pendingQueries = queries.filter((q: any) => !q.resolved);
  const fixedQueries = queries.filter((q: any) => q.resolved);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-apple-black dark:text-white">
            Client Projects Management
          </h1>
          <p className="text-[13px] text-apple-gray-500">
            Manage client payments, update deployed app links, and resolve client queries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchProjects()}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-apple-black dark:text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-2xs hover:bg-apple-gray-50 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer disabled:opacity-60"
            title="Refresh projects"
          >
            <RefreshCw className={`h-4 w-4 text-apple-blue ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => setShowAddProject(true)}
            className="px-4 py-2 rounded-xl bg-apple-blue text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs hover:bg-blue-600 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Client Project</span>
          </button>
        </div>
      </div>

      {/* Project Selector Tabs */}
      {projects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {projects.map((p) => {
            const pId = p.id || (p as any)._id;
            return (
              <button
                key={pId}
                onClick={() => setSelectedProjectId(pId)}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  selectedProjectId === pId
                    ? 'bg-apple-blue text-white shadow-xs'
                    : 'bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-apple-gray-600 dark:text-apple-gray-300 hover:bg-apple-gray-50'
                }`}
              >
                {p.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-apple-black dark:text-white">Create New Client Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-apple-gray-500 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mana Drivers"
                  value={newProjectTitle}
                  onChange={e => setNewProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-50 dark:bg-[#2C2C2E] text-black dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-apple-gray-500 mb-1">Client Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={newProjectPhone}
                  onChange={e => setNewProjectPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-50 dark:bg-[#2C2C2E] text-black dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-apple-gray-500 mb-1">Total Budget (₹)</label>
                <input
                  type="number"
                  required
                  value={newProjectBudget}
                  onChange={e => setNewProjectBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-50 dark:bg-[#2C2C2E] text-black dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-apple-gray-500 mb-1">Live Deployed URL (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. https://manadrivers.com"
                  value={newProjectUrl}
                  onChange={e => setNewProjectUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-50 dark:bg-[#2C2C2E] text-black dark:text-white text-sm font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 rounded-xl border border-apple-gray-300 dark:border-[#38383A] text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-apple-blue text-white text-sm font-semibold"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!currentProject ? (
        <div className="rounded-3xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] p-12 text-center space-y-4">
          <FolderKanban className="h-12 w-12 text-apple-blue mx-auto opacity-70" />
          <h2 className="text-[20px] font-bold text-apple-black dark:text-white">No Active Client Projects</h2>
          <p className="text-[14px] text-apple-gray-500 max-w-md mx-auto">
            You haven't added any client projects yet. Create a project to manage client payment status, live URLs, and queries.
          </p>
          <button
            onClick={() => setShowAddProject(true)}
            className="px-5 py-2.5 rounded-xl bg-apple-blue text-white text-[14px] font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        /* MINIMALISTIC MAIN PROJECT CARD */
        <div className="rounded-3xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] shadow-sm overflow-hidden space-y-6 p-6 sm:p-8">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-apple-gray-200 dark:border-[#38383A]">
            <div>
              <h2 className="text-[22px] font-bold text-apple-black dark:text-white">
                {currentProject.title}
              </h2>
              <div className="flex items-center gap-2 text-[13px] text-apple-gray-500 mt-1">
                <span>Client Contact:</span>
                {isEditingPhone ? (
                  <form onSubmit={handleSavePhone} className="inline-flex items-center gap-1.5">
                    <span className="font-semibold text-apple-gray-400">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="px-2 py-0.5 rounded border border-apple-blue text-[13px] bg-white dark:bg-[#2C2C2E] text-black dark:text-white w-28 focus:outline-none"
                      autoFocus
                    />
                    <button type="submit" className="px-2 py-0.5 rounded bg-apple-blue text-white text-[12px] font-semibold">
                      Save
                    </button>
                    <button type="button" onClick={() => setIsEditingPhone(false)} className="text-[12px] text-apple-gray-400">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-apple-black dark:text-white">
                    +91 {clientPhone}
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-[12px] text-apple-blue hover:underline font-medium ml-1"
                    >
                      (Edit)
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[12px] font-bold ${
                currentProject.advancePaid ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                {currentProject.advancePaid ? '✓ 20% Advance Received' : '⏳ Advance Payment Pending'}
              </span>
            </div>
          </div>

          {/* THREE CORE SECTIONS: 1. Payment Breakdown, 2. Live URL, 3. Client Queries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Payment Breakdown Section */}
            <div className="p-5 rounded-2xl bg-apple-gray-50 dark:bg-[#2C2C2E]/50 border border-apple-gray-200 dark:border-[#38383A] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-apple-black dark:text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  <span>1. Payment Details &amp; Status</span>
                </h3>
              </div>

              <div className="space-y-3 text-[13.5px]">
                <div className="flex justify-between items-center py-2 border-b border-apple-gray-200/60 dark:border-[#38383A]">
                  <span className="text-apple-gray-500">Total Project Budget:</span>
                  <strong className="text-[16px] font-bold text-apple-black dark:text-white">
                    {formatCurrency(currentProject.totalBudget || 25000)}
                  </strong>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-apple-gray-200/60 dark:border-[#38383A]">
                  <div>
                    <span className="text-apple-gray-500">20% Advance Amount:</span>
                    <span className="text-xs text-apple-gray-400 block">
                      {formatCurrency(Math.round((currentProject.totalBudget || 25000) * 0.2))}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePaymentStatus('advancePaid')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                      currentProject.advancePaid
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {currentProject.advancePaid ? '✓ Advance Paid' : 'Mark Advance Paid'}
                  </button>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-apple-gray-500">Final Balance Payment:</span>
                    <span className="text-xs text-apple-gray-400 block">
                      {formatCurrency(Math.round((currentProject.totalBudget || 25000) * 0.8))}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePaymentStatus('finalPaid')}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer ${
                      (currentProject as any).finalPaid
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-apple-gray-200 dark:bg-[#38383A] text-apple-gray-700 dark:text-apple-gray-300'
                    }`}
                  >
                    {(currentProject as any).finalPaid ? '✓ Final Paid' : 'Mark Final Paid'}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Live Deployed URL Section */}
            <div className="p-5 rounded-2xl bg-apple-gray-50 dark:bg-[#2C2C2E]/50 border border-apple-gray-200 dark:border-[#38383A] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-bold text-apple-black dark:text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-apple-blue" />
                  <span>2. Live Deployed Website / App Link</span>
                </h3>
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[12px] font-semibold text-apple-blue hover:underline flex items-center gap-1"
                  >
                    <span>Visit Live</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[12px] font-semibold text-apple-gray-500">
                  Application Web Link URL
                </label>
                <form onSubmit={handleSaveLiveUrl} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. https://manadrivers.com"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] text-apple-black dark:text-white text-[13.5px] font-mono focus:outline-none focus:ring-2 focus:ring-apple-blue"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-apple-blue text-white text-[13px] font-semibold hover:bg-blue-600 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save URL</span>
                  </button>
                </form>

                {urlSavedSuccess && (
                  <p className="text-[12px] text-emerald-600 font-semibold flex items-center gap-1 animate-in fade-in">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Live application URL updated successfully!
                  </p>
                )}

                {liveUrl ? (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[12.5px] font-mono text-apple-blue truncate">
                    {liveUrl}
                  </div>
                ) : (
                  <p className="text-[12.5px] text-apple-gray-400 italic">
                    No live URL assigned yet. Enter the deployed URL above to make it accessible in the client portal.
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* 3. Client Queries & Fixes Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-apple-gray-50 dark:bg-[#2C2C2E]/50 border border-apple-gray-200 dark:border-[#38383A] space-y-4">
            <div className="flex items-center justify-between border-b border-apple-gray-200 dark:border-[#38383A] pb-3">
              <h3 className="text-[16px] font-bold text-apple-black dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-600" />
                <span>3. Client Queries &amp; Support Requests ({queries.length})</span>
              </h3>
              <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                {pendingQueries.length} Pending
              </span>
            </div>

            {queries.length === 0 ? (
              <div className="text-center py-8 text-apple-gray-400 text-[13.5px]">
                No queries submitted by the client yet.
              </div>
            ) : (
              <div className="space-y-3">
                {/* Pending Queries */}
                {pendingQueries.length > 0 && (
                  <div>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-amber-600 block mb-2">
                      Pending Queries ({pendingQueries.length})
                    </span>
                    <div className="space-y-2.5">
                      {pendingQueries.map((q: any) => (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl bg-white dark:bg-[#1C1C1E] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="space-y-1">
                            <p className="text-[13.5px] font-medium text-apple-black dark:text-white leading-relaxed">
                              "{q.text}"
                            </p>
                            <span className="text-[11px] text-apple-gray-400 block font-mono">
                              Received: {q.time || 'Recently'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleQueryStatus(q.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[12.5px] font-semibold hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span>Fix / Mark Resolved</span>
                            </button>
                            <button
                              onClick={() => handleDeleteQuery(q.id)}
                              className="p-1.5 rounded-lg text-apple-red hover:bg-apple-red/10 border border-apple-red/20 cursor-pointer"
                              title="Delete Query"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fixed / Resolved Queries */}
                {fixedQueries.length > 0 && (
                  <div className={pendingQueries.length > 0 ? 'pt-3 border-t border-apple-gray-200 dark:border-[#38383A]' : ''}>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-600 block mb-2">
                      Fixed &amp; Resolved Queries ({fixedQueries.length})
                    </span>
                    <div className="space-y-2">
                      {fixedQueries.map((q: any) => (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-[#1C1C1E] border border-emerald-500/20 flex items-center justify-between gap-3 text-[13px] opacity-80 hover:opacity-100 transition-opacity"
                        >
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span className="line-through text-apple-gray-500 dark:text-apple-gray-400">
                              "{q.text}"
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleQueryStatus(q.id)}
                              className="text-[11.5px] text-apple-blue font-semibold hover:underline cursor-pointer"
                            >
                              Reopen Query
                            </button>
                            <button
                              onClick={() => handleDeleteQuery(q.id)}
                              className="p-1 rounded-md text-apple-red hover:bg-apple-red/10 cursor-pointer"
                              title="Delete Query"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export const AdminHub: React.FC = () => {
  return <AdminProjects />;
};
