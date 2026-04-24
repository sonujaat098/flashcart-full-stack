import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { categories, products } from "./data.js";
import { connectDatabase, isDatabaseReady } from "./db.js";
import { authenticate, createToken, publicUser } from "./middleware/auth.js";
import Category from "./models/Category.js";
import Order from "./models/Order.js";
import Product from "./models/Product.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;
const frontendUrls = (process.env.FRONTEND_URL || "http://localhost:5173,http://localhost:5174")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const orderFlow = [
  { status: "confirmed", label: "Order confirmed", offsetMinutes: 0 },
  { status: "packing", label: "Packing your items", offsetMinutes: 2 },
  { status: "out_for_delivery", label: "Out for delivery", offsetMinutes: 5 },
  { status: "delivered", label: "Delivered", offsetMinutes: null }
];

const statusRank = orderFlow.reduce((ranks, step, index) => {
  ranks[step.status] = index;
  return ranks;
}, {});

let databaseError = null;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(morgan("tiny"));

const asyncHandler = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

const rupee = (value) => Number(value.toFixed(2));

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function requireDatabase(response) {
  if (isDatabaseReady()) {
    return true;
  }

  response.status(503).json({
    message: "MongoDB is not connected. Set MONGODB_URI in backend/.env or start local MongoDB, then restart the backend."
  });
  return false;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function findProduct(productId) {
  if (isDatabaseReady()) {
    return Product.findOne({ id: productId }).select("-_id -createdAt -updatedAt").lean();
  }

  return products.find((product) => product.id === productId);
}

async function resolveProductsByIds(productIds) {
  if (isDatabaseReady()) {
    const catalogItems = await Product.find({ id: { $in: productIds } })
      .select("-_id -createdAt -updatedAt")
      .lean();
    return new Map(catalogItems.map((product) => [product.id, product]));
  }

  return new Map(products.filter((product) => productIds.includes(product.id)).map((product) => [product.id, product]));
}

async function calculateOrder(items) {
  const productIds = items.map((item) => item.productId);
  const productsById = await resolveProductsByIds(productIds);

  const resolvedItems = items.map((item) => {
    const product = productsById.get(item.productId);
    if (!product) {
      const error = new Error(`Unknown product: ${item.productId}`);
      error.status = 400;
      throw error;
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      const error = new Error(`Invalid quantity for ${product.name}`);
      error.status = 400;
      throw error;
    }

    return {
      productId: product.id,
      name: product.name,
      weight: product.weight,
      image: product.image,
      quantity,
      unitPrice: product.price,
      lineTotal: rupee(product.price * quantity)
    };
  });

  const subtotal = rupee(resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0));
  const handlingFee = subtotal > 0 ? 6 : 0;
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const savings = rupee(
    resolvedItems.reduce((sum, item) => {
      const product = productsById.get(item.productId);
      return sum + (product.mrp - product.price) * item.quantity;
    }, 0)
  );
  const total = rupee(subtotal + handlingFee + deliveryFee);

  return {
    items: resolvedItems,
    summary: {
      subtotal,
      handlingFee,
      deliveryFee,
      savings,
      total
    }
  };
}

function generateOrderId() {
  const timePart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(10 + Math.random() * 90);
  return `FC-${timePart}${randomPart}`;
}

function deriveOrderStatus(order) {
  if (order.status === "cancelled") {
    return "cancelled";
  }

  const ageMinutes = (Date.now() - new Date(order.createdAt).getTime()) / 60000;

  if (ageMinutes >= order.etaMinutes) {
    return "delivered";
  }

  if (ageMinutes >= 5) {
    return "out_for_delivery";
  }

  if (ageMinutes >= 2) {
    return "packing";
  }

  return "confirmed";
}

async function refreshOrderStatus(order) {
  const nextStatus = deriveOrderStatus(order);

  if (nextStatus === order.status) {
    return order;
  }

  const currentRank = statusRank[order.status] ?? -1;
  const nextRank = statusRank[nextStatus] ?? currentRank;

  order.status = nextStatus;

  orderFlow.forEach((step, index) => {
    const alreadyRecorded = order.statusHistory.some((entry) => entry.status === step.status);
    if (index > currentRank && index <= nextRank && !alreadyRecorded) {
      order.statusHistory.push({
        status: step.status,
        at: new Date()
      });
    }
  });

  await order.save();
  return order;
}

function statusLabel(status) {
  if (status === "cancelled") {
    return "Cancelled";
  }

  return orderFlow.find((step) => step.status === status)?.label || "Order status";
}

function buildStatusSteps(order) {
  if (order.status === "cancelled") {
    return [
      ...orderFlow.map((step) => ({
        ...step,
        complete: false,
        at: order.statusHistory.find((entry) => entry.status === step.status)?.at || null
      })),
      {
        status: "cancelled",
        label: "Cancelled",
        complete: true,
        at: order.statusHistory.find((entry) => entry.status === "cancelled")?.at || order.updatedAt
      }
    ];
  }

  const currentRank = statusRank[order.status] ?? 0;
  const createdAt = new Date(order.createdAt).getTime();

  return orderFlow.map((step, index) => {
    const recorded = order.statusHistory.find((entry) => entry.status === step.status);
    const estimatedOffset = step.status === "delivered" ? order.etaMinutes : step.offsetMinutes;
    const estimatedAt =
      typeof estimatedOffset === "number" ? new Date(createdAt + estimatedOffset * 60000).toISOString() : null;

    return {
      status: step.status,
      label: step.label,
      complete: index <= currentRank,
      at: recorded?.at || (index <= currentRank ? estimatedAt : null),
      estimatedAt
    };
  });
}

function serializeOrder(orderDocument) {
  const order = typeof orderDocument.toObject === "function" ? orderDocument.toObject() : orderDocument;

  return {
    id: order.orderId,
    orderId: order.orderId,
    customer: order.customer,
    items: order.items,
    summary: order.summary,
    paymentMethod: order.paymentMethod,
    status: order.status,
    statusLabel: statusLabel(order.status),
    eta: order.status === "delivered" ? "Delivered" : `${order.etaMinutes} min`,
    etaMinutes: order.etaMinutes,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    statusHistory: order.statusHistory,
    statusSteps: buildStatusSteps(order)
  };
}

app.get("/", (request, response) => {
  response.json({
    name: "FlashCart API",
    status: "online",
    database: isDatabaseReady() ? "connected" : "not connected",
    endpoints: [
      "/api/health",
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/me",
      "/api/categories",
      "/api/products",
      "/api/orders"
    ]
  });
});

app.get("/api/health", (request, response) => {
  response.json({
    ok: true,
    database: {
      connected: isDatabaseReady(),
      error: databaseError?.message || null
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.post(
  "/api/auth/register",
  asyncHandler(async (request, response) => {
    if (!requireDatabase(response)) {
      return;
    }

    const { name, email, phone, password } = request.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !phone?.trim() || !password) {
      response.status(400).json({
        message: "Name, email, phone and password are required"
      });
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      response.status(400).json({
        message: "Enter a valid email address"
      });
      return;
    }

    if (password.length < 6) {
      response.status(400).json({
        message: "Password must be at least 6 characters"
      });
      return;
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      response.status(409).json({
        message: "An account already exists with this email"
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      passwordHash
    });

    response.status(201).json({
      token: createToken(user),
      user: publicUser(user)
    });
  })
);

app.post(
  "/api/auth/login",
  asyncHandler(async (request, response) => {
    if (!requireDatabase(response)) {
      return;
    }

    const { email, password } = request.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      response.status(400).json({
        message: "Email and password are required"
      });
      return;
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !passwordMatches) {
      response.status(401).json({
        message: "Invalid email or password"
      });
      return;
    }

    response.json({
      token: createToken(user),
      user: publicUser(user)
    });
  })
);

app.get("/api/auth/me", authenticate, (request, response) => {
  response.json({
    user: publicUser(request.user)
  });
});

app.get(
  "/api/categories",
  asyncHandler(async (request, response) => {
    const catalogCategories = isDatabaseReady()
      ? await Category.find({}).select("-_id -createdAt -updatedAt").lean()
      : categories;
    const catalogProducts = isDatabaseReady()
      ? await Product.find({}).select("category -_id").lean()
      : products;

    const categoryCounts = catalogProducts.reduce((counts, product) => {
      counts[product.category] = (counts[product.category] || 0) + 1;
      return counts;
    }, {});

    response.json(
      catalogCategories.map((category) => ({
        ...category,
        productCount: categoryCounts[category.id] || 0
      }))
    );
  })
);

app.get(
  "/api/products",
  asyncHandler(async (request, response) => {
    const { category, q, tag, sort } = request.query;
    const query = q?.trim().toLowerCase();

    if (isDatabaseReady()) {
      const filter = {};

      if (category && category !== "all") {
        filter.category = category;
      }

      if (tag) {
        filter.tags = tag;
      }

      if (query) {
        const regex = new RegExp(escapeRegex(query), "i");
        filter.$or = [{ name: regex }, { weight: regex }, { tags: regex }, { category: regex }];
      }

      const sortOptions = {};
      if (sort === "price-asc") {
        sortOptions.price = 1;
      }

      if (sort === "rating-desc") {
        sortOptions.rating = -1;
      }

      const result = await Product.find(filter).select("-_id -createdAt -updatedAt").sort(sortOptions).lean();
      response.json(result);
      return;
    }

    let result = [...products];

    if (category && category !== "all") {
      result = result.filter((product) => product.category === category);
    }

    if (tag) {
      result = result.filter((product) => product.tags.includes(tag));
    }

    if (query) {
      result = result.filter((product) => {
        const categoryName = categories.find((item) => item.id === product.category)?.name || "";
        return [product.name, product.weight, categoryName, ...product.tags]
          .join(" ")
          .toLowerCase()
          .includes(query);
      });
    }

    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "rating-desc") {
      result.sort((a, b) => b.rating - a.rating);
    }

    response.json(result);
  })
);

app.get(
  "/api/products/:productId",
  asyncHandler(async (request, response, next) => {
    const product = await findProduct(request.params.productId);

    if (!product) {
      const error = new Error("Product not found");
      error.status = 404;
      next(error);
      return;
    }

    response.json(product);
  })
);

app.post(
  "/api/orders",
  authenticate,
  asyncHandler(async (request, response) => {
    const { customer, items, paymentMethod = "Cash on delivery" } = request.body;

    if (!Array.isArray(items) || items.length === 0) {
      response.status(400).json({
        message: "Order requires at least one item"
      });
      return;
    }

    if (!customer?.name || !customer?.phone || !customer?.address) {
      response.status(400).json({
        message: "Customer name, phone and address are required"
      });
      return;
    }

    const orderTotals = await calculateOrder(items);
    const etaMinutes = Math.max(8, Math.min(18, 7 + orderTotals.items.length * 2));
    const order = await Order.create({
      orderId: generateOrderId(),
      user: request.user._id,
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim()
      },
      paymentMethod,
      status: "confirmed",
      etaMinutes,
      statusHistory: [{ status: "confirmed", at: new Date() }],
      ...orderTotals
    });

    response.status(201).json(serializeOrder(order));
  })
);

app.get(
  "/api/orders",
  authenticate,
  asyncHandler(async (request, response) => {
    const orders = await Order.find({ user: request.user._id }).sort({ createdAt: -1 }).limit(25);
    const updatedOrders = await Promise.all(orders.map((order) => refreshOrderStatus(order)));

    response.json(updatedOrders.map(serializeOrder));
  })
);

app.get(
  "/api/orders/:orderId",
  authenticate,
  asyncHandler(async (request, response) => {
    const order = await Order.findOne({
      user: request.user._id,
      orderId: request.params.orderId
    });

    if (!order) {
      response.status(404).json({
        message: "Order not found"
      });
      return;
    }

    const updatedOrder = await refreshOrderStatus(order);
    response.json(serializeOrder(updatedOrder));
  })
);

app.patch(
  "/api/orders/:orderId/cancel",
  authenticate,
  asyncHandler(async (request, response) => {
    const order = await Order.findOne({
      user: request.user._id,
      orderId: request.params.orderId
    });

    if (!order) {
      response.status(404).json({
        message: "Order not found"
      });
      return;
    }

    if (["out_for_delivery", "delivered", "cancelled"].includes(order.status)) {
      response.status(400).json({
        message: "This order can no longer be cancelled"
      });
      return;
    }

    order.status = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      at: new Date()
    });
    await order.save();

    response.json(serializeOrder(order));
  })
);

app.use((request, response) => {
  response.status(404).json({
    message: "Route not found"
  });
});

app.use((error, request, response, next) => {
  if (error.message === "Origin is not allowed by CORS") {
    response.status(403).json({
      message: error.message
    });
    return;
  }

  response.status(error.status || 500).json({
    message: error.message || "Something went wrong"
  });
});

try {
  await connectDatabase();
} catch (error) {
  databaseError = error;
  console.error(`MongoDB connection failed: ${error.message}`);
}

app.listen(port, () => {
  console.log(`FlashCart API running on http://localhost:${port}`);
});
