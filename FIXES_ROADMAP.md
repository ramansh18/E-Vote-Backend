# 🗺️ FIXES ROADMAP - E-Vote Backend Production Ready

**Document Version:** 1.0  
**Created:** May 2, 2026  
**Duration:** 4 Weeks (May 2 - May 30, 2026)  
**Target:** Production deployment by June 1, 2026

---

## 📊 Overview

```
TOTAL ISSUES: 32
├── 🔴 CRITICAL (10 issues) - WEEKS 1-2
├── 🟠 HIGH (12 issues) - WEEKS 2-3
├── 🟡 MEDIUM (7 issues) - WEEK 3-4
└── 🔵 LOW (3 issues) - ONGOING
```

---

## 📅 WEEK 1: CRITICAL SECURITY ISSUES (May 2-8)

### Sprint Goal: Fix Top 5 Critical Issues
**Team:** 2-3 Developers | **Effort:** 32 hours

#### Issue #1: Remove OTP from Response
**Priority:** 🔴 CRITICAL | **Effort:** 2 hours | **Owner:** [Assign]

```javascript
// authController.js Line 58
// REMOVE THIS LINE:
otp,  // ← DELETE THIS

// Impact: Prevents OTP brute force attacks
```

**Tasks:**
- [ ] Remove OTP from register endpoint response
- [ ] Remove OTP from resend-otp endpoint response
- [ ] Update frontend to not expect OTP
- [ ] Add unit test
- [ ] Manual testing
- **PR Target:** May 3

---

#### Issue #2: Move Hardcoded URLs to Environment
**Priority:** 🔴 CRITICAL | **Effort:** 3 hours | **Owner:** [Assign]

```javascript
// authController.js Lines 187, 194-196
// BEFORE:
const resetUrl = `http://localhost:5173/reset-password?token=${rawToken}`;
const faviconUrl = 'https://res.cloudinary.com/duwnm6bjs/image/upload/v1748609859/e-voting-uploads/x6pyk2j2hijwfkjwkven.png';
const supportEmail = 'evote2025@gmail.com';

// AFTER:
const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
const faviconUrl = process.env.FAVICON_URL || 'https://res.cloudinary.com/...';
const supportEmail = process.env.SUPPORT_EMAIL;
```

**Tasks:**
- [ ] Add new env variables to .env.example
- [ ] Update all hardcoded URLs in authController.js
- [ ] Update all hardcoded URLs in mailSender.js
- [ ] Create migration guide
- [ ] Test with different URLs
- **PR Target:** May 3

---

#### Issue #3: Implement Input Validation (Core Endpoints)
**Priority:** 🔴 CRITICAL | **Effort:** 6 hours | **Owner:** [Assign]

```bash
npm install joi
```

**Files to Update:**
- `routes/auth.js` - Validate register, login, reset password
- `routes/voting.js` - Validate vote casting
- `routes/candidate.js` - Validate candidate submission

**Example:**
```javascript
const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required()
});

router.post("/register", (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details });
    next();
}, register);
```

**Tasks:**
- [ ] Create validation schemas
- [ ] Add validation middleware
- [ ] Validate 10 critical endpoints
- [ ] Write tests
- **PR Target:** May 5

---

#### Issue #4: Fix Blockchain Parameter Mismatches
**Priority:** 🔴 CRITICAL | **Effort:** 4 hours | **Owner:** [Assign]

**File:** `votingController.js` Line 187

```javascript
// ❌ BEFORE - Missing electionId
votingContract.methods.addCandidate(candidateAddress).encodeABI();

// ✅ AFTER - Include electionId
votingContract.methods.addCandidate(electionNumber, candidateAddress).encodeABI();
```

**Tasks:**
- [ ] Fix addCandidate calls
- [ ] Verify all contract method calls match ABI
- [ ] Write integration test
- [ ] Test on testnet
- **PR Target:** May 4

---

#### Issue #5: Add Election Status Validation
**Priority:** 🔴 CRITICAL | **Effort:** 3 hours | **Owner:** [Assign]

**File:** `votingController.js` Lines 10-30

```javascript
// ADD THIS VALIDATION:
if (election.status !== "ongoing") {
    return res.status(403).json({ 
        message: "Election is not currently active for voting" 
    });
}

const now = Date.now();
if (now < election.startTime.getTime()) {
    return res.status(403).json({ 
        message: "Election voting has not started yet" 
    });
}
if (now > election.endTime.getTime()) {
    return res.status(403).json({ 
        message: "Election voting period has ended" 
    });
}
```

**Tasks:**
- [ ] Add status validation
- [ ] Add time validation
- [ ] Write unit tests
- [ ] Test edge cases
- **PR Target:** May 4

---

### Week 1 Deliverables
- [ ] 5 critical security fixes merged
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Ready for Week 2

---

## 📅 WEEK 2: REMAINING CRITICAL ISSUES (May 9-15)

### Sprint Goal: Fix Final 5 Critical Issues
**Team:** 2-3 Developers | **Effort:** 28 hours

#### Issue #6: Implement Rate Limiting
**Priority:** 🔴 CRITICAL | **Effort:** 5 hours | **Owner:** [Assign]

```bash
npm install express-rate-limit redis
```

**Endpoints to Protect:**
- POST /api/auth/register - 5 per hour per IP
- POST /api/auth/verify-otp - 10 per hour per IP
- POST /api/voting/vote - 1 per 24 hours per user
- POST /api/auth/request-reset - 3 per hour per email

**Tasks:**
- [ ] Install rate limiting library
- [ ] Configure Redis (or memory store for dev)
- [ ] Apply rate limiters
- [ ] Test rate limiting
- [ ] Add retry-after headers
- **PR Target:** May 10

---

#### Issue #7: Transaction Confirmation & Verification
**Priority:** 🔴 CRITICAL | **Effort:** 6 hours | **Owner:** [Assign]

**Files:** `votingController.js`, `electionController.js`

```javascript
// ✅ PROPER VERIFICATION
const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

if (!receipt) {
    throw new Error("Transaction receipt is null");
}

if (receipt.status === false) {
    // Update blockchain state - transaction failed
    user.votingHistory.pop(); // Remove pending vote
    await user.save();
    throw new Error("Transaction reverted on blockchain");
}

if (!receipt.blockHash) {
    throw new Error("Transaction not mined");
}

// Only NOW update database
candidate.votes += 1;
election.candidates[index] = candidate;
await election.save();
```

**Tasks:**
- [ ] Add receipt validation
- [ ] Add status checking
- [ ] Add confirmation checking
- [ ] Implement rollback logic
- [ ] Write tests
- **PR Target:** May 11

---

#### Issue #8: Fix Database State Consistency
**Priority:** 🔴 CRITICAL | **Effort:** 4 hours | **Owner:** [Assign]

**Pattern:**
```javascript
// ❌ WRONG ORDER
candidate.votes += 1;
await election.save(); // Database first
const receipt = await web3.eth.sendSignedTransaction(...); // Then blockchain

// ✅ RIGHT ORDER
const receipt = await web3.eth.sendSignedTransaction(...); // Blockchain first
if (receipt.status !== false && receipt.blockHash) {
    candidate.votes += 1;
    await election.save(); // Database second (only if blockchain confirmed)
} else {
    throw new Error("Transaction failed");
}
```

**Tasks:**
- [ ] Audit voting flow
- [ ] Fix ordering in all blockchain operations
- [ ] Add transaction rollback
- [ ] Write integration tests
- **PR Target:** May 12

---

#### Issue #9: Private Key Management Setup
**Priority:** 🔴 CRITICAL | **Effort:** 5 hours | **Owner:** [Assign]

**For Production:**
```javascript
// Instead of:
const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY;

// Use AWS KMS / Azure Key Vault
const getPrivateKey = async () => {
    // Fetch from secure KMS
    return await kmsClient.decrypt(process.env.KMS_KEY_ID);
};

const relayerPrivateKey = await getPrivateKey();
```

**Tasks:**
- [ ] Document current key management
- [ ] Create AWS KMS setup guide
- [ ] Add HSM support guide
- [ ] Add key rotation documentation
- [ ] Create migration guide for deployment
- **PR Target:** May 13

---

#### Issue #10: Nonce Management for Concurrent Votes
**Priority:** 🔴 CRITICAL | **Effort:** 5 hours | **Owner:** [Assign]

```javascript
// ✅ IMPLEMENT NONCE QUEUE
class NonceManager {
    constructor(web3, wallet) {
        this.web3 = web3;
        this.wallet = wallet;
        this.nonce = null;
        this.queue = [];
    }

    async getNextNonce() {
        if (this.nonce === null) {
            this.nonce = await this.web3.eth.getTransactionCount(this.wallet.address);
        }
        return this.nonce++;
    }

    async executeTransaction(txData) {
        const nonce = await this.getNextNonce();
        return await sendTransaction({ ...txData, nonce });
    }
}
```

**Tasks:**
- [ ] Create NonceManager class
- [ ] Integrate in votingController
- [ ] Add mutex for concurrent requests
- [ ] Test with concurrent votes
- [ ] Write stress tests
- **PR Target:** May 14

---

### Week 2 Deliverables
- [ ] All 10 critical issues fixed
- [ ] 95%+ test coverage on critical paths
- [ ] Code review passed
- [ ] Ready for high-priority issues

---

## 📅 WEEK 3: HIGH PRIORITY ISSUES (May 16-22)

### Sprint Goal: Fix 12 High Priority Issues
**Team:** 2-3 Developers | **Effort:** 32 hours

#### Issue #11-15: Core High Priority Fixes
**Effort Per Issue:** 2-4 hours

| # | Issue | Files | Effort | Owner | Target |
|---|-------|-------|--------|-------|--------|
| 11 | Database indexes | models/*.js | 3h | [Assign] | May 17 |
| 12 | Role consolidation | models/User.js, middleware/auth.js | 4h | [Assign] | May 17 |
| 13 | OTP security (hashing) | controllers/authController.js | 3h | [Assign] | May 18 |
| 14 | Error handling & rollback | controllers/*.js | 5h | [Assign] | May 19 |
| 15 | Email retry logic | utils/mailSender.js | 3h | [Assign] | May 20 |

#### Issue #16-22: Infrastructure & Logging
**Effort Per Issue:** 2-3 hours

| # | Issue | Files | Effort | Owner | Target |
|---|-------|-------|--------|-------|--------|
| 16 | Structured logging | config/logger.js (new) | 3h | [Assign] | May 20 |
| 17 | JWT token config | utils/generateToken.js | 2h | [Assign] | May 18 |
| 18 | Database pooling | config/database.js | 2h | [Assign] | May 19 |
| 19 | Data validation in models | models/*.js | 4h | [Assign] | May 21 |
| 20 | WebSocket rate limiting | server.js | 3h | [Assign] | May 22 |
| 21 | CORS hardening | server.js | 2h | [Assign] | May 18 |
| 22 | Contract access control | contracts/*.sol | 3h | [Assign] | May 22 |

---

## 📅 WEEK 4: MEDIUM & LOW PRIORITY (May 23-30)

### Sprint Goal: Complete Medium Priority & Polish
**Team:** 1-2 Developers | **Effort:** 16 hours

#### Issues #23-29: Medium Priority

| # | Issue | Type | Effort | Owner | Target |
|---|-------|------|--------|-------|--------|
| 23 | Testing framework | Tests | 4h | [Assign] | May 25 |
| 24 | API documentation | Docs | 3h | [Assign] | May 26 |
| 25 | Contract documentation | Docs | 2h | [Assign] | May 26 |
| 26 | Data encryption at rest | Feature | 3h | [Assign] | May 27 |
| 27 | Environment validation | Config | 2h | [Assign] | May 24 |
| 28 | Error response standardization | Refactor | 2h | [Assign] | May 25 |
| 29 | Smart contract tests | Tests | 3h | [Assign] | May 28 |

#### Issues #30-32: Low Priority (Can do in parallel)

| # | Issue | Type | Effort | Owner | Target |
|---|-------|------|--------|-------|--------|
| 30 | Remove unused files | Cleanup | 1h | [Assign] | May 29 |
| 31 | Code cleanup & formatting | Cleanup | 2h | [Assign] | May 29 |
| 32 | Wallet collision prevention | Feature | 1h | [Assign] | May 30 |

---

## 👥 Team Assignment Template

```
WEEK 1 ASSIGNMENTS:
├── Dev A: Issues #1, #2 (URLs & OTP)
├── Dev B: Issues #3, #4 (Validation & Blockchain)
└── Dev C: Issue #5 (Election Status)

WEEK 2 ASSIGNMENTS:
├── Dev A: Issues #6, #7 (Rate Limit & Verification)
├── Dev B: Issues #8, #9 (State & Key Management)
└── Dev C: Issue #10 (Nonce Management)

WEEK 3 ASSIGNMENTS:
├── Dev A: Issues #11-15 (Database & Auth)
├── Dev B: Issues #16-19 (Infrastructure & Logging)
└── Dev C: Issues #20-22 (Security & Config)

WEEK 4 ASSIGNMENTS:
├── Dev A: Issues #23-26 (Testing & Docs)
├── Dev B: Issues #27-29 (Validation & Tests)
└── Dev C: Issues #30-32 (Cleanup)
```

---

## ✅ Acceptance Criteria

### By End of Week 1
- [ ] 5 critical security issues fixed
- [ ] All PRs reviewed and merged
- [ ] Zero test failures
- [ ] Code review passed by 2 developers

### By End of Week 2
- [ ] All 10 critical issues resolved
- [ ] 95%+ test coverage on critical paths
- [ ] Security audit re-run confirms fixes
- [ ] Ready for production staging

### By End of Week 3
- [ ] 22/32 issues resolved
- [ ] Integration tests passing
- [ ] Performance benchmarks acceptable
- [ ] 80%+ code coverage

### By End of Week 4
- [ ] All 32 issues resolved
- [ ] 90%+ code coverage
- [ ] Full documentation complete
- [ ] Ready for production deployment

---

## 🧪 Testing Requirements

Each fix must include:

```
Unit Tests:
├── Happy path tests
├── Error case tests
├── Edge case tests
└── Security tests

Integration Tests:
├── Auth flow end-to-end
├── Voting flow end-to-end
├── Election management flow
└── Blockchain interaction flow

Security Tests:
├── Input validation bypass attempts
├── Rate limit tests
├── Blockchain transaction verification
└── Database consistency checks
```

---

## 📊 Progress Tracking

### Metrics to Track

```
By Friday of Each Week:
- Issues Closed: X/X
- Tests Passing: X/X (%)
- Code Coverage: X%
- PRs Merged: X
- Code Review Comments: X
- Bugs Found: X (should decrease each week)
```

### Dashboard Template

```
WEEK 1 PROGRESS:
Critical Issues: 5/5 ✓
High Issues: 0/12
Medium Issues: 0/7
Low Issues: 0/3
Total: 5/32 (15%)

WEEK 2 PROGRESS:
Critical Issues: 10/10 ✓
High Issues: 0/12
Medium Issues: 0/7
Low Issues: 0/3
Total: 10/32 (31%)

WEEK 3 PROGRESS:
Critical Issues: 10/10 ✓
High Issues: 12/12 ✓
Medium Issues: 0/7
Low Issues: 0/3
Total: 22/32 (68%)

WEEK 4 PROGRESS:
Critical Issues: 10/10 ✓
High Issues: 12/12 ✓
Medium Issues: 7/7 ✓
Low Issues: 3/3 ✓
Total: 32/32 (100%) ✓
```

---

## 🚀 Deployment Timeline

```
May 2: Audit branch created
May 8: Week 1 complete (critical basics)
May 15: Week 2 complete (all critical)
May 22: Week 3 complete (80% done)
May 30: Week 4 complete (100% done)
June 1: Production deployment
```

---

## 🎯 Success Criteria for Production

```
Security:
✓ No hardcoded secrets
✓ Rate limiting implemented
✓ Input validation on all endpoints
✓ Database state consistency
✓ Transaction verification

Performance:
✓ Database queries < 100ms
✓ API response time < 500ms
✓ Blockchain tx confirmed within 5 min
✓ 99.9% uptime target

Reliability:
✓ 95%+ test coverage
✓ Comprehensive logging
✓ Error recovery mechanisms
✓ Monitoring & alerting
✓ Rollback procedures documented
```

---

## 📞 Weekly Standup Format

```
MONDAY KICKOFF (9 AM):
- Review previous week results
- Assign new issues
- Identify blockers
- 30 minutes

DAILY SYNC (2 PM):
- What did you complete yesterday?
- What will you do today?
- Any blockers?
- 15 minutes

FRIDAY REVIEW (4 PM):
- Demo completed work
- Review PRs
- Update progress tracking
- Plan next week
- 60 minutes
```

---

**NEXT STEP:** Schedule Week 1 kickoff meeting

**Document Owner:** Security Lead  
**Last Updated:** May 2, 2026  
**Review Schedule:** Weekly
