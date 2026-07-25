// TheFlap APNs push — Supabase Edge Function.  Deploy: supabase functions deploy send-push
// Secrets to set: APNS_KEY (.p8 contents), APNS_KEY_ID, APNS_TEAM_ID, APNS_BUNDLE_ID=com.leoneatelier.theflap
import { serve } from "https://deno.land/std/http/server.ts";
import { create } from "https://deno.land/x/djwt/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
async function apnsJwt(){
  const raw = Deno.env.get("APNS_KEY")!.replace(/-----[^-]+-----|\s/g,"");
  const key = await crypto.subtle.importKey("pkcs8",
    Uint8Array.from(atob(raw), c=>c.charCodeAt(0)),
    { name:"ECDSA", namedCurve:"P-256" }, false, ["sign"]);
  return await create({ alg:"ES256", kid:Deno.env.get("APNS_KEY_ID")! },
    { iss:Deno.env.get("APNS_TEAM_ID")!, iat:Math.floor(Date.now()/1000) }, key);
}
serve(async (req)=>{
  const { recipient, title, body } = await req.json();
  const { data } = await sb.from("flaps").select("body").eq("name","::push::");
  const tokens = (data||[]).map(r=>String(r.body).split("␟"))
    .filter(p=>(p[0]||"").toLowerCase()===(recipient||"").toLowerCase())
    .map(p=>p[2]).filter(Boolean);
  const jwt = await apnsJwt();
  const bundle = Deno.env.get("APNS_BUNDLE_ID")!;
  for (const token of tokens){
    await fetch(`https://api.push.apple.com/3/device/${token}`, {
      method:"POST",
      headers:{ authorization:`bearer ${jwt}`, "apns-topic":bundle, "apns-push-type":"alert" },
      body: JSON.stringify({ aps:{ alert:{ title, body }, sound:"default" } }),
    });
  }
  return new Response("ok");
});
