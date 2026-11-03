'use client';

import React, { useState, useEffect, useRef } from 'react';
import { School } from '@/lib/types';
import {
  LifeBuoy,
  Plus,
  Send,
  Clock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  X,
  Paperclip,
  RefreshCw,
  FileText,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';

interface SupportModuleProps {
  school: School;
}

export interface LiveSupportTicket {
  id: string;
  ticket_number: string;
  school_id: string;
  school_name: string;
  subject: string;
  status: string;
  created_at: string;
  // Parsed helpers
  category?: string;
  priority?: string;
  clean_subject?: string;
}

export interface LiveSupportMessage {
  id: string;
  ticket_id: string;
  ticket_number?: string;
  sender_type: 'School' | 'Super Admin' | 'Admin';
  sender_id?: string;
  sender_name: string;
  message: string;
  created_at: string;
}

function normalizeStatus(status?: string): string {
  if (!status) return 'Open';
  const s = status.toLowerCase();
  if (s === 'resolved') return 'Resolved';
  if (s === 'in progress' || s === 'in_progress') return 'In Progress';
  if (s === 'waiting for school' || s === 'waiting') return 'Waiting for School';
  if (s === 'closed') return 'Closed';
  return 'Open';
}

function parseTicketMeta(rawTicket: any): LiveSupportTicket {
  let category = 'General';
  let priority = 'Medium';
  let cleanSubject = rawTicket.subject || 'Support Ticket';

  if (rawTicket.subject) {
    const match = rawTicket.subject.match(/^\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
    if (match) {
      category = match[1]?.trim() || 'General';
      priority = match[2]?.replace(/Priority/i, '').trim() || 'Medium';
      cleanSubject = match[3]?.trim() || cleanSubject;
    }
  }

  return {
    ...rawTicket,
    ticket_number: rawTicket.ticket_number || `TKT-${rawTicket.id.slice(0, 6)}`,
    category,
    priority,
    clean_subject: cleanSubject,
    status: normalizeStatus(rawTicket.status),
  };
}

export function SupportModule({ school }: SupportModuleProps) {
  const [tickets, setTickets] = useState<LiveSupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<LiveSupportTicket | null>(null);
  const [messages, setMessages] = useState<LiveSupportMessage[]>([]);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // New ticket modal form state
  const [form, setForm] = useState({
    category: 'Fee Management',
    priority: 'Medium',
    subject: '',
    description: '',
    attachment: null as File | null,
  });

  // Manual refresh helper
  const loadTickets = async (keepSelectedId?: string) => {
    setIsLoadingTickets(true);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setIsLoadingTickets(false);
        return;
      }

      const { data, error } = await client
        .from('support_tickets')
        .select('*')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const parsed = data.map(parseTicketMeta);
        setTickets(parsed);
        if (keepSelectedId) {
          const match = parsed.find((t) => t.id === keepSelectedId);
          if (match) setSelectedTicket(match);
        } else if (parsed.length > 0) {
          setSelectedTicket((prev) => prev || parsed[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const loadMessages = async (ticketId: string) => {
    setIsLoadingMessages(true);
    try {
      const client = getSupabaseClient();
      if (!client) {
        setIsLoadingMessages(false);
        return;
      }

      const { data, error } = await client
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as LiveSupportMessage[]);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Initial load
  useEffect(() => {
    let isMounted = true;
    const fetchTickets = async () => {
      const client = getSupabaseClient();
      if (!client) {
        if (isMounted) setIsLoadingTickets(false);
        return;
      }

      const { data, error } = await client
        .from('support_tickets')
        .select('*')
        .eq('school_id', school.id)
        .order('created_at', { ascending: false });

      if (!isMounted) return;
      if (!error && data) {
        const parsed = data.map(parseTicketMeta);
        setTickets(parsed);
        if (parsed.length > 0) {
          setSelectedTicket((prev) => prev || parsed[0]);
        }
      }
      setIsLoadingTickets(false);
    };

    fetchTickets();
    return () => {
      isMounted = false;
    };
  }, [school.id]);

  // When selected ticket changes, load its messages and subscribe to Realtime
  useEffect(() => {
    const ticketId = selectedTicket?.id;
    if (!ticketId) {
      return;
    }

    let isMounted = true;
    const fetchMessages = async () => {
      const client = getSupabaseClient();
      if (!client) return;
      setIsLoadingMessages(true);
      const { data, error } = await client
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (isMounted) {
        if (!error && data) {
          setMessages(data as LiveSupportMessage[]);
        }
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();

    const client = getSupabaseClient();
    if (!client) return;

    // Realtime subscription for incoming messages
    const channel = client
      .channel(`support-messages-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          const newMsg = payload.new as LiveSupportMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    // Realtime subscription for ticket status changes
    const ticketChannel = client
      .channel(`support-ticket-update-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          const updated = parseTicketMeta(payload.new);
          setSelectedTicket(updated);
          setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      client.removeChannel(channel);
      client.removeChannel(ticketChannel);
    };
  }, [selectedTicket?.id]);

  // Scroll messages to bottom on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Upload file to Supabase Storage bucket
  const uploadAttachment = async (file: File, ticketId: string): Promise<string | null> => {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `support-attachments/${school.id}/${ticketId}/${Date.now()}_${sanitizedName}`;

      const { error: uploadError } = await client.storage
        .from('school-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.warn('Storage upload warning:', uploadError);
        return null;
      }

      const { data } = client.storage.from('school-assets').getPublicUrl(filePath);
      return data?.publicUrl || null;
    } catch (err) {
      console.error('File upload error:', err);
      return null;
    }
  };

  // 3. Handle Create Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) {
      setFeedbackNotice({
        type: 'error',
        message: 'Please provide both a Subject and complete Problem Description.',
      });
      return;
    }

    setIsSubmitting(true);
    setFeedbackNotice(null);

    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase client connection not established.');
      }

      const ticketId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tkt_${Date.now()}`;
      const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

      // 1. Upload attachment if present
      let attachmentUrl: string | null = null;
      if (form.attachment) {
        attachmentUrl = await uploadAttachment(form.attachment, ticketId);
      }

      // 2. Prepare payload for support_tickets
      const subjectFormatted = `[${form.category} | ${form.priority} Priority] ${form.subject.trim()}`;
      const ticketPayload = {
        id: ticketId,
        ticket_number: ticketNumber,
        school_id: school.id,
        school_name: school.name_en || (school as any).school_name || 'School',
        subject: subjectFormatted,
        status: 'Open',
      };

      const { data: ticketData, error: ticketError } = await client
        .from('support_tickets')
        .insert(ticketPayload)
        .select()
        .single();

      if (ticketError) {
        throw new Error(ticketError.message || 'Failed to insert ticket into database');
      }

      // 3. Prepare initial message for support_messages
      let initialMessageText = form.description.trim();
      if (attachmentUrl) {
        initialMessageText += `\n\n📎 Attachment: ${attachmentUrl}`;
      }

      const messagePayload = {
        ticket_id: ticketId,
        ticket_number: ticketNumber,
        sender_type: 'School',
        sender_id: school.id,
        sender_name: school.principal_name || school.owner_name || 'School Principal',
        message: initialMessageText,
      };

      const { error: messageError } = await client
        .from('support_messages')
        .insert(messagePayload);

      if (messageError) {
        console.warn('Initial message insert warning:', messageError);
      }

      // 4. Update UI
      const newParsedTicket = parseTicketMeta(ticketData || ticketPayload);
      setTickets((prev) => [newParsedTicket, ...prev]);
      setSelectedTicket(newParsedTicket);
      setIsNewTicketOpen(false);
      setForm({
        category: 'Fee Management',
        priority: 'Medium',
        subject: '',
        description: '',
        attachment: null,
      });

      setFeedbackNotice({
        type: 'success',
        message: `Support ticket ${ticketNumber} created successfully! Super Admin Headquarters will review and respond.`,
      });

      setTimeout(() => {
        loadMessages(ticketId);
      }, 300);
    } catch (err: any) {
      console.error('Error creating ticket:', err);
      setFeedbackNotice({
        type: 'error',
        message: err.message || 'Failed to create support ticket. Please check connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Send Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || (!replyText.trim() && !replyAttachment)) return;

    setIsReplying(true);
    setFeedbackNotice(null);

    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Supabase client unavailable');

      let replyAttachmentUrl: string | null = null;
      if (replyAttachment) {
        replyAttachmentUrl = await uploadAttachment(replyAttachment, selectedTicket.id);
      }

      let fullReply = replyText.trim();
      if (replyAttachmentUrl) {
        fullReply = fullReply
          ? `${fullReply}\n\n📎 Attachment: ${replyAttachmentUrl}`
          : `📎 Attachment: ${replyAttachmentUrl}`;
      }

      const payload = {
        ticket_id: selectedTicket.id,
        ticket_number: selectedTicket.ticket_number || '',
        sender_type: 'School',
        sender_id: school.id,
        sender_name: school.principal_name || school.owner_name || 'School Principal',
        message: fullReply,
      };

      const { data, error } = await client
        .from('support_messages')
        .insert(payload)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }

      if (data) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data as LiveSupportMessage];
        });
      }

      setReplyText('');
      setReplyAttachment(null);
      if (replyFileInputRef.current) replyFileInputRef.current.value = '';
    } catch (err: any) {
      console.error('Failed to send reply:', err);
      setFeedbackNotice({
        type: 'error',
        message: `Failed to send reply: ${err.message}`,
      });
    } finally {
      setIsReplying(false);
    }
  };

  // Filtered tickets based on search and status
  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.ticket_number.toLowerCase().includes(q) ||
      (t.clean_subject && t.clean_subject.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  // Render attachment if URL detected in message text
  const renderMessageContent = (rawText: string) => {
    const attachRegex = /📎 Attachment:\s*(https?:\/\/[^\s]+)/i;
    const match = rawText.match(attachRegex);

    if (!match) {
      return <p className="whitespace-pre-wrap">{rawText}</p>;
    }

    const mainText = rawText.replace(attachRegex, '').trim();
    const url = match[1];
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url);

    return (
      <div className="space-y-2">
        {mainText && <p className="whitespace-pre-wrap">{mainText}</p>}
        <div className="mt-2 pt-2 border-t border-slate-200/50">
          {isImage ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Support attachment"
                className="max-h-48 max-w-full rounded-md border border-slate-200 object-cover group-hover:opacity-90 transition-opacity"
              />
              <span className="text-[10px] text-blue-600 underline flex items-center gap-1 mt-1 font-medium">
                <ExternalLink className="w-3 h-3" /> View full image
              </span>
            </a>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4 text-orange-600" />
              <span>Download Attached Document</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>
    );
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Waiting for School':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'High':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'Low':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      default:
        return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackNotice && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-2xs ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedbackNotice.message}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-slate-400 hover:text-slate-700 p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Platform Support &amp; Complaints</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Supabase Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submit priority technical, fee management, subscription, or billing tickets directly to Super Admin Headquarters.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => loadTickets(selectedTicket?.id)}
            disabled={isLoadingTickets}
            title="Refresh Tickets from Supabase"
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingTickets ? 'animate-spin text-orange-600' : ''}`} />
          </button>
          <button
            onClick={() => {
              setFeedbackNotice(null);
              setIsNewTicketOpen(true);
            }}
            className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Support Ticket
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tickets List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[650px]">
          {/* Header & Search */}
          <div className="p-3.5 border-b bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <LifeBuoy className="w-4 h-4 text-orange-600" />
                My School Tickets ({tickets.length})
              </span>
              {isLoadingTickets && <span className="text-[11px] text-orange-600 font-medium">Syncing...</span>}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket # or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-[10px]">
              {(['All', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                    statusFilter === st
                      ? 'bg-orange-600 text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets List Scrollable Area */}
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {isLoadingTickets && tickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-600" />
                <p>Loading tickets from database...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">No support tickets found</p>
                <p className="text-[11px] text-slate-400">
                  {searchQuery || statusFilter !== 'All'
                    ? 'No tickets match your filters. Try clearing search.'
                    : "You haven't filed any support tickets yet. Click 'Create Support Ticket' to submit an inquiry to Super Admin."}
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-3.5 cursor-pointer transition-colors text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-orange-50/70 border-l-4 border-orange-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-orange-600 text-[11px]">
                        {t.ticket_number}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadgeClass(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 line-clamp-1">{t.clean_subject}</h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                      <span className="truncate max-w-[130px] font-medium text-slate-600">
                        {t.category}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getPriorityBadgeClass(
                          t.priority
                        )}`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{t.created_at ? new Date(t.created_at).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[650px] overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-orange-600 text-xs px-2 py-0.5 bg-orange-50 rounded border border-orange-200">
                      {selectedTicket.ticket_number}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{selectedTicket.clean_subject}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>
                      Category: <strong className="text-slate-700">{selectedTicket.category}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Priority:{' '}
                      <strong className={selectedTicket.priority === 'Urgent' ? 'text-rose-600' : 'text-orange-600'}>
                        {selectedTicket.priority}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Filed:{' '}
                      {selectedTicket.created_at
                        ? new Date(selectedTicket.created_at).toLocaleString('en-PK', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-slate-50/40">
                {isLoadingMessages ? (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-orange-600" />
                    <p>Loading conversation messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-slate-600">No messages in this ticket yet</p>
                    <p className="text-[11px]">Send a reply below to initiate conversation with Super Admin.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSchool = msg.sender_type === 'School';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isSchool ? 'items-end' : 'items-start'}`}
                      >
                        {/* Sender details */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 px-1">
                          {!isSchool && (
                            <span title="Super Admin Headquarters">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                            </span>
                          )}
                          <span className={`font-bold ${isSchool ? 'text-slate-800' : 'text-blue-900'}`}>
                            {msg.sender_name || (isSchool ? 'School Principal' : 'Super Admin Headquarters')}
                          </span>
                          <span className="text-[10px]">
                            ({isSchool ? 'School Portal' : 'Super Admin Panel'})
                          </span>
                          <span>·</span>
                          <span className="text-[10px]">
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString('en-PK', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        {/* Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed shadow-2xs ${
                            isSchool
                              ? 'bg-orange-600 text-white rounded-tr-xs'
                              : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                          }`}
                        >
                          {renderMessageContent(msg.message)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t bg-white space-y-2">
                {replyAttachment && (
                  <div className="flex items-center justify-between bg-orange-50 border border-orange-200 text-orange-900 text-xs px-3 py-1.5 rounded-md">
                    <span className="truncate max-w-xs flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-orange-600" />
                      {replyAttachment.name} ({(replyAttachment.size / 1024).toFixed(1)} KB)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyAttachment(null);
                        if (replyFileInputRef.current) replyFileInputRef.current.value = '';
                      }}
                      className="text-orange-700 hover:text-orange-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={replyFileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setReplyAttachment(e.target.files[0]);
                      }
                    }}
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => replyFileInputRef.current?.click()}
                    title="Attach Screenshot / PDF"
                    className="p-2 border border-slate-200 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder="Type reply message to Super Admin Headquarters..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />

                  <button
                    type="submit"
                    disabled={isReplying || (!replyText.trim() && !replyAttachment)}
                    className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isReplying ? 'Sending...' : 'Reply'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-xs text-slate-400 p-8 space-y-3">
              <LifeBuoy className="w-12 h-12 text-slate-300" />
              <p className="font-semibold text-slate-600 text-sm">No Ticket Selected</p>
              <p className="max-w-sm text-center">
                Select a ticket from the left panel to view correspondence, or click &quot;Create Support Ticket&quot; to file a new inquiry.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Create Support Ticket</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct inquiry to Super Admin Headquarters with live database synchronization.
                </p>
              </div>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              {/* School Details (Auto-filled) */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    School Account
                  </span>
                  <span className="font-bold text-slate-800 text-xs">
                    {school.name_en || (school as any).school_name || 'My School'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Created By
                  </span>
                  <span className="font-medium text-slate-700 text-xs">
                    {school.principal_name || school.owner_name || 'School Principal'}
                  </span>
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Fee Management">Fee Management</option>
                    <option value="Subscription & Renewal">Subscription &amp; Renewal</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Student Admissions">Student Admissions</option>
                    <option value="Exam & DMC Module">Exam &amp; DMC Module</option>
                    <option value="Other Query">Other Query</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Priority <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md bg-white focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Challan #CHN-2026-004 balance discrepancy"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Complete Message / Problem Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue with exact details so Super Admin support can assist you rapidly..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Attachment (Optional - Screenshot or PDF Document)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setForm({ ...form, attachment: e.target.files[0] });
                      }
                    }}
                    accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-orange-600" />
                    <span>{form.attachment ? form.attachment.name : 'Choose File...'}</span>
                  </button>

                  {form.attachment && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, attachment: null });
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  PNG, JPG, or PDF up to 10MB. Stored in Supabase Storage.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting to Database...</span>
                    </>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}