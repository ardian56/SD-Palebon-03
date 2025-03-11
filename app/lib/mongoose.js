import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("⚠️ Harap tambahkan MONGODB_URI di Vercel Environment Variables!");
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log("🔄 Menggunakan koneksi database yang sudah ada.");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState;
    console.log("✅ MongoDB Connected!");
  } catch (error) {
    console.error("❌ Error koneksi MongoDB:", error);
    process.exit(1);
  }
}
