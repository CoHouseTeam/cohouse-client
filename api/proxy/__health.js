export default function handler(req, res) {
  res.status(200).json({ ok: true, method: req.method, ts: Date.now(), where: "/api/proxy/__health (direct)" });
}
