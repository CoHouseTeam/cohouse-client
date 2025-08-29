export default async function handler(req, res) {
  const raw = req.query.path || [];
  const segs = Array.isArray(raw) ? raw : [raw];
  const joined = segs.join("/"); // "__health", "api/members/login", etc.

  if (joined === "__health") {
    return res.status(200).json({ ok: true, method: req.method, ts: Date.now() });
  }
  return res.status(200).json({ ok: true, path: joined });
}
