var v=require('./v.core'),ss=document.querySelectorAll('script[type="text/v"],script[type="text/json"]'),i=0,rdata,data,src,libs,req,el;
libs={
  ajax:require('../lib/ajax'),
  scale:require('../lib/scale'),
  time:require('../lib/time'),
};
req=@{[R,n]var lib=libs[n.v];
  if(!lib)throw "No such library '"+n.v+"'";
  else if(typeof lib=='function')R(v.objTdic(lib(v,req)));
  else throw "Invalid library '"+n.v+"'"};
@(){if(i==ss.length){if(window.abort)window.abort(@{[f]f({src:src,data:data,dom:el.innerHTML})});^^}
  var s=ss[i++];
  if(s.type=='text/json'){rdata=s.childNodes[0].data;C()}
  else if(s.type=='text/v'){
    src=s.childNodes[0].data,el=document.createElement('div');
    var p=s.parentNode,lSrc=null,lData=null,res,
        show=@{[R,x]
          !x                    ? R(''+x)
         :x.type=='VirtualNode' ? R('')
         :x.show                ? x.show(R)
         :R(JSON.stringify(x,null,'  '))},
        r=@{[s,d]var da,err=0;try{da=JSON.parse(d||'{}')}catch(e){err=1};if(err)^^;data=da;
          if(s!=lSrc||d!=lData)v.call(el,s,@{console.log(x);if(res)show(@{res.innerHTML=x},x)},{data:da,env:{req:req}});
          src=lSrc=s,lData=d};
    p.replaceChild(el,s);
    var d,t,next=el.nextSibling,style=@{x.width='100%',x.height='300px',x.fontFamily='monospace'},idata=JSON.stringify(JSON.parse(rdata||'{}'),null,'  ');
    res=document.createElement('div');p.insertBefore(res,next);res.style.width='100%',res.style.fontFamily='monospace';
    t=document.createElement('textarea');p.insertBefore(t,next);t.value=src.trim();style(t.style);
    d=document.createElement('textarea');p.insertBefore(d,next);d.value=idata,style(d.style);
    t.onkeyup=d.onkeyup=@{r(t.value,d.value)}
    r(src,idata);C()}}
