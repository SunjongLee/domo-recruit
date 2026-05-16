import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

const SLOT_DURATION_MIN = 60;
const TZ = 'Asia/Seoul';

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
}

export async function POST(request: NextRequest) {
  const { uuid, datetime } = await request.json();

  if (!uuid || !datetime) {
    return NextResponse.json({ error: 'uuid and datetime required' }, { status: 400 });
  }

  const db = createServerClient();
  const { data: candidate, error: fetchError } = await db
    .from('candidates')
    .select('name, email, phone, position, status, round1_interviewer_email, round2_interviewer_email')
    .eq('uuid', uuid)
    .single();

  if (fetchError || !candidate) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const interviewerEmail =
    candidate.status === '1차면접'
      ? candidate.round1_interviewer_email
      : candidate.round2_interviewer_email;

  if (!interviewerEmail) {
    return NextResponse.json({ error: 'no interviewer assigned' }, { status: 400 });
  }

  try {
    const auth = getAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    const startTime = new Date(datetime);
    const endTime = new Date(startTime.getTime() + SLOT_DURATION_MIN * 60 * 1000);

    const round = candidate.status === '1차면접' ? '1차' : '2차';

    const event = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: 'none',
      requestBody: {
        summary: `[도모 인터뷰] ${candidate.name} — ${candidate.position} (${round})`,
        description: `도모 채용 인터뷰\n\n지원자: ${candidate.name}\n포지션: ${candidate.position}\n이메일: ${candidate.email}\n연락처: ${candidate.phone}\n담당자: ${interviewerEmail}`,
        start: { dateTime: startTime.toISOString(), timeZone: TZ },
        end: { dateTime: endTime.toISOString(), timeZone: TZ },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 30 },
          ],
        },
      },
    });

    const scheduledField = candidate.status === '1차면접' ? 'round1_scheduled_at' : 'round2_scheduled_at';
    await db.from('candidates').update({ [scheduledField]: startTime.toISOString() }).eq('uuid', uuid);

    return NextResponse.json({ success: true, eventId: event.data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('book-slot error:', message);
    return NextResponse.json({ error: 'booking failed', detail: message }, { status: 500 });
  }
}
