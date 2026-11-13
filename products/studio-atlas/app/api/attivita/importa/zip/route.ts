import { NextResponse } from "next/server";
import { intakeJsonResponse } from "../../../../../lib/activity-intake-response";
import { MAX_ZIP_BYTES, prepareZipDraft } from "../../../../../lib/activity-zip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (request.headers.get("content-type") !== "application/zip" || !request.body) {
      return NextResponse.json({ error: "Carica un pacchetto ZIP" }, { status: 415 });
    }
    const declared=Number(request.headers.get("content-length") ?? "0");
    if (declared>MAX_ZIP_BYTES) return NextResponse.json({error:"Pacchetto troppo grande"},{status:413});
    const reader=request.body.getReader(), chunks:Uint8Array[]=[];
    let total=0;
    try {
      for (;;) {
        const {done,value}=await reader.read();
        if(done) break;
        total+=value.byteLength;
        if(total>MAX_ZIP_BYTES) {
          await reader.cancel();
          return NextResponse.json({error:"Pacchetto troppo grande"},{status:413});
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const result=await prepareZipDraft(Buffer.concat(chunks,total));
    return intakeJsonResponse(result);
  } catch(error) {
    const message=error instanceof Error?error.message:"Pacchetto non valido";
    return NextResponse.json({error:message.slice(0,240)},{status:422,headers:{"Cache-Control":"no-store"}});
  }
}
