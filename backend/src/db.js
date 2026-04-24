import mongoose from "mongoose";
import { categories, products } from "./data.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";

export function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

export async function seedCatalog() {
  await Category.bulkWrite(
    categories.map((category) => ({
      updateOne: {
        filter: { id: category.id },
        update: { $set: category },
        upsert: true
      }
    }))
  );

  await Product.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { id: product.id },
        update: { $set: product },
        upsert: true
      }
    }))
  );
}

export async function connectDatabase() {
  console.log("ENV MONGO:", process.env.MONGODB_URI); // 👈 debug line

  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI is NOT set. Falling back to localhost (this will fail on Render).");
  }

  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/flashcart";

  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(mongoUri);

    console.log("✅ MongoDB connected");

    await seedCatalog();
    console.log("✅ Catalog seeded");

    return true;

  } catch (err) {
    console.error("❌ MongoDB CONNECTION ERROR:");
    console.error(err.message);
    return false;
  }
}
