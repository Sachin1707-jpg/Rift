import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { ChatBubble, ThinkingDots } from '../ChatBubble/ChatBubble';
import { AgentContext } from '../../context/AgentContext';

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ─── Message builder helpers ──────────────────────────────────────────────────
const aiMsg    = (text, delay = 0)  => ({ id: Date.now() + Math.random(), type: 'ai',     text, delay });
const sysMsg   = (text, delay = 0)  => ({ id: Date.now() + Math.random(), type: 'system', text, delay });
const okMsg    = (text, delay = 0)  => ({ id: Date.now() + Math.random(), type: 'success', text, delay });
const denyMsg  = (text, delay = 0)  => ({ id: Date.now() + Math.random(), type: 'error',   text, delay });

export const AiConsole = ({ agent, onBrowse, onPurchase, onPostReview, onComplete, onFallback }) => {
  const { addLog } = useContext(AgentContext);
  const [messages, setMessages]   = useState([]);
  const [thinking, setThinking]   = useState(false);
  const [running,  setRunning]    = useState(false);
  const [finished, setFinished]   = useState(false);
  const bottomRef                 = useRef(null);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const push = (msg) => setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }]);

  const think = async (ms = 1400) => {
    setThinking(true);
    await sleep(ms);
    setThinking(false);
  };

  const verify = async (action) => {
    if (!agent || agent.status !== 'Active') return false;
    const isApproved = agent.permissions.includes(action);
    addLog({
      agentId:   agent.id,
      agentName: agent.name,
      action,
      status:    isApproved ? 'Approved' : 'Denied',
      reason:    isApproved ? 'Permission granted' : 'Missing permission',
    });
    return isApproved;
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    setFinished(false);
    setMessages([]);

    // ── Step 1: introduce intent ─────────────────────────────
    await think(900);
    push(aiMsg("I'm looking for the best way to achieve your goal. Let me analyse the available permissions first."));
    await sleep(2200);

    // ── Step 2: plan ────────────────────────────────────────
    await think(800);
    push(aiMsg("My plan: Browse products → select the best match → attempt Purchase → post a review if allowed."));
    await sleep(2400);

    // ── Step 3: request browse ──────────────────────────────
    await think(700);
    push(sysMsg("Calling AI Passport verify() → action: Browse"));
    await sleep(800);

    const canBrowse = await verify('Browse');

    if (canBrowse) {
      push(okMsg("Browse approved ✓  —  I can explore product listings freely."));
      await sleep(1200);

      push(aiMsg("Browsing now… I found Sony WH-1000XM5. Strong reviews, great price-to-value. Opening details."));
      onBrowse?.();
      await sleep(2200);

      // ── Step 4: request purchase ──────────────────────────
      await think(700);
      push(sysMsg("Calling AI Passport verify() → action: Purchase"));
      await sleep(800);

      const canPurchase = await verify('Purchase');

      if (canPurchase) {
        push(okMsg("Purchase approved ✓  —  Adding Sony WH-1000XM5 to cart."));
        onPurchase?.();
        await sleep(1600);

        // ── Step 5: request post ────────────────────────────
        await think(600);
        push(sysMsg("Calling AI Passport verify() → action: Post"));
        await sleep(700);

        const canPost = await verify('Post');

        if (canPost) {
          push(okMsg("Post approved ✓  —  Submitting a 5-star review."));
          onPostReview?.();
          await sleep(1200);
          push(aiMsg("All tasks complete! I browsed, purchased, and reviewed — all within my granted permissions. 🎉"));
        } else {
          push(denyMsg("Post permission not granted — skipping review. That's fine; the main goal is achieved."));
          await sleep(1200);
          push(aiMsg("Goal complete! Product browsed and purchased successfully. Review skipped — no Post permission."));
        }
      } else {
        push(denyMsg("Purchase permission denied by AI Passport. I cannot complete the transaction."));
        await sleep(1400);
        push(aiMsg("Browsing was successful but purchasing is blocked. Handing control back to you so you can proceed manually."));
        await sleep(1800);
        onFallback?.();
        setRunning(false);
        return;
      }
    } else {
      push(denyMsg("Browse permission denied — I cannot view any products. Switching you to Manual Mode."));
      await sleep(1800);
      push(aiMsg("I'm unable to continue without Browse access. Please review the agent's permissions in the Dashboard."));
      await sleep(1600);
      onFallback?.();
      setRunning(false);
      return;
    }

    setFinished(true);
    setRunning(false);
    onComplete?.();
  };

  const reset = () => {
    setMessages([]);
    setFinished(false);
    setRunning(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-1 pb-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-700/20 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-300 uppercase tracking-widest">Agent Goal</p>
              <p className="text-sm font-medium text-white leading-tight mt-0.5">"{agent?.purpose}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar min-h-0">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {thinking && <ThinkingDots />}

        <div ref={bottomRef} />
      </div>

      {/* CTA footer */}
      <div className="flex-shrink-0 pt-4 border-t border-white/10 mt-4">
        {!running && !finished && messages.length === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={run}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
              text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all
              shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)]
              active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            Let Agent Decide
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}

        {running && !finished && (
          <div className="text-center py-2.5 text-sm text-slate-400 flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            Agent is working…
          </div>
        )}

        {finished && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="text-center text-xs text-emerald-400 font-bold uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sequence complete
            </div>
            <button
              onClick={reset}
              className="w-full py-3 border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Run again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
