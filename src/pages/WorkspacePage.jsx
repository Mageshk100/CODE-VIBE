import React, { useState, useEffect, useRef } from 'react';
import { Menu, Code2, BookOpen } from 'lucide-react';
import Sidebar from '../components/workspace/Sidebar';
import MonacoPanel from '../components/workspace/MonacoPanel';
import ExplanationPanel from '../components/workspace/ExplanationPanel';
import {
  fetchSessions,
  fetchSessionDetails,
  createSessionRecord,
  appendMessageToSession,
  getActiveSessionId,
  setActiveSessionId
} from '../services/sessionService';
import { generateStructuredExplanation } from '../services/mockAI';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

export default function WorkspacePage() {
  const { user, isLoggedIn } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveId] = useState(null);

  // Editor State
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');

  // Explanation & Chat State
  const [explanation, setExplanation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Layout & Responsive States
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'explanation'
  const [splitRatio, setSplitRatio] = useState(50); // percentage for editor width
  const [isDragging, setIsDragging] = useState(false);

  // Reactive window width detection
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  const isDraggingRef = useRef(false);
  const containerRef = useRef(null);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial session restoration when user or auth state changes
  useEffect(() => {
    let isCancelled = false;

    async function loadInitial() {
      const loadedSessions = await fetchSessions(isLoggedIn);
      if (isCancelled) return;
      setSessions(loadedSessions);

      const savedActiveId = getActiveSessionId();
      if (savedActiveId === 'new') {
        startFreshSession();
      } else {
        const targetId = savedActiveId || loadedSessions[0]?.id;
        if (targetId) {
          const detailed = await fetchSessionDetails(targetId, isLoggedIn);
          if (isCancelled) return;
          if (detailed) {
            loadSessionData(detailed);
          } else if (loadedSessions[0]) {
            loadSessionData(loadedSessions[0]);
          } else {
            startFreshSession();
          }
        } else {
          startFreshSession();
        }
      }
    }

    loadInitial();
    return () => { isCancelled = true; };
  }, [isLoggedIn, user?.id]);

  const loadSessionData = (session) => {
    setActiveId(session.id);
    setActiveSessionId(session.id);
    setCode(session.code || session.original_code || '');
    setLanguage(session.language || 'java');
    setIsReadOnly(true);
    setExplanation(session.explanation || null);
    setChatMessages(session.chatMessages || []);
    setSessionTitle(session.title || '');
  };

  const startFreshSession = () => {
    setActiveId(null);
    setActiveSessionId('new');
    setCode('');
    setLanguage('java');
    setIsReadOnly(false);
    setExplanation(null);
    setChatMessages([]);
    setSessionTitle('New Session');
    setMobileView('editor');
  };

  const handleSelectSession = async (id) => {
    const detailed = await fetchSessionDetails(id, isLoggedIn);
    if (detailed) {
      loadSessionData(detailed);
      if (window.innerWidth < 768) {
        setMobileView('explanation');
      }
    }
  };

  const handleExplainCode = async () => {
    if (!code.trim() || isGenerating) return;

    try {
      setIsGenerating(true);

      if (isLoggedIn) {
        // ── Authenticated: Call real Gemini API via backend ──
        const res = await apiClient.post('/ai/explain', { language, code });

        if (res.success && res.data) {
          const { session, explanation: geminiExplanation } = res.data;

          // Reload sessions list
          const reloaded = await fetchSessions(true);
          setSessions(reloaded);

          setActiveId(session.id);
          setActiveSessionId(session.id);
          setExplanation(geminiExplanation);
          setIsReadOnly(true);
          setSessionTitle(session.title);
          setChatMessages([]);
        } else {
          throw new Error(res.message || 'Gemini explanation failed');
        }
      } else {
        // ── Guest: Use local mock AI (no API call, no persistence) ──
        await new Promise(r => setTimeout(r, 900));
        const { generateStructuredExplanation: guestExplain } = await import('../services/mockAI.js');
        const structuredResult = guestExplain(language, code);

        const newSession = await createSessionRecord({
          language,
          code,
          explanation: structuredResult,
          isLoggedIn: false,
        });

        const reloaded = await fetchSessions(false);
        setSessions(reloaded);
        setActiveId(newSession.id);
        setActiveSessionId(newSession.id);
        setExplanation(structuredResult);
        setIsReadOnly(true);
        setSessionTitle(newSession.title);
        setChatMessages([]);
      }

      // Auto-switch to explanation view on mobile
      if (window.innerWidth < 768) {
        setMobileView('explanation');
      }
    } catch (err) {
      console.error('Explanation generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (message) => {
    if (!activeSessionId || activeSessionId === 'new') return;

    // Immediately reflect user message in UI
    setChatMessages(prev => [...prev, message]);

    if (isLoggedIn && !activeSessionId.startsWith('guest-') && !activeSessionId.startsWith('demo-')) {
      try {
        // Call real Gemini chat via backend
        const res = await apiClient.post(`/ai/chat/${activeSessionId}`, {
          message: message.text || message.message,
        });

        if (res.success && res.data?.aiMessage) {
          // Append real AI response to chat
          setChatMessages(prev => [...prev, {
            id: res.data.aiMessage.id || `msg-ai-${Date.now()}`,
            sender: 'ai',
            role: 'assistant',
            text: res.data.aiMessage.text,
            message: res.data.aiMessage.text,
            timestamp: res.data.aiMessage.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      } catch (err) {
        console.error('[Chat] Gemini response failed:', err.message);
      }
    } else {
      // Guest: persist to localStorage only (no AI response generated)
      await appendMessageToSession(activeSessionId, message, false);
    }
  };

  // Resizable Divider Logic for Desktop
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    if (newWidth >= 25 && newWidth <= 75) {
      setSplitRatio(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden bg-softwhite dark:bg-obsidian-dark text-obsidian dark:text-softwhite select-none ${isDragging ? 'cursor-col-resize' : ''}`}>
      {/* 1. Desktop & Tablet Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={startFreshSession}
          isOpen={sidebarOpen}
          onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>

      {/* 2. Mobile Sidebar Overlay & Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <Sidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={handleSelectSession}
            onNewSession={startFreshSession}
            isOpen={true}
            isMobile={true}
            onCloseMobile={() => setMobileDrawerOpen(false)}
          />
        </div>
      )}

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Mobile Top Navigation & Segmented View Switcher */}
        {isMobile && (
          <div className="flex items-center justify-between px-3 py-2 border-b border-platinum-200 dark:border-obsidian-border bg-white dark:bg-obsidian shrink-0">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="p-1.5 rounded-lg text-obsidian dark:text-softwhite hover:bg-platinum-100 dark:hover:bg-charcoal"
              title="Open Sessions"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Segmented Switcher */}
            <div className="flex items-center p-1 bg-platinum-100 dark:bg-charcoal rounded-xl border border-platinum-200 dark:border-charcoal-border">
              <button
                type="button"
                onClick={() => setMobileView('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  mobileView === 'editor'
                    ? 'bg-white dark:bg-obsidian-card text-gold-metallic shadow-xs'
                    : 'text-platinum-500 hover:text-obsidian dark:hover:text-softwhite'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileView('explanation')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all relative ${
                  mobileView === 'explanation'
                    ? 'bg-white dark:bg-obsidian-card text-gold-metallic shadow-xs'
                    : 'text-platinum-500 hover:text-obsidian dark:hover:text-softwhite'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explanation</span>
                {explanation && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-metallic ml-0.5" />
                )}
              </button>
            </div>

            <div className="w-7" />
          </div>
        )}

        {/* Workspace Body: Responsive Desktop Split or Mobile Single View */}
        <div ref={containerRef} className="flex-1 flex h-full min-h-0 relative overflow-hidden">
          {/* Editor Panel */}
          <div
            style={{ width: !isMobile ? `${splitRatio}%` : '100%' }}
            className={`h-full flex-col min-w-[280px] overflow-hidden ${
              isMobile
                ? mobileView === 'editor' ? 'flex' : 'hidden'
                : 'flex'
            }`}
          >
            <MonacoPanel
              code={code}
              setCode={setCode}
              language={language}
              setLanguage={setLanguage}
              isReadOnly={isReadOnly}
              onExplainCode={handleExplainCode}
              isGenerating={isGenerating}
              onNewSession={startFreshSession}
            />
          </div>

          {/* Resizable Divider (Desktop only) */}
          {!isMobile && (
            <div
              onMouseDown={handleMouseDown}
              className={`flex items-center justify-center w-2 hover:w-2.5 transition-colors cursor-col-resize select-none shrink-0 z-20 group ${
                isDragging
                  ? 'bg-gold-metallic/60'
                  : 'bg-platinum-200/80 dark:bg-obsidian-border hover:bg-gold-metallic/40'
              }`}
              title="Drag to resize panels"
            >
              <div className="w-0.5 h-8 bg-platinum-400 group-hover:bg-gold-metallic rounded-full" />
            </div>
          )}

          {/* Explanation Panel */}
          <div
            style={{ width: !isMobile ? `${100 - splitRatio}%` : '100%' }}
            className={`h-full flex-col min-w-[320px] overflow-hidden ${
              isMobile
                ? mobileView === 'explanation' ? 'flex' : 'hidden'
                : 'flex'
            }`}
          >
            <ExplanationPanel
              explanation={explanation}
              isGenerating={isGenerating}
              sessionTitle={sessionTitle}
              language={language}
              code={code}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              activeSessionId={activeSessionId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
