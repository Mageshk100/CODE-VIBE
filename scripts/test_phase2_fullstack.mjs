// Full-Stack Phase 2 Verification Suite
import http from 'http';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

function makeToken(user) {
  const payload = {
    uid: user.uid,
    email: user.email,
    name: user.name,
    role: user.role || 'student',
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  return 'dev-token-' + Buffer.from(JSON.stringify(payload)).toString('base64');
}

let passed = 0;
let total = 0;

function assert(condition, label) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${label}`);
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    throw new Error(`Failed: ${label}`);
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('   CODE VIBE: PHASE 2 FULL-STACK AUDIT TEST SUITE');
  console.log('======================================================\n');

  // 1. Health Checks
  console.log('--- 1. Service Health Checks ---');
  const fe = await request({ hostname: 'localhost', port: 5173, path: '/', method: 'GET' });
  assert(fe.status === 200, 'Frontend Vite dev server responds with HTTP 200 at http://localhost:5173/');

  const be = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  assert(be.status === 200 && be.body.success === true, 'Backend Express server responds with HTTP 200 at http://localhost:5000/api/health');

  const dbHealth = await request({ hostname: 'localhost', port: 5000, path: '/api/health/db', method: 'GET' });
  assert(dbHealth.status === 200 && dbHealth.body.data.status, 'Database health check endpoint responds with active status');

  // 2. Authentication & Profile Sync
  console.log('\n--- 2. Firebase Token Verification & MySQL Sync ---');
  const student1 = { uid: 'fb-user-1', email: 'cynthia@college.edu', name: 'Cynthia Wu', role: 'student' };
  const token1 = makeToken(student1);

  const sync1 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/sync',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}`, 'Content-Type': 'application/json' }
  });
  assert(sync1.status === 200, 'Syncs Cynthia profile with backend');
  assert(sync1.body.data.email === 'cynthia@college.edu', 'Email correctly populated');
  assert(sync1.body.data.role === 'student', 'Role correctly set to student');

  // 3. Session Management (Cynthia)
  console.log('\n--- 3. Persistent Coding Session Lifecycle ---');
  const createRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/sessions',
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}`, 'Content-Type': 'application/json' }
  }, {
    title: 'Java – Binary Search',
    language: 'java',
    original_code: 'public class BinarySearch { int search(int[] arr, int target) { ... } }',
    explanation: { overview: 'Binary search implementation' }
  });
  assert(createRes.status === 201, 'Creates coding session with 201 Created');
  const sessionId = createRes.body.data.id;

  // Add Message
  const msgRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}/messages`,
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token1}`, 'Content-Type': 'application/json' }
  }, {
    role: 'user',
    message: 'What happens when target is smaller than the minimum element?'
  });
  assert(msgRes.status === 201, 'Appends follow-up chat message with 201 Created');

  // Restore session
  const restoreRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  assert(restoreRes.status === 200, 'Restores complete session');
  assert(restoreRes.body.data.chatMessages.length === 1, 'Restored session contains persisted chat message');

  // 4. Session Ownership Protection (Student 2 Dave)
  console.log('\n--- 4. Session Ownership & Cross-Access Security ---');
  const student2 = { uid: 'fb-user-2', email: 'dave@college.edu', name: 'Dave Miller', role: 'student' };
  const token2 = makeToken(student2);

  const unauthorizedAccess = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/sessions/${sessionId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token2}` }
  });
  assert(unauthorizedAccess.status === 403, 'Rejects Dave accessing Cynthia session with 403 Forbidden');

  // 5. Admin RBAC
  console.log('\n--- 5. Admin Role-Based Access Control ---');
  const studentAdminAttempt = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token1}` }
  });
  assert(studentAdminAttempt.status === 403, 'Rejects student from admin stats with 403 Forbidden');

  const adminUser = { uid: 'fb-admin-boss', email: 'lead-admin@codevibe.app', name: 'Lead Admin', role: 'admin' };
  const adminToken = makeToken(adminUser);

  const adminStats = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(adminStats.status === 200, 'Admin accesses stats endpoint successfully');
  assert(typeof adminStats.body.data.total_users === 'number', 'Returns total_users metric');
  assert(typeof adminStats.body.data.total_sessions === 'number', 'Returns total_sessions metric');

  const adminUsers = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  assert(adminUsers.status === 200, 'Admin accesses user list successfully');
  assert(Array.isArray(adminUsers.body.data.users), 'Returns array of registered users');

  console.log(`\n======================================================`);
  console.log(`  PHASE 2 FULL-STACK AUDIT COMPLETE: ${passed}/${total} PASSED`);
  console.log(`======================================================\n`);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
