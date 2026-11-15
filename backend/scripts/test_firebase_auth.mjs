/**
 * Firebase Authentication End-to-End Test
 * Tests: config, registration, token verification, MySQL sync, login, password reset, security
 * Uses real Firebase REST API and real Express backend.
 * Does NOT print credentials, private keys, or passwords.
 */

import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: resolve(__dirname, '../.env') });

// Parse frontend .env
const frontendEnvRaw = readFileSync(resolve(__dirname, '../../.env'), 'utf8');
const frontendEnv = Object.fromEntries(
  frontendEnvRaw.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => {
      const [key, ...rest] = l.split('=');
      const val = rest.join('=').trim().replace(/^["']|["']$/g, '').replace(/\r$/, '');
      return [key.trim(), val];
    })
);

const API_KEY = frontendEnv.VITE_FIREBASE_API_KEY;
const PROJECT_ID = frontendEnv.VITE_FIREBASE_PROJECT_ID;
const AUTH_DOMAIN = frontendEnv.VITE_FIREBASE_AUTH_DOMAIN;
const APP_ID = frontendEnv.VITE_FIREBASE_APP_ID;
const BACKEND_URL = 'http://localhost:5000/api';
const FIREBASE_REST = `https://identitytoolkit.googleapis.com/v1/accounts`;

const TEST_EMAIL = `cv.test.${Date.now()}@mailtest.dev`;
const TEST_PASSWORD = 'TestPass@12345';

let results = [];
let idToken = null;
let registeredUid = null;

function pass(test, detail) {
  results.push({ test, status: 'PASS', detail });
  console.log(`✅ PASS: ${test}`);
  if (detail) console.log(`        ${detail}`);
}

function fail(test, detail) {
  results.push({ test, status: 'FAIL', detail });
  console.log(`❌ FAIL: ${test}`);
  if (detail) console.log(`        ${detail}`);
}

async function firebaseREST(action, body) {
  const res = await fetch(`${FIREBASE_REST}:${action}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function backend(path, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── TEST 1: Frontend Firebase Config ─────────────────────────────────────────
async function test1_FrontendConfig() {
  console.log('\n── TEST 1: Frontend Firebase Configuration ──');
  const apiKeyReal = !!API_KEY && !API_KEY.includes('Dummy') && API_KEY.length > 20;
  const projectMatch = PROJECT_ID === 'code-vibe-web';
  const domainMatch = !!AUTH_DOMAIN && AUTH_DOMAIN.includes('code-vibe-web');
  const appIdReal = !!APP_ID && !APP_ID.includes('abcdef') && APP_ID.startsWith('1:');

  if (apiKeyReal && projectMatch && domainMatch && appIdReal) {
    pass('Frontend Firebase Config',
      `projectId=${PROJECT_ID} | authDomain=${AUTH_DOMAIN} | appId=${APP_ID.substring(0,14)}...`
    );
  } else {
    fail('Frontend Firebase Config',
      `apiKey_real=${apiKeyReal} | projectId_match=${projectMatch} | authDomain_match=${domainMatch} | appId_real=${appIdReal}`
    );
  }
}

// ── TEST 2: Student Registration ──────────────────────────────────────────────
async function test2_Registration() {
  console.log('\n── TEST 2: Student Registration via Firebase Email/Password ──');
  try {
    const { ok, data } = await firebaseREST('signUp', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      returnSecureToken: true,
    });
    if (ok && data.idToken && data.localId) {
      idToken = data.idToken;
      registeredUid = data.localId;
      pass('Student Registration',
        `UID: ${data.localId.substring(0,12)}... | email: ${data.email} | token: received`
      );
    } else {
      fail('Student Registration', data.error?.message || 'No token returned');
    }
  } catch (err) {
    fail('Student Registration', err.message);
  }
}

// ── TEST 3: Backend Token Verification ───────────────────────────────────────
async function test3_BackendTokenVerify() {
  console.log('\n── TEST 3: Express Backend Verifies Firebase ID Token ──');
  if (!idToken) { fail('Backend Token Verification', 'Skipped — no token'); return; }
  try {
    const { ok, status, data } = await backend('/auth/sync', 'POST', {}, idToken);
    if (ok && data.success) {
      pass('Backend Token Verification',
        `HTTP ${status} | MySQL id=${data.data?.id} | role=${data.data?.role} | email=${data.data?.email}`
      );
    } else {
      fail('Backend Token Verification', `HTTP ${status}: ${data.message || JSON.stringify(data)}`);
    }
  } catch (err) {
    fail('Backend Token Verification', err.message);
  }
}

// ── TEST 4: MySQL User Record ─────────────────────────────────────────────────
async function test4_MySQLSync() {
  console.log('\n── TEST 4: Verify User Exists in MySQL with Correct Fields ──');
  if (!idToken) { fail('MySQL User Sync', 'Skipped — no token'); return; }
  try {
    const { ok, status, data } = await backend('/users/me', 'GET', null, idToken);
    if (ok && data.success) {
      const u = data.data;
      const uidMatch = u?.firebase_uid === registeredUid;
      const roleOk = u?.role === 'student';
      const emailOk = u?.email === TEST_EMAIL;
      if (uidMatch && roleOk && emailOk) {
        pass('MySQL User Sync',
          `MySQL id=${u.id} | firebase_uid match=✓ | role=${u.role} | email=${u.email}`
        );
      } else {
        fail('MySQL User Sync',
          `uid_match=${uidMatch} | role_student=${roleOk} | email_match=${emailOk}`
        );
      }
    } else {
      fail('MySQL User Sync', `HTTP ${status}: ${data.message}`);
    }
  } catch (err) {
    fail('MySQL User Sync', err.message);
  }
}

// ── TEST 5: Login ─────────────────────────────────────────────────────────────
async function test5_Login() {
  console.log('\n── TEST 5: Login with Registered Email/Password ──');
  try {
    const { ok, data } = await firebaseREST('signInWithPassword', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      returnSecureToken: true,
    });
    if (ok && data.idToken) {
      idToken = data.idToken; // refresh token
      pass('Login', `Signed in | UID: ${data.localId.substring(0,12)}... | fresh token received`);
    } else {
      fail('Login', data.error?.message || 'No idToken');
    }
  } catch (err) {
    fail('Login', err.message);
  }
}

// ── TEST 6: Wrong Password Rejected ──────────────────────────────────────────
async function test6_WrongPassword() {
  console.log('\n── TEST 6: Reject Login with Wrong Password ──');
  try {
    const { ok, data } = await firebaseREST('signInWithPassword', {
      email: TEST_EMAIL,
      password: 'WrongPass!999',
      returnSecureToken: true,
    });
    if (!ok) {
      pass('Wrong Password Rejected', `Firebase error: ${data.error?.message}`);
    } else {
      fail('Wrong Password Rejected', 'Login succeeded with wrong password — SECURITY ISSUE');
    }
  } catch (err) {
    fail('Wrong Password Rejected', err.message);
  }
}

// ── TEST 7: Forgot Password ───────────────────────────────────────────────────
async function test7_ForgotPassword() {
  console.log('\n── TEST 7: Forgot Password Email Dispatch ──');
  try {
    const { ok, data } = await firebaseREST('sendOobCode', {
      requestType: 'PASSWORD_RESET',
      email: TEST_EMAIL,
    });
    if (ok && data.email) {
      pass('Forgot Password', `Reset email dispatched to: ${data.email}`);
    } else {
      fail('Forgot Password', data.error?.message || JSON.stringify(data));
    }
  } catch (err) {
    fail('Forgot Password', err.message);
  }
}

// ── TEST 8: Tampered Token Rejected ──────────────────────────────────────────
async function test8_TamperedToken() {
  console.log('\n── TEST 8: Backend Rejects Tampered/Fake Token ──');
  try {
    const { ok, status } = await backend('/users/me', 'GET', null, 'fake.invalid.token');
    if (!ok && status === 401) {
      pass('Tampered Token Rejected', `Correctly returned HTTP 401 Unauthorized`);
    } else {
      fail('Tampered Token Rejected', `Expected 401, got HTTP ${status}`);
    }
  } catch (err) {
    fail('Tampered Token Rejected', err.message);
  }
}

// ── Cleanup ───────────────────────────────────────────────────────────────────
async function cleanup() {
  if (!idToken) return;
  try {
    await firebaseREST('delete', { idToken });
    console.log('\n[Cleanup] ✓ Test user deleted from Firebase.');
  } catch {
    console.log('\n[Cleanup] Could not auto-delete test user. Remove manually in Firebase Console if needed.');
  }
}

// ── Run All ───────────────────────────────────────────────────────────────────
async function runAll() {
  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  FIREBASE AUTH END-TO-END VERIFICATION  ');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`Test email (temporary): ${TEST_EMAIL}`);

  await test1_FrontendConfig();
  await test2_Registration();
  await test3_BackendTokenVerify();
  await test4_MySQLSync();
  await test5_Login();
  await test6_WrongPassword();
  await test7_ForgotPassword();
  await test8_TamperedToken();

  await cleanup();

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  RESULTS SUMMARY');
  console.log('══════════════════════════════════════════════════════════');
  results.forEach(r => console.log(`  ${r.status === 'PASS' ? '✅' : '❌'} ${r.status}  ${r.test}`));

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\n  ${passed} PASSED  |  ${failed} FAILED  |  ${results.length} TOTAL`);

  if (failed === 0) {
    console.log('\n  🎉 ALL TESTS PASSED — Firebase Auth integration is complete and verified.');
  } else {
    console.log('\n  ⚠️  Some tests failed. See details above.');
    process.exit(1);
  }
}

runAll().catch(err => {
  console.error('[Fatal]', err.message);
  process.exit(1);
});
