import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { BookOpen, Search, Plus, Eye, ThumbsUp, FileText, ChevronRight } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeArticles, addToast } = useQiyamStore();

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="AI Knowledge Base"
        subtitle="Upload company documents, price lists, FAQs, and policies for AI RAG groundings."
        primaryActionLabel="Add Article / Document"
        onPrimaryAction={() => addToast('Upload knowledge document modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          {knowledgeArticles.map((art) => (
            <div
              key={art.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-500 cursor-pointer transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {art.category}
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {art.helpful_percent}% Helpful
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 leading-snug">{art.title}</h3>
              <p className="text-slate-500 text-[11px] line-clamp-2">{art.content}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{art.views} reads</span>
                </span>
                <span>Updated: {art.last_updated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


