require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");
const electionRoutes = require("./routes/electionRoutes");
const votingRoutes = require("./routes/votingRoutes");
const candidateRoutes = require("./routes/candidateRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const voterRegistration = require('./routes/voterRegistration.js');
const profileUpdateRoutes = require('./routes/profileUpdateRoutes.js');
const test = require("./routes/test.js");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require('./routes/notificationRoute.js');
const uploadRoute = require('./routes/uploadRoute');

const app = express();
const server = http.createServer(app);

// ✅ CORS Configuration - Supports both development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'https://e-vote-frontend-flax.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

console.log('Allowed CORS origins:', allowedOrigins);

// ✅ Socket.io with proper CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.io middleware for auth & joining user room
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error: Token required"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;

    // Join user-specific room
    socket.join(decoded.id);

    next();
  } catch (error) {
    console.error("Socket auth error:", error);
    next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}, userId: ${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

app.set('io', io);

// ✅ CORS Middleware with dynamic origin checking
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use("/api/candidate", candidateRoutes);
app.use("/api/voting", votingRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/voter', voterRegistration);
app.use('/api/admin', adminRoutes);
app.use("/api/election", electionRoutes);
app.use('/api/user', profileUpdateRoutes);
app.use('/api/test', test);
app.use('/api', uploadRoute);
app.use("/api/activity", activityRoutes);
app.use("/api/notification", notificationRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Blockchain Voting Backend is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});