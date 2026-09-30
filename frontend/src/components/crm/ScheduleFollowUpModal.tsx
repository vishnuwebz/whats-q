import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, Sparkles, CheckCircle2, MessageSquare, Send, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { FollowUp, Lead } from '@/types';
import { CountryPhoneInput } from '@/components/common/CountryPhoneInput';
import { AgentSelectDropdown } from '@/components/common/AgentSelectDropdown';
import { ModernDatePicker } from '@/components/common/ModernDatePicker';
import { ModernTimePicker } from '@/components/common/ModernTimePicker';

export interface ScheduleFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: Lead | null;
  initialFollowUp?: FollowUp | null;
  isEditMode?: boolean;
  onSuccess?: (created: FollowUp) => void;
}

export const ScheduleFollowUpModal: React.FC<ScheduleFollowUpModalProps> = ({
  isOpen,
  onClose,
  initialLead,
  initialFollowUp,
  isEditMode = false,
  onSuccess,
}) => {
  const { customers, followups, employees, addFollowUp, updateFollowUp, updateLeadStage, updateLead, addToast, setActiveTab } = useQiyamStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [matchedFollowUp, setMatchedFollowUp] = useState<FollowUp | null>(null);
  const [assignmentNotice, setAssignmentNotice] = useState<{
    employeeName: string;
    employeePhone?: string;
    customerName: string;
    dueDate: string;
    dueTime: string;
    createdFollowUp?: FollowUp;
  } | null>(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    customer_name: '',
    phone: '',
    related_to: '',
    follow_up_type: 'call' as 'call' | 'whatsapp' | 'email' | 'meeting',
    assigned_to: 'Vikram Patel',
    due_date: todayStr,
    due_time: '11:00 AM',
    status: 'due_today' as 'due_today' | 'scheduled' | 'overdue' | 'completed',
    priority: 'high' as 'high' | 'medium' | 'low',
    notes: '',
  });

  // Populate form based on initial lead or initial follow-up
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && initialFollowUp) {
      setMatchedFollowUp(initialFollowUp);
      setFormData({
        title: initialFollowUp.title || '',
        customer_name: initialFollowUp.customer_name || '',
        phone: initialFollowUp.phone || '',
        related_to: initialFollowUp.related_to || '',
        follow_up_type: initialFollowUp.follow_up_type || 'call',
        assigned_to: initialFollowUp.assigned_to || 'Vikram Patel',
        due_date: initialFollowUp.due_date || todayStr,
        due_time: initialFollowUp.due_time || '11:00 AM',
        status: initialFollowUp.status || 'scheduled',
        priority: initialFollowUp.priority || 'medium',
        notes: initialFollowUp.notes || '',
      });
    } else if (initialLead) {
      const cleanPhone = (p?: string) => String(p || '').replace(/\D/g, '').slice(-10);
      const leadDigits = cleanPhone(initialLead.phone);
      const existing = followups.find((f) => {
        if (f.related_to && f.related_to.includes(`Lead #${initialLead.id}`)) return true;
        if (leadDigits && cleanPhone(f.phone) === leadDigits) return true;
        return false;
      }) || null;

      setMatchedFollowUp(existing);

      setFormData({
        title: existing?.title || `Follow-up with ${initialLead.name}`,
        customer_name: initialLead.name,
        phone: initialLead.phone || '',
        related_to: existing?.related_to || `Lead #${initialLead.id} - ${initialLead.name} (${initialLead.service || 'Service'})`,
        follow_up_type: existing?.follow_up_type || 'whatsapp',
        assigned_to: existing?.assigned_to || initialLead.owner || 'Rahul Mehta',
        due_date: existing?.due_date || initialLead.next_follow_up_date || todayStr,
        due_time: existing?.due_time || initialLead.next_follow_up_time || '11:00 AM',
        status: existing?.status === 'completed' ? 'due_today' : (existing?.status || 'due_today'),
        priority: existing?.priority || 'high',
        notes: existing?.notes || initialLead.notes || '',
      });
    } else {
      setMatchedFollowUp(null);
      setFormData({
        title: '',
        customer_name: '',
        phone: '',
        related_to: '',
        follow_up_type: 'call',
        assigned_to: 'Vikram Patel',
        due_date: todayStr,
        due_time: '11:00 AM',
        status: 'due_today',
        priority: 'high',
        notes: '',
      });
    }
  }, [isOpen, isEditMode, initialFollowUp, initialLead, followups, todayStr]);

  if (!isOpen) return null;

  // Handle customer quick-picker in modal
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    if (!custId) return;
    const found = (customers as any[]).find((c) => String(c.id) === String(custId) || c.phone === custId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        customer_name: found.name || found.contact_name || '',
        phone: found.phone || found.phone_number || '',
        related_to: prev.related_to || found.service_needed || `Customer #${found.id} - ${found.name || 'Account'}`,
      }));
    }
  };

  // Automatically adjust status when date changes
  const handleDateChange = (dateVal: string) => {
    let suggestedStatus: 'due_today' | 'scheduled' | 'overdue' = 'scheduled';
    if (dateVal === todayStr) {
      suggestedStatus = 'due_today';
    } else if (dateVal < todayStr) {
      suggestedStatus = 'overdue';
    } else {
      suggestedStatus = 'scheduled';
    }
    setFormData((prev) => ({
      ...prev,
      due_date: dateVal,
      status: prev.status === 'completed' ? 'completed' : suggestedStatus,
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast('Please enter a follow-up title', 'error');
      return;
    }
    if (!formData.customer_name.trim()) {
      addToast('Please enter customer name', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const effectiveFollowUpId = (isEditMode && initialFollowUp?.id) || matchedFollowUp?.id;

      let resultingFollowUp: FollowUp;
      if (effectiveFollowUpId) {
        await updateFollowUp(effectiveFollowUpId, formData);
        if (initialLead) {
          await updateLead(initialLead.id, {
            stage: 'follow_up',
            next_follow_up_date: formData.due_date,
            next_follow_up_time: formData.due_time,
            owner: formData.assigned_to,
          });
          addToast(`Follow-up rescheduled & updated for ${initialLead.name}!`, 'success');
        } else {
          addToast(`Follow-up "${formData.title}" updated successfully!`, 'success');
        }
        resultingFollowUp = { ...formData, id: effectiveFollowUpId } as FollowUp;
      } else {
        const created = await addFollowUp({
          ...formData,
          related_to: formData.related_to.trim() || (initialLead ? `Lead #${initialLead.id} - ${initialLead.name}` : 'General Inquiry'),
        });

        // If triggered from a lead drag or stage select
        if (initialLead) {
          await updateLead(initialLead.id, {
            stage: 'follow_up',
            next_follow_up_date: formData.due_date,
            next_follow_up_time: formData.due_time,
            owner: formData.assigned_to,
          });
          addToast(`Follow-up scheduled & moved ${initialLead.name} to Follow-up stage!`, 'success');
        }

        resultingFollowUp = created;
      }

      const assignedEmp = employees.find(
        (e) => e.name.toLowerCase() === formData.assigned_to.toLowerCase() || e.name.toLowerCase().includes(formData.assigned_to.toLowerCase())
      );
      const empPhone = assignedEmp?.phone || '';

      setAssignmentNotice({
        employeeName: formData.assigned_to,
        employeePhone: empPhone,
        customerName: formData.customer_name,
        dueDate: formData.due_date,
        dueTime: formData.due_time,
        createdFollowUp: resultingFollowUp,
      });
    } catch (err: any) {
      console.error('[ScheduleFollowUpModal] Submit error:', err);
      addToast('Failed to save follow-up. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReschedule = Boolean(matchedFollowUp || isEditMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">
                {assignmentNotice ? 'Assignment Confirmation' : (isReschedule ? 'Reschedule / Edit Follow-up' : 'Schedule New Follow-up')}
              </h3>
              {initialLead && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200">
                  Lead #{initialLead.id}
                </span>
              )}
              {matchedFollowUp && !isEditMode && !assignmentNotice && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  Reschedule Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {assignmentNotice
                ? 'Follow-up created and WhatsApp alert sent to staff.'
                : (initialLead
                  ? (isReschedule ? `Update existing scheduled interaction for ${initialLead.name}.` : `Plan next interaction with ${initialLead.name} to advance pipeline.`)
                  : 'Plan customer outreach, calls, or reminders with staff.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {assignmentNotice ? (
          <div className="py-5 px-1 space-y-4 animate-fadeIn text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                WhatsApp Notification Dispatched
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-2">
                Follow-up Scheduled & Employee Notified!
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Lead for <strong className="text-slate-800">{assignmentNotice.customerName}</strong> is moved to <span className="font-semibold text-sky-700">Follow-up</span> stage.
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/60 border border-emerald-200 rounded-2xl text-left space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Notification Sent</span>
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                A WhatsApp notification has been dispatched to <strong>{assignmentNotice.employeeName}</strong>
                {assignmentNotice.employeePhone ? (
                  <span className="font-mono text-emerald-700 ml-1">({assignmentNotice.employeePhone})</span>
                ) : null}.
              </p>
              <div className="p-3 bg-white/95 rounded-xl border border-emerald-300 text-xs text-slate-800 font-medium leading-relaxed shadow-2xs">
                ⚠️ <strong className="text-emerald-950">Action Required:</strong> Please ask <strong>{assignmentNotice.employeeName}</strong> to check their WhatsApp and log in to their <strong>Employee Dashboard</strong> to chat with this lead and update the lead stage (<strong>Contacted, Follow-up, Negotiation, Won, or Lost</strong>).
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (assignmentNotice.createdFollowUp) {
                    onSuccess?.(assignmentNotice.createdFollowUp);
                  }
                  setAssignmentNotice(null);
                  onClose();
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
              >
                Acknowledge & Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (assignmentNotice.createdFollowUp) {
                    onSuccess?.(assignmentNotice.createdFollowUp);
                  }
                  setAssignmentNotice(null);
                  onClose();
                  setActiveTab('employee-portal');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Open Employee Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3.5 text-xs">
          {/* Optional Quick Customer Directory Selector (Only when creating independently) */}
          {!isEditMode && !initialLead && customers && customers.length > 0 && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="font-semibold text-slate-700 block mb-1">
                Select From Existing Customer Directory (Optional)
              </label>
              <select
                onChange={handleSelectCustomer}
                defaultValue=""
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="">-- Choose existing customer to auto-fill --</option>
                {(customers as any[]).map((c) => (
                  <option key={c.id || c.phone} value={c.id || c.phone}>
                    {c.name || c.contact_name} ({c.phone || c.phone_number || 'No Phone'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Follow-up Title */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Follow-up Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Call back for quotation confirmation"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>

            {/* Related To */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Related To / Service / Deal</label>
              <input
                type="text"
                placeholder="e.g. AC Installation - Vikram Mehta DEAL-1024"
                value={formData.related_to}
                onChange={(e) => setFormData({ ...formData, related_to: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunil Kumar"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800"
              />
            </div>

            {/* Phone Number with CountryPhoneInput */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
              <CountryPhoneInput
                value={formData.phone}
                onChange={(val) => setFormData({ ...formData, phone: val })}
              />
            </div>

            {/* Interaction Type */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Interaction Type</label>
              <select
                value={formData.follow_up_type}
                onChange={(e) => setFormData({ ...formData, follow_up_type: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 cursor-pointer"
              >
                <option value="call">📞 Phone Call</option>
                <option value="whatsapp">💬 WhatsApp Message</option>
                <option value="email">✉️ Email</option>
                <option value="meeting">📅 In-Person Meeting</option>
              </select>
            </div>

            {/* Modern Searchable Assigned Agent Dropdown */}
            <div>
              <AgentSelectDropdown
                label="Assigned Agent"
                value={formData.assigned_to}
                onChange={(agent) => setFormData({ ...formData, assigned_to: agent })}
              />
            </div>

            {/* Modern Date Picker */}
            <div>
              <ModernDatePicker
                label="Due Date"
                value={formData.due_date}
                onChange={handleDateChange}
              />
            </div>

            {/* Modern Time Picker */}
            <div>
              <ModernTimePicker
                label="Due Time"
                value={formData.due_time}
                onChange={(time) => setFormData({ ...formData, due_time: time })}
              />
            </div>

            {/* Priority */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 cursor-pointer"
              >
                <option value="high">🔴 High Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="low">⚪ Low Priority</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 cursor-pointer"
              >
                <option value="due_today">🟢 Due Today</option>
                <option value="scheduled">🔵 Scheduled</option>
                <option value="overdue">🔴 Overdue</option>
                {isEditMode && <option value="completed">🟣 Completed</option>}
              </select>
            </div>

            {/* Context Notes */}
            <div className="col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Context Notes</label>
              <textarea
                rows={2}
                placeholder="Client requested a follow-up regarding special package pricing..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-slate-800 resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                'Saving...'
              ) : isEditMode ? (
                'Save Changes'
              ) : matchedFollowUp ? (
                'Update & Reschedule'
              ) : initialLead ? (
                'Schedule & Move to Follow-up'
              ) : (
                'Save Follow-up'
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
