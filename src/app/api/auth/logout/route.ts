import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete('google_tokens');
  
  return Response.json({ success: true });
}
