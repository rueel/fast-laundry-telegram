import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Telegraf } from 'telegraf';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Alur 2.0: Cek Status Pelanggan via Telegram API
bot.start(async (ctx) => {
  const telegramId = ctx.from.id.toString();
  
  // Query ke database Supabase
  const { data: pelanggan, error } = await supabase
    .from('pelanggan')
    .select('*')
    .eq('telegram_id', telegramId)
    .single();

  if (error || !pelanggan) {
    // 2.2 [SITUASI IF] Belum Terdaftar
    // Set mode Live Chat aktif di DB agar Admin membalas secara manual
    await supabase.from('pelanggan').insert([{ telegram_id: telegramId, is_live_chat: true }]);
    
    return ctx.reply("Halo! Anda belum terdaftar di sistem Fast Laundry. Mohon tunggu sebentar, Admin kami akan segera menghubungi Anda secara langsung di sini untuk membantu pendaftaran.");
  }

  if (pelanggan.is_live_chat) {
    // Jika sedang dalam mode Live Chat manual dengan Admin, bot diam
    return;
  }

  // 2.3 [SITUASI ELSE] Sudah Terdaftar
  // Bot menyapa personal dan mengirimkan tautan formulir pembuatan order baru
  return ctx.reply(`Halo ${pelanggan.nama}! Selamat datang kembali di Fast Laundry.\n\nSilakan klik tautan berikut untuk membuat pesanan laundry baru Anda: http://localhost:3000/order-form?tg_id=${telegramId}`);
});

export async function POST(request) {
  const body = await request.json();
  await bot.handleUpdate(body);
  return NextResponse.json({ status: 'ok' });
}