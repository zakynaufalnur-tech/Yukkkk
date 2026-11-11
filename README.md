# TOPUPYUK

Website top up game statis + Vercel Serverless Functions + Midtrans Snap.

## Fitur
- Pilih game dan paket.
- User ID / Zone ID.
- Membuat transaksi melalui backend (harga divalidasi di server).
- Checkout Midtrans untuk metode pembayaran yang aktif pada akun merchant.
- Cek status transaksi dari Midtrans.
- Verifikasi signature webhook.

## Deploy ke GitHub dan Vercel
1. Buat repository GitHub baru, misalnya `topupyuk`.
2. Upload seluruh isi folder project ini ke root repository (index.html harus berada di root).
3. Buka Vercel, pilih **Add New → Project**, lalu import repository `topupyuk`.
4. Di **Project Settings → Environment Variables**, tambahkan:
   - `MIDTRANS_SERVER_KEY` = Server Key dari dashboard Midtrans.
   - `MIDTRANS_IS_PRODUCTION` = `false` untuk Sandbox.
5. Deploy. Tidak perlu mengisi Build Command atau Output Directory.

## Pengujian Sandbox
1. Buat akun merchant Midtrans dengan pendampingan orang tua/wali jika belum memenuhi syarat usia.
2. Gunakan Server Key Sandbox terlebih dahulu.
3. Di dashboard Midtrans, atur Payment Notification URL menjadi:
   `https://NAMA-PROJECT.vercel.app/api/midtrans-webhook`
4. Lakukan transaksi uji memakai instruksi dan data pembayaran Sandbox resmi Midtrans.
5. Coba QRIS dan metode lain yang sudah diaktifkan pada akun Sandbox.

## Aktivasi transaksi sungguhan
- Selesaikan verifikasi merchant dan aktivasi metode pembayaran pada Midtrans.
- Ganti `MIDTRANS_SERVER_KEY` dengan Production Server Key.
- Ubah `MIDTRANS_IS_PRODUCTION` menjadi `true`, lalu redeploy.
- Jangan pernah memasukkan Server Key ke `script.js`, HTML, atau repository GitHub.
- QRIS/DANA/transfer bank hanya muncul jika metode tersebut tersedia dan sudah diaktifkan pada akun merchant.
- Pastikan harga paket, aturan game, dan izin penjualan top up sudah sesuai.

## Catatan penting
Project ini membuat pembayaran dan membaca status langsung dari Midtrans. Project ini **belum mengirim diamond/UC/VP secara otomatis**. Setelah status pembayaran berhasil, pesanan masih perlu diproses melalui distributor/API top-up resmi atau admin. Webhook saat ini memvalidasi signature, tetapi belum menyimpan data ke database. Untuk operasional toko sungguhan, tambahkan database order, pencatatan webhook idempotent, dan integrasi distributor resmi.

## Teknologi
HTML, CSS, JavaScript, Node.js Serverless Functions, Midtrans Snap, Vercel.
