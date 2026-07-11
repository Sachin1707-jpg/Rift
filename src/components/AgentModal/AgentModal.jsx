import React, { useState, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, ShoppingCart, Eye, MessageSquare, Trash2,
  User, CreditCard, ClipboardList, XCircle, Heart,
  Wallet, Clock, Globe, Lock, ChevronDown, Plus,
  CheckCircle2, AlertCircle, Loader2, UserCog, Sparkles,
  Bell, ShieldCheck, ShieldOff, BadgeCheck
} from 'lucide-react';
import { AgentContext } from '../../context/AgentContext';
import { api }          from '../../services/api';
import toast           from 'react-hot-toast';

// ─── Data ──────────────────────────────────────────────────────────────────────

const AGENT_TYPES = [
  'Shopping Assistant', 'Research Assistant', 'Customer Support',
  'Coding Assistant', 'Social Media Bot', 'Custom',
];

const EXPIRY_OPTIONS = [
  { label: '1 Minute',  value: 1  },
  { label: '5 Minutes', value: 5  },
  { label: '10 Minutes',value: 10 },
  { label: '30 Minutes',value: 30 },
  { label: '1 Hour',    value: 60 },
];

const CURRENCIES = ['₹', '$', '€', '£'];

const PERMISSIONS = [
  { key: 'Browse',          label: 'Browse Products',         icon: Eye,           desc: 'View and search product listings',         color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30'   },
  { key: 'Purchase',        label: 'Purchase',                icon: ShoppingCart,  desc: 'Add items to cart and place orders',       color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30'  },
  { key: 'Post',            label: 'Post Reviews',            icon: MessageSquare, desc: 'Submit product reviews and ratings',       color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30'   },
  { key: 'Delete Orders',   label: 'Delete Orders',           icon: Trash2,        desc: 'Remove orders from history',               color: 'text-rose-400',   bg: 'bg-rose-500/10',   border: 'border-rose-500/30'   },
  { key: 'Read Profile',    label: 'Read Profile',            icon: User,          desc: 'Access basic account information',         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { key: 'Update Profile',  label: 'Update Profile',          icon: UserCog,       desc: 'Modify account details and preferences',   color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { key: 'Payment',         label: 'Access Payment Methods',  icon: CreditCard,    desc: 'View and use saved payment information',   color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { key: 'Read Orders',     label: 'Read Orders',             icon: ClipboardList, desc: 'View order history and status',            color: 'text-teal-400',   bg: 'bg-teal-500/10',   border: 'border-teal-500/30'   },
  { key: 'Cancel Orders',   label: 'Cancel Orders',           icon: XCircle,       desc: 'Cancel existing orders',                  color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30'    },
  { key: 'Wishlist',        label: 'Manage Wishlist',         icon: Heart,         desc: 'Add, remove and manage saved items',       color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/30'   },
];

const SECURITY_OPTIONS = [
  { key: 'confirmPurchase',   label: 'Require Confirmation Before Purchase', icon: ShieldCheck },
  { key: 'verifiedOnly',      label: 'Allow Only Verified Websites',         icon: BadgeCheck  },
  { key: 'blockSensitive',    label: 'Block Sensitive Actions',              icon: ShieldOff   },
  { key: 'notifyEveryAction', label: 'Notify Me On Every Action',            icon: Bell        },
  { key: 'autoRevokeFirst',   label: 'Auto Revoke After First Purchase',     icon: AlertCircle },
];

// ─── Toggle ───────────────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 flex-shrink-0
      ${value ? 'bg-mock-accent' : 'bg-[#232D42]'}`}
  >
    <motion.div
      animate={{ x: value ? 22 : 2 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="absolute top-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm"
    />
  </button>
);

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, color, children }) => (
  <div className="mb-[28px]">
    <div className="flex items-center gap-[10px] mb-[16px]">
      <div className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center ${color}`}>
        <Icon className="w-[15px] h-[15px]" />
      </div>
      <span className="font-space font-semibold text-[14px] text-mock-text">{title}</span>
      <div className="flex-1 h-px bg-mock-border" />
    </div>
    {children}
  </div>
);

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, children, error }) => (
  <div className="mb-[14px]">
    <label className="block font-mono text-[10.5px] text-mock-grey uppercase tracking-[0.07em] mb-[7px]">{label}</label>
    {children}
    {error && <p className="text-mock-danger text-[11px] mt-[5px] flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

const inputCls = "w-full bg-[#0d1420] border border-mock-border rounded-[8px] px-[12px] py-[10px] text-mock-text text-[13px] font-inter placeholder:text-mock-grey focus:outline-none focus:border-mock-accent transition-colors";

// ─── Main Modal ───────────────────────────────────────────────────────────────
export const AgentModal = ({ isOpen, onClose }) => {
  const { addAgent } = useContext(AgentContext);
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [websiteInput, setWebsiteInput] = useState('');

  const [form, setForm] = useState({
    name:           '',
    description:    '',
    agentType:      '',
    permissions:    [],
    spendingEnabled:false,
    spendingAmount: '',
    currency:       '₹',
    expiryMinutes:  5,
    websites:       [],
    security: {
      confirmPurchase:   false,
      verifiedOnly:      false,
      blockSensitive:    false,
      notifyEveryAction: false,
      autoRevokeFirst:   false,
    },
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const togglePermission = (key) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(key)
        ? p.permissions.filter(k => k !== key)
        : [...p.permissions, key],
    }));
  };

  const addWebsite = () => {
    const w = websiteInput.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (!w || form.websites.includes(w)) { setWebsiteInput(''); return; }
    set('websites', [...form.websites, w]);
    setWebsiteInput('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name        = 'Agent name is required';
    if (!form.description.trim())   e.description = 'Description is required';
    if (!form.agentType)            e.agentType   = 'Select an agent type';
    if (form.permissions.length===0)e.permissions = 'Select at least one permission';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.issue({
        name:         form.name,
        purpose:      form.description,
        permissions:  form.permissions,
        expiryMinutes:form.expiryMinutes,
        agentType:    form.agentType,
        spendingLimit:form.spendingEnabled ? `${form.currency}${form.spendingAmount}` : 'Unlimited',
        websites:     form.websites,
        security:     form.security,
      });
      addAgent(res.data);
      toast.success('🛡 AI Passport issued successfully!');
      onClose();
      setForm({
        name:'', description:'', agentType:'', permissions:[],
        spendingEnabled:false, spendingAmount:'', currency:'₹',
        expiryMinutes:5, websites:[], security:{
          confirmPurchase:false, verifiedOnly:false, blockSensitive:false,
          notifyEveryAction:false, autoRevokeFirst:false,
        },
      });
    } catch {
      toast.error('Failed to issue passport');
    } finally {
      setLoading(false);
    }
  };

  // ── Live preview ────────────────────────────────────────────────────────────
  const Preview = () => (
    <div className="bg-[#0d1420] border border-mock-border rounded-[16px] p-[22px] sticky top-0">
      {/* Header */}
      <div className="flex items-center gap-[10px] mb-[18px] pb-[14px] border-b border-mock-border">
        <div className="w-[36px] h-[36px] rounded-[10px] bg-gradient-to-br from-mock-accent to-[#2A9D7D] flex items-center justify-center">
          <Shield className="w-[18px] h-[18px] text-[#06140F]" />
        </div>
        <div>
          <div className="font-mono text-[9px] text-mock-accent uppercase tracking-widest">AI Passport</div>
          <div className="font-space font-bold text-[14px] text-mock-text">{form.name || 'Agent Name'}</div>
        </div>
        <div className="ml-auto">
          <span className="bg-mock-accent-dim text-mock-accent font-mono text-[9px] px-[8px] py-[3px] rounded-full uppercase tracking-wider">
            {form.name ? 'Ready' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="mb-[14px]">
        <div className="font-mono text-[9.5px] text-mock-grey uppercase tracking-wider mb-[4px]">Description</div>
        <div className="text-[12px] text-mock-text-dim leading-[1.5]">
          {form.description || <span className="text-mock-grey italic">No description yet</span>}
        </div>
      </div>

      {/* Agent Type */}
      {form.agentType && (
        <div className="mb-[14px]">
          <div className="font-mono text-[9.5px] text-mock-grey uppercase tracking-wider mb-[4px]">Type</div>
          <div className="text-[12px] text-mock-text">{form.agentType}</div>
        </div>
      )}

      {/* Permissions */}
      <div className="mb-[14px]">
        <div className="font-mono text-[9.5px] text-mock-grey uppercase tracking-wider mb-[6px]">Permissions</div>
        <div className="space-y-[5px]">
          {PERMISSIONS.slice(0, 6).map(p => (
            <div key={p.key} className="flex items-center gap-[7px]">
              {form.permissions.includes(p.key)
                ? <CheckCircle2 className="w-[12px] h-[12px] text-mock-accent flex-shrink-0" />
                : <XCircle      className="w-[12px] h-[12px] text-mock-grey/40 flex-shrink-0" />
              }
              <span className={`text-[11px] ${form.permissions.includes(p.key) ? 'text-mock-text' : 'text-mock-grey/40 line-through'}`}>
                {p.label}
              </span>
            </div>
          ))}
          {form.permissions.length > 6 && (
            <div className="text-[10px] text-mock-accent">+{form.permissions.length - 6} more</div>
          )}
        </div>
      </div>

      {/* Spending */}
      <div className="mb-[14px] flex justify-between items-center">
        <div>
          <div className="font-mono text-[9.5px] text-mock-grey uppercase tracking-wider mb-[2px]">Spending Limit</div>
          <div className="text-[12px] text-mock-text font-semibold">
            {form.spendingEnabled && form.spendingAmount ? `${form.currency}${form.spendingAmount}` : 'Unlimited'}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9.5px] text-mock-grey uppercase tracking-wider mb-[2px]">Expiry</div>
          <div className="text-[12px] text-mock-text font-semibold">
            {EXPIRY_OPTIONS.find(o => o.value === form.expiryMinutes)?.label}
          </div>
        </div>
      </div>

      {/* Websites */}
      {form.websites.length > 0 && (
        <div className="mb-[14px]">
          <div className="font-mono text-[9.5px] text-mock-grey uppercase tracking-wider mb-[5px]">Allowed Websites</div>
          <div className="flex flex-wrap gap-[4px]">
            {form.websites.map(w => (
              <span key={w} className="font-mono text-[10px] bg-mock-border text-mock-text-dim px-[7px] py-[2px] rounded-[5px]">{w}</span>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mt-[18px] pt-[14px] border-t border-mock-border">
        <div className="flex items-center gap-[8px]">
          <div className={`w-[8px] h-[8px] rounded-full ${form.name && form.description && form.permissions.length > 0 ? 'bg-mock-accent' : 'bg-mock-grey'}`} />
          <span className="font-mono text-[10px] text-mock-text-dim">
            {form.name && form.description && form.permissions.length > 0 ? 'Ready to Issue' : 'Complete form to issue'}
          </span>
        </div>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: 24  }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[40px] pb-[40px] px-[16px] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full max-w-[980px] bg-mock-panel border border-mock-border rounded-[20px] overflow-hidden shadow-2xl">

              {/* ── Modal Header ─────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-[28px] py-[20px] border-b border-mock-border bg-[#0d1420]">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-mock-accent to-[#2A9D7D] flex items-center justify-center shadow-lg shadow-mock-accent/20">
                    <Shield className="w-[20px] h-[20px] text-[#06140F]" />
                  </div>
                  <div>
                    <h2 className="font-space font-bold text-[17px] text-mock-text">Issue AI Passport</h2>
                    <p className="text-[11.5px] text-mock-text-dim mt-[1px]">Create a secure digital identity for your AI agent</p>
                  </div>
                </div>
                <button onClick={onClose} className="w-[32px] h-[32px] rounded-[8px] bg-mock-panel2 border border-mock-border flex items-center justify-center text-mock-text-dim hover:text-mock-text hover:bg-mock-border transition-colors">
                  <X className="w-[15px] h-[15px]" />
                </button>
              </div>

              {/* ── Body ─────────────────────────────────────────────────────── */}
              <div className="flex gap-0">

                {/* Left: Form */}
                <div className="flex-1 overflow-y-auto max-h-[72vh] px-[28px] py-[24px] no-scrollbar">

                  {/* Section 1 — Agent Identity */}
                  <Section icon={Sparkles} title="Agent Identity" color="bg-mock-accent/15 text-mock-accent">
                    <Field label="Agent Name" error={errors.name}>
                      <input
                        className={inputCls}
                        placeholder="e.g. Shopping Bot"
                        value={form.name}
                        onChange={e => { set('name', e.target.value); setErrors(p=>({...p,name:''})); }}
                      />
                    </Field>
                    <Field label="Agent Description" error={errors.description}>
                      <textarea
                        className={inputCls + ' resize-none h-[80px]'}
                        placeholder="e.g. Find and purchase a birthday gift under ₹2000."
                        value={form.description}
                        onChange={e => { set('description', e.target.value); setErrors(p=>({...p,description:''})); }}
                      />
                    </Field>
                    <Field label="Agent Type" error={errors.agentType}>
                      <div className="relative">
                        <select
                          className={inputCls + ' appearance-none pr-[36px]'}
                          value={form.agentType}
                          onChange={e => { set('agentType', e.target.value); setErrors(p=>({...p,agentType:''})); }}
                        >
                          <option value="">Select agent type…</option>
                          {AGENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown className="w-[14px] h-[14px] text-mock-grey absolute right-[12px] top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </Field>
                  </Section>

                  {/* Section 2 — Permissions */}
                  <Section icon={ShieldCheck} title="Permissions" color="bg-blue-500/15 text-blue-400">
                    {errors.permissions && (
                      <p className="text-mock-danger text-[11px] mb-[10px] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3"/>{errors.permissions}
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-[8px]">
                      {PERMISSIONS.map(p => {
                        const Icon = p.icon;
                        const on   = form.permissions.includes(p.key);
                        return (
                          <div
                            key={p.key}
                            onClick={() => { togglePermission(p.key); setErrors(e=>({...e,permissions:''})); }}
                            className={`flex items-center gap-[12px] p-[12px] rounded-[10px] border cursor-pointer transition-all
                              ${on ? `${p.bg} ${p.border}` : 'bg-[#0d1420] border-mock-border hover:border-mock-border/80 hover:bg-mock-panel2'}`}
                          >
                            <div className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center flex-shrink-0 ${on ? p.bg : 'bg-mock-border/50'}`}>
                              <Icon className={`w-[16px] h-[16px] ${on ? p.color : 'text-mock-grey'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[13px] font-medium ${on ? 'text-mock-text' : 'text-mock-text-dim'}`}>{p.label}</div>
                              <div className="text-[11px] text-mock-grey truncate">{p.desc}</div>
                            </div>
                            <Toggle value={on} onChange={() => { togglePermission(p.key); setErrors(e=>({...e,permissions:''})); }} />
                          </div>
                        );
                      })}
                    </div>
                  </Section>

                  {/* Section 3 — Spending Controls */}
                  <Section icon={Wallet} title="Spending Controls" color="bg-amber-500/15 text-amber-400">
                    <div className="flex items-center justify-between p-[14px] bg-[#0d1420] border border-mock-border rounded-[10px] mb-[12px]">
                      <div className="flex items-center gap-[10px]">
                        <Wallet className="w-[16px] h-[16px] text-amber-400" />
                        <div>
                          <div className="text-[13px] font-medium text-mock-text">Enable Spending Limit</div>
                          <div className="text-[11px] text-mock-grey">Cap the maximum amount the agent can spend</div>
                        </div>
                      </div>
                      <Toggle value={form.spendingEnabled} onChange={v => set('spendingEnabled', v)} />
                    </div>
                    <AnimatePresence>
                      {form.spendingEnabled && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{   opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex gap-[10px]">
                            <div className="relative">
                              <select
                                className={inputCls + ' appearance-none w-[80px] pr-[28px]'}
                                value={form.currency}
                                onChange={e => set('currency', e.target.value)}
                              >
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <ChevronDown className="w-[12px] h-[12px] text-mock-grey absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                            <input
                              type="number"
                              className={inputCls + ' flex-1'}
                              placeholder="e.g. 2000"
                              value={form.spendingAmount}
                              onChange={e => set('spendingAmount', e.target.value)}
                            />
                          </div>
                          <div className="flex gap-[8px] mt-[10px] flex-wrap">
                            {['500','1000','2000','5000'].map(v => (
                              <button key={v} type="button"
                                onClick={() => set('spendingAmount', v)}
                                className={`font-mono text-[11px] px-[10px] py-[5px] rounded-[6px] border transition-colors
                                  ${form.spendingAmount === v
                                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                                    : 'bg-mock-panel2 border-mock-border text-mock-grey hover:text-mock-text'}`}
                              >
                                {form.currency}{v}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Section>

                  {/* Section 4 — Time Restrictions */}
                  <Section icon={Clock} title="Time Restrictions" color="bg-purple-500/15 text-purple-400">
                    <div className="grid grid-cols-3 gap-[8px] mb-[10px]">
                      {EXPIRY_OPTIONS.map(o => (
                        <button key={o.value} type="button"
                          onClick={() => set('expiryMinutes', o.value)}
                          className={`py-[10px] px-[8px] rounded-[10px] text-[12px] font-medium border transition-all text-center
                            ${form.expiryMinutes === o.value
                              ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                              : 'bg-[#0d1420] border-mock-border text-mock-text-dim hover:text-mock-text hover:border-mock-border/80'}`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-start gap-[8px] p-[12px] bg-purple-500/5 border border-purple-500/15 rounded-[8px]">
                      <Clock className="w-[13px] h-[13px] text-purple-400 flex-shrink-0 mt-[1px]" />
                      <p className="text-[11.5px] text-mock-text-dim leading-[1.5]">
                        This passport will automatically expire after the selected duration.
                      </p>
                    </div>
                  </Section>

                  {/* Section 5 — Website Restrictions */}
                  <Section icon={Globe} title="Website Restrictions" color="bg-cyan-500/15 text-cyan-400">
                    <div className="flex gap-[8px] mb-[10px]">
                      <input
                        className={inputCls + ' flex-1'}
                        placeholder="e.g. amazon.com"
                        value={websiteInput}
                        onChange={e => setWebsiteInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addWebsite(); } }}
                      />
                      <button type="button" onClick={addWebsite}
                        className="px-[14px] py-[10px] bg-mock-accent text-[#06140F] rounded-[8px] font-semibold text-[13px] hover:bg-[#3ebe95] transition-colors flex items-center gap-[5px]"
                      >
                        <Plus className="w-[14px] h-[14px]" />
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-[7px] mb-[10px]">
                      {form.websites.length === 0 && (
                        <span className="text-[11.5px] text-mock-grey italic">No websites added — agent can access any site</span>
                      )}
                      {form.websites.map(w => (
                        <motion.span
                          key={w}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className="inline-flex items-center gap-[6px] font-mono text-[11.5px] bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 px-[10px] py-[5px] rounded-[6px]"
                        >
                          <a
                            href={`https://${w}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-[5px] hover:text-white transition-colors"
                          >
                            <Globe className="w-[11px] h-[11px]" />
                            {w}
                          </a>
                          <button type="button" onClick={() => set('websites', form.websites.filter(x => x !== w))}
                            className="text-cyan-400/60 hover:text-cyan-300 ml-[2px]">
                            <X className="w-[11px] h-[11px]" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-[6px]">
                      {['amazon.com','flipkart.com','github.com','linkedin.com','gmail.com'].map(s => (
                        <button key={s} type="button"
                          onClick={() => { if (!form.websites.includes(s)) set('websites', [...form.websites, s]); }}
                          disabled={form.websites.includes(s)}
                          className="font-mono text-[10.5px] text-mock-grey border border-mock-border px-[8px] py-[4px] rounded-[5px] hover:text-mock-text hover:border-mock-border/80 transition-colors disabled:opacity-30"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </Section>

                  {/* Section 6 — Security Settings */}
                  <Section icon={Lock} title="Security Settings" color="bg-rose-500/15 text-rose-400">
                    <div className="space-y-[8px]">
                      {SECURITY_OPTIONS.map(opt => {
                        const Icon = opt.icon;
                        const on   = form.security[opt.key];
                        return (
                          <div
                            key={opt.key}
                            onClick={() => set('security', { ...form.security, [opt.key]: !on })}
                            className={`flex items-center gap-[12px] p-[12px] rounded-[10px] border cursor-pointer transition-all
                              ${on ? 'bg-rose-500/8 border-rose-500/25' : 'bg-[#0d1420] border-mock-border hover:bg-mock-panel2'}`}
                          >
                            <Icon className={`w-[15px] h-[15px] flex-shrink-0 ${on ? 'text-rose-400' : 'text-mock-grey'}`} />
                            <span className={`flex-1 text-[12.5px] ${on ? 'text-mock-text' : 'text-mock-text-dim'}`}>{opt.label}</span>
                            <div className={`w-[16px] h-[16px] rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors
                              ${on ? 'bg-rose-500 border-rose-500' : 'border-mock-border'}`}>
                              {on && <CheckCircle2 className="w-[11px] h-[11px] text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Section>
                </div>

                {/* Right: Preview */}
                <div className="w-[280px] flex-shrink-0 bg-[#0a0f1a] border-l border-mock-border px-[20px] py-[24px] hidden lg:block">
                  <div className="font-mono text-[10px] text-mock-grey uppercase tracking-[0.08em] mb-[14px] flex items-center gap-[8px]">
                    <Sparkles className="w-[11px] h-[11px]" />
                    Live Preview
                  </div>
                  <Preview />
                </div>
              </div>

              {/* ── Footer ───────────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-[28px] py-[18px] border-t border-mock-border bg-[#0d1420]">
                <button type="button" onClick={onClose}
                  className="text-[13px] text-mock-text-dim border border-mock-border px-[18px] py-[9px] rounded-[9px] hover:bg-mock-panel2 hover:text-mock-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-[8px] bg-mock-accent text-[#06140F] font-semibold text-[13px] px-[22px] py-[10px] rounded-[10px] hover:bg-[#3ebe95] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-mock-accent/20"
                >
                  {loading
                    ? <><Loader2 className="w-[15px] h-[15px] animate-spin" /> Issuing…</>
                    : <><Shield className="w-[15px] h-[15px]" /> Issue Passport</>
                  }
                </button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
