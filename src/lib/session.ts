import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { SessionData } from '@/types';

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'zalen-gam-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function saveSession(session: IronSession<SessionData>, data: SessionData) {
  session.staffUser = data.staffUser;
  await session.save();
}

export async function destroySession(session: IronSession<SessionData>) {
  session.destroy();
}
