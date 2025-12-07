import { NextResponse } from 'next/server';
import { SupabaseClient, User } from '@supabase/supabase-js';

class AdminAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type AdminUser = {
  user: User;
  role: string;
};

export async function requireAdmin(
  supabase: SupabaseClient,
  allowedRoles: string[] = ['ADMIN', 'DEVELOPER'],
): Promise<AdminUser> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AdminAuthError(401, 'Unauthorized');
  }

  const { data: appUser, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  const derivedRole = appUser?.role ?? (user as unknown as { role?: string })?.role;

  if (userError && !derivedRole) {
    throw new AdminAuthError(403, 'Forbidden');
  }

  if (!derivedRole || !allowedRoles.includes(derivedRole)) {
    throw new AdminAuthError(403, 'Forbidden');
  }

  return { user, role: derivedRole };
}

export function adminErrorResponse(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return null;
}
