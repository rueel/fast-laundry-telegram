import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Telegraf } from 'telegraf';

// WAJIB untuk Next.js App Router agar tidak di-cache sebagai halaman statis
export const dynamic = 'force-dynamic';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.on('text', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const msgText = ctx.message.text;

  try {
    const { data: pelanggan, error } = await supabase
      .from('pelanggan')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();

    if (error || !pelanggan) {
      await supabase.from('pelanggan').insert([
        { telegram_id: telegramId, nama: ctx.from.first_name || 'Pelanggan Baru', is_live_chat: true }
      ]);

      return await ctx.reply(
        "👋 Selamat datang di Fast Laundry! Akun Anda belum terdaftar. " +
        "Fungsi bot otomatis dimatikan sementara, ruang obrolan dialihkan ke Live Chat manual. " +
        "Mohon tunggu, Admin kami akan segera menyapa dan mendaftarkan data Anda secara lengkap."
      );
    }

    if (pelanggan.is_live_chat) {
      return; 
    }

    if (msgText.toLowerCase().includes('laundry') || msgText.toLowerCase().includes('menu') || msgText === '/start') {
      return await ctx.reply(
        `Halo ${pelanggan.nama}! ✨\n` +
        `Sesi otomatisasi Bot Fast Laundry Aktif.\n\n` +
        `Silakan isi formulir digital berikut untuk membuat order penjemputan baru Anda:\n` +
        `🔗 https://project-2qgcu.vercel.app/order-form?tg_id=${telegramId}`
      );
    }
  } catch (dbError) {
    console.error("❌ Database or Reply Error:", dbError);
  }
});

export async function POST(request) {
  try {
    // Membaca body sebagai text/json mentah
    const body = await request.json();
    
    // Log mutlak untuk memastikan apakah request dari Telegram mendarat ke sini
    console.log("📥 [TELEGRAM INCOMING]:", JSON.stringify(body));
    
    if (!body || !body.update_id) {
      return NextResponse.json({ error: "Invalid Telegram payload" }, { status: 400 });
    }

    await bot.handleUpdate(body);
    return NextResponse.json({ status: 'success' });
  } catch (err) {
    console.error("💥 Error Webhook Handler:", err.message);
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 });
  }
}

// Menangani request GET dari browser hanya untuk mengecek apakah API ini hidup
export async function GET() {
  return NextResponse.json({ status: "API Telegram is running smoothly" });
}