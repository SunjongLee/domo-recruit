'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Circle, Clock, MessageSquare, ChevronRight, ChevronDown, Building2, Users, Newspaper, Sparkles, Radio } from 'lucide-react';
import { STATUS_STEPS, getStatusStep, getStatusLabel, type Candidate } from '@/lib/mockData';
import SlotPicker, { type Slot } from './SlotPicker';

const SERVICES = [
  { icon: Radio, title: 'Public Awareness', desc: '주요 이슈를 둘러싼 정보·관점·대안 제시' },
  { icon: Users, title: 'SNS Engagement', desc: '브랜드와 사용자가 나누는 의미있는 대화' },
  { icon: Newspaper, title: 'Brand Journalism', desc: '브랜드의 진정성 있는 목소리를 독자에게' },
  { icon: Sparkles, title: 'Brand Experience', desc: '브랜드의 본질을 사용자에게 각인' },
  { icon: Building2, title: 'Connecting Discussions', desc: '이야기들이 넓고 깊게 확산되는 체계' },
];

const CLIENTS = ['코카-콜라', '한화그룹', '하나금융그룹', '크레이버', '구다이글로벌', 'LG전자', '한글과컴퓨터', '노션코리아', '폭스바겐그룹', '현대제철'];

const ROUND1_QUESTIONS = [
  '본인 소개 부탁드려요',
  '업무나 프로젝트에서 예상치 못한 어려움이나 실패를 겪었던 경험이 있나요?',
  '본인이 주도적으로 이끌었던 프로젝트에서 성과에 가장 기여했다고 생각하는 부분은 무엇인가요?',
  '향후 2-3년 내에 스스로 강화하고 싶은 역량은 무엇인가요?',
  '압박감이 큰 상황에서 팀/고객사와 어떻게 우선순위를 조정하고 소통하나요?',
  '최근 홍보/디지털커뮤니케이션 업계에서 가장 크게 체감하는 변화는 무엇이며, 이에 어떻게 대응하고 있나요?',
  '본인의 성격이나 가치관 중 AE 업무에 잘 맞는 부분은 무엇이라고 생각하나요?',
  '어떤 상황에서 업무 스트레스를 가장 크게 느끼며, 본인만의 극복 방법은 무엇인가요?',
  '본인이 생각하는 "좋은 조직문화"는 어떤 모습인가요?',
];

const ROUND2_QUESTION_GROUPS = [
  {
    category: '사람',
    items: [
      '인간 __NAME__ 님은 어떤 사람인가요?',
      '무엇을 좋아하고, 무엇을 싫어하나요?',
      '요즘 가장 관심이 가는 영역이 있다면 무엇인가요?',
      '강의를 한다면 어떤 주제로?',
      '스스로 생각하는 본인의 매력은?',
      '스스로 생각하는 본인의 비호감 포인트는?',
      '인생 후반전이 있다면 본인은?',
      '묘비 명에 쓰고 싶은 한 줄은?',
      '인생에서 행복을 주는 요소는?',
      '본인을 움직이는 한 단어는?',
    ],
  },
  {
    category: '과정',
    items: [
      '다른 행성에서 온 누군가에게 내 직업을 설명한다면?',
      '이 직업을 선택하는데 영향을 줬던 영화/드라마가 있을까요?',
      '참여했던 프로젝트 중 인생 프로젝트로 뽑을 수 있는 건?',
      '즐겨 듣는 노동요는 무엇인가요?',
      '인생에서 영감을 주는 사람 1명을 꼽는다면?',
    ],
  },
  {
    category: '브랜드 커뮤니케이션',
    items: [
      '브랜드가 할 수 있는 것은?',
      '브랜드가 할 수 없는 것은?',
      '어떤 브랜드 커뮤니케이터가 되고 싶나요?',
      '그 목표를 달성하기 위해 무엇을 지원해주면 3년을 당길 수 있을까요?',
      '도모에서 하고 싶은 것, 하기 싫은 것이 있다면?',
    ],
  },
  {
    category: '상상력',
    items: [
      '당신에게 5,000만원이라는 돈을 지원해준다면 어떤 브랜드 비즈니스를 할 것인가요?',
    ],
  },
];

export default function CandidatePage() {
  const params = useParams();
  const uuid = params?.uuid as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [slotConfirmed, setSlotConfirmed] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openRounds, setOpenRounds] = useState<Set<number>>(new Set());

  const toggleRound = (r: number) =>
    setOpenRounds((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });

  useEffect(() => {
    setMounted(true);
    fetch(`/api/candidate/${uuid}`)
      .then((r) => r.json())
      .then((c: Candidate) => {
        setCandidate(c);
        if (c.status === '1차면접') setOpenRounds(new Set([1]));
        else if (c.status === '2차면접') setOpenRounds(new Set([2]));
        if (c.message) {
          setMessage(c.message);
          setMessageSent(true);
        }
        if (c.round1_scheduled_at || c.round2_scheduled_at) {
          setSlotConfirmed(true);
        }
      })
      .catch(() => {});
  }, [uuid]);

  useEffect(() => {
    if (!candidate) return;
    const needsFetch =
      (candidate.status === '1차면접' && !candidate.round1_scheduled_at) ||
      (candidate.status === '2차면접' && !candidate.round2_scheduled_at);
    if (!needsFetch) return;

    setSlotsLoading(true);
    fetch(`/api/slots?uuid=${candidate.uuid}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        if (data.calendarError) setCalendarError(data.calendarError);
      })
      .catch(() => setCalendarError('network_error'))
      .finally(() => setSlotsLoading(false));
  }, [candidate]);

  if (!mounted || !candidate) return null;

  const currentStep = getStatusStep(candidate.status);
  const needsSlot = (candidate.status === '1차면접' && !candidate.round1_scheduled_at) ||
    (candidate.status === '2차면접' && !candidate.round2_scheduled_at);
  const scheduledAt = candidate.status === '1차면접'
    ? candidate.round1_scheduled_at
    : candidate.round2_scheduled_at;

  const sameDayBothRounds =
    !!candidate.round1_scheduled_at &&
    !!candidate.round2_scheduled_at &&
    new Date(candidate.round1_scheduled_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) ===
    new Date(candidate.round2_scheduled_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

  const showRound1Questions = candidate.status === '1차면접' || (candidate.status === '2차면접' && sameDayBothRounds);
  const showRound2Questions = candidate.status === '2차면접';

  async function handleSlotConfirm() {
    if (!selectedSlot) return;
    setBookingLoading(true);
    try {
      const res = await fetch('/api/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, datetime: selectedSlot.datetime }),
      });
      if (!res.ok) throw new Error('booking failed');
      setSlotConfirmed(true);
    } catch {
      alert('일정 확정 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setBookingLoading(false);
    }
  }

  async function handleMessageSubmit() {
    if (!message.trim()) return;
    await fetch(`/api/candidates/${uuid}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    setMessageSent(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#0f35f2] text-white">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/domo-logo-white.png" alt="DOMO" className="h-8 w-auto" />
          </div>
          <span className="text-sm opacity-80">채용 안내 포털</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Greeting */}
        <div>
          <p className="text-sm text-gray-500 mb-1">안녕하세요</p>
          <h1 className="text-2xl font-bold text-black">{candidate.name}님, 반갑습니다.</h1>
        </div>

        {/* Status Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">채용 진행 상황</p>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const isCompleted = currentStep > step.step;
              const isCurrent = currentStep === step.step;
              const isFinal = step.step === 4;
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-[#001e89] text-white'
                          : isCurrent
                          ? 'bg-[#0f35f2] text-white ring-4 ring-blue-100'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4" />
                      ) : isFinal && candidate.status === '불합격' ? (
                        <Circle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">{step.step}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        isCurrent ? 'text-[#0f35f2]' : isCompleted ? 'text-[#001e89]' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-6 ${
                        currentStep > step.step ? 'bg-[#001e89]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
            현재 <span className="font-semibold text-[#0f35f2]">{getStatusLabel(candidate.status)}</span> 단계입니다.
            {scheduledAt && !needsSlot && <> 인터뷰 일정이 확정되었습니다.</>}
          </p>
        </div>

        {/* Slot Selection */}
        {(needsSlot || slotConfirmed) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {getStatusLabel(candidate.status)} 일정
            </p>
            {scheduledAt && !needsSlot ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-[#0f35f2] shrink-0" />
                <div>
                  <p className="font-semibold text-black">
                    {new Date(scheduledAt).toLocaleString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      weekday: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">화상 인터뷰 링크는 인터뷰 전날 이메일로 전달됩니다.</p>
                </div>
              </div>
            ) : slotConfirmed && selectedSlot ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-[#0f35f2] shrink-0" />
                <div>
                  <p className="font-semibold text-black">{selectedSlot.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">일정이 확정되었습니다. 인터뷰 링크는 전날 이메일로 드립니다.</p>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-5">편하신 인터뷰 시간을 선택해 주세요.</p>
                {slotsLoading ? (
                  <div className="py-10 text-center text-sm text-gray-400">가능한 일정을 불러오는 중...</div>
                ) : calendarError ? (
                  <div className="py-6 text-center text-sm text-gray-400">
                    일정을 불러올 수 없습니다.<br />담당자에게 문의해 주세요.
                  </div>
                ) : slots.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-400">
                    현재 가능한 일정이 없습니다.<br />담당자에게 문의해 주세요.
                  </div>
                ) : (
                  <SlotPicker slots={slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
                )}
                <button
                  onClick={handleSlotConfirm}
                  disabled={!selectedSlot || bookingLoading}
                  className="mt-5 w-full py-3 rounded-xl bg-[#0f35f2] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#001e89] transition-colors"
                >
                  {bookingLoading ? '확정 중...' : '이 시간으로 확정하기'}
                </button>
              </>
            )}
          </div>
        )}

        {/* DOMO Company Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-[#001e89] px-6 py-6 text-white">
            <div className="flex items-center mb-3">
              <img src="/domo-logo-white.png" alt="DOMO" className="h-6 w-auto" />
            </div>
            <h2 className="text-xl font-bold leading-snug">
              찾아낼 답이 있다면,<br />도모가 있습니다
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-600 mb-6">
              도모는 2000년부터 브랜드와 사회를 연결해온 PR·커뮤니케이션 에이전시입니다.
              단단한 전략과 맥락있는 크리에이티브로, LG·코카콜라·한화 등 국내외 주요 브랜드와 함께 해왔습니다.
            </p>

            {/* 5대 서비스 */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">5대 서비스</p>
            <div className="grid grid-cols-1 gap-2 mb-6">
              {SERVICES.map((svc) => (
                <div key={svc.title} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                  <svc.icon className="w-4 h-4 text-[#0f35f2] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-black">{svc.title}</p>
                    <p className="text-xs text-gray-500">{svc.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Clients */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">주요 클라이언트</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {CLIENTS.map((c) => (
                <span key={c} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                  {c}
                </span>
              ))}
            </div>

            {/* Interview Process */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">인터뷰 프로세스</p>
            <div className="flex items-center gap-2 mb-5">
              {[
                { label: '1차 인터뷰', desc: '직무 역량 / 업무 태도 (60분)' },
                { label: '2차 인터뷰', desc: '컬처핏 / 사람에 대한 이야기 (60분)' },
                { label: '최종 결과', desc: '이메일 통보' },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex items-center gap-2 flex-1">
                  <div className="flex-1 text-center">
                    <p className="text-xs font-semibold text-[#0f35f2]">{step.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{step.desc}</p>
                  </div>
                  {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />}
                </div>
              ))}
            </div>

            {/* Question Guides — 현재 단계에 해당하는 차수만 표시 */}
            {(showRound1Questions || showRound2Questions) && (
              <div className="space-y-2">
                {showRound1Questions && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleRound(1)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0f35f2]">1차 인터뷰</span>
                        <span className="text-xs text-gray-400">에선 이런 이야기를 해요</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${openRounds.has(1) ? 'rotate-180' : ''}`} />
                    </button>
                    {openRounds.has(1) && (
                      <div className="px-4 py-4 space-y-2.5">
                        {ROUND1_QUESTIONS.map((q, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="text-xs font-bold text-[#0f35f2] w-5 shrink-0 mt-0.5">{i + 1}</span>
                            <span className="text-xs text-gray-600 leading-relaxed">{q}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showRound2Questions && (
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleRound(2)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0f35f2]">2차 인터뷰</span>
                        <span className="text-xs text-gray-400">에선 이런 이야기를 해요</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${openRounds.has(2) ? 'rotate-180' : ''}`} />
                    </button>
                    {openRounds.has(2) && (
                      <div className="px-4 py-4 space-y-5">
                        {ROUND2_QUESTION_GROUPS.map((group) => (
                          <div key={group.category}>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group.category}</p>
                            <div className="space-y-2">
                              {group.items.map((q, i) => (
                                <div key={i} className="flex gap-2 items-start">
                                  <div className="w-1 h-1 rounded-full bg-[#0f35f2] mt-1.5 shrink-0" />
                                  <span className="text-xs text-gray-600 leading-relaxed">{q.replace('__NAME__', candidate.name)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DOMO Deep Dive */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">도모를 더 알아보세요</p>
          </div>
          <div className="p-6 space-y-8">

            {/* Why DOMO */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Why DOMO</p>
              <p className="text-sm font-bold text-[#001e89] mb-4">단단한 전략과 맥락있는 크리에이티브로<br />최적의 솔루션을 제안합니다.</p>
              <div className="space-y-3">
                {[
                  { label: 'Lead Agency', desc: '커뮤니케이션 기획자들이 50개 파트너사와 최고의 결과를 만듭니다.' },
                  { label: 'ESG Initiative', desc: '의미 있는 아젠다를 콘텐츠로 만들고 선한 영향력을 확장합니다.' },
                  { label: 'Honors & Awards', desc: '2001년부터 현재까지 글로벌 PR어워드에서 19개 프로젝트가 노미네이트 또는 수상.' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0f35f2] mt-1.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-black">{item.label} </span>
                      <span className="text-xs text-gray-500">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">History of DOMO</p>
              <div className="space-y-2">
                {[
                  { year: '2000', desc: '글로벌 PR그룹 옴니콤의 전략 컨설팅 조직으로 도모 커뮤니케이션 설립' },
                  { year: '2001', desc: '국내 최초 인터랙티브 PR부문 아시아 PR위크 어워드 수상' },
                  { year: '2005', desc: '디지털PR 프랙티스 조직 FUSE 설립' },
                  { year: '2013', desc: '美 브로더파트너즈와 제휴, 종합 PR서비스 제공' },
                  { year: '2019', desc: 'ESG 캠페인 사업부 신설' },
                  { year: '2024', desc: "내일을 위한 오늘의 매거진 'ESG.ONL' 론칭" },
                ].map((item) => (
                  <div key={item.year} className="flex gap-3 items-start">
                    <span className="text-xs font-bold text-[#0f35f2] w-10 shrink-0">{item.year}</span>
                    <span className="text-xs text-gray-500 leading-relaxed">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Awards</p>
              <div className="space-y-2">
                {[
                  { year: '2025', desc: 'PR어워드 아시아 퍼시픽 — 기업간행물 부문 [LG사이언스파크] 수상' },
                  { year: '2025', desc: 'PR어워드 아시아 퍼시픽 — 금융 커뮤니케이션 부문 [SC제일은행 부귀화] 수상' },
                  { year: '2024', desc: 'PR어워드 아시아 퍼시픽 — 금융 커뮤니케이션 부문 [KB라이프생명] 수상' },
                  { year: '2022', desc: '대한민국소통어워즈 — ESG콘텐츠 부문 [한화 커뮤니케이션] 수상' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="text-xs font-bold text-[#0f35f2] w-10 shrink-0">{item.year}</span>
                    <span className="text-xs text-gray-500 leading-relaxed">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DOMO IP */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">DOMO Media IP</p>
              <p className="text-xs text-gray-500 mb-3">버티컬 전문성을 직접 미디어로 만듭니다.</p>
              <div className="space-y-3">
                {/* ESG.ONL */}
                <a href="https://esgonl.kr" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#1a7a3c] text-white hover:opacity-90 transition-opacity">
                  <div>
                    <p className="text-sm font-bold tracking-tight">ESG.ONL</p>
                    <p className="text-xs opacity-75 mt-0.5">ESG 실무자 700명 이상이 구독하는 전문 매거진</p>
                    <p className="text-xs opacity-60 mt-1">ESG 버티컬 전문 미디어 · esgonl.kr</p>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
                </a>
                {/* GEO.ONL */}
                <a href="https://thegeo.onl" target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-[#1a1a1a] text-white hover:opacity-90 transition-opacity">
                  <div>
                    <p className="text-sm font-bold tracking-tight">GEO.ONL</p>
                    <p className="text-xs opacity-75 mt-0.5">GEO 전문가들의 관점으로 읽는 AI Search 인사이트</p>
                    <p className="text-xs opacity-60 mt-1">AI Search 버티컬 전문 미디어 · thegeo.onl</p>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Message Box */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-[#0f35f2]" />
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">도모에게 한마디</p>
          </div>
          {messageSent ? (
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-sm font-medium text-[#0f35f2] mb-1">메시지가 전달되었습니다.</p>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-3">
                도모에게 궁금한 점이나 전달하고 싶은 내용이 있으시면 자유롭게 남겨주세요.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="예: DOMO의 ESG 프로젝트가 궁금합니다. / 포트폴리오를 추가로 보내도 될까요?"
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0f35f2] focus:border-transparent placeholder:text-gray-300"
              />
              <button
                onClick={handleMessageSubmit}
                disabled={!message.trim()}
                className="mt-3 w-full py-3 rounded-xl bg-[#0f35f2] text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#001e89] transition-colors text-sm"
              >
                전달하기
              </button>
            </>
          )}
        </div>
      </main>

      <footer className="max-w-2xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-gray-400">
          <span className="font-bold tracking-widest">*</span> DOMO — 서울특별시 강남구 선릉로 652 4F
        </p>
      </footer>
    </div>
  );
}
