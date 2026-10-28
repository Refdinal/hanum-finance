import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { formatBulan, formatRupiah } from "../lib/format";
import { Card, SectionTitle, Spinner } from "../components/ui";
import LineChart from "../components/LineChart";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get("/transaksi/dashboard")
      .then((res) => active && setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-slate">Gagal memuat data.</p>;

  const akun = data.akun || {};
  const saldo = data.saldo || [];
  const liquid = saldo.filter((s) => (akun.liquid || []).includes(s.akun));
  const investasiRinci = (data.investasi?.rincian || []).filter((r) => Number(r.saldo) !== 0);

  const totalLiquid = liquid.reduce((s, r) => s + Number(r.saldo), 0);
  const totalInvestasi = investasiRinci.reduce((s, r) => s + Number(r.saldo), 0);
  const totalAset = totalLiquid + totalInvestasi;

  const bulanan = (data.belanja_bulanan || []).map((b) => ({
    label: formatBulan(b.bulan).slice(0, 3),
    bulanPenuh: formatBulan(b.bulan),
    sandang: b.sandang,
    pangan: b.pangan,
    papan: b.papan,
    pokok: b.pokok,
    sekunder: b.sekunder,
    tersier: b.tersier,
    amal: b.amal,
    total: b.total,
  }));

  const nBulan = bulanan.length;
  const totalPokok = bulanan.reduce((s, b) => s + b.pokok, 0);
  const totalSemua = bulanan.reduce((s, b) => s + b.total, 0);
  const rataPokok = nBulan ? totalPokok / nBulan : 0;
  const rataSemua = nBulan ? totalSemua / nBulan : 0;

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle>Dashboard</SectionTitle>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <SectionTitle>Arus Kas Liquid</SectionTitle>
            <div className="mb-4 rounded-[48px] border border-hero-violet bg-hero-violet/15 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Total</p>
              <p className="mt-1 text-xl font-bold text-bitcoin-orange">{formatRupiah(totalLiquid)}</p>
            </div>
            <div className="space-y-3">
              {liquid.map((s) => (
                <div key={s.akun} className="flex items-center justify-between border-b border-mist/60 pb-2">
                  <span className="capitalize text-ink-plum">{s.akun}</span>
                  <span className="font-semibold">{formatRupiah(s.saldo)}</span>
                </div>
              ))}
              {liquid.length === 0 && <p className="text-sm text-slate">Belum ada akun liquid.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle
              right={
                <Link to="/investasi" className="btn-pill btn-ghost">
                  Detail
                </Link>
              }
            >
              Investasi
            </SectionTitle>
            <div className="mb-4 rounded-[48px] border border-[#16a34a]/30 bg-[#16a34a]/5 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Total</p>
              <p className="mt-1 text-xl font-bold text-[#16a34a]">{formatRupiah(totalInvestasi)}</p>
            </div>
            <div className="space-y-3">
              {investasiRinci.map((s) => (
                <div key={s.akun} className="flex items-center justify-between border-b border-mist/60 pb-2">
                  <span className="capitalize text-ink-plum">{s.akun}</span>
                  <span className="font-semibold">{formatRupiah(s.saldo)}</span>
                </div>
              ))}
              {investasiRinci.length === 0 && <p className="text-sm text-slate">Belum ada akun investasi.</p>}
            </div>
          </Card>

          <Card className="p-6">
            <SectionTitle>Total Aset</SectionTitle>
            <div className="mb-4 rounded-[48px] border border-hero-violet bg-hero-violet/15 p-4">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">Total</p>
              <p className="mt-1 text-xl font-bold text-bitcoin-orange">{formatRupiah(totalAset)}</p>
            </div>
            <p className="text-xs text-slate">Liquid + Investasi</p>
          </Card>
        </div>
      </section>

      <section>
        <Card className="p-6">
          <SectionTitle>Pengeluaran Bulanan (12 Bulan)</SectionTitle>
          {bulanan.length ? (
            <LineChart
              data={bulanan}
              series={[
                { key: "pokok", label: "Total Pokok", shortLabel: "Total Pokok", color: "#6ae4ff", defaultOn: true },
                { key: "total", label: "Total", shortLabel: "Total", color: "#ffb84c", defaultOn: true },
                { key: "sandang", label: "Sandang", color: "#34edb3" },
                { key: "pangan", label: "Pangan", color: "#a78bfa" },
                { key: "papan", label: "Papan", color: "#f472b6" },
                { key: "sekunder", label: "Sekunder", color: "#facc15" },
                { key: "tersier", label: "Tersier", color: "#fb923c" },
                { key: "amal", label: "Amal", color: "#60a5fa" },
              ]}
            />
          ) : (
            <p className="py-8 text-center text-sm text-slate">Belum ada data pengeluaran.</p>
          )}
        </Card>
      </section>

      <section>
        <Card className="overflow-hidden">
          <div className="p-6 pb-0">
            <SectionTitle>Rincian Bulanan Grafik</SectionTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th className="text-right">Sandang</th>
                  <th className="text-right">Pangan</th>
                  <th className="text-right">Papan</th>
                  <th className="text-right">Total Pokok</th>
                  <th className="text-right">Sekunder</th>
                  <th className="text-right">Tersier</th>
                  <th className="text-right">Amal</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {[...bulanan].reverse().map((b, i) => (
                  <tr key={i}>
                    <td className="whitespace-nowrap capitalize text-ink-plum">{b.bulanPenuh}</td>
                    <td className="text-right text-slate">{formatRupiah(b.sandang)}</td>
                    <td className="text-right text-slate">{formatRupiah(b.pangan)}</td>
                    <td className="text-right text-slate">{formatRupiah(b.papan)}</td>
                    <td className="text-right font-semibold text-bitcoin-orange">{formatRupiah(b.pokok)}</td>
                    <td className="text-right text-slate">{formatRupiah(b.sekunder)}</td>
                    <td className="text-right text-slate">{formatRupiah(b.tersier)}</td>
                    <td className="text-right text-[#16a34a]">{formatRupiah(b.amal)}</td>
                    <td className="text-right font-semibold text-amber">{formatRupiah(b.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">
            Pengeluaran Pokok · 12 Bulan
          </p>
          <p className="mt-2 text-2xl font-bold text-ink-plum">{formatRupiah(totalPokok)}</p>
          <p className="mt-1 text-xs text-slate">
            Rata-rata <span className="font-semibold text-bitcoin-orange">{formatRupiah(rataPokok)}</span> / bulan
          </p>
          <p className="mt-1 text-xs text-slate">Sandang + Pangan + Papan</p>
        </Card>
        <Card className="p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.09em] text-slate">
            Pengeluaran Total · 12 Bulan
          </p>
          <p className="mt-2 text-2xl font-bold text-ink-plum">{formatRupiah(totalSemua)}</p>
          <p className="mt-1 text-xs text-slate">
            Rata-rata <span className="font-semibold text-[#16a34a]">{formatRupiah(rataSemua)}</span> / bulan
          </p>
          <p className="mt-1 text-xs text-slate">Sandang + Pangan + Papan + Sekunder + Tersier + Amal</p>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
