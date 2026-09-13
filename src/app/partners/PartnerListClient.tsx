'use client';

import { useState } from 'react';
import { createPartner } from './actions';
import {
  Building2,
  Mail,
  Phone,
  Plus,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export default function PartnerListClient({ initialPartners }: { initialPartners: any[] }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const res = await createPartner(formData);
    if (res?.error) {
      setErrorMessage(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      setShowModal(false);
    }
  }

  return (
    <div className="font-sans">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Daftarkan Mitra Baru</span>
        </button>
      </div>

      {initialPartners.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-zinc-300 p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 mb-3 border border-zinc-200">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-950">Belum Ada Mitra Terdaftar</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Daftarkan institusi mitra industri atau instansi pemerintah untuk ditautkan pada lembar pengesahan dan proposal hibah.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-xl border border-zinc-200 p-5 shadow-2xs hover:border-zinc-900 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                    {partner.organization_type}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-zinc-950 line-clamp-1">{partner.name}</h4>
                <div className="mt-3 space-y-1.5 text-xs text-zinc-600">
                  <p className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span>PIC: <strong className="text-zinc-800 font-semibold">{partner.pic_name}</strong></span>
                  </p>
                  {partner.pic_email && (
                    <p className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{partner.pic_email}</span>
                    </p>
                  )}
                  {partner.pic_phone && (
                    <p className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{partner.pic_phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {partner.mou_document_url && (
                <div className="pt-3 mt-4 border-t border-zinc-100">
                  <a
                    href={partner.mou_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-semibold text-orange-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Dokumen MoU / PKS</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Mitra */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-950">Daftarkan Mitra Kolaborasi</h3>
              <span className="text-[10px] font-mono uppercase text-zinc-400">MoU / Kerjasama</span>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Nama Perusahaan / Instansi
                </label>
                <input
                  name="name"
                  required
                  placeholder="Contoh: PT Inovasi Solusi Digital"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Jenis Organisasi
                </label>
                <select
                  name="organizationType"
                  defaultValue="Industri / Swasta"
                  className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors bg-white font-mono"
                >
                  <option value="Industri / Swasta">Industri / Swasta</option>
                  <option value="Instansi Pemerintah / BUMN">Instansi Pemerintah / BUMN</option>
                  <option value="UMKM">UMKM</option>
                  <option value="Komunitas / NGO">Komunitas / NGO</option>
                  <option value="Perguruan Tinggi Lain">Perguruan Tinggi Lain</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Nama PIC
                  </label>
                  <input
                    name="picName"
                    required
                    placeholder="Bpk. Hendra Wijaya"
                    className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    No. WhatsApp / HP
                  </label>
                  <input
                    name="picPhone"
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Email PIC Resmi
                </label>
                <input
                  name="picEmail"
                  type="email"
                  placeholder="pic@perusahaan.co.id"
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Tautan Berkas Dokumen Legal MoU / PKS
                </label>
                <input
                  name="mouDocumentUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs font-mono border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-orange-600 focus:ring-1 focus:ring-orange-600 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-orange-600 rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Mitra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
