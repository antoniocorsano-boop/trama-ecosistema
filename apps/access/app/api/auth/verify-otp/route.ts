import { getRuntime } from '../../../../src/server/runtime.ts';
import { handleVerifyOtp } from '../../../../src/server/handlers/verify-otp.ts';
export async function POST(request: Request) { return handleVerifyOtp(request, getRuntime()); }
