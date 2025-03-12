import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  await connectDB();

  try {
    const users = await User.find();
    return Response.json(users);
  } catch (error) {
    return Response.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}
