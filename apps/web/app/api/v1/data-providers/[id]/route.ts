// ──────────────────────────────────────────────────────────────
// EarthMind PIOS — GET/PATCH/DELETE /api/v1/data-providers/[id]
// Single provider operations, enable/disable toggle & unregister
// ──────────────────────────────────────────────────────────────
export const dynamic = 'force-dynamic';

import { handleRequest } from '../../../../../lib/server/errors/error-handler';
import { authenticate, authorizePermission } from '../../../../../lib/server/auth/middleware.helpers';
import { successResponse } from '../../../../../lib/server/dto/shared.dto';
import { providerRegistryService } from '../../../../../lib/server/services/provider-registry.service';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'READ');

    const { id } = await params;
    const provider = providerRegistryService.getSanitizedConfig(id);
    if (!provider) {
      return new Response(JSON.stringify({ success: false, error: `Provider '${id}' not found.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(successResponse(provider)), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'UPDATE');

    const { id } = await params;
    const body = await req.json();

    if (typeof body.enabled === 'boolean') {
      const updatedConfig = providerRegistryService.enableProvider(id, body.enabled);
      const sanitized = providerRegistryService.sanitizeConfig(updatedConfig);
      return new Response(JSON.stringify(successResponse(sanitized)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid payload. Expects { enabled: boolean }' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  return handleRequest(req, async () => {
    const nextReq = req as any;
    await authenticate(nextReq);
    await authorizePermission(nextReq, 'SYSTEM', 'DELETE');

    const { id } = await params;
    const removed = providerRegistryService.unregisterProvider(id);
    if (!removed) {
      return new Response(JSON.stringify({ success: false, error: `Provider '${id}' not found.` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(successResponse({ message: `Provider '${id}' unregistered successfully.` })), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
