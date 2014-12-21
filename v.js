var tokens,lex,isNum,parse,expr,exprs,wraps,eval,evals,evall,evalSeq,eof=-1,log=console.log,json=JSON.stringify,spy=@{y?log(x,y):log(x);^^x},error=@{throw x},bl=@{^^x&1},pt,to=@{[t,x]^^typeof x==t},sl=@{[a,n]^^Array.prototype.slice.call(a,n)},inval,invals,udf=void 0,N=null,id=@{^^x};
pt=@{[f]var xs=sl(A,1);^^@{^^f.apply(N,xs.concat(sl(A)))}}
udfq=pt(to,'undefined');
inval=@{[s,a]error("Invalid argument for "+s+": `"+json(a)+"`")}
invals=@{[s,a,b]error("Invalid arguments for "+s+": `"+json(a)+"` and `"+json(b)+"`")}

tokens=@{[input,st]
  var t={},s=0,p=0,w=0,ts=[];
  t.nextChar=@{if(p>=input.length){w=0;^^eof}var c=input[p];w=1;p+=w;^^c}
  t.backup=@{p-=w}
  t.peek=@{var c=this.nextChar();this.backup();^^c}
  t.accept=@{[valid]if(valid.indexOf(this.nextChar())>=0)^^1;this.backup();^^0}
  t.acceptRun=@{[valid]while(valid.indexOf(this.nextChar())>=0){}this.backup()}
  t.until=@{[stop]
    while(1){
      var c=this.nextChar();
      if(c==eof)^^;
      if(stop.indexOf(c)>=0){^^this.backup()}}}
  t.done=@{^^this.peek()==eof}
  t.ignore=@{s=p}
  t.emit=@{[type,part,f]ts.push({type:type,value:(f||id)(input.slice(s,p)),part:part});s=p}
  while(st!=N)st=st(t);^^ts}

exports.lex=lex=@{[input]
  var init,word,symbol,number,string,each,space;
  var syms=' `~!@#$%^&*,.<>/?=+\\|-_;:"\'()[]{}',digits='0123456789',stop=syms+digits+' \n\t';
  init=@{[t]
    var e=t.emit;
    while(1){
      if(t.done())^^;
      switch(t.nextChar()){
        case ' ':^^space;
        case '`':t.ignore();^^symbol;
        case '~':e('tilde','verb');break;
        case '!':e('bang','verb');break;
        case '@':e('at','verb');break;
        case '#':e('hash','verb');break;
        case '$':e('dollar','verb');break;
        case '%':e('percent','verb');break;
        case '^':e('caret','verb');break;
        case '&':e('amp','verb');break;
        case '*':e('star','verb');break;
        case ',':e('comma','verb');break;
        case '.':e('dot','verb');break;
        case '<':e('langle','verb');break;
        case '>':e('rangle','verb');break;
        case '/':e('slash','adverb');break;
        case '?':e('query','verb');break;
        case '=':e('equals','verb');break;
        case '+':e('plus','verb');break;
        case '\\':e('bash','adverb');break;
        case '|':e('pipe','verb');break;
        case '-':e('dash','verb');break;
        case '_':e('under','verb');break;
        case ';':e('semi');break;
        case ':':e('colon','verb');break;
        case '"':t.ignore();^^string;
        case '\'':^^each;
        case '(':e('laren');break;
        case ')':e('raren');break;
        case '[':e('lacket');break;
        case ']':e('racket');break;
        case '{':e('lace');break;
        case '}':e('race');break;
        case 'C':e('channel','noun');break;
        case 'D':e('dict','verb');break;
        case 'L':e('lazy','verb');break;
        case 'N':e('nil','noun');break;
        case '\n':e('semi');break;
        default:t.backup();^^t.accept(digits)?number:word}}}
  word=@{[t]t.until(stop);t.emit('word','noun');^^init}
  symbol=@{[t]t.until(stop);t.emit('symbol','noun');^^init}
  number=@{[t]t.acceptRun(digits);if(t.accept('.')){t.acceptRun(digits);t.emit('float','noun')}else t.emit('int','noun');^^init}
  string=@{[t]
    t.until('"\\');
    if(t.peek()=='"'){t.emit('string','noun',@{^^x.replace('\\"','"')});t.accept('"');t.ignore();^^init}
    else{t.accept('\\');t.accept('"');^^string}}
  each=@{[t]
    switch(t.nextChar()){
      case '/':t.emit('eachRight','adverb');break;
      case '\\':t.emit('eachLeft','adverb');break;
      case ':':t.emit('eachPair','adverb');break;
      default:t.backup();t.emit('each','adverb');break}
    ^^init}
  space=@{[t]
    if(t.accept('/')){t.until('\n');t.ignore();^^init}
    else{t.ignore();^^init}}
  ^^tokens(input,init)}

isNum=@{^^x.type=='int'||x.type=='float'}
expr=@{[ts]
  ^^(ts.length==1)ts[0];
  var st,bind,i=ts.length-1;
  st=@{[a,b]
    ^^isNum(a)&&isNum(b)               ? 5
     :a.type=='vector'&&isNum(b)       ? 5
     :a.part=='noun'&&b.part=='noun'   ? 1
     :a.part=='verb'&&b.part=='verb'   ? 1
     :a.part=='verb'&&b.part=='noun'   ? 2
     :a.part=='noun'&&b.part=='verb'   ? 3
     :a.part=='noun'&&b.part=='adverb' ? 4
     :a.part=='verb'&&b.part=='adverb' ? 4
     :0}
  bind=@{[a,b]ts.splice(i-1,2,
     isNum(a)&&isNum(b)               ? {type:'vector',part:'noun',values:[a,b]}
    :a.type=='vector'&&isNum(b)       ? {type:'vector',part:'noun',values:a.values.concat([b])}
    :a.part=='noun'&&b.part=='noun'   ? {type:'apply',part:'noun',func:a,arg:b}
    :a.part=='noun'&&b.part=='verb'   ? {type:'curry',part:'verb',func:b,arg:a}
    :a.part=='noun'&&b.part=='adverb' ? {type:'modNoun',part:'verb',mod:b,noun:a}
    :a.part=='verb'&&b.part=='noun'   ? {type:'applyMonad',part:'noun',func:a,arg:b}
    :a.part=='verb'&&b.part=='verb'   ? {type:'compose',part:'verb',f:a,g:b}
    :a.part=='verb'&&b.part=='adverb' ? {type:'modVerb',part:'verb',mod:b,verb:a}
    :error('Invalid operation: '+a.value+' '+b.value))};
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
    if(i==0)ts.splice(i,e-i,ts.slice(i,e));
    if(ts[i].type=='semi'){ts.splice(i,e-i,ts.slice(i+1,e));e=i}}
  for(i=0;i<ts.length;i++)ts.splice(i,1,expr(ts[i]));
  ^^ts}
wraps=@{[ts]
  var i=ts.length-1,t,find=@{[ty,f]for(var j=i;j<ts.length;j++)if(ts[j].type==ty){var tss=ts.slice(i+1,j),tss2=tss.slice();ts.splice(i,j-i+1,f(exprs(tss),tss2));^^}unmatched(t.type)};
  for(i=ts.length-1;i>=0;i--){
    t=ts[i];
    if(t.type=='laren')find('raren',@{^^x.length==1?x[0]:{type:'list',part:'noun',values:udfq(x[0])?[]:udfq(x[1])?[x[0]]:x}});
    else if(t.type=='lacket')find('racket',@{^^{type:'argList',part:'noun',args:x}});
    else if(t.type=='lace')find('race',@{[es,tss]
      var args=tss.filter(@{^^x.type=='word'&&(x.value=='x'||x.value=='y'||x.value=='z')}).map(@{^^x.value});
      ^^{type:'func',part:'noun',args:args,body:es}})}
  ^^ts}
exports.parse=parse=@{^^exprs(wraps(lex(x)))}

exports.run=@{[src,r,ops]
  eval=@{[tr,r,env]
    ^^udfq(tr.type)                           ? r(tr)
     :tr.type=='apply'||tr.type=='applyMonad' ? evall([tr.func,tr.arg],@{[f,x]^^(!funq(f))error('Not callable: '+f);f.call(N,r,x)},env)
     :tr.type=='curry'                        ? evall([tr.func,tr.arg],@{[f,x]r(@{[R,y]f(R,x,y)})},env)
     :tr.type=='func'                         ? r(@{[R]var a=sl(A,1),i,e={};for(i=0;i<tr.args.length;i++)e[tr.args[i]]=a[i];evals(tr.body,R,e)})
     :tr.type=='vector'                       ? evalSeq(tr.values,r,env)
     :tr.type=='list'                         ? evalSeq(tr.values,r,env)
     :tr.type=='word'                         ? eval(env[tr.value]||ops[tr.value],r,{})
     :symq(tr)                                ? r(strTsym(tr.value))
     :tr.type=='int'                          ? r(parseInt(tr.value))
     :tr.type=='float'                        ? r(parseFloat(tr.value))
     :tr.type=='string'                       ? r(tr.value)
     :tr.type=='nil'                          ? r(N)
     :ops[tr.type]                            ? r(ops[tr.type])
     :error('Invalid AST: '+json(tr))}
  evals=@{[es,r,env]var i=0;@(){i<es.length?eval(es[i++],C,env):r(x)}}
  evall=@{[es,r,env]var i=0,out=[],C=@{out.push(x);i<es.length?eval(es[i++],C,env):r.apply(N,out)};eval(es[i++],C,env)}
  evalSeq=@{[es,r,env]^^(es.length==0)r(arrTseq([]));var i=0,out=[],C=@{out.push(x);i<es.length?eval(es[i++],C,env):r(arrTseq(out))};eval(es[i++],C,env)}
  evals(parse(src),r,{})}

var numq,mapq,seqq,vecq,funq,symq,vdoq,ich,arrTseq,seqTarr,seqTdic,strTsym,count,firsts,nexts,counts,arit,vdo,reduce,map,take,drop,concat,reverse,pair,lazySeq,cons;
ich=@{var ms=sl(A);^^@{[x]^^ms.every(@{[m]^^to('function',x[m])})}}
numq=pt(to,'number')
symq=@{^^x.type=='symbol'}
funq=ich('call')
seqq=ich('empty','next','first','prepend','append');
mapq=ich('get','assoc','dissoc','remap','keys','values','matches');
vecq=@{^^numq(x)||seqq(x)}

strTsym=@{var s={type:'symbol',value:x,
  call:@{[N,R,a]a.call(N,R,s)}};^^s}
arrTseq=@{
  var s=@{[xs]^^{
    empty:s.empty,
    first:@{[R]R(xs[0])},
    next:@{[R]R(xs.length>1?arrTseq(xs.slice(1)):N)},
    prepend:@{[R,x]R(arrTseq([x].concat(xs)))},
    append:@{[R,x]R(arrTseq(xs.concat([x])))}}}
  s.empty=@{^^s([])}
  ^^s}()
lazySeq=@{[R,a,f]cons(R,@{[R]R(a)},@{[R]f(@{x?lazySeq(R,x,f):R(N)},a)})}
seqTarr=@{[R,xs]var out=[];@(xs){[ys]^^(!ys)R(out);ys.first(@{out.push(x);ys.next(C)})}}
seqTdic=@{[R,ps,f]
  var get=@{[r,k]@(ps){[xs]^^(!xs)r(N);xs.first(@{^^(!x)r(N);pair(@{[a,b]a==k||a.type==k.type&&a.value==k.value?(f?f(r,b,k):r(b)):xs.next(C)},x)})}},
      d={call:@{[_,r,k]get(r,k)},
         get:get,
         assoc:@{[r,a]ps.append(@{seqTdic(r,x,f)},a)},
         dissoc:@{[r]},
         remap:@{[r,g,a]
           udfq(a)&&f ? seqTdic(r,ps,@{[r,x]f(@{g(r,x)},x)})
          :udfq(a)    ? seqTdic(r,ps,g)
          :f          ? seqTdic(r,ps,@{[r,v1,k]a.get(@{[v2]f(@{g(r,x,v2)},v1,v2)},k)})
          :seqTdic(r,ps,@{[r,v1,k]a.get(@{[v2]g(r,v1,v2)},k)})},
         matches:@{[r,a]@(ps){[xs]^^(!xs)r(1);xs.first(@{pair(@{[k,v]a.get(@{r(bl(x==v))},k)},x)})}},
         keys:@{[r]var out=[];@(ps){[xs]^^(!xs)r(out);xs.first(@{pair(@{out.push(x);xs.next(C)},x)})}},
         values:@{[r]var out=[];@(ps){[xs]^^(!xs)r(out);xs.first(@{pair(@{out.push(y);xs.next(C)},x)})}}};
  R(d)}

firsts=@{[R,xs]var i=0,out=[],C=@{out.push(x);i<xs.length?xs[i++].first(C):R(out)};xs[i++].first(C)}
nexts=@{[R,xs]var i=0,out=[],C=@{out.push(x);i<xs.length?xs[i++].next(C):R(out)};xs[i++].next(C)}
counts=@{[R,xs]var i=0,out=[],C=@{out.push(x);i<xs.length?count(C,xs[i++]):R(out)};count(C,xs[i++])}

reduce=@{[R,f,m]@(sl(A,3)){[xs]xs.filter(@{[y]^^y!=null}).length>0?firsts(@{[ys]f.apply(N,[@{[mm]m=mm;nexts(C,xs)},m].concat(ys))},xs):R(m)}}
map=@{[R,f]reduce.apply(N,[R,@{[r,m]m.append(r,f.apply(N,sl(A,2)))},A[2].empty()].concat(sl(A,2)))}
vdoq=@{[a,b]
  ^^(numq(a)||mapq(a)||seqq(a))&&udfq(b)||
    (numq(a)||mapq(a)||seqq(a))&&numq(b)||
    (numq(a)||mapq(a))&&mapq(b)||
    (numq(a)||seqq(b))&&seqq(b)}
vdo=@{[R,f,a,b]
  numq(a)&&udfq(b)?R(f(a))
 :mapq(a)&&udfq(b)?a.remap(R,@{[r,x]r(f(x))})
 :seqq(a)&&udfq(b)?map(R,f,a)
 :numq(a)&&numq(b)?R(f(a,b))
 :mapq(a)&&numq(b)?a.remap(R,@{[r,x]r(f(x,b))})
 :numq(a)&&mapq(b)?b.remap(R,@{[r,x]r(f(a,x))})
 :mapq(a)&&mapq(b)?a.remap(R,@{[r,x,y]r(f(x,y))},b)
 :seqq(a)&&numq(b)?R(map(@{^^f(x,b)},a))
 :numq(a)&&seqq(b)?map(R,@{^^f(a,x)},b)
 :seqq(a)&&seqq(b)?map(R,f,a,b)
 :R(udf)}
count=@{[R,xs]var c=0;@(xs){[xss]^^(!xss)R(c);c++;xss.next(C)}}
concat=@{[R,xs,ys]@(ys){[zs]^^(!zs)R(xs);zs.first(@{[z]xs.append(@{[xss]xs=xss;zs.next(C)},z)})}}
reverse=@{[R,xs]var out=arrTseq.empty();@(xs){[ys]^^(!ys)R(out);ys.first(@{[y]out.prepend(@{[zs]out=zs;ys.next(C)},y)})}}
take=@{[R,n,xs]
   n==0?R(xs)
  :n>0?@{var ys=[];@(xs){[zs]^^(!zs||ys.length==n)R(arrTseq(ys));zs.first(@{ys.push(x);zs.next(C)},zs)}}()
  :n<0?seqTarr(@{R(arrTseq(x.slice(x.length+n)))},xs)
  :udf}
drop=@{[R,n,xs]
   n==0?R(xs)
  :n>0?@{var i=0;@(xs){[ys]^^(!ys)R(N);^^(i==n)R(ys);i++;ys.next(C)}}()
  :n<0?seqTarr(@{R(arrTseq(x.splice(0,x.length+n)))},xs)
  :udf}
pair=@{[R,p]p.first(@{[p0]p.next(@{[ps]ps.first(@{R(p0,x)})})})}
cons=@{[R,x,xs,ys]var s={
  empty:arrTseq.empty,
  first:@{[R]x(R)},
  next:@{[R]xs(@{[n]n?R(n):R(ys||N)})},
  prepend:@{[R,y]cons(R,@{[R]R(y)},@{[R]R(s)},ys)},
  append:@{[R,y]ys?ys.append(@{[yss]cons(R,x,xs,yss)},y):cons(R,x,xs,arrTseq([y]))}};R(s)}

arit=@{var arities=A;^^@{[R]var a=sl(A,1);arities[a.length-1].apply(N,[R].concat(a))}}
exports.defaultOps=({
  tilde:arit(
    @{[R,a]vdoq(a)?vdo(R,@{^^bl(!x)},a):inval('~',a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(bl(a==b))
     :seqq(a)&&seqq(b)?counts(@{[cs]^^(cs[0]!=cs[1])R(0);reduce(R,@{[r,m,x,y]r(m&x==y)},1,a,b)},[a,b])
     :mapq(a)&&mapq(b)?a.matches(@{x?b.matches(R,a):R(0)},b)
     :invals('~',a,b)}),
  plus:arit(N,@{[R,a,b]vdoq(a,b)?vdo(R,@{^^x+y},a,b):invals('+',a,b)}),
  dash:arit(
    @{[R,a]vecq(a)?vdo(R,@{^^-x},a):inval('-',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^x-y},a,b):invals('-',a,b)}),
  star:arit(
    @{[R,a]seqq(a)?a.first(R):inval('*',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^x*y},a,b):invals('*',a,b)}),
  percent:arit(
    @{[R,a]vecq(a)?vdo(R,@{^^1/x},a):inval('%',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^x/y},a,b):invals('%',a,b)}),
  bang:arit(
    @{[R,a]numq(a)?@{var i,out=[];for(i=0;i<a;i++)out.push(i);R(arrTseq(out))}():inval('!',a)},
    @{[R,a,b]numq(a)&&numq(b)?R(a%b):invals('!',a,b)}),
  at:arit(
    @{[R,a]R(bl(numq(a)||symq(a)))},
    @{[R,a,b]funq(a)?a.call(N,R,b):invals('@',a,b)}),
  hash:arit(
    @{[R,a]seqq(a)?count(R,a):inval('#',a)},
    @{[R,a,b]numq(a)&&seqq(b)?take(R,a,b):invals('#',a,b)}),
  under:arit(
    @{[R,a]vecq(a)?vdo(R,@{^^Math.floor(x)},a):inval('_',a)},
    @{[R,a,b]numq(a)&&seqq(b)?drop(R,a,b):invals('_',a,b)}),
  caret:arit(N,@{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^Math.pow(x,y)},a,b):invals('^',a,b)}),
  langle:arit(
    @{[R,a]mapq(a)?a.keys(R):inval('<',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^bl(x<y)},a,b):invals('<',a,b)}),
  rangle:arit(
    @{[R,a]mapq(a)?a.values(R):inval('>',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^bl(x>y)},a,b):invals('>',a,b)}),
  amp:arit(N,@{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^x>y?y:x},a,b):invals('&',a,b)}),
  pipe:arit(
    @{[R,a]seqq(a)?reverse(R,a):inval('|',a)},
    @{[R,a,b]vecq(a)&&vecq(b)?vdo(R,@{^^x>y?x:y},a,b):invals('|',a,b)}),
  equals:arit(N,
    @{[R,a,b]
      vecq(a)&&vecq(b)               ? vdo(R,@{^^bl(x==y)},a,b)
     :to('string',a)&&to('string',b) ? R(bl(a==b))
     :symq(a)&&symq(b)               ? R(bl(a.value==b.value))
     :R(0)}),
  comma:arit(
    @{[R,a]numq(a)?R(arrTseq([a])):inval(',',a)},
    @{[R,a,b]
      numq(a)&&numq(b)?R(arrTseq([a,b]))
     :numq(a)&&seqq(b)?b.prepend(R,a)
     :seqq(a)&&numq(b)?a.append(R,b)
     :seqq(a)&&seqq(b)?concat(R,a,b)
     :seqq(a)&&mapq(b)?b.assoc(R,a)
     :mapq(a)&&seqq(b)?a.assoc(R,b)
     :invals(',',a,b)}),
  dollar:arit(
    @{[R,a]
      numq(a)?R(''+a)
     :seqq(a)?seqTarr(R,a)
     :inval('$',a)}),
  dict:arit(@{[R,a]seqTdic(R,a)}),
  lazy:arit(N,@{[R,a,b]lazySeq(R,a,b)}),
});
