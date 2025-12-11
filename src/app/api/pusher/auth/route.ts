import { NextRequest, NextResponse } from 'next/server';
import { getPusherServer } from '@/lib/pusher/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const socketId = data.get('socket_id') as string;
    const channelName = data.get('channel_name') as string;

    const pusher = getPusherServer();
    const authResponse = pusher.authorizeChannel(socketId, channelName);

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Auth failed' }, { status: 500 });
  }
}
