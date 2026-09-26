import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  BookOpen,
  Search,
  Plus,
  Eye,
  ThumbsUp,
  FileText,
  ChevronRight,
  X,
  Edit3,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  Save,
  Tag,
  User,
  Clock,
} from 'lucide-react';
import { KnowledgeArticle } from '@/types';

export const KnowledgeBaseView: React.FC = () => {
  const {
    knowledgeArticles,
    addKnowledgeArticle,
    updateKnowledgeArticle,
    deleteKnowledgeArticle,
    voteHelpfulArticle,
    addToast,
    requestGeneralConfirmation,
    targetHighlightId,
  } = useQiyamStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected article for reading/editing modal
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(null);
  const [isEditingActive, setIsEditingActive] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    category: 'Standard Rates',
    content: '',
    status: 'published' as 'published' | 'draft' | 'archived',
  });

  // New article form
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Standard Rates',
    content: '',
    status: 'published' as 'published' | 'draft' | 'archived',
    last_updated: 'Today',
    author: 'AI Operations Lead',
    views: 1,
    helpful_percent: 100,
  });

  // Extract unique categories
  const categories = React.useMemo(() => {
    const cats = new Set(knowledgeArticles.map((a) => a.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [knowledgeArticles]);

  // Filtered articles
  const filteredArticles = React.useMemo(() => {
    return knowledgeArticles.filter((art) => {
      if (selectedCategory !== 'All' && art.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = art.title.toLowerCase().includes(q);
        const contentMatch = art.content.toLowerCase().includes(q);
        const catMatch = art.category.toLowerCase().includes(q);
        const authorMatch = (art.author || '').toLowerCase().includes(q);
        return titleMatch || contentMatch || catMatch || authorMatch;
      }
      return true;
    });
  }, [knowledgeArticles, selectedCategory, searchQuery]);

  // Open article for reading
  const handleOpenArticle = (art: KnowledgeArticle) => {
    setActiveArticle(art);
    setIsEditingActive(false);
    setEditForm({
      title: art.title,
      category: art.category,
      content: art.content,
      status: art.status,
    });
  };

  // Handle save edited article
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArticle) return;
    if (!editForm.title.trim() || !editForm.content.trim()) {
      addToast('Title and content cannot be empty', 'error');
      return;
    }

    await updateKnowledgeArticle(activeArticle.id, editForm);
    setActiveArticle({
      ...activeArticle,
      ...editForm,
      last_updated: 'Today',
    });
    setIsEditingActive(false);
  };

  // Handle delete article
  const handleDeleteArticle = () => {
    if (!activeArticle) return;
    requestGeneralConfirmation({
      title: 'Delete Knowledge Article?',
      message: `Are you sure you want to delete "${activeArticle.title}"?`,
      description: 'This document will be permanently removed from the AI Knowledge Base.',
      variant: 'danger',
      icon: 'trash',
      confirmLabel: 'Delete Article',
      cancelLabel: 'Cancel',
      itemBadge: {
        label: activeArticle.title,
        sublabel: activeArticle.category || 'Knowledge Base',
        badgeText: 'Article',
      },
      onConfirm: async () => {
        await deleteKnowledgeArticle(activeArticle.id);
        setActiveArticle(null);
      },
    });
  };

  // Handle create new article
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title || !docForm.content) {
      addToast('Please enter both title and content for the document', 'error');
      return;
    }

    await addKnowledgeArticle(docForm);
    setIsModalOpen(false);
    setDocForm({
      title: '',
      category: 'Standard Rates',
      content: '',
      status: 'published',
      last_updated: 'Today',
      author: 'AI Operations Lead',
      views: 1,
      helpful_percent: 100,
    });
  };

  // KPI calculations
  const totalArticles = knowledgeArticles.length;
  const totalViews = knowledgeArticles.reduce((sum, a) => sum + (a.views || 0), 0);
  const avgHelpful = Math.round(
    knowledgeArticles.reduce((sum, a) => sum + (a.helpful_percent || 95), 0) / (totalArticles || 1)
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="AI Knowledge Base & RAG Grounding"
        subtitle="Upload pricing matrices, SLAs, technical SOPs, and service guarantees used by Qiyam AI Copilot."
        primaryActionLabel="Add Knowledge Article"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-4 sm:p-6 space-y-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Active Articles</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">{totalArticles}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Grounding Qiyam Copilot</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Categories</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">{categories.length - 1}</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Structured domains</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Copilot Cites</span>
              <Eye className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">{totalViews}</div>
            <div className="text-[10px] text-blue-600 font-medium mt-0.5">Total agent references</div>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold">Accuracy Score</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">{avgHelpful}%</div>
            <div className="text-[10px] text-amber-600 font-medium mt-0.5">Verified answer rate</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title, service keywords, or content..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-purple-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredArticles.length}</span> of{' '}
              {knowledgeArticles.length} documents
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Article Cards Grid */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">No knowledge articles match your search</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query or select another category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {filteredArticles.map((art) => {
              const isTarget = targetHighlightId === art.id || targetHighlightId === art.title;
              return (
                <div
                  key={art.id}
                  onClick={() => handleOpenArticle(art)}
                  className={`bg-white p-5 rounded-2xl border shadow-2xs hover:shadow-md hover:border-purple-500 cursor-pointer transition-all space-y-3 flex flex-col justify-between group ${
                    isTarget ? 'ring-2 ring-purple-500 border-purple-400 bg-purple-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 truncate">
                        {art.category}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        {art.helpful_percent}% Helpful
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-purple-700 transition-colors">
                      {art.title}
                    </h3>
                    <p className="text-slate-600 text-[11px] line-clamp-3 leading-relaxed">
                      {art.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      <span>{art.views} reads</span>
                    </span>
                    <span>Updated: {art.last_updated}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Article Detail / Reader & Editor Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {activeArticle.category}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {activeArticle.helpful_percent}% Helpful
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {activeArticle.views} agent citations
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900">{activeArticle.title}</h3>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Author: {activeArticle.author || 'Operations Lead'}</span>
                  <span>•</span>
                  <span>Updated: {activeArticle.last_updated}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveArticle(null);
                  setIsEditingActive(false);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {isEditingActive ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Document Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-purple-500 transition"
                    >
                      <option value="Standard Rates">Standard Rates</option>
                      <option value="Service Policy">Service Policy</option>
                      <option value="Operations">Operations</option>
                      <option value="Technical SOPs">Technical SOPs</option>
                      <option value="Customer FAQs">Customer FAQs</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Status</label>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          status: e.target.value as 'published' | 'draft' | 'archived',
                        })
                      }
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 outline-none focus:border-purple-500 transition"
                    >
                      <option value="published">Published (Active)</option>
                      <option value="draft">Draft (Private)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Article Knowledge Content</label>
                  <textarea
                    rows={8}
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:border-purple-500 transition resize-none leading-relaxed font-sans"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingActive(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-slate-800 leading-relaxed whitespace-pre-line text-[13px]">
                  {activeArticle.content}
                </div>

                {/* Grounding Info Card */}
                <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                  <div className="text-[11px] text-purple-900 leading-snug">
                    <span className="font-bold">Active AI Grounding:</span> This document is indexed
                    into Qiyam Copilot RAG memory and automatically cited when answering client
                    questions.
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => voteHelpfulArticle(activeArticle.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful (+1)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingActive(true)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Document</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDeleteArticle}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add AI Knowledge Document</h3>
                <p className="text-xs text-slate-500">
                  Provide grounding knowledge for WhatsApp AI auto-responses.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial AC Maintenance Rate Card 2024"
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none text-slate-800"
                  >
                    <option value="Standard Rates">Standard Rates</option>
                    <option value="Service Policy">Service Policy</option>
                    <option value="Operations">Operations</option>
                    <option value="Technical SOPs">Technical SOPs</option>
                    <option value="Customer FAQs">Customer FAQs</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Author / Lead</label>
                  <input
                    type="text"
                    value={docForm.author}
                    onChange={(e) => setDocForm({ ...docForm, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Knowledge Content / Text *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Enter the full FAQ answers, pricing tiers, or service instructions that the AI should cite..."
                  value={docForm.content}
                  onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none text-slate-800 resize-none font-sans leading-relaxed"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Publish Knowledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
