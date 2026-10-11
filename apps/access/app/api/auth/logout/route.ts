import { getRuntime } from '../../../../src/server/runtime.ts';
import { handleLogout } from '../../../../src/server/handlers/logout.ts';
export async function POST(request: Request) { return handleLogout(request, getRuntime()); }
