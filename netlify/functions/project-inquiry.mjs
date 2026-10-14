// Local release candidate. Not installed in the public website.
const origins=new Set(['https://visioncraft-labs.com','https://www.visioncraft-labs.com']);
const mailbox='info@visioncraft-labs.com';
const reply=(status,code)=>Response.json({code},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const address=s=>typeof s==='string'&&s.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s);
const projects=['Website','Branding','Custom software','Address12 demonstration','AI / Automation','Creative content','SEO / Growth','Other','Etsy seller creative assets'];
async function boundedBody(request){
 const reader=request.body?.getReader();if(!reader)throw Error('BODY_REQUIRED');
 const chunks=[];let total=0;
 try{for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>12000){await reader.cancel();throw Error('BODY_TOO_LARGE');}chunks.push(value);}}
 finally{reader.releaseLock();}
 const bytes=new Uint8Array(total);let at=0;for(const c of chunks){bytes.set(c,at);at+=c.length;}return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export function createInquiryHandler({env,fetcher=fetch}={}){
 return async request=>{
  if(request.method!=='POST')return reply(405,'METHOD_NOT_ALLOWED');
  if(!origins.has(request.headers.get('Origin')))return reply(403,'ORIGIN_REJECTED');
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return reply(415,'JSON_REQUIRED');
  if(env?.WEBSITE_INQUIRY_EMAIL_ENABLED!=='true'||!env.WEBSITE_INQUIRY_RELEASE_REFERENCE||!/^re_[A-Za-z0-9_-]{20,}$/.test(env.SMTP_PASS??''))return reply(503,'INQUIRY_UNAVAILABLE');
  let input;try{input=await boundedBody(request);}catch(e){return reply(e.message==='BODY_TOO_LARGE'?413:400,'INVALID_INQUIRY');}
  if(!input||typeof input!=='object'||Array.isArray(input))return reply(400,'INVALID_INQUIRY');
  if(input.website)return reply(202,'INQUIRY_ACCEPTED');
  const limits={name:120,company:160,email:254,phone:50,project:100,budget:120,timeline:160,description:4000};const fields={};
  for(const [key,max] of Object.entries(limits)){const value=input[key]??'';if(typeof value!=='string'||value.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value))return reply(400,'INVALID_INQUIRY');fields[key]=value.trim();}
  if(!fields.name||!fields.description||!address(fields.email)||!projects.includes(fields.project))return reply(400,'INVALID_INQUIRY');
  const text='VisionCraft website project inquiry\n\n'+Object.entries(fields).map(([k,v])=>k+': '+(v||'Not specified')).join('\n\n');
  const payload={from:'VisionCraft Labs <'+mailbox+'>',to:[mailbox],reply_to:fields.email,subject:'VisionCraft website project inquiry',text};
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload)));
  const key='website-inquiry/'+[...new Uint8Array(hash)].map(v=>v.toString(16).padStart(2,'0')).join('');
  let response;try{response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.SMTP_PASS,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload),signal:AbortSignal.timeout(10000),redirect:'error'});}catch{return reply(503,'INQUIRY_UNAVAILABLE');}
  if(!response.ok)return reply(503,'INQUIRY_UNAVAILABLE');
  let ack;try{ack=await response.json();}catch{return reply(503,'INQUIRY_UNAVAILABLE');}
  if(typeof ack.id!=='string'||!ack.id||ack.id.length>128)return reply(503,'INQUIRY_UNAVAILABLE');
  return reply(202,'INQUIRY_ACCEPTED');
 };
}
export default request=>createInquiryHandler({env:{SMTP_PASS:Netlify.env.get('SMTP_PASS'),WEBSITE_INQUIRY_EMAIL_ENABLED:Netlify.env.get('WEBSITE_INQUIRY_EMAIL_ENABLED'),WEBSITE_INQUIRY_RELEASE_REFERENCE:Netlify.env.get('WEBSITE_INQUIRY_RELEASE_REFERENCE')}})(request);
export const config={path:'/api/project-inquiry',method:'POST',rateLimit:{windowLimit:3,windowSize:60,aggregateBy:['ip','domain']}};
