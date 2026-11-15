import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Upload, Copy, Trash2, Sparkles, Check, FileCode, AlertCircle, Edit3, Plus } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { detectLanguageFromFilename, detectLanguageFromCode, SUPPORTED_LANGUAGES } from '../../services/languageDetection';
import { useTheme } from '../../context/ThemeContext';

export default function MonacoPanel({
  code,
  setCode,
  language,
  setLanguage,
  isReadOnly,
  onExplainCode,
  isGenerating,
  onNewSession,
  onEditCurrentCode
}) {
  const { resolvedTheme } = useTheme();
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const [copied, setCopied] = useState(false);
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [hasManuallySelectedLang, setHasManuallySelectedLang] = useState(false);

  // Keep fresh references to avoid stale closure issues in Monaco commands & global shortcuts
  const isReadOnlyRef = useRef(isReadOnly);
  const isGeneratingRef = useRef(isGenerating);
  const onExplainCodeRef = useRef(onExplainCode);

  useEffect(() => {
    isReadOnlyRef.current = isReadOnly;
    isGeneratingRef.current = isGenerating;
    onExplainCodeRef.current = onExplainCode;
  }, [isReadOnly, isGenerating, onExplainCode]);

  // When code is cleared (e.g. New Session), reset uploaded file indicator
  useEffect(() => {
    if (!code) {
      setUploadedFilename('');
      setUploadError('');
      setHasManuallySelectedLang(false);
    }
  }, [code]);

  // Ensure read-only dynamically updates on the Monaco editor instance
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly: isReadOnly });
      if (!isReadOnly) {
        editorRef.current.focus();
      }
    }
  }, [isReadOnly]);

  // Global keyboard shortcut listener for Ctrl+Enter (Win/Linux) and Cmd+Enter (Mac)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const currentCode = editorRef.current ? editorRef.current.getValue() : code;
        if (!isReadOnlyRef.current && !isGeneratingRef.current && currentCode && currentCode.trim()) {
          e.preventDefault();
          onExplainCodeRef.current();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [code]);

  // Auto-detect language if code changed and user didn't manually pick
  const handleCodeChange = (value) => {
    const val = value || '';
    setCode(val);

    if (!hasManuallySelectedLang && !uploadedFilename && val.length > 20) {
      const detected = detectLanguageFromCode(val);
      if (detected && detected !== language) {
        setLanguage(detected);
      }
    }
  };

  const handleLanguageChange = (langId) => {
    setLanguage(langId);
    setHasManuallySelectedLang(true);
  };

  // Monaco Editor Mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom Code Vibe Monaco themes
    monaco.editor.defineTheme('codevibe-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '757E8D', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'D4AF37', fontStyle: 'bold' },
        { token: 'string', foreground: 'FFF0A6' },
        { token: 'number', foreground: 'FFD700' },
        { token: 'type', foreground: 'C5CBD3' },
      ],
      colors: {
        'editor.background': '#17191D',
        'editor.foreground': '#F8F9FB',
        'editorLineNumber.foreground': '#3F4452',
        'editorLineNumber.activeForeground': '#D4AF37',
        'editor.lineHighlightBackground': '#1F2228',
        'editorCursor.foreground': '#FFD700',
        'editor.selectionBackground': '#D4AF3733',
        'editor.inactiveSelectionBackground': '#D4AF371A',
      }
    });

    monaco.editor.defineTheme('codevibe-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '9BA3AF', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'B8972E', fontStyle: 'bold' },
        { token: 'string', foreground: '3B82F6' },
        { token: 'number', foreground: 'D97706' },
        { token: 'type', foreground: '2563EB' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#17191D',
        'editorLineNumber.foreground': '#C5CBD3',
        'editorLineNumber.activeForeground': '#D4AF37',
        'editor.lineHighlightBackground': '#F8F9FB',
        'editorCursor.foreground': '#D4AF37',
        'editor.selectionBackground': '#D4AF3726',
      }
    });

    // Monaco internal command for Ctrl/Cmd + Enter
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      const currentCode = editor.getValue();
      if (!isReadOnlyRef.current && !isGeneratingRef.current && currentCode && currentCode.trim()) {
        onExplainCodeRef.current();
      }
    });
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setCode('');
    setUploadedFilename('');
    setUploadError('');
    setHasManuallySelectedLang(false);
    editorRef.current?.focus();
  };

  const handleFileUpload = (e) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.py', '.java', '.c', '.cpp', '.cc', '.cxx', '.js'];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => lowerName.endsWith(ext));

    if (!isAllowed) {
      setUploadError(`Unsupported file format "${file.name}". Supported extensions: .py, .java, .c, .cpp, .js`);
      e.target.value = '';
      return;
    }

    const detected = detectLanguageFromFilename(file.name);
    if (detected) {
      setLanguage(detected);
      setHasManuallySelectedLang(true);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        setUploadedFilename(file.name);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the selected file. Please try again.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const insertSampleCode = (sampleLang) => {
    if (sampleLang === 'java') {
      setLanguage('java');
      setCode(`public class BinarySearch {
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
}`);
    } else if (sampleLang === 'python') {
      setLanguage('python');
      setCode(`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`);
    } else if (sampleLang === 'cpp') {
      setLanguage('cpp');
      setCode(`#include <iostream>
#include <vector>

bool isPalindrome(const std::string& s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s[left] != s[right]) return false;
        left++;
        right--;
    }
    return true;
}`);
    }
    setHasManuallySelectedLang(true);
  };

  const activeLangConfig = SUPPORTED_LANGUAGES.find(l => l.id === language);
  const monacoLanguage = activeLangConfig?.monacoLang || 'python';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-obsidian transition-colors">
      {/* Editor Action Toolbar */}
      <div className="px-4 py-2.5 border-b border-platinum-200 dark:border-obsidian-border bg-platinum-50/70 dark:bg-obsidian-card/60 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Language Selector */}
          <LanguageSelector
            currentLanguage={language}
            onSelectLanguage={handleLanguageChange}
            disabled={isReadOnly}
          />

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".py,.java,.c,.cpp,.cc,.cxx,.js"
            className="hidden"
            disabled={isReadOnly}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isReadOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-card text-xs font-medium text-obsidian dark:text-softwhite hover:border-gold-metallic/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload source file (.py, .java, .c, .cpp, .js)"
          >
            <Upload className="w-3.5 h-3.5 text-platinum-400" />
            <span className="hidden sm:inline">Upload File</span>
          </button>

          {/* Uploaded File Badge */}
          {uploadedFilename && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gold-metallic/10 border border-gold-metallic/30 text-[11px] font-mono text-gold-dark dark:text-gold-light truncate max-w-[140px]">
              <FileCode className="w-3 h-3 shrink-0" />
              <span className="truncate">{uploadedFilename}</span>
            </div>
          )}

          {isReadOnly && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-platinum-100 dark:bg-charcoal text-platinum-500 font-semibold">
                Read-Only
              </span>
              {onEditCurrentCode && (
                <button
                  type="button"
                  onClick={onEditCurrentCode}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-gold-metallic bg-gold-metallic/10 hover:bg-gold-metallic/20 border border-gold-metallic/30 transition-all"
                  title="Unlock and edit this code in a new session"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit This Code</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right actions: Copy, Clear */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!code}
            className="p-1.5 rounded-lg text-platinum-400 hover:text-obsidian dark:hover:text-softwhite hover:bg-platinum-100 dark:hover:bg-charcoal transition-colors disabled:opacity-40"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-gold-metallic" /> : <Copy className="w-4 h-4" />}
          </button>

          {!isReadOnly && (
            <button
              type="button"
              onClick={handleClear}
              disabled={!code}
              className="p-1.5 rounded-lg text-platinum-400 hover:text-red-500 hover:bg-platinum-100 dark:hover:bg-charcoal transition-colors disabled:opacity-40"
              title="Clear Code"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button onClick={() => setUploadError('')} className="text-xs hover:underline font-semibold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Main Canvas */}
      <div
        className="flex-1 relative min-h-[300px] cursor-text"
        onClick={() => {
          if (!isReadOnly && editorRef.current) {
            editorRef.current.focus();
          }
        }}
      >
        <Editor
          height="100%"
          language={monacoLanguage}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme={resolvedTheme === 'dark' ? 'codevibe-dark' : 'codevibe-light'}
          options={{
            readOnly: isReadOnly,
            fontSize: 13,
            fontFamily: '"JetBrains Mono", Consolas, monospace',
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            renderLineHighlight: 'line',
            padding: { top: 12, bottom: 12 },
          }}
        />

        {/* Empty State Overlay Prompt (Click to start typing) */}
        {!code && !isReadOnly && (
          <div
            onClick={() => editorRef.current?.focus()}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 cursor-text select-none"
          >
            <div className="max-w-md space-y-3 pointer-events-auto">
              <div className="w-10 h-10 rounded-xl bg-gold-metallic/10 border border-gold-metallic/20 flex items-center justify-center text-gold-metallic mx-auto">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-obsidian dark:text-softwhite">
                Ready to understand your code?
              </h3>
              <p className="text-xs text-platinum-500 dark:text-platinum-400 leading-relaxed">
                Click here and start typing your code, or paste from clipboard.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
                <span className="text-[11px] text-platinum-400 font-mono">Or try sample:</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); insertSampleCode('java'); }}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-platinum-100 dark:bg-charcoal text-obsidian dark:text-softwhite hover:border-gold-metallic/50 border border-transparent transition-all"
                >
                  Binary Search (Java)
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); insertSampleCode('python'); }}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-platinum-100 dark:bg-charcoal text-obsidian dark:text-softwhite hover:border-gold-metallic/50 border border-transparent transition-all"
                >
                  Two Sum (Python)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Bar: Shortcut hint & Explain Submission Button */}
      <div className="px-4 py-3 border-t border-platinum-200 dark:border-obsidian-border bg-white dark:bg-obsidian-card flex items-center justify-between gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-2 text-xs text-platinum-400 font-mono">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 rounded bg-platinum-100 dark:bg-charcoal text-[11px] text-obsidian dark:text-softwhite border border-platinum-200 dark:border-charcoal-border">
            Ctrl + Enter
          </kbd>
          <span>to submit</span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {isReadOnly ? (
            <div className="flex items-center gap-2">
              {onEditCurrentCode && (
                <button
                  type="button"
                  onClick={onEditCurrentCode}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gold-metallic/15 hover:bg-gold-metallic/25 border border-gold-metallic/40 text-gold-dark dark:text-gold-light text-xs font-semibold transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit This Code</span>
                </button>
              )}
              <button
                type="button"
                onClick={onNewSession}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-platinum-100 dark:bg-charcoal hover:border-gold-metallic/40 border border-platinum-200 dark:border-charcoal-border text-obsidian dark:text-softwhite text-xs font-semibold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onExplainCode}
              disabled={!code.trim() || isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-metallic hover:bg-gold-glow text-obsidian font-bold text-xs transition-all shadow-gold-subtle hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-obsidian/20 stroke-[2.2]" />
                  <span>Explain Code</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
