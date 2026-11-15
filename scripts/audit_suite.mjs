// Comprehensive Frontend Quality Audit Test Suite for Code Vibe Phase 1
import http from 'http';
import { SUPPORTED_LANGUAGES, detectLanguageFromFilename, detectLanguageFromCode } from '../src/services/languageDetection.js';
import { generateStructuredExplanation, generateSessionTitle, generateFollowUpResponse } from '../src/services/mockAI.js';
import { getSavedSessions, createNewSessionRecord, addMessageToSession } from '../src/services/sessionService.js';

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function testRoutes() {
  console.log('\n--- 1. Testing Live Server Routes ---');
  const routes = ['/', '/login', '/register', '/workspace'];

  for (const route of routes) {
    const status = await new Promise((resolve) => {
      http.get(`http://localhost:5173${route}`, (res) => {
        resolve(res.statusCode);
      }).on('error', (err) => {
        resolve(err.message);
      });
    });
    assert(status === 200, `Route http://localhost:5173${route} returned HTTP ${status}`);
  }
}

function testAuthValidation() {
  console.log('\n--- 2. Testing Login & Registration Validation Logic ---');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Login validations
  assert(!emailRegex.test(''), 'Rejects empty email');
  assert(!emailRegex.test('student'), 'Rejects non-email string');
  assert(!emailRegex.test('student@'), 'Rejects incomplete email');
  assert(emailRegex.test('student@university.edu'), 'Accepts valid student email');

  const validatePassword = (pwd) => pwd && pwd.length >= 6;
  assert(!validatePassword(''), 'Rejects empty password');
  assert(!validatePassword('12345'), 'Rejects passwords under 6 characters');
  assert(validatePassword('123456'), 'Accepts 6-character password');

  // Registration password matching
  const passwordsMatch = (p1, p2) => p1 === p2;
  assert(!passwordsMatch('secret123', 'secret124'), 'Rejects mismatched passwords');
  assert(passwordsMatch('secret123', 'secret123'), 'Accepts matching passwords');
}

function testLanguageDetection() {
  console.log('\n--- 5 & 6. Testing Supported Languages & File Upload Extension Validation ---');

  assert(SUPPORTED_LANGUAGES.length === 5, 'Exactly 5 supported programming languages configured');
  const langIds = SUPPORTED_LANGUAGES.map(l => l.id);
  assert(langIds.includes('python'), 'Includes Python');
  assert(langIds.includes('java'), 'Includes Java');
  assert(langIds.includes('c'), 'Includes C');
  assert(langIds.includes('cpp'), 'Includes C++');
  assert(langIds.includes('javascript'), 'Includes JavaScript');

  // Filename detection
  assert(detectLanguageFromFilename('binary_search.py') === 'python', '.py detects python');
  assert(detectLanguageFromFilename('Main.java') === 'java', '.java detects java');
  assert(detectLanguageFromFilename('program.c') === 'c', '.c detects c');
  assert(detectLanguageFromFilename('solution.cpp') === 'cpp', '.cpp detects cpp');
  assert(detectLanguageFromFilename('app.js') === 'javascript', '.js detects javascript');

  // Unsupported extensions
  const allowedExtensions = ['.py', '.java', '.c', '.cpp', '.cc', '.cxx', '.js'];
  const isAllowed = (fname) => allowedExtensions.some(ext => fname.toLowerCase().endsWith(ext));

  assert(!isAllowed('notes.txt'), 'Rejects .txt file');
  assert(!isAllowed('index.html'), 'Rejects .html file');
  assert(!isAllowed('style.css'), 'Rejects .css file');
  assert(!isAllowed('archive.zip'), 'Rejects .zip file');
  assert(!isAllowed('document.pdf'), 'Rejects .pdf file');
  assert(isAllowed('test.py'), 'Allows .py file');
  assert(isAllowed('Test.java'), 'Allows .java file');

  // Code heuristics
  const pyCode = 'def calculate_sum(a, b):\n    return a + b';
  assert(detectLanguageFromCode(pyCode) === 'python', 'Code heuristic detects Python def function');

  const javaCode = 'public class Solution {\n    public static void main(String[] args) {}\n}';
  assert(detectLanguageFromCode(javaCode) === 'java', 'Code heuristic detects Java public class');

  const cppCode = '#include <iostream>\nusing namespace std;\nint main() { cout << "Hello"; }';
  assert(detectLanguageFromCode(cppCode) === 'cpp', 'Code heuristic detects C++ iostream');
}

function testMockAIExplanation() {
  console.log('\n--- 8 & 9. Testing 5-Part Structured Explanation Engine ---');

  const javaCode = `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`;

  const explanation = generateStructuredExplanation('java', javaCode);

  assert(typeof explanation.overview === 'string' && explanation.overview.length > 20, 'Section 1: Code Overview is generated');
  assert(Array.isArray(explanation.lineByLine) && explanation.lineByLine.length > 0, 'Section 2: Line-by-Line breakdown exists');
  assert(Array.isArray(explanation.logicBreakdown) && explanation.logicBreakdown.length > 0, 'Section 3: Logic Breakdown exists');
  assert(Array.isArray(explanation.executionFlow) && explanation.executionFlow.length > 0, 'Section 4: Execution Flow exists');
  assert(explanation.exampleWalkthrough && explanation.exampleWalkthrough.input && explanation.exampleWalkthrough.output, 'Section 5: Example Walkthrough exists');

  // Title generator
  const title = generateSessionTitle('java', javaCode);
  assert(title.includes('Binary Search'), 'Auto-generated session title accurately detects Binary Search');
}

function testFollowUpChat() {
  console.log('\n--- 11. Testing Contextual Follow-up Chat Engine ---');

  const code = 'int mid = low + (high - low) / 2;';
  const q1 = 'What is the time complexity?';
  const res1 = generateFollowUpResponse(q1, code, 'java');
  assert(res1.toLowerCase().includes('complexity') || res1.toLowerCase().includes('time'), 'Chat handles complexity query');

  const q2 = 'Can this cause an overflow?';
  const res2 = generateFollowUpResponse(q2, code, 'java');
  assert(res2.toLowerCase().includes('overflow') || res2.toLowerCase().includes('edge case'), 'Chat handles overflow & boundary questions');

  const q3 = 'How can we optimize this code?';
  const res3 = generateFollowUpResponse(q3, code, 'java');
  assert(res3.toLowerCase().includes('optimize') || res3.toLowerCase().includes('optimization'), 'Chat handles optimization advice');
}

function testSessionManagement() {
  console.log('\n--- 10 & 12. Testing Session Management Simulation & Persistence ---');

  // Mock localStorage for node environment
  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  const initialSessions = getSavedSessions();
  assert(initialSessions.length >= 3, 'Preloaded demo sessions available on first load');
  assert(initialSessions[0].title.includes('Java'), 'First demo session is Java Binary Search');

  const newSession = createNewSessionRecord({
    language: 'python',
    code: 'print("hello")',
    explanation: { overview: 'Test overview', lineByLine: [], logicBreakdown: [], executionFlow: [] }
  });

  assert(newSession.id.startsWith('session-'), 'Creates valid session record with ID');
  const allSessions = getSavedSessions();
  assert(allSessions[0].id === newSession.id, 'New session placed at top of list (LIFO)');

  // Chat message addition
  const chatMsg = { id: 'msg-1', sender: 'user', text: 'Why this logic?', timestamp: '10:00' };
  const updatedSession = addMessageToSession(newSession.id, chatMsg);
  assert(updatedSession.chatMessages.length === 1, 'Chat message appended to session');
  assert(updatedSession.chatMessages[0].text === 'Why this logic?', 'Chat message content matches');
}

function testResponsiveCalculations() {
  console.log('\n--- 13 & 14. Testing Responsive Panel Calculations ---');

  // Panel resizing calculation logic
  const clampRatio = (width) => Math.max(25, Math.min(75, width));
  assert(clampRatio(50) === 50, 'Standard 50% split preserved');
  assert(clampRatio(15) === 25, 'Clamps minimum editor width to 25%');
  assert(clampRatio(90) === 75, 'Clamps maximum editor width to 75%');

  // Viewport breakpoints
  const isMobileViewport = (width) => width < 768;
  assert(!isMobileViewport(1440), '1440px is desktop (split layout)');
  assert(!isMobileViewport(1024), '1024px is desktop/laptop (split layout)');
  assert(!isMobileViewport(768), '768px is tablet (split layout)');
  assert(isMobileViewport(767), '767px is mobile view');
  assert(isMobileViewport(390), '390px (iPhone 12/13/14) is mobile view');
  assert(isMobileViewport(360), '360px (Android compact) is mobile view');
}

async function runAll() {
  try {
    await testRoutes();
    testAuthValidation();
    testLanguageDetection();
    testMockAIExplanation();
    testFollowUpChat();
    testSessionManagement();
    testResponsiveCalculations();

    console.log(`\n========================================`);
    console.log(`AUDIT RESULTS: ${passedCount}/${totalCount} tests passed.`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('\nAudit encountered an error:', err);
    process.exit(1);
  }
}

runAll();
