import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    shortName: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    accent: {
      type: String,
      required: true
    }
  },
  {
    id: false,
    timestamps: true,
    versionKey: false
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
