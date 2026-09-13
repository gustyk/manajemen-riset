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
  CheckCircle2,
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
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Daftarkan Mitra Baru</span>
        </button>
      </div>

      {initialPartners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Mitra Terdaftar</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Daftarkan institusi mitra industri atau instansi pemerintah untuk ditautkan pada proyek riset.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {initialPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {partner.organization_type}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{partner.name}</h4>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>PIC: {partner.pic_name}</span>
                  </p>
                  {partner.pic_email && (
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{partner.pic_email}</span>
                    </p>
                  )}
                  {partner.pic_phone && (
                    <p className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{partner.pic_phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {partner.mou_document_url && (
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <a
                    href={partner.mou_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Dokumen MoU / Kerjasama</span>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Daftarkan Mitra Kolaborasi</h3>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-xs text-red-700">
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan / Instansi
                </label>
                <input
                  name="name"
                  required
                  placeholder="PT Inovasi Solusi Informatika"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Organisasi
                </label>
                <select
                  name="organizationType"
                  defaultValue="Industri / Swasta"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama PIC</label>
                  <input
                    name="picName"
                    required
                    placeholder="Bpk. Budi Santoso"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp/HP</label>
                  <input
                    name="picPhone"
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email PIC</label>
                <input
                  name="picEmail"
                  type="email"
                  placeholder="pic@mitra.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan Berkas MoU / PKS (Opsional)
                </label>
                <input
                  name="mouDocumentUrl"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
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
