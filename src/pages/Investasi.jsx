import React, { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatRupiah, formatTanggal, labelTipe } from "../lib/format";
import { Badge, Card, SectionTitle, Spinner } from "../components/ui";

const Investasi = () => {
  const [data, setData] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/transaksi/investasi"), api.get("/transaksi/alltransaksi/100")])
      .then(([inv, t]) => {
        setData(inv.data.investasi);
        setRiwayat(
          (t.data.transaksi || []).filter(
            (x) =>
              x.arah === "masuk" && (x.tipe === "masuk_investasi" || x.tipe === "tarik_investasi"),
          ),
        );
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-slate">Gagal memuat data.</p>;

  return (
    <div className="space-y-8">
      <SectionTitle>Investasi</SectionTitle>

      <Card className="p-6">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Total Nilai Investasi</p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-[#16a34a]">{formatRupiah(data.total)}</p>
      </Card>

      <Card className="p-6">
        <SectionTitle>Rincian Akun</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.rincian
            .filter((r) => Number(r.saldo) !== 0)
            .map((r) => (
            <div key={r.akun} className="flex items-center justify-between rounded-[48px] border border-mist bg-card-lilac px-5 py-4">
              <span className="font-medium capitalize text-ink-plum">{r.akun}</span>
              <span className="font-bold text-[#16a34a]">{formatRupiah(r.saldo)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-6 pb-0">
          <SectionTitle>Riwayat Investasi</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Asal</th>
                <th>Tujuan</th>
                <th className="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap">{formatTanggal(r.tanggal)}</td>
                  <td>
                    <Badge tone={r.tipe === "masuk_investasi" ? "mint" : "amber"}>{labelTipe(r.tipe)}</Badge>
                  </td>
                  <td className="capitalize">{r.asal}</td>
                  <td className="capitalize">{r.tujuan}</td>
                  <td className="text-right font-semibold">{formatRupiah(r.jumlah)}</td>
                </tr>
              ))}
              {riwayat.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-slate">
                    Belum ada transaksi investasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Investasi;
