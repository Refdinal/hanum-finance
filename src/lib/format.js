export const formatRupiah = (angka) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(angka) || 0);

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Ambil komponen tanggal dari string apa adanya (tanpa konversi zona waktu).
const partTanggal = (iso) => {
  const s = String(iso).replace("T", " ").slice(0, 19); // YYYY-MM-DD HH:mm:ss
  const [date, time = "00:00:00"] = s.split(" ");
  const [y, m, d] = date.split("-");
  const [hh = "00", mm = "00"] = time.split(":");
  return { y, m: Number(m), d, hh, mm };
};

export const formatTanggal = (iso) => {
  if (!iso) return "-";
  const { y, m, d, hh, mm } = partTanggal(iso);
  return `${d} ${BULAN[m - 1] || ""} ${y}, ${hh}:${mm}`;
};

export const formatBulan = (iso) => {
  if (!iso) return "-";
  const { y, m } = partTanggal(iso);
  return `${BULAN[m - 1] || ""} ${y}`;
};

export const labelTipe = (tipe) =>
  ({
    pendapatan: "Pendapatan",
    pengeluaran: "Pengeluaran",
    pemindahan: "Pemindahan",
    masuk_investasi: "Masuk Investasi",
    tarik_investasi: "Tarik Investasi",
  })[tipe] || tipe;

// Waktu sekarang dalam zona Asia/Jakarta (independen dari zona waktu browser).
export const nowLocalInput = () => {
  const p = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const g = (t) => p.find((x) => x.type === t)?.value;
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}:${g("second")}`;
};
