export default async function handler(req, res) {
  const raw = req.query.path || [];
  const segs = Array.isArray(raw) ? raw : [raw];
  const joined = segs.join("/");
  if (joined === "__health") return res.status(200).json({ ok: true, method: req.method, ts: Date.now(), where: "[...path].js" });
  return res.status(200).json({ ok: true, path: joined });
}
