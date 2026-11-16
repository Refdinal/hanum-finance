import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { formatRupiah } from "../lib/format";
import { Button, Card, Modal, SectionTitle, Spinner } from "../components/ui";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [dataAset, setDataAset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("wishlist");
  const [nama, setNama] = useState("");
  const [volume, setVolume] = useState("1");
  const [satuan, setSatuan] = useState("pcs");
  const [harga, setHarga] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editVolume, setEditVolume] = useState("1");
  const [editSatuan, setEditSatuan] = useState("pcs");
  const [editHarga, setEditHarga] = useState("");
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    let active = true;
    const loadWishlist = api.get("/wishlist").then((response) => {
      if (active) setItems(response.data.wishlist || []);
    }).catch((e) => {
      console.error(e);
      if (active) setError("Gagal memuat Wishlist. Pastikan backend dan tabel Wishlist sudah tersedia.");
    });

    const loadDashboard = api.get("/transaksi/dashboard").then((response) => {
      if (active) setDataAset(response.data);
    }).catch((e) => console.error("Gagal memuat arus kas liquid:", e));

    Promise.allSettled([loadWishlist, loadDashboard]).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const totalLiquid = useMemo(() => {
    if (!dataAset) return 0;
    const akun = dataAset.akun || {};
    return (dataAset.saldo || [])
      .filter((s) => (akun.liquid || []).includes(s.akun))
      .reduce((total, s) => total + Number(s.saldo || 0), 0);
  }, [dataAset]);

  const wishlistItems = items.filter((item) => item.status !== "checkout");
  const checkoutItems = items.filter((item) => item.status === "checkout");
  const totalWishlist = wishlistItems.reduce((total, item) => total + Number(item.harga || 0) * Number(item.volume || 1), 0);
  const progressWishlist = totalLiquid > 0 ? Math.min((totalWishlist / totalLiquid) * 100, 100) : totalWishlist > 0 ? 100 : 0;

  const bukaEdit = (item) => {
    setEditingItem(item);
    setEditNama(item.nama);
    setEditVolume(String(item.volume || 1));
    setEditSatuan(item.satuan || "pcs");
    setEditHarga(String(item.harga));
  };

  const tambahItem = async (event) => {
    event.preventDefault();
    const volumeAngka = Number(volume);
    const hargaSatuan = Number(harga);
    if (!nama.trim() || !Number.isFinite(volumeAngka) || volumeAngka <= 0 || !satuan.trim() || !Number.isFinite(hargaSatuan) || hargaSatuan <= 0) return;
    setSaving(true);
    setError("");
    try {
      const response = await api.post("/wishlist", { nama: nama.trim(), volume: volumeAngka, satuan: satuan.trim(), harga: hargaSatuan });
      setItems((current) => [...current, response.data.item]);
      setNama(""); setVolume("1"); setSatuan("pcs"); setHarga("");
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal menambahkan item Wishlist.");
    } finally { setSaving(false); }
  };

  const hapusItem = async () => {
    if (!deletingItem) return;
    setSaving(true); setError("");
    try {
      await api.delete(`/wishlist/${deletingItem.id}`);
      setItems((current) => current.filter((item) => item.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal menghapus item Wishlist.");
    } finally { setSaving(false); }
  };

  const simpanEdit = async (event) => {
    event.preventDefault();
    const volumeAngka = Number(editVolume);
    const hargaSatuan = Number(editHarga);
    if (!editingItem || !editNama.trim() || !Number.isFinite(volumeAngka) || volumeAngka <= 0 || !editSatuan.trim() || !Number.isFinite(hargaSatuan) || hargaSatuan <= 0) return;
    setSaving(true); setError("");
    try {
      const response = await api.put(`/wishlist/${editingItem.id}`, { nama: editNama.trim(), volume: volumeAngka, satuan: editSatuan.trim(), harga: hargaSatuan });
      setItems((current) => current.map((item) => item.id === editingItem.id ? response.data.item : item));
      setEditingItem(null);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal mengubah item Wishlist.");
    } finally { setSaving(false); }
  };

  const tandaiSelesai = async (item) => {
    setSaving(true); setError("");
    try {
      const response = await api.patch(`/wishlist/${item.id}/checkout`);
      setItems((current) => current.map((entry) => entry.id === item.id ? response.data.item : entry));
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal memindahkan item ke Checkout.");
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const currentItems = tab === "wishlist" ? wishlistItems : checkoutItems;
  return (
    <div className="space-y-6">
      <SectionTitle>Wishlist</SectionTitle>
      {error && <p role="alert" className="rounded-2xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>}

      <Card className="border-hero-violet bg-hero-violet/15 p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Total Wishlist</p><p className="mt-2 text-2xl font-bold tracking-tight text-ink-plum">{formatRupiah(totalWishlist)}</p></div>
          <div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Arus Kas Liquid</p><p className="mt-2 text-2xl font-bold tracking-tight text-bitcoin-orange">{formatRupiah(totalLiquid)}</p></div>
        </div>
        <div className="mt-5" role="progressbar" aria-label="Perbandingan total Wishlist dengan arus kas liquid" aria-valuenow={Math.round(progressWishlist)} aria-valuemin={0} aria-valuemax={100}>
          <div className="mb-2 flex justify-between text-xs text-graphite"><span>Penggunaan arus kas liquid</span><span>{progressWishlist.toFixed(1)}%</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-pure-white/80"><div className={`h-full rounded-full transition-all ${progressWishlist >= 100 ? "bg-rose" : "bg-mint"}`} style={{ width: `${progressWishlist}%` }} /></div>
          <p className="mt-2 text-xs text-graphite">Sisa setelah Wishlist: {formatRupiah(totalLiquid - totalWishlist)}</p>
        </div>
      </Card>

      {tab === "wishlist" && <Card className="p-6">
        <SectionTitle>Tambah Item</SectionTitle>
        <form onSubmit={tambahItem} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.8fr_1fr_auto] lg:items-end">
          <div><label className="label-dark" htmlFor="wishlist-nama">Item</label><input id="wishlist-nama" className="input-dark" placeholder="Nama item" value={nama} onChange={(event) => setNama(event.target.value)} required /></div>
          <div><label className="label-dark" htmlFor="wishlist-volume">Volume</label><input id="wishlist-volume" className="input-dark" type="number" min="0.01" step="any" value={volume} onChange={(event) => setVolume(event.target.value)} required /></div>
          <div><label className="label-dark" htmlFor="wishlist-satuan">Satuan</label><input id="wishlist-satuan" className="input-dark" placeholder="pcs, kg, liter" value={satuan} onChange={(event) => setSatuan(event.target.value)} required /></div>
          <div><label className="label-dark" htmlFor="wishlist-harga">Harga satuan (Rp)</label><input id="wishlist-harga" className="input-dark" type="number" min="1" step="1" value={harga} onChange={(event) => setHarga(event.target.value)} required /></div>
          <Button type="submit" disabled={saving}>+ Tambah Wishlist</Button>
        </form>
      </Card>}

      <div className="flex gap-2 border-b border-mist" role="tablist" aria-label="Daftar Wishlist">
        {[{ id: "wishlist", label: "Wishlist" }, { id: "checkout", label: "Checkout" }].map((item) => (
          <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} onClick={() => setTab(item.id)} className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "border-ink-plum text-ink-plum" : "border-transparent text-slate hover:text-ink-plum"}`}>
            {item.label} <span className="ml-1 text-xs">({item.id === "wishlist" ? wishlistItems.length : checkoutItems.length})</span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden !rounded-2xl">
        <div className="overflow-x-auto">
          <table className="table-dark min-w-[760px]">
            <thead><tr><th>Item</th><th className="text-right">Volume</th><th>Satuan</th><th className="text-right">Harga satuan</th><th className="text-right">Harga</th><th className="text-right">Aksi</th></tr></thead>
            <tbody>
              {currentItems.map((item) => <tr key={item.id}>
                <td className="font-medium text-ink-plum">{item.nama}</td>
                <td className="text-right">{Number(item.volume || 1).toLocaleString("id-ID")}</td>
                <td>{item.satuan || "pcs"}</td>
                <td className="text-right">{formatRupiah(item.harga)}</td>
                <td className="text-right font-semibold">{formatRupiah(Number(item.harga) * Number(item.volume || 1))}</td>
                <td className="text-right"><div className="flex justify-end gap-2">
                  {tab === "wishlist" ? <>
                    <Button type="button" variant="muted" className="h-8 min-w-0 px-2 py-1" onClick={() => bukaEdit(item)} disabled={saving} aria-label={`Edit ${item.nama}`} title="Edit">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" /></svg>
                    </Button>
                    <Button type="button" variant="danger" className="h-8 min-w-0 px-2 py-1" onClick={() => setDeletingItem(item)} disabled={saving} aria-label={`Hapus ${item.nama} dari Wishlist`} title="Hapus">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
                    </Button>
                    <Button type="button" className="h-8 min-w-0 px-2 py-1" onClick={() => tandaiSelesai(item)} disabled={saving} aria-label={`Selesai ${item.nama}`} title="Selesai">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
                    </Button>
                  </> : <span className="text-sm text-mint">Selesai</span>}
                </div></td>
              </tr>)}
              {currentItems.length === 0 && <tr><td colSpan={6} className="text-center text-slate">{tab === "wishlist" ? "Belum ada item di Wishlist." : "Belum ada item di Checkout."}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={!!editingItem} onClose={() => !saving && setEditingItem(null)} title="Edit Item Wishlist" footer={<><Button variant="muted" type="button" onClick={() => setEditingItem(null)} disabled={saving}>Batal</Button><Button type="submit" form="edit-wishlist-form" disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button></>}>
        <form id="edit-wishlist-form" onSubmit={simpanEdit} className="space-y-4">
          <div><label className="label-dark" htmlFor="edit-wishlist-nama">Item</label><input id="edit-wishlist-nama" className="input-dark" value={editNama} onChange={(event) => setEditNama(event.target.value)} required /></div>
          <div><label className="label-dark" htmlFor="edit-wishlist-volume">Volume</label><input id="edit-wishlist-volume" className="input-dark" type="number" min="0.01" step="any" value={editVolume} onChange={(event) => setEditVolume(event.target.value)} required /></div>
          <div><label className="label-dark" htmlFor="edit-wishlist-satuan">Satuan</label><input id="edit-wishlist-satuan" className="input-dark" value={editSatuan} onChange={(event) => setEditSatuan(event.target.value)} required /></div>
          <div><label className="label-dark" htmlFor="edit-wishlist-harga">Harga satuan (Rp)</label><input id="edit-wishlist-harga" className="input-dark" type="number" min="1" step="1" value={editHarga} onChange={(event) => setEditHarga(event.target.value)} required /></div>
        </form>
      </Modal>

      <Modal open={!!deletingItem} onClose={() => !saving && setDeletingItem(null)} title="Konfirmasi Hapus" footer={<><Button variant="muted" type="button" onClick={() => setDeletingItem(null)} disabled={saving}>Batal</Button><Button variant="danger" type="button" onClick={hapusItem} disabled={saving}>{saving ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
        Yakin ingin menghapus <span className="font-semibold text-ink-plum">{deletingItem?.nama}</span> dari Wishlist?
      </Modal>
    </div>
  );
};

export default Wishlist;
