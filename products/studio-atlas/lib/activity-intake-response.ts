// Stream successful, fully verified intake data without changing the JSON contract.
// Large original assets must not be discarded to fit a hosting provider's buffered response cap.
const CHUNK_CHARS = 64 * 1024;
export function intakeJsonResponse(value:unknown):Response {
  const json=JSON.stringify(value);
  const encoder=new TextEncoder();
  let offset=0;
  const body=new ReadableStream<Uint8Array>({
    pull(controller){
      if(offset>=json.length){controller.close();return;}
      let end=Math.min(offset+CHUNK_CHARS,json.length);
      // Do not split a UTF-16 surrogate pair across independent UTF-8 encodings.
      if(end<json.length){
        const c=json.charCodeAt(end-1);
        if(c>=0xd800&&c<=0xdbff) end--;
      }
      controller.enqueue(encoder.encode(json.slice(offset,end)));
      offset=end;
      if(offset>=json.length) controller.close();
    }
  });
  return new Response(body,{headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
}
