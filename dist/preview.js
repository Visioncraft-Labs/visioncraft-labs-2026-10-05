const form=document.getElementById('projectForm');
if(form&&form.dataset.backend!=='resend'){
 const clone=form.cloneNode(true);form.replaceWith(clone);
 const requested=new URLSearchParams(location.search).get('project');if(requested==='Etsy')clone.elements.project.value='Etsy seller creative assets';if(requested==='Address12')clone.elements.project.value='Address12 demonstration';
 clone.removeAttribute('data-netlify');clone.removeAttribute('data-backend');
 const status=clone.querySelector('#form-status'),actions=clone.querySelector('#draft-actions');
 clone.querySelector('[type="submit"]').textContent='Prepare project inquiry';
 actions.replaceChildren();actions.tabIndex=-1;actions.setAttribute('aria-label','Prepared project inquiry');
 const title=document.createElement('h3');title.textContent='Your project inquiry';actions.append(title);
 const card=document.createElement('div');card.className='inquiry-summary';actions.append(card);
 const note=document.createElement('p');note.className='draft-help';note.textContent='For a branded email, copy the formatted brief, open your email app, then replace the plain-text message body by pasting it. Email links open a plain-text draft. You review and send every message yourself.';actions.append(note);
 const controls=document.createElement('div');controls.className='draft-controls';actions.append(controls);
 const copy=document.createElement('button');copy.type='button';copy.id='copy-brief';copy.className='btn btn-primary';copy.textContent='Copy formatted brief';controls.append(copy);
 const email=document.createElement('a');email.className='btn draft-secondary';email.id='email-inquiry';email.textContent='Open email draft';controls.append(email);
 const whatsapp=document.createElement('a');whatsapp.className='btn draft-secondary';whatsapp.id='whatsapp-inquiry';whatsapp.textContent='Open WhatsApp draft';whatsapp.target='_blank';whatsapp.rel='noopener noreferrer';controls.append(whatsapp);
 const fields=[['name','Name'],['company','Company'],['email','Email'],['phone','Phone / WhatsApp'],['project','Project type'],['budget','Estimated budget'],['timeline','Timeline'],['description','Project description']];
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 let text='',html='';
 function prepare(){
  const data=new FormData(clone),rows=fields.map(([key,label])=>[label,String(data.get(key)||'Not specified')]);
  text='VISIONCRAFT LABS\nPROJECT INQUIRY\n\n'+rows.map(([label,value])=>label+': '+value).join('\n\n')+'\n\nPrepared with VisionCraft Labs\nhttps://visioncraft-labs.com';
  html='<div style="font-family:Arial,sans-serif;color:#20221e;max-width:640px;background:#f5f4ef;padding:24px"><h2 style="margin:0 0 6px;color:#34482c;font-size:24px">VisionCraft Labs</h2><p style="margin:0 0 20px;color:#43523c">Project inquiry</p><table style="width:100%;border-collapse:collapse;font-size:14px;table-layout:fixed">'+rows.map(([label,value])=>'<tr><th scope="row" style="width:34%;text-align:left;vertical-align:top;padding:12px;border:1px solid #b5bdab;background:#e8ede2;color:#20221e;font-weight:bold">'+escape(label)+'</th><td style="padding:12px;border:1px solid #b5bdab;background:#fff;color:#20221e;vertical-align:top;overflow-wrap:anywhere">'+escape(value).replace(/\n/g,'<br>')+'</td></tr>').join('')+'</table><p style="font-size:12px;margin:20px 0 0;color:#43523c">Prepared with <a href="https://visioncraft-labs.com" style="color:#34482c">VisionCraft Labs</a></p></div>';
  card.innerHTML=html;
  email.href='mailto:info@visioncraft-labs.com?subject='+encodeURIComponent('Project inquiry — '+(data.get('company')||data.get('name')))+'&body='+encodeURIComponent(text);
  const wa='*VisionCraft Labs — Project inquiry*\n\n'+rows.map(([label,value])=>'*'+label+'*\n'+value).join('\n\n');
  whatsapp.href='https://wa.me/16478324443?text='+encodeURIComponent(wa);
 }
 clone.addEventListener('submit',event=>{event.preventDefault();if(!clone.reportValidity()||clone.elements.website.value)return;prepare();actions.hidden=false;status.textContent='Your inquiry is ready to review. Choose email or WhatsApp below. Nothing has been sent.';actions.focus({preventScroll:true});actions.scrollIntoView({behavior:'instant',block:'start'})});
 clone.addEventListener('input',()=>{if(!actions.hidden)prepare()});clone.addEventListener('change',()=>{if(!actions.hidden)prepare()});
 copy.addEventListener('click',async()=>{
  prepare();
  try{
   if(!navigator.clipboard?.write||!window.ClipboardItem)throw Error('Formatted clipboard unavailable');
   await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})]);
   status.textContent='Formatted brief copied. Open your email draft and replace the plain-text message body by pasting it. Your email editor must support HTML formatting.';
  }catch{
   const selection=getSelection(),range=document.createRange();range.selectNodeContents(card);selection.removeAllRanges();selection.addRange(range);
   status.textContent='Select and copy the highlighted brief using your browser, then paste it into your email. You can also open a plain-text email or WhatsApp draft.';
  }
 });
}

document.querySelectorAll('.software-pause').forEach(button=>button.addEventListener('click',()=>{const section=button.closest('.software-section');const paused=section.classList.toggle('is-paused');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'Resume scrolling':'Pause scrolling'}));

