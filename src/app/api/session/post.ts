import { prisma } from '@/lib/prisma';
import { SessionSnapshotSchema } from '@/lib/schemas';
import { Task } from '@/lib/types';
import { SendResponse } from '@/utils/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/authOptions';

export async function POST_SESSION(req: Request, res: Response) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return SendResponse('You have to be logged in to save sessions', 401);
  }

  const user = session.user;
  const json = await req.json();
  const body = SessionSnapshotSchema.safeParse(json);

  if (user === null || user === undefined) {
    return SendResponse('You have to be logged in to save sessions', 401);
  }

  if (!body.success) {
    return SendResponse('You tried to save an invalid session', 400);
  }

  const sessionSnapshot = body.data.session;
  const cleanSnapshot = sessionSnapshot.map((task: Task) => {
    return { name: task.name, duration: task.duration };
  });

  // TODO: Handle case where user doesn't have an associated email

  const prismaUser = await prisma.user.findUnique({
    where: {
      email: user.email as string,
    },
  });

  if (!prismaUser) {
    return SendResponse(
      'You do not have a valid account for saving sessions',
      403
    );
  }

  const userId = prismaUser?.id;

  // This goes through all the database records which makes it very inefficient.
  // Try having the latest session's timestamp recorded somewhere instead.
  const latestSessionLog = await prisma.sessionLog.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  });

  if (latestSessionLog) {
    const latestLog = latestSessionLog[0];
    const now = new Date();
    const diff = now.getTime() - latestLog.createdAt.getTime();
    const diffInMins = Math.floor(diff / 1000 / 60);

    if (diffInMins < 5) {
      return SendResponse(
        'You must wait 5 minutes before saving another session',
        403
      );
    }
  }

  await prisma.sessionLog.create({
    data: {
      userId: userId,
      sessionSnapshot: JSON.stringify(cleanSnapshot), // ! The database can only store strings so this conversion is necessary
    },
  });

  console.log('[DB] Saved session snapshot');
  return SendResponse('Successfully saved latest session', 200);
}