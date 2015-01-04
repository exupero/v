var v=require('./v.core'),ss=document.querySelectorAll('script[type="text/v"],script[type="text/json"]'),i,data;
for(i=0;i<ss.length;i++){var s=ss[i];
  if(s.type=='text/json')data=s.childNodes[0].data;
  else if(s.type=='text/v'){
    var src=s.childNodes[0].data,el=document.createElement('div'),p=s.parentNode,lSrc=src,lData=JSON.stringify(JSON.parse(data||'{}'),null,'  ');
        r=@{[src,d]var da=JSON.parse(d||'{}');
          if(src!=lSrc||d!=lData)v.call(el,src,null,{data:da});
          setTimeout(@{
            if(src!=lSrc&&window.sendSrc)window.sendSrc(src);
            if(d!=lData&&window.sendData)window.sendData(d);
            lSrc=src,lData=d},0)};
    p.replaceChild(el,s);
    var t=document.createElement('textarea');p.appendChild(t);t.value=src,t.style='width:100%;height:300px;';
    var d=document.createElement('textarea');p.appendChild(d);d.value=lData,d.style='width:100%;height:300px;';
    t.onkeyup=d.onkeyup=@{r(t.value,d.value)};r(src,data)}}
