"""Apply shared media descriptions and validate the static site before publishing."""
from pathlib import Path
from html.parser import HTMLParser
import json,re,html
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist'
registry=json.loads((ROOT/'data/media-descriptions.json').read_text());errors=[];counts={'images':0,'videos':0}
def normalized(src):return src.split('?')[0].lstrip('/')
class Tag(HTMLParser):
 def handle_starttag(self,tag,attrs):self.attrs=dict(attrs)
def attrs(tag):
 parser=Tag();parser.feed(tag);return parser.attrs
def set_attr(tag,name,value):
 encoded=html.escape(value,quote=True)
 if re.search(r'\b'+name+r'="[^"]*"',tag):return re.sub(r'\b'+name+r'="[^"]*"',name+'="'+encoded+'"',tag)
 ending='/>' if tag.endswith('/>') else '>'
 return tag[:-len(ending)]+' '+name+'="'+encoded+'"'+ending
for path in OUT.rglob('*.html'):
 text=path.read_text()
 def image(match):
  tag=match.group(0);a=attrs(tag);src=normalized(a.get('src',''));counts['images']+=1
  if not src:return tag # The image dialog receives its source and alt together when opened.
  entry=registry.get(src)
  if entry:
   tag=set_attr(tag,'alt',entry['alt'])
   if entry.get('decorative'):tag=set_attr(tag,'aria-hidden','true')
  elif not a.get('alt','').strip():errors.append(str(path.relative_to(OUT))+': add a factual description for '+src)
  return tag
 text=re.sub(r'<img\b[^>]*>',image,text)
 def video(match):
  block=match.group(0);tag=re.match(r'<video\b[^>]*>',block).group(0);a=attrs(tag);source=re.search(r'<source\b[^>]*>',block);src=normalized(attrs(source.group(0)).get('src','') if source else a.get('src',''));entry=registry.get(src);counts['videos']+=1
  if not entry:errors.append(str(path.relative_to(OUT))+': add a video description for '+src);return block
  desc=entry.get('description') or entry['alt'];tag=set_attr(tag,'aria-label',entry['alt']);tag=set_attr(tag,'aria-description',desc)
  content=block[len(re.match(r'<video\b[^>]*>',block).group(0)):-len('</video>')]
  content=re.sub(r'<p class="video-fallback">.*?</p>','',content,flags=re.S)
  return tag+content+'<p class="video-fallback">'+html.escape(desc)+' <a href="/'+html.escape(src)+'">Open the video</a></p></video>'
 text=re.sub(r'<video\b.*?</video>',video,text,flags=re.S)
 path.write_text(text)
if errors:raise SystemExit('\n'.join(errors))
print('Media accessibility passed:',counts['images'],'image uses and',counts['videos'],'video uses. Shared descriptions applied automatically.')
