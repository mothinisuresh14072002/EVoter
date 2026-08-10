import { NextResponse } from 'next/server';

// If this endpoint is opened directly in a browser, return to the sign-in UI
// instead of exposing a method-not-allowed page.
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/auth/digilocker', request.url));
}

export async function POST(request: Request) {
  // In a real application, this would interface securely with DigiLocker's OAuth API.
  // For the MVP prototype, we mock the verification and return an anonymous voting credential.
  
  const formData = await request.formData();
  const aadhaar = formData.get('aadhaar');
  const pin = formData.get('pin');

  // Basic validation mock
  if (!aadhaar || !pin) {
    return NextResponse.json(
      { error: 'Please enter your Aadhaar number and security PIN.' },
      { status: 400 }
    );
  }

  // Mock successful verification. Return JSON so the client can navigate after
  // the cookie has been set instead of trying to handle a fetch redirect.
  const response = NextResponse.json({ success: true });
  
  // Fake token representing the anonymous voting credential
  const mockVoterCredential = 'voter_cred_' + Math.random().toString(36).substring(2, 15);
  
  response.cookies.set({
    name: 'evoter_session',
    value: mockVoterCredential,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minute voting window
  });

  return response;
}
