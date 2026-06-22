'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dataTrenPendapatan = [
  { tgl: '16 Juni', Omzet: 4500000 },
  { tgl: '17 Juni', Omzet: 3200000 },
  { tgl: '18 Juni', Omzet: 5800000 },
  { tgl: '19 Juni', Omzet: 4100000 },
  { tgl: '20 Juni', Omzet: 6900000 },
  { tgl: '21 Juni', Omzet: 5200000 },
  { tgl: '22 Juni', Omzet: 7500000 },
];

export default function OwnerDashboard() {
  const handleExport = (format) => {
    alert(`Sistem mengekstrak data rekapan transaksi secara otomatis ke format file: ${format}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Laporan & Statistik</h1>
          <p className="text-sm font-medium text-gray-500 mt-0.5">Pemantauan performa bisnis Fast Laundry secara Real-Time</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border text-sm font-semibold text-gray-600">
          📅 Periode: <span className="text-gray-900 font-bold">Bulan Ini</span>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama (Sesuai Gambar 9 & Ringkasan Bab 3) */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-bold uppercase text-gray-400 tracking-wider">Total Pendapatan Kotor</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">Rp 45.780.000</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-bold uppercase text-gray-400 tracking-wider">Total Berat Pakaian</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">1.247,6 Kg</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-bold uppercase text-gray-400 tracking-wider">Jumlah Pesanan Selesai</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">386 Order</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-bold uppercase text-gray-400 tracking-wider">Rata-Rata Nilai Transaksi</p>
          <h3 className="text-2xl font-black text-gray-800 mt-1">Rp 118.608</h3>
        </div>
      </div>

      {/* Area Grafik Visualisasi Real-Time */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Grafik Garis Tren Pendapatan Harian</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataTrenPendapatan}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="tgl" tickLine={false} stroke="#9ca3af" />
              <YAxis tickLine={false} stroke="#9ca3af" />
              <Tooltip formatter={(val) => `Rp ${val.toLocaleString('id-ID')}`} />
              <Legend />
              <Line type="monotone" dataKey="Omzet" stroke="#eab308" strokeWidth={4} activeDot={{ r: 8 }} dot={{ strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabel Riwayat Transaksi Finansial */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800">Riwayat Transaksi Selesai</h3>
          <div className="flex gap-2">
            <button onClick={() => handleExport('Excel')} className="px-3 py-1.5 bg-green-50 text-green-700 font-bold rounded-xl text-xs hover:bg-green-100 border border-green-200">Ekspor Excel</button>
            <button onClick={() => handleExport('CSV')} className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs hover:bg-blue-100 border border-blue-200">Ekspor CSV</button>
            <button onClick={() => handleExport('PDF')} className="px-3 py-1.5 bg-red-50 text-red-700 font-bold rounded-xl text-xs hover:bg-red-100 border border-red-200">Cetak PDF</button>
          </div>
        </div>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-400 font-bold uppercase text-[11px] tracking-wider border-b">
              <th className="p-4">ID Order</th>
              <th className="p-4">Nama Pelanggan</th>
              <th className="p-4">Beban Berat</th>
              <th className="p-4">Total Biaya</th>
              <th className="p-4">Metode</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y font-medium text-gray-700">
            <tr className="hover:bg-gray-50/50">
              <td className="p-4 font-bold text-gray-400">#LND-001</td>
              <td className="p-4 text-gray-900 font-bold">Gauri</td>
              <td className="p-4">1,5 Kg</td>
              <td className="p-4 font-bold">Rp 22.500</td>
              <td className="p-4">Digital Transfer</td>
              <td className="p-4"><span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-50 text-green-600">Completed</span></td>
            </tr>
            <tr className="hover:bg-gray-50/50">
              <td className="p-4 font-bold text-gray-400">#LND-002</td>
              <td className="p-4 text-gray-900 font-bold">Agung Lanang</td>
              <td className="p-4">4,0 Kg</td>
              <td className="p-4 font-bold">Rp 32.000</td>
              <td className="p-4">QRIS Lunas</td>
              <td className="p-4"><span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-50 text-green-600">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// trigger rebuild online