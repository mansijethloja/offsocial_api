require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/database");
const passport = require("passport");
const { configurePassport } = require("./config/passport");

const pageSpeedRoutes = require("./routes/pagespeed.route");
const contentRoutes = require("./routes/content.route");
const businessDNARoutes = require("./routes/business-dna.route");
const authRoutes = require("./routes/auth.route");

const app = express();
const PORT = process.env.PORT || 8000;

/**
 * Connect to MongoDB
 */
connectDB()
  .then(() => {
    console.log("MongoDB connection established successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

/**
 * Rate limiting middleware
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Rate Limit Exceeded",
    message: "Too many requests from this IP, please try again later.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

/**
 * CORS middleware
 */
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/**
 * Compression middleware
 */
app.use(compression());

/**
 * Body parsing middleware
 */
app.use(bodyParser.json());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Request logging middleware
 */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - ${ip}`);

  // Log request body for POST requests (excluding sensitive data)
  if (method === "POST" && req.body) {
    const logBody = { ...req.body };
    // Remove sensitive information from logs
    if (logBody.apiKey) logBody.apiKey = "[REDACTED]";
    console.log(
      `[${timestamp}] Request body:`,
      JSON.stringify(logBody, null, 2)
    );
  }

  next();
});

/**
 * Initialize Passport
 */
configurePassport();
app.use(passport.initialize());

/**
 * Apply rate limiting
 */
app.use("/api/", limiter);

app.use("/api/pagespeed", pageSpeedRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/business-dna", businessDNARoutes);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
