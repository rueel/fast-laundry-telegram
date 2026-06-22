'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [chats, setChats] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('Semua');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [beratFinal, setBeratFinal] = useState('');
  const [catatanNoda, setCatatanNoda] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // Berlangganan perubahan data secara realtime dari Supabase
    const subscription = supabase
      .channel('changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pesanan' }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: dbOrders } = await supabase.from('pesanan').select('*, pelanggan(*)').order('created_at', { ascending: false });
    const { data: dbDrivers } = await supabase.from('driver').select('*');
    const { data: dbChats } = await supabase.from('pelanggan').select('*').eq('is_live_chat', true);
    
    setOrders(dbOrders || []);
    setDrivers(dbDrivers || []);
    setChats(dbChats || []);
    setLoading(false);
  }

  // Alur 3.2: Verifikasi Data Nyata ke Supabase
  const handleVerify = async (orderId) => {
    const { error } = await supabase.from('pesanan').update({ status_pesanan: 'Verified' }).eq('id', orderId);
    if (!error) {
      alert(`Order ${orderId} Berhasil Diverifikasi di Database!`);
      fetchData();
    }
  };

  // Alur 4.1: Alokasi Driver Nyata ke Lapangan
  const handleAssignDriver = async (orderId, driverId) => {
    if (!driverId) return;
    await supabase.from('pesanan').update({ driver_id: driverId }).eq('id', orderId);
    await supabase.from('driver').update({ status: 'Bertugas' }).eq('id', driverId);
    alert('Driver berhasil ditugaskan & status diperbarui di database!');
    fetchData();
  };

  // Alur 5.1: Input Berat & Kirim Invoice Otomatis
  const handleKirimInvoice = async (order) => {
    if (!beratFinal) return alert('Input berat final pakaian dahulu!');
    const tarif = order.tipe_layanan === 'Kilat' ? 15000 : 8000;
    const total = parseFloat(beratFinal) * tarif;

    await supabase.from('pesanan').update({
      berat_final: parseFloat(beratFinal),
      total_biaya: total,
      catatan_pakaian: catatanNoda,
      status_pesanan: 'In Process'
    }).eq('id', order.id);

    alert(`Invoice tersimpan! Total Biaya: Rp ${total.toLocaleString('id-ID')}.`);
    fetchData();
  };

  // Alur 5.2: Update Tahapan Produksi Fisik
  const handleUpdateProduksi = async (orderId, stage) => {
    await supabase.from('pesanan').update({ status_produksi: stage }).eq('id', orderId);
    fetchData();
  };

  const displayedOrders = filteredStatus === 'Semua' ? orders : orders.filter(o => o.status_pesanan === filteredStatus);

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-yellow-400 p-6 shadow-md flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-wider mb-8">FAST LAUNDRY</h2>
          <nav className="space-y-2 font-bold text-gray-700">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-gray-900 text-white' : 'hover:bg-yellow-300'}`}>📋 Antrean Pesanan</button>
            <button onClick={() => setActiveTab('chat')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'chat' ? 'bg-gray-900 text-white' : 'hover:bg-yellow-300'}`}>💬 Live Chat ({chats.length})</button>
            <button onClick={() => setActiveTab('drivers')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'drivers' ? 'bg-gray-900 text-white' : 'hover:bg-yellow-300'}`}>🚗 Driver Internal</button>
          </nav>
        </div>
        <button onClick={() => window.location.href = '/owner/dashboard'} className="w-full py-2.5 bg-yellow-500 text-gray-900 font-bold rounded-xl text-xs hover:bg-white transition text-center">Beralih ke Owner Dashboard ➡️</button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto max-h-screen">
        {loading && <p className="text-sm font-bold text-blue-600 mb-4 animate-pulse">🔄 Menghubungkan ke database Supabase...</p>}

        {/* TAB 1: OPERASIONAL UTAMA */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Manajemen Antrean Antar-Jemput</h1>
              <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm text-xs font-semibold">
                {['Semua', 'Pending Verification', 'Verified', 'In Process', 'Ready for Delivery'].map(f => (
                  <button key={f} onClick={() => setFilteredStatus(f)} className={`px-3 py-1.5 rounded-lg transition ${filteredStatus === f ? 'bg-yellow-400 text-gray-900 font-bold' : 'text-gray-500'}`}>{f.split(' ')[0]}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                {displayedOrders.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">Belum ada pesanan masuk dari Telegram.</p>
                ) : (
                  displayedOrders.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">{order.id}</span>
                        <h3 className="text-xl font-bold text-gray-800 mt-2">{order.pelanggan?.nama || 'Pelanggan Bot'}</h3>
                        <p className="text-sm text-gray-500 mt-1">Layanan: <span className="font-semibold text-gray-700">{order.tipe_layanan}</span> | Biaya: <span className="font-bold text-green-600">Rp {order.total_biaya?.toLocaleString('id-ID')}</span></p>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-600">{order.status_pesanan}</span>
                          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 text-purple-600">⚙️ {order.status_produksi}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button onClick={() => { setSelectedOrder(order); setBeratFinal(order.berat_final || ''); }} className="px-4 py-2 bg-gray-100 font-bold rounded-xl text-sm hover:bg-gray-200">Detail</button>
                        {order.status_pesanan === 'Pending Verification' && (
                          <button onClick={() => handleVerify(order.id)} className="px-4 py-2 bg-yellow-400 font-bold rounded-xl text-sm hover:bg-yellow-500">Verifikasi</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* DETAIL CONTROL PANEL */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
                {selectedOrder ? (
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">{selectedOrder.pelanggan?.nama || 'Pelanggan Bot'}</h2>
                    <p className="text-sm text-gray-500 mt-1">📍 {selectedOrder.alamat_jemput || 'Belum Mengisi Alamat'}</p>
                    
                    <div className="mt-4 pt-4 border-t">
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Tugaskan Driver</label>
                      <select value={selectedOrder.driver_id || ''} onChange={(e) => handleAssignDriver(selectedOrder.id, e.target.value)} className="w-full p-2 border rounded-xl bg-gray-50 text-sm">
                        <option value="">-- Pilih Driver Standby --</option>
                        {drivers.map(d => <option key={d.id} value={d.id}>{d.nama} ({d.status})</option>)}
                      </select>
                    </div>

                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Berat Timbangan (Kg)</label>
                        <input type="number" value={beratFinal} onChange={(e) => setBeratFinal(e.target.value)} className="w-full p-2 border rounded-xl text-sm" placeholder="0.0" />
                      </div>
                      <button onClick={() => handleKirimInvoice(selectedOrder)} className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700">Simpan & Terbitkan Invoice</button>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Update Tahap Produksi</label>
                      <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                        {['Antrean', 'Dicuci', 'Dikeringkan', 'Disetrika', 'Packing'].map(s => (
                          <button key={s} onClick={() => handleUpdateProduksi(selectedOrder.id, s)} className={`p-2 border rounded-lg text-left ${selectedOrder.status_produksi === s ? 'bg-purple-600 text-white font-bold' : 'bg-gray-50'}`}>🔹 {s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-10 text-sm">Pilih data antrean untuk memuat panel kontrol.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CHAT AKTIF */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl shadow-sm border h-[calc(100vh-120px)] flex">
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b bg-gray-50"><h2 className="font-bold text-gray-700">Antrean Live Chat (Fungsi Bot Mati)</h2></div>
              <div className="flex-1 divide-y overflow-y-auto">
                {chats.map(c => (
                  <div key={c.id} className="p-4 bg-orange-50/50 hover:bg-gray-50 cursor-pointer flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-800">{c.nama}</h4>
                      <p className="text-xs text-orange-600 font-semibold mt-1">ID Terkunci: {c.telegram_id}</p>
                    </div>
                    <button onClick={async () => {
                      await supabase.from('pelanggan').update({ is_live_chat: false }).eq('telegram_id', c.telegram_id);
                      alert('Ruang obrolan dikembalikan ke kendali Bot Otomatis.');
                      fetchData();
                    }} className="text-xs px-2 py-1 bg-gray-200 hover:bg-green-600 hover:text-white font-bold rounded-lg">Aktifkan Bot</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
              <p className="text-sm font-medium">Klik "Aktifkan Bot" jika admin selesai melayani pelanggan secara manual.</p>
            </div>
          </div>
        )}

        {/* TAB 3: MANAGEMENT DRIVER */}
        {activeTab === 'drivers' && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Status Logistik Kurir Internal</h2>
            <div className="grid grid-cols-3 gap-4">
              {drivers.map(d => (
                <div key={d.id} className="p-4 border rounded-xl bg-gray-50">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status === 'Standby' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span>
                  <h4 className="font-bold text-lg text-gray-800 mt-2">{d.nama}</h4>
                  <p className="text-xs text-gray-500 mt-1">🛵 {d.motor}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}