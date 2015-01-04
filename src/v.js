var v=require('./v.core'),ss=document.querySelectorAll('script[type="text/v"]'),i;
for(i=0;i<ss.length;i++){
  var s=ss[i],src=s.childNodes[0].data,el=document.createElement('div'),t=document.createElement('textarea'),p=s.parentNode,opts={data:window.vdata},
      r=function(src){var e=0;try{v.call(el,src,null,opts)}catch(e){e=1;console.error(e)}if(!e&&window.send){window.send(src)}};
  p.replaceChild(el,s);p.appendChild(t);t.value=src,t.style='width:100%;height:300px;';t.onkeyup=function(){r(t.value)};r(src)}
