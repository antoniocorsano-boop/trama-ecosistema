import { getRuntime } from '../../../../src/server/runtime.ts';
import { handleRequestOtp } from '../../../../src/server/handlers/request-otp.ts';
export async function POST(request: Request) { return handleRequestOtp(request, getRuntime()); }
