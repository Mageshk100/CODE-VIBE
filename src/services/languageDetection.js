export const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', extension: '.py', monacoLang: 'python', sampleExtension: 'py' },
  { id: 'java', name: 'Java', extension: '.java', monacoLang: 'java', sampleExtension: 'java' },
  { id: 'c', name: 'C', extension: '.c', monacoLang: 'c', sampleExtension: 'c' },
  { id: 'cpp', name: 'C++', extension: '.cpp', monacoLang: 'cpp', sampleExtension: 'cpp' },
  { id: 'javascript', name: 'JavaScript', extension: '.js', monacoLang: 'javascript', sampleExtension: 'js' },
];

export const EXTENSION_MAP = {
  '.py': 'python',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.js': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
};

/**
 * Detect language from file extension
 */
export function detectLanguageFromFilename(filename) {
  if (!filename) return null;
  const match = filename.match(/\.[a-zA-Z0-9]+$/);
  if (!match) return null;
  const ext = match[0].toLowerCase();
  return EXTENSION_MAP[ext] || null;
}

/**
 * Heuristic code content language detector
 */
export function detectLanguageFromCode(code) {
  if (!code || typeof code !== 'string') return 'javascript';
  const trimmed = code.trim();

  // Python checks
  if (
    /def\s+\w+\(/.test(trimmed) ||
    /import\s+sys|import\s+os|import\s+math|from\s+\w+\s+import/.test(trimmed) ||
    /print\s*\(.*?\)/.test(trimmed) && !/console\.log|printf|System\.out/.test(trimmed) ||
    /elif\s+:?|class\s+\w+\(object\):|__init__/.test(trimmed)
  ) {
    return 'python';
  }

  // Java checks
  if (
    /public\s+class\s+\w+/.test(trimmed) ||
    /System\.out\.print(ln)?\(/.test(trimmed) ||
    /public\s+static\s+void\s+main/.test(trimmed) ||
    /package\s+[\w.]+;/.test(trimmed)
  ) {
    return 'java';
  }

  // C++ checks
  if (
    /#include\s*<iostream>|#include\s*<vector>|#include\s*<string>/.test(trimmed) ||
    /std::cout|std::cin|std::endl|using\s+namespace\s+std;/.test(trimmed) ||
    /cout\s*<<|cin\s*>>/.test(trimmed)
  ) {
    return 'cpp';
  }

  // C checks
  if (
    /#include\s*<stdio\.h>|#include\s*<stdlib\.h>/.test(trimmed) ||
    /printf\s*\(|scanf\s*\(/.test(trimmed)
  ) {
    return 'c';
  }

  // JavaScript checks
  if (
    /console\.log\(/.test(trimmed) ||
    /const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=/.test(trimmed) ||
    /function\s*\w*\s*\(/.test(trimmed) ||
    /=>\s*\{?/.test(trimmed) ||
    /export\s+default|export\s+const|import\s+.*?from/.test(trimmed)
  ) {
    return 'javascript';
  }

  return 'python';
}
