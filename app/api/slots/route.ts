import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const SLOT_DURATION_MIN = 60;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const DAYS_AHEAD = 14;
const TZ = 'Asia/Seoul';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

function generateSlots(busyPeriods: { start: string; end: string }[]) {
  const slots: { id: string; datetime: string; label: string }[] = [];
  const now = new Date();

  for (let d = 1; d <= DAYS_AHEAD; d++) {
    const checkDate = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    const dateKey = checkDate.toLocaleDateString('en-CA', { timeZone: TZ }); // YYYY-MM-DD
    const dow = new Date(`${dateKey}T12:00:00+09:00`).getDay();
    if (dow === 0 || dow === 6) continue; // 주말 제외

    for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
      const slotStart = new Date(`${dateKey}T${String(hour).padStart(2, '0')}:00:00+09:00`);
      const slotEnd = new Date(slotStart.getTime() + SLOT_DURATION_MIN * 60 * 1000);

      const isBusy = busyPeriods.some((b) =>
        slotStart.getTime() < new Date(b.end).getTime() &&
        slotEnd.getTime() > new Date(b.start).getTime()
      );

      if (!isBusy) {
        const [, m, day] = dateKey.split('-').map(Number);
        const ampm = hour < 12 ? '오전' : '오후';
        const h12 = hour % 12 || 12;
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

        slots.push({
          id: `slot-${slotStart.getTime()}`,
          datetime: slotStart.toISOString(),
          label: `${m}월 ${day}일 (${weekdays[dow]}) ${ampm} ${h12}:00`,
        });
      }
    }
  }
  return slots;
}

export async function GET(request: NextRequest) {
  const uuid = request.nextUrl.searchParams.get('uuid');
  if (!uuid) return NextResponse.json({ error: 'uuid required' }, { status: 400 });

  const db = createServerClient();
  const { data: candidate, error } = await db
    .from('candidates')
    .select('status, round1_interviewer_email, round2_interviewer_email')
    .eq('uuid', uuid)
    .single();

  if (error || !candidate) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const interviewerEmail =
    candidate.status === '1차면접'
      ? candidate.round1_interviewer_email
      : candidate.round2_interviewer_email;

  if (!interviewerEmail) return NextResponse.json({ slots: [] });

  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + DAYS_AHEAD * 24 * 60 * 60 * 1000).toISOString();

    const res = await calendar.freebusy.query({
      requestBody: { timeMin, timeMax, timeZone: TZ, items: [{ id: interviewerEmail }] },
    });

    const calData = res.data.calendars?.[interviewerEmail];
    const errors = calData?.errors ?? [];

    if (errors.length > 0) {
      console.error('FreeBusy error:', errors);
      return NextResponse.json({ slots: [], calendarError: errors[0].reason });
    }

    const busyPeriods = (calData?.busy ?? []) as { start: string; end: string }[];
    const slots = generateSlots(busyPeriods);
    return NextResponse.json({ slots, interviewerEmail });
  } catch (err) {
    console.error('slots API error:', err);
    return NextResponse.json({ slots: [], calendarError: 'api_error' }, { status: 500 });
  }
}
