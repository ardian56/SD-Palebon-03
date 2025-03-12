import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  const { data, error } = await supabase.from("news").select("*");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 200 });
}

export async function POST(req) {
  const formData = await req.formData();
  const text = formData.get("text");
  const isi = formData.get("isi");
  const image = formData.get("image");

  let imageUrl = null;
  if (image) {
    const fileExt = image.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("news-images")
      .upload(fileName, image, { contentType: image.type });

    if (error) return Response.json({ error: error.message }, { status: 500 });

    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news-images/${fileName}`;
  }

  const { data, error } = await supabase
    .from("news")
    .insert([{ text, isi, gambar: imageUrl }]);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data[0], { status: 201 });
}
