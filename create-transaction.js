const crypto = require("crypto");
const catalog = require("./catalog");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return res.status(500).json({ error: "MIDTRANS_SERVER_KEY belum dipasang di Vercel." });

  try {
    const { gameId, packageIndex, userId, zoneId } = req.body || {};
    const game = catalog[gameId];
    const index = Number(packageIndex);
    if (!game || !Number.isInteger(index) || index < 0 || index >= game.packages.length)
      return res.status(400).json({ error: "Game atau paket tidak valid." });
    if (typeof userId !== "string" || !/^[0-9A-Za-z_-]{4,30}$/.test(userId))
      return res.status(400).json({ error: "User ID tidak valid." });
    if (gameId === "ml" && (typeof zoneId !== "string" || !/^[0-9]{1,8}$/.test(zoneId)))
      return res.status(400).json({ error: "Zone ID tidak valid." });

    const orderId = `TY-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const amount = game.packages[index];
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";
    const apiBase = isProduction ? "https://app.midtrans.com" : "https://app.sandbox.midtrans.com";
    const auth = Buffer.from(`${serverKey}:`).toString("base64");
    const payload = {
      transaction_details: { order_id: orderId, gross_amount: amount },
      item_details: [{ id: `${gameId}-${index}`, price: amount, quantity: 1, name: `${game.name} - Paket ${index + 1}` }],
      customer_details: { first_name: "Pelanggan TOPUPYUK" },
      callbacks: { finish: `${req.headers.origin || "https://example.com"}/?order_id=${encodeURIComponent(orderId)}` },
      custom_field1: gameId,
      custom_field2: userId,
      custom_field3: gameId === "ml" ? zoneId : "-"
    };
    const midtrans = await fetch(`${apiBase}/snap/v1/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Basic ${auth}` },
      body: JSON.stringify(payload)
    });
    const result = await midtrans.json();
    if (!midtrans.ok) return res.status(502).json({ error: result.error_messages?.join(", ") || "Midtrans gagal membuat transaksi." });
    return res.status(200).json({ orderId, redirectUrl: result.redirect_url });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan server saat membuat transaksi." });
  }
};