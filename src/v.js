var v=require('./v.core'),ss=document.querySelectorAll('script[type="text/v"]'),i;
for(i=0;i<ss.length;i++){var s=ss[i],src=s.childNodes[0].data,el=document.createElement('div');s.parentNode.replaceChild(el,s);v.call(el,src,null,{data:window.vdata})}
