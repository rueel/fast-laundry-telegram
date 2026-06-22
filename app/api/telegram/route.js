import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Telegraf } from 'telegraf';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Alur 2.0: Cek Status Pelanggan Berdasarkan ID Telegram
bot.on('text', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const msgText = ctx.message.text;

  try {
    // Jalankan query ke database pelanggan Supabase
    const { data: pelanggan, error } = await supabase
      .from('pelanggan')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    // 2.2 [SITUASI IF] Pelanggan BELUM Terdaftar di Database
    if (error || !pelanggan) {
      // Daftarkan telegram_id baru dengan mode Live Chat aktif
      await supabase.from('pelanggan').insert([
        { telegram_id: telegramId, nama: ctx.from.first_name || 'Pelanggan Baru', is_live_chat: true }
      ]);

      return await ctx.reply(
        "👋 Selamat datang di Fast Laundry! Akun Anda belum terdaftar. " +
        "Fungsi bot otomatis dimatikan sementara, ruang obrolan dialihkan ke Live Chat manual. " +
        "Mohon tunggu, Admin kami akan segera menyapa dan mendaftarkan data Anda secara lengkap."
      );
    }

    // Jika pelanggan sedang dalam mode Live Chat manual dengan Admin, bot tidak membalas otomatis
    if (pelanggan.is_live_chat) {
      return; 
    }

    // 2.3 [SITUASI ELSE] Pelanggan SUDAH Terdaftar di Database
    if (msgText.toLowerCase().includes('laundry') || msgText.toLowerCase().includes('menu') || msgText === '/start') {
      return await ctx.reply(
        `Halo ${pelanggan.nama}! ✨\n` +
        `Sesi otomatisasi Bot Fast Laundry Aktif.\n\n` +
        `Silakan isi formulir digital berikut untuk membuat order penjemputan baru Anda:\n` +
        `🔗 https://project-2qgcu.vercel.app/order-form?tg_id=${telegramId}` // Ubah localhost ke domain vercel kamu
      );
    }
  } catch (dbError) {
    console.error("Database or Reply Error:", dbError);
  }
});

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Cetak log mentah untuk memastikan data dari Telegram beneran masuk ke Vercel
    console.log("=== DATA TELEGRAM MASUK ===", JSON.stringify(body));
    
    // WAJIB: Selesaikan penanganan update sebelum fungsi POST mengembalikan respons
    await bot.handleUpdate(body);
    
    return NextResponse.json({ status: 'success' });
  } catch (err) {
    console.error("Error Webhook Handler:", err);
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}