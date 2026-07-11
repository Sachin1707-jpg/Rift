import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, Cpu } from 'lucide-react';

// ─── Typing animation hook ───────────────────────────────────────────────────
const useTypewriter = (text = '', speed = 28, shouldStart = false) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!shouldStart) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, shouldStart]);

  return { displayed, done };
};

// ─── Thinking dots component ─────────────────────────────────────────────────
export const ThinkingDots = () => (
  <motion.div
    initial={{ opacity: 0, y: 4 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center gap-1 px-4 py-3 bg-slate-700/60 rounded-2xl rounded-tl-sm w-fit"
  >
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-slate-400 rounded-full block"
        animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
      />
    ))}
  </motion.div>
);

// ─── Single chat bubble ───────────────────────────────────────────────────────
export const ChatBubble = ({ message }) => {
  const { text, type, icon: Icon, delay = 0 } = message;
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  // Start typing after mount delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const { displayed } = useTypewriter(text, 22, started);

  // Scroll into view when bubble appears
  useEffect(() => {
    if (ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [displayed]);

  const bubbleStyles = {
    ai:       'bg-slate-700/70 text-slate-100 rounded-tl-sm',
    success:  'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 rounded-tl-sm',
    error:    'bg-rose-500/20 text-rose-200 border border-rose-500/30 rounded-tl-sm',
    system:   'bg-blue-500/20 text-blue-200 border border-blue-500/30 rounded-tl-sm',
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col gap-1.5"
    >
      {/* Avatar + label row */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Cpu className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Agent</span>
      </div>

      {/* Bubble body */}
      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[90%] backdrop-blur-sm ${bubbleStyles[type || 'ai']}`}>
        {/* Optional result icon */}
        {(type === 'success' || type === 'error') && (
          <div className="flex items-center gap-2 mb-1.5">
            {type === 'success'
              ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              : <XCircle     className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            <span className="font-bold text-xs uppercase tracking-wider">
              {type === 'success' ? 'AI Passport — Approved' : 'AI Passport — Denied'}
            </span>
          </div>
        )}
        {type === 'system' && (
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="font-bold text-xs uppercase tracking-wider">Verification Request</span>
          </div>
        )}
        <span>
          {displayed}
          {displayed.length < text.length && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-[2px] h-[14px] bg-current align-middle ml-0.5"
            />
          )}
        </span>
      </div>
    </motion.div>
  );
};
