import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    weight: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    rating: {
      type: Number,
      default: 4.5
    },
    deliveryTime: {
      type: String,
      default: "10 min"
    },
    image: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    id: false,
    timestamps: true,
    versionKey: false
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
