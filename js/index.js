var S=t=>t[Math.floor(Math.random()*t.length)],j=[{url:"https://source.unsplash.com/800x800?people",weight:10},{url:"https://source.unsplash.com/800x800?group",weight:5}],A=j.flatMap(({url:t,weight:a})=>Array(a).fill(t)),x=new FileReader,i=new Image,b=async()=>{let t=await fetch(S(A));return new Promise(a=>{let e=new Image;e.addEventListener("load",()=>{i=e,a()}),e.crossOrigin="anonymous",e.src=t.url})},n=document.getElementById("picture"),r=n.getContext("2d"),B=new FontFace("Bebas Neue","url(public/BebasNeue-Bold.ttf)"),k=()=>{let t=n.getBoundingClientRect();return{offsetX:t.left,offsetY:t.top,canvasScale:t.width/800}},{offsetX:f,offsetY:v,canvasScale:o}=k(),p=!1,y,w,T=new Image;T.src="public/janecek.png";var R=493,E=897,I=1.8,s={x:500,y:800-E/I,width:R/I,height:E/I},C=t=>{let a=!!t.touches,e=Number((a?t.touches[0].clientX:t.clientX)-f),c=Number((a?t.touches[0].clientY:t.clientY)-v),d=s.x*o,u=s.y*o,g=s.width*o,h=s.height*o;e>d&&e<d+g&&c>u&&c<u+h&&(p=!0),y=e,w=c};n.addEventListener("mousedown",C);n.addEventListener("touchstart",C);n.addEventListener("mouseup",()=>{p=!1});var z=async()=>{await B.load(),document.fonts.add(B)},D=t=>{!t.type.startsWith("image/")||x.readAsDataURL(t)};n.addEventListener("dragover",t=>t.preventDefault());n.addEventListener("drop",t=>{t.preventDefault(),!(!t.dataTransfer||t.dataTransfer.files.length<=0)&&D(t.dataTransfer.files[0])});var l=async()=>{r.fillStyle="black",r.fillRect(0,0,n.width,n.height);let t=n.width/i.width,a=n.height/i.height,e=Math.max(t,a);r.setTransform(e,0,0,e,0,0),r.drawImage(i,0,0),r.setTransform(),r.drawImage(T,s.x,s.y,s.width,s.height)},X=t=>{let a=!!t.touches,e=Number((a?t.touches[0].clientX:t.clientX)-f),c=Number((a?t.touches[0].clientY:t.clientY)-v),d=s.x*o,u=s.y*o,g=s.width*o,h=s.height*o;if(e>d&&e<d+g&&c>u&&c<u+h?n.style.cursor="pointer":n.style.cursor="initial",p){let N=e-y,F=c-w;s.x+=N/o,s.y+=F/o,l(),y=e,w=c}};n.addEventListener("mousemove",X);n.addEventListener("touchmove",X);x.addEventListener("load",t=>{i=new Image,i.addEventListener("load",()=>l()),i.src=t.target.result});var W=document.getElementById("randomize");W.addEventListener("click",async()=>{await b(),l()});var Y=document.getElementById("customImage");Y.addEventListener("change",t=>{t.preventDefault(),!(t.target.files.length<=0)&&D(t.target.files[0])});var U=document.getElementById("customImageBtn");U.addEventListener("click",()=>{Y.click()});var m=document.getElementById("customText"),M=async t=>{(t.type==="input"||m.value)&&(currentText=m.value,l())};m.addEventListener("click",M);m.addEventListener("input",M);var G=document.getElementById("slider");G.addEventListener("input",t=>{s.width=R*(t.target.value/100),s.height=E*(t.target.value/100),l()});var L=document.createElement("a");L.setAttribute("download","TohleJsmeMy.jpg");var H=document.getElementById("save");H.addEventListener("click",t=>{t.preventDefault(),L.setAttribute("href",n.toDataURL("image/jpeg").replace("image/jpeg","image/octet-stream")),L.click()});window.addEventListener("resize",()=>{let t=k();f=t.offsetX,v=t.offsetY,o=t.canvasScale});z();b().then(()=>l());
//# sourceMappingURL=index.js.map
