import React from 'react';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="bg-[#111111] p-8 rounded-xl border border-white/10 min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400">This module is under development.</p>
      </div>
    </div>
  );
}
