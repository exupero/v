var VH=require('virtual-dom/h'),VS=require('virtual-dom/virtual-hyperscript/svg'),CE=require('virtual-dom/create-element'),D=require('virtual-dom/diff'),P=require('virtual-dom/patch'),tokens,lex,isNum,isNumVec,isStr,isStrVec,parse,expr,exprs,wraps,eof=-1,log=console.log,json=JSON.stringify,spy=@{y?log(x,y):log(x);^^x},error=@{throw x},bl=@x&1,pt,to=@typeof y==x,sl=@Array.prototype.slice.call(x,y),inval,invals,udf=void 0,N=null,id=@x;
pt=@{[f]var xs=sl(A,1);^^@f.apply(N,xs.concat(sl(A)))}
udfq=pt(to,'undefined');
inval=@{[s,a]error("Invalid argument for "+s+": `"+json(a)+"`")}
invals=@{[s,a,b]error("Invalid arguments for "+s+": `"+json(a)+"` and `"+json(b)+"`")}

tokens=@{[input,st]
  var s=0,p=0,w=0,ts=[],t={
    nextChar:@{if(p>=input.length){w=0;^^eof}var c=input[p];w=1;p+=w;^^c},
    backup:@{p-=w},
    peek:@{var c=this.nextChar();this.backup();^^c},
    accept:@{[valid]if(valid.indexOf(this.nextChar())>=0)^^1;this.backup();^^0},
    acceptRun:@{[valid]while(valid.indexOf(this.nextChar())>=0){}this.backup()},
    acceptSeq:@{[s]for(var i=0;i<s.length;i++){if(t.nextChar()!=s[i]){while(i>=0){t.backup();i--};^^0}}^^1},
    until:@{[stop]while(1){var c=this.nextChar();if(c==eof)^^;^^(stop.indexOf(c)>=0)this.backup()}},
    done:@this.peek()==eof,
    ignore:@{s=p},
    emit:@{[type,part,f]ts.push({t:type,v:(f||id)(input.slice(s,p)),p:part});s=p},
  };while(st!=N)st=st(t);^^ts}

lex=@{[input]
  var init,symbol,number,string,space;
  var syms=' `~!@#$%^&*,.<>/?=+\\|-_;:"\'()[]{}',digits='0123456789',stop=syms+digits+' \n\t';
  init=@{[t]
    var e=t.emit,c;
    while(1){
      if(t.done())^^;
      c=t.nextChar();
      if('~!@#$%^&*,.<>?=+|-_:'.indexOf(c)>=0){e(c,'v');continue}
      if(';()[]{}'.indexOf(c)>=0){e(c);continue}
      switch(c){
        case ' ':^^space;
        case '`':t.ignore();^^t.accept('"')?@!{t.ignore();^^string('symbol')}:symbol;
        case '"':t.ignore();^^string('string');
        case '/':t.nextChar()==':'?e('/:','a'):@!{t.backup();e('/','a')};break;
        case '\\':t.nextChar()==':'?e('\\:','a'):@!{t.backup();e('\\','a')};break;
        case '\'':t.nextChar()==':'?e("':",'a'):@!{t.backup();e("'",'a')};break;
        case '\n':e(';');break;
        case 'C':e('C','n');break;
        case 'D':e('D','v');break;
        case 'L':e('L','v');break;
        case 'N':t.acceptSeq("ow")?e('Now','n'):e('N','n');break;
        case 'Y':e('Y','v');break;
        default:t.backup();^^t.accept(digits)?number:@{[t]t.until(stop);t.emit('word','n');^^init}}}}
  symbol=@{[t]t.until(stop);t.emit('symbol','n');^^init}
  number=@{[t]t.acceptRun(digits);if(t.accept('.')){t.acceptRun(digits);t.emit('float','n')}else t.emit('int','n');^^init}
  string=@{[ty]^^@{[t]
    t.until('"\\');
    if(t.peek()==eof)error('Unmatched "');
    else if(t.peek()=='"'){t.emit(ty,'n',@{^^x.replace('\\"','"')});t.accept('"');t.ignore();^^init}
    else{t.accept('\\');t.accept('"');^^string(ty)}}}
  space=@{[t]if(t.acceptSeq('NB. '))t.until('\n');t.ignore();^^init}
  ^^tokens(input,init)}

isNum=@x.t=='int'||x.t=='float'
isNumVec=@x.t=='vector'&&isNum(x.values[0])
isStr=@x.t=='string'
isStrVec=@x.t=='vector'&&x.values[0].t=='string'
isSym=@x.t=='symbol'
isSymVec=@x.t=='vector'&&isSym(x.values[0])
expr=@{[ts]
  ^^(ts.length==1)ts[0];
  var st,bind,i=ts.length-1;
  st=@isNum(x)&&isNum(y)    ? 5
     :isNumVec(x)&&isNum(y) ? 5
     :isStr(x)&&isStr(y)    ? 5
     :isStrVec(x)&&isStr(y) ? 5
     :isSym(x)&&isSym(y)    ? 5
     :isSymVec(x)&&isSym(y) ? 5
     :x.t=='.'&&y.t=='word' ? 5
     :x.t==':'              ? 0
     :x.p=='n'&&y.p=='n'    ? 1
     :x.p=='v'&&y.p=='v'    ? 1
     :x.p=='v'&&y.p=='n'    ? 2
     :x.p=='n'&&y.p=='v'    ? 3
     :x.p=='n'&&y.p=='a'    ? 4
     :x.p=='v'&&y.p=='a'    ? 4
     :0
  bind=@ts.splice(i-1,2,
     isNum(x)&&isNum(y)    ? {t:'vector',p:'n',values:[x,y]}
    :isNumVec(x)&&isNum(y) ? {t:'vector',p:'n',values:x.values.concat([y])}
    :isStr(x)&&isStr(y)    ? {t:'vector',p:'n',values:[x,y]}
    :isStrVec(x)&&isStr(y) ? {t:'vector',p:'n',values:x.values.concat([y])}
    :isSym(x)&&isSym(y)    ? {t:'vector',p:'n',values:[x,y]}
    :isSymVec(x)&&isSym(y) ? {t:'vector',p:'n',values:x.values.concat([y])}
    :x.t=='word'&&y.t==':' ? {t:'assign',p:'n',name:x.v}
    :x.t=='.'&&y.t==':'    ? {t:'assign',p:'n',name:'.'}
    :x.t=='data'&&y.t==':' ? {t:'assign',p:'n',name:'.'+x.v}
    :x.t=='.'&&y.t=='word' ? {t:'data',p:'n',v:y.v}
    :x.p=='n'&&y.p=='n'    ? {t:'apply',p:'n',func:x,arg:y}
    :x.p=='n'&&y.p=='v'    ? {t:'curry',p:'v',func:y,arg:x}
    :x.p=='n'&&y.p=='a'    ? {t:'modNoun',p:'v',mod:y,arg:x}
    :x.p=='v'&&y.p=='n'    ? {t:'applyMonad',p:'n',func:x,arg:y}
    :x.p=='v'&&y.p=='v'    ? {t:'compose',p:'n',f:x,g:y}
    :x.p=='v'&&y.p=='a'    ? {t:'modVerb',p:'v',mod:y,arg:x}
    :error('Invalid operation: '+x.v+' '+y.v));
  while(ts.length>1){
    i=i>ts.length-1?ts.length-1:i;
    if(ts.length==2){bind(ts[i-1],ts[i]);break}
    if(i==1){bind(ts[i-1],ts[i]);continue}
    if(st(ts[i-2],ts[i-1])<st(ts[i-1],ts[i])){bind(ts[i-1],ts[i]);continue}
    i--}
  ^^ts[0]}
exprs=@{[ts]
  var i,e=ts.length;
  for(i=e-1;i>=0;i--){
    if(ts[i].t==';'){ts.splice(i,e-i,ts.slice(i+1,e));e=i}
    if(i==0)ts.splice(i,e-i,ts.slice(i,e))}
  for(i=0;i<ts.length;i++)ts.splice(i,1,expr(ts[i]));
  ^^ts}
wraps=@{[ts]
  var i=ts.length-1,t,find=@{[ty,f]for(var j=i;j<ts.length;j++)if(ts[j].t==ty){ts.splice(i,j-i+1,f(ts.slice(i+1,j)));^^}error('Unmatched '+t.t)};
  for(i=ts.length-1;i>=0;i--){
    t=ts[i];
    if(t.t=='(')find(')',@{var x=exprs(x);^^x.length==1?x[0]:{t:'list',p:'n',values:udfq(x[0])?[]:udfq(x[1])?[x[0]]:x}});
    else if(t.t=='[')find(']',@{^^{t:'args',p:'n',args:exprs(x)}});
    else if(t.t=='{')find('}',@{[tss]var args;
      if(tss[0].t=='args')args=tss[0].args.map(@x.v),tss=tss.slice(1);
      else{var a=tss.filter(@x.t=='word'&&(x.v=='x'||x.v=='y'||x.v=='z')).map(@x.v);
        if(a.indexOf('z')!=-1)args=['x','y','z'];
        else if(a.indexOf('y')!=-1)args=['x','y'];
        else if(a.indexOf('x')!=-1)args=['x'];
        else args=[]}
      ^^{t:'func',p:'n',args:args,body:exprs(tss)}})}
  ^^ts}
parse=@exprs(wraps(lex(x)))

var arity=@{[f,a]f.arity=a;^^f};
module.exports=run=@{[src,R,opts]
  var ev,evb,evs,evl,eva,evc,apply,assign,find,fs=[],m,opts=opts||{},ops=opts.ops||defaultOps,R=R||id,data=opts.data?jsTv(opts.data):objTdic({});
  m={root:this,suspend:@fs.push(x)};
  ev=@{[R,tr,e]
    ^^udfq(tr)||udfq(tr.t)              ? R(tr)
     :tr.t=='assign'                    ? assign(R,e,tr.name)
     :tr.t=='apply'||tr.t=='applyMonad' ? (tr.func.t==':'&&tr.arg.t=='args'?evc(R,e,tr.arg.args):eva(R,e,tr.func,tr.arg))
     :tr.t=='compose'                   ? S{f,g<-evs([tr.f,tr.g],e);R,a,b<-R;x<-g(a,b);f(R,x)}
     :tr.t=='curry'                     ? S{f,x<-evs([tr.func,tr.arg],e);R,y<-R;f.call(m,R,x,y)}
     :tr.t=='modVerb'||tr.t=='modNoun'  ? (ops[tr.mod.t]?ev(@{ops[tr.mod.t](R,x)},tr.arg,e):error('No such adverb `'+tr.mod.v+'`'))
     :tr.t=='func'                      ? R(arity(@{[R]var a=sl(A,1),i,e2={};for(i=0;i<tr.args.length;i++)e2[tr.args[i]]=a[i];evb(R,tr.body,e.concat([e2]))},tr.args.length))
     :tr.t=='args'                      ? evs(@{R({t:'args',values:sl(A)})},tr.args,e)
     :tr.t=='vector'                    ? evl(R,tr.values,e,arrTvec)
     :tr.t=='list'                      ? evl(R,tr.values,e,arrTlis)
     :tr.t=='word'                      ? ev(R,find(tr.v,e),N)
     :tr.t=='data'                      ? data.get(R,strTsym(tr.v))
     :symq(tr)                          ? R(strTsym(tr.v))
     :tr.t=='int'                       ? R(parseInt(tr.v))
     :tr.t=='float'                     ? R(parseFloat(tr.v))
     :tr.t=='string'                    ? R(tr.v)
     :tr.t=='C'                         ? R(channel.call(m))
     :tr.t=='Now'                       ? R(new Date())
     :tr.t=='N'                         ? R(N)
     :tr.t=='Y'                         ? S{R,f<-R;fs.push(@{f(@{})});R(N)}
     :ops[tr.t]                         ? R(ops[tr.t])
     :error('Invalid AST: '+json(tr))}
  evb=@{[R,es,e]var i=0;@(){i<es.length?ev(C,es[i++],e):R(x)}}
  evs=@{[R,es,e]var i=0,o=[],C=@{o.push(x);i<es.length?ev(C,es[i++],e):R.apply(N,o)};ev(C,es[i++],e)}
  evl=@{[R,es,e,t]^^(es.length==0)R(t([]));var i=0,o=[],C=@{o.push(x);i<es.length?ev(C,es[i++],e):R(t(o))};ev(C,es[i++],e)}
  eva=@{[R,e,f,x]S{f,x<-evs([f,x],e);
    domq(f)&&symq(x) ? R(H(f.tagName,f.properties,f.children.concat([H(x.v,{},[])])))
   :funq(f)          ? apply(R,f,x)
   :error('Not callable: '+json(f))
  }}
  evc=@{[R,e,es]es.length==1?ev(R,es[0],e):S{x<-ev(es[0],e);x?ev(R,es[1],e):evc(R,e,es.slice(2))}}
  apply=@{[R,f,a]
    ^^(a.t!='args')f.call(m,R,a);
    var udfd=a.values.filter(udfq);
    ^^(udfd.length==0)f.apply(m,[R].concat(a.values));
    R(arity(@{[R]var b=sl(A,1);apply(R,f,{t:'args',values:a.values.map(@udfq(x)?b.shift():x)})},udfd.length))}
  assign=@{[R,e,n]^^S{R,x<-R;ev(@{
    if(n[0]=='.'){n=n.slice(1);if(n.length>0)S{d<-data.assoc(arrTlis([strTsym(n),x]));data=d;R(x)};else{data=x;R(x)}}
    else{e[e.length-1][n]=x;R(x)}},x,e)}}
  find=@{[w,e]var i,x;for(i=e.length-1;i>=0;i--){x=e[i][w];^^(!udfq(x))x}error("Cannot find var `"+w+"`")}
  evb(R,parse(src.trim()).filter(@{^^!udfq(x)}),[opts.env||{}]);while(fs.length>0)fs.shift()()}

var ich,numq,objq,mapq,arrq,seqq,atoq,funq,symq,vdoq,chaq,strq,colq,domq,jsTv,objTdic,arrTlis,seqTarr,seqTdic,strTsym,count,firsts,nexts,counts,vdo,reduce,take,drop,concat,reverse,pair,lazySeq,map,cons,where,channel,teq,atomic,mapC,takesC,rollPairs,func,config,show,assoc,assocIn,H,VHtVS;
ich=@{var ms=sl(A);^^@{[x]^^x&&ms.every(@{[m]^^to('function',x[m])})}}
numq=pt(to,'number');
strq=pt(to,'string');
funq=ich('call','apply');
typq=ich('type');
seqq=ich('next','first','prepend','append');
mapq=ich('get','assoc','dissoc','remap','keys','values','matches');
chaq=ich('put','take','close','isOpen');
arrq=@{^^x instanceof Array};
symq=@x.t=='symbol';
vecq=@seqq(x)&&typq(x)
atoq=@numq(x)||strq(x)||symq(x);
colq=@seqq(x)||mapq(x)||chaq(x);
domq=@x&&x.type=='VirtualNode';
objq=@{^^x instanceof Object}

VHtVS=@{^^VS(x.tagName,x.properties,x.tagName=='foreignObject'?x.children:x.children.map(VHtVS))}
H=@{[t,p,c]^^t=='svg'?VS(t,p,c.map(VHtVS)):VH(t,p,c)}
jsTv=@{
  ^^arrq(x)?arrTlis(x.map(jsTv))
   :funq(x)?x
   :objq(x)?objTdic(x,1)
   :x}
objTdic=@{var s=[],k;for(k in x)s.push(arrTlis([strTsym(k),y?jsTv(x[k]):x[k]]));^^seqTdic(arrTlis(s))}
channel=@{var m=this,c={
  put:@{[R,x]
    !c.open?error('Cannot put to a closed channel')
   :c.values.length>0?m.suspend(@c.put(R,x))
   :@!{c.values.push(x);R(c)}},
  close:@{c.open=0},
  take:@{[R]
    !c.open?error('Cannot take from a closed channel')
   :c.values.length>0?R(c.values.shift())
   :m.suspend(@c.take(R))},
  isOpen:@c.open,
  open:1,values:[]};^^c}
mapC=@{[f]var cs=sl(A,1);^^{
  put:@{error('Cannot put on mapped channel')},
  close:@{error('Cannot close a mapped channel')},
  take:@{[R]S{xs<-takesC(cs);f.apply(N,[R].concat(xs))}},
  isOpen:@cs.every(@x.isOpen())}}
strTsym=@{var s={t:'symbol',v:x,
  show:@{[R]R('`'+x)},
  call:@{[_,R,a]
    symq(a)?R(H(s.v,{},[H(a.v,{},[])]))
   :seqq(a)?seqTarr(@{R(H(s.v,{},x))},a)
   :mapq(a)?a.call(N,R,s)
   :domq(a)?R(H(s.v,{},[a]))
   :inval(json(s),a)},
  apply:@{[_,xs]s.call.apply(N,[N].concat(xs))}};^^s}
arrTvec=@{[xs]var s={name:'vec',
  show:@{[R]map(@{seqTarr(@{R('('+x.join(' ')+')')},x)},@{[R,x]x&&x.show?x.show(R):R(JSON.stringify(x))},s)},
  first:@{[R]R(xs[0])},
  next:@{[R]R(xs.length>1?arrTlis(xs.slice(1)):N)},
  prepend:@{[R,x]R(arrTlis([x].concat(xs)))},
  append:@{[R,x]R(arrTlis(xs.concat([x])))},
  type:@{[R]R(xs[0])},
  call:@{[_,R,n]var rs=sl(A,3);
    seqq(n)?S{ys<-map(@{[R,m]R(xs[m])},n);
      rs.length==0?R(ys)
     :seqq(ys)?map(R,@{[R,m]m.apply(N,[R].concat(rs))},ys)
     :funq(ys)?ys.apply(N,[R].concat(rs))
     :invals('@',ys,rs)}
   :rs.length==0?R(xs[n])
   :funq(xs[n])?xs[n].apply(N,[R].concat(rs))
   :invals('@',xs[n],rs)},
  apply:@{[_,xs]s.call.apply(N,[N].concat(xs))}};^^s}
arrTlis=@{[xs]var s={name:'lis',
  show:@{[R]map(@{seqTarr(@{R('('+x.join(';')+')')},x)},@{[R,x]x&&x.show?x.show(R):R(JSON.stringify(x))},s)},
  first:@{[R]R(xs[0])},
  next:@{[R]R(xs.length>1?arrTlis(xs.slice(1)):N)},
  prepend:@{[R,x]R(arrTlis([x].concat(xs)))},
  append:@{[R,x]R(arrTlis(xs.concat([x])))},
  call:@{[_,R,n]var rs=sl(A,3);
    seqq(n)?S{ys<-map(@{[R,m]R(xs[m])},n);
      rs.length==0?R(ys)
     :seqq(ys)?map(R,@{[R,m]m.apply(N,[R].concat(rs))},ys)
     :funq(ys)?ys.apply(N,[R].concat(rs))
     :invals('@',ys,rs)}
   :rs.length==0?R(xs[n])
   :funq(xs[n])?xs[n].apply(N,[R].concat(rs))
   :invals('@',xs[n],rs)},
  apply:@{[_,xs]s.call.apply(N,[N].concat(xs))}};^^s}
lazySeq=@{[R,a,f]cons(R,@{[R]R(a)},@{[R]S{x<-f(a);x?lazySeq(R,x,f):R(N)}})}
map=@{[R,f]var ss=sl(A,2);cons(R,@{[R]S{x<-firsts(ss);f.apply(N,[R].concat(x))}},@{[R]S{x<-nexts(ss);x.every(@x!=N)?map.apply(N,[R,f].concat(x)):R(N)}})}
seqTarr=@{[R,xs]var o=[];@(xs){[ys]^^(!ys)R(o);S{x<-ys.first;o.push(x);ys.next(C)}}}
seqTdic=@{[ps,f]
  var get=@{[R,k]@(ps){[xs]^^(!xs)R(N);xs.first(@{^^(!x)R(N);pair(@{[a,b]a==k||a.t==k.t&&a.v==k.v?(f?f(R,b,k):R(b)):xs.next(C)},x)})}},
      d={name:'dic',
         show:@{[R]ps.show(@R('D'+x))},
         call:@{[_,R,k]var rs=sl(A,3);
           seqq(k)?S{ys<-map(@{[R,m]get(R,m)},k);
             rs.length==0?R(ys)
            :seqq(ys)?map(R,@{[R,m]m.apply(N,[R].concat(rs))},ys)
            :funq(ys)?ys.apply(N,[R].concat(ys))
            :invals('@',ys,rs)}
          :S{v<-get(k);
            rs.length==0?R(v)
           :funq(v)?v.apply(N,[R].concat(rs))
           :invals('@',v,k)}},
         apply:@{[_,xs]d.call.apply(N,[N].concat(xs))},
         get:get,
         assoc:@{[R,a]S{x<-ps.append(a);R(seqTdic(x,f))}},
         dissoc:@{[R]},
         remap:@{[R,g,a]
           udfq(a)&&f ? R(seqTdic(ps,@{[R,x]f(@{g(R,x)},x)}))
          :udfq(a)    ? R(seqTdic(ps,g))
          :f          ? R(seqTdic(ps,@{[R,v1,k]S{v2<-a.get(k);x<-f(v1,v2);g(R,x,v2)}}))
          :R(seqTdic(ps,@{[R,v1,k]S{v2<-a.get(k);g(R,v1,v2)}}))},
         matches:@{[R,a]@(ps){[xs]^^(!xs)R(1);S{x<-xs.first;k,v<-pair(x);x<-a.get(k);R(bl(x==v))}}},
         keys:@{[R]var o=[];@(ps){[xs]^^(!xs)R(o);xs.first(@{pair(@{o.push(x);xs.next(C)},x)})}},
         values:@{[R]var o=[];@(ps){[xs]^^(!xs)R(o);xs.first(@{pair(@{o.push(y);xs.next(C)},x)})}}};
  ^^d}

firsts=@{[R,xs]var i=0,o=[],C=@{o.push(x);i<xs.length?xs[i++].first(C):R(o)};xs[i++].first(C)}
nexts=@{[R,xs]var i=0,o=[],C=@{o.push(x);i<xs.length?xs[i++].next(C):R(o)};xs[i++].next(C)}
counts=@{[R,xs]var i=0,o=[],C=@{o.push(x);i<xs.length?count(C,xs[i++]):R(o)};count(C,xs[i++])}
takesC=@{[R,cs]var i=0,o=[],C=@{o.push(x);i<cs.length?cs[i++].take(C):R(o)};cs[i++].take(C)}
atomic=@{[f]^^@{[R,x,y]colq(x)||colq(y)?vdo(R,f,x,y):R(f(x,y))}}

reduce=@{[R,f,m]@(sl(A,3)){[xs]xs.filter(@x!=N).length>0?S{ys<-firsts(xs);f.apply(N,[@{[mm]m=mm;nexts(C,xs)},m].concat(ys))}:R(m)}}
vdoq=@(atoq(x)||mapq(x)||seqq(x)||chaq(x))&&udfq(y)||
      (atoq(x)||mapq(x)||seqq(x)||chaq(x))&&atoq(y)||
      (atoq(x)||mapq(x))&&mapq(y)||
      (atoq(x)||chaq(x))&&chaq(y)||
      (atoq(x)||seqq(y))&&seqq(y)
vdo=@{[R,f,a,b]
  atoq(a)&&udfq(b)?R(f(a))
 :atoq(a)&&atoq(b)?R(f(a,b))
 :atoq(a)&&seqq(b)?map(R,atomic(@f(a,x)),b)
 :atoq(a)&&mapq(b)?b.remap(R,atomic(@f(a,x)))
 :atoq(a)&&chaq(b)?R(S{R,x<-mapC(b);R(f(a,x))})
 :seqq(a)&&udfq(b)?map(R,atomic(@f(x)),a)
 :seqq(a)&&atoq(b)?map(R,atomic(@f(x,b)),a)
 :seqq(a)&&seqq(b)?map(R,atomic(f),a,b)
 :mapq(a)&&udfq(b)?a.remap(R,atomic(@f(x)))
 :mapq(a)&&atoq(b)?a.remap(R,atomic(@f(x,b)))
 :mapq(a)&&mapq(b)?a.remap(R,atomic(f),b)
 :chaq(a)&&udfq(b)?R(S{R,x<-mapC(a);R(f(x))})
 :chaq(a)&&atoq(b)?R(S{R,x<-mapC(a);R(f(x,b))})
 :chaq(a)&&chaq(b)?R(S{R,x,y<-mapC(a,b);R(f(x,y))})
 :R(udf)}
count=@{[R,xs]var c=0;@(xs){[xss]^^(!xss)R(c);c++;xss.next(C)}}
concat=@{[R,xs,ys]@(ys){[zs]^^(!zs)R(xs);S{z<-zs.first;xss<-xs.append(z);xs=xss;zs.next(C)}}}
reverse=@{[R,xs]seqTarr(@{x.reverse();R(arrTlis(x))},xs)}
take=@{[R,n,xs]
   n==0?R(xs)
  :n>0?@!{var ys=[];@(xs){[zs]^^(!zs||ys.length==n)R(arrTlis(ys));S{x<-zs.first;ys.push(x);zs.next(C)}}}
  :n<0?seqTarr(@{R(arrTlis(x.slice(x.length+n)))},xs)
  :udf}
drop=@{[R,n,xs]
   n==0?R(xs)
  :n>0?@!{var i=0;@(xs){[ys]^^(!ys)R(N);^^(i==n)R(ys);i++;ys.next(C)}}
  :n<0?seqTarr(@{R(arrTlis(x.splice(0,x.length+n)))},xs)
  :udf}
pair=@{[R,p]S{p0<-p.first;ps<-p.next;x<-ps.first;R(p0,x)}}
rollPairs=@{[R,s]S{x<-s.first;xs<-s.next;xs?S{y<-xs.first;cons(R,@{[R]R([x,y])},@{[R]rollPairs(R,xs)})}:R(N)}}
cons=@{[R,x,xs,ys]var s={name:'lis',
  show:@{[R]map(@{seqTarr(@{R('('+x.join(';')+')')},x)},@{[R,x]x.show?x.show(R):R(JSON.stringify(x))},s)},
  first:@{[R]x(R)},
  next:@{[R]xs(@{[n]R(n||ys||N)})},
  prepend:@{[R,y]cons(R,@{[R]R(y)},@{[R]R(s)},ys)},
  append:@{[R,y]ys?S{yss<-ys.append(y);cons(R,x,xs,yss)}:cons(R,x,xs,arrTlis([y]))},
  call:@{[_,R,n]
    seqq(n)?map(R,@{[R,m]s.call(N,R,m)},n)
   :n==0?s.first(R)
   :s.next(@{x.call(N,R,n-1)})},
  apply:@{[_,xs]s.call.apply(N,[N].concat(xs))}};R(s)}
where=@{[R,xs,i,j]
  !xs           ? R(N)
 :udfq(i)       ? where(R,xs,0)
 :udfq(j)       ? S{x<-xs.first;where(R,xs,i,x)}
 :j==0          ? S{x<-xs.next;where(R,x,i+1)}
 :cons(R,@{[R]R(i)},@{[R]where(R,xs,i,j-1)})}
assoc=@{[o,p,v]var x={},k;for(k in o)x[k]=o[k];x[p]=v;^^x}
assocIn=@{[o,ps,v]^^ps.length==1?assoc(o,ps[0],v):assoc(o,ps[0],assocIn(o,ps.slice(1),v))}
config=@{[R,h,xs]var r=@{var x=assoc(x,'_data',h._data);y.length>0?config(R,x,[xs[0]].concat(y)):R(x)};switch(xs[0].v){
  case 'a':^^func(xs[2])(@r(H(h.tagName,assoc(h.properties,xs[1].v,x),h.children),xs.slice(3)),h._data,h._index);
  case 's':^^func(xs[2])(@r(H(h.tagName,assocIn(h.properties,["style",xs[1].v],x),h.children),xs.slice(3)),h._data,h._index);
  case 't':^^func(xs[1])(@r(H(h.tagName,h.properties,[String(x)]),[]),h._data,h._index);
  default:error('Invalid selection configuration key `'+xs[0].v)}}
show=@{[r,t]
  if(r._node&&r._tree){r._node=P(r._node,D(r._tree,t),r._tree=t)}
  else{r._node=n=CE(t);r._tree=t;r.appendChild(n)}}

func=@funq(x)?x:@{[R]R(x)}
teq=@x==y||Math.abs(x-y)<1e-10

var arit=@{[n]var ars=sl(A,1);^^arity(@{[R,a,b]R.fail=@{udfq(y)?inval(n,x):invals(n,x,y)};ars[A.length-2].call(this,R,a,b)},2)},
    aarit=@{var ars=A;^^@{[R,f]R(@{[R]ars[A.length-2].apply(this,[R,f].concat(sl(A,1)))})}};
defaultOps={
  '~':arit('~',
    @{[R,a]vdoq(a)?vdo(R,@numq(x)?bl(!x):R.fail(x),a):R.fail(a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(bl(a==b))
     :seqq(a)&&seqq(b)?S{cs<-counts([a,b]);cs[0]!=cs[1]?R(0):reduce(R,@{[R,m,x,y]R(m&x==y)},1,a,b)}
     :mapq(a)&&mapq(b)?a.matches(@{x?b.matches(R,a):R(0)},b)
     :R.fail(a,b)}),
  '+':arit('+',N,@{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?x+y:R.fail(x,y),a,b):R.fail(a,b)}),
  '-':arit('-',
    @{[R,a]vdoq(a)?vdo(R,@numq(x)?-x:R.fail(x),a):R.fail(a)},
    @{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?x-y:R.fail(x,y),a,b):R.fail(a,b)}),
  '*':arit('*',
    @{[R,a]
      seqq(a)?a.first(R)
     :chaq(a)?a.take(R)
     :R.fail(a)},
    @{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?x*y:R.fail(x,y),a,b):R.fail(a,b)}),
  '%':arit('%',
    @{[R,a]vdoq(a)?vdo(R,@numq(x)?1/x:R.fail(x),a):R.fail(a)},
    @{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?x/y:R.fail(x,y),a,b):R.fail(a,b)}),
  '!':arit('!',
    @{[R,a]
      numq(a)?@!{var i,o=[];for(i=0;i<a;i++)o.push(i);R(arrTlis(o))}
     :chaq(a)?@!{a.close();R(N)}
     :R.fail(a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(a%b)
     :chaq(a)?a.put(R,b)
     :R.fail(a,b)}),
  '@':arit('@',
    @{[R,a]R(bl(numq(a)||symq(a)))},
    @{[R,a,b]funq(a)?a.call(N,R,b):R.fail(a,b)}),
  '#':arit('#',
    @{[R,a]
      strq(a)?R(a.length)
     :seqq(a)?count(R,a)
     :chaq(a)?R(a.isOpen())
     :R.fail(a)},
    @{[R,a,b]
      numq(a)&&seqq(b)?take(R,a,b)
     :numq(a)&&strq(b)?R(b.slice(0,a))
     :R.fail(a,b)}),
  '_':arit('_',
    @{[R,a]vdoq(a)?vdo(R,@numq(x)?Math.floor(x):R.fail(x),a):R.fail(a)},
    @{[R,a,b]numq(a)&&seqq(b)?drop(R,a,b):R.fail(a,b)}),
  '^':arit('^',N,@{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?Math.pow(x,y):R.fail(x,y),a,b):R.fail(a,b)}),
  '<':arit('<',
    @{[R,a]mapq(a)?a.keys(R):R.fail(a)},
    @{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?bl(x<y):R.fail(x,y),a,b):R.fail(a,b)}),
  '>':arit('>',
    @{[R,a]mapq(a)?a.values(R):R.fail(a)},
    @{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?bl(x>y):R.fail(x,y),a,b):R.fail(a,b)}),
  '&':arit('&',
    @{[R,a]where(R,a)},
    @{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?(x>y?y:x):R.fail(x,y),a,b):R.fail(a,b)}),
  '|':arit('|',
    @{[R,a]seqq(a)?reverse(R,a):R.fail(a)},
    @{[R,a,b]vdoq(a,b)?vdo(R,@numq(x)&&numq(y)?(x>y?x:y):R.fail(x,y),a,b):R.fail(a,b)}),
  '=':arit('=',N,
    @{[R,a,b]
      symq(a)&&symq(b) ? R(bl(a.v==b.v))
     :vdoq(a)&&vdoq(b) ? vdo(R,@bl(x==y),a,b)
     :R(0)}),
  ',':arit(',',
    @{[R,a]numq(a)?R(arrTlis([a])):R.fail(a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(arrTlis([a,b]))
     :numq(a)&&seqq(b)?b.prepend(R,a)
     :seqq(a)&&numq(b)?a.append(R,b)
     :seqq(a)&&seqq(b)?concat(R,a,b)
     :seqq(a)&&mapq(b)?b.assoc(R,a)
     :mapq(a)&&seqq(b)?a.assoc(R,b)
     :R.fail(a,b)}),
  '$':arit('$',
    @{[R,a]var m=this;
      numq(a)?R(''+a)
     :symq(a)?@!{var h=H(a.v,{},[]);show(m.root,h);R(h)}
     :domq(a)?@!{show(m.root,a);R(a)}
     :R.fail(a)},
    @{[R,a,b]
      symq(a)&&symq(b)?R(H(a.v,{},[H(b.v,{},[])]))
     :symq(a)&&seqq(b)?@!{var i=0;map(R,@{[R,x]var h=H(a.v,{},[]);h._data=x,h._index=i++;R(h)},b)}
     :symq(a)&&strq(b)?R(H(a.v,{},[String(b)]))
     :seqq(a)&&symq(b)?S{xs<-seqTarr(a);config(R,H(b.v,{},[]),xs)}
     :seqq(a)&&seqq(b)?S{xs<-seqTarr(a);map(R,@{[R,x]config(R,x,xs)},b)}
     :seqq(a)&&domq(b)?S{xs<-seqTarr(a);config(R,b,xs)}
     :domq(a)&&symq(b)?R(H(a.tagName,a.properties,a.children.concat([H(b.v,{},[])])))
     :domq(a)&&seqq(b)?seqTarr(@{R(H(a.tagName,a.properties,a.children.concat(x)))},b)
     :R.fail(a,b)}),
  D:arit('D',@{[R,a]R(seqTdic(a))}),
  L:arit('L',N,@{[R,a,b]lazySeq(R,a,b)}),
  "'":aarit(map),
  "':":aarit(@{[R,f,a]S{x<-rollPairs(a);map(R,@{[R,x]f(R,x[0],x[1])},x)}}),
  '/:':aarit(
    map,
    @{[R,f,a,b]map(R,@{[R,x]f(R,a,x)},b)}),
  '\\:':aarit(N,@{[R,f,a,b]map(R,@{[R,x]f(R,x,b)},a)}),
  '/':aarit(
    @{[R,f,a]
      if(f.arity==1){var t;@(a){^^(teq(x,t))R(x);t=x;f(C,x)}}
      else if(f.arity==2){var t,C=@{[xs]^^(!xs)R(t);S{x<-xs.first;x<-f(t,x);t=x;xs.next(C)}};S{x<-a.first;t=x;a.next(C)}}},
    @{[R,f,a,b]
      if(f.arity==1){^^numq(a)?@!{var i=0;@(b){^^(i==a)R(x);f(@{i++;C(x)},x)}}
                      :funq(a)?@!{@(b){S{t<-a(x);t?f(C,x):R(x)}}}
                      :R.fail(a,b)}
      error('Invalid arity for `/` function: '+f.arity)}),
  '\\':aarit(@{[R,f,a]
    var C=@{[R,x,xs]xs?S{y<-xs.first;x<-f(x,y);cons(R,@{[R]R(x)},@{[R]S{ys<-xs.next;C(R,x,ys)}})}:R(N)};
    S{x<-a.first;cons(R,@{[R]R(x)},@{[R]S{xs<-a.next;C(R,x,xs)}})}}),
}

run.jsTv=jsTv;
run.atomic=atomic;
