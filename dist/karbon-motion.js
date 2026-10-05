(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),canvas=document.querySelector('.karbon-globe'),map=document.querySelector('.karbon-map-frame');
 let paused=reduced.matches,visible=false,angle=-1.25,dragging=false,lastX=0,raf=0,lastTime=0;
 canvas.tabIndex=0;canvas.setAttribute('aria-label','Interactive Earth globe. Use left and right arrow keys or drag to rotate. Use the pause button to stop automatic rotation.');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true});
 function buttonState(button,isPaused,name){button.textContent=(isPaused?'Play ':'Pause ')+name;button.setAttribute('aria-pressed',String(isPaused));}
 const globeButton=document.querySelector('[data-motion="globe"]'),mapButton=document.querySelector('[data-motion="map"]');
 buttonState(globeButton,paused,'globe');map.classList.toggle('is-paused',reduced.matches);buttonState(mapButton,reduced.matches,'map');
 mapButton.addEventListener('click',()=>{const p=map.classList.toggle('is-paused');buttonState(mapButton,p,'map')});
 if(!gl){canvas.hidden=true;globeButton.hidden=true;return;}
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Globe shader unavailable');return s;}
 const program=gl.createProgram();
 try{
 gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 position;varying vec2 uv;void main(){uv=position;gl_Position=vec4(position,0.,1.);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 uv;uniform sampler2D earth;uniform float angle;void main(){vec2 p=uv/0.82;float r=length(p);vec3 bg=vec3(0.005,0.045,0.065);if(r>1.){float halo=exp(-(r-1.)*14.);gl_FragColor=vec4(bg+vec3(.015,.18,.23)*halo,1.);return;}float z=sqrt(1.-dot(p,p));vec3 n=vec3(p.x,p.y,z);float lon=atan(n.x,n.z)+angle;float lat=asin(n.y);vec2 coord=vec2(lon/6.2831853+.5,.5-lat/3.14159265);vec3 color=texture2D(earth,coord).rgb;float light=.42+.58*max(dot(n,normalize(vec3(-.5,.5,1.))),0.);float rim=pow(1.-z,3.);gl_FragColor=vec4(color*light+vec3(.05,.37,.48)*rim,1.);}`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Globe unavailable');
 }catch(e){canvas.hidden=true;globeButton.hidden=true;return;}
 gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);const image=new Image();let ready=false;
 const rotation=gl.getUniformLocation(program,'angle');
 function draw(){if(!ready)return;const size=Math.min(900,Math.ceil(canvas.clientWidth*Math.min(devicePixelRatio,2)));if(canvas.width!==size){canvas.width=canvas.height=size;gl.viewport(0,0,size,size)}gl.uniform1f(rotation,angle);gl.drawArrays(gl.TRIANGLES,0,6)}
 function tick(time){raf=0;if(!visible||paused||reduced.matches)return;if(lastTime&&!dragging)angle+=(time-lastTime)*.00018;lastTime=time;draw();raf=requestAnimationFrame(tick)}
 function start(){lastTime=0;if(!raf&&ready&&visible&&!paused&&!reduced.matches)raf=requestAnimationFrame(tick)}
 image.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);ready=true;canvas.classList.add('is-ready');draw();start()};image.onerror=()=>{canvas.hidden=true;globeButton.hidden=true};image.src='/images/earth-surface.jpg';
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(raf);raf=0;}},{threshold:.1}).observe(canvas);
 globeButton.addEventListener('click',()=>{paused=!paused;buttonState(globeButton,paused,'globe');if(paused){cancelAnimationFrame(raf);raf=0}else start()});
 let activePointer=null;canvas.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();angle+=event.key==='ArrowLeft'?-.12:.12;draw()}});
 canvas.addEventListener('pointerdown',event=>{if(dragging||!event.isPrimary)return;activePointer=event.pointerId;dragging=true;lastX=event.clientX;canvas.setPointerCapture(event.pointerId)});canvas.addEventListener('pointermove',event=>{if(dragging&&event.pointerId===activePointer){angle+=(event.clientX-lastX)*.012;lastX=event.clientX;draw()}});function endDrag(event){if(event.pointerId===activePointer){dragging=false;activePointer=null}}canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
 reduced.addEventListener('change',()=>{paused=reduced.matches;buttonState(globeButton,paused,'globe');map.classList.toggle('is-paused',reduced.matches);buttonState(mapButton,reduced.matches,'map');cancelAnimationFrame(raf);raf=0;start()});new ResizeObserver(draw).observe(canvas);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else start()});
})();
