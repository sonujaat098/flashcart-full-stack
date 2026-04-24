import mongoose from "mongoose";

export const orderStatuses = ["confirmed", "packing", "out_for_delivery", "delivered", "cancelled"];

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: orderStatuses,
      required: true
    },
    at: {
      type: Date,
      default: Date.now
    }
  },
  {
    _id: false
  }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    weight: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    unitPrice: {
      type: Number,
      required: true
    },
    lineTotal: {
      type: Number,
      required: true
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    customer: {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      }
    },
    items: {
      type: [orderItemSchema],
      required: true
    },
    summary: {
      subtotal: {
        type: Number,
        required: true
      },
      handlingFee: {
        type: Number,
        required: true
      },
      deliveryFee: {
        type: Number,
        required: true
      },
      savings: {
        type: Number,
        required: true
      },
      total: {
        type: Number,
        required: true
      }
    },
    paymentMethod: {
      type: String,
      default: "Cash on delivery"
    },
    status: {
      type: String,
      enum: orderStatuses,
      default: "confirmed",
      index: true
    },
    etaMinutes: {
      type: Number,
      required: true
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: "confirmed", at: new Date() }]
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
