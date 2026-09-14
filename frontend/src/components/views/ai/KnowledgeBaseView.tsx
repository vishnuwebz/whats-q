import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BookOpen, Search, Plus, Eye, ThumbsUp, FileText, ChevronRight, X } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeArticles, addKnowledgeArticle, addToast, targetHighlightId } = useQiyamStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New article form
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Standard Rates',
    content: '',
    status: 'published' as 'published' | 'draft' | 'archived',
    last_updated: 'Today',
    author: 'AI Operations Lead',
    views: 1,
    helpful_percent: 100
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title || !docForm.content) {
      addToast('Please enter both title and content for the document', 'error');
      return;
    }

    addKnowledgeArticle(docForm);
    addToast(`Knowledge article "${docForm.title}" published for AI agents!`, 'success');
    setIsModalOpen(false);
    setDocForm({
      title: '',
      category: 'Standard Rates',
      content: '',
      status: 'published',
      last_updated: 'Today',
      author: 'AI Operations Lead',
      views: 1,
      helpful_percent: 100
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="AI Knowledge Base"
        subtitle="Upload company documents, price lists, FAQs, and policies for AI RAG groundings."
        primaryActionLabel="Add Article / Document"
        onPrimaryAction={() => setIsModalOpen(true)}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {knowledgeArticles.map((art) => {
            const isTarget = targetHighlightId === art.id || targetHighlightId === art.title;
            return (
              <div
                key={art.id}
                className={`bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-purple-500 cursor-pointer transition-all space-y-3 ${
                  isTarget ? 'ring-2 ring-purple-500 border-purple-400 bg-purple-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {art.category}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    {art.helpful_percent}% Helpful
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug flex items-center gap-2">
                  {art.title}
                  {isTarget && (
                    <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                      Target
                    </span>
                  )}
                </h3>
                <p className="text-slate-500 text-[11px] line-clamp-2">{art.content}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
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
      </div>

      {/* Add Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add AI Knowledge Document</h3>
                <p className="text-xs text-slate-500">Provide grounding knowledge for WhatsApp AI auto-responses.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Document Title *</label>
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
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none text-slate-800"
                  >
                    <option value="Standard Rates">Standard Rates</option>
                    <option value="Technician Policies">Technician Policies</option>
                    <option value="Customer FAQs">Customer FAQs</option>
                    <option value="Warranty Terms">Warranty Terms</option>
                    <option value="Promotions">Promotions & Coupons</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Author / Lead</label>
                  <input
                    type="text"
                    value={docForm.author}
                    onChange={(e) => setDocForm({ ...docForm, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Knowledge Content / Text *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Enter the full FAQ answers, pricing tiers, or service instructions that the AI should cite..."
                  value={docForm.content}
                  onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-purple-500 outline-none text-slate-800 resize-none font-sans"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-sm transition-all"
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


