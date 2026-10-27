import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const STYLE_PROMPTS = {
  ghibli: "Transform the provided photo into a whimsical hand-painted Japanese animation fantasy illustration, lush natural scenery, soft watercolor textures, warm cinematic lighting, expressive eyes. Preserve recognizable facial features, hairstyle, pose, and clothing where possible. Create original artwork rather than copying any specific film frame.",
  hijab: "Create an elegant portrait of the same person with beautifully styled modest hijab fashion, contemporary styling, soft flattering studio light, natural skin texture and refined background. Preserve the person's identity and facial features. If the person already wears hijab, refine the styling respectfully.",
  figure: "Turn the person into a premium collectible action figure toy with realistic molded details and miniature accessories inspired by their outfit, displayed inside a stylish transparent retail box, studio product photography. Keep a recognizable likeness.",
  "3d": "Transform the person into a polished friendly 3D animated character, appealing stylized proportions, detailed hair, expressive eyes, soft global illumination and cinematic rendering. Preserve distinctive facial features and outfit.",
  anime: "Transform the person into a high-quality original modern anime portrait, detailed linework, expressive eyes, beautiful color design, polished cel shading and flattering lighting. Preserve hairstyle, clothing, pose and recognizable features.",
  chibi: "Turn the person into an adorable chibi character with a large head, small body, expressive eyes, clean polished illustration and soft colors. Retain recognizable hairstyle, clothing and accessories.",
  realistic: "Create a professional photorealistic studio portrait of the same person, realistic skin texture, sharp eyes, balanced exposure, softbox lighting, premium portrait photography and natural color grading. Avoid over-smoothing and preserve identity.",
  cinematic: "Reimagine the same person in a cinematic editorial portrait, dramatic directional lighting, rich film color grading, subtle depth of field, detailed realistic textures and high-end movie still composition. Preserve identity.",
  cyberpunk: "Transform the scene into a futuristic cyberpunk portrait, neon magenta and cyan reflections, rain-soaked futuristic city ambience, tasteful techwear accents, cinematic contrast and high detail. Preserve the person's recognizable appearance.",
  clay: "Turn the person into a handmade polymer clay figurine, charming sculpted details, matte clay texture, miniature diorama, soft studio lighting and carefully crafted collectible look. Preserve hairstyle and outfit.",
  watercolor: "Create a beautiful watercolor painting of the person, delicate pigment blooms, visible paper texture, expressive brushwork, harmonious colors and recognizable facial features.",
  pixel: "Convert the person into polished retro pixel art, carefully placed pixels, limited harmonious palette, recognizable silhouette, detailed hair and clothing and crisp pixel edges.",
  fashion: "Create a luxury fashion editorial portrait of the same person, tasteful designer-inspired styling without logos, professional fashion photography, controlled studio lighting, sophisticated composition and realistic fabric details. Preserve identity.",
  fantasy: "Reimagine the person as an original fantasy-adventure hero, ornate tasteful costume details, atmospheric magical environment, cinematic fantasy lighting and richly detailed illustration. Preserve recognizable face and hairstyle.",
  retro: "Give the portrait a nostalgic 35mm film photography aesthetic, subtle film grain, warm vintage tones, soft halation and natural candid feeling. Preserve the person's identity and realistic appearance.",
  miniature: "Place the person as a finely detailed miniature figure in a whimsical miniature world, tilt-shift photography, handcrafted props, rich tiny textures and soft daylight. Preserve recognizable appearance."
};

const ALLOWED_RATIOS = new Set(["1:1", "3:4", "3:2", "9:16"]);

function findImageData(payload) {
  if (payload?.output_image?.data) {
    return { data: payload.output_image.data, mimeType: payload.output_image.mime_type || "image/png" };
  }
  for (const step of payload?.steps || []) {
    if (step?.type !== "model_output") continue;
    for (const block of step?.content || []) {
      if (block?.type === "image" && block?.data) {
        return { data: block.data, mimeType: block.mime_type || "image/png" };
      }
    }
  }
  return null;
}

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Backend belum dikonfigurasi. Tambahkan GEMINI_API_KEY di Environment Variables Vercel." }, { status: 500 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Data upload tidak valid." }, { status: 400 });
  }

  const image = form.get("image");
  const styleId = String(form.get("styleId") || "ghibli");
  const extraPrompt = String(form.get("extraPrompt") || "").trim().slice(0, 500);
  const ratio = String(form.get("aspectRatio") || "match_input_image");

  if (!(image instanceof File)) return NextResponse.json({ error: "Silakan upload file gambar." }, { status: 400 });
  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) return NextResponse.json({ error: "Format yang didukung: JPG, PNG, atau WebP." }, { status: 400 });
  if (image.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Ukuran foto maksimal 10 MB." }, { status: 413 });
  if (!STYLE_PROMPTS[styleId]) return NextResponse.json({ error: "Style yang dipilih tidak tersedia." }, { status: 400 });

  const prompt = `${STYLE_PROMPTS[styleId]}${extraPrompt ? ` Additional instructions from the user: ${extraPrompt}` : ""} Create one polished image. Avoid watermarks, logos, extra fingers, distorted facial features, or duplicate people. Preserve the main subject's identity as much as possible.`;
  const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");
  const input = [
    { type: "text", text: prompt },
    { type: "image", mime_type: image.type, data: base64 }
  ];
  const body = { model: process.env.GEMINI_IMAGE_MODEL || "gemini-nano-banana-2.1", input };
  if (ALLOWED_RATIOS.has(ratio)) {
    body.response_format = { type: "image", mime_type: "image/png", aspect_ratio: ratio };
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000)
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const apiMessage = payload?.error?.message || payload?.message || "Permintaan ke Gemini API gagal.";
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({ error: `API key Gemini ditolak atau model tidak diizinkan: ${apiMessage}` }, { status: 502 });
      }
      if (response.status === 429) {
        return NextResponse.json({ error: `Batas penggunaan Gemini tercapai. Periksa kuota dan billing Google AI Studio. Detail: ${apiMessage}` }, { status: 429 });
      }
      return NextResponse.json({ error: `Gemini API (${response.status}): ${apiMessage}` }, { status: 502 });
    }

    const generated = findImageData(payload);
    if (!generated) {
      return NextResponse.json({ error: "Gemini tidak mengembalikan gambar. Pastikan API key memiliki akses ke model image generation dan periksa log API." }, { status: 502 });
    }
    return NextResponse.json({ imageUrl: `data:${generated.mimeType};base64,${generated.data}`, styleId });
  } catch (error) {
    const message = error?.name === "TimeoutError" || error?.name === "AbortError"
      ? "Proses Gemini melewati batas waktu fungsi. Coba foto yang lebih kecil atau gunakan alur asinkron."
      : (error?.message || "Tidak dapat menghubungi Gemini API.");
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
