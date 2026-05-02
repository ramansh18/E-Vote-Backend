# 🔒 E-Vote Backend - Production Security Audit & Issues Report

**Generated Date:** May 2, 2026  
**Audit Status:** Critical Issues Found  
**Production Ready:** ❌ NO - Requires Immediate Fixes

---

## 📊 Executive Summary

This document outlines all critical, high, medium, and low-priority issues found during a comprehensive production-readiness audit of the E-Vote Backend application (both Node.js backend + Ethereum smart contracts).

**Total Issues Found:** 32  
- 🔴 **Critical Security Issues:** 10
- 🟠 **High Priority Issues:** 12  
- 🟡 **Medium Priority Issues:** 7
- 🔵 **Low Priority Issues:** 3

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. Hardcoded Sensitive Data & Environment Variables Exposure

**Severity:** CRITICAL  
**Files Affected:**
- `server.js` (Lines 28-29)
- `authController.js` (Lines 187, 194-196)

**Issues:**
- ❌ Frontend URL hardcoded: `http://localhost:5173/reset-password?token=${rawToken}`
- ❌ Support email hardcoded: `evote2025@gmail.com`
- ❌ Company address hardcoded: `Lucknow,2025`
- ❌ OTP exposed in JSON response (Line 58)
- ❌ Favicon URL hardcoded: Cloudinary URL exposed

**Impact:** Production credentials leaked, phishing vulnerabilities, identity spoofing

**Fix Priority:** IMMEDIATE

```javascript
// ❌ CURRENT (INSECURE)
res.status(200).json({
    message: "OTP sent successfully. Please check your email to verify your account.",
    otp,  // THIS MUST BE REMOVED
});

// ✅ CORRECT (PRODUCTION)
res.status(200).json({
    message: "OTP sent successfully. Please check your email to verify your account.",
    // No otp in response!
});
```

**Action Items:**
- [ ] Move all hardcoded URLs to environment variables
- [ ] Remove OTP from API responses
- [ ] Create `.env.production` template
- [ ] Remove OTP from response in all endpoints

---

### 2. Private Key Exposure & No Key Management

**Severity:** CRITICAL  
**Files Affected:**
- `votingController.js` (Lines 51, 180)
- `candidateController.js` (Line 27)
- `electionController.js` (Line 138)

**Issues:**
- ❌ Relayer private key accessed directly: `process.env.RELAYER_PRIVATE_KEY`
- ⚠️ No private key rotation mechanism
- ⚠️ No rate limiting on transactions using relayer account
- ⚠️ Single private key for all transactions = single point of failure
- ⚠️ Private key could be compromised with single .env breach

**Impact:** Complete blockchain compromise, funds theft, unauthorized voting

**Fix Priority:** IMMEDIATE

**Mitigation:**
- [ ] Implement HSM (Hardware Security Module) for production
- [ ] Use AWS KMS / Azure Key Vault for key management
- [ ] Implement key rotation policy
- [ ] Add transaction rate limiting per relayer
- [ ] Use multi-signature wallet for critical operations

---

### 3. No Input Validation & Sanitization

**Severity:** CRITICAL  
**Files Affected:**
- `authController.js` (Lines 19-22)
- `votingController.js` (Lines 12, 31)
- `candidateController.js` (Lines 128-129)

**Issues:**
- ❌ No password strength validation
- ❌ No candidate address validation (accepts any string)
- ❌ No URL validation for `symbolUrl`
- ❌ No email format validation
- ❌ Potential SQL injection via MongoDB aggregation

**Example Vulnerable Code:**
```javascript
// ❌ NO VALIDATION
const { electionId, party, motto, symbolUrl } = req.body;
// symbolUrl could contain malicious code!
```

**Action Items:**
- [ ] Implement Joi or Yup validation schemas
- [ ] Add password complexity requirements
- [ ] Validate all blockchain addresses with Web3.utils.isAddress()
- [ ] Sanitize all user inputs
- [ ] Add rate limiting middleware

---

### 4. Blockchain Integration Security Gaps

#### 4a. No Transaction Verification
**Severity:** CRITICAL  
**File:** `votingController.js` (Lines 79-82)

```javascript
// ❌ CURRENT - No verification
const receipt = await web3.eth.sendSignedTransaction(
    signedTx.rawTransaction
);
// No validation that receipt is valid!
```

**Issues:**
- ❌ No receipt validation after `sendSignedTransaction`
- ❌ No retry mechanism for failed transactions
- ❌ No confirmation count checking (transaction could be reverted)
- ❌ Database state updated without transaction confirmation

**Fix:**
```javascript
// ✅ CORRECT
if (!receipt || receipt.status === false) {
    throw new Error("Transaction failed on blockchain");
}
if (receipt.confirmations < 1) {
    throw new Error("Transaction not confirmed");
}
// Only then update database
await election.save();
```

#### 4b. Gas Price Manipulation Vulnerability
**Severity:** CRITICAL  
**File:** `votingController.js` (Line 62)

**Issues:**
- ❌ No gas price limit/cap
- ❌ Relayer could be exploited with extreme gas prices
- ❌ No slippage protection
- ❌ No gas estimation limits

**Fix:**
```javascript
const gasPrice = await web3.eth.getGasPrice();
const maxGasPrice = web3.utils.toWei('100', 'gwei');
if (gasPrice > maxGasPrice) {
    throw new Error("Gas price too high");
}
```

#### 4c. Nonce Management Race Condition
**Severity:** CRITICAL  
**File:** `votingController.js` (Line 64)

**Issues:**
- ⚠️ Single nonce fetch for each transaction
- ❌ **Race condition risk** if multiple votes submitted simultaneously
- ❌ No nonce tracking/queue mechanism
- ❌ Could lead to transaction conflicts

**Solution:**
- [ ] Implement transaction queue with nonce management
- [ ] Use Ethers.js sequencer pattern
- [ ] Add mutex locks for concurrent voting

---

### 5. Smart Contract Parameter Mismatch

**Severity:** CRITICAL  
**Files Affected:**
- `votingController.js` (Line 187)
- `contracts/Voting.sol` (Line 41)

**Issue:** Parameter Mismatch in addCandidate

```javascript
// ❌ votingController.js Line 187
votingContract.methods.addCandidate(candidateAddress).encodeABI();
// Missing electionId parameter!

// ✅ contracts/Voting.sol Line 41
function addCandidate(uint256 electionId, address _candidate) external onlyAdmin
```

**Impact:** Transactions will fail or behave unexpectedly

**Action Items:**
- [ ] Fix all contract method calls to match ABI
- [ ] Add parameter validation
- [ ] Write integration tests

---

### 6. No Election Status Validation in Voting

**Severity:** CRITICAL  
**File:** `votingController.js` (Lines 10-30)

**Issues:**
- ❌ No election status check (is voting active?)
- ❌ No timestamp validation
- ❌ Vote can be cast after election ends
- ❌ Vote can be cast before election starts

**Fix:**
```javascript
// ✅ ADD VALIDATION
if (election.status !== "ongoing") {
    return res.status(403).json({ message: "Election is not active" });
}
if (Date.now() > election.endTime) {
    return res.status(403).json({ message: "Election has ended" });
}
if (Date.now() < election.startTime) {
    return res.status(403).json({ message: "Election has not started" });
}
```

---

### 7. No Rate Limiting or DDoS Protection

**Severity:** CRITICAL  
**Files Affected:** All routes

**Issues:**
- ❌ No rate limiting on voting endpoint
- ❌ No rate limiting on registration/OTP endpoints
- ❌ Socket.io connections not rate limited
- ❌ No brute force protection
- ❌ No CAPTCHA for sensitive operations

**Impact:** Spam attacks, blockchain congestion, DOS attacks

**Solution:**
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const votingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1, // 1 vote per hour per IP
    message: "Too many votes from this IP"
});

router.post("/vote", protect, votingLimiter, castVote);
```

---

### 8. Database State Inconsistency

**Severity:** CRITICAL  
**File:** `votingController.js` (Lines 85-98)

**Issues:**
- ❌ Database updated before blockchain confirmation
- ❌ No rollback on blockchain failure
- ❌ Inconsistent state between blockchain and database

```javascript
// ❌ CURRENT - Wrong order
candidate.votes += 1;
await election.save(); // ← Database updated
const receipt = await web3.eth.sendSignedTransaction(...); // ← Then blockchain

// ✅ CORRECT - Blockchain first
const receipt = await web3.eth.sendSignedTransaction(...);
if (receipt.status) {
    candidate.votes += 1;
    await election.save(); // Only update if blockchain confirmed
}
```

---

### 9. OTP Security Issues

**Severity:** CRITICAL  
**Files Affected:**
- `authController.js` (Lines 31-60)
- `models/User.js` (No OTP model validation)

**Issues:**
- ❌ No OTP expiration enforcement
- ❌ No maximum OTP attempts limit (unlimited guessing possible)
- ❌ No rate limiting on OTP requests
- ❌ OTP stored in plaintext in database (security hole)
- ❌ **OTP returned in response (Line 58)** - CRITICAL

**Impact:** Account takeover, brute force attacks

**Fix:**
```javascript
const otpSchema = new mongoose.Schema({
    email: String,
    otp: String, // Should be hashed
    createdAt: { type: Date, default: Date.now, expires: 600 }, // 10min TTL
    attempts: { type: Number, default: 0, max: 5 }
});

// Hash OTP before storing
const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
```

---

### 10. Password Reset Vulnerabilities

**Severity:** CRITICAL  
**Files Affected:**
- `authController.js` (Lines 172-214)
- `utils/mailSender.js`

**Issues:**
- ❌ Reset URL hardcoded to localhost
- ❌ Reset token hardcoded to 15 minutes
- ❌ No rate limiting on password reset requests
- ❌ Email sending fails silently (not thrown)
- ❌ No token invalidation after use

```javascript
// ❌ utils/mailSender.js Lines 19-22
catch(error){
    console.log(error.message); // Silent failure!
}
// Should throw error

// ❌ authController.js Line 187
const resetUrl = `http://localhost:5173/reset-password?token=${rawToken}`;
// Hardcoded!
```

**Fix:**
```javascript
const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
```

---

## 🟠 HIGH PRIORITY ISSUES

### 11. JWT Token Security Issues

**Severity:** HIGH  
**File:** `generateToken.js`

**Issues:**
- ❌ Hardcoded expiration: `"2h"` - Should be configurable
- ❌ No token refresh mechanism
- ❌ No token blacklisting on logout
- ❌ Tokens not invalidated when user role changes
- ❌ No token rotation

**Fix:**
```javascript
const generateToken = (id, isAdmin) => {
    return jwt.sign(
        { id, isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || "2h" }
    );
};
```

---

### 12. Database Connection Issues

**Severity:** HIGH  
**File:** `config/database.js`

**Issues:**
- ❌ No connection pooling configuration
- ❌ No connection timeout settings
- ❌ No retry logic for connection failures
- ❌ Crashes on first connection error

**Fix:**
```javascript
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            maxPoolSize: 10,
            minPoolSize: 5,
            socketTimeoutMS: 45000,
            retryWrites: true
        });
    } catch (error) {
        console.error("MongoDB connection error:", error);
        // Retry logic here
        setTimeout(connectDB, 5000);
    }
};
```

---

### 13. Duplicate Role Management System

**Severity:** HIGH  
**File:** `models/User.js` (Lines 26-34)

**Issues:**
```javascript
role: { enum: ["voter", "admin"], default: "voter" },
isAdmin: { type: Boolean, default: false }
// TWO competing systems!
```

**Problems:**
- ⚠️ Confusion between `role` and `isAdmin`
- ⚠️ Potential inconsistency bugs
- ⚠️ Auth logic fragmented

**Fix:**
- [ ] Use only one system (recommend `role` with enum)
- [ ] Update all auth middleware
- [ ] Migrate existing data

---

### 14. No Database Indexes

**Severity:** HIGH  
**Files Affected:** All models

**Issues:**
- ❌ No indexes on frequently queried fields
- ❌ Slow database queries in production
- ❌ No unique constraints (except email)

**Missing Indexes:**
```javascript
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ votingHistory.electionId: 1 });
electionSchema.index({ electionNumber: 1 });
electionSchema.index({ status: 1 });
```

---

### 15. Missing Data Validation in Models

**Severity:** HIGH  
**File:** `models/User.js`

**Issues:**
- ❌ No email format validation
- ❌ No phone number format validation
- ❌ No wallet address format validation
- ❌ No password strength requirements enforced

---

### 16. Silent Email Sending Failures

**Severity:** HIGH  
**File:** `utils/mailSender.js`

**Issues:**
```javascript
catch(error){
    console.log(error.message); // Not thrown!
}
```

**Problems:**
- ❌ Errors not propagated
- ❌ User doesn't know OTP wasn't sent
- ❌ Registration succeeds without email verification

**Fix:**
```javascript
module.exports = async (email, title, body) => {
    try {
        // ...
        return info;
    } catch(error) {
        console.error("Mail send error:", error);
        throw error; // ← Propagate error
    }
};
```

---

### 17. No Error Handling & Transaction Rollback

**Severity:** HIGH  
**File:** `votingController.js` (Lines 112-115)

**Issues:**
- ❌ No state rollback on failure
- ❌ Vote could be partially recorded
- ❌ No transaction management

```javascript
// ❌ CURRENT
catch (error) {
    console.error("Error casting vote:", error);
    res.status(500).json({ message: "Failed to cast vote", error });
    // No rollback! Database state is corrupted
}
```

---

### 18. No Structured Logging

**Severity:** HIGH  
**Files Affected:** All controllers

**Issues:**
- ❌ Using `console.log/error` for production
- ❌ No log levels, timestamps, or request IDs
- ❌ No audit trail for sensitive operations
- ❌ Logs not stored persistently

**Solution:**
```bash
npm install winston pino
```

---

### 19. Blockchain Network Only on Testnet

**Severity:** HIGH  
**File:** `hardhat.config.js`

**Issues:**
- ❌ Only Polygon Amoy testnet configured
- ❌ No production network setup
- ❌ No staging environment

---

### 20. WebSocket Security Issues

**Severity:** HIGH  
**File:** `server.js` (Lines 35-68)

**Issues:**
- ⚠️ WebSocket auth middleware vulnerable to token reuse
- ⚠️ No connection rate limiting per user
- ⚠️ Socket emissions not authenticated

---

### 21. Smart Contract - No Election Status Checks

**Severity:** HIGH  
**File:** `contracts/Voting.sol` (Line 54)

**Issues:**
```solidity
function voteFor(uint256 electionId, address _voter, address _candidate) external {
    // NO checks if election is active!
    // NO validation that electionId exists!
}
```

---

### 22. No Access Control on Voting Contract

**Severity:** HIGH  
**File:** `contracts/Voting.sol` (Line 54)

**Issues:**
```solidity
function voteFor(...) external {
    // Anyone (any relayer) can call this!
    // If relayer key compromised, unauthorized voting possible
}
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 23. CORS Configuration Issues

**Severity:** MEDIUM  
**File:** `server.js` (Lines 24-30)

**Issues:**
- ⚠️ `process.env.FRONTEND_URL` could be undefined
- ⚠️ No HTTPS enforcement
- ⚠️ Development URLs included in production

### 24. Duplicate Dependencies

**Severity:** MEDIUM  
**File:** `package.json`

**Issues:**
```json
"bcrypt": "^5.1.1",      // Both installed
"bcryptjs": "^3.0.2"     // Use only one
```

### 25. No Testing Infrastructure

**Severity:** MEDIUM  
**File:** `package.json` (Line 7)

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

- ❌ No unit tests
- ❌ No integration tests
- ❌ No smart contract tests

### 26. Missing Environment Variable Validation

**Severity:** MEDIUM  
**Files Affected:** `server.js`, `hardhat.config.js`

**Issues:**
- ⚠️ No startup validation of required env vars
- ⚠️ Crashes occur at runtime instead of startup

### 27. Inconsistent Error Responses

**Severity:** MEDIUM

**Issues:**
- ⚠️ Some endpoints return `message`, others return `error`
- ⚠️ No consistent error code format
- ⚠️ Frontend cannot parse errors reliably

### 28. No Data Encryption at Rest

**Severity:** MEDIUM  
**File:** `models/User.js`

**Issues:**
- ❌ `walletAddress` stored in plaintext
- ❌ `phone` stored in plaintext
- ⚠️ Should use field-level encryption for PII

### 29. Unused Files & Dead Code

**Severity:** MEDIUM

**Issues:**
- ⚠️ Unused test file: `routes/test.js`
- ⚠️ Unused script file: `a.js`
- ⚠️ Commented-out code in `candidateController.js` (Lines 60-125)
- ⚠️ Debug logging left throughout codebase

---

## 🔵 LOW PRIORITY ISSUES

### 30. Missing API Documentation

**Severity:** LOW

- ❌ No Swagger/OpenAPI documentation
- ❌ No smart contract documentation
- ❌ No deployment guide

### 31. Code Quality Issues

**Severity:** LOW

- ⚠️ Inconsistent file naming conventions
- ⚠️ Missing JSDoc comments
- ⚠️ Inconsistent code formatting

### 32. Wallet Address Collision Risk

**Severity:** LOW  
**File:** `utils/wallet.js`

**Issues:**
- ⚠️ Random wallet generation (extremely low probability of collision)
- ⚠️ No uniqueness guarantee in multi-process environment

---

## 📋 ISSUE SUMMARY TABLE

| Category | Count | Severity | Status |
|----------|-------|----------|--------|
| Security | 10 | 🔴 Critical | Must Fix |
| Blockchain | 4 | 🔴 Critical | Must Fix |
| Database | 4 | 🟠 High | Must Fix |
| Error Handling | 2 | 🟠 High | Must Fix |
| Validation | 2 | 🟠 High | Must Fix |
| Configuration | 3 | 🟡 Medium | Before Prod |
| Code Quality | 3 | 🔵 Low | Later |
| **TOTAL** | **32** | **Mixed** | |

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

### Phase 1: CRITICAL (DO NOT DEPLOY WITHOUT)
- [ ] Fix smart contract parameter mismatches
- [ ] Remove OTP from API responses
- [ ] Implement rate limiting on all endpoints
- [ ] Add election status validation in voting
- [ ] Implement input validation on all endpoints
- [ ] Add transaction confirmation checking
- [ ] Implement proper error handling with database rollback
- [ ] Setup HSM/KMS for private key management
- [ ] Fix JWT token expiration configuration
- [ ] Consolidate role management system
- [ ] Add database indexes

### Phase 2: HIGH PRIORITY (Before Launch)
- [ ] Implement structured logging
- [ ] Add comprehensive error handling
- [ ] Setup staging environment
- [ ] Add nonce queue for concurrent transactions
- [ ] Implement email verification with retry logic
- [ ] Setup monitoring and alerting
- [ ] Add transaction retry mechanisms
- [ ] Implement WebSocket rate limiting

### Phase 3: MEDIUM PRIORITY (First Release Post-Launch)
- [ ] Add comprehensive tests (unit, integration, E2E)
- [ ] Add API documentation (Swagger)
- [ ] Implement data encryption at rest
- [ ] Setup CI/CD pipeline
- [ ] Add performance monitoring
- [ ] Configure for mainnet deployment

### Phase 4: LOW PRIORITY (Ongoing)
- [ ] Remove unused files
- [ ] Add JSDoc documentation
- [ ] Refactor duplicate code
- [ ] Add smart contract tests

---

## 📞 Next Steps

1. **Review** this document with your team
2. **Prioritize** fixes based on Phase 1 criticality
3. **Create** individual issues for each problem
4. **Assign** team members to fixes
5. **Test** thoroughly in staging
6. **Deploy** only after Phase 1 complete

---

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Ethereum Smart Contract Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/nodejs-security/)
- [Web3.js Best Practices](https://docs.web3js.org/)

---

**Document Version:** 1.0  
**Last Updated:** May 2, 2026  
**Author:** Security Audit Team  
**Status:** REQUIRES ACTION
