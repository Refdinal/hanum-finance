import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatRupiah, formatTanggal, labelTipe } from "../lib/format";
import { Badge, Button, Card, Modal, SectionTitle, Spinner } from "../components/ui";

const tipeTone = {
  pendapatan: "mint",
  pengeluaran: "rose",
  pemindahan: "glow",
  masuk_investasi: "mint",
  tarik_investasi: "amber",
};

const TIPE_OPSI = ["pendapatan", "pengeluaran", "pemindahan", "masuk_investasi", "tarik_investasi"];

const FILTER_KOSONG = { q: "", tipe: "", asal: "", tujuan: "", dari: "", sampai: "" };

const Transactions = () => {
  const [rows, setRows] = useState([]);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState(FILTER_KOSONG);
  const [opsi, setOpsi] = useState({ asal: [], tujuan: [] });
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQ(filters.q.trim()), 350);
    return () => clearTimeout(t);
  }, [filters.q]);

  useEffect(() => {
    api
      .get("/transaksi/filteropsi")
      .then((res) => setOpsi(res.data.opsi || { asal: [], tujuan: [] }))
      .catch((e) => console.error(e));
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filters.tipe) params.set("tipe", filters.tipe);
    if (filters.asal) params.set("asal", filters.asal);
    if (filters.tujuan) params.set("tujuan", filters.tujuan);
    if (filters.dari) params.set("dari", filters.dari);
    if (filters.sampai) params.set("sampai", filters.sampai);
    const qs = params.toString();
    api
      .get(`/transaksi/alltransaksi/${limit}${qs ? `?${qs}` : ""}`)
      .then((res) => setRows(res.data.transaksi || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [limit, q, filters.tipe, filters.asal, filters.tujuan, filters.dari, filters.sampai]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
  const adaFilter = q || filters.tipe || filters.asal || filters.tujuan || filters.dari || filters.sampai;

  const doDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`/transaksi/delete/${target.id}`);
      setTarget(null);
      load();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus transaksi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        right={
          <Link to="/transactions/new" className="btn-pill btn-solid">
            + Tambah Transaksi
          </Link>
        }
      >
        Riwayat Transaksi
      </SectionTitle>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <label className="label-dark">Cari</label>
            <input
              className="input-dark"
              placeholder="Deskripsi, kategori, akun..."
              value={filters.q}
              onChange={(e) => setFilter("q", e.target.value)}
            />
          </div>
          <div>
            <label className="label-dark">Tipe</label>
            <select
              className="input-dark"
              value={filters.tipe}
              onChange={(e) => setFilter("tipe", e.target.value)}
            >
              <option value="">Semua tipe</option>
              {TIPE_OPSI.map((t) => (
                <option key={t} value={t}>
                  {labelTipe(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-dark">Asal</label>
            <select
              className="input-dark"
              value={filters.asal}
              onChange={(e) => setFilter("asal", e.target.value)}
            >
              <option value="">Semua asal</option>
              {opsi.asal.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-dark">Tujuan</label>
            <select
              className="input-dark"
              value={filters.tujuan}
              onChange={(e) => setFilter("tujuan", e.target.value)}
            >
              <option value="">Semua tujuan</option>
              {opsi.tujuan.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-dark">Dari Tanggal</label>
            <input
              type="date"
              className="input-dark"
              value={filters.dari}
              onChange={(e) => setFilter("dari", e.target.value)}
            />
          </div>
          <div>
            <label className="label-dark">Sampai Tanggal</label>
            <input
              type="date"
              className="input-dark"
              value={filters.sampai}
              onChange={(e) => setFilter("sampai", e.target.value)}
            />
          </div>
          <div className="flex items-end">
            {adaFilter && (
              <Button variant="muted" onClick={() => setFilters(FILTER_KOSONG)}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Tipe</th>
                  <th>Asal</th>
                  <th>Tujuan</th>
                  <th>Kategori</th>
                  <th>Deskripsi</th>
                  <th className="text-right">Jumlah</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="whitespace-nowrap">{formatTanggal(t.tanggal)}</td>
                    <td>
                      <Badge tone={tipeTone[t.tipe] || "fog"}>{labelTipe(t.tipe)}</Badge>
                    </td>
                    <td className="capitalize">{t.asal}</td>
                    <td className="capitalize">{t.tujuan}</td>
                    <td className="capitalize">{t.kategori || "-"}</td>
                    <td className="text-slate">{t.deskripsi || "-"}</td>
                    <td className={`text-right font-bold ${t.arah === "keluar" ? "text-rose" : "text-[#16a34a]"}`}>
                      {t.arah === "keluar" ? "-" : "+"}
                      {formatRupiah(t.jumlah)}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/transactions/edit/${t.id}`} className="btn-pill btn-muted px-3 py-1.5">
                          Edit
                        </Link>
                        <button onClick={() => setTarget(t)} className="btn-pill btn-danger px-3 py-1.5">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-slate">
                      {adaFilter ? "Tidak ada transaksi yang cocok dengan filter." : "Belum ada transaksi."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {rows.length >= limit && (
        <div className="text-center">
          <Button variant="ghost" onClick={() => setLimit((l) => l + 20)}>
            Lihat Lebih Banyak
          </Button>
        </div>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Konfirmasi Hapus"
        footer={
          <>
            <Button variant="muted" onClick={() => setTarget(null)} disabled={busy}>
              Batal
            </Button>
            <Button variant="danger" onClick={doDelete} disabled={busy}>
              {busy ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </>
        }
      >
        Yakin ingin menghapus transaksi ini? Jika bagian dari pemindahan/transfer, seluruh pasangannya juga akan terhapus.
      </Modal>
    </div>
  );
};

export default Transactions;
