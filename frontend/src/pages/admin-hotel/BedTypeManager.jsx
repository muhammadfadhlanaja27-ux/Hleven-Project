import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";

const emptyForm = {
  name: "",
  size: "",
  max_adults: 1,
  max_children: 0,
  max_total: 1,
  description: "",
  status: "active",
};

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  const firstValidationError = data?.errors && Object.values(data.errors).flat()[0];
  return firstValidationError || data?.message || fallback;
};

export default function BedTypeManager() {
  const [bedTypes, setBedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // add | edit | delete
  const [selectedBed, setSelectedBed] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchBedTypes = async (force = false) => {
    setLoading(true);
    try {
      const { data } = await cachedGet("/admin/bed-types", {}, force);
      const list = Array.isArray(data?.data) ? data.data : [];
      setBedTypes(list);
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e, "Gagal memuat tipe tempat tidur."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedTypes();
  }, []);

  const handleOpenAdd = () => {
    setFormValues(emptyForm);
    setErrors({});
    setSelectedBed(null);
    setModalMode("add");
  };

  const handleOpenEdit = (bed) => {
    setFormValues({
      name: bed.name || "",
      size: bed.size || "",
      max_adults: bed.max_adults ?? 1,
      max_children: bed.max_children ?? 0,
      max_total: bed.max_total ?? 1,
      description: bed.description || "",
      status: bed.status || "active",
    });
    setSelectedBed(bed);
    setErrors({});
    setModalMode("edit");
  };

  const handleOpenDelete = (bed) => {
    setSelectedBed(bed);
    setErrors({});
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedBed(null);
    setErrors({});
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ 
      ...prev, 
      [name]: (name.includes('max_') && name !== 'description') ? (parseInt(value, 10) || 0) : value 
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formValues.name.trim()) err.name = "Nama diperlukan.";
    if (formValues.max_adults < 1) err.max_adults = "Minimal 1 dewasa.";
    if (formValues.max_total < 1) err.max_total = "Minimal 1 total.";
    if (formValues.max_total < formValues.max_adults + formValues.max_children) {
      err.max_total = "Total tidak boleh kurang dari jumlah dewasa dan anak.";
    }
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) return setErrors(err);
    setSubmitting(true);
    try {
      if (modalMode === "add") {
        await api.post("/admin/bed-types", formValues);
        toast.success("Tipe tempat tidur ditambahkan.");
      } else if (modalMode === "edit" && selectedBed) {
        await api.put(`/admin/bed-types/${selectedBed.id}`, formValues);
        toast.success("Tipe tempat tidur diperbarui.");
      }
      invalidateCache("/admin/bed-types");
      await fetchBedTypes(true);
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e, "Operasi gagal."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBed) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/bed-types/${selectedBed.id}`);
      toast.success("Tipe tempat tidur dihapus.");
      invalidateCache("/admin/bed-types");
      await fetchBedTypes(true);
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e, "Gagal menghapus tipe tempat tidur."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f5] text-[#1c1c1a] font-['Hanken_Grotesk',sans-serif] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-['Newsreader',serif] text-3xl sm:text-4xl font-semibold text-[#2D312C] tracking-tight">
              Manajemen Tempat Tidur
            </h2>
            <p className="text-base text-[#6B6E6A] mt-1">
              Atur konfigurasi kapasitas tempat tidur untuk unit kamar hotel Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleOpenAdd}
              className="bg-[#506147] text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#3b4b33] transition-all shadow-sm active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Tambah Tipe
            </button>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-[0px_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 border-4 border-[#E5E1DA] border-t-[#506147] rounded-full animate-spin"></div>
              <p className="text-[#6B6E6A] text-sm font-medium">Memuat data tipe kasur...</p>
            </div>
          ) : bedTypes.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center gap-4 bg-[#fcf9f5]/30">
              <div className="w-16 h-16 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#6B6E6A]">
                <span className="material-symbols-outlined text-[32px]">bed</span>
              </div>
              <div>
                <p className="text-[#2D312C] font-bold text-lg">Belum ada tipe tempat tidur</p>
                <p className="text-[#6B6E6A] text-sm mt-1">Mulai dengan menambahkan tipe tempat tidur baru.</p>
              </div>
              <button 
                onClick={handleOpenAdd}
                className="mt-2 text-[#506147] text-sm font-bold hover:underline"
              >
                Tambahkan Sekarang
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F9F6F1] border-b border-[#E5E1DA]">
                  <tr>
                    <th className="px-6 py-4 text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">Informasi Kasur</th>
                    <th className="px-6 py-4 text-center text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">Dewasa</th>
                    <th className="px-6 py-4 text-center text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">Anak</th>
                    <th className="px-6 py-4 text-center text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">Total Tamu</th>
                    <th className="px-6 py-4 text-center text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">Status</th>
                    <th className="px-6 py-4 text-center text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">Dipakai</th>
                    <th className="px-6 py-4 text-right text-[12px] font-bold text-[#757870] uppercase tracking-[0.1em]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDE9]">
                  {bedTypes.map((b) => (
                    <tr key={b.id} className="hover:bg-[#A8BBA2]/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[#2D312C] font-bold text-sm">{b.name}</span>
                          <span className="text-[#6B6E6A] text-[12px] mt-0.5">{b.size || "Ukuran tidak ditentukan"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-[#2D312C]">{b.max_adults}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-[#2D312C]">{b.max_children}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-[28px] bg-[#2D312C] text-white rounded text-xs font-bold">{b.max_total}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === "inactive"
                            ? "bg-[#FFDAD6] text-[#93000A]"
                            : "bg-[#E4EBE0] text-[#506147]"
                        }`}>
                          {b.status === "inactive" ? "Nonaktif" : "Aktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-semibold text-[#6B6E6A] bg-[#f0ede9] px-2 py-0.5 rounded">{b.room_types_count ?? 0} Kamar</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(b)} 
                            className="p-2 text-[#506147] hover:bg-[#E4EBE0] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(b)} 
                            className="p-2 text-[#BA1A1A] hover:bg-[#FFDAD6]/50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal CRUD Standardized */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm animate-fadeIn" onClick={closeModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E5E1DA] max-w-lg w-full z-10 overflow-hidden animate-slideUp">
            
            <div className="bg-[#fcf9f5] px-6 py-5 border-b border-[#E5E1DA] flex justify-between items-start">
              <div>
                <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
                  {modalMode === "add" ? "Tambah Tipe Kasur" : "Edit Tipe Kasur"}
                </h3>
                <p className="text-xs text-[#6B6E6A] mt-1 font-medium">Lengkapi rincian kapasitas tempat tidur di bawah ini.</p>
              </div>
              <button onClick={closeModal} className="text-[#6B6E6A] hover:text-[#2D312C] transition-colors p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Nama Tipe Kasur *</label>
                <input 
                  name="name" 
                  value={formValues.name} 
                  onChange={handleChange} 
                  placeholder="Contoh: King Size Bed"
                  className={`w-full h-11 px-4 rounded-xl border ${errors.name ? 'border-[#BA1A1A] bg-[#BA1A1A]/5' : 'border-[#E8EAE8] focus:border-[#506147]'} outline-none text-sm font-semibold text-[#2D312C] transition-all`}
                />
                {errors.name && <p className="text-[11px] text-[#BA1A1A] font-bold ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Ukuran / Dimensi</label>
                <input 
                  name="size" 
                  value={formValues.size} 
                  onChange={handleChange} 
                  placeholder="Contoh: 180 x 200 cm"
                  className="w-full h-11 px-4 rounded-xl border border-[#E8EAE8] focus:border-[#506147] outline-none text-sm font-semibold text-[#2D312C] transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Dewasa</label>
                  <input 
                    type="number" 
                    name="max_adults" 
                    value={formValues.max_adults} 
                    onChange={handleChange} 
                    className={`w-full h-11 px-4 rounded-xl border ${errors.max_adults ? 'border-[#BA1A1A]' : 'border-[#E8EAE8]'} text-center font-bold text-[#2D312C]`}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Anak</label>
                  <input 
                    type="number" 
                    name="max_children" 
                    value={formValues.max_children} 
                    onChange={handleChange} 
                    className="w-full h-11 px-4 rounded-xl border border-[#E8EAE8] text-center font-bold text-[#2D312C]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Total</label>
                  <input 
                    type="number" 
                    name="max_total" 
                    value={formValues.max_total} 
                    onChange={handleChange} 
                    className={`w-full h-11 px-4 rounded-xl border ${errors.max_total ? 'border-[#BA1A1A]' : 'border-[#E8EAE8]'} text-center font-bold text-[#2D312C]`}
                  />
                </div>
              </div>
              {errors.max_total && <p className="text-[11px] text-[#BA1A1A] font-bold text-center">{errors.max_total}</p>}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Deskripsi Tambahan</label>
                <textarea 
                  name="description" 
                  value={formValues.description} 
                  onChange={handleChange} 
                  placeholder="Keterangan opsional..."
                  rows="3"
                  className="w-full p-4 rounded-xl border border-[#E8EAE8] focus:border-[#506147] outline-none text-sm font-semibold text-[#2D312C] transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#6B6E6A] uppercase tracking-wider">Status Operasional</label>
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl border border-[#E8EAE8] focus:border-[#506147] outline-none bg-white text-sm font-semibold text-[#2D312C] transition-all"
                >
                  <option value="active">Aktif (Tersedia)</option>
                  <option value="inactive">Nonaktif (Sembunyikan)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 h-11 border border-[#E5E0D8] text-[#434842] rounded-xl font-bold hover:bg-[#FBFBFA] transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 h-11 bg-[#506147] text-white rounded-xl font-bold hover:bg-[#3D4B36] transition-all shadow-md active:scale-95 disabled:bg-[#a2ba9c]"
                >
                  {submitting ? "Memproses..." : modalMode === "add" ? "Simpan Tipe" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {modalMode === "delete" && selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-[#2D312C]/40 backdrop-blur-sm animate-fadeIn" onClick={closeModal}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl border border-[#E5E1DA] w-full max-w-sm overflow-hidden p-8 text-center animate-slideUp">
            <div className="w-16 h-16 bg-[#FFDAD6] text-[#93000A] rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="material-symbols-outlined text-[32px]">delete_forever</span>
            </div>
            <h3 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C] mb-2">Hapus Tipe Kasur?</h3>
            <p className="text-[#6B6E6A] text-sm mb-6 leading-relaxed">
              Anda akan menghapus tipe <span className="font-bold text-[#2D312C]">"{selectedBed.name}"</span>. Pastikan tipe ini tidak lagi diperlukan oleh unit kamar aktif Anda.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={closeModal} 
                className="flex-1 h-11 border border-[#E5E0D8] text-[#434842] rounded-xl font-bold hover:bg-[#FBFBFA] transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 h-11 bg-[#BA1A1A] text-white rounded-xl font-bold hover:bg-[#93000A] transition-all shadow-md active:scale-95"
              >
                {submitting ? "..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
