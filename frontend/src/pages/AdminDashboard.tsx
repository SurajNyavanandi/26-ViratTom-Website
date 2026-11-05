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
  AlertCircle,
  History,
  Activity,
  Edit,
  StickyNote,
  Calendar
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RecruiterOutreachSection } from '@/components/admin/RecruiterOutreachSection';
import { AdminProjects } from '@/pages/AdminProjects';
import type { Lead, ClientProject, PortfolioProject } from '@/types';
import { formatCurrency, sanitizePhone, safeFetchJson, apiUrl } from '@/lib/utils';

interface AdminStats {
  pageViews: number;
  totalLeads: number;
  projectLeads: number;
  whatsappLeads: number;
}

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

interface AdminNoteItem {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<'leads' | 'projects' | 'portfolio' | 'outreach' | 'pricing' | 'notes' | 'history'>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [portfolioProjects, setPortfolioProjects] = useState<PortfolioProject[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notes, setNotes] = useState<AdminNoteItem[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    pageViews: 1248,
    totalLeads: 0,
    projectLeads: 0,
    whatsappLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'project' | 'whatsapp' | 'verified'>('all');

  // Base Prices Configuration State
  const [projectPrices, setProjectPrices] = useState<Record<string, number>>({
    'Static Website': 4999,
    'Dynamic Website': 9999,
    'Online Store': 14999,
    'Mobile App': 25999,
    'Website + Mobile App': 32999,
  });
  const [savingPrices, setSavingPrices] = useState(false);

  // New Client Project Modal State
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

  // Portfolio Project CRUD State
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    type: 'Static Website',
    url: '',
    imageUrl: '',
    description: '',
  });

  // Admin Notes CRUD State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: ''
  });
  const [savingNote, setSavingNote] = useState(false);

  const fetchData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token || ''}` };
    
    try {
      const [leadsRes, projectsRes, portfolioRes, pricesRes, statsRes, logsRes, notesRes] = await Promise.all([
        safeFetchJson<Lead[]>('/api/admin/leads', { headers }),
        safeFetchJson<ClientProject[]>('/api/admin/projects', { headers }),
        safeFetchJson<PortfolioProject[]>('/api/projects'),
        safeFetchJson<{ success: boolean; prices: Record<string, number> }>('/api/admin/project-prices', { headers }),
        safeFetchJson<AdminStats>('/api/admin/stats', { headers }),
        safeFetchJson<{ success: boolean; logs: ActivityLog[] }>('/api/admin/logs', { headers }),
        safeFetchJson<{ success: boolean; notes: AdminNoteItem[] }>('/api/admin/notes', { headers })
      ]);

      setLeads(Array.isArray(leadsRes.data) ? leadsRes.data : []);
      setProjects(Array.isArray(projectsRes.data) ? projectsRes.data : []);
      if (Array.isArray(portfolioRes.data)) {
        setPortfolioProjects(portfolioRes.data);
      }
      if (pricesRes.data?.prices) {
        setProjectPrices(prev => ({ ...prev, ...pricesRes.data.prices }));
      }
      if (statsRes.data?.pageViews !== undefined) {
        setStats(statsRes.data);
      }
      if (logsRes.data?.logs) {
        setActivityLogs(logsRes.data.logs);
      }
      if (notesRes.data?.notes) {
        setNotes(notesRes.data.notes);
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to delete this lead submission?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(apiUrl(`/api/admin/leads/${leadId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => (l._id || l.id) !== leadId));
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePortfolioProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    try {
      const url = editingPortfolioId
        ? apiUrl(`/api/admin/projects/${editingPortfolioId}`)
        : apiUrl('/api/admin/projects');
      const method = editingPortfolioId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify(portfolioForm),
      });
      const data = await res.json();
      if (data.success || data._id) {
        setShowPortfolioModal(false);
        setEditingPortfolioId(null);
        setPortfolioForm({ title: '', type: 'Static Website', url: '', imageUrl: '', description: '' });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePortfolioProject = async (projId: string) => {
    if (!window.confirm('Delete this showcase project?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      await fetch(apiUrl(`/api/admin/projects/${projId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrices(true);

    const token = localStorage.getItem('admin_token');
    try {
      await safeFetchJson('/api/admin/project-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ prices: projectPrices }),
      });
    } catch (err) {
      console.error("Price save error:", err);
    } finally {
      setSavingPrices(false);
    }
  };

  const handleCreateClientProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    try {
      const res = await safeFetchJson('/api/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify(projectForm),
      });

      if (res.ok) {
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
        fetchData();
      }
    } catch (err) {
      console.error("Create project error:", err);
    }
  };

  // Save / Update Admin Note
  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.content.trim()) return;
    setSavingNote(true);

    const token = localStorage.getItem('admin_token');
    try {
      const url = editingNoteId
        ? apiUrl(`/api/admin/notes/${editingNoteId}`)
        : apiUrl('/api/admin/notes');
      const method = editingNoteId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        body: JSON.stringify(noteForm),
      });
      const data = await res.json();
      if (data.success || data.note) {
        setShowNoteModal(false);
        setEditingNoteId(null);
        setNoteForm({ title: '', content: '' });
        fetchData();
      }
    } catch (err) {
      console.error('Save note error:', err);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete Admin Note
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(apiUrl(`/api/admin/notes/${noteId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotes((prev) => prev.filter((n) => (n._id || n.id) !== noteId));
        fetchData();
      }
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (lead.name || '').toLowerCase().includes(q) ||
      (lead.email || '').toLowerCase().includes(q) ||
      (lead.phone || '').includes(q) ||
      (lead.projectType || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (activeTab === 'project') return lead.source !== 'whatsapp_widget';
    if (activeTab === 'whatsapp') return lead.source === 'whatsapp_widget';
    if (activeTab === 'verified') return Boolean(lead.verified);
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Admin Controls & Section Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1C1C1E] p-5 sm:p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] shadow-2xs">
        <div>
          <span className="text-[12px] font-semibold text-apple-blue uppercase tracking-wider block mb-1">
            Control Center
          </span>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-apple-black dark:text-white tracking-tight">
            VIRAT TOM Administrative Panel
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={currentSection === 'leads' ? 'primary' : 'outline'}
            onClick={() => setCurrentSection('leads')}
            className="rounded-xl text-[13px] gap-2 h-9"
          >
            <Inbox className="h-4 w-4" />
            <span>Inbound Leads ({leads.length})</span>
          </Button>

          <Button
            variant={currentSection === 'projects' ? 'primary' : 'outline'}
            onClick={() => setCurrentSection('projects')}
            className="rounded-xl text-[13px] gap-2 h-9"
          >
            <Layers className="h-4 w-4" />
            <span>Client Workspaces ({projects.length})</span>
          </Button>

          <Button
            variant={currentSection === 'portfolio' ? 'primary' : 'outline'}
            onClick={() => setCurrentSection('portfolio')}
            className="rounded-xl text-[13px] gap-2 h-9"
          >
            <Globe className="h-4 w-4" />
            <span>Showcase Projects ({portfolioProjects.length})</span>
          </Button>

          <Button
            variant={currentSection === 'notes' ? 'primary' : 'outline'}
            onClick={() => setCurrentSection('notes')}
            className="rounded-xl text-[13px] gap-2 h-9"
          >
            <StickyNote className="h-4 w-4" />
            <span>Notes ({notes.length})</span>
          </Button>

          <Button
            variant={currentSection === 'outreach' ? 'primary' : 'outline'}
            onClick={() => setCurrentSection('outreach')}
            className="rounded-xl text-[13px] gap-2 h-9"
          >
            <Mail className="h-4 w-4" />
            <span>Recruiter Outreach</span>
          </Button>

          <Button
            variant={currentSection === 'pricing' ? 'primary' : 'outline'}
            onClick={() => setCurrentSection('pricing')}
            className="rounded-xl text-[13px] gap-2 h-9"
          >
            <DollarSign className="h-4 w-4" />
            <span>Base Pricing</span>
          </Button>

          <Button
            variant={currentSection === 'history' ? 'primary' : 'outline'}
            onClick={() => setCurrentSection('history')}
            className="rounded-xl text-[13px] gap-2 h-9"
          >
            <History className="h-4 w-4" />
            <span>Activity History</span>
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4.5 rounded-2xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]">
          <span className="text-[11.5px] font-semibold text-apple-gray-500 uppercase tracking-wider block mb-1">
            Total Pageviews
          </span>
          <span className="text-[22px] font-bold text-apple-black dark:text-white font-mono">
            {stats.pageViews.toLocaleString()}
          </span>
        </Card>

        <Card className="p-4.5 rounded-2xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]">
          <span className="text-[11.5px] font-semibold text-apple-gray-500 uppercase tracking-wider block mb-1">
            Total Submissions
          </span>
          <span className="text-[22px] font-bold text-apple-blue font-mono">
            {stats.totalLeads || leads.length}
          </span>
        </Card>

        <Card className="p-4.5 rounded-2xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]">
          <span className="text-[11.5px] font-semibold text-apple-gray-500 uppercase tracking-wider block mb-1">
            Saved Notes
          </span>
          <span className="text-[22px] font-bold text-purple-600 dark:text-purple-400 font-mono">
            {notes.length}
          </span>
        </Card>

        <Card className="p-4.5 rounded-2xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E]">
          <span className="text-[11.5px] font-semibold text-apple-gray-500 uppercase tracking-wider block mb-1">
            WhatsApp Inquiries
          </span>
          <span className="text-[22px] font-bold text-[#25D366] font-mono">
            {stats.whatsappLeads || leads.filter(l => l.source === 'whatsapp_widget').length}
          </span>
        </Card>
      </div>

      {/* SECTION: Leads / Form Submissions */}
      {currentSection === 'leads' && (
        <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-apple-gray-200 dark:border-[#38383A]">
            <h2 className="text-[18px] font-bold text-apple-black dark:text-white">
              Inbound Lead Submissions ({filteredLeads.length})
            </h2>

            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, email, phone..."
                className="w-64 h-9 text-[13px] rounded-xl"
              />
              <Button onClick={() => fetchData(true)} variant="outline" className="h-9 px-3 rounded-xl">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-apple-gray-50 dark:bg-[#2C2C2E]/60 text-apple-gray-500 border-y border-apple-gray-200 dark:border-[#38383A]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Contact &amp; Name</th>
                  <th className="py-3 px-4 font-semibold">Project Type</th>
                  <th className="py-3 px-4 font-semibold">Budget</th>
                  <th className="py-3 px-4 font-semibold">Source</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-gray-200 dark:divide-[#38383A]">
                {filteredLeads.map((lead) => {
                  const leadId = String(lead._id || lead.id);
                  return (
                    <tr key={leadId} className="hover:bg-apple-gray-50/50 dark:hover:bg-[#2C2C2E]/30">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-apple-black dark:text-white">{lead.name}</div>
                        <div className="text-[12px] text-apple-gray-500 font-mono">
                          {lead.phone} • {lead.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-apple-gray-800 dark:text-apple-gray-200">
                        {lead.projectType || 'General Inquiry'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-apple-black dark:text-white">
                        {typeof lead.budget === 'number' ? formatCurrency(lead.budget) : (lead.budget || 'N/A')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          lead.source === 'whatsapp_widget'
                            ? 'bg-[#25D366]/10 text-[#25D366]'
                            : 'bg-apple-blue/10 text-apple-blue'
                        }`}>
                          {lead.source === 'whatsapp_widget' ? 'WhatsApp' : 'Form'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteLead(leadId)}
                          className="h-8 px-2.5 rounded-lg text-apple-red hover:bg-apple-red/10 border-apple-red/20"
                          title="Delete Lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* SECTION: Client Workspaces */}
      {currentSection === 'projects' && <AdminProjects />}

      {/* SECTION: Showcase Portfolio Projects CRUD */}
      {currentSection === 'portfolio' && (
        <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-apple-gray-200 dark:border-[#38383A]">
            <h2 className="text-[18px] font-bold text-apple-black dark:text-white">
              Showcase Portfolio Projects ({portfolioProjects.length})
            </h2>
            <Button onClick={() => {
              setEditingPortfolioId(null);
              setPortfolioForm({ title: '', type: 'Static Website', url: '', imageUrl: '', description: '' });
              setShowPortfolioModal(true);
            }} className="h-9 px-4 rounded-xl gap-2">
              <Plus className="h-4 w-4" /> Add Showcase Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portfolioProjects.map((item) => (
              <Card key={item._id} className="p-4.5 rounded-2xl border border-apple-gray-200 dark:border-[#38383A] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[15px] text-apple-black dark:text-white">{item.title}</h3>
                    <span className="text-[11.5px] font-semibold text-apple-blue uppercase tracking-wider">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPortfolioId(item._id);
                        setPortfolioForm({
                          title: item.title,
                          type: item.type,
                          url: item.url,
                          imageUrl: item.imageUrl,
                          description: item.description,
                        });
                        setShowPortfolioModal(true);
                      }}
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePortfolioProject(item._id)}
                      className="h-8 w-8 p-0 rounded-lg text-apple-red border-apple-red/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-[12.5px] text-apple-gray-500 line-clamp-2">{item.description}</p>
                <a href={item.url} target="_blank" rel="noreferrer" className="text-[12px] text-apple-blue underline flex items-center gap-1 font-mono">
                  <span>{item.url}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* SECTION: Admin Notes */}
      {currentSection === 'notes' && (
        <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-apple-gray-200 dark:border-[#38383A]">
            <div>
              <h2 className="text-[18px] font-bold text-apple-black dark:text-white flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span>Important Admin Notes ({notes.length})</span>
              </h2>
              <p className="text-[12.5px] text-apple-gray-500 mt-0.5">
                Store key reminders, operational guidelines, client credentials, or task notes with timestamp history.
              </p>
            </div>
            <Button onClick={() => {
              setEditingNoteId(null);
              setNoteForm({ title: '', content: '' });
              setShowNoteModal(true);
            }} className="h-9 px-4 rounded-xl gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-apple-gray-200 dark:border-[#38383A] rounded-2xl">
              <StickyNote className="h-8 w-8 text-apple-gray-400 mx-auto mb-2" />
              <p className="text-[14px] text-apple-gray-500 font-medium">No notes saved yet.</p>
              <p className="text-[12px] text-apple-gray-400 mt-1">Click "Add Note" above to store your first important note.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note) => {
                const noteId = String(note._id || note.id);
                const formattedDate = new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <Card key={noteId} className="p-5 rounded-2xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-[15px] text-apple-black dark:text-white line-clamp-1">
                          {note.title || 'Untitled Note'}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingNoteId(noteId);
                              setNoteForm({ title: note.title, content: note.content });
                              setShowNoteModal(true);
                            }}
                            className="h-7 w-7 p-0 rounded-lg text-apple-gray-600 dark:text-apple-gray-300"
                            title="Edit Note"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteNote(noteId)}
                            className="h-7 w-7 p-0 rounded-lg text-apple-red border-apple-red/20"
                            title="Delete Note"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-[13px] text-apple-gray-700 dark:text-apple-gray-300 whitespace-pre-wrap leading-relaxed line-clamp-6 mb-4">
                        {note.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-apple-gray-200/80 dark:border-[#38383A] flex items-center justify-between text-[11.5px] text-apple-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-purple-500" />
                        <span>{formattedDate}</span>
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-purple-600 dark:text-purple-400">
                        Saved
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* SECTION: Recruiter Outreach */}
      {currentSection === 'outreach' && <RecruiterOutreachSection />}

      {/* SECTION: Base Pricing */}
      {currentSection === 'pricing' && (
        <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] max-w-2xl space-y-5">
          <h2 className="text-[18px] font-bold text-apple-black dark:text-white">Base Project Pricing Configuration</h2>
          <form onSubmit={handleSavePrices} className="space-y-4">
            {Object.entries(projectPrices).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <label className="text-[14px] font-semibold text-apple-black dark:text-white w-1/2">{key}</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setProjectPrices({ ...projectPrices, [key]: Number(e.target.value) })}
                  className="w-1/2 h-10 rounded-xl"
                />
              </div>
            ))}
            <Button type="submit" isLoading={savingPrices} className="w-full h-11 rounded-xl">Save Base Prices</Button>
          </form>
        </Card>
      )}

      {/* SECTION: Activity History & Audit Logs */}
      {currentSection === 'history' && (
        <Card className="p-6 rounded-3xl border border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-apple-gray-200 dark:border-[#38383A]">
            <h2 className="text-[18px] font-bold text-apple-black dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-apple-blue" />
              <span>Admin Activity &amp; Audit Log</span>
            </h2>
            <Button onClick={() => fetchData(true)} variant="outline" className="h-8 px-3 rounded-xl">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-apple-gray-200/80 dark:border-[#38383A] bg-apple-gray-50/50 dark:bg-[#2C2C2E]/40 flex items-center justify-between gap-3 text-[13px]">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-md bg-apple-blue/10 text-apple-blue font-bold text-[10px] uppercase tracking-wider">
                    {log.action}
                  </span>
                  <span className="font-medium text-apple-black dark:text-white">{log.details}</span>
                </div>
                <span className="text-[11.5px] text-apple-gray-400 font-mono shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* MODAL: Admin Note Form */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] space-y-4">
            <h2 className="text-[18px] font-bold text-apple-black dark:text-white">
              {editingNoteId ? 'Edit Admin Note' : 'Add Important Admin Note'}
            </h2>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div>
                <label className="block text-[12px] font-semibold text-apple-black dark:text-white mb-1">
                  Note Title
                </label>
                <Input
                  placeholder="e.g. Client Credentials or Key Milestone"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-apple-black dark:text-white mb-1">
                  Note Content <span className="text-apple-red">*</span>
                </label>
                <textarea
                  placeholder="Write your note details, important points, credentials or updates here..."
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  required
                  rows={5}
                  className="w-full p-3 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#2C2C2E] text-apple-black dark:text-white text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNoteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={savingNote} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Save Note
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: Portfolio Project Form */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] space-y-4">
            <h2 className="text-[18px] font-bold text-apple-black dark:text-white">
              {editingPortfolioId ? 'Edit Showcase Project' : 'Add Showcase Project'}
            </h2>
            <form onSubmit={handleSavePortfolioProject} className="space-y-3">
              <Input
                placeholder="Project Title (e.g. Husoro)"
                value={portfolioForm.title}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                required
              />
              <Input
                placeholder="Category (e.g. Static Website)"
                value={portfolioForm.type}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, type: e.target.value })}
                required
              />
              <Input
                placeholder="Live URL (e.g. https://husoro.com)"
                value={portfolioForm.url}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
                required
              />
              <Input
                placeholder="Image URL"
                value={portfolioForm.imageUrl}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, imageUrl: e.target.value })}
              />
              <textarea
                placeholder="Description..."
                value={portfolioForm.description}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                className="w-full h-20 p-3 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] text-[13px]"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPortfolioModal(false)}>Cancel</Button>
                <Button type="submit">Save Project</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* MODAL: New Client Project */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="max-w-lg w-full p-6 rounded-3xl bg-white dark:bg-[#1C1C1E] space-y-4">
            <h2 className="text-[18px] font-bold text-apple-black dark:text-white">Create New Client Project</h2>
            <form onSubmit={handleCreateClientProject} className="space-y-3">
              <Input
                placeholder="Project Title"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                required
              />
              <Input
                placeholder="Client Name"
                value={projectForm.clientName}
                onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
                required
              />
              <Input
                placeholder="Client 10-digit Phone"
                value={projectForm.clientPhone}
                onChange={(e) => setProjectForm({ ...projectForm, clientPhone: e.target.value })}
                required
              />
              <Input
                placeholder="Client Email"
                value={projectForm.clientEmail}
                onChange={(e) => setProjectForm({ ...projectForm, clientEmail: e.target.value })}
              />
              <Input
                placeholder="Total Budget (e.g. 25000)"
                type="number"
                value={projectForm.totalBudget}
                onChange={(e) => setProjectForm({ ...projectForm, totalBudget: e.target.value })}
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowNewProjectModal(false)}>Cancel</Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
