var T=e=>e[Math.floor(Math.random()*e.length)],D=[{url:"https://source.unsplash.com/800x800?people",weight:10},{url:"https://source.unsplash.com/800x800?person",weight:5}],C=D.flatMap(({url:e,weight:a})=>Array(a).fill(e)),f=new FileReader,o=new Image,p=async()=>{let e=await fetch(T(C));return new Promise(a=>{let n=new Image;n.addEventListener("load",()=>{o=n,a()}),n.crossOrigin="anonymous",n.src=e.url})},s=document.getElementById("picture"),i=s.getContext("2d"),y=new FontFace("Bebas Neue","url(public/BebasNeue-Bold.ttf)"),v=s.getBoundingClientRect(),w=v.left,E=v.top,l=!1,d,m,I=new Image;I.src="public/janecek.png";var x=493,u=897,g=1.8,t={x:500,y:800-u/g,width:x/g,height:u/g};s.addEventListener("mousedown",e=>{let a=Number(e.clientX-w),n=Number(e.clientY-E);a>t.x&&a<t.x+t.width&&n>t.y&&n<t.y+t.height&&(l=!0),d=a,m=n});s.addEventListener("mouseup",()=>{l=!1});var N=async()=>{await y.load(),document.fonts.add(y)},L=e=>{!e.type.startsWith("image/")||f.readAsDataURL(e)};s.addEventListener("dragover",e=>e.preventDefault());s.addEventListener("drop",e=>{e.preventDefault(),!(!e.dataTransfer||e.dataTransfer.files.length<=0)&&L(e.dataTransfer.files[0])});var c=async()=>{i.fillStyle="black",i.fillRect(0,0,s.width,s.height);let e=s.width/o.width,a=s.height/o.height,n=Math.max(e,a);i.setTransform(n,0,0,n,0,0),i.drawImage(o,0,0),i.setTransform(),i.drawImage(I,t.x,t.y,t.width,t.height)};s.addEventListener("mousemove",e=>{let a=Number(e.clientX-w),n=Number(e.clientY-E);if(a>t.x&&a<t.x+t.width&&n>t.y&&n<t.y+t.height?s.style.cursor="pointer":s.style.cursor="initial",l){let k=a-d,R=n-m;t.x+=k,t.y+=R,c(),d=a,m=n}});f.addEventListener("load",e=>{o=new Image,o.addEventListener("load",()=>c()),o.src=e.target.result});var F=document.getElementById("randomize");F.addEventListener("click",async()=>{await p(),c()});var b=document.getElementById("customImage");b.addEventListener("change",e=>{e.preventDefault(),!(e.target.files.length<=0)&&L(e.target.files[0])});var M=document.getElementById("customImageBtn");M.addEventListener("click",()=>{b.click()});var r=document.getElementById("customText"),B=async e=>{(e.type==="input"||r.value)&&(currentText=r.value,c())};r.addEventListener("click",B);r.addEventListener("input",B);var X=document.getElementById("slider");X.addEventListener("input",e=>{t.width=x*(e.target.value/100),t.height=u*(e.target.value/100),c()});var h=document.createElement("a");h.setAttribute("download","TohleJsmeMy.jpg");var Y=document.getElementById("save");Y.addEventListener("click",e=>{e.preventDefault(),h.setAttribute("href",s.toDataURL("image/jpeg").replace("image/jpeg","image/octet-stream")),h.click()});N();p().then(()=>c());
//# sourceMappingURL=index.js.map
