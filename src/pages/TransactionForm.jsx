import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { nowLocalInput } from "../lib/format";
import { Button, Card, Field, SectionTitle, Spinner } from "../components/ui";

const emptyForm = () => ({
  tanggal: nowLocalInput(),
  tipe: "",
  kategori: "",
  asal: "",
  tujuan: "",
  jumlah: "",
  deskripsi: "",
});

const TransactionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    const load = async () => {
      try {
        const m = await api.get("/transaksi/meta");
        setMeta(m.data.meta);
        if (isEdit) {
          const t = await api.get(`/transaksi/id/${id}`);
          const row = t.data.transaksi[0];
          if (row) {
            setForm({
              tanggal: String(row.tanggal || "").replace(" ", "T").slice(0, 19),
              tipe: row.tipe || "",
              kategori: row.kategori || "",
              asal: row.asal || "",
              tujuan: row.tujuan || "",
              jumlah: row.jumlah ?? "",
              deskripsi: row.deskripsi || "",
            });
          }
        }
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const liquid = meta?.AKUN.liquid || [];
  const investasi = meta?.AKUN.investasi || [];

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  // Ganti tipe -> kosongkan semua field turunan.
  const onTipeChange = (tipe) =>
    setForm((f) => ({ ...f, tipe, kategori: "", asal: "", tujuan: "" }));

  const onKategori = (kategori) => setForm((f) => ({ ...f, kategori, tujuan: "" }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      tanggal: form.tanggal,
      tipe: form.tipe,
      kategori: form.tipe === "pengeluaran" ? form.kategori : null,
      asal: form.asal,
      tujuan: form.tujuan,
      jumlah: Number(form.jumlah),
      deskripsi: form.deskripsi,
    };
    setBusy(true);
    try {
      if (isEdit) {
        await api.put(`/transaksi/update/${id}`, payload);
      } else {
        await api.post("/transaksi/inserttransaksi", payload);
      }
      navigate("/transactions");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  const tujuanOptions = () => {
    if (form.tipe === "pendapatan") return liquid;
    if (form.tipe === "pemindahan") return liquid;
    if (form.tipe === "masuk_investasi") return investasi;
    if (form.tipe === "tarik_investasi") return liquid;
    if (form.tipe === "pengeluaran") {
      if (form.kategori === "belanja") return meta.TUJUAN_BELANJA;
      if (form.kategori === "amal") return meta.TUJUAN_AMAL;
    }
    return [];
  };

  const asalOptions = () => {
    if (form.tipe === "pendapatan") return meta.SUMBER_PENDAPATAN;
    if (form.tipe === "pengeluaran") return liquid;
    if (form.tipe === "tarik_investasi") return investasi;
    if (form.tipe === "masuk_investasi" || form.tipe === "pemindahan") return liquid;
    return [];
  };

  const tujuanDisabled = form.tipe === "pengeluaran" ? !form.kategori : false;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle>{isEdit ? "Edit Transaksi" : "Tambah Transaksi"}</SectionTitle>

      <Card className="p-6">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tanggal">
              <input
                type="datetime-local"
                step="1"
                className="input-dark"
                value={form.tanggal}
                onChange={(e) => set("tanggal", e.target.value)}
                required
              />
            </Field>

            <Field label="Tipe Transaksi">
              <select className="input-dark" value={form.tipe} onChange={(e) => onTipeChange(e.target.value)} required>
                <option value="">Pilih Tipe Transaksi</option>
                {meta.TIPE.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {form.tipe === "pengeluaran" && (
            <Field label="Kategori">
              <select className="input-dark" value={form.kategori} onChange={(e) => onKategori(e.target.value)} required>
                <option value="">Pilih Kategori</option>
                {meta.KATEGORI.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {form.tipe && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Asal Dana">
                <select className="input-dark" value={form.asal} onChange={(e) => set("asal", e.target.value)} required>
                  <option value="">Pilih Asal Dana</option>
                  {asalOptions().map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tujuan">
                <select
                  className="input-dark"
                  value={form.tujuan}
                  onChange={(e) => set("tujuan", e.target.value)}
                  disabled={tujuanDisabled}
                  required
                >
                  <option value="">Pilih Tujuan</option>
                  {tujuanOptions().map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {form.tipe && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Jumlah (IDR)">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="input-dark"
                  placeholder="0"
                  value={form.jumlah}
                  onChange={(e) => set("jumlah", e.target.value)}
                  required
                />
              </Field>
              <Field label="Deskripsi">
                <input
                  type="text"
                  className="input-dark"
                  placeholder="Opsional"
                  value={form.deskripsi}
                  onChange={(e) => set("deskripsi", e.target.value)}
                />
              </Field>
            </div>
          )}

          {error && <p className="text-sm text-rose">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="muted" onClick={() => navigate("/transactions")}>
              Batal
            </Button>
            <Button type="submit" disabled={busy || !form.tipe}>
              {busy ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default TransactionForm;
