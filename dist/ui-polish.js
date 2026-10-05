(()=>{
 const root=document.documentElement,menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#primary-menu');
 document.addEventListener('keydown',()=>root.classList.add('keyboard-input'),{capture:true});
 document.addEventListener('pointerdown',event=>{root.classList.remove('keyboard-input');if(nav?.classList.contains('open')&&!event.target.closest('header'))menu.click()},{capture:true});
 matchMedia('(min-width:861px)').addEventListener('change',event=>{if(event.matches&&nav?.classList.contains('open'))menu.click()});
 const dialog=document.querySelector('#media-dialog');dialog?.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dialog.close()}});
})();
