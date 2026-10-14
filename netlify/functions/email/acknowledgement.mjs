import {acknowledgementShell} from './acknowledgement-shell.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function acknowledgement(name,email){
 const main='Thank you for getting in touch. We have received your project inquiry and our team will review it before responding.';
 const additional='If you have anything to add, simply reply to this email. This acknowledgement confirms receipt only; it does not confirm a quotation, project booking or demo approval.';
 const html=acknowledgementShell.replace('Alex Morgan',escape(name))
  .replace(/<p style="font-size:11px;letter-spacing:2px;[\s\S]*?<\/p>/,'')
  .replace(/(<h1[^>]*>)Design\. Technology\. Intelligence\.(<\/h1>)/,'$1We have received your inquiry.$2')
  .replace(/<p[^>]*>If you have questions or would like to discuss your project further, simply reply to this email\.<\/p>/,'')
  .replace('<strong>VisionCraft team</strong><br>Client Services<br>VisionCraft Labs','<strong>Client Services team</strong>')
  .replace('Thank you for sharing your project requirements. We have received your inquiry and will review the details before recommending the next steps.',main)
  .replace('You can reply to this email with any references, preferred timeline or questions you would like us to consider.',additional)
  .replace('src="logo.png"','src="https://visioncraft-labs.com/images/visioncraft-email-logo.png"')
  .replace('&copy; 2026','&copy; '+new Date().getUTCFullYear());
 return {from:'VisionCraft Labs <info@visioncraft-labs.com>',to:[email],reply_to:'info@visioncraft-labs.com',subject:'We have received your inquiry — VisionCraft Labs',html,text:'VisionCraft Labs\n\nHello '+name+',\n\n'+main+'\n\n'+additional+'\n\nVisionCraft Labs\nDesign. Technology. Intelligence.\ninfo@visioncraft-labs.com\nhttps://visioncraft-labs.com'};
}
