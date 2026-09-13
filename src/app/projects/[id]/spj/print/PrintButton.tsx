'use client';

import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Cetak Lembar Dokumen (PDF)</span>
    </button>
  );
}
