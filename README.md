# 🗳️ E-Vote Backend - Blockchain-Based Voting System

A secure, decentralized voting platform built with **Node.js**, **Express**, **MongoDB**, and **Ethereum Smart Contracts** (Solidity). This backend provides real-time voting capabilities powered by blockchain technology with REST APIs and WebSocket support.

> **Developed as a final year CSE project** - A production-ready decentralized voting application with complete authentication, election management, and on-chain voting.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [Blockchain Integration](#blockchain-integration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [WebSocket Events](#websocket-events)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

E-Vote Backend is a comprehensive voting platform that combines traditional backend infrastructure with blockchain technology to ensure:

- ✅ **Transparent & Tamper-Proof**: All votes recorded on Ethereum blockchain
- ✅ **Decentralized**: No single point of failure
- ✅ **Secure**: JWT authentication + cryptographic signing
- ✅ **Real-Time**: WebSocket integration for live notifications
- ✅ **Scalable**: MongoDB for efficient data management

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    E-Vote Backend Flow                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. USER REGISTRATION                                       │
│     └─> Generate Wallet Address (Web3)                      │
│     └─> Store user in MongoDB                               │
│     └─> Send OTP via Email                                  │
│                                                             │
│  2. ELECTION CREATION (Admin Only)                           │
│     └─> Create election in MongoDB                          │
│     └─> Deploy/Register on Smart Contract                   │
│     └─> Add candidates via blockchain                       │
│                                                             │
│  3. VOTING PROCESS                                          │
│     └─> Verify voter registration on-chain                  │
│     └─> Sign transaction with Relayer account               │
│     └─> Record vote on Ethereum blockchain                  │
│     └─> Update local database (voting history)              │
│     └─> Emit real-time notification via WebSocket           │
│                                                             │
│  4. RESULTS                                                 │
│     └─> Fetch vote counts from blockchain                   │
│     └─> Calculate results in real-time                      │
│     └─> Display verified, immutable results                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- **OTP-based Registration**: Secure email verification
- **JWT Authentication**: Token-based API access
- **Role-based Access Control**: Admin vs Voter roles
- **Password Reset**: Secure token-based password recovery
- **Session Management**: Automatic token refresh

### 🗳️ Election Management
- **Create Elections**: Admins can create and manage elections
- **Candidate Management**: Add candidates with blockchain verification
- **Election States**: Upcoming, Active, Completed
- **Voter Registration**: Manage eligible voters
- **Result Calculation**: Real-time vote counting

### 🔗 Blockchain Integration
- **Smart Contracts**: Solidity contracts for voting logic
- **Relayer Model**: Backend relayer signs transactions on behalf of voters
- **Gas Optimization**: Efficient transaction handling
- **Ethereum/Polygon**: Multi-chain support
- **Transaction History**: Immutable voting records

### 📲 Real-Time Features
- **WebSocket Events**: Live vote notifications
- **Activity Tracking**: User activities and voting history
- **Notification System**: Real-time updates to clients
- **Socket.io Integration**: Authenticated WebSocket connections

### 📁 Media Management
- **Cloudinary Integration**: Image/file uploads
- **Profile Pictures**: User profile photo management
- **Election Banners**: Election imagery support

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | JWT, bcryptjs |
| **Blockchain** | Web3.js, Hardhat, Solidity |
| **Real-Time** | Socket.io |
| **Email** | Nodemailer |
| **File Upload** | Multer, Cloudinary |
| **Environment** | dotenv |

---

## 📁 Project Structure

```
E-Vote-Backend/
│
├── 📂 config/                    # Configuration files
│   └── database.js              # MongoDB connection setup
│
├── 📂 contracts/                 # Solidity Smart Contracts
│   ├── Voting.sol               # Main voting contract
│   ├── VoterRegistration.sol    # Voter registration contract
│   ├── CandidateRegistration.sol # Candidate registration contract
│   └── Election.sol             # Election management contract
│
├── 📂 controllers/               # Business logic (Controllers)
│   ├── authController.js        # Authentication logic
│   ├── votingController.js      # Voting logic
│   ├── electionController.js    # Election management
│   ├── candidateController.js   # Candidate management
│   ├── adminController.js       # Admin operations
│   ├── voterRegistrationController.js  # Voter registration
│   ├── profileUpdateController.js      # Profile updates
│   ├── uploadController.js      # File uploads
│   ├── activityController.js    # Activity tracking
│   └── notificationController.js # Notifications
│
├── 📂 middleware/                # Express Middleware
│   ├── auth.js                  # JWT verification & authorization
│   └── (other custom middleware)
│
├── 📂 models/                    # MongoDB Schemas
│   ├── User.js                  # User model with wallet address
│   ├── Election.js              # Election model
│   ├── OTP.js                   # OTP for verification
│   ├── Activity.js              # User activity logs
│   ├── Notifications.js         # Notification records
│   └── (other models)
│
├── 📂 routes/                    # API Routes
│   ├── auth.js                  # Authentication endpoints
│   ├── votingRoutes.js          # Voting endpoints
│   ├── electionRoutes.js        # Election endpoints
│   ├── candidateRoutes.js       # Candidate endpoints
│   ├── adminRoutes.js           # Admin endpoints
│   ├── voterRegistration.js     # Voter registration endpoints
│   ├── profileUpdateRoutes.js   # Profile update endpoints
│   ├── uploadRoute.js           # File upload endpoints
│   ├── activityRoutes.js        # Activity endpoints
│   ├── notificationRoute.js     # Notification endpoints
│   └── test.js                  # Testing endpoints
│
├── 📂 web3/                      # Blockchain Integration
│   ├── index.js                 # Web3 initialization
│   ├── web3Config.js            # Web3 configuration
│   └── contracts.js             # Contract instances
│
├── 📂 utils/                     # Utility Functions
│   ├── generateToken.js         # JWT token generation
│   ├── sendOTP.js               # OTP sending logic
│   ├── mailSender.js            # Email sending
│   ├── wallet.js                # Wallet generation
│   └── (other utilities)
│
├── 📂 templates/                 # Email Templates
│   ├── VerifyOtp.js             # OTP email template
│   ├── passwordResetTemplate.js # Password reset email template
│   └── (other email templates)
│
├── 📂 scripts/                   # Hardhat deployment scripts
│   └── deploy.js                # Smart contract deployment
│
├── 📂 artifacts/                 # Compiled smart contracts (generated by Hardhat)
│
├── 📂 cache/                     # Hardhat cache (generated)
│
├── 📂 public/                    # Static files
│   └── schoolImages/            # Uploaded school images
│
├── server.js                     # Main application entry point
├── hardhat.config.js            # Hardhat configuration
├── contractAddresses.json        # Deployed contract addresses
├── package.json                  # Dependencies
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
└── README.md                     # This file
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** (v14+ recommended)
- **MongoDB** (local or MongoDB Atlas)
- **Polygon/Ethereum RPC URL** (from Infura, Alchemy, or QuickNode)
- **Private Key** for relayer wallet

### Step 1: Clone Repository

```bash
git clone https://github.com/ramansh18/E-Vote-Backend.git
cd E-Vote-Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
cp .env.example .env
```

### Step 4: Configure Environment Variables

See [Environment Configuration](#environment-configuration) section below.

### Step 5: Set Up MongoDB

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas connection string in .env
```

### Step 6: Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Polygon Amoy testnet
npx hardhat run scripts/deploy.js --network polygon_amoy
```

After deployment, update `contractAddresses.json` with deployed contract addresses.

### Step 7: Start the Server

```bash
npm start
```

Server will run on `http://localhost:5000` by default.

---

## 🔧 Environment Configuration

Create a `.env` file in the project root:

```env
# ==========================================
# Server Configuration
# ==========================================
PORT=5000
NODE_ENV=development

# ==========================================
# Database Configuration
# ==========================================
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/evote-db

# ==========================================
# JWT Configuration
# ==========================================
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# ==========================================
# Blockchain Configuration
# ==========================================
# Polygon Amoy Testnet RPC URL
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology

# Relayer Private Key (NEVER commit this!)
RELAYER_PRIVATE_KEY=0x... (your private key from Ganache or Polygon wallet)

# Chain ID for Polygon Amoy
CHAIN_ID=80002

# ==========================================
# Email Configuration (Nodemailer)
# ==========================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# ==========================================
# Cloudinary Configuration (File Uploads)
# ==========================================
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ==========================================
# Frontend URL (CORS)
# ==========================================
FRONTEND_URL=http://localhost:5173

# ==========================================
# OTP Configuration
# ==========================================
OTP_EXPIRY_MINUTES=10
```

### Getting Required Environment Variables

#### 🔐 Relayer Private Key
```bash
# Option 1: Use Ganache Account (Development)
ganache-cli --mnemonic "..." --accounts 10

# Option 2: Use Polygon Wallet
# Create wallet on MetaMask, export private key

# ⚠️ SECURITY: Never expose private key in public repos!
```

#### 📧 Email Configuration (Gmail)
1. Enable 2-Step Verification on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use app password as `EMAIL_PASS`

#### ☁️ Cloudinary Setup
1. Sign up at https://cloudinary.com
2. Get API credentials from dashboard
3. Add to `.env`

---

## 🔗 Blockchain Integration

### Smart Contracts Overview

The system uses **4 main smart contracts**:

#### 1. **VoterRegistration.sol**
- Maintains list of registered voters
- Prevents duplicate voting
- Methods:
  - `registerVoter(address voter)` - Register a voter
  - `isRegistered(address voter)` - Check voter status

#### 2. **CandidateRegistration.sol**
- Maintains list of registered candidates
- Candidate eligibility verification
- Methods:
  - `registerCandidate(address candidate)` - Register candidate
  - `isCandidate(address candidate)` - Verify candidate

#### 3. **Election.sol**
- Manages election lifecycle
- Stores election parameters
- Methods:
  - `createElection(...)` - Create new election
  - `startElection(uint electionId)` - Start voting
  - `endElection(uint electionId)` - End voting

#### 4. **Voting.sol** (Core Contract)
```solidity
// Core Functions:
- voteFor(electionId, voterAddress, candidateAddress)
  └─> Records vote on blockchain
  └─> Prevents double voting
  └─> Emits VoteCast event

- getVotes(electionId, candidateAddress)
  └─> Returns vote count for candidate

- addCandidate(electionId, candidateAddress)
  └─> Admin-only function to add candidates
```

### Relayer Pattern

The backend uses a **Relayer Model** to handle blockchain transactions:

```
User → API Request → Backend Verifies User
                       ├─> Relayer Signs Tx (with private key)
                       ├─> Sends to Blockchain
                       ├─> Stores Tx Hash
                       └─> Returns Receipt
```

**Benefits:**
- Users don't need Ethereum/Polygon
- Backend pays for gas fees
- Seamless UX - no wallet switching
- Centralized control over transactions

### Contract Addresses (Polygon Amoy)

Update `contractAddresses.json`:

```json
{
  "voterRegistration": "0x79d0C2C08cA0E87A8287b61Ae1560fA96d4B1987",
  "candidateRegistration": "0x71fd56e52edCE85E9D4682F18Dda0Ef7450b90D8",
  "election": "0x2E66bC3Fe001c4C688f34e63F37Ef6c1032add53",
  "voting": "0x79fF522171396791C71eE174CbF67B0Dc80b1DF4"
}
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### 🔐 Authentication Routes

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "9876543210"
}

Response:
{
  "message": "OTP sent successfully",
  "otp": "123456"  // Remove in production
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "otp": "123456",
  "phone": "9876543210",
  "password": "SecurePass123"
}

Response:
{
  "_id": "user_id",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "message": "Logged in Successfully",
  "_id": "user_id",
  "email": "john@example.com",
  "isAdmin": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "isVerified": true,
  "role": "voter",
  "isAdmin": false,
  "hasVoted": false
}
```

#### Request Password Reset
```http
POST /auth/request-reset
Content-Type: application/json

{
  "email": "john@example.com"
}

Response:
{
  "message": "Password reset link sent to your email"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePass123"
}

Response:
{
  "message": "Password reset successful"
}
```

---

### 🗳️ Election Routes

#### Create Election (Admin Only)
```http
POST /election
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "title": "Presidential Election 2025",
  "description": "Vote for the next president",
  "startDate": "2025-05-01T00:00:00Z",
  "endDate": "2025-05-02T23:59:59Z"
}

Response:
{
  "_id": "election_id",
  "title": "Presidential Election 2025",
  "status": "upcoming",
  "candidates": [],
  "createdAt": "2025-04-26T10:30:00Z"
}
```

#### Get All Elections
```http
GET /election

Response:
{
  "elections": [
    {
      "_id": "election_id",
      "title": "Presidential Election 2025",
      "status": "upcoming",
      "candidateCount": 5,
      "totalVotes": 0
    }
  ]
}
```

#### Get Election by ID
```http
GET /election/:id

Response:
{
  "_id": "election_id",
  "title": "Presidential Election 2025",
  "description": "Vote for the next president",
  "status": "upcoming",
  "startDate": "2025-05-01T00:00:00Z",
  "endDate": "2025-05-02T23:59:59Z",
  "candidates": [
    {
      "_id": "candidate_id",
      "name": "Candidate A",
      "party": "Party A",
      "votes": 150
    }
  ]
}
```

#### Start Election (Admin Only)
```http
PUT /election/:id/start
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "message": "Election started successfully",
  "status": "active"
}
```

#### End Election (Admin Only)
```http
PUT /election/:id/end
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "message": "Election ended successfully",
  "status": "completed"
}
```

#### Get Election Results
```http
GET /election/:electionId/results

Response:
{
  "results": [
    {
      "candidate": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
      "name": "Candidate A",
      "votes": "250"
    },
    {
      "candidate": "0x123abc...",
      "name": "Candidate B",
      "votes": "180"
    }
  ]
}
```

#### Get Approved Candidates
```http
GET /election/:electionId/candidates/approved

Response:
{
  "candidates": [
    {
      "_id": "candidate_id",
      "name": "Candidate A",
      "party": "Party A",
      "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
      "isApproved": true
    }
  ]
}
```

---

### 🗳️ Voting Routes

#### Cast Vote
```http
POST /voting/vote
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "candidateAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
  "electionId": "election_id"
}

Response:
{
  "message": "Vote cast successfully",
  "transactionHash": "0x1234567890abcdef..."
}
```

#### Get All Candidates
```http
GET /voting/candidates

Response:
{
  "candidates": [
    "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE",
    "0x123abc...",
    "0x456def..."
  ]
}
```

#### Get Votes for Candidate
```http
GET /voting/votes/:candidateAddress

Response:
{
  "votes": "250"
}
```

#### Get Voting History
```http
GET /voting/history
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "votingHistory": [
    {
      "id": "1",
      "electionTitle": "Presidential Election 2025",
      "votedAt": "2025-05-01T14:30:00Z",
      "status": "confirmed"
    }
  ]
}
```

#### Get Election Results (via Voting)
```http
GET /voting/results
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "results": [
    {
      "candidate": "0x742d35...",
      "votes": "250"
    }
  ]
}
```

---

### 👥 Candidate Routes

#### Register as Candidate
```http
POST /candidate/register
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "party": "Party A",
  "bio": "Experienced leader with 10 years in public service",
  "platform": "Educational reforms and healthcare"
}

Response:
{
  "message": "Candidate registration submitted",
  "candidateId": "candidate_id"
}
```

#### Get Candidate Profile
```http
GET /candidate/:candidateId

Response:
{
  "_id": "candidate_id",
  "userId": "user_id",
  "name": "Candidate A",
  "party": "Party A",
  "bio": "Experienced leader...",
  "platform": "Educational reforms...",
  "isApproved": false
}
```

#### Approve Candidate (Admin Only)
```http
PUT /candidate/:candidateId/approve
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "message": "Candidate approved successfully"
}
```

---

### 👮 Admin Routes

#### Get All Users
```http
GET /admin/users
Authorization: Bearer <JWT_TOKEN>

Response:
  "users": [
    {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "voter",
      "isAdmin": false
    }
  ]
}
```

#### Promote User to Admin
```http
PUT /admin/promote/:userId
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "message": "User promoted to admin successfully"
}
```

#### Get Dashboard Stats
```http
GET /admin/dashboard
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "totalUsers": 1500,
  "totalElections": 5,
  "totalVotes": 8750,
  "activeElections": 1
}
```

---

### 📤 Upload Routes

#### Upload Profile Picture
```http
POST /upload/profile-picture
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

[Binary file data]

Response:
{
  "message": "File uploaded successfully",
  "url": "https://res.cloudinary.com/...",
  "publicId": "public_id"
}
```

---

### 📢 Notification Routes

#### Get Notifications
```http
GET /notification
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "notifications": [
    {
      "_id": "notification_id",
      "title": "Vote Confirmed",
      "message": "Your vote has been recorded",
      "type": "VoteConfirmation",
      "createdAt": "2025-05-01T14:30:00Z"
    }
  ]
}
```

---

### 📊 Activity Routes

#### Log Activity
```http
POST /activity/log
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "action": "voted",
  "electionId": "election_id",
  "details": "Voted in Presidential Election"
}

Response:
{
  "message": "Activity logged successfully"
}
```

#### Get User Activities
```http
GET /activity/user
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "activities": [
    {
      "_id": "activity_id",
      "action": "voted",
      "timestamp": "2025-05-01T14:30:00Z"
    }
  ]
}
```

---

## 📊 Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  walletAddress: String (unique, auto-generated),
  isVerified: Boolean,
  role: String ("voter" | "admin"),
  isAdmin: Boolean,
  hasVoted: Boolean,
  phone: String,
  age: Number,
  gender: String,
  votingHistory: [
    {
      electionId: ObjectId,
      candidateAddress: String,
      title: String,
      txHash: String,
      timestamp: Date
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Election Model
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  createdBy: ObjectId (reference to User),
  status: String ("upcoming" | "active" | "completed"),
  startDate: Date,
  endDate: Date,
  candidates: [
    {
      _id: ObjectId,
      name: String,
      party: String,
      walletAddress: String,
      votes: Number,
      isApproved: Boolean
    }
  ],
  totalVotes: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Candidate Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  electionId: ObjectId (reference to Election),
  party: String,
  bio: String,
  platform: String,
  profilePicture: String (URL),
  isApproved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### OTP Model
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date (auto-delete after 10 minutes)
}
```

### Notification Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (reference to User),
  title: String,
  message: String,
  type: String ("VoteConfirmation" | "ElectionStart" | etc),
  isRead: Boolean,
  createdAt: Date
}
```

---

## 🔌 WebSocket Events

### Connection
```javascript
// Client connects with JWT token
io.on('connection', (socket) => {
  const userId = socket.userId;  // Extracted from JWT
  console.log(`User ${userId} connected`);
});
```

### Emitted Events from Server

#### Vote Confirmation
```javascript
io.to(userId).emit('new-notification', {
  _id: 'notification_id',
  title: 'Vote Confirmed',
  message: 'Your vote for "Presidential Election" has been recorded',
  type: 'VoteConfirmation',
  createdAt: Date.now()
});
```

#### Election Started
```javascript
io.emit('election-started', {
  electionId: 'election_id',
  title: 'Presidential Election 2025',
  message: 'Voting has begun!'
});
```

#### Election Ended
```javascript
io.emit('election-ended', {
  electionId: 'election_id',
  title: 'Presidential Election 2025',
  message: 'Voting has ended!'
});
```

#### Real-Time Vote Count Update
```javascript
io.emit('vote-count-updated', {
  electionId: 'election_id',
  candidateAddress: '0x...',
  newVoteCount: 1250
});
```

---

## 🔐 Authentication

### JWT Token Structure

```javascript
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "id": "user_id",
  "isAdmin": false,
  "iat": 1704067200,
  "exp": 1704672000  // 7 days expiry
}
```

### Using Bearer Token

```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://localhost:5000/api/auth/me
```

### Protected Routes

Routes with `protect` middleware require:
- Valid JWT token in `Authorization: Bearer <token>` header
- Token signature verification
- Non-expired token

Routes with `adminOnly` middleware additionally require:
- `isAdmin: true` in JWT payload

---

## 🚀 Deployment

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create e-vote-backend

# Set environment variables
heroku config:set MONGODB_URI=<your_mongodb_uri>
heroku config:set JWT_SECRET=<your_secret>
heroku config:set RELAYER_PRIVATE_KEY=<your_private_key>
# ... set other variables

# Deploy
git push heroku main
```

### Deploy to AWS

1. **Create EC2 Instance**
   - Use Node.js AMI
   - Configure security groups (allow port 5000, 22)

2. **SSH into instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install dependencies**
   ```bash
   sudo yum update
   sudo yum install nodejs npm mongodb
   ```

4. **Clone and setup**
   ```bash
   git clone <repo-url>
   cd E-Vote-Backend
   npm install
   ```

5. **Use PM2 for process management**
   ```bash
   npm install -g pm2
   pm2 start server.js
   pm2 save
   ```

### Deploy Smart Contracts

```bash
# Compile contracts
npx hardhat compile

# Deploy to Polygon Amoy
npx hardhat run scripts/deploy.js --network polygon_amoy

# Verify contract (optional)
npx hardhat verify --network polygon_amoy <contract_address>
```

---

## 📝 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "message": "All fields are required"
}
```

#### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

#### 403 Forbidden
```json
{
  "message": "Access denied. Admins only."
}
```

#### 404 Not Found
```json
{
  "message": "User not found"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Failed to cast vote",
  "error": "error details"
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/E-Vote-Backend.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes and commit**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open Pull Request**
   - Describe changes clearly
   - Reference any related issues
   - Ensure tests pass

### Development Guidelines

- Follow ES6+ standards
- Use meaningful variable names
- Add comments for complex logic
- Test all API endpoints before committing
- Never commit `.env` file or private keys

---

## 🔒 Security Best Practices

- ✅ Never expose private keys in code
- ✅ Use environment variables for sensitive data
- ✅ Validate all user inputs
- ✅ Sanitize database queries
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Regular security audits
- ✅ Keep dependencies updated

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs](https://github.com/ramansh18/E-Vote-Backend/issues)
- **Email**: ramansh18@gmail.com
- **LinkedIn**: [Ramansh Saxena](https://linkedin.com/in/ramansh18)

---

## 📄 License

This project is licensed under the ISC License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Ethereum Community** for Web3.js documentation
- **Polygon** for testnet infrastructure
- **MongoDB** for flexible database solution
- **Express.js** community for excellent framework

---

<div align="center">

### 🗳️ Built with ❤️ by Ramansh Saxena

**⭐ Star this repository if you find it helpful!**

```
Made with 💻 for transparent and secure digital voting
```

</div>
