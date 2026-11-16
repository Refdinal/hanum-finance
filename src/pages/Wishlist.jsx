import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { formatRupiah } from "../lib/format";
import { Badge, Button, Card, Modal, SectionTitle, Spinner } from "../components/ui";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [dataAset, setDataAset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editHarga, setEditHarga] = useState("");
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/transaksi/dashboard"), api.get("/wishlist")])
      .then(([dashboard, wishlist]) => {
        if (!active) return;
        setDataAset(dashboard.data);
        setItems(wishlist.data.wishlist || []);
      })
      .catch((e) => {
        console.error(e);
        if (active) setError("Gagal memuat Wishlist. Coba muat ulang halaman.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const totalLiquid = useMemo(() => {
    if (!dataAset) return 0;
    const akun = dataAset.akun || {};
    const saldo = dataAset.saldo || [];
    return saldo
      .filter((s) => (akun.liquid || []).includes(s.akun))
      .reduce((total, s) => total + Number(s.saldo || 0), 0);
  }, [dataAset]);

  const totalWishlist = items.reduce((total, item) => total + Number(item.harga || 0), 0);
  const progressWishlist = totalLiquid > 0 ? Math.min((totalWishlist / totalLiquid) * 100, 100) : totalWishlist > 0 ? 100 : 0;

  const bukaEdit = (item) => {
    setEditingItem(item);
    setEditNama(item.nama);
    setEditHarga(String(item.harga));
  };

  const tambahItem = async (event) => {
    event.preventDefault();
    const hargaItem = Number(harga);
    if (!nama.trim() || !Number.isFinite(hargaItem) || hargaItem <= 0) return;

    setSaving(true);
    setError("");
    try {
      const response = await api.post("/wishlist", { nama: nama.trim(), harga: hargaItem });
      setItems((current) => [...current, response.data.item]);
      setNama("");
      setHarga("");
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal menambahkan item Wishlist.");
    } finally {
      setSaving(false);
    }
  };

  const hapusItem = async () => {
    if (!deletingItem) return;
    setSaving(true);
    setError("");
    try {
      await api.delete(`/wishlist/${deletingItem.id}`);
      setItems((current) => current.filter((item) => item.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal menghapus item Wishlist.");
    } finally {
      setSaving(false);
    }
  };

  const simpanEdit = async (event) => {
    event.preventDefault();
    const hargaItem = Number(editHarga);
    if (!editingItem || !editNama.trim() || !Number.isFinite(hargaItem) || hargaItem <= 0) return;

    setSaving(true);
    setError("");
    try {
      const response = await api.put(`/wishlist/${editingItem.id}`, { nama: editNama.trim(), harga: hargaItem });
      setItems((current) => current.map((item) => item.id === editingItem.id ? response.data.item : item));
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal mengubah item Wishlist.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <SectionTitle>Wishlist</SectionTitle>

      {error && <p role="alert" className="rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>}

      <Card className="border-hero-violet bg-hero-violet/15 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Total Wishlist</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-ink-plum">{formatRupiah(totalWishlist)}</p>
          </div>
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Arus Kas Liquid</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-bitcoin-orange">{formatRupiah(totalLiquid)}</p>
          </div>
        </div>
        <div className="mt-5" role="progressbar" aria-label="Perbandingan total Wishlist dengan arus kas liquid" aria-valuenow={Math.round(progressWishlist)} aria-valuemin={0} aria-valuemax={100}>
          <div className="mb-2 flex justify-between text-xs text-graphite">
            <span>Penggunaan arus kas liquid</span>
            <span>{progressWishlist.toFixed(1)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-pure-white/80">
            <div className={`h-full rounded-full transition-all ${progressWishlist >= 100 ? "bg-rose" : "bg-mint"}`} style={{ width: `${progressWishlist}%` }} />
          </div>
          <p className="mt-2 text-xs text-graphite">Sisa setelah Wishlist: {formatRupiah(totalLiquid - totalWishlist)}</p>
        </div>
      </Card>

      <Card className="p-6">
        <SectionTitle>Tambah Item</SectionTitle>
        <form onSubmit={tambahItem} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="label-dark" htmlFor="wishlist-nama">Nama item</label>
            <input
              id="wishlist-nama"
              className="input-dark"
              placeholder="Masukkan nama item"
              value={nama}
              onChange={(event) => setNama(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-dark" htmlFor="wishlist-harga">Harga (Rp)</label>
            <input
              id="wishlist-harga"
              className="input-dark"
              type="number"
              min="1"
              step="1"
              value={harga}
              onChange={(event) => setHarga(event.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={saving}>+ Tambah Wishlist</Button>
        </form>
      </Card>

      <Card className="overflow-hidden !rounded-2xl">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Harga</th>
                <th>Cukup Dana</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const tersedia = Number(item.harga) <= totalLiquid;
                return (
                  <tr key={item.id} className={tersedia ? "bg-mint/10" : "bg-rose/25"}>
                    <td className="font-medium text-ink-plum">{item.nama}</td>
                    <td className="text-right font-semibold">{formatRupiah(item.harga)}</td>
                    <td>
                      <Badge tone={tersedia ? "mint" : "rose"}>
                        <span className="sr-only">{tersedia ? "Available" : "Not available"}</span>
                        <svg
                          aria-hidden="true"
                          title={tersedia ? "Available" : "Not available"}
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {tersedia ? <path d="m5 12 4 4L19 6" /> : <path d="M18 6 6 18M6 6l12 12" />}
                        </svg>
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="muted"
                        className="h-8 min-w-0 px-2 py-1"
                        onClick={() => bukaEdit(item)}
                        disabled={saving}
                        aria-label={`Edit ${item.nama}`}
                        title="Edit"
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" />
                        </svg>
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="h-8 min-w-0 px-2 py-1"
                        onClick={() => setDeletingItem(item)}
                        disabled={saving}
                        aria-label={`Hapus ${item.nama} dari Wishlist`}
                        title="Hapus"
                      >
                        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                        </svg>
                      </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate">Belum ada item di Wishlist.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!editingItem}
        onClose={() => !saving && setEditingItem(null)}
        title="Edit Item Wishlist"
        footer={
          <>
            <Button variant="muted" type="button" onClick={() => setEditingItem(null)} disabled={saving}>Batal</Button>
            <Button type="submit" form="edit-wishlist-form" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </>
        }
      >
        <form id="edit-wishlist-form" onSubmit={simpanEdit} className="space-y-4">
          <div>
            <label className="label-dark" htmlFor="edit-wishlist-nama">Nama item</label>
            <input id="edit-wishlist-nama" className="input-dark" value={editNama} onChange={(event) => setEditNama(event.target.value)} required />
          </div>
          <div>
            <label className="label-dark" htmlFor="edit-wishlist-harga">Harga (Rp)</label>
            <input id="edit-wishlist-harga" className="input-dark" type="number" min="1" step="1" value={editHarga} onChange={(event) => setEditHarga(event.target.value)} required />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deletingItem}
        onClose={() => !saving && setDeletingItem(null)}
        title="Konfirmasi Hapus"
        footer={
          <>
            <Button variant="muted" type="button" onClick={() => setDeletingItem(null)} disabled={saving}>Batal</Button>
            <Button variant="danger" type="button" onClick={hapusItem} disabled={saving}>{saving ? "Menghapus..." : "Ya, Hapus"}</Button>
          </>
        }
      >
        Yakin ingin menghapus <span className="font-semibold text-ink-plum">{deletingItem?.nama}</span> dari Wishlist?
      </Modal>
    </div>
  );
};

export default Wishlist;
