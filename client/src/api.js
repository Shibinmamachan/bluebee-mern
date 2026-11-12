const BASE = (
  import.meta.env.VITE_BACKEND_URL ||
  "https://bluebee-mern-2.onrender.com"
).replace(/\/+$/, "");

// Uploaded files come back as "/uploads/..."; point them at the API host when it is on another domain.
export const asset = (u) => (u && u.startsWith("/uploads/") ? BASE + u : u);

export const api = async (url, opts = {}, token) => {
  const isForm = opts.body instanceof FormData;
  const r = await fetch(BASE + url, {
    ...opts,
    headers: { ...(!isForm && { "Content-Type": "application/json" }), ...(token && { Authorization: `Bearer ${token}` }) },
    body: isForm ? opts.body : opts.body && JSON.stringify(opts.body),
  });
  let data = {};
  try { data = await r.json(); } catch { /* empty body */ }
  if (!r.ok) throw Object.assign(new Error(data.error || "Something went wrong"), { status: r.status });
  return data;
};

// Upload with a progress callback (percent), used for photos and large videos.
export const upload = (url, method, form, token, onProgress) => new Promise((resolve, reject) => {
  const x = new XMLHttpRequest();
  x.open(method, BASE + url);
  if (token) x.setRequestHeader("Authorization", `Bearer ${token}`);
  x.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
  x.onload = () => {
    let d = {};
    try { d = JSON.parse(x.responseText); } catch { /* ignore */ }
    x.status < 300 ? resolve(d) : reject(Object.assign(new Error(d.error || "Upload failed"), { status: x.status }));
  };
  x.onerror = () => reject(new Error("Network error. Is the server running?"));
  x.send(form);
});

export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
