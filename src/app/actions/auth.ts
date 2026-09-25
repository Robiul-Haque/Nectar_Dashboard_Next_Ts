'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server Action to reliably clear authentication cookies and redirect.
 */
export async function logoutAction() {
    const cookieStore = await cookies();

    // 1. Clear authentication cookies on the server side
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    cookieStore.set('accessToken', '', { maxAge: 0, path: '/' });
    cookieStore.set('refreshToken', '', { maxAge: 0, path: '/' });
    
    // 2. Perform the redirect to login page
    redirect('/login');
}