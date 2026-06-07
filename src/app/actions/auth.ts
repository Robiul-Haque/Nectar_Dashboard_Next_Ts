'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server Action to reliably clear authentication cookies and redirect.
 */
export async function logoutAction() {
    const cookieStore = await cookies();
    
    // 1. Clear the cookie on the server side
    cookieStore.delete('accessToken');
    
    // 2. Perform the redirect - this is handled by Next.js and is very reliable
    redirect('/login');
}