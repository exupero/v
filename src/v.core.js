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
        case 'C':e('channel','n');break;
        case 'D':e('dict','v');break;
        case 'L':e('lazy','v');break;
        case 'N':e('nil','n');break;
        case 'Y':e('fork','v');break;
        case '\n':e(';');break;
        default:t.backup();^^t.accept(digits)?number:@{[t]t.until(stop);t.emit('word','n');^^init}}}}
  symbol=@{[t]t.until(stop);t.emit('symbol','n');^^init}
  number=@{[t]t.acceptRun(digits);if(t.accept('.')){t.acceptRun(digits);t.emit('float','n')}else t.emit('int','n');^^init}
  string=@{[ty]^^@{[t]
    t.until('"\\');
    if(t.peek()=='"'){t.emit(ty,'n',@{^^x.replace('\\"','"')});t.accept('"');t.ignore();^^init}
    else{t.accept('\\');t.accept('"');^^string(ty)}}}
  space=@{[t]if(t.acceptSeq('NB. '))t.until('\n');t.ignore();^^init}
  ^^tokens(input,init)}

isNum=@x.t=='int'||x.t=='float'
isNumVec=@x.t=='vector'&&isNum(x.values[0])
isStr=@x.t=='string'
isStrVec=@x.t=='vector'&&x.values[0].t=='string'
expr=@{[ts]
  ^^(ts.length==1)ts[0];
  var st,bind,i=ts.length-1;
  st=@isNum(x)&&isNum(y)    ? 5
     :isNumVec(x)&&isNum(y) ? 5
     :isStr(x)&&isStr(y)    ? 5
     :isStrVec(x)&&isStr(y) ? 5
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
    :x.t=='word'&&y.t==':' ? {t:'assign',p:'n',name:x.v}
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
  var i=ts.length-1,t,find=@{[ty,f]for(var j=i;j<ts.length;j++)if(ts[j].t==ty){ts.splice(i,j-i+1,f(ts.slice(i+1,j)));^^}unmatched(t.t)};
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
  var eval,evalss,evall,evals,evala,evalc,apply,find,fs=[],sus=@fs.push(x),m,opts=opts||{},ops=opts.ops||defaultOps,R=R||id;
  m={root:this};
  eval=@{[R,tr,e]
    ^^udfq(tr)||udfq(tr.t)              ? R(tr)
     :tr.t=='assign'                    ? R(@{[R,x]eval(@{e[e.length-1][tr.name]=x;R(x)},x,e)})
     :tr.t=='apply'||tr.t=='applyMonad' ? (tr.func.t==':'&&tr.arg.t=='args'?evalc(R,e,tr.arg.args):evala(R,e,tr.func,tr.arg))
     :tr.t=='compose'                   ? evall(@{[f,g]R(@{[R,a,b]g(@{f(R,x)},a,b)})},[tr.f,tr.g],e)
     :tr.t=='curry'                     ? evall(@{[f,x]R(@{[R,y]f.call(m,R,x,y)})},[tr.func,tr.arg],e)
     :tr.t=='modVerb'||tr.t=='modNoun'  ? (ops[tr.mod.t]?eval(@{ops[tr.mod.t](R,x)},tr.arg,e):error('No such adverb `'+tr.mod.v+'`'))
     :tr.t=='func'                      ? R(arity(@{[R]var a=sl(A,1),i,e2={};for(i=0;i<tr.args.length;i++)e2[tr.args[i]]=a[i];evalss(R,tr.body,e.concat([e2]))},tr.args.length))
     :tr.t=='args'                      ? evall(@{R({t:'args',values:sl(A)})},tr.args,e)
     :tr.t=='vector'                    ? evals(R,tr.values,e)
     :tr.t=='channel'                   ? R(channel(sus))
     :tr.t=='fork'                      ? R(@{[R,f]fs.push(@{f(@{})});R(N)})
     :tr.t=='list'                      ? evals(R,tr.values,e)
     :tr.t=='word'                      ? eval(R,find(tr.v,e),N)
     :tr.t=='data'                      ? R(jsTv(opts.data[tr.v]))
     :symq(tr)                          ? R(strTsym(tr.v))
     :tr.t=='int'                       ? R(parseInt(tr.v))
     :tr.t=='float'                     ? R(parseFloat(tr.v))
     :tr.t=='string'                    ? R(tr.v)
     :tr.t=='nil'                       ? R(N)
     :ops[tr.t]                         ? R(ops[tr.t])
     :error('Invalid AST: '+json(tr))}
  evalss=@{[R,es,e]var i=0;@(){i<es.length?eval(C,es[i++],e):R(x)}}
  evall=@{[R,es,e]var i=0,out=[],C=@{out.push(x);i<es.length?eval(C,es[i++],e):R.apply(N,out)};eval(C,es[i++],e)}
  evals=@{[R,es,e]^^(es.length==0)R(arrTseq([]));var i=0,out=[],C=@{out.push(x);i<es.length?eval(C,es[i++],e):R(arrTseq(out))};eval(C,es[i++],e)}
  evala=@{[R,e,f,x]evall(@{[f,x]
    domq(f)&&symq(x) ? R(H(f.tagName,f.properties,f.children.concat([H(x.v,{},[])])))
   :funq(f)          ? apply(R,f,x)
   :error('Not callable: '+json(f))},[f,x],e)}
  evalc=@{[R,e,es]es.length==1?eval(R,es[0],e):eval(@{x?eval(R,es[1],e):evalc(R,e,es.slice(2))},es[0],e)}
  apply=@{[R,f,a]
    ^^(a.t!='args')f.call(m,R,a);
    var udfd=a.values.filter(udfq);
    ^^(udfd.length==0)f.apply(m,[R].concat(a.values));
    R(arity(@{[R]var b=sl(A,1);apply(R,f,{t:'args',values:a.values.map(@udfq(x)?b.shift():x)})},udfd.length))}
  find=@{[w,e]var i,x;for(i=e.length-1;i>=0;i--){x=e[i][w];^^(!udfq(x))x}error("Cannot find var `"+w+"`")}
  evalss(R,parse(src.trim()),[{}]);while(fs.length>0)fs.shift()()}

var ich,numq,objq,mapq,arrq,seqq,vecq,funq,symq,vdoq,chaq,strq,colq,domq,jsTv,objTdic,arrTseq,seqTarr,seqTdic,strTsym,count,firsts,nexts,counts,vdo,reduce,take,drop,concat,reverse,pair,lazySeq,map,cons,channel,teq,atomic,mapC,takesC,rollPairs,func,config,show,assoc,assocIn,H,VHtVS;
ich=@{var ms=sl(A);^^@{[x]^^x&&ms.every(@{[m]^^to('function',x[m])})}}
numq=pt(to,'number');
strq=pt(to,'string');
symq=@x.t=='symbol';
funq=ich('call','apply');
arrq=@{^^x instanceof Array};
seqq=ich('next','first','prepend','append');
mapq=ich('get','assoc','dissoc','remap','keys','values','matches');
vecq=@numq(x)||seqq(x);
chaq=ich('put','take','close','isOpen');
colq=@seqq(x)||mapq(x)||chaq(x);
domq=@x.type=='VirtualNode';
objq=@{^^x instanceof Object}

VHtVS=@{^^udfq(x)?x:VS(x.tagName,x.properties,x.tagName=='foreignObject'?x.children:x.children.map(VHtVS))}
H=@{[t,p,c]^^t=='svg'?VS(t,p,c.map(VHtVS)):VH(t,p,c)}
jsTv=@{
  ^^arrq(x)?arrTseq(x.map(jsTv))
   :objq(x)?objTdic(x)
   :x}
objTdic=@{var s=[],k;for(k in x)s.push(arrTseq([{t:'symbol',v:k,p:'n'},jsTv(x[k])]));^^seqTdic(arrTseq(s))}
channel=@{[s]var c={
  put:@{[R,x]
    !c.open?error('Cannot put to a closed channel')
   :c.values.length>0?s(@c.put(R,x))
   :@!{c.values.push(x);R(c)}},
  close:@{c.open=0},
  take:@{[R]
    !c.open?error('Cannot take from a closed channel')
   :c.values.length>0?R(c.values.shift())
   :s(@c.take(R))},
  isOpen:@c.open,
  open:1,values:[]};^^c}
mapC=@{[f]var cs=sl(A,1);^^{
  put:@{error('Cannot put on mapped channel')},
  close:@{error('Cannot close a mapped channel')},
  take:@{[R]takesC(@{[xs]f.apply(N,[R].concat(xs))},cs)},
  isOpen:@cs.every(@x.isOpen())}}
strTsym=@{var s={t:'symbol',v:x,
  call:@{[_,R,a]
    symq(a)?R(H(s.v,{},[H(a.v,{},[])]))
   :seqq(a)?seqTarr(@{R(H(s.v,{},x))},a)
   :mapq(a)?a.call(N,R,s)
   :domq(a)?R(H(s.v,{},[a]))
   :inval(json(s),a)},
  apply:@{[_,xs]s.call.apply(N,[N].concat(xs))}};^^s}
arrTseq=@{[xs]
  var s={
    t:'seq',
    first:@{[R]R(xs[0])},
    next:@{[R]R(xs.length>1?arrTseq(xs.slice(1)):N)},
    prepend:@{[R,x]R(arrTseq([x].concat(xs)))},
    append:@{[R,x]R(arrTseq(xs.concat([x])))},
    call:@{[_,R,n]R(xs[n])},
    apply:@{[_,xs]s.call.apply(N,[N].concat(xs))}};^^s}
lazySeq=@{[R,a,f]cons(R,@{[R]R(a)},@{[R]f(@{x?lazySeq(R,x,f):R(N)},a)})}
map=@{[R,f]var ss=sl(A,2);cons(R,@{[R]firsts(@{f.apply(N,[R].concat(x))},ss)},@{[R]nexts(@{x.every(@x!=N)?map.apply(N,[R,f].concat(x)):R(N)},ss)})}
seqTarr=@{[R,xs]var out=[];@(xs){[ys]^^(!ys)R(out);ys.first(@{out.push(x);ys.next(C)})}}
seqTdic=@{[ps,f]
  var get=@{[R,k]@(ps){[xs]^^(!xs)R(N);xs.first(@{^^(!x)R(N);pair(@{[a,b]a==k||a.t==k.t&&a.v==k.v?(f?f(R,b,k):R(b)):xs.next(C)},x)})}},
      d={call:@{[_,R,k]get(R,k)},
         apply:@{[_,xs]d.call.apply(N,[N].concat(xs))},
         get:get,
         assoc:@{[R,a]ps.append(@R(seqTdic(x,f)),a)},
         dissoc:@{[R]},
         remap:@{[R,g,a]
           udfq(a)&&f ? R(seqTdic(ps,@{[R,x]f(@{g(R,x)},x)}))
          :udfq(a)    ? R(seqTdic(ps,g))
          :f          ? R(seqTdic(ps,@{[R,v1,k]a.get(@{[v2]f(@{g(R,x,v2)},v1,v2)},k)}))
          :R(seqTdic(ps,@{[R,v1,k]a.get(@{[v2]g(R,v1,v2)},k)}))},
         matches:@{[R,a]@(ps){[xs]^^(!xs)R(1);xs.first(@{pair(@{[k,v]a.get(@{R(bl(x==v))},k)},x)})}},
         keys:@{[R]var out=[];@(ps){[xs]^^(!xs)R(out);xs.first(@{pair(@{out.push(x);xs.next(C)},x)})}},
         values:@{[R]var out=[];@(ps){[xs]^^(!xs)R(out);xs.first(@{pair(@{out.push(y);xs.next(C)},x)})}}};
  ^^d}
func=@funq(x)?x:@{[R]R(x)}

firsts=@{[R,xs]var i=0,out=[],C=@{out.push(x);i<xs.length?xs[i++].first(C):R(out)};xs[i++].first(C)}
nexts=@{[R,xs]var i=0,out=[],C=@{out.push(x);i<xs.length?xs[i++].next(C):R(out)};xs[i++].next(C)}
counts=@{[R,xs]var i=0,out=[],C=@{out.push(x);i<xs.length?count(C,xs[i++]):R(out)};count(C,xs[i++])}
takesC=@{[R,cs]var i=0,out=[],C=@{out.push(x);i<cs.length?cs[i++].take(C):R(out)};cs[i++].take(C)}
atomic=@{[f]^^@{[R,x,y]colq(x)||colq(y)?vdo(R,f,x,y):R(f(x,y))}}

reduce=@{[R,f,m]@(sl(A,3)){[xs]xs.filter(@x!=N).length>0?firsts(@{[ys]f.apply(N,[@{[mm]m=mm;nexts(C,xs)},m].concat(ys))},xs):R(m)}}
vdoq=@(numq(x)||mapq(x)||seqq(x)||chaq(x))&&udfq(y)||
      (numq(x)||mapq(x)||seqq(x)||chaq(x))&&numq(y)||
      (numq(x)||mapq(x))&&mapq(y)||
      (numq(x)||chaq(x))&&chaq(y)||
      (numq(x)||seqq(y))&&seqq(y)
vdo=@{[R,f,a,b]
  numq(a)&&udfq(b)?R(f(a))
 :numq(a)&&numq(b)?R(f(a,b))
 :numq(a)&&seqq(b)?map(R,atomic(@f(a,x)),b)
 :numq(a)&&mapq(b)?b.remap(R,atomic(@f(a,x)))
 :numq(a)&&chaq(b)?R(mapC(@{[R,x]R(f(a,x))},b))
 :seqq(a)&&udfq(b)?map(R,atomic(@f(x)),a)
 :seqq(a)&&numq(b)?map(R,atomic(@f(x,b)),a)
 :seqq(a)&&seqq(b)?map(R,atomic(f),a,b)
 :mapq(a)&&udfq(b)?a.remap(R,atomic(@f(x)))
 :mapq(a)&&numq(b)?a.remap(R,atomic(@f(x,b)))
 :mapq(a)&&mapq(b)?a.remap(R,atomic(f),b)
 :chaq(a)&&udfq(b)?R(mapC(@{[R,x]R(f(x))},a))
 :chaq(a)&&numq(b)?R(mapC(@{[R,x]R(f(x,b))},a))
 :chaq(a)&&chaq(b)?R(mapC(@{[R,x,y]R(f(x,y))},a,b))
 :R(udf)}
count=@{[R,xs]var c=0;@(xs){[xss]^^(!xss)R(c);c++;xss.next(C)}}
concat=@{[R,xs,ys]@(ys){[zs]^^(!zs)R(xs);zs.first(@{[z]xs.append(@{[xss]xs=xss;zs.next(C)},z)})}}
reverse=@{[R,xs]seqTarr(@{x.reverse();R(arrTseq(x))},xs)}
take=@{[R,n,xs]
   n==0?R(xs)
  :n>0?@!{var ys=[];@(xs){[zs]^^(!zs||ys.length==n)R(arrTseq(ys));zs.first(@{ys.push(x);zs.next(C)},zs)}}
  :n<0?seqTarr(@{R(arrTseq(x.slice(x.length+n)))},xs)
  :udf}
drop=@{[R,n,xs]
   n==0?R(xs)
  :n>0?@!{var i=0;@(xs){[ys]^^(!ys)R(N);^^(i==n)R(ys);i++;ys.next(C)}}
  :n<0?seqTarr(@{R(arrTseq(x.splice(0,x.length+n)))},xs)
  :udf}
pair=@{[R,p]p.first(@{[p0]p.next(@{[ps]ps.first(@{R(p0,x)})})})}
rollPairs=@{[R,s]s.first(@{[x]s.next(@{[xs]xs?xs.first(@{[y]cons(R,@{[R]R([x,y])},@{[R]rollPairs(R,xs)})}):R(N)})})}
cons=@{[R,x,xs,ys]var s={
  t:'seq',
  call:@{[_,R,n]n==0?s.first(R):s.next(@{x.call(N,R,n-1)})},
  apply:@{[_,xs]s.call.apply(N,[N].concat(xs))},
  first:@{[R]x(R)},
  next:@{[R]xs(@{[n]R(n||ys||N)})},
  prepend:@{[R,y]cons(R,@{[R]R(y)},@{[R]R(s)},ys)},
  append:@{[R,y]ys?ys.append(@{[yss]cons(R,x,xs,yss)},y):cons(R,x,xs,arrTseq([y]))}};R(s)}
assoc=@{[o,p,v]var x={},k;for(k in o)x[k]=o[k];x[p]=v;^^x}
assocIn=@{[o,ps,v]^^ps.length==1?assoc(o,ps[0],v):assoc(o,ps[0],assocIn(o,ps.slice(1),v))}
teq=@x==y||Math.abs(x-y)<1e-10
config=@{[R,h,xs]var r=@{var x=assoc(x,'_data',h._data);R(y.length>0?config(R,x,[xs[0]].concat(y)):x)};switch(xs[0].v){
  case 'a':^^func(xs[2])(@r(H(h.tagName,assoc(h.properties,xs[1].v,x),h.children),xs.slice(3)),h._data);
  case 's':^^func(xs[2])(@r(H(h.tagName,assocIn(h.properties,["style",xs[1].v],x),h.children),xs.slice(3)),h._data);
  case 't':^^func(xs[1])(@r(H(h.tagName,h.properties,[String(x)]),[]),h._data);
  default:error('Invalid selection configuration key `'+xs[0].v)}}
show=@{[r,t]
  if(r._node&&r._tree){r._node=P(r._node,D(r._tree,t),r._tree=t)}
  else{r._node=n=CE(t);r._tree=t;r.appendChild(n)}}

var arit=@{var ars=A;^^arity(@{ars[A.length-2].apply(this,A)},2)},aarit=@{var ars=A;^^@{[R,f]R(@{[R]ars[A.length-2].apply(this,[R,f].concat(sl(A,1)))})}};
defaultOps={
  '~':arit(
    @{[R,a]vdoq(a)?vdo(R,@bl(!x),a):inval('~',a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(bl(a==b))
     :seqq(a)&&seqq(b)?counts(@{[cs]^^(cs[0]!=cs[1])R(0);reduce(R,@{[R,m,x,y]R(m&x==y)},1,a,b)},[a,b])
     :mapq(a)&&mapq(b)?a.matches(@{x?b.matches(R,a):R(0)},b)
     :invals('~',a,b)}),
  '+':arit(N,@{[R,a,b]vdoq(a,b)?vdo(R,@x+y,a,b):invals('+',a,b)}),
  '-':arit(
    @{[R,a]vecq(a)?vdo(R,@-x,a):inval('-',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@x-y,a,b):invals('-',a,b)}),
  '*':arit(
    @{[R,a]
      seqq(a)?a.first(R)
     :chaq(a)?a.take(R)
     :inval('*',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@x*y,a,b):invals('*',a,b)}),
  '%':arit(
    @{[R,a]vecq(a)?vdo(R,@1/x,a):inval('%',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@x/y,a,b):invals('%',a,b)}),
  '!':arit(
    @{[R,a]
      numq(a)?@!{var i,out=[];for(i=0;i<a;i++)out.push(i);R(arrTseq(out))}
     :chaq(a)?@!{a.close();R(N)}
     :inval('!',a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(a%b)
     :chaq(a)?a.put(R,b)
     :invals('!',a,b)}),
  '@':arit(
    @{[R,a]R(bl(numq(a)||symq(a)))},
    @{[R,a,b]funq(a)?a.call(N,R,b):invals('@',a,b)}),
  '#':arit(
    @{[R,a]
      seqq(a)?count(R,a)
     :chaq(a)?R(a.isOpen())
     :inval('#',a)},
    @{[R,a,b]
      numq(a)&&seqq(b)?take(R,a,b)
     :numq(a)&&strq(b)?R(b.slice(0,a))
     :invals('#',a,b)}),
  '_':arit(
    @{[R,a]vecq(a)?vdo(R,@Math.floor(x),a):inval('_',a)},
    @{[R,a,b]numq(a)&&seqq(b)?drop(R,a,b):invals('_',a,b)}),
  '^':arit(N,@{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@Math.pow(x,y),a,b):invals('^',a,b)}),
  '<':arit(
    @{[R,a]mapq(a)?a.keys(R):inval('<',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@bl(x<y),a,b):invals('<',a,b)}),
  '>':arit(
    @{[R,a]mapq(a)?a.values(R):inval('>',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@bl(x>y),a,b):invals('>',a,b)}),
  '&':arit(N,@{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@x>y?y:x,a,b):invals('&',a,b)}),
  '|':arit(
    @{[R,a]seqq(a)?reverse(R,a):inval('|',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@x>y?x:y,a,b):invals('|',a,b)}),
  '=':arit(N,
    @{[R,a,b]
      vecq(a)&&vecq(b)               ? vdo(R,@bl(x==y),a,b)
     :to('string',a)&&to('string',b) ? R(bl(a==b))
     :symq(a)&&symq(b)               ? R(bl(a.v==b.v))
     :R(0)}),
  ',':arit(
    @{[R,a]numq(a)?R(arrTseq([a])):inval(',',a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(arrTseq([a,b]))
     :numq(a)&&seqq(b)?b.prepend(R,a)
     :seqq(a)&&numq(b)?a.append(R,b)
     :seqq(a)&&seqq(b)?concat(R,a,b)
     :seqq(a)&&mapq(b)?b.assoc(R,a)
     :mapq(a)&&seqq(b)?a.assoc(R,b)
     :invals(',',a,b)}),
  '$':arit(
    @{[R,a]var m=this;
      numq(a)?R(''+a)
     :seqq(a)?seqTarr(R,a)
     :symq(a)?@!{var h=H(a.v,{},[]);show(m.root,h);R(h)}
     :domq(a)?@!{show(m.root,a);R(a)}
     :inval('$',a)},
    @{[R,a,b]
      symq(a)&&symq(b)?R(H(a.v,{},[H(b.v,{},[])]))
     :symq(a)&&seqq(b)?map(R,@{[R,x]var h=H(a.v,{},[]);h._data=x;R(h)},b)
     :symq(a)&&strq(b)?R(H(a.v,{},[String(b)]))
     :seqq(a)&&symq(b)?seqTarr(@{[xs]config(R,H(b.v,{},[]),xs)},a)
     :seqq(a)&&seqq(b)?seqTarr(@{[xs]map(R,@{[R,x]config(R,x,xs)},b)},a)
     :seqq(a)&&domq(b)?seqTarr(@{[xs]config(R,b,xs)},a)
     :domq(a)&&symq(b)?R(H(a.tagName,a.properties,a.children.concat([H(b.v,{},[])])))
     :domq(a)&&seqq(b)?seqTarr(@{R(H(a.tagName,a.properties,a.children.concat(x)))},b)
     :invals('$',a,b)}),
  dict:arit(@{[R,a]R(seqTdic(a))}),
  lazy:arit(N,@{[R,a,b]lazySeq(R,a,b)}),
  "'":aarit(map),
  "':":aarit(@{[R,f,a]rollPairs(@{map(R,@{[R,x]f(R,x[0],x[1])},x)},a)}),
  '/:':aarit(
    map,
    @{[R,f,a,b]map(R,@{[R,x]f(R,a,x)},b)}),
  '\\:':aarit(N,@{[R,f,a,b]map(R,@{[R,x]f(R,x,b)},a)}),
  '/':aarit(
    @{[R,f,a]
      if(f.arity==1){var t;@(a){^^(teq(x,t))R(x);t=x;f(C,x)}}
      else if(f.arity==2){var t,C=@{[xs]^^(!xs)R(t);xs.first(@{[x]f(@{t=x;xs.next(C)},t,x)})};a.first(@{t=x;a.next(C)})}},
    @{[R,f,a,b]
      if(f.arity==1){^^numq(a)?@!{var i=0;@(b){^^(i==a)R(x);f(@{i++;C(x)},x)}}
                      :funq(a)?@!{@(b){a(@{[t]t?f(C,x):R(x)},x)}}
                      :invals('f/',a,b)}
      error('Invalid arity for `/` function: '+f.arity)}),
  '\\':aarit(@{[R,f,a]
    var C=@{[R,x,xs]xs?xs.first(@{[y]f(@{cons(R,@{[R]R(x)},@{[R]xs.next(@{[ys]C(R,x,ys)})})},x,y)}):R(N)};
    a.first(@{cons(R,@{[R]R(x)},@{[R]a.next(@{[xs]C(R,x,xs)})})})}),
}
