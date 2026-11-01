import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Plus,
  Send,
  Save,
  Eye,
  MessageCircle,
  Globe,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RecruiterOutreachSection } from '@/components/admin/RecruiterOutreachSection';
import type { Lead, ClientProject } from '@/types';
import { formatCurrency, sanitizePhone, safeFetchJson, apiUrl } from '@/lib/utils';

interface AdminStats {
  pageViews: number;
  totalLeads: number;
  projectLeads: number;
  whatsappLeads: number;
}

export const AdminDashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<'leads' | 'projects' | 'outreach' | 'pricing'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    pageViews: 1248,
    totalLeads: 0,
    projectLeads: 0,
    whatsappLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'project' | 'whatsapp' | 'verified'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Base Prices Configuration State
  const [projectPrices, setProjectPrices] = useState<Record<string, number>>({
    'Static Website': 4999,
    'Dynamic Website': 9999,
    'Online Store': 14999,
    'Mobile App': 25999,
    'Website + Mobile App': 32999,
  });
  const [savingPrices, setSavingPrices] = useState(false);
  const [priceSaveSuccess, setPriceSaveSuccess] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

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

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token || ''}` };
    
    try {
      const [leadsRes, projectsRes, pricesRes, statsRes] = await Promise.all([
        safeFetchJson<Lead[]>('/api/admin/leads', { headers }),
        safeFetchJson<ClientProject[]>('/api/admin/projects', { headers }),
        safeFetchJson<{ success: boolean; prices: Record<string, number> }>('/api/admin/project-prices', { headers }),
        safeFetchJson<AdminStats>('/api/admin/stats', { headers })
      ]);

      setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      if (pricesRes.data?.prices) {
        setProjectPrices(prev => ({ ...prev, ...pricesRes.data.prices }));
      }
      if (statsRes.data?.pageViews !== undefined) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token || ''}` };

    Promise.all([
      safeFetchJson<Lead[]>('/api/admin/leads', { headers }),
      safeFetchJson<ClientProject[]>('/api/admin/projects', { headers }),
      safeFetchJson<{ success: boolean; prices: Record<string, number> }>('/api/admin/project-prices', { headers }),
      safeFetchJson<AdminStats>('/api/admin/stats', { headers })
    ]).then(([leadsRes, projectsRes, pricesRes, statsRes]) => {
      if (!isMounted) return;
      setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      if (pricesRes.data?.prices) {
        setProjectPrices(prev => ({ ...prev, ...pricesRes.data.prices }));
      }
      if (statsRes.data?.pageViews !== undefined) {
        setStats(statsRes.data);
      }
      setLoading(false);
    }).catch((err) => {
      console.error("Admin data fetch error:", err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrices(true);
    setPriceError(null);
    setPriceSaveSuccess(false);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(apiUrl('/api/admin/project-prices'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prices: projectPrices })
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setPriceSaveSuccess(true);
        if (data.prices) setProjectPrices(data.prices);
        setTimeout(() => setPriceSaveSuccess(false), 3000);
      } else {
        setPriceError(data?.error || 'Failed to update base prices');
      }
    } catch (err: any) {
      setPriceError(err.message || 'Network error while saving base prices');
    } finally {
      setSavingPrices(false);
    }
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTogglePortalAccess = async (project: ClientProject) => {
    const updatedApproved = !project.clientPortalApproved;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(apiUrl(`/api/admin/projects/${project.id}`), {
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
      const res = await fetch(apiUrl(`/api/admin/projects/${project.id}`), {
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
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(apiUrl(`/api/admin/projects/${id}`), {
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
      const res = await fetch(apiUrl('/api/admin/projects'), {
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

  // Lead Counts
  const totalCount = leads.length;
  const projectLeadsCount = leads.filter(l => l.source !== 'whatsapp_widget').length;
  const whatsappLeadsCount = leads.filter(l => l.source === 'whatsapp_widget').length;
  const verifiedCount = leads.filter(l => l.verified).length;
  const activeProjectsCount = projects.filter(p => p.clientPortalApproved).length;
  const pageViewsCount = stats.pageViews || 1248;

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const isWa = lead.source === 'whatsapp_widget';
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'project' ? !isWa :
      activeTab === 'whatsapp' ? isWa :
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

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      
      {/* 🏷️ PAGE HEADER & REFRESH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight text-[#000000] dark:text-[#FFFFFF] leading-tight">
            Admin Control Center
          </h1>
          <p className="text-[13px] text-[#8E8E93] mt-0.5">
            Real-time analytics, inquiry tracking, and client workspace portal management
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <button 
            onClick={() => fetchData(true)} 
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] text-[14px] font-medium text-[#000000] dark:text-white shadow-xs hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#0071E3] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stats</span>
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
      <div className="flex rounded-2xl bg-apple-gray-100 dark:bg-[#1C1C1E] p-1.5 border border-apple-gray-200 dark:border-[#38383A] max-w-xl">
        {[
          { id: 'leads' as const, label: `Inquiries (${leads.length})`, icon: Inbox, iconColor: 'text-apple-blue' },
          { id: 'projects' as const, label: `Projects (${projects.length})`, icon: FolderPlus, iconColor: 'text-apple-green' },
          { id: 'outreach' as const, label: 'Outreach', icon: Send, iconColor: 'text-purple-500' },
          { id: 'pricing' as const, label: 'Base Prices', icon: DollarSign, iconColor: 'text-emerald-500' },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = currentSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setCurrentSection(sec.id)}
              className={`relative flex-1 py-2.5 px-3 sm:px-4 rounded-xl text-[13px] sm:text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-2 z-10 ${
                isActive
                  ? 'text-apple-black dark:text-white'
                  : 'text-apple-gray-500 hover:text-black dark:hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="adminSectionTab"
                  className="absolute inset-0 bg-white dark:bg-[#2C2C2E] rounded-xl shadow-xs -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className={`h-4 w-4 ${sec.iconColor}`} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* 📊 ANALYTICS METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Website Visitors / Page Views */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">Website Visitors</span>
            <Eye className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#000000] dark:text-white">
            {pageViewsCount.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">Total live page views</p>
        </div>

        {/* Card 2: Total "Start a Project" Form Submissions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">Project Form Leads</span>
            <FileText className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#0071E3]">
            {projectLeadsCount}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">Start a Project submissions</p>
        </div>

        {/* Card 3: Total "WhatsApp Widget" Inquiries */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">WhatsApp Inquiries</span>
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#25D366]">
            {whatsappLeadsCount}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">Instant WhatsApp widget leads</p>
        </div>

        {/* Card 4: Active Client Projects */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-[#E5E5EA] dark:border-[#38383A] shadow-xs">
          <div className="flex items-center justify-between text-[#555555] dark:text-[#A1A1A6] mb-2">
            <span className="text-[12px] sm:text-[13px] font-medium">Active Projects</span>
            <ShieldCheck className="h-4 w-4 text-[#34C759]" />
          </div>
          <div className="text-[24px] sm:text-[32px] font-bold tracking-tight text-[#000000] dark:text-white">
            {projects.length}
          </div>
          <p className="text-[11px] text-[#A1A1A6] mt-0.5">{activeProjectsCount} portal approved</p>
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
                placeholder="Search by name, email, phone, service..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            
            {/* Filter Badges: All, Start a Project, WhatsApp Widget, Verified */}
            <div className="flex items-center gap-1 p-1 bg-apple-gray-100 dark:bg-[#1C1C1E] rounded-xl border border-apple-gray-200 dark:border-[#38383A] w-full sm:w-auto overflow-x-auto">
              {[
                { id: 'all' as const, label: `All (${leads.length})` },
                { id: 'project' as const, label: `Project Form (${projectLeadsCount})` },
                { id: 'whatsapp' as const, label: `WhatsApp Widget (${whatsappLeadsCount})` },
                { id: 'verified' as const, label: `Verified (${verifiedCount})` },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-3 py-1.5 rounded-lg text-[12.5px] font-medium cursor-pointer transition-colors whitespace-nowrap z-10 ${
                      isActive
                        ? 'text-white'
                        : 'text-apple-gray-500 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="adminLeadFilterTab"
                        className="absolute inset-0 bg-apple-blue rounded-lg shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                      />
                    )}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leads List */}
          {filteredLeads.length === 0 ? (
            <Card className="p-12 text-center text-apple-gray-400 rounded-3xl">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <h3 className="text-[18px] font-semibold text-apple-black dark:text-white mb-1">No Inquiries Found</h3>
              <p className="text-[14px]">Inquiries submitted on the website or WhatsApp widget will appear here instantly.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredLeads.map((lead, index) => {
                const leadId = lead._id || lead.id || `lead-${index}`;
                const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
                const isWa = lead.source === 'whatsapp_widget';

                return (
                  <Card key={leadId} className="p-5 sm:p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-xs hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      
                      {/* Lead Details */}
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-[18px] sm:text-[20px] font-semibold text-[#000000] dark:text-white truncate">
                            {lead.name}
                          </h3>
                          
                          {/* Source Badge: WhatsApp Widget vs Project Form */}
                          {isWa ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#25D366]/15 text-[#0d7838] dark:text-[#25D366]">
                              <MessageCircle className="h-3.5 w-3.5 fill-[#25D366]" />
                              <span>WhatsApp Widget</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <FileText className="h-3.5 w-3.5" />
                              <span>Project Form</span>
                            </span>
                          )}

                          {/* Verification State */}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold ${
                            lead.verified 
                              ? 'bg-[#34C759]/10 text-[#34C759]' 
                              : 'bg-[#FF9500]/10 text-[#FF9500]'
                          }`}>
                            {lead.verified ? <CheckCircle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                            {lead.verified ? (isWa ? 'Verified' : 'Verified Email OTP') : 'Unverified'}
                          </span>

                          {lead.projectType && (
                            <span className="px-3 py-1 rounded-full text-[12px] font-medium bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#555555] dark:text-[#A1A1A6] border border-[#E5E5EA] dark:border-[#38383A]">
                              {lead.projectType}
                            </span>
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#555555] dark:text-[#A1A1A6] pt-1">
                          {lead.email && !lead.email.includes('@inquiry.virattom.com') && (
                            <div className="flex items-center gap-1.5 font-medium text-[#000000] dark:text-white">
                              <Mail className="h-4 w-4 text-[#0071E3]" />
                              <span>{lead.email}</span>
                            </div>
                          )}

                          {lead.phone && lead.phone !== 'N/A' && (
                            <div className="flex items-center gap-1.5 font-medium text-[#000000] dark:text-white">
                              <Phone className="h-4 w-4 text-[#0071E3]" />
                              <span>+91 {lead.phone}</span>
                            </div>
                          )}

                          {lead.budget ? (
                            <div className="flex items-center gap-1 text-[#34C759] font-semibold">
                              <span>Budget: ₹{Number(lead.budget).toLocaleString('en-IN')}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[#8E8E93] font-medium text-[13px]">
                              <span>Budget: Not specified</span>
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
                              Requirement Details:
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

                        {cleanPhone && (
                          <a
                            href={`tel:${cleanPhone}`}
                            className="min-h-[40px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-apple-gray-200 dark:border-[#38383A] text-apple-black dark:text-white text-[13px] font-medium hover:bg-apple-gray-200 transition-all"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            <span>Call</span>
                          </a>
                        )}

                        {lead.phone && (
                          <button
                            onClick={() => handleCopyPhone(lead.phone, leadId)}
                            className="min-h-[40px] min-w-[40px] p-2.5 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-[#555555] dark:text-[#A1A1A6] hover:text-[#000000] dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                            title="Copy phone"
                          >
                            {copiedId === leadId ? <Check className="h-4 w-4 text-[#34C759]" /> : <Copy className="h-4 w-4" />}
                          </button>
                        )}
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
              <h3 className="text-[18px] font-semibold text-apple-black dark:text-white mb-1">No Client Projects Yet</h3>
              <p className="text-[14px] mb-4">Click "Create Project" or convert an incoming lead to get started.</p>
              <Button onClick={() => setShowNewProjectModal(true)} className="rounded-xl">
                Create First Project
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {projects.map((project) => {
                const totalBudget = project.totalBudget || 25000;
                const advPercentage = project.advancePercentage || 20;
                const advAmount = project.advanceAmount || Math.round(totalBudget * (advPercentage / 100));

                return (
                  <Card key={project.id} className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-xs hover:shadow-md transition-all">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-[20px] font-bold text-apple-black dark:text-white">
                            {project.title}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-[12px] font-semibold bg-apple-blue/10 text-apple-blue">
                            {project.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[13px] text-apple-gray-500">
                          <div>
                            <span className="block text-apple-gray-400 text-[11px] uppercase font-semibold">Client Name</span>
                            <span className="font-medium text-apple-black dark:text-white">{project.clientName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-apple-gray-400 text-[11px] uppercase font-semibold">Phone / Login</span>
                            <span className="font-medium text-apple-black dark:text-white">+91 {project.clientPhone}</span>
                          </div>
                          <div>
                            <span className="block text-apple-gray-400 text-[11px] uppercase font-semibold">Total Budget</span>
                            <span className="font-medium text-apple-black dark:text-white">₹{totalBudget.toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-1 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1.5 ${
                            project.clientPortalApproved 
                              ? 'bg-apple-green/10 text-apple-green' 
                              : 'bg-apple-red/10 text-apple-red'
                          }`}>
                            {project.clientPortalApproved ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                            {project.clientPortalApproved ? 'Portal Access Granted' : 'Portal Access Locked'}
                          </span>

                          <span className={`px-3 py-1 rounded-full text-[12px] font-semibold flex items-center gap-1.5 ${
                            project.advancePaid 
                              ? 'bg-apple-green/10 text-apple-green' 
                              : 'bg-apple-orange/10 text-apple-orange'
                          }`}>
                            <CreditCard className="h-3.5 w-3.5" />
                            {project.advancePaid 
                              ? `20% Advance Cleared (₹${advAmount.toLocaleString('en-IN')})` 
                              : `20% Advance Pending (₹${advAmount.toLocaleString('en-IN')})`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap border-t lg:border-t-0 pt-4 lg:pt-0 border-apple-gray-100 dark:border-[#2C2C2E] shrink-0">
                        <button
                          onClick={() => handleTogglePortalAccess(project)}
                          className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                            project.clientPortalApproved
                              ? 'bg-apple-red/10 text-apple-red hover:bg-apple-red/20'
                              : 'bg-apple-green/10 text-apple-green hover:bg-apple-green/20'
                          }`}
                        >
                          {project.clientPortalApproved ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          <span>{project.clientPortalApproved ? 'Lock Portal' : 'Approve Portal'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleAdvancePaid(project)}
                          className={`px-4 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                            project.advancePaid
                              ? 'bg-apple-gray-100 text-apple-gray-600 dark:bg-[#2C2C2E] dark:text-[#A1A1A6]'
                              : 'bg-apple-green text-white hover:bg-green-600'
                          }`}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span>{project.advancePaid ? 'Mark Unpaid' : 'Confirm 20% Paid'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-2.5 rounded-xl text-apple-gray-400 hover:text-apple-red hover:bg-apple-red/10 transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
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
      {/* SECTION 3: RECRUITER OUTREACH                                            */}
      {/* ========================================================================= */}
      {currentSection === 'outreach' && (
        <RecruiterOutreachSection />
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: BASE PRICING CONFIGURATION                                     */}
      {/* ========================================================================= */}
      {currentSection === 'pricing' && (
        <Card className="p-6 sm:p-8 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-xs">
          <div className="mb-6">
            <h2 className="text-[20px] font-bold text-apple-black dark:text-white">
              Minimum Package Base Pricing
            </h2>
            <p className="text-[13px] text-apple-gray-500 mt-1">
              Configure minimum starting budgets for all service categories. These values dynamically drive frontend threshold warnings across project forms and WhatsApp inquiries.
            </p>
          </div>

          <form onSubmit={handleSavePrices} className="space-y-4 max-w-xl">
            {priceSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-apple-green/10 border border-apple-green/20 text-apple-green text-[13px] font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Base prices saved and synchronized across client portals.</span>
              </div>
            )}

            {priceError && (
              <div className="p-3.5 rounded-xl bg-apple-red/10 border border-apple-red/20 text-apple-red text-[13px] font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{priceError}</span>
              </div>
            )}

            {Object.entries(projectPrices).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-apple-gray-100 dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#2C2C2E]">
                <label className="text-[14px] font-semibold text-apple-black dark:text-white">
                  {key}
                </label>
                <div className="relative w-40">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-apple-gray-400 font-medium text-[14px]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => setProjectPrices({ ...projectPrices, [key]: Number(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white text-[14px] font-semibold outline-none focus:border-apple-blue"
                  />
                </div>
              </div>
            ))}

            <Button
              type="submit"
              disabled={savingPrices}
              className="w-full sm:w-auto px-6 rounded-xl min-h-[44px] gap-2 font-semibold"
            >
              <Save className="h-4 w-4" />
              <span>{savingPrices ? 'Saving Base Prices...' : 'Save Pricing Rules'}</span>
            </Button>
          </form>
        </Card>
      )}

      {/* NEW PROJECT MODAL */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1C1C1E] rounded-3xl shadow-2xl border border-apple-gray-200 dark:border-[#2C2C2E] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-apple-gray-100 dark:border-[#2C2C2E] pb-4">
              <h3 className="text-[20px] font-bold text-apple-black dark:text-white">
                Create Client Project
              </h3>
              <button onClick={() => setShowNewProjectModal(false)} className="text-apple-gray-400 hover:text-black dark:hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-apple-black dark:text-white mb-1">
                  Project Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Acme Corp Mobile App"
                  value={projectForm.title}
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-apple-black dark:text-white mb-1">
                    Client Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={projectForm.clientName}
                    onChange={e => setProjectForm({ ...projectForm, clientName: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-apple-black dark:text-white mb-1">
                    Client Mobile (10 digits) *
                  </label>
                  <Input
                    type="tel"
                    placeholder="9666635009"
                    value={projectForm.clientPhone}
                    onChange={e => setProjectForm({ ...projectForm, clientPhone: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-apple-black dark:text-white mb-1">
                    Client Email
                  </label>
                  <Input
                    type="email"
                    placeholder="client@example.com"
                    value={projectForm.clientEmail}
                    onChange={e => setProjectForm({ ...projectForm, clientEmail: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-apple-black dark:text-white mb-1">
                    Total Budget (₹) *
                  </label>
                  <Input
                    type="number"
                    placeholder="25000"
                    value={projectForm.totalBudget}
                    onChange={e => setProjectForm({ ...projectForm, totalBudget: e.target.value })}
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-apple-gray-100 dark:bg-[#2C2C2E]">
                <span className="text-[13px] font-medium text-apple-black dark:text-white">
                  Approve Portal Access Immediately
                </span>
                <input
                  type="checkbox"
                  checked={projectForm.clientPortalApproved}
                  onChange={e => setProjectForm({ ...projectForm, clientPortalApproved: e.target.checked })}
                  className="w-5 h-5 accent-apple-blue rounded-md cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-apple-gray-100 dark:bg-[#2C2C2E]">
                <span className="text-[13px] font-medium text-apple-black dark:text-white">
                  Mark 20% Advance as Paid
                </span>
                <input
                  type="checkbox"
                  checked={projectForm.advancePaid}
                  onChange={e => setProjectForm({ ...projectForm, advancePaid: e.target.checked })}
                  className="w-5 h-5 accent-apple-green rounded-md cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-apple-gray-200 dark:border-[#38383A] text-apple-black dark:text-white text-[14px] font-medium"
                >
                  Cancel
                </button>
                <Button type="submit" className="flex-1 rounded-xl text-[14px] font-semibold">
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
