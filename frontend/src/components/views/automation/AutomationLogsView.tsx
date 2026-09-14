import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Clock, CheckCircle2, AlertTriangle, Play, Filter, Search } from 'lucide-react';
import { exportTableToCsv } from '@/utils/exportCsv';

export const AutomationLogsView: React.FC = () => {
  const store = useQiyamStore();
  const { workflowLogs, addToast } = store;

  const handleExport = () => {
    const res = exportTableToCsv('automation-logs', store);
    addToast(`Execution logs exported (${res.count} records downloaded as ${res.filename})`, 'success');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Automation Execution Logs"
        subtitle="Real-time execution traces, step durations, and error monitoring."
        primaryActionLabel="Export Execution Logs"
        onPrimaryAction={handleExport}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[760px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Workflow Action</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Message / Step</th>
                  <th className="py-3 px-4">Triggered By</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {workflowLogs.map((log) => {
                  const isSuccess = log.status === 'success';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-sans text-slate-500 whitespace-nowrap">{log.time_str}</td>
                      <td className="py-3.5 px-4 font-sans font-bold text-slate-900">{log.workflow_action}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-600">{log.branch}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-800">{log.message}</td>
                      <td className="py-3.5 px-4 font-sans text-slate-500">{log.triggered_by}</td>
                      <td className="py-3.5 px-4 font-bold text-purple-700">{log.duration}</td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};


