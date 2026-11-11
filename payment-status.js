module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { MIDTRANS_SERVER_KEY, MIDTRANS_IS_PRODUCTION } = process.env;
  const orderId = req.query.order_id;
  if (!MIDTRANS_SERVER_KEY) return res.status(500).json({ error: "Server key belum dikonfigurasi." });
  if (typeof orderId !== "string" || !/^TY-[A-Za-z0-9-]{8,60}$/.test(orderId))
    return res.status(400).json({ error: "Order ID tidak valid." });
  try {
    const base = MIDTRANS_IS_PRODUCTION === "true" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
    const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
    const response = await fetch(`${base}/v2/${encodeURIComponent(orderId)}/status`, {
      headers: { "Accept": "application/json", "Authorization": `Basic ${auth}` }
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data.status_message || "Status order tidak ditemukan." });
    return res.status(200).json({ order_id: data.order_id, transaction_status: data.transaction_status, fraud_status: data.fraud_status });
  } catch {
    return res.status(500).json({ error: "Gagal memeriksa status transaksi." });
  }
};