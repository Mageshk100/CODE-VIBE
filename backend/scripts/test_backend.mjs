// Comprehensive Backend Integration Test Suite for Code Vibe Phase 2
import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function createDevToken(payload) {
  const jsonStr = JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });
  return 'dev-token-' + Buffer.from(jsonStr).toString('base64');
}

let passed = 0;
let total = 0;

function assert(condition, desc) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    throw new Error(`Test failed: ${desc}`);
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('   CODE VIBE PHASE 2: BACKEND INTEGRATION TEST SUITE');
  console.log('======================================================\n');

  // Test 1: Health Check
  console.log('--- 1. Health & Status Checks ---');
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET',
  });
  assert(healthRes.status === 200 && healthRes.data.success === true, 'Health check returns 200 and success: true');

  // Test 2: Reject unauthenticated request
  console.log('\n--- 2. Unauthenticated & Invalid Token Rejection ---');
  const unauthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/sessions',
    method: 'GET',
  });
  assert(unauthRes.status === 401 && unauthRes.data.success === false, 'Rejects request missing Authorization header with 401');

  const invalidTokenRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/sessions',
    method: 'GET',
    headers: { 'Authorization': 'Bearer totally-invalid-token' },
  });
  assert(invalidTokenRes.status === 401, 'Rejects invalid bearer token with 401');

  // Test 3: Authenticate Student Alice
  console.log('\n--- 3. User Authentication & Profile Synchronization ---');
  const aliceToken = createDevToken({
    uid: 'firebase-alice-101',
    email: 'alice@university.edu',
    name: 'Alice Johnson',
    role: 'student',
  });

  const syncRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/sync',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aliceToken}`,
      'Content-Type': 'application/json',
    },
  });
  assert(syncRes.status === 200, 'Student profile sync returns 200');
  assert(syncRes.data.data.email === 'alice@university.edu', 'Profile email matches authenticated user');
  assert(syncRes.data.data.role === 'student', 'User role defaults to student');
  const aliceId = syncRes.data.data.id;

  // Test 4: Alice creates a coding session
  console.log('\n--- 4. Session Creation & Validation ---');
  const sessionPayload = {
    title: 'Python – Two Sum',
    language: 'python',
    original_code: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen: return [seen[target - num], i]\n        seen[num] = i\n    return []',
    explanation: {
      overview: 'Two sum solver in linear time.',
      logicBreakdown: ['Hash map complements'],
      executionFlow: ['Traverse list', 'Check dictionary']
    }
  };

  const createSessionRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/sessions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aliceToken}`,
      'Content-Type': 'application/json',
    },
  }, sessionPayload);

  assert(createSessionRes.status === 201, 'Session created successfully with 201 Created');
  assert(createSessionRes.data.data.title === 'Python – Two Sum', 'Session title matches input');
  assert(createSessionRes.data.data.language === 'python', 'Session language matches input');
  const sessionId = createSessionRes.data.data.id;

  // Test 5: List Alice's sessions
  console.log('\n--- 5. Session History Retrieval & Pagination ---');
  const listRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/sessions',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${aliceToken}`,
    },
  });
  assert(listRes.status === 200, 'List sessions returns 200');
  assert(Array.isArray(listRes.data.data.sessions), 'Sessions returned as an array');
  assert(listRes.data.data.sessions.some(s => s.id === sessionId), 'Created session exists in session list');

  // Test 6: Get Session Details
  console.log('\n--- 6. Session Restoration & Messages ---');
  const getSessionRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${aliceToken}`,
    },
  });
  assert(getSessionRes.status === 200, 'Get single session returns 200');
  assert(getSessionRes.data.data.code.includes('two_sum'), 'Original code restored accurately');

  // Test 7: Add Follow-up Message
  const messageRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aliceToken}`,
      'Content-Type': 'application/json',
    },
  }, {
    role: 'user',
    message: 'What is the auxiliary memory bound?'
  });
  assert(messageRes.status === 201, 'Chat message appended to session with 201');

  // Re-fetch session to verify message persistence
  const reGetSession = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${aliceToken}`,
    },
  });
  assert(reGetSession.data.data.chatMessages.length === 1, 'Chat message persisted and restored in session');
  assert(reGetSession.data.data.chatMessages[0].text === 'What is the auxiliary memory bound?', 'Message content matches');

  // Test 8: Session Ownership Enforcement (Student Bob cannot access Alice's session!)
  console.log('\n--- 7. Strict Session Ownership Enforcement ---');
  const bobToken = createDevToken({
    uid: 'firebase-bob-202',
    email: 'bob@university.edu',
    name: 'Bob Smith',
    role: 'student',
  });

  const bobAccessRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${bobToken}`,
    },
  });
  assert(bobAccessRes.status === 403, 'Forbidden: Student Bob cannot access Student Alice session (403)');

  const bobMessageRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}/messages`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bobToken}`,
      'Content-Type': 'application/json',
    },
  }, { role: 'user', message: 'Hacking Alice session' });
  assert(bobMessageRes.status === 403, 'Forbidden: Student Bob cannot append messages to Alice session (403)');

  // Test 9: Role-Based Access Control (Admin APIs)
  console.log('\n--- 8. Role-Based Access Control (Admin Endpoints) ---');
  // Student Alice attempts to access admin stats
  const studentAdminRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${aliceToken}`,
    },
  });
  assert(studentAdminRes.status === 403, 'Student rejected from accessing /api/admin/stats with 403 Forbidden');

  // Admin user accesses admin stats
  const adminToken = createDevToken({
    uid: 'firebase-admin-999',
    email: 'superadmin@codevibe.app',
    name: 'Super Admin',
    role: 'admin',
  });

  const adminStatsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  assert(adminStatsRes.status === 200, 'Admin successfully accesses /api/admin/stats');
  assert(typeof adminStatsRes.data.data.total_users === 'number', 'Admin stats returns total_users count');
  assert(typeof adminStatsRes.data.data.total_sessions === 'number', 'Admin stats returns total_sessions count');

  // Admin user lists users
  const adminUsersRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/users',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
    },
  });
  assert(adminUsersRes.status === 200, 'Admin successfully accesses /api/admin/users');
  assert(Array.isArray(adminUsersRes.data.data.users), 'Admin user listing returns array of registered users');

  console.log(`\n======================================================`);
  console.log(`  ALL BACKEND TESTS PASSED: ${passed}/${total}`);
  console.log(`======================================================\n`);
}

runTests().catch(err => {
  console.error('[Test Execution Error]:', err);
  process.exit(1);
});
