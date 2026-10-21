import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { cachedGet, invalidateCache } from "../../services/apiCache";

const emptyForm = {
  name: "",
  description: "",
  status: "active",
};

const getErrorMessage = (error, fallback) => {
  const data = error.response?.data;
  const firstValidationError = data?.errors && Object.values(data.errors).flat()[0];
  return firstValidationError || data?.message || fallback;
};

export default function RoomTypeManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formValues, setFormValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async (force = false) => {
    setLoading(true);
    try {
      const { data } = await cachedGet("/admin/room-type-categories", {}, force);
      const list = Array.isArray(data?.data) ? data.data : [];
      setCategories(list);
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e, "Gagal memuat tipe kamar."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setFormValues(emptyForm);
    setErrors({});
    setSelectedCategory(null);
    setModalMode("add");
  };

  const handleOpenEdit = (category) => {
    setFormValues({
      name: category.name || "",
      description: category.description || "",
      status: category.status || "active",
    });
    setSelectedCategory(category);
    setErrors({});
    setModalMode("edit");
  };

  const handleOpenDelete = (category) => {
    setSelectedCategory(category);
    setErrors({});
    setModalMode("delete");
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedCategory(null);
    setErrors({});
    setSubmitting(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formValues.name.trim()) err.name = "Nama tipe kamar diperlukan.";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) return setErrors(err);
    setSubmitting(true);
    try {
      if (modalMode === "add") {
        await api.post("/admin/room-type-categories", formValues);
        toast.success("Tipe kamar ditambahkan.");
      } else if (modalMode === "edit" && selectedCategory) {
        await api.put(`/admin/room-type-categories/${selectedCategory.id}`, formValues);
        toast.success("Tipe kamar diperbarui.");
      }
      invalidateCache("/admin/room-type-categories");
      await fetchCategories(true);
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e, "Operasi gagal."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await api.delete(`/admin/room-type-categories/${selectedCategory.id}`);
      toast.success("Tipe kamar dihapus.");
      invalidateCache("/admin/room-type-categories");
      await fetchCategories(true);
      closeModal();
    } catch (e) {
      console.error(e);
      toast.error(getErrorMessage(e, "Gagal menghapus tipe kamar."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 bg-[#F8F9F8] min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border border-[#E8EAE8] overflow-hidden">
        <div className="p-6 border-b border-[#E8EAE8] flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-semibold text-[#2D312C] font-['Newsreader',serif]">Manajemen Tipe Kamar</h2>
            <p className="text-sm text-[#6B6E6A] mt-1">Atur daftar tipe kamar yang dapat dipilih pada Room Management</p>
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
          ) : categories.length === 0 ? (
            <div className="text-center py-20 bg-[#FBFBFA] rounded-xl border-2 border-dashed border-[#E8EAE8]">
              <span className="material-symbols-outlined text-[48px] text-[#A6A9A6]">category</span>
              <p className="text-[#6B6E6A] mt-4 font-medium">Belum ada tipe kamar</p>
              <button onClick={handleOpenAdd} className="text-[#506147] underline mt-1 text-sm font-semibold">Mulai tambahkan sekarang</button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#E8EAE8]">
              <table className="min-w-full divide-y divide-[#E8EAE8]">
                <thead className="bg-[#FBFBFA]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Tipe Kamar</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Dipakai</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E8EAE8]">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-[#F8F9F8] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-[#2D312C] font-semibold">{category.name}</span>
                          <span className="text-[#6B6E6A] text-xs">{category.description || "Tanpa deskripsi"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          category.status === "inactive"
                            ? "bg-[#BA1A1A]/10 text-[#BA1A1A]"
                            : "bg-[#506147]/10 text-[#506147]"
                        }`}>
                          {category.status === "inactive" ? "Nonaktif" : "Aktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-[#6B6E6A]">
                        {category.room_types_count ?? 0} kamar
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenEdit(category)}
                            className="p-2 text-[#506147] hover:bg-[#506147]/10 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </button>
                          <button
                            onClick={() => handleOpenDelete(category)}
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

      {(modalMode === "add" || modalMode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in slide-in-from-bottom-4 zoom-in-95">
            <div className="p-6 border-b border-[#E8EAE8] flex justify-between items-center bg-[#FBFBFA]">
              <h3 className="text-xl font-bold text-[#2D312C] font-['Newsreader',serif]">
                {modalMode === "add" ? "Tambah Tipe Kamar" : "Perbarui Tipe Kamar"}
              </h3>
              <button onClick={closeModal} className="text-[#6B6E6A] hover:text-[#2D312C] transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Nama Tipe Kamar *</label>
                <input
                  name="name"
                  value={formValues.name}
                  onChange={handleChange}
                  placeholder="Contoh: Standard, Deluxe, Suite"
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? 'border-[#BA1A1A] bg-[#BA1A1A]/5' : 'border-[#E8EAE8] focus:border-[#506147]'} outline-none transition-all`}
                />
                {errors.name && <p className="text-[11px] text-[#BA1A1A] font-semibold">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Deskripsi</label>
                <textarea
                  name="description"
                  value={formValues.description}
                  onChange={handleChange}
                  placeholder="Opsional..."
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAE8] focus:border-[#506147] outline-none transition-all resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#6B6E6A] uppercase tracking-wider">Status</label>
                <select
                  name="status"
                  value={formValues.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8EAE8] focus:border-[#506147] outline-none transition-all bg-white"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <p className="text-[11px] text-[#6B6E6A]">Tipe nonaktif disembunyikan dari pilihan kamar baru.</p>
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

      {modalMode === "delete" && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-2">
            <div className="w-20 h-20 bg-[#BA1A1A]/10 text-[#BA1A1A] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[40px]">warning</span>
            </div>
            <h3 className="text-xl font-bold text-[#2D312C] mb-2 font-['Newsreader',serif]">Hapus Tipe Kamar?</h3>
            <p className="text-[#6B6E6A] text-sm mb-4">
              Apakah Anda yakin ingin menghapus <span className="font-bold text-[#2D312C]">"{selectedCategory.name}"</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            {(selectedCategory.room_types_count ?? 0) > 0 && (
              <p className="text-[#BA1A1A] text-xs font-semibold mb-4">
                Tipe ini dipakai {selectedCategory.room_types_count} kamar. Ubah status menjadi Nonaktif jika tidak ingin menghapusnya.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-[#E8EAE8] text-[#2D312C] rounded-xl font-bold hover:bg-[#FBFBFA]"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
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
