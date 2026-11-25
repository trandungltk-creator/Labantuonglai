/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Sun,
  Moon,
  BookOpen,
  UserCheck,
  Calendar,
  User,
  PhoneCall,
  ShieldCheck,
  Type,
} from 'lucide-react';
import {
  QUESTIONS_DB,
  createDemoStudentProfile,
  createEmptyStudentProfile,
  setProfileAnswer,
  setStudentValuePriorities,
  generateInternalReport,
  updateReportStoreOnAnswerChange,
  type StudentProfileContract,
  type ModuleId,
  type AnswerValue,
  type SupportVerifications,
  type StudentReviewState,
  type ActionPlanItem,
  type ActionTaskStatus,
  type EvidencePassportItem,
  type MeaningfulDayEntry,
  type EmpathyTriangleSheet,
  type SourceVerificationRecord,
  type AnonymousResearchSubmission,
  type ReportVersionStore,
  type PairedObservationAnswer,
  type PracticeRubricAnswer,
  type PrivateReflectionAnswer,
} from './utils/labanEngine';
import { OnboardingPrivacyView } from './components/OnboardingPrivacyView';
import { HomeTodayView } from './components/HomeTodayView';
import { ExploreSurveyView } from './components/ExploreSurveyView';
import { ProfileReportView } from './components/ProfileReportView';
import { ActionPlanView } from './components/ActionPlanView';
import { MePrivateSpaceView } from './components/MePrivateSpaceView';
import { EmergencySupportView } from './components/EmergencySupportView';

const STORAGE_KEY_PROFILE = 'laban_profile_2_0_1';
const STORAGE_KEY_ONBOARDED = 'laban_onboarded_2_0_1';
const STORAGE_KEY_UI_PREFS = 'laban_ui_prefs_2_0_1';
const STORAGE_KEY_REPORT_STORE = 'laban_report_store_2_0_1';
const STORAGE_KEY_RESEARCH_M = 'laban_research_repo_m_2_0_1';

type MainTab = 'today' | 'explore' | 'profile' | 'plan' | 'me' | 'support';

export default function App() {
  const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const autoStartParam = urlParams.get('autostart') === '1';

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    if (autoStartParam) return true;
    try {
      return localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true';
    } catch {
      return false;
    }
  });

  const [profile, setProfile] = useState<StudentProfileContract>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved) as StudentProfileContract;
        if (parsed && parsed.questionVersion === '2.0' && parsed.ruleVersion === '2.0.1') {
          return parsed;
        }
      }
    } catch {
      // Fallback sang hồ sơ DEMO nếu lỗi đọc
    }
    return createDemoStudentProfile();
  });

  const [reportStore, setReportStore] = useState<ReportVersionStore>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORT_STORE);
      if (saved) {
        const parsed = JSON.parse(saved) as ReportVersionStore;
        if (parsed && parsed.draftReport && parsed.draftReport.ruleVersion === '2.0.1') {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const initialReport = generateInternalReport(createDemoStudentProfile(), {
      reportVersion: 'v1.0-confirmed',
    });
    return {
      confirmedReport: initialReport,
      draftReport: initialReport,
      hasUnconfirmedChanges: false,
    };
  });

  const [researchSubmissions, setResearchSubmissions] = useState<AnonymousResearchSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RESEARCH_M);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UI_PREFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.theme === 'dark') return 'dark';
      }
    } catch {
      // ignore
    }
    return 'light';
  });

  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_UI_PREFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.fontScale === 'number' && parsed.fontScale >= 1 && parsed.fontScale <= 2) {
          return parsed.fontScale;
        }
      }
    } catch {
      // ignore
    }
    return 1;
  });

  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<MainTab>('today');
  const [activeModule, setActiveModule] = useState<ModuleId>('A');
  const [initialQuestionId, setInitialQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.style.setProperty('--font-scale', String(fontScale));
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    try {
      localStorage.setItem(
        STORAGE_KEY_UI_PREFS,
        JSON.stringify({ theme, fontScale, reduceMotion })
      );
    } catch {
      // ignore
    }
  }, [theme, fontScale, reduceMotion]);

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
    } catch {
      // ignore
    }
  }, [profile, hasCompletedOnboarding]);

  useEffect(() => {
    if (!hasCompletedOnboarding) return;
    try {
      localStorage.setItem(STORAGE_KEY_REPORT_STORE, JSON.stringify(reportStore));
    } catch {
      // ignore
    }
  }, [reportStore, hasCompletedOnboarding]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RESEARCH_M, JSON.stringify(researchSubmissions));
    } catch {
      // ignore
    }
  }, [researchSubmissions]);

  const totalAnsweredPersonal = useMemo(() => {
    let count = 0;
    for (const q of QUESTIONS_DB.questions) {
      if (q.module === 'M') continue;
      const a = profile.answers[q.id];
      if (a !== null && a !== undefined) {
        if (typeof a === 'string' && a !== '') count += 1;
        else if (Array.isArray(a) && a.length > 0) count += 1;
        else if (typeof a === 'object' && !Array.isArray(a)) {
          if (
            q.type === 'paired_observation' &&
            ((a as PairedObservationAnswer).self || (a as PairedObservationAnswer).observer)
          ) {
            count += 1;
          } else if (q.type === 'practice_rubric' && (a as PracticeRubricAnswer).score) {
            count += 1;
          } else if (
            q.type === 'private_reflection' &&
            ((a as PrivateReflectionAnswer).shareConsent ||
              (a as PrivateReflectionAnswer).keepOnPaperOnly)
          ) {
            count += 1;
          }
        }
      }
    }
    return count;
  }, [profile.answers]);

  const applyProfileChange = (nextProfile: StudentProfileContract, markAnswerEdit = false) => {
    setProfile(nextProfile);
    if (markAnswerEdit) {
      setReportStore((prev) => updateReportStoreOnAnswerChange(prev, nextProfile));
    } else {
      setReportStore((prev) => ({
        ...prev,
        draftReport: generateInternalReport(nextProfile, {
          reportVersion: prev.draftReport.reportVersion,
          isDraftAfterEdit: prev.hasUnconfirmedChanges,
        }),
      }));
    }
  };

  const handleStartDemo = (grade: '10' | '11' | '12' | null) => {
    const demo = createDemoStudentProfile();
    demo.grade = grade || '11';
    const rep = generateInternalReport(demo, { reportVersion: 'v1.0-confirmed' });
    setProfile(demo);
    setReportStore({
      confirmedReport: rep,
      draftReport: rep,
      hasUnconfirmedChanges: false,
    });
    setHasCompletedOnboarding(true);
    setActiveTab('today');
  };

  const handleStartNewProfile = (grade: '10' | '11' | '12' | null) => {
    const empty = createEmptyStudentProfile(grade);
    const rep = generateInternalReport(empty, { reportVersion: 'v1.0-draft' });
    setProfile(empty);
    setReportStore({
      confirmedReport: null,
      draftReport: rep,
      hasUnconfirmedChanges: false,
    });
    setHasCompletedOnboarding(true);
    setActiveTab('today');
  };

  const handleUpdateAnswer = (questionId: string, value: AnswerValue) => {
    const res = setProfileAnswer(profile, questionId, value);
    if (res.success) {
      applyProfileChange(res.profile, true);
    }
    return { success: res.success, error: res.error };
  };

  const handleUpdateValuePriorities = (priorities: string[]) => {
    const res = setStudentValuePriorities(profile, priorities);
    if (res.success) {
      applyProfileChange(res.profile, true);
    }
    return { success: res.success, error: res.error };
  };

  const handleUpdateBoundary = (boundary: string | null) => {
    applyProfileChange({ ...profile, boundary }, false);
  };

  const handleOpenModule = (moduleId: ModuleId, qId?: string) => {
    setActiveModule(moduleId === 'M' ? 'A' : moduleId);
    setInitialQuestionId(qId || null);
    setActiveTab('explore');
  };

  const handleClearModuleAnswers = (modId: ModuleId) => {
    const nextAnswers = { ...profile.answers };
    for (const q of QUESTIONS_DB.questions) {
      if (q.module === modId) {
        delete nextAnswers[q.id];
      }
    }
    const nextProfile: StudentProfileContract = {
      ...profile,
      answers: nextAnswers,
      valuePriorities: modId === 'D' ? [] : profile.valuePriorities,
    };
    applyProfileChange(nextProfile, true);
  };

  const handleDeleteEntireProfile = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_REPORT_STORE);
      localStorage.removeItem(STORAGE_KEY_ONBOARDED);
    } catch {
      // ignore
    }
    const empty = createEmptyStudentProfile(null);
    const rep = generateInternalReport(empty, { reportVersion: 'v1.0-draft' });
    setProfile(empty);
    setReportStore({
      confirmedReport: null,
      draftReport: rep,
      hasUnconfirmedChanges: false,
    });
    setHasCompletedOnboarding(false);
  };

  if (!hasCompletedOnboarding && activeTab !== 'support') {
    return (
      <OnboardingPrivacyView
        currentGrade={profile.grade}
        theme={theme}
        onToggleTheme={setTheme}
        onStartDemo={handleStartDemo}
        onStartNewProfile={handleStartNewProfile}
        onOpenEmergencySupport={() => setActiveTab('support')}
      />
    );
  }

  const navItems = [
    {
      id: 'today' as const,
      label: 'Hôm nay',
      sublabel: `${(profile.laBan14CompletedIds || []).length}/7 hoạt động`,
      icon: Sun,
    },
    {
      id: 'explore' as const,
      label: 'Khám phá',
      sublabel: `${totalAnsweredPersonal}/194 mục`,
      icon: BookOpen,
    },
    {
      id: 'profile' as const,
      label: 'Hồ sơ',
      sublabel: reportStore.hasUnconfirmedChanges ? 'Có bản nháp mới' : '4 phần đối chiếu',
      icon: UserCheck,
    },
    {
      id: 'plan' as const,
      label: 'Kế hoạch',
      sublabel: `${(profile.actionPlan || []).length} bước · ${(profile.evidencePassport || []).length} thẻ`,
      icon: Calendar,
    },
    {
      id: 'me' as const,
      label: 'Em',
      sublabel: 'Riêng tư & Dữ liệu',
      icon: User,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--lb-bg)] text-[var(--lb-text)] flex flex-col pb-20 lg:pb-10">
      {/* TOP BAR CONTRACT: 3 ZONES (Brand Title — 5 Single-Line Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-[var(--lb-card)]/95 backdrop-blur-md border-b border-[var(--lb-border)] px-4 sm:px-6 py-3.5">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className="text-lg font-extrabold tracking-tight text-[var(--lb-text)] hover:text-[var(--lb-primary)] lb-transition whitespace-nowrap shrink-0 text-left"
          >
            La Bàn Tương Lai
          </button>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav
            aria-label="Điều hướng chính trên thanh đầu trang"
            className="hidden md:flex items-center gap-6 text-sm font-semibold text-[var(--lb-muted)]"
          >
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 whitespace-nowrap shrink-0 border-b-2 lb-transition ${
                    active
                      ? 'text-[var(--lb-primary)] border-[var(--lb-primary)] font-bold'
                      : 'border-transparent hover:text-[var(--lb-text)] hover:border-[var(--lb-border-strong)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`min-h-[42px] px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 whitespace-nowrap shrink-0 lb-transition ${
                activeTab === 'support' || profile.confirmedSafetyPause
                  ? 'bg-[#B42318] text-white'
                  : 'bg-[var(--lb-danger-soft)] text-[var(--lb-danger)] border border-[var(--lb-danger)]/30 hover:bg-[#B42318] hover:text-white'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span>Trợ giúp (111 / 115 / 113)</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE / TABLET SUB-TOOLBAR (Hiển thị trên màn hình nhỏ < lg để đổi giao diện và nhận diện DEMO) */}
      <div className="lg:hidden bg-[var(--lb-surface-subtle)] border-b border-[var(--lb-border)] px-4 py-2">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-[var(--lb-muted)]">
            <span className="font-semibold text-[var(--lb-text)]">Phiếu 2.0 · Quy tắc 2.0.1</span>
            {profile.grade && (
              <>
                <span aria-hidden="true">·</span>
                <span>Khối {profile.grade}</span>
              </>
            )}
            {profile.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span
                  data-testid="demo-badge-mobile"
                  className="font-bold text-[var(--lb-warn)]"
                >
                  DEMO (Dữ liệu giả lập)
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="px-2.5 py-1 rounded-lg bg-[var(--lb-card)] border border-[var(--lb-border)] font-semibold text-[var(--lb-text)] flex items-center gap-1 whitespace-nowrap shrink-0"
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span>{theme === 'light' ? 'Tối' : 'Sáng'}</span>
            </button>
            <button
              type="button"
              onClick={() => setHasCompletedOnboarding(false)}
              className="px-2.5 py-1 rounded-lg bg-[var(--lb-card)] border border-[var(--lb-border)] font-semibold text-[var(--lb-muted)] whitespace-nowrap shrink-0"
            >
              Giới thiệu
            </button>
          </div>
        </div>
      </div>

      {/* WORKSPACE CANVAS: LEFT SIDEBAR (DESKTOP) + MAIN CONTENT VIEWPORT */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8 items-start">
        {/* LEFT WORKSPACE SIDEBAR (Desktop 1440px Presence) */}
        <aside
          aria-label="Thanh công cụ không gian làm việc"
          className="hidden lg:flex flex-col gap-5 sticky top-20"
        >
          {/* Khung định vị hồ sơ cục bộ */}
          <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--lb-primary)] text-white dark:text-[#0B1514] flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--lb-muted)] flex items-center gap-1.5 flex-wrap">
                  <span>Hồ sơ cục bộ</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{profile.grade ? `Khối ${profile.grade}` : 'THPT'}</span>
                </div>
                <div className="text-sm font-bold truncate tabular-nums">{profile.profileId}</div>
              </div>
            </div>

            {/* Metadata không bọc pill theo chuẩn Zero-Pill Discipline, giữ data-testid="demo-badge" cho kiểm thử U05 */}
            <div className="pt-2.5 border-t border-[var(--lb-border)] text-xs text-[var(--lb-muted)] space-y-1">
              <div className="flex items-center justify-between">
                <span>Tiến độ tự khảo sát</span>
                <strong className="text-[var(--lb-text)] tabular-nums">
                  {totalAnsweredPersonal} / 194 mục
                </strong>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--lb-surface-subtle)] overflow-hidden">
                <div
                  className="h-full bg-[var(--lb-primary)]"
                  style={{ width: `${Math.min(100, Math.round((totalAnsweredPersonal / 194) * 100))}%` }}
                />
              </div>
              <div className="pt-1 flex items-center gap-1.5 flex-wrap text-[11px]">
                <span>2.0.1 Offline</span>
                <span aria-hidden="true">·</span>
                <span>Không gọi AI</span>
                {profile.isDemo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span
                      data-testid="demo-badge"
                      className="font-bold text-[var(--lb-warn)]"
                    >
                      DEMO · Dữ liệu giả lập
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Danh sách 5 không gian làm việc có chỉ số tiến độ trực tiếp */}
          <nav
            aria-label="Điều hướng không gian làm việc"
            className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-2 space-y-1"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-[48px] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left lb-transition ${
                    active
                      ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] font-bold'
                      : 'text-[var(--lb-text)] hover:bg-[var(--lb-surface-subtle)]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? 'text-white dark:text-[#0B1514]' : 'text-[var(--lb-primary)]'
                      }`}
                    />
                    <span className="text-sm truncate whitespace-nowrap">{item.label}</span>
                  </div>
                  <span
                    className={`text-[11px] tabular-nums whitespace-nowrap shrink-0 ${
                      active ? 'opacity-90 font-semibold' : 'text-[var(--lb-muted)]'
                    }`}
                  >
                    {item.sublabel}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Bộ chỉnh nhanh Giao diện Sáng/Tối & Cỡ chữ ngay trên Sidebar */}
          <div className="bg-[var(--lb-card)] border border-[var(--lb-border)] rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[var(--lb-text)]">Giao diện hiển thị</span>
              <span className="text-[var(--lb-muted)] tabular-nums">{Math.round(fontScale * 100)}%</span>
            </div>

            {/* Nút chuyển Sáng / Tối */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[var(--lb-surface-subtle)] border border-[var(--lb-border)]">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 lb-transition ${
                  theme === 'light'
                    ? 'bg-[var(--lb-card)] text-[var(--lb-text)] shadow-2xs'
                    : 'text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Sáng</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`min-h-[36px] px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 lb-transition ${
                  theme === 'dark'
                    ? 'bg-[var(--lb-card)] text-[var(--lb-text)] shadow-2xs'
                    : 'text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Tối</span>
              </button>
            </div>

            {/* Bộ chọn nhanh cỡ chữ 100% -> 150% */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--lb-muted)]">
                <Type className="w-3.5 h-3.5 text-[var(--lb-primary)]" />
                <span>Cỡ chữ linh hoạt (tới 200%)</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[1, 1.15, 1.3, 1.5].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setFontScale(sc)}
                    className={`min-h-[34px] py-1 rounded-lg border text-[11px] font-bold tabular-nums whitespace-nowrap shrink-0 lb-transition ${
                      Math.abs(fontScale - sc) < 0.02
                        ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514] border-transparent'
                        : 'bg-[var(--lb-bg)] border-[var(--lb-border)] text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                    }`}
                  >
                    {Math.round(sc * 100)}%
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHasCompletedOnboarding(false)}
              className="w-full min-h-[38px] px-3 py-1.5 rounded-xl border border-[var(--lb-border)] bg-[var(--lb-bg)] text-xs font-semibold text-[var(--lb-muted)] hover:text-[var(--lb-text)] hover:border-[var(--lb-primary)] flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 lb-transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--lb-primary)]" />
              <span>Giới thiệu & Quyền riêng tư</span>
            </button>
          </div>
        </aside>

        {/* MAIN VIEWPORT CONTENT */}
        <main className="min-w-0 w-full">
          {activeTab === 'support' && (
            <EmergencySupportView
              confirmedSafetyPause={profile.confirmedSafetyPause}
              onToggleSafetyPause={(paused) => {
                const nextProfile = { ...profile, confirmedSafetyPause: paused };
                applyProfileChange(nextProfile, false);
              }}
              onClose={() => {
                if (!hasCompletedOnboarding) {
                  setHasCompletedOnboarding(true);
                }
                setActiveTab('today');
              }}
            />
          )}

          {activeTab === 'today' && (
            <HomeTodayView
              profile={profile}
              totalAnsweredPersonal={totalAnsweredPersonal}
              onNavigateTab={(t) => setActiveTab(t)}
              onOpenModule={handleOpenModule}
              onToggleLaBan14Task={(taskId) => {
                const current = profile.laBan14CompletedIds || [];
                const next = current.includes(taskId)
                  ? current.filter((id) => id !== taskId)
                  : [...current, taskId];
                applyProfileChange({ ...profile, laBan14CompletedIds: next }, false);
              }}
              onAddMeaningfulDay={(entry: MeaningfulDayEntry) => {
                const current = profile.meaningfulDays || [];
                applyProfileChange({ ...profile, meaningfulDays: [entry, ...current] }, false);
              }}
            />
          )}

          {activeTab === 'explore' && (
            <ExploreSurveyView
              profile={profile}
              activeModule={activeModule}
              initialQuestionId={initialQuestionId}
              onSelectModule={(modId) => {
                setActiveModule(modId);
                setInitialQuestionId(null);
              }}
              onUpdateAnswer={handleUpdateAnswer}
              onUpdateValuePriorities={handleUpdateValuePriorities}
              onUpdateBoundary={handleUpdateBoundary}
              onSaveAndExitToProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileReportView
              profile={profile}
              draftReport={reportStore.draftReport}
              confirmedReport={reportStore.confirmedReport}
              hasUnconfirmedChanges={reportStore.hasUnconfirmedChanges}
              onUpdateSupportVerification={(patch: Partial<SupportVerifications>) => {
                const nextVer = { ...(profile.supportVerifications || {}), ...patch };
                applyProfileChange({ ...profile, supportVerifications: nextVer }, false);
              }}
              onUpdateCareerChoice={(suggestionId, choice) => {
                const nextChoices = { ...(profile.careerChoices || {}), [suggestionId]: choice };
                applyProfileChange({ ...profile, careerChoices: nextChoices }, false);
              }}
              onUpdateCustomDirection={(customTitle) => {
                applyProfileChange({ ...profile, customCareerDirection: customTitle }, false);
              }}
              onConfirmStudentReview={(review: StudentReviewState) => {
                const nextProfile = { ...profile, studentReview: review };
                setProfile(nextProfile);
                const nextConfirmed = generateInternalReport(nextProfile, {
                  reportVersion: `v1.${Date.now().toString().slice(-3)}-confirmed`,
                  isDraftAfterEdit: false,
                });
                setReportStore({
                  confirmedReport: nextConfirmed,
                  draftReport: nextConfirmed,
                  hasUnconfirmedChanges: false,
                });
              }}
              onAddSourceVerification={(record: SourceVerificationRecord) => {
                const nextList = [record, ...(profile.sourceVerifications || [])];
                applyProfileChange({ ...profile, sourceVerifications: nextList }, false);
              }}
              onJumpToModule={handleOpenModule}
              onOpenEmergencySupport={() => setActiveTab('support')}
            />
          )}

          {activeTab === 'plan' && (
            <ActionPlanView
              profile={profile}
              draftReport={reportStore.draftReport}
              confirmedReport={reportStore.confirmedReport}
              onAddActionItem={(item: ActionPlanItem) => {
                const nextPlan = [...(profile.actionPlan || []), item];
                applyProfileChange({ ...profile, actionPlan: nextPlan }, false);
              }}
              onUpdateActionStatus={(id: string, status: ActionTaskStatus) => {
                const nextPlan = (profile.actionPlan || []).map((p) =>
                  p.id === id ? { ...p, status } : p
                );
                applyProfileChange({ ...profile, actionPlan: nextPlan }, false);
              }}
              onDeleteActionItem={(id: string) => {
                const nextPlan = (profile.actionPlan || []).filter((p) => p.id !== id);
                applyProfileChange({ ...profile, actionPlan: nextPlan }, false);
              }}
              onAddEvidencePassport={(item: EvidencePassportItem) => {
                const nextEv = [item, ...(profile.evidencePassport || [])];
                applyProfileChange({ ...profile, evidencePassport: nextEv }, false);
              }}
              onDeleteEvidencePassport={(id: string) => {
                const nextEv = (profile.evidencePassport || []).filter((e) => e.id !== id);
                applyProfileChange({ ...profile, evidencePassport: nextEv }, false);
              }}
              onUpdateEmpathyTriangle={(sheet: EmpathyTriangleSheet) => {
                applyProfileChange({ ...profile, empathyTriangle: sheet }, false);
              }}
            />
          )}

          {activeTab === 'me' && (
            <MePrivateSpaceView
              profile={profile}
              report={reportStore.draftReport}
              theme={theme}
              fontScale={fontScale}
              reduceMotion={reduceMotion}
              researchSubmissions={researchSubmissions}
              onToggleTheme={setTheme}
              onChangeFontScale={setFontScale}
              onToggleReduceMotion={setReduceMotion}
              onClearModuleAnswers={handleClearModuleAnswers}
              onDeleteEntireProfile={handleDeleteEntireProfile}
              onResetToDemoProfile={() => handleStartDemo(profile.grade || '11')}
              onSubmitAnonymousResearchM={(sub) => {
                setResearchSubmissions((prev) => [...prev, sub]);
              }}
              onClearResearchRepository={() => setResearchSubmissions([])}
              onOpenEmergencySupport={() => setActiveTab('support')}
            />
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION 5 MỤC (Chỉ hiển thị dưới lg để tối ưu thao tác ngón cái trên di động) */}
      <nav
        aria-label="Điều hướng chính 5 mục"
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--lb-card)]/95 backdrop-blur-md border-t border-[var(--lb-border)] px-2 py-1.5"
      >
        <div className="max-w-xl mx-auto grid grid-cols-5 gap-1">
          {navItems.map((nav) => {
            const Icon = nav.icon;
            const active = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveTab(nav.id)}
                className={`min-h-[46px] py-1 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-bold lb-transition ${
                  active
                    ? 'bg-[var(--lb-primary)] text-white dark:text-[#0B1514]'
                    : 'text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate whitespace-nowrap">{nav.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
