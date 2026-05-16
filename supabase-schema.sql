create table candidates (
  uuid text primary key,
  name text not null,
  email text not null,
  phone text not null,
  position text not null,
  status text not null default '서류심사중',
  created_at timestamptz default now(),
  message text,
  note text,
  round1_interviewer_email text,
  round1_scheduled_at timestamptz,
  round2_interviewer_email text,
  round2_scheduled_at timestamptz
);

create table feedbacks (
  id uuid primary key default gen_random_uuid(),
  candidate_uuid text references candidates(uuid) on delete cascade,
  round integer not null,
  interviewer_name text not null,
  verdict text not null,
  comment text,
  competency text,
  communication text,
  industry_understanding text,
  attitude text,
  culture_fit text,
  creativity text,
  brand_philosophy text,
  team_fit text,
  submitted_at timestamptz default now()
);

alter table candidates disable row level security;
alter table feedbacks disable row level security;

insert into candidates (uuid, name, email, phone, position, status, created_at, message, round1_interviewer_email) values
('candidate-001', '김민준', 'minjun@example.com', '010-1234-5678', 'SNS 콘텐츠 매니저', '1차면접', '2026-05-10T09:00:00Z', 'DOMO에서 진행하는 ESG 관련 프로젝트에 대해 더 알고 싶습니다.', 'robin@domo.co.kr'),
('candidate-002', '이수연', 'sooyeon@example.com', '010-9876-5432', 'PR 전략 컨설턴트', '서류심사중', '2026-05-12T11:00:00Z', null, null),
('candidate-003', '박지훈', 'jihoon@example.com', '010-5555-7777', 'Brand Experience 기획자', '2차면접', '2026-05-08T15:00:00Z', '2차 인터뷰 전 포트폴리오 추가 제출이 필요할까요?', 'deuk@domo.co.kr');

update candidates
set round1_scheduled_at = '2026-05-15T10:00:00+09:00',
    round2_interviewer_email = 'deuk@domo.co.kr',
    round2_scheduled_at = '2026-05-22T15:00:00+09:00'
where uuid = 'candidate-003';

insert into feedbacks (candidate_uuid, round, interviewer_name, verdict, comment, competency, communication, industry_understanding, attitude) values
('candidate-001', 1, '김득현', '합격', '커뮤니케이션이 매끄럽고 업계 트렌드 이해도가 높음.', '상', '상', '중', '상'),
('candidate-003', 1, '김득현', '합격', '브랜드 경험 기획에 대한 깊은 이해도가 인상적.', '상', '중', '상', '상');
