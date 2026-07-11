import React from 'react';

// ─── Base Skeleton Component ───────────────────────────────────────────────────
export const Skeleton = ({ className = '', circle = false }) => {
  return (
    <div
      className={`relative overflow-hidden bg-slate-800/50 border border-white/5 ${circle ? 'rounded-full' : 'rounded-2xl'} ${className}`}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

// ─── Composite Skeletons ─────────────────────────────────────────────────────

export const StatCardSkeleton = () => (
  <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-6 flex items-center justify-between">
    <div className="space-y-3">
      <Skeleton className="w-24 h-4" />
      <Skeleton className="w-16 h-8" />
    </div>
    <Skeleton circle className="w-12 h-12" />
  </div>
);

export const AgentCardSkeleton = () => (
  <div className="rounded-3xl overflow-hidden backdrop-blur-xl border border-white/10 p-6 flex flex-col gap-5 bg-slate-900/40 h-[320px]">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-48 h-4" />
      </div>
      <Skeleton className="w-20 h-6 rounded-full" />
    </div>
    <div className="bg-slate-950/50 rounded-2xl p-4 border border-white/5 space-y-4 flex-1">
      <div className="flex justify-between items-center pb-4 border-b border-white/5">
        <div className="space-y-2">
          <Skeleton className="w-20 h-3" />
          <Skeleton className="w-32 h-4" />
        </div>
        <Skeleton className="w-16 h-8" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-24 h-3" />
        <div className="flex gap-2">
          <Skeleton className="w-16 h-6 rounded-md" />
          <Skeleton className="w-20 h-6 rounded-md" />
        </div>
      </div>
      <div className="pt-2 space-y-2">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-28 h-6" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 mt-auto">
      <Skeleton className="w-full h-11 rounded-xl" />
      <Skeleton className="w-full h-11 rounded-xl" />
    </div>
  </div>
);

export const ActivityTableSkeleton = () => (
  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
    <table className="w-full text-left text-sm">
      <thead className="text-xs uppercase bg-slate-950/50 text-slate-400 border-b border-white/10">
        <tr>
          <th className="px-6 py-4"><Skeleton className="w-20 h-4" /></th>
          <th className="px-6 py-4"><Skeleton className="w-24 h-4" /></th>
          <th className="px-6 py-4"><Skeleton className="w-16 h-4" /></th>
          <th className="px-6 py-4"><Skeleton className="w-32 h-4" /></th>
          <th className="px-6 py-4"><Skeleton className="w-16 h-4" /></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {[1, 2, 3, 4, 5].map(i => (
          <tr key={i}>
            <td className="px-6 py-4"><Skeleton className="w-24 h-5" /></td>
            <td className="px-6 py-4"><Skeleton className="w-32 h-4" /></td>
            <td className="px-6 py-4"><Skeleton className="w-20 h-6 rounded-full" /></td>
            <td className="px-6 py-4"><Skeleton className="w-40 h-4" /></td>
            <td className="px-6 py-4"><Skeleton className="w-20 h-4" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const StorefrontProductSkeleton = () => (
  <div className="group rounded-3xl overflow-hidden bg-white border border-slate-200 p-5 flex flex-col gap-4 shadow-sm h-full">
    <Skeleton className="w-full h-48 bg-slate-200" />
    <div className="space-y-3 flex-1 flex flex-col">
      <div className="flex justify-between items-start gap-2">
        <Skeleton className="w-2/3 h-5 bg-slate-200" />
        <Skeleton className="w-16 h-6 bg-slate-200 rounded-full" />
      </div>
      <Skeleton className="w-1/3 h-6 bg-slate-200" />
      <Skeleton className="w-full h-4 bg-slate-200 mt-2" />
      <Skeleton className="w-5/6 h-4 bg-slate-200" />
      <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
        <Skeleton className="w-full h-10 bg-slate-200 rounded-xl" />
        <Skeleton className="w-full h-10 bg-slate-200 rounded-xl" />
      </div>
    </div>
  </div>
);

export const DrawerSkeleton = () => (
  <div className="flex flex-col h-full bg-[#0F172A]">
    <div className="p-6 border-b border-white/10 flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-20 h-4" />
      </div>
      <Skeleton circle className="w-10 h-10" />
    </div>
    <div className="flex-1 p-6 space-y-6">
      <Skeleton className="w-full h-24" />
      <Skeleton className="w-full h-32" />
      <Skeleton className="w-full h-40" />
    </div>
    <div className="p-6 border-t border-white/10 flex gap-3">
      <Skeleton className="w-1/2 h-12" />
      <Skeleton className="w-1/2 h-12" />
    </div>
  </div>
);

export const ModalSkeleton = () => (
  <div className="p-8">
    <div className="text-center space-y-3 mb-8">
      <Skeleton circle className="w-16 h-16 mx-auto mb-4" />
      <Skeleton className="w-48 h-8 mx-auto" />
      <Skeleton className="w-64 h-4 mx-auto" />
    </div>
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-full h-12" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-full h-12" />
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-full h-12" />
      </div>
    </div>
  </div>
);
