import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Copy, Check, MessageSquare, Terminal } from 'lucide-react';
import { generateFollowUpResponse } from '../../services/mockAI';
import MarkdownView from '../common/MarkdownView';

export default function ExplanationPanel({
  explanation,
  isGenerating,
  sessionTitle,
  language,
  code,
  chatMessages = [],
  onSendMessage,
  activeSessionId
}) {
  const [inputMessage, setInputMessage] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [copiedSection, setCopiedSection] = useState(false);
  const chatBottomRef = useRef(null);

  // Auto-scroll on new chat message
  useEffect(() => {
    if (chatMessages.length > 0) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiReplying]);

  const handleSendChat = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isAiReplying) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    // Add user message to session
    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(userMsg);

    // Simulate AI thinking and reply
    setIsAiReplying(true);
    await new Promise(res => setTimeout(res, 850));

    const replyText = generateFollowUpResponse(userText, code, language);
    const aiMsg = {
      id: 'msg-' + (Date.now() + 1),
      sender: 'ai',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    onSendMessage(aiMsg);
    setIsAiReplying(false);
  };

  const handleCopyExplanation = () => {
    if (!explanation) return;
    const fullText = `Code Explanation: ${sessionTitle || 'Code'}\n\n1. Overview:\n${explanation.overview}\n\n3. Logic Breakdown:\n${explanation.logicBreakdown.join('\n')}\n\n4. Execution Flow:\n${explanation.executionFlow.join('\n')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedSection(true);
    setTimeout(() => setCopiedSection(false), 2000);
  };

  const handleQuickQuestion = (q) => {
    setInputMessage(q);
  };

  // 1. Loading State
  if (isGenerating) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-white dark:bg-obsidian">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-metallic/10 border border-gold-metallic/30 flex items-center justify-center text-gold-metallic animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-gold-glow/20 blur-md pointer-events-none animate-ping" />
        </div>
        <h3 className="text-base font-bold text-obsidian dark:text-softwhite mb-2">
          Deconstructing Code & Logic...
        </h3>
        <p className="text-xs text-platinum-500 dark:text-platinum-400 max-w-sm leading-relaxed mb-6">
          Analyzing syntax trees, evaluating algorithmic complexity, and formatting educational breakdown.
        </p>

        {/* Skeleton Document Lines */}
        <div className="w-full max-w-md space-y-3 p-4 rounded-xl border border-platinum-200 dark:border-charcoal-border bg-platinum-50/50 dark:bg-obsidian-card">
          <div className="h-4 bg-platinum-200 dark:bg-charcoal rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-platinum-200 dark:bg-charcoal rounded w-full animate-pulse" />
          <div className="h-3 bg-platinum-200 dark:bg-charcoal rounded w-4/5 animate-pulse" />
          <div className="h-3 bg-platinum-200 dark:bg-charcoal rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  // 2. Empty State
  if (!explanation) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-white dark:bg-obsidian">
        <div className="w-16 h-16 rounded-2xl bg-platinum-100 dark:bg-charcoal/80 border border-platinum-200 dark:border-charcoal-border flex items-center justify-center text-platinum-400 mb-4">
          <Terminal className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-obsidian dark:text-softwhite mb-1.5">
          Your explanation will appear here.
        </h3>
        <p className="text-xs text-platinum-500 dark:text-platinum-400 max-w-xs leading-relaxed">
          Submit your code to see a clear breakdown of how it works.
        </p>
      </div>
    );
  }

  // 3. Document Explanation & Embedded Follow-up Chat
  return (
    <div className="flex flex-col h-full bg-white dark:bg-obsidian overflow-hidden transition-colors">
      {/* Top Header of Explanation Panel */}
      <div className="px-5 py-3 border-b border-platinum-200 dark:border-obsidian-border bg-platinum-50/70 dark:bg-obsidian-card/60 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full bg-gold-metallic shrink-0" />
          <h2 className="text-xs font-bold text-obsidian dark:text-softwhite truncate font-mono">
            {sessionTitle || 'AI Explanation Document'}
          </h2>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gold-metallic/15 text-gold-dark dark:text-gold-light font-semibold shrink-0">
            {language}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopyExplanation}
          className="flex items-center gap-1.5 text-xs text-platinum-400 hover:text-gold-metallic font-medium transition-colors"
          title="Copy full explanation"
        >
          {copiedSection ? <Check className="w-3.5 h-3.5 text-gold-metallic" /> : <Copy className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{copiedSection ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Scrollable Container containing Structured Document + Follow-up Chat */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* DOCUMENT HEADER */}
        <div className="border-b border-platinum-200 dark:border-charcoal-border pb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-gold-metallic font-semibold">
            Structured Learning Document
          </span>
          <h1 className="text-xl font-extrabold text-obsidian dark:text-softwhite tracking-tight mt-1">
            {sessionTitle || 'Algorithmic Walkthrough'}
          </h1>
        </div>

        {/* 1. CODE OVERVIEW */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gold-metallic/10 border border-gold-metallic/30 flex items-center justify-center text-xs font-mono font-bold text-gold-metallic">
              1
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-obsidian dark:text-softwhite">
              Code Overview
            </h3>
          </div>
          <div className="pl-8 text-xs sm:text-sm text-platinum-500 dark:text-platinum-300">
            <MarkdownView content={explanation.overview} />
          </div>
        </section>

        {/* 2. LINE-BY-LINE EXPLANATION */}
        {explanation.lineByLine && explanation.lineByLine.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gold-metallic/10 border border-gold-metallic/30 flex items-center justify-center text-xs font-mono font-bold text-gold-metallic">
                2
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-obsidian dark:text-softwhite">
                Line-by-Line Explanation
              </h3>
            </div>

            <div className="pl-8 space-y-3">
              {explanation.lineByLine.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-platinum-200 dark:border-charcoal-border bg-platinum-50/50 dark:bg-obsidian-card/70 p-3.5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-gold-metallic">
                      {item.lines}
                    </span>
                  </div>
                  <pre className="p-2 rounded-lg bg-white dark:bg-obsidian text-xs font-mono text-obsidian dark:text-platinum-200 overflow-x-auto border border-platinum-200/60 dark:border-charcoal-border">
                    <code>{item.code}</code>
                  </pre>
                  <div className="text-xs text-platinum-500 dark:text-platinum-300 leading-relaxed">
                    <MarkdownView content={item.explanation} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. LOGIC BREAKDOWN */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gold-metallic/10 border border-gold-metallic/30 flex items-center justify-center text-xs font-mono font-bold text-gold-metallic">
              3
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-obsidian dark:text-softwhite">
              Logic Breakdown
            </h3>
          </div>
          <div className="pl-8 space-y-2">
            {explanation.logicBreakdown.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-metallic mt-2 shrink-0" />
                <div className="text-xs sm:text-sm text-platinum-500 dark:text-platinum-300 flex-1">
                  <MarkdownView content={point} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. EXECUTION FLOW */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gold-metallic/10 border border-gold-metallic/30 flex items-center justify-center text-xs font-mono font-bold text-gold-metallic">
              4
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-obsidian dark:text-softwhite">
              Execution Flow
            </h3>
          </div>
          <div className="pl-8">
            <div className="space-y-2 border-l-2 border-gold-metallic/30 pl-4 py-1">
              {explanation.executionFlow.map((step, idx) => (
                <div key={idx} className="text-xs sm:text-sm text-platinum-500 dark:text-platinum-300 leading-relaxed">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. EXAMPLE WALKTHROUGH */}
        {explanation.exampleWalkthrough && (
          <section className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-gold-metallic/10 border border-gold-metallic/30 flex items-center justify-center text-xs font-mono font-bold text-gold-metallic">
                5
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wider text-obsidian dark:text-softwhite">
                Example Walkthrough
              </h3>
            </div>
            <div className="pl-8 space-y-3">
              <div className="p-4 rounded-xl border border-platinum-200 dark:border-charcoal-border bg-platinum-50/60 dark:bg-charcoal/40 space-y-3">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-platinum-400 font-bold block mb-1">
                    Sample Input
                  </span>
                  <div className="font-mono text-xs text-obsidian dark:text-softwhite bg-white dark:bg-obsidian p-2 rounded-lg border border-platinum-200 dark:border-charcoal-border">
                    {explanation.exampleWalkthrough.input}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-platinum-400 font-bold block mb-1">
                    Step-by-Step Evaluation
                  </span>
                  <ul className="space-y-1.5">
                    {explanation.exampleWalkthrough.steps.map((st, i) => (
                      <li key={i} className="text-xs text-platinum-500 dark:text-platinum-300 font-mono">
                        {st}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-platinum-200 dark:border-charcoal-border flex items-center gap-2">
                  <span className="text-xs font-bold text-obsidian dark:text-softwhite">Result:</span>
                  <span className="font-mono text-xs font-semibold text-gold-dark dark:text-gold-light bg-gold-metallic/10 px-2 py-0.5 rounded">
                    {explanation.exampleWalkthrough.output}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SEPARATOR TO FOLLOW-UP CHAT */}
        <div className="relative pt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-platinum-200 dark:border-charcoal-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-obsidian text-platinum-400 font-mono flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-gold-metallic" />
              Follow-up Discussion
            </span>
          </div>
        </div>

        {/* FOLLOW-UP CHAT AREA */}
        <section className="space-y-4 pt-2">
          {/* Quick Questions Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-platinum-400 font-mono">Suggestions:</span>
            <button
              type="button"
              onClick={() => handleQuickQuestion("What is the time complexity of this code?")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-platinum-100 dark:bg-charcoal text-obsidian dark:text-softwhite hover:border-gold-metallic/40 border border-transparent transition-all"
            >
              Time Complexity?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion("Can this cause an integer overflow or boundary error?")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-platinum-100 dark:bg-charcoal text-obsidian dark:text-softwhite hover:border-gold-metallic/40 border border-transparent transition-all"
            >
              Overflow & Edge cases?
            </button>
            <button
              type="button"
              onClick={() => handleQuickQuestion("How can we optimize this logic further?")}
              className="text-[11px] px-2.5 py-1 rounded-full bg-platinum-100 dark:bg-charcoal text-obsidian dark:text-softwhite hover:border-gold-metallic/40 border border-transparent transition-all"
            >
              Optimization tips?
            </button>
          </div>

          {/* Messages Feed */}
          <div className="space-y-3">
            {chatMessages.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-platinum-200 dark:border-charcoal-border text-center text-xs text-platinum-400">
                Have a question about this code? Ask below to clarify logic, edge cases, or complexity.
              </div>
            ) : (
              chatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-gold-metallic/15 border border-gold-metallic/30 flex items-center justify-center text-gold-metallic shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-gold-metallic text-obsidian font-medium rounded-tr-xs shadow-xs'
                          : 'bg-platinum-100/70 dark:bg-obsidian-card border border-platinum-200 dark:border-charcoal-border text-obsidian dark:text-softwhite rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      ) : (
                        <MarkdownView content={msg.text} />
                      )}
                      <div className={`text-[10px] mt-1 font-mono ${isUser ? 'text-obsidian/70 text-right' : 'text-platinum-400'}`}>
                        {msg.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-lg bg-platinum-200 dark:bg-charcoal flex items-center justify-center text-obsidian dark:text-softwhite text-xs font-bold shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isAiReplying && (
              <div className="flex gap-3 items-center text-xs text-platinum-400">
                <div className="w-7 h-7 rounded-lg bg-gold-metallic/15 border border-gold-metallic/30 flex items-center justify-center text-gold-metallic shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="flex items-center gap-1.5 p-3 rounded-xl bg-platinum-100/70 dark:bg-obsidian-card border border-platinum-200 dark:border-charcoal-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-metallic animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-metallic animate-pulse delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-metallic animate-pulse delay-200" />
                  <span className="text-[11px] font-mono ml-2">Generating contextual answer...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Follow-up Chat Input Bar */}
          <form onSubmit={handleSendChat} className="relative mt-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about this code..."
              disabled={isAiReplying}
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-platinum-200 dark:border-charcoal-border bg-white dark:bg-obsidian-card text-xs sm:text-sm text-obsidian dark:text-softwhite placeholder:text-platinum-400 focus:outline-none focus:border-gold-metallic focus:ring-1 focus:ring-gold-metallic transition-all shadow-xs"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isAiReplying}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-gold-metallic hover:bg-gold-glow text-obsidian transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
              title="Send question"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.4]" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
