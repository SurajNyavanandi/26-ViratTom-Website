import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Shield, 
  Send, 
  CheckCircle2, 
  Plus, 
  Check, 
  Copy, 
  FileText, 
  Download, 
  ExternalLink, 
  Smartphone, 
  Globe, 
  Clock, 
  MessageSquare,
  Sparkles,
  Save,
  AlertCircle
} from 'lucide-react';
import type { ClientProject, Milestone } from '@/types';
import { sanitizePhone, apiUrl } from '@/lib/utils';

export const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [clientPhone, setClientPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneSaveSuccess, setPhoneSaveSuccess] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [notified, setNotified] = useState(false);
  const [feedbackResolved, setFeedbackResolved] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectPhone, setNewProjectPhone] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token') || '';
    fetch(apiUrl('/api/admin/projects'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          const first = data[0];
          setSelectedProjectId(first.id);
          setClientPhone(first.clientPhone || '');
          if (first.milestones) setMilestones(first.milestones);
        } else {
          setProjects([]);
        }
      })
      .catch(err => console.error('[AdminProjects] Fetch error:', err));
  }, []);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

  const handleTogglePortalAccess = async () => {
    if (!currentProject) return;
    const updatedApproved = currentProject.clientPortalApproved === false ? true : false;
    const token = localStorage.getItem('admin_token') || '';
    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clientPortalApproved: updatedApproved })
      });
      setProjects(projects.map(p => p.id === selectedProjectId ? { ...p, clientPortalApproved: updatedApproved } : p));
    } catch (err) {
      console.error('Error toggling client portal access:', err);
    }
  };

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
      setPhoneSaveSuccess(true);
      setIsEditingPhone(false);
      setTimeout(() => setPhoneSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMilestone = async (id: number) => {
    const updated = milestones.map(m => m.id === id ? { ...m, done: !m.done } : m);
    setMilestones(updated);
    const token = localStorage.getItem('admin_token') || '';
    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ milestones: updated })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;
    const updated = [
      ...milestones,
      { id: Date.now(), task: newMilestoneText.trim(), done: false }
    ];
    setMilestones(updated);
    setNewMilestoneText('');
    const token = localStorage.getItem('admin_token') || '';
    try {
      await fetch(apiUrl(`/api/admin/projects/${selectedProjectId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ milestones: updated })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !newProjectPhone.trim()) return;
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(apiUrl('/api/admin/projects'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newProjectTitle.trim(),
          clientPhone: newProjectPhone.trim()
        })
      });
      const created = await res.json();
      if (created && created.id) {
        setProjects(prev => [created, ...prev]);
        setSelectedProjectId(created.id);
        setClientPhone(created.clientPhone);
        setMilestones(created.milestones || []);
        setShowAddProject(false);
        setNewProjectTitle('');
        setNewProjectPhone('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotify = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 3000);
  };

  const completedCount = milestones.filter(m => m.done).length;
  const progressPercent = Math.round((completedCount / (milestones.length || 1)) * 100);

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* ========================================================================= */}
      {/* 🚀 PAGE TITLE & ACTIONS                                                   */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF] leading-tight">
            Active Projects
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddProject(true)}
            className="px-4 py-2 rounded-xl bg-[#0071E3] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-xs hover:bg-[#0077ED] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
          {projects.length > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-[#34C759]/10 text-[#34C759] text-[13px] font-semibold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
              <span>{projects.length} Active {projects.length === 1 ? 'Project' : 'Projects'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Add Project Modal */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-apple-black dark:text-white">Create New Client Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-apple-gray-500 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Web & Mobile Application"
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

      {/* Project Selector */}
      {projects.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProjectId(p.id);
                setClientPhone(p.clientPhone || '');
                if (p.milestones) setMilestones(p.milestones);
              }}
              className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all whitespace-nowrap ${
                selectedProjectId === p.id
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] text-[#555555] dark:text-[#A1A1A6]'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {!currentProject ? (
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] p-12 text-center space-y-4">
          <FolderKanban className="h-12 w-12 text-apple-blue mx-auto opacity-70" />
          <h2 className="text-[20px] font-bold text-[#000000] dark:text-white">No Active Client Projects</h2>
          <p className="text-[14px] text-apple-gray-500 max-w-md mx-auto">
            You haven't registered any client projects yet. Create a project to assign deliverables, milestones, and client access.
          </p>
          <button
            onClick={() => setShowAddProject(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0071E3] text-white text-[14px] font-semibold inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
      /* ========================================================================= */
      /* 📱 PRIMARY ACTIVE PROJECT CARD                                            */
      /* ========================================================================= */
      <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] overflow-hidden">
        
        {/* Project Header Bar */}
        <div className="p-5 sm:p-7 border-b border-[#E5E5EA] dark:border-[#38383A] bg-[#F5F5F7]/60 dark:bg-[#2C2C2E]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-[20px] sm:text-[24px] font-bold text-[#000000] dark:text-white">
                {currentProject.title}
              </h2>
              <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-[#34C759]/10 text-[#34C759]">
                Stage: Milestone {completedCount} of {milestones.length}
              </span>
            </div>
            
            {/* Client Phone Management */}
            <div className="flex items-center gap-3 flex-wrap text-[14px] text-[#555555] dark:text-[#A1A1A6]">
              <span className="flex items-center gap-1.5">
                <span>Client Mobile:</span>
                {isEditingPhone ? (
                  <form onSubmit={handleSavePhone} className="inline-flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-apple-gray-400">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="px-2 py-0.5 rounded border border-[#0071E3] text-[13px] bg-white dark:bg-[#2C2C2E] text-black dark:text-white w-28 focus:outline-none"
                      autoFocus
                    />
                    <button type="submit" className="px-2 py-0.5 rounded bg-[#0071E3] text-white text-[12px] font-semibold">
                      Save
                    </button>
                    <button type="button" onClick={() => setIsEditingPhone(false)} className="text-[12px] text-apple-gray-400 hover:text-black dark:hover:text-white">
                      Cancel
                    </button>
                  </form>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <strong className="text-[#000000] dark:text-white font-semibold">
                      +91 {clientPhone}
                    </strong>
                    <button
                      onClick={() => setIsEditingPhone(true)}
                      className="text-[12px] text-[#0071E3] hover:underline font-medium"
                    >
                      (Edit Phone)
                    </button>
                  </span>
                )}
              </span>
              {phoneSaveSuccess && (
                <span className="text-[12px] text-apple-green font-semibold animate-fade-in">
                  ✓ Saved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 md:pt-0 flex-wrap">
            <button
              onClick={handleTogglePortalAccess}
              className={`text-[12px] font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                currentProject?.clientPortalApproved !== false
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
              }`}
              title="Only admin can enable/disable this client's portal access"
            >
              <span className={`h-2 w-2 rounded-full ${currentProject?.clientPortalApproved !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span>Portal: {currentProject?.clientPortalApproved !== false ? 'Approved' : 'Restricted (No Login)'}</span>
            </button>

            <span className="text-[13px] font-semibold text-[#0071E3] bg-[#0071E3]/10 px-3 py-1.5 rounded-xl">
              {progressPercent}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar Strip */}
        <div className="w-full bg-[#E5E5EA] dark:bg-[#2C2C2E] h-1.5">
          <div 
            className="bg-[#0071E3] h-1.5 transition-all duration-500 rounded-r-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Project Content Grid */}
        <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Left Column: Interactive Milestone Engine */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-[#000000] dark:text-white flex items-center gap-2">
                <FolderKanban className="h-4.5 w-4.5 text-[#0071E3]" />
                <span>Milestone Engine</span>
              </h3>
              <span className="text-[13px] font-medium text-[#555555] dark:text-[#A1A1A6]">
                {completedCount} of {milestones.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {milestones.map((m) => (
                <div 
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    m.done 
                      ? 'bg-[#F5F5F7] dark:bg-[#2C2C2E]/40 border-[#E5E5EA] dark:border-[#38383A]' 
                      : 'bg-white dark:bg-[#1C1C1E] border-[#D2D2D7] dark:border-[#38383A] hover:border-[#0071E3]'
                  }`}
                >
                  <div className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    m.done ? 'bg-[#0071E3] text-white' : 'border border-[#A1A1A6] bg-transparent'
                  }`}>
                    {m.done && <Check className="h-3.5 w-3.5" />}
                  </div>

                  <span className={`text-[14px] leading-snug font-medium transition-all ${
                    m.done ? 'line-through text-[#A1A1A6]' : 'text-[#000000] dark:text-white'
                  }`}>
                    {m.task}
                  </span>
                </div>
              ))}

              {/* Add Custom Milestone Input */}
              <form onSubmit={handleAddMilestone} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newMilestoneText}
                  onChange={e => setNewMilestoneText(e.target.value)}
                  placeholder="Add next sprint milestone..."
                  className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[14px] text-[#000000] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                />
                <button
                  type="submit"
                  disabled={!newMilestoneText.trim()}
                  className="min-h-[44px] px-4 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#D2D2D7] dark:border-[#38383A] text-[#000000] dark:text-white font-medium text-[13px] hover:bg-[#E5E5EA] transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </form>

              {/* Notify Client Trigger */}
              <button 
                onClick={handleNotify} 
                className="w-full mt-2 min-h-[48px] rounded-xl bg-[#0071E3] text-white font-medium text-[14px] hover:bg-[#0077ED] active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                {notified ? (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5 text-[#34C759]" />
                    <span className="text-white font-semibold">Live Notification Dispatched!</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Progress Notification to Client</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Client Feedback & Project Details */}
          <div className="space-y-5">
            
            {/* Feedback Inspector */}
            <div>
              <h3 className="text-[17px] font-bold text-[#000000] dark:text-white mb-3 flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#0071E3]" />
                <span>Client Feedback & Requests</span>
              </h3>

              <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 border border-[#E5E5EA] dark:border-[#38383A] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071E3]">
                    Client Change Request
                  </span>
                  <span className="text-[12px] text-[#A1A1A6]">
                    Today at 11:30 AM
                  </span>
                </div>

                <p className="text-[14px] text-[#000000] dark:text-white leading-relaxed italic">
                  {feedbackResolved 
                    ? "✓ Client feedback marked resolved. Changes verified in staging build."
                    : '"Please ensure the checkout screen supports instant Google Pay & PhonePe UPI intent buttons."'}
                </p>

                <div className="flex items-center gap-2 pt-2">
                  {!feedbackResolved ? (
                    <>
                      <button
                        onClick={() => setFeedbackResolved(true)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#34C759] text-white text-[13px] font-medium hover:bg-[#2EB84F] transition-colors cursor-pointer"
                      >
                        Mark Resolved
                      </button>
                      <button
                        className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] text-[#555555] dark:text-[#A1A1A6] text-[13px] font-medium hover:text-[#000000] dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Flag Out of Scope
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setFeedbackResolved(false)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] text-[#0071E3] text-[13px] font-medium hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                    >
                      Reopen Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Deliverables Info Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 border border-[#E5E5EA] dark:border-[#38383A] space-y-3">
              <h4 className="text-[14px] font-bold text-[#000000] dark:text-white">
                Tech Stack & Target Platforms
              </h4>
              <div className="flex flex-wrap gap-2 text-[12px]">
                <span className="px-3 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] font-medium text-[#000000] dark:text-white">
                  📱 React Native (iOS & Android)
                </span>
                <span className="px-3 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] font-medium text-[#000000] dark:text-white">
                  🌐 Next.js & Express API
                </span>
                <span className="px-3 py-1 rounded-full bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] font-medium text-[#000000] dark:text-white">
                  ⚡ Razorpay & UPI Gateway
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export const AdminHub: React.FC = () => {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [savedVault, setSavedVault] = useState(false);
  const [address, setAddress] = useState('ARC Building\nMadhapur, Kavuri Hills\nHyderabad, Telangana - 500081');
  const [gst, setGst] = useState('36XXXXXXXXXX1Z5');
  const [phone, setPhone] = useState('+91 98765 43210');

  const templates = [
    {
      title: 'Master Web Launch Timeline (2-3 Weeks)',
      desc: 'Week 1: Wireframes & Brand Approval • Week 2: Responsive Frontend & CMS • Week 3: Domain DNS & Live Launch',
      tag: 'Web Standard'
    },
    {
      title: 'Master Mobile App Timeline (8 Weeks)',
      desc: 'Weeks 1-2: Architecture & Figma • Weeks 3-5: Core React Native Build • Weeks 6-7: API & QA • Week 8: App Store Submission',
      tag: 'Mobile Standard'
    },
    {
      title: 'Standard Agency Scope Agreement (NDA & Contract)',
      desc: 'Includes 50% advance milestone, weekly demo sign-offs, and 30-day post-launch bug warranty terms.',
      tag: 'Legal'
    },
    {
      title: 'Resume Generator LaTeX & PDF Engine',
      desc: 'ATS-optimized single-page format with clean typography for software engineers and executives.',
      tag: 'Tooling'
    }
  ];

  const handleCopyTemplate = (title: string, desc: string) => {
    navigator.clipboard.writeText(`${title}\n\n${desc}`);
    setCopiedTemplate(title);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  const handleSaveVault = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedVault(true);
    setTimeout(() => setSavedVault(false), 3000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Page Header */}
      <div>
        <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF] leading-tight">
          Command Hub
        </h1>
      </div>

      {/* Grid: Templates + Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Template Library */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] sm:text-[21px] font-bold text-[#000000] dark:text-white flex items-center gap-2.5">
              <FileText className="h-5 w-5 text-[#0071E3]" />
              <span>Agency Templates</span>
            </h2>
            <span className="text-[12px] font-medium text-[#A1A1A6]">4 Blueprints</span>
          </div>

          <div className="space-y-3">
            {templates.map((tmpl, i) => (
              <div 
                key={i} 
                className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 border border-[#E5E5EA] dark:border-[#38383A] space-y-2 hover:border-[#0071E3] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[15px] text-[#000000] dark:text-white leading-snug">
                    {tmpl.title}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-[#1C1C1E] text-[11px] font-medium text-[#555555] dark:text-[#A1A1A6] border border-[#E5E5EA] dark:border-[#38383A] shrink-0">
                    {tmpl.tag}
                  </span>
                </div>

                <p className="text-[13px] text-[#555555] dark:text-[#A1A1A6] leading-relaxed">
                  {tmpl.desc}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleCopyTemplate(tmpl.title, tmpl.desc)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0071E3] hover:underline cursor-pointer"
                  >
                    {copiedTemplate === tmpl.title ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#34C759]" />
                        <span className="text-[#34C759]">Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Blueprint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Security Vault */}
        <div className="rounded-2xl sm:rounded-3xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] p-5 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[19px] sm:text-[21px] font-bold text-[#000000] dark:text-white flex items-center gap-2.5">
              <Shield className="h-5 w-5 text-[#0071E3]" />
              <span>Agency Business Vault</span>
            </h2>
            <span className="text-[12px] font-medium text-[#34C759] flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#34C759]" />
              <span>Secured</span>
            </span>
          </div>

          <form onSubmit={handleSaveVault} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-[#555555] dark:text-[#A1A1A6] mb-1.5">
                Registered Agency Address
              </label>
              <textarea 
                rows={3}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] p-3 text-[15px] text-[#000000] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#555555] dark:text-[#A1A1A6] mb-1.5">
                GST / Tax Registration ID
              </label>
              <input 
                type="text"
                value={gst}
                onChange={e => setGst(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[15px] text-[#000000] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#555555] dark:text-[#A1A1A6] mb-1.5">
                Official Agency Hotline
              </label>
              <input 
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D2D2D7] dark:border-[#38383A] bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[15px] text-[#000000] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>

            {savedVault && (
              <div className="p-3.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] text-[13px] flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Agency credentials and registered details updated successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[48px] rounded-xl bg-[#0071E3] text-white font-medium text-[14px] hover:bg-[#0077ED] active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
