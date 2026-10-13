import { describe, it, expect, vi } from 'vitest';
import { GET as getUsers, POST as createUser } from '../../app/api/v1/admin/users/route';
import { PATCH as updateUser, DELETE as deleteUser } from '../../app/api/v1/admin/users/[id]/route';

describe('Admin Panel API Endpoints (/api/v1/admin/users)', () => {
  it('GET /api/v1/admin/users returns success response format', async () => {
    const req = new Request('http://localhost:3000/api/v1/admin/users');
    const res = await getUsers(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('POST /api/v1/admin/users validates missing required fields', async () => {
    const req = new Request('http://localhost:3000/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'incomplete@earthmind.gov' }),
    });
    const res = await createUser(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
  });
});
