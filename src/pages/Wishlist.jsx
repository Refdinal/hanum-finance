import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { formatRupiah } from "../lib/format";
import { Badge, Button, Card, SectionTitle, Spinner } from "../components/ui";

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [dataAset, setDataAset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nama, setNama] = useState("");
  const [harga, setHarga] = useState("");

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

  const totalAset = useMemo(() => {
    if (!dataAset) return 0;
    const akun = dataAset.akun || {};
    const saldo = dataAset.saldo || [];
    const liquid = saldo
      .filter((s) => (akun.liquid || []).includes(s.akun))
      .reduce((total, s) => total + Number(s.saldo || 0), 0);
    const investasi = (dataAset.investasi?.rincian || [])
      .filter((r) => Number(r.saldo) !== 0)
      .reduce((total, r) => total + Number(r.saldo || 0), 0);
    return liquid + investasi;
  }, [dataAset]);

  const totalWishlist = items.reduce((total, item) => total + Number(item.harga || 0), 0);

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

  const hapusItem = async (id) => {
    setSaving(true);
    setError("");
    try {
      await api.delete(`/wishlist/${id}`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Gagal menghapus item Wishlist.");
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
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Total Wishlist</p>
        <p className="mt-2 text-3xl font-bold tracking-tight text-ink-plum">{formatRupiah(totalWishlist)}</p>
        <p className="mt-2 text-sm text-graphite">Total aset saat ini: {formatRupiah(totalAset)}</p>
      </Card>

      <Card className="p-6">
        <SectionTitle>Tambah Item</SectionTitle>
        <form onSubmit={tambahItem} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="label-dark" htmlFor="wishlist-nama">Nama item</label>
            <input
              id="wishlist-nama"
              className="input-dark"
              placeholder="Contoh: TV"
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
              placeholder="3000000"
              value={harga}
              onChange={(event) => setHarga(event.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={saving}>+ Tambah Wishlist</Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-right">Harga</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const tersedia = Number(item.harga) <= totalAset;
                return (
                  <tr key={item.id} className={tersedia ? "bg-mint/10" : "bg-rose/10"}>
                    <td className="font-medium text-ink-plum">{item.nama}</td>
                    <td className="text-right font-semibold">{formatRupiah(item.harga)}</td>
                    <td>
                      <Badge tone={tersedia ? "mint" : "rose"}>{tersedia ? "Available" : "Not available"}</Badge>
                    </td>
                    <td className="text-right">
                      <Button
                        type="button"
                        variant="danger"
                        className="px-3 py-1.5"
                        onClick={() => hapusItem(item.id)}
                        disabled={saving}
                        aria-label={`Hapus ${item.nama} dari Wishlist`}
                      >
                        Hapus
                      </Button>
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
    </div>
  );
};

export default Wishlist;
