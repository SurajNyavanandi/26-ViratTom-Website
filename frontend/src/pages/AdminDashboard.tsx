import React, { useEffect, useState } from 'react';
import { 
  Inbox, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Phone, 
  MessageSquare, 
  Search, 
  Copy, 
  Check, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  ChevronDown,
  Sparkles,
  Layers,
  Mail,
  FolderPlus,
  Lock,
  Unlock,
  CreditCard,
  Trash2,
  UserCheck,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface Lead {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  phone: string;
  projectType?: string;
  budget?: string | number;
  scope?: string;
  verified?: boolean;
  createdAt?: string;
}

interface ClientProject {
  id: string;
  title: string;
  clientPhone: string;
  clientEmail?: string;
  clientName?: string;
  type: string;
  status: string;
  totalBudget: number;
  advancePercentage: number;
  advanceAmount: number;
  advancePaid: boolean;
  finalPaid: boolean;
  clientPortalApproved: boolean;
  milestones?: Array<{ id: number; task: string; done: boolean; date?: string }>;
  deliverables?: Array<{ name: string; url: string; locked: boolean }>;
}

export const AdminDashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<'leads' | 'projects'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'pending'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Project Modal State
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    type: 'Website & Mobile App',
    totalBudget: '25000',
    clientPortalApproved: true,
    advancePaid: false
  });

  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem('admin_token');
    
    Promise.all([
      fetch('/api/admin/leads', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/admin/projects', { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
      .then(([leadsData, projectsData]) => {
        setLeads(Array.isArray(leadsData) ? leadsData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      })
      .catch((err) => {
        console.error("Admin data fetch error:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePortalAccess = async (project: ClientProject) => {
    const updatedApproved = !project.clientPortalApproved;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clientPortalApproved: updatedApproved })
      });
      if (res.ok) {
        setProjects(projects.map(p => p.id === project.id ? { ...p, clientPortalApproved: updatedApproved } : p));
      }
    } catch (err) {
      console.error("Error updating portal access:", err);
    }
  };

  const handleToggleAdvancePaid = async (project: ClientProject) => {
    const updatedAdvancePaid = !project.advancePaid;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ advancePaid: updatedAdvancePaid })
      });
      if (res.ok) {
        setProjects(projects.map(p => p.id === project.id ? { ...p, advancePaid: updatedAdvancePaid } : p));
      }
    } catch (err) {
      console.error("Error updating advance paid status:", err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const budgetNum = Number(projectForm.totalBudget) || 25000;
    const advAmount = Math.round(budgetNum * 0.2);

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: projectForm.title,
          clientName: projectForm.clientName,
          clientPhone: projectForm.clientPhone.replace(/\D/g, ''),
          clientEmail: projectForm.clientEmail,
          type: projectForm.type,
          totalBudget: budgetNum,
          advancePercentage: 20,
          advanceAmount: advAmount,
          advancePaid: projectForm.advancePaid,
          clientPortalApproved: projectForm.clientPortalApproved
        })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.id) {
        setProjects([data, ...projects]);
        setShowNewProjectModal(false);
        setProjectForm({
          title: '',
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          type: 'Website & Mobile App',
          totalBudget: '25000',
          clientPortalApproved: true,
          advancePaid: false
        });
      } else {
        alert(data?.error || `Error creating project (${res.status}). Please check all required fields.`);
      }
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Network error creating project. Please check your connection and try again.");
    }
  };

  const handleConvertLeadToProject = (lead: Lead) => {
    setProjectForm({
      title: `${lead.name}'s ${lead.projectType || 'Digital Project'}`,
      clientName: lead.name,
      clientPhone: lead.phone,
      clientEmail: lead.email || '',
      type: lead.projectType || 'Static Website',
      totalBudget: String(lead.budget || '25000'),
      clientPortalApproved: true,
      advancePaid: false
    });
    setCurrentSection('projects');
    setShowNewProjectModal(true);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'verified' ? lead.verified :
      !lead.verified;

    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesTab;

    const matchesSearch = 
      (lead.name && lead.name.toLowerCase().includes(query)) ||
      (lead.email && lead.email.toLowerCase().includes(query)) ||
      (lead.phone && lead.phone.toLowerCase().includes(query)) ||
      (lead.projectType && lead.projectType.toLowerCase().includes(query)) ||
      (lead.scope && lead.scope.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  const totalCount = leads.length;
  const verifiedCount = leads.filter(l => l.verified).length;
  const activeProjectsCount = projects.filter(p => p.clientPortalApproved).length;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      
      {/* 🏷️ PAGE HEADER & METRICS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF] leading-tight">
            Administrator Command Center
          </h1>
          <p className="text-[14px] text-apple-gray-500 mt-1">
            Manage client inquiry leads, grant portal permissions, and track 20% advance milestone payments.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] text-[14px] font-medium text-[#000000] dark:text-white shadow-xs hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#0071E3] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {currentSection === 'projects' && (
            <Button 
              onClick={() => setShowNewProjectModal(true)}
              className="rounded-xl min-h-[44px] gap-2 text-[14px] font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>Create Project</span>
            </Button>
          )}
        </div>
      </div>

      {/* Primary Section Switcher */}
      <div className="flex rounded-2xl bg-apple-gray-100 dark:bg-[#1C1C1E] p-1.5 border border-apple-gray-200 dark:border-[#38383A] max-w-md">
        <button
          onClick={() => setCurrentSection('leads')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-[14px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            currentSection === 'leads'
              ? 'bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white shadow-xs'
              : 'text-apple-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <Inbox className="h-4 w-4 text-apple-blue" />
          <span>Inquiry Leads ({leads.length})</span>
        </button>
        <button
          onClick={() => setCurrentSection('projects')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-[14px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            currentSection === 'projects'
              ? 'bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white shadow-xs'
              : 'text-apple-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          <FolderPlus className="h-4 w-4 text-apple-green" />
          <span>Client Projects ({projects.length})</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">Total Inquiries</span>
            <Layers className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#000000] dark:text-white">
            {totalCount}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">Email OTP Verified</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">Verified Leads</span>
            <ShieldCheck className="h-4 w-4 text-[#34C759]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#34C759]">
            {verifiedCount}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">Ready for client project</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">Active Client Projects</span>
            <UserCheck className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#000000] dark:text-white">
            {projects.length}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">{activeProjectsCount} with portal login active</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">20% Advances Paid</span>
            <CreditCard className="h-4 w-4 text-[#34C759]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#34C759]">
            {projects.filter(p => p.advancePaid).length}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">Kickoff deposits cleared</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: INQUIRY LEADS                                                  */}
      {/* ========================================================================= */}
      {currentSection === 'leads' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-apple-gray-400" />
              <Input
                type="text"
                placeholder="Search leads by name, email, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === 'all' 
                    ? 'bg-apple-blue text-white' 
                    : 'bg-apple-gray-100 dark:bg-[#1C1C1E] text-apple-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                All ({leads.length})
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  activeTab === 'verified' 
                    ? 'bg-apple-blue text-white' 
                    : 'bg-apple-gray-100 dark:bg-[#1C1C1E] text-apple-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                Verified ({verifiedCount})
              </button>
            </div>
          </div>

          {/* Leads List */}
          {filteredLeads.length === 0 ? (
            <Card className="p-12 text-center text-apple-gray-400 rounded-3xl">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <h3 className="text-[18px] font-bold text-apple-black dark:text-white mb-1">No Leads Found</h3>
              <p className="text-[14px]">Inquiries submitted on the homepage will appear here instantly.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead, index) => {
                const leadId = lead._id || lead.id || `lead-${index}`;
                const cleanPhone = lead.phone.replace(/[^0-9]/g, '');

                return (
                  <Card key={leadId} className="p-5 sm:p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-xs hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Lead Details */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-[18px] sm:text-[20px] font-bold text-[#000000] dark:text-white truncate">
                            {lead.name}
                          </h3>
                          
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${
                            lead.verified 
                              ? 'bg-[#34C759]/10 text-[#34C759]' 
                              : 'bg-[#FF9500]/10 text-[#FF9500]'
                          }`}>
                            {lead.verified ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {lead.verified ? 'Verified Email OTP' : 'Unverified'}
                          </span>

                          {lead.projectType && (
                            <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#555555] dark:text-[#A1A1A6] border border-[#E5E5EA] dark:border-[#38383A]">
                              {lead.projectType}
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#555555] dark:text-[#A1A1A6] pt-1">
                          {lead.email && (
                            <div className="flex items-center gap-1.5 font-medium text-[#000000] dark:text-white">
                              <Mail className="h-4 w-4 text-[#0071E3]" />
                              <span>{lead.email}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 font-medium text-[#000000] dark:text-white">
                            <Phone className="h-4 w-4 text-[#0071E3]" />
                            <span>+91 {lead.phone}</span>
                          </div>

                          {lead.budget && (
                            <div className="flex items-center gap-1 text-[#34C759] font-semibold">
                              <span>Budget: ₹{Number(lead.budget).toLocaleString('en-IN')}</span>
                            </div>
                          )}

                          {lead.createdAt && (
                            <span className="text-[12px] text-[#A1A1A6]">
                              {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {lead.scope && (
                          <div className="mt-2 p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 border border-[#E5E5EA] dark:border-[#38383A] text-[13px] text-[#000000] dark:text-[#FFFFFF] leading-relaxed">
                            <p className="font-semibold text-[11px] text-[#A1A1A6] uppercase tracking-wider mb-0.5">
                              Requirements Brief:
                            </p>
                            <p className="whitespace-pre-wrap">{lead.scope}</p>
                          </div>
                        )}
                      </div>

                      {/* Lead Actions */}
                      <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E5E5EA] dark:border-[#38383A] flex-wrap sm:flex-nowrap shrink-0">
                        <Button
                          onClick={() => handleConvertLeadToProject(lead)}
                          className="rounded-xl text-[13px] font-semibold gap-1.5 bg-apple-blue text-white hover:bg-blue-600"
                        >
                          <FolderPlus className="h-4 w-4" />
                          <span>Convert to Project</span>
                        </Button>

                        <a
                          href={`tel:${cleanPhone}`}
                          className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-apple-gray-200 dark:border-[#38383A] text-apple-black dark:text-white text-[13px] font-medium hover:bg-apple-gray-200 transition-all"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>Call</span>
                        </a>

                        <button
                          onClick={() => handleCopyPhone(lead.phone, leadId)}
                          className="min-h-[40px] min-w-[40px] p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-[#555555] dark:text-[#A1A1A6] hover:text-[#000000] dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                          title="Copy phone"
                        >
                          {copiedId === leadId ? <Check className="h-4 w-4 text-[#34C759]" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CLIENT PROJECTS & PORTAL ACCESS GATING                         */}
      {/* ========================================================================= */}
      {currentSection === 'projects' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-apple-blue/5 border border-apple-blue/20 text-apple-blue text-[13px] flex items-center justify-between">
            <span>
              💡 <strong>Access Control Policy:</strong> Clients can ONLY log in to the project portal if <strong>Portal Access</strong> is set to <strong>Approved</strong> by an administrator.
            </span>
          </div>

          {projects.length === 0 ? (
            <Card className="p-12 text-center text-apple-gray-400 rounded-3xl">
              <FolderPlus className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <h3 className="text-[18px] font-bold text-apple-black dark:text-white mb-1">No Client Projects Yet</h3>
              <p className="text-[14px] mb-4">Click "Create Project" or convert an incoming lead to get started.</p>
              <Button onClick={() => setShowNewProjectModal(true)} className="rounded-xl">
                Create First Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {projects.map((project) => {
                const totalBudget = project.totalBudget || 25000;
                const advAmount = project.advanceAmount || Math.round(totalBudget * 0.2);

                return (
                  <Card key={project.id} className="p-6 sm:p-7 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-sm space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      
                      {/* Left Project Info */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-[20px] font-bold text-apple-black dark:text-white">
                            {project.title}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-apple-gray-100 dark:bg-[#2C2C2E] text-apple-gray-600 dark:text-apple-gray-300">
                            {project.type}
                          </span>
                          <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-apple-green/10 text-apple-green">
                            {project.status}
                          </span>
                        </div>

                        {/* Client Identity details */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] pt-1 text-apple-gray-600 dark:text-apple-gray-300">
                          <div>
                            <strong>Client:</strong> {project.clientName || 'Assigned Client'}
                          </div>
                          <div className="flex items-center gap-1.5 font-mono">
                            <Phone className="h-3.5 w-3.5 text-apple-blue" />
                            <span>+91 {project.clientPhone}</span>
                          </div>
                          {project.clientEmail && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-apple-blue" />
                              <span>{project.clientEmail}</span>
                            </div>
                          )}
                        </div>

                        {/* Financial commercial breakdown */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-apple-gray-50 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[13px]">
                          <div>
                            <span className="text-apple-gray-400 block text-[11px] uppercase font-semibold">Total Budget</span>
                            <span className="font-bold text-apple-black dark:text-white text-[15px]">₹{totalBudget.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-apple-gray-400 block text-[11px] uppercase font-semibold">20% Advance Amount</span>
                            <span className="font-bold text-apple-blue text-[15px]">₹{advAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div>
                            <span className="text-apple-gray-400 block text-[11px] uppercase font-semibold">Advance Status</span>
                            <span className={`font-semibold inline-flex items-center gap-1 ${project.advancePaid ? 'text-apple-green' : 'text-apple-orange'}`}>
                              {project.advancePaid ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                              {project.advancePaid ? '20% Paid & Active' : 'Awaiting 20% Advance'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Gates */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-start">
                        {/* Access Control Toggle */}
                        <Button
                          onClick={() => handleTogglePortalAccess(project)}
                          variant={project.clientPortalApproved ? 'secondary' : 'outline'}
                          className={`rounded-xl text-[13px] font-semibold gap-2 ${
                            project.clientPortalApproved 
                              ? 'bg-apple-green/10 text-apple-green border-apple-green/30 hover:bg-apple-green/20' 
                              : 'bg-apple-red/10 text-apple-red border-apple-red/30 hover:bg-apple-red/20'
                          }`}
                        >
                          {project.clientPortalApproved ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          <span>Portal: {project.clientPortalApproved ? 'Access Granted' : 'Access Restricted'}</span>
                        </Button>

                        {/* Advance Paid Toggle */}
                        <Button
                          onClick={() => handleToggleAdvancePaid(project)}
                          variant="outline"
                          className="rounded-xl text-[13px] font-medium gap-2"
                        >
                          <CreditCard className="h-4 w-4 text-apple-blue" />
                          <span>{project.advancePaid ? 'Mark Advance Unpaid' : 'Mark 20% Paid'}</span>
                        </Button>

                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="px-3 py-2 rounded-xl text-apple-red hover:bg-apple-red/10 text-[12px] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Project</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW CLIENT PROJECT                                          */}
      {/* ========================================================================= */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-2xl space-y-5 bg-white dark:bg-[#1C1C1E] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-bold text-apple-black dark:text-white">
                Create Client Project
              </h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-apple-gray-400 hover:text-black dark:hover:text-white text-[20px] font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold mb-1">Project Title</label>
                <Input
                  required
                  placeholder="e.g. Modern E-Commerce Platform"
                  value={projectForm.title}
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Client Name</label>
                  <Input
                    required
                    placeholder="e.g. Shree Shiva"
                    value={projectForm.clientName}
                    onChange={e => setProjectForm({ ...projectForm, clientName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Client Mobile (10-digit)</label>
                  <Input
                    required
                    type="tel"
                    maxLength={10}
                    placeholder="e.g. 9666635009"
                    value={projectForm.clientPhone}
                    onChange={e => setProjectForm({ ...projectForm, clientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold mb-1">Client Email (Optional)</label>
                <Input
                  type="email"
                  placeholder="e.g. client@example.com"
                  value={projectForm.clientEmail}
                  onChange={e => setProjectForm({ ...projectForm, clientEmail: e.target.value })}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Project Type</label>
                  <select
                    className="w-full h-10 px-3 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-[14px]"
                    value={projectForm.type}
                    onChange={e => setProjectForm({ ...projectForm, type: e.target.value })}
                  >
                    <option value="Static Website">Static Website</option>
                    <option value="Dynamic Website">Dynamic Website</option>
                    <option value="Online Store">Online Store</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Website & Mobile App">Website & Mobile App</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold mb-1">Total Budget (INR)</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    placeholder="25000"
                    value={projectForm.totalBudget}
                    onChange={e => setProjectForm({ ...projectForm, totalBudget: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* 20% Advance Calculation Helper */}
              <div className="p-3.5 rounded-2xl bg-apple-blue/5 border border-apple-blue/20 text-apple-blue text-[13px] space-y-1">
                <div className="flex justify-between">
                  <span>20% Initial Booking Advance:</span>
                  <strong>₹{Math.round((Number(projectForm.totalBudget) || 25000) * 0.2).toLocaleString('en-IN')}</strong>
                </div>
                <div className="flex justify-between text-apple-gray-500">
                  <span>Remaining 80% on Final Delivery:</span>
                  <span>₹{((Number(projectForm.totalBudget) || 25000) - Math.round((Number(projectForm.totalBudget) || 25000) * 0.2)).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.clientPortalApproved}
                    onChange={e => setProjectForm({ ...projectForm, clientPortalApproved: e.target.checked })}
                    className="h-4 w-4 rounded text-apple-blue"
                  />
                  <span className="text-[13px] font-medium text-apple-black dark:text-white">
                    Approve Client Portal Login Immediately for +91 {projectForm.clientPhone || '...'}
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={projectForm.advancePaid}
                    onChange={e => setProjectForm({ ...projectForm, advancePaid: e.target.checked })}
                    className="h-4 w-4 rounded text-apple-blue"
                  />
                  <span className="text-[13px] font-medium text-apple-black dark:text-white">
                    Mark 20% Advance as Already Paid / Received
                  </span>
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl"
                >
                  Create Project
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
