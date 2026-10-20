import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";

export default function BedTypeManager() {
  const [bedTypes, setBedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null); // add | edit | delete
  const [selectedBed, setSelectedBed] = useState(null);
  const [formValues, setFormValues] = useState({
    name: "",
    size: "",
    max_adults: 1,
    max_children: 0,
    max_total: 1,
    description: "",
  });
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
      toast.error("Gagal memuat tipe tempat tidur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedTypes();
  }, []);

  const handleOpenAdd = () => {
    setFormValues({ name: "", size: "", max_adults: 1, max_children: 0, max_total: 1, description: "" });
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
    });
    setSelectedBed(bed);
    setErrors({});
    setModalMode("edit");
  };

  const handleOpenDelete = (bed) => {
    setSelectedBed(bed);
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
    if (formValues.max_adults > formValues.max_total) err.max_total = "Total harus >= Dewasa.";
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
      } else if (modalMode === "delete" && selectedBed) {
        await api.delete(`/admin/bed-types/${selectedBed.id}`);
        toast.success("Tipe tempat tidur dihapus.");
      }
      invalidateCache("/admin/bed-types");
      await fetchBedTypes(true);
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Operasi gagal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8F9F8] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-[#E8EAE8] overflow-hidden">
        <div className="p-6 border-b border-[#E8EAE8] flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-semibold text-[#2D312C] font-['Newsreader',serif]">Manajemen Tempat Tidur</h2>
            <p className="text-sm text-[#6B6E6A] mt-1">Atur konfigurasi kapasitas kasur untuk hotel Anda</p>
          </div>
          <button 
            onClick={handleOpenAdd} 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#506147] text-white rounded-full font-medium hover:bg-[#3D4B36] transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Tipe
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-[#506147]/20 border-t-[#506147] rounded-full animate-spin"></div>
              <p className="text-[#6B6E6A] font-medium">Memuat data...</p>
            </div>
          ) : bedTypes.length === 0 ? (
            <div className="text-center py-20 bg-[#FBFBFA] rounded-xl border-2 border-dashed border-[#E8EAE8]">
              <span className="material-symbols-outlined text-[48px] text-[#A6A9A6]">bed</span>
              <p className="text-[#6B6E6A] mt-4 font-medium">Belum ada tipe tempat tidur</p>
              <button onClick={handleOpenAdd} className="text-[#506147] underline mt-1 text-sm font-semibold">Mulai tambahkan sekarang</button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E8EAE8]">
              <table className="min-w-full divide-y divide-[#E8EAE8]">
                <thead className="bg-[#FBFBFA]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Informasi Kasur</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Dewasa</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Anak</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Total Tamu</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E8EAE8]">
                  {bedTypes.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8F9F8] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[#2D312C] font-semibold">{b.name}</span>
                          <span className="text-[#6B6E6A] text-xs italic">{b.size || "Ukuran tidak diset"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2.5 py-1 bg-[#506147]/10 text-[#506147] rounded-md text-sm font-bold">{b.max_adults}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-2.5 py-1 bg-[#D48C45]/10 text-[#D48C45] rounded-md text-sm font-bold">{b.max_children}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="px-3 py-1 bg-[#2D312C] text-white rounded-md text-sm font-bold">{b.max_total}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenEdit(b)} 
                            className="p-2 text-[#506147] hover:bg-[#506147]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleOpenDelete(b)} 
                            className="p-2 text-[#BA1A1A] hover:bg-[#BA1A1A]/10 rounded-lg transition-colors"
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

      {/* Modal Form */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in slide-in-from-bottom-4 zoom-in-95">
            <div className="p-6 border-b border-[#E8EAE8] flex justify-between items-center bg-[#FBFBFA]">
              <h3 className="text-xl font-bold text-[#2D312C] font-['Newsreader',serif]">
                {modalMode === "add" ? "Tambah Tipe Kasur" : "Perbarui Tipe Kasur"}
              </h3>
              <button onClick={closeModal} className="text-[#6B6E6A] hover:text-[#2D312C] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Nama Tipe Kasur *</label>
                <input 
                  name="name" 
                  value={formValues.name} 
                  onChange={handleChange} 
                  placeholder="Contoh: King Bed, Double Twin"
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-[#BA1A1A] bg-[#BA1A1A]/5' : 'border-[#E8EAE8] focus:border-[#506147]'} outline-none transition-all`}
                />
                {errors.name && <p className="text-[11px] text-[#BA1A1A] font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Dimensi / Ukuran</label>
                <input 
                  name="size" 
                  value={formValues.size} 
                  onChange={handleChange} 
                  placeholder="Contoh: 180 x 200 cm"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAE8] focus:border-[#506147] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Dewasa</label>
                  <input 
                    type="number" 
                    name="max_adults" 
                    value={formValues.max_adults} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.max_adults ? 'border-[#BA1A1A]' : 'border-[#E8EAE8]'} text-center font-bold`}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Anak</label>
                  <input 
                    type="number" 
                    name="max_children" 
                    value={formValues.max_children} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAE8] text-center font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Total</label>
                  <input 
                    type="number" 
                    name="max_total" 
                    value={formValues.max_total} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-2.5 rounded-xl border ${errors.max_total ? 'border-[#BA1A1A]' : 'border-[#E8EAE8]'} text-center font-bold`}
                  />
                </div>
              </div>
              {errors.max_total && <p className="text-[11px] text-[#BA1A1A] font-semibold text-center">{errors.max_total}</p>}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Keterangan Tambahan</label>
                <textarea 
                  name="description" 
                  value={formValues.description} 
                  onChange={handleChange} 
                  placeholder="Opsional..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAE8] focus:border-[#506147] outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="flex-1 px-4 py-3 border border-[#E8EAE8] text-[#2D312C] rounded-xl font-bold hover:bg-[#FBFBFA] transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-[#506147] text-white rounded-xl font-bold hover:bg-[#3D4B36] transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-2">
            <div className="w-20 h-20 bg-[#BA1A1A]/10 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[40px]">warning</span>
            </div>
            <h3 className="text-xl font-bold text-[#2D312C] mb-2 font-['Newsreader',serif]">Hapus Tipe Kasur?</h3>
            <p className="text-[#6B6E6A] text-sm mb-8">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-[#2D312C]">"{selectedBed.name}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={closeModal} 
                className="flex-1 px-4 py-3 border border-[#E8EAE8] text-[#2D312C] rounded-xl font-bold hover:bg-[#FBFBFA]"
              >
                Batal
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-[#BA1A1A] text-white rounded-xl font-bold hover:bg-[#93000A] transition-all shadow-md active:scale-95"
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
