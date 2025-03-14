import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase.from("news").select("*");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const isi = formData.get("isi");
    const image = formData.get("image");

    let imageUrl = null;

    if (image && image.name) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("news-images")
        .upload(fileName, image, { contentType: image.type });

      if (error) {
        console.error("Storage Upload Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
        });
      }

      imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-images/${fileName}`;
    }

    const { data, error } = await supabase
      .from("news")
      .insert([{ isi, gambar: imageUrl }]);

    if (error) {
      console.error("Database Insert Error:", error.message);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: "Berita berhasil ditambahkan", data }), {
      status: 201,
    });

  } catch (err) {
    console.error("Server Error:", err);
    return new Response(JSON.stringify({ error: "Terjadi kesalahan server" }), {
      status: 500,
    });
  }
}
