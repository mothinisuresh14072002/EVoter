import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('evoter_session');

  // Verify the voter has an active anonymous session
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized. No active voting session.' }, { status: 401 });
  }

  const { encryptedBallot } = await request.json();

  if (!encryptedBallot) {
    return NextResponse.json({ error: 'Invalid ballot payload.' }, { status: 400 });
  }

  // MVP Mock: Store the encrypted ballot in a secure bulletin board / database.
  // We DO NOT store the voter's identity alongside the ballot.
  // Once the session credential is used, it should be marked as consumed in the DB.
  
  // Clear the voting session to prevent double-voting
  const response = NextResponse.json({ 
    success: true, 
    receiptId: 'R-' + Math.random().toString(36).substring(2, 10).toUpperCase() 
  });
  
  response.cookies.delete('evoter_session');

  return response;
}
