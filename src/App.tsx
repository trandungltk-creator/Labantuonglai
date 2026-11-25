/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Sun,
  BookOpen,
  UserCheck,
  Calendar,
  User,
  PhoneCall,
  Sparkles,
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
const STORAGE_KEY_RESEARCH_M = 'laban_research_repo_m_2_0_1'; // Tách kho hoàn toàn khỏi profile (P05)

type MainTab = 'today' | 'explore' | 'profile' | 'plan' | 'me' | 'support';

export default function App() {
  // Kiểm tra query ?autostart=1 hoặc ?tab=...
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
        // Chỉ khôi phục nếu đúng phiên bản questionVersion 2.0 và ruleVersion 2.0.1 (Quy tắc mục A.5 & P02)
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

  // Kho nghiên cứu độc lập M (Không gắn với profile)
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

  // Đồng bộ theme, fontScale, reduceMotion vào DOM
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

  // Lưu profile cục bộ khi đã qua onboarding
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

  // Đếm tổng số mục cá nhân (A–O trừ M = 194 mục) đã có phản hồi (kể cả U/X)
  const totalAnsweredPersonal = useMemo(() => {
    let count = 0;
    for (const q of QUESTIONS_DB.questions) {
      if (q.module === 'M') continue;
      const a = profile.answers[q.id];
      if (a !== null && a !== undefined) {
        if (typeof a === 'string' && a !== '') count += 1;
        else if (Array.isArray(a) && a.length > 0) count += 1;
        else if (typeof a === 'object' && !Array.isArray(a)) {
          if (q.type === 'paired_observation' && ((a as PairedObservationAnswer).self || (a as PairedObservationAnswer).observer)) {
            count += 1;
          } else if (q.type === 'practice_rubric' && (a as PracticeRubricAnswer).score) {
            count += 1;
          } else if (q.type === 'private_reflection' && ((a as PrivateReflectionAnswer).shareConsent || (a as PrivateReflectionAnswer).keepOnPaperOnly)) {
            count += 1;
          }
        }
      }
    }
    return count;
  }, [profile.answers]);

  // Helper cập nhật profile và tự động tạo dự thảo báo cáo mới mà không ghi đè bản đã xác nhận (U04)
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

  // Các hành động từ Onboarding
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

  // Cập nhật câu trả lời khảo sát
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

  // Chuyển nhanh tới một phân hệ / câu hỏi trong Khám phá
  const handleOpenModule = (moduleId: ModuleId, qId?: string) => {
    setActiveModule(moduleId === 'M' ? 'A' : moduleId);
    setInitialQuestionId(qId || null);
    setActiveTab('explore');
  };

  // Xóa dữ liệu từng phân hệ hoặc xóa sạch hồ sơ (P03)
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

  // Nếu chưa qua Onboarding và không đang mở màn hình khẩn cấp
  if (!hasCompletedOnboarding && activeTab !== 'support') {
    return (
      <OnboardingPrivacyView
        currentGrade={profile.grade}
        onStartDemo={handleStartDemo}
        onStartNewProfile={handleStartNewProfile}
        onOpenEmergencySupport={() => setActiveTab('support')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--lb-bg)] text-[var(--lb-text)] flex flex-col pb-24">
      {/* HEADER CỐ ĐỊNH: TÊN ỨNG DỤNG, NHÃN DEMO (U05), VÀ NÚT "EM CẦN HỖ TRỢ" LUÔN TRUY CẬP ĐƯỢC */}
      <header className="sticky top-0 z-40 bg-[var(--lb-card)]/95 backdrop-blur-xs border-b border-[var(--lb-border)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A] flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base tracking-tight">LA BÀN TƯƠNG LAI</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--lb-bg)] border border-[var(--lb-border)] text-[var(--lb-muted)]">
                  2.0.1 Offline
                </span>
                {profile.isDemo && (
                  <span
                    data-testid="demo-badge"
                    className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#8A5A16]/15 text-[#8A5A16] dark:text-[#E5B567] border border-[#8A5A16]/30"
                  >
                    DEMO · Dữ liệu giả lập
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--lb-muted)] hidden sm:block">
                Mỗi trải nghiệm, một bước hiểu mình · Không gọi AI · Không thu thập định danh
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHasCompletedOnboarding(false)}
              className="min-h-[44px] px-3 py-1.5 rounded-xl border border-[var(--lb-border)] text-xs font-semibold text-[var(--lb-muted)] hover:border-[var(--lb-primary)] hidden md:flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giới thiệu & Quyền riêng tư</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
                activeTab === 'support' || profile.confirmedSafetyPause
                  ? 'bg-[#B42318] text-white border-transparent'
                  : 'border-[#B42318] text-[#B42318] dark:border-[#F28B82] dark:text-[#F28B82] hover:bg-[#B42318]/5'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Trợ giúp (111 / 115 / 113)</span>
            </button>
          </div>
        </div>
      </header>

      {/* NỘI DUNG CHÍNH */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
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

      {/* BOTTOM NAVIGATION 5 MỤC CHUẨN MỤC 2: HÔM NAY | KHÁM PHÁ | HỒ SƠ | KẾ HOẠCH | EM */}
      <nav
        aria-label="Điều hướng chính 5 mục"
        className="fixed bottom-0 inset-x-0 z-40 bg-[var(--lb-card)] border-t border-[var(--lb-border)] px-2 py-1.5"
      >
        <div className="max-w-3xl mx-auto grid grid-cols-5 gap-1">
          {[
            { id: 'today' as const, label: 'Hôm nay', icon: Sun },
            { id: 'explore' as const, label: 'Khám phá', icon: BookOpen },
            { id: 'profile' as const, label: 'Hồ sơ', icon: UserCheck },
            { id: 'plan' as const, label: 'Kế hoạch', icon: Calendar },
            { id: 'me' as const, label: 'Em', icon: User },
          ].map((nav) => {
            const Icon = nav.icon;
            const active = activeTab === nav.id;
            return (
              <button
                key={nav.id}
                type="button"
                onClick={() => setActiveTab(nav.id)}
                className={`min-h-[48px] py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-colors ${
                  active
                    ? 'bg-[#006B60] dark:bg-[#78D9C7] text-white dark:text-[#101C1A]'
                    : 'text-[var(--lb-muted)] hover:text-[var(--lb-text)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{nav.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
