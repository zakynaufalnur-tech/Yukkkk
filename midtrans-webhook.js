const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) return res.status(500).json({ error: "Server key belum dikonfigurasi." });
  try {
    const { order_id, status_code, gross_amount, signature_key } = req.body || {};
    if (!order_id || !status_code || !gross_amount || !signature_key)
      return res.status(400).json({ error: "Payload not lengkap." });
    const expected = crypto.createHash("sha512").update(`${order_id}${status_code}${gross_amount}${key}`).digest("hex");
    const a = Buffer.from(expected), b = Buffer.from(String(signature_key));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b))
      return res.status(401).json({ error: "Signature tidak valid." });
    // Webhook tervalidasi. Untuk produksi, simpan status ini ke database/order system.
    return res.status(200).json({ received: true });
  } catch {
    return res.status(400).json({ error: "Payload webhook tidak valid." });
  }
};