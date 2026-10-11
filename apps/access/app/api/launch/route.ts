import { getRuntime } from '../../../src/server/runtime.ts';
import { handleLaunch } from '../../../src/server/handlers/launch.ts';
export async function POST(request: Request) { return handleLaunch(request, getRuntime()); }
