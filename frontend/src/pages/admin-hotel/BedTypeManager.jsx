import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";

const initialForm = { name: "", description: "", status: "active" };

export default function BedTypeManager() {
  const [bedTypes, setBedTypes] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBedType, setEditingBedType] = useState(null);
  const [deletingBedType, setDeletingBedType] = useState(null);
  const [form, setForm] = useState(initialForm);

  const loadBedTypes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/bed-types");
      const data = response.data?.data;
      if (!Array.isArray(data)) {
        throw new Error("Format daftar tipe kasur dari server tidak valid.");
      }
      setBedTypes(data);
    } catch (error) {
      console.error("Gagal memuat tipe kasur:", error);
      toast.error(error.response?.data?.message || "Gagal memuat daftar tipe kasur.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBedTypes();
  }, []);

  const filteredBedTypes = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return bedTypes.filter((bedType) =>
      [bedType.name, bedType.description]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase().includes(query))
    );
  }, [bedTypes, search]);

  const openCreate = () => {
    setEditingBedType(null);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const openEdit = (bedType) => {
    setEditingBedType(bedType);
    setForm({
      name: bedType.name || "",
      description: bedType.description || "",
      status: bedType.status || "active",
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingBedType(null);
    setForm(initialForm);
    setIsFormOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      if (editingBedType) {
        await api.put(`/admin/bed-types/${editingBedType.id}`, form);
        toast.success("Tipe kasur berhasil diperbarui.");
      } else {
        await api.post("/admin/bed-types", form);
        toast.success("Tipe kasur berhasil ditambahkan.");
      }
      closeForm();
      await loadBedTypes();
    } catch (error) {
      console.error("Gagal menyimpan tipe kasur:", error);
      const message =
        error.response?.data?.message ||
        Object.values(error.response?.data?.errors || {})[0]?.[0] ||
        "Gagal menyimpan tipe kasur.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBedType) return;
    setIsSaving(true);
    try {
      await api.delete(`/admin/bed-types/${deletingBedType.id}`);
      setBedTypes((current) =>
        current.filter((bedType) => bedType.id !== deletingBedType.id)
      );
      setDeletingBedType(null);
      toast.success("Tipe kasur berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus tipe kasur:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus tipe kasur.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-['Newsreader',serif] text-3xl font-semibold text-[#2D312C]">
            CRUD Kasur
          </h1>
          <p className="text-sm text-[#6B6E6A] mt-1">
            Kelola pilihan tipe kasur untuk kamar hotel Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#506147] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b4b33]"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Tambah Tipe Kasur
        </button>
      </div>

      <div className="rounded-xl border border-[#E5E1DA] bg-white p-4 sm:p-6 shadow-sm">
        <div className="relative mb-5">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#778873]">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau deskripsi kasur..."
            aria-label="Cari tipe kasur"
            className="h-11 w-full rounded-lg border border-[#E5E0D8] pl-10 pr-4 text-sm focus:border-[#506147] focus:outline-none focus:ring-2 focus:ring-[#506147]/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-[#E5E1DA] text-xs uppercase tracking-wide text-[#6B6E6A]">
                <th className="px-3 py-3">Nama Tipe Kasur</th>
                <th className="px-3 py-3">Deskripsi</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1DA] text-sm">
              {isLoading ? (
                <tr><td colSpan="4" className="px-3 py-10 text-center text-[#6B6E6A]">Memuat tipe kasur...</td></tr>
              ) : filteredBedTypes.length === 0 ? (
                <tr><td colSpan="4" className="px-3 py-10 text-center text-[#6B6E6A]">Tidak ada tipe kasur yang cocok.</td></tr>
              ) : filteredBedTypes.map((bedType) => (
                <tr key={bedType.id} className="hover:bg-[#F8F6F2]">
                  <td className="px-3 py-4 font-semibold text-[#2D312C]">{bedType.name}</td>
                  <td className="px-3 py-4 text-[#6B6E6A]">{bedType.description || "—"}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${bedType.status === "active" ? "bg-[#E4EBE0] text-[#4A5D43]" : "bg-[#F2EBE1] text-[#6B6E6A]"}`}>
                      {bedType.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEdit(bedType)} className="rounded-lg border border-[#D8D5CD] px-3 py-1.5 text-xs font-semibold text-[#506147] hover:bg-[#E4EBE0]">
                        Edit
                      </button>
                      <button type="button" onClick={() => setDeletingBedType(bedType)} className="rounded-lg border border-[#E5C7C1] px-3 py-1.5 text-xs font-semibold text-[#BA1A1A] hover:bg-[#FFF0EE]">
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">
                  {editingBedType ? "Edit Tipe Kasur" : "Tambah Tipe Kasur"}
                </h2>
                <p className="mt-1 text-xs text-[#6B6E6A]">Data ini hanya berlaku untuk hotel Anda.</p>
              </div>
              <button type="button" onClick={closeForm} aria-label="Tutup" className="text-2xl text-[#6B6E6A]">×</button>
            </div>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#434842]">Nama tipe kasur *</span>
              <input
                required
                maxLength={100}
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Contoh: 1 King Bed"
                className="h-11 w-full rounded-lg border border-[#E5E0D8] px-3 text-sm focus:border-[#506147] focus:outline-none"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#434842]">Deskripsi</span>
              <textarea
                rows={3}
                maxLength={1000}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Opsional"
                className="w-full rounded-lg border border-[#E5E0D8] p-3 text-sm focus:border-[#506147] focus:outline-none"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#434842]">Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="h-11 w-full rounded-lg border border-[#E5E0D8] px-3 text-sm focus:border-[#506147] focus:outline-none"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} disabled={isSaving} className="rounded-lg border border-[#D8D5CD] px-4 py-2 text-sm font-semibold text-[#506147]">Batal</button>
              <button type="submit" disabled={isSaving} className="rounded-lg bg-[#506147] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {deletingBedType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="font-['Newsreader',serif] text-2xl font-semibold text-[#2D312C]">Hapus Tipe Kasur?</h2>
            <p className="text-sm text-[#6B6E6A]">
              Tipe <strong>{deletingBedType.name}</strong> akan dihapus dan tidak bisa dipilih untuk kamar baru. Tipe yang sedang dipakai kamar harus dinonaktifkan, bukan dihapus.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeletingBedType(null)} disabled={isSaving} className="rounded-lg border border-[#D8D5CD] px-4 py-2 text-sm font-semibold text-[#506147]">Batal</button>
              <button type="button" onClick={handleDelete} disabled={isSaving} className="rounded-lg bg-[#BA1A1A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isSaving ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
