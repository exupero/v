var v=require('./v.core'),ss=document.querySelectorAll('script[type="text/v"],script[type="text/json"]'),i=0,data,libs,req;
libs={
  ajax:require('../lib/ajax'),
  scale:require('../lib/scale'),
  time:require('../lib/time'),
};
req=@{[R,n]var lib=libs[n.v];
  if(!lib)throw "No such library '"+n.v+"'";
  else if(typeof lib=='function')R(v.objTdic(lib(v,req)));
  else throw "Invalid library '"+n.v+"'"};
@(){if(i==ss.length)^^;var s=ss[i++];
  if(s.type=='text/json'){
    if(s.childNodes.length>0){data=s.childNodes[0].data;C()}
    else if(s.src.length&&s.src.length>0){
      var r=new XMLHttpRequest();
      r.onreadystatechange=function(){if(r.readyState==4&&r.status==200){data=r.responseText;C()}};
      r.open('GET',s.src,true);r.send()}}
  else if(s.type=='text/v'){
    var src=s.childNodes[0].data,el=document.createElement('div'),p=s.parentNode,lSrc=null,lData=null,nData=JSON.stringify(JSON.parse(data||'{}'),null,'  '),res,
        show=@{[R,x]
          !x                    ? R(''+x)
         :x.type=='VirtualNode' ? R('')
         :x.show                ? x.show(R)
         :R(JSON.stringify(x,null,'  '))},
        r=@{[src,d]var da,err=0;try{da=JSON.parse(d||'{}')}catch(e){err=1};if(err)^^;
          if(src!=lSrc||d!=lData)v.call(el,src,@{console.log(x);if(res)show(@{res.innerHTML=x},x)},{data:da,env:{req:req}});
          setTimeout(@{
            if(src!=lSrc&&window.sendSrc)window.sendSrc(src);
            if(d!=lData&&window.sendData)window.sendData(d);
            lSrc=src,lData=d},0)};
    p.replaceChild(el,s);
    if(window.vAllowEditing){
      var d,t,next=el.nextSibling,style=@{x.width='100%',x.height='300px',x.fontFamily='monospace'};
      res=document.createElement('div');p.insertBefore(res,next);res.style.width='100%',res.style.fontFamily='monospace';
      t=document.createElement('textarea');p.insertBefore(t,next);t.value=src.trim();style(t.style);
      d=document.createElement('textarea');p.insertBefore(d,next);d.value=nData,style(d.style);
      t.onkeyup=d.onkeyup=@{r(t.value,d.value)}}
    r(src,nData);C()}}
