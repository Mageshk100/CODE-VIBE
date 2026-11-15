import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, PanelLeftClose, PanelLeft, Code2, Calendar, LogOut, ShieldCheck, LogIn } from 'lucide-react';
import Logo from '../common/Logo';
import ThemeSelector from '../common/ThemeSelector';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  isOpen,
  onToggleOpen,
  isMobile = false,
  onCloseMobile
}) {
  const { user, isLoggedIn, isGuest, logout } = useAuth();

  return (
    <aside
      className={`flex flex-col h-full bg-white dark:bg-obsidian border-r border-platinum-200 dark:border-obsidian-border transition-all duration-300 z-30 ${
        isMobile
          ? 'fixed inset-y-0 left-0 w-72 shadow-2xl'
          : isOpen
          ? 'w-72 shrink-0'
          : 'w-16 shrink-0'
      }`}
    >
      {/* Top Header: Logo & Collapse Button */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-platinum-200 dark:border-obsidian-border shrink-0">
        {(isOpen || isMobile) ? (
          <>
            <Logo size="sm" to="/" />
            {!isMobile && (
              <button
                type="button"
                onClick={onToggleOpen}
                className="p-1.5 rounded-lg text-platinum-400 hover:text-obsidian dark:hover:text-softwhite hover:bg-platinum-100 dark:hover:bg-charcoal transition-colors"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <button
              type="button"
              onClick={onToggleOpen}
              className="p-2 rounded-lg text-platinum-400 hover:text-gold-metallic hover:bg-platinum-100 dark:hover:bg-charcoal transition-colors"
              title="Expand sidebar"
            >
              <PanelLeft className="w-5 h-5 text-gold-metallic" />
            </button>
          </div>
        )}
      </div>

      {/* Guest Mode Indicator (if unauthenticated) */}
      {(isOpen || isMobile) && isGuest && (
        <div className="mx-3 mt-3 p-2.5 rounded-xl bg-platinum-100/70 dark:bg-charcoal/50 border border-platinum-200 dark:border-charcoal-border flex items-center justify-between">
          <div className="text-[11px] text-platinum-500 dark:text-platinum-300">
            <span className="font-semibold text-obsidian dark:text-softwhite">Guest Mode:</span> Temporary
          </div>
          <Link
            to="/login"
            className="text-[11px] font-semibold text-gold-metallic hover:underline flex items-center gap-1"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </Link>
        </div>
      )}

      {/* New Session Button */}
      <div className="p-3 shrink-0">
        {(isOpen || isMobile) ? (
          <button
            type="button"
            onClick={() => {
              onNewSession();
              if (isMobile && onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gold-metallic hover:bg-gold-glow text-obsidian font-semibold text-xs transition-all shadow-gold-subtle hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Session</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNewSession}
            className="w-10 h-10 mx-auto rounded-xl bg-gold-metallic hover:bg-gold-glow text-obsidian flex items-center justify-center shadow-gold-subtle transition-all"
            title="New Session"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Previous Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {(isOpen || isMobile) ? (
          <>
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-platinum-400 font-semibold flex items-center justify-between">
              <span>{isLoggedIn ? 'Saved Sessions' : 'Temporary Sessions'}</span>
              {isLoggedIn && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-metallic/15 text-gold-dark dark:text-gold-light font-bold">
                  MySQL
                </span>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-platinum-400">
                No past sessions yet. Submit code to begin.
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => {
                      onSelectSession(session.id);
                      if (isMobile && onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all flex flex-col gap-0.5 group ${
                      isActive
                        ? 'bg-gold-metallic/10 border border-gold-metallic/40 text-gold-dark dark:text-gold-light font-semibold shadow-xs'
                        : 'border border-transparent text-obsidian dark:text-softwhite hover:bg-platinum-100/60 dark:hover:bg-charcoal/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Code2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-gold-metallic' : 'text-platinum-400'}`} />
                      <span className="truncate">{session.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 pl-5 text-[10px] text-platinum-400 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{session.date}</span>
                    </div>
                  </button>
                );
              })
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-2">
            {sessions.slice(0, 6).map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  title={`${session.title} (${session.date})`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-gold-metallic/20 border border-gold-metallic text-gold-metallic'
                      : 'text-platinum-400 hover:bg-platinum-100 dark:hover:bg-charcoal hover:text-obsidian dark:hover:text-softwhite'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Section: Theme Selector & User Profile */}
      <div className="p-3 border-t border-platinum-200 dark:border-obsidian-border shrink-0 space-y-3 bg-platinum-50/50 dark:bg-obsidian-dark/50">
        {(isOpen || isMobile) ? (
          <>
            <div>
              <ThemeSelector />
            </div>

            <div className="pt-2 border-t border-platinum-200/60 dark:border-charcoal-border flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gold-metallic/15 border border-gold-metallic/30 flex items-center justify-center text-xs font-bold text-gold-metallic shrink-0">
                  {user?.avatar || (isLoggedIn ? 'ST' : 'GT')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs font-semibold text-obsidian dark:text-softwhite truncate">
                      {user?.name || user?.display_name || (isLoggedIn ? 'Student' : 'Guest')}
                    </span>
                    {user?.role === 'admin' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 text-[9px] font-bold uppercase font-mono flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-platinum-400 truncate font-mono">
                    {user?.role === 'admin' ? 'Administrator' : isLoggedIn ? 'Student Account' : 'Guest Learner'}
                  </div>
                </div>
              </div>

              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-platinum-400 hover:text-red-500 hover:bg-platinum-100 dark:hover:bg-charcoal transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  to="/login"
                  title="Sign In"
                  className="p-1.5 rounded-lg text-platinum-400 hover:text-gold-metallic hover:bg-platinum-100 dark:hover:bg-charcoal transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ThemeSelector compact />
            <div
              className="w-8 h-8 rounded-full bg-gold-metallic/15 border border-gold-metallic/30 flex items-center justify-center text-xs font-bold text-gold-metallic cursor-pointer"
              title={`${user?.name || 'User'} (${user?.role || 'Guest'})`}
            >
              {user?.avatar || (isLoggedIn ? 'ST' : 'GT')}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
