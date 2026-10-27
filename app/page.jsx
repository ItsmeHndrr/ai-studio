 "use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STYLES = [
  { id: "ghibli", name: "Ghibli Fantasy", category: "Ilustrasi", emoji: "🌿", desc: "Animasi fantasi, warna lembut", prompt: "Transform the person in the input photo into a whimsical hand-painted Japanese animation fantasy illustration, lush natural scenery, soft watercolor textures, warm cinematic lighting, expressive eyes. Preserve recognizable facial features, hairstyle, pose, and clothing where possible. Original artwork, do not copy any specific film frame." },
  { id: "hijab", name: "Hijab Portrait", category: "Portrait", emoji: "🧕", desc: "Potret elegan dengan hijab", prompt: "Create an elegant high-quality portrait of the same person wearing a beautifully styled modest hijab, tasteful contemporary fashion photography, soft flattering studio lighting, natural skin texture, refined background. Preserve the person's identity and facial features. If the person already wears a hijab, refine the styling while respecting the original." },
  { id: "figure", name: "Action Figure", category: "3D", emoji: "🧸", desc: "Figur koleksi dalam kemasan", prompt: "Turn the person in the photo into a premium collectible action figure toy, realistic molded details, miniature accessories inspired by their outfit, displayed inside a stylish transparent retail box with tasteful graphic packaging, studio product photography, crisp details. Keep recognizable likeness." },
  { id: "3d", name: "3D Cartoon", category: "3D", emoji: "🪄", desc: "Karakter kartun 3D", prompt: "Transform the person into a polished friendly 3D animated character, appealing stylized proportions, detailed hair, expressive eyes, soft global illumination, cinematic render, clean background. Preserve distinctive facial features and outfit." },
  { id: "anime", name: "Anime", category: "Ilustrasi", emoji: "✨", desc: "Karakter anime modern", prompt: "Transform the person into a high-quality original modern anime portrait, detailed linework, expressive eyes, beautiful color design, polished cel shading, dramatic but flattering lighting. Preserve hairstyle, clothing, pose, and recognizable features." },
  { id: "chibi", name: "Chibi", category: "Ilustrasi", emoji: "🍡", desc: "Karakter mini menggemaskan", prompt: "Turn the person into an adorable chibi character with a large head, small body, expressive eyes, clean polished illustration, soft colors, charming details, retain recognizable hairstyle, clothing, and accessories." },
  { id: "realistic", name: "Studio Realistic", category: "Portrait", emoji: "📸", desc: "Potret studio profesional", prompt: "Create a professional photorealistic studio portrait of the same person, realistic skin texture, sharp eyes, balanced exposure, softbox lighting, premium portrait photography, natural color grading, clean elegant background. Avoid over-smoothing and preserve identity." },
  { id: "cinematic", name: "Cinematic", category: "Portrait", emoji: "🎬", desc: "Warna film dramatis", prompt: "Reimagine the same person in a cinematic editorial portrait, dramatic directional lighting, rich filmic color grading, subtle depth of field, detailed realistic textures, tasteful atmosphere, high-end movie still composition. Preserve identity." },
  { id: "cyberpunk", name: "Cyberpunk", category: "Fantasi", emoji: "🌃", desc: "Neon futuristik", prompt: "Transform the scene into a futuristic cyberpunk portrait, neon magenta and cyan reflections, rain-soaked futuristic city ambience, detailed techwear accents, cinematic contrast, high detail, preserve the person's face and recognizable appearance." },
  { id: "clay", name: "Clay Figure", category: "3D", emoji: "🧱", desc: "Figur dari tanah liat", prompt: "Turn the person into a handmade polymer clay figurine, charming sculpted details, subtle fingerprints and matte clay texture, miniature diorama, soft studio lighting, carefully crafted collectible look, preserve hairstyle and outfit." },
  { id: "watercolor", name: "Watercolor", category: "Ilustrasi", emoji: "🎨", desc: "Lukisan cat air", prompt: "Create a beautiful watercolor painting of the person, delicate pigment blooms, visible paper texture, expressive brushwork, harmonious colors, artistic yet recognizable facial features, elegant composition." },
  { id: "pixel", name: "Pixel Art", category: "Ilustrasi", emoji: "👾", desc: "Gaya pixel retro", prompt: "Convert the person into polished retro pixel art, carefully placed pixels, limited harmonious palette, recognizable silhouette, detailed hair and clothing, charming game character portrait, crisp pixel edges." },
  { id: "fashion", name: "Fashion Editorial", category: "Portrait", emoji: "🖤", desc: "Editorial majalah mode", prompt: "Create a luxury fashion editorial portrait of the same person, tasteful designer-inspired styling without logos, professional fashion photography, controlled studio lighting, sophisticated composition, realistic fabric details, preserve identity." },
  { id: "fantasy", name: "Fantasy Hero", category: "Fantasi", emoji: "🗡️", desc: "Pahlawan dunia fantasi", prompt: "Reimagine the person as an original fantasy-adventure hero, ornate but tasteful costume details, atmospheric magical environment, cinematic fantasy lighting, richly detailed illustration, preserve recognizable face and hairstyle." },
  { id: "retro", name: "Retro Film", category: "Portrait", emoji: "📼", desc: "Foto analog vintage", prompt: "Give the portrait a nostalgic 35mm film photography aesthetic, subtle film grain, warm vintage tones, soft halation, natural candid feeling, balanced exposure, preserve the person's identity and realistic appearance." },
  { id: "miniature", name: "Miniature World", category: "3D", emoji: "🏡", desc: "Dunia miniatur", prompt: "Place the person as a finely detailed miniature figure in a whimsical miniature world, tilt-shift photography, handcrafted props, rich tiny textures, soft daylight, playful but realistic composition, preserve recognizable appearance." }
];

const CATEGORIES = ["Semua", "Ilustrasi", "3D", "Portrait", "Fantasi"];

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [styleId, setStyleId] = useState("ghibli");
  const [category, setCategory] = useState("Semua");
  const [prompt, setPrompt] = useState("");
  const [ratio, setRatio] = useState("match_input_image");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const fileRef = useRef(null);

  const selectedStyle = STYLES.find((s) => s.id === styleId) || STYLES[0];
  const filteredStyles = useMemo(
    () => STYLES.filter((s) => category === "Semua" || s.category === category),
    [category]
  );

  useEffect(() => {
    return () => {
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(nextFile) {
    setError("");
    setResult("");
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Pilih file gambar dengan format JPG, PNG, atau WebP.");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setError("Ukuran foto maksimal 10 MB. Kompres foto lalu coba lagi.");
      return;
    }
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }

  async function generate() {
    if (!file) {
      setError("Upload foto terlebih dahulu.");
      return;
    }
    setBusy(true);
    setError("");
    setResult("");
    setStatus("Menyiapkan foto...");
    try {
      const data = new FormData();
      data.append("image", file);
      data.append("styleId", styleId);
      data.append("extraPrompt", prompt);
      data.append("aspectRatio", ratio);
      setStatus("AI sedang mengolah foto. Proses dapat memerlukan waktu...");
      const response = await fetch("/api/generate", { method: "POST", body: data });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Gagal membuat gambar. Coba lagi.");
      if (!payload.imageUrl) throw new Error("API tidak mengembalikan gambar. Periksa konfigurasi model.");
      setResult(payload.imageUrl);
      setStatus("Selesai! Gambar AI kamu sudah siap.");
    } catch (e) {
      setError(e.message || "Terjadi kesalahan. Silakan coba lagi.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  }

  function downloadResult() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.download = `ai-style-${styleId}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#" aria-label="AI Style Studio beranda">
          <span className="brand-mark">✦</span><span>AI Style <b>Studio</b></span>
        </a>
        <nav className={mobileMenu ? "nav open" : "nav"}>
          <a href="#styles" onClick={() => setMobileMenu(false)}>Jelajahi Style</a>
          <a href="#studio" onClick={() => setMobileMenu(false)}>Studio</a>
          <a href="#help" onClick={() => setMobileMenu(false)}>Panduan</a>
        </nav>
        <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Buka menu">☰</button>
        <a className="top-cta" href="#studio">Mulai berkreasi <span>↗</span></a>
      </header>

      <section className="hero">
        <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
        <div className="eyebrow"><span className="live-dot" /> AI IMAGE TRANSFORMATION STUDIO</div>
        <h1>Foto kamu, <span>versi tak terbatas.</span></h1>
        <p className="hero-copy">Ubah foto biasa menjadi karya AI yang luar biasa. Pilih style favorit, unggah foto, dan biarkan kreativitas mengambil alih.</p>
        <div className="hero-actions">
          <a className="primary-button" href="#studio">Mulai ubah foto <span>→</span></a>
          <a className="secondary-button" href="#styles">Lihat semua style</a>
        </div>
        <div className="hero-meta"><span>✦ 16+ pilihan style</span><span>◈ Upload JPG, PNG, WebP</span><span>↗ Ramah mobile</span></div>
        <div className="style-orbit" aria-label="Contoh gaya">
          <div className="orbit-card orbit-a"><div className="orbit-art art-1">夢</div><span>Anime</span></div>
          <div className="orbit-card orbit-b"><div className="orbit-art art-2">3D</div><span>3D Figure</span></div>
          <div className="orbit-card orbit-c"><div className="orbit-art art-3">✿</div><span>Fantasy</span></div>
          <div className="orbit-card orbit-d"><div className="orbit-art art-4">AI</div><span>Portrait</span></div>
          <div className="orbit-center"><span>✦</span><small>YOUR PHOTO</small></div>
        </div>
      </section>

      <section className="studio-section" id="studio">
        <div className="section-heading">
          <div><div className="eyebrow">YOUR CREATIVE WORKSPACE</div><h2>Studio <span>AI kamu</span></h2></div>
          <p>Ikuti tiga langkah sederhana untuk membuat karya pertamamu.</p>
        </div>
        <div className="studio-grid">
          <div className="workspace-card">
            <div className="step-heading"><span className="step-number">01</span><div><h3>Upload foto</h3><p>Pilih foto yang ingin diubah</p></div></div>
            <button className={`upload-zone ${preview ? "has-image" : ""}`} onClick={() => fileRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}>
              {preview ? <img src={preview} alt="Pratinjau foto yang diunggah" /> : <span className="upload-content"><span className="upload-icon">↑</span><strong>Ketuk untuk upload foto</strong><small>atau tarik dan letakkan file di sini</small><em>JPG · PNG · WEBP • Maks. 10 MB</em></span>}
              {preview && <span className="replace-label">Ganti foto ↗</span>}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
            {file && <div className="file-info"><span>▧ {file.name}</span><button onClick={() => { setFile(null); setPreview(""); setResult(""); }} aria-label="Hapus foto">Hapus</button></div>}
            <div className="tip-box"><span>✧</span><p>Gunakan foto yang jelas dengan wajah terlihat agar hasil transformasi lebih konsisten.</p></div>
          </div>

          <div className="workspace-card style-picker-card">
            <div className="step-heading"><span className="step-number">02</span><div><h3>Pilih style</h3><p>Tentukan karakter hasil AI kamu</p></div></div>
            <div className="category-tabs" role="group" aria-label="Filter kategori">
              {CATEGORIES.map((c) => <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>)}
            </div>
            <div className="style-grid">
              {filteredStyles.map((style) => <button key={style.id} className={`style-option ${styleId === style.id ? "selected" : ""}`} onClick={() => setStyleId(style.id)}>
                <span className={`style-icon style-${style.id}`}>{style.emoji}</span><span className="style-label">{style.name}</span><span className="style-desc">{style.desc}</span>{styleId === style.id && <span className="selected-check">✓</span>}
              </button>)}
            </div>
            <div className="selected-style-note"><span>{selectedStyle.emoji}</span><div><strong>{selectedStyle.name}</strong><small>{selectedStyle.desc}</small></div><span className="selected-pill">Dipilih</span></div>
          </div>

          <div className="workspace-card settings-card">
            <div className="step-heading"><span className="step-number">03</span><div><h3>Atur hasil</h3><p>Sesuaikan hasil dengan keinginanmu</p></div></div>
            <label className="field-label" htmlFor="ratio">Rasio gambar</label>
            <select id="ratio" value={ratio} onChange={(e) => setRatio(e.target.value)}>
              <option value="match_input_image">Ikuti foto asli</option>
              <option value="1:1">Persegi (1:1)</option>
              <option value="3:4">Portrait (3:4)</option>
              <option value="3:2">Landscape (3:2)</option>
              <option value="9:16">Story / Wallpaper (9:16)</option>
            </select>
            <label className="field-label" htmlFor="extra-prompt">Instruksi tambahan <span className="optional">Opsional</span></label>
            <textarea id="extra-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={500} placeholder="Contoh: latar belakang taman bunga, pencahayaan sore yang hangat..." />
            <div className="char-count">{prompt.length}/500 karakter</div>
            <div className="privacy-note"><span>🔒</span><p>Foto diproses melalui layanan AI pihak ketiga. Jangan unggah foto sensitif atau foto orang lain tanpa izin.</p></div>
            <button className="generate-button" onClick={generate} disabled={busy}>{busy ? <><span className="spinner" /> Sedang memproses...</> : <>✦ Generate dengan AI <span>→</span></>}</button>
            <p className="generation-note">Waktu proses dan biaya mengikuti model AI yang digunakan.</p>
          </div>
        </div>
        {(error || status) && <div className={error ? "notice error-notice" : "notice"} role="status">{error ? `⚠ ${error}` : <><span className={busy ? "spinner" : ""}></span>{status}</>}</div>}
      </section>

      <section className="result-section" aria-live="polite">
        <div className="section-heading"><div><div className="eyebrow">YOUR CREATION</div><h2>Hasil <span>kreasimu</span></h2></div><p>Hasil gambar akan muncul di sini setelah proses AI selesai.</p></div>
        <div className={`result-panel ${result ? "result-ready" : ""}`}>
          {result ? <><div className="result-image-wrap"><img src={result} alt={`Hasil AI style ${selectedStyle.name}`} /></div><div className="result-details"><div><span className="result-tag">✦ AI GENERATED</span><h3>{selectedStyle.name}</h3><p>Gambar kamu berhasil dibuat. Kamu bisa mengunduh atau membuat variasi baru.</p></div><div className="result-actions"><button className="primary-button" onClick={downloadResult}>Unduh gambar ↓</button><button className="secondary-button" onClick={generate} disabled={busy}>Buat ulang ↻</button></div></div></> : <div className="empty-result"><div className="result-sparkle">✦</div><h3>Karyamu akan tampil di sini</h3><p>Upload foto, pilih style, lalu tekan Generate dengan AI.</p><div className="empty-decoration"><span>✧</span><span>◈</span><span>✦</span></div></div>}
        </div>
      </section>

      <section className="styles-section" id="styles">
        <div className="section-heading"><div><div className="eyebrow">FIND YOUR LOOK</div><h2>Jelajahi <span>style AI</span></h2></div><p>Temukan gaya yang paling menggambarkan dirimu.</p></div>
        <div className="showcase-grid">
          {STYLES.slice(0, 8).map((s, i) => <button className="showcase-card" key={s.id} onClick={() => { setStyleId(s.id); document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" }); }}>
            <div className={`showcase-art showcase-${i}`}><span>{s.emoji}</span><small>{String(i + 1).padStart(2, "0")}</small></div><div className="showcase-copy"><div><strong>{s.name}</strong><small>{s.category}</small></div><span>↗</span></div>
          </button>)}
        </div>
      </section>

      <section className="help-section" id="help">
        <div className="help-intro"><div className="eyebrow">QUICK START GUIDE</div><h2>Mulai dalam <span>3 langkah</span></h2><p>Tak perlu keahlian desain. Cukup pilih foto dan gaya yang kamu suka.</p></div>
        <div className="help-steps"><div className="help-step"><span>01</span><div><h3>Upload foto terbaikmu</h3><p>Pilih foto yang jelas, maksimal 10 MB, dengan pencahayaan cukup.</p></div></div><div className="help-step"><span>02</span><div><h3>Pilih style dan atur prompt</h3><p>Gunakan preset style atau tambahkan instruksi untuk mengarahkan hasil.</p></div></div><div className="help-step"><span>03</span><div><h3>Generate dan simpan</h3><p>Tunggu proses selesai, lalu buka atau unduh gambar hasil AI.</p></div></div></div>
      </section>

      <section className="faq-section">
        <div className="eyebrow">FAQ</div><h2>Pertanyaan <span>umum</span></h2>
        <div className="faq-list">
          <details><summary>Apakah website ini gratis?</summary><p>Website dan hosting dapat dimulai dengan paket gratis yang sesuai, tetapi penggunaan Gemini API mengikuti kuota, model, dan ketentuan harga Google. Periksa tarif serta ketersediaan model di Google AI Studio sebelum digunakan publik.</p></details>
          <details><summary>Apakah foto saya disimpan?</summary><p>Website ini tidak memiliki database untuk menyimpan foto. Namun foto dikirim ke penyedia model AI untuk diproses; kebijakan penyimpanan dan penggunaan data juga mengikuti layanan tersebut.</p></details>
          <details><summary>Mengapa generate gagal?</summary><p>Pastikan GEMINI_API_KEY sudah diatur di Vercel, model image generation tersedia untuk akun Google AI Studio, file tidak lebih dari 10 MB, dan kuota API masih tersedia.</p></details>
          <details><summary>Apakah hasil selalu mempertahankan wajah?</summary><p>Hasil image-to-image dapat berubah dan tidak menjamin kemiripan sempurna. Foto sumber yang jelas dan prompt yang tepat dapat membantu.</p></details>
        </div>
      </section>

      <footer><a className="brand" href="#"><span className="brand-mark">✦</span><span>AI Style <b>Studio</b></span></a><p>Eksplorasi kreativitas tanpa batas.</p><span className="footer-copy">© {new Date().getFullYear()} AI Style Studio</span></footer>
    </main>
  );
}
