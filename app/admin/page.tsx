'use client';

import { useState, useEffect } from 'react';
import { Plus, X, ChevronRight, MessageSquare, Star, User, Phone, Mail, Link, CheckCircle } from 'lucide-react';
import { type Candidate, type CandidateStatus, type FeedbackItem } from '@/lib/mockData';

const STATUS_OPTIONS: { value: CandidateStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: '서류심사중', label: '서류 심사' },
  { value: '1차면접', label: '1차 면접' },
  { value: '2차면접', label: '2차 면접' },
  { value: '최종합격', label: '최종 합격' },
  { value: '불합격', label: '불합격' },
];

const STATUS_COLORS: Record<CandidateStatus, string> = {
  '서류심사중': 'bg-amber-50 text-amber-700 border-amber-200',
  '1차면접': 'bg-blue-50 text-blue-700 border-blue-200',
  '2차면접': 'bg-purple-50 text-purple-700 border-purple-200',
  '최종합격': 'bg-green-50 text-green-700 border-green-200',
  '불합격': 'bg-gray-100 text-gray-500 border-gray-200',
};

const VERDICT_COLORS: Record<string, string> = {
  '합격': 'text-green-600',
  '불합격': 'text-red-500',
  '보류': 'text-amber-500',
};

function RatingBadge({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${value === '상' ? 'text-[#0f35f2]' : value === '중' ? 'text-gray-600' : 'text-gray-400'}`}>
        {value}
      </span>
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: FeedbackItem }) {
  const isRound1 = feedback.round === 1;
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500">{feedback.round}차 면접 피드백 — {feedback.interviewer_name}</span>
        <span className={`text-xs font-bold ${VERDICT_COLORS[feedback.verdict]}`}>{feedback.verdict}</span>
      </div>
      <div className="space-y-1">
        {isRound1 ? (
          <>
            <RatingBadge label="직무 역량" value={feedback.competency} />
            <RatingBadge label="커뮤니케이션" value={feedback.communication} />
            <RatingBadge label="업계 이해도" value={feedback.industry_understanding} />
            <RatingBadge label="태도" value={feedback.attitude} />
          </>
        ) : (
          <>
            <RatingBadge label="컬처핏" value={feedback.culture_fit} />
            <RatingBadge label="창의성" value={feedback.creativity} />
            <RatingBadge label="브랜드 철학" value={feedback.brand_philosophy} />
            <RatingBadge label="팀 어울림" value={feedback.team_fit} />
          </>
        )}
      </div>
      {feedback.comment && (
        <p className="text-xs text-gray-600 border-t border-gray-200 pt-2 leading-relaxed">
          {feedback.comment}
        </p>
      )}
    </div>
  );
}

function DetailPanel({ candidate, onClose, onStatusChange }: { candidate: Candidate; onClose: () => void; onStatusChange: (uuid: string, status: CandidateStatus) => void }) {
  const feedbackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/feedback/${candidate.uuid}`;

  function copyLink(round: 1 | 2) {
    navigator.clipboard.writeText(`${feedbackUrl}/${round}`);
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h2 className="font-bold text-lg text-black">{candidate.name}</h2>
          <p className="text-sm text-gray-500">{candidate.position}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Status Badge */}
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[candidate.status]}`}
          >
            {candidate.status}
          </span>
        </div>

        {/* Basic Info */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">기본 정보</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-gray-400" />
              <span>지원일: {new Date(candidate.created_at).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>
        </div>

        {/* Interview Schedule */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">면접 일정</p>
          <div className="space-y-2">
            {candidate.round1_scheduled_at ? (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-[#0f35f2]" />
                <span className="text-gray-600">
                  1차: {new Date(candidate.round1_scheduled_at).toLocaleString('ko-KR', {
                    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">1차 면접 일정 미확정</p>
            )}
            {candidate.round2_scheduled_at && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-[#0f35f2]" />
                <span className="text-gray-600">
                  2차: {new Date(candidate.round2_scheduled_at).toLocaleString('ko-KR', {
                    month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback Links */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">면접관 피드백 링크</p>
          <div className="space-y-2">
            {([1, 2] as const).map((round) => (
              <button
                key={round}
                onClick={() => copyLink(round)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 hover:border-[#0f35f2] hover:bg-blue-50 transition-all text-sm group"
              >
                <span className="text-gray-600 group-hover:text-[#0f35f2]">{round}차 면접 피드백 링크</span>
                <Link className="w-4 h-4 text-gray-400 group-hover:text-[#0f35f2]" />
              </button>
            ))}
          </div>
        </div>

        {/* Candidate Message */}
        {candidate.message && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0f35f2]" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">지원자 메시지</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{candidate.message}</p>
            </div>
          </div>
        )}

        {/* Feedbacks */}
        {candidate.feedbacks && candidate.feedbacks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#0f35f2]" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">면접 평가</p>
            </div>
            {candidate.feedbacks.map((fb, i) => (
              <FeedbackCard key={i} feedback={fb} />
            ))}
          </div>
        )}
      </div>

      {/* Panel Footer */}
      <div className="px-6 py-4 border-t border-gray-100 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">상태 변경</p>
        <div className="grid grid-cols-3 gap-2">
          {(['서류심사중', '1차면접', '2차면접', '최종합격', '불합격'] as CandidateStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(candidate.uuid, s)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                candidate.status === s
                  ? STATUS_COLORS[s]
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<CandidateStatus | 'all'>('all');
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', position: '' });
  const [formLoading, setFormLoading] = useState(false);

  async function handleStatusChange(uuid: string, status: CandidateStatus) {
    await fetch(`/api/candidates/${uuid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setCandidates((prev) => prev.map((c) => c.uuid === uuid ? { ...c, status } : c));
    setSelected((prev) => prev?.uuid === uuid ? { ...prev, status } : prev);
  }

  async function handleRegister() {
    const { name, email, phone, position } = formData;
    if (!name || !email || !phone || !position) return;
    setFormLoading(true);
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const newCandidate = await res.json();
      setCandidates((prev) => [newCandidate, ...prev]);
      setFormData({ name: '', email: '', phone: '', position: '' });
      setShowForm(false);
    }
    setFormLoading(false);
  }

  useEffect(() => {
    setMounted(true);
    fetch('/api/candidates')
      .then((r) => r.json())
      .then((data) => setCandidates(data ?? []))
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? candidates : candidates.filter((c) => c.status === filter);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <img src="/domo-logo-black.png" alt="DOMO" className="h-7 w-auto" />
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-600">채용 관리</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0f35f2] text-white rounded-lg text-sm font-semibold hover:bg-[#001e89] transition-colors"
          >
            <Plus className="w-4 h-4" />
            지원자 등록
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {STATUS_OPTIONS.slice(1).map((s) => {
            const count = candidates.filter((c) => c.status === s.value).length;
            return (
              <div key={s.value} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-black">{count}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 mb-4 w-fit">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === opt.value
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {opt.label}
              <span className="ml-1.5 text-xs text-gray-400">
                {opt.value === 'all' ? candidates.length : candidates.filter((c) => c.status === opt.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Candidate Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">해당 단계의 지원자가 없습니다.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">이름</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">포지션</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">상태</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">지원일</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">메시지</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.uuid}
                    onClick={() => setSelected(c)}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors last:border-0"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-sm text-black">{c.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{c.position}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[c.status]}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.message && (
                        <MessageSquare className="w-4 h-4 text-[#0f35f2]" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Detail Panel */}
      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setSelected(null)}
          />
          <DetailPanel candidate={selected} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
        </>
      )}

      {/* Register Form (simple modal) */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowForm(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">지원자 등록</h3>
                <button onClick={() => setShowForm(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: '이름', key: 'name', placeholder: '홍길동' },
                  { label: '이메일', key: 'email', placeholder: 'example@email.com' },
                  { label: '연락처', key: 'phone', placeholder: '010-0000-0000' },
                  { label: '포지션', key: 'position', placeholder: 'SNS 콘텐츠 매니저' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={formData[field.key as keyof typeof formData]}
                      onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f35f2] focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleRegister}
                disabled={formLoading}
                className="mt-5 w-full py-3 bg-[#0f35f2] text-white rounded-xl font-semibold text-sm hover:bg-[#001e89] transition-colors disabled:opacity-50"
              >
                {formLoading ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
