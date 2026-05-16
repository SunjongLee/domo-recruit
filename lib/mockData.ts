export type CandidateStatus = '서류심사중' | '1차면접' | '2차면접' | '최종합격' | '불합격';

export interface FeedbackItem {
  round: 1 | 2;
  interviewer_name: string;
  verdict: '합격' | '불합격' | '보류';
  comment: string;
  // 1차 전용
  competency?: '상' | '중' | '하';
  communication?: '상' | '중' | '하';
  industry_understanding?: '상' | '중' | '하';
  attitude?: '상' | '중' | '하';
  // 2차 전용
  culture_fit?: '상' | '중' | '하';
  creativity?: '상' | '중' | '하';
  brand_philosophy?: '상' | '중' | '하';
  team_fit?: '상' | '중' | '하';
  submitted_at: string;
}

export interface Candidate {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: CandidateStatus;
  created_at: string;
  message?: string;
  round1_interviewer_email?: string;
  round1_scheduled_at?: string;
  round2_interviewer_email?: string;
  round2_scheduled_at?: string;
  note?: string;
  feedbacks?: FeedbackItem[];
}

export const MOCK_CANDIDATES: Candidate[] = [
  {
    uuid: 'candidate-001',
    name: '김민준',
    email: 'minjun@example.com',
    phone: '010-1234-5678',
    position: 'SNS 콘텐츠 매니저',
    status: '1차면접',
    created_at: '2026-05-10T09:00:00Z',
    message: 'DOMO에서 진행하는 ESG 관련 프로젝트에 대해 더 알고 싶습니다. 어떤 방향으로 발전시킬 계획인지 궁금합니다.',
    round1_interviewer_email: 'robin@domo.co.kr',
    round1_scheduled_at: undefined,
    feedbacks: [
      {
        round: 1,
        interviewer_name: '김득현',
        verdict: '합격',
        comment: '커뮤니케이션이 매끄럽고 업계 트렌드 이해도가 높음. 2차 인터뷰 추천.',
        competency: '상',
        communication: '상',
        industry_understanding: '중',
        attitude: '상',
        submitted_at: '2026-05-20T16:00:00Z',
      },
    ],
  },
  {
    uuid: 'candidate-002',
    name: '이수연',
    email: 'sooyeon@example.com',
    phone: '010-9876-5432',
    position: 'PR 전략 컨설턴트',
    status: '서류심사중',
    created_at: '2026-05-12T11:00:00Z',
  },
  {
    uuid: 'candidate-003',
    name: '박지훈',
    email: 'jihoon@example.com',
    phone: '010-5555-7777',
    position: 'Brand Experience 기획자',
    status: '2차면접',
    created_at: '2026-05-08T15:00:00Z',
    message: '2차 면접 전에 포트폴리오를 추가로 준비해야 할까요? 참고할 자료가 있으면 감사하겠습니다.',
    round1_interviewer_email: 'deuk@domo.co.kr',
    round1_scheduled_at: '2026-05-15T10:00:00+09:00',
    round2_interviewer_email: 'deuk@domo.co.kr',
    round2_scheduled_at: '2026-05-22T15:00:00+09:00',
    feedbacks: [
      {
        round: 1,
        interviewer_name: '김득현',
        verdict: '합격',
        comment: '브랜드 경험 기획에 대한 깊은 이해도와 창의적인 사고가 인상적. 2차 인터뷰 추천.',
        competency: '상',
        communication: '중',
        industry_understanding: '상',
        attitude: '상',
        submitted_at: '2026-05-15T12:00:00Z',
      },
    ],
  },
];

export function getMockCandidate(uuid: string): Candidate | undefined {
  return MOCK_CANDIDATES.find((c) => c.uuid === uuid);
}

export const MOCK_SLOTS = [
  { id: 'slot-1', datetime: '2026-05-21T10:00:00+09:00', label: '5월 21일 (목) 오전 10:00' },
  { id: 'slot-2', datetime: '2026-05-21T14:00:00+09:00', label: '5월 21일 (목) 오후 2:00' },
  { id: 'slot-3', datetime: '2026-05-22T10:00:00+09:00', label: '5월 22일 (금) 오전 10:00' },
  { id: 'slot-4', datetime: '2026-05-22T15:00:00+09:00', label: '5월 22일 (금) 오후 3:00' },
  { id: 'slot-5', datetime: '2026-05-26T11:00:00+09:00', label: '5월 26일 (화) 오전 11:00' },
];

export const STATUS_STEPS: { key: CandidateStatus | string; label: string; step: number }[] = [
  { key: '서류심사중', label: '서류 심사', step: 1 },
  { key: '1차면접', label: '1차 인터뷰', step: 2 },
  { key: '2차면접', label: '2차 인터뷰', step: 3 },
  { key: '최종합격', label: '최종 결과', step: 4 },
];

export function getStatusLabel(status: CandidateStatus): string {
  const map: Record<CandidateStatus, string> = {
    '서류심사중': '서류 심사',
    '1차면접': '1차 인터뷰',
    '2차면접': '2차 인터뷰',
    '최종합격': '최종 합격',
    '불합격': '불합격',
  };
  return map[status] ?? status;
}

export function getStatusStep(status: CandidateStatus): number {
  const map: Record<CandidateStatus, number> = {
    '서류심사중': 1,
    '1차면접': 2,
    '2차면접': 3,
    '최종합격': 4,
    '불합격': 4,
  };
  return map[status] ?? 1;
}
