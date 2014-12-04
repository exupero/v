var tokens,lex,isNum,parse,expr,exprs,wraps,eval,evals,evall,evalSeq,ops,eof=-1,log=console.log,json=JSON.stringify,spy=function(v){log(v);return v},error=function(m){throw m},fac,bl=function(x){return x&1},numq=function(x){return typeof x=='number'},seqq=function(x){return fac(x,['next','first','length','cons','conj'])},vf=Array.prototype.slice,seq,inval,invals,op,vop,vdo,reduce,map,take,drop,concat,udf=void 0;
fac=function(x,ms){return ms.every(function(m){return typeof x[m]=='function'})}
inval=function(s,a){error("Invalid argument for "+s+": `"+json(a)+"`")}
invals=function(s,a,b){error("Invalid arguments for "+s+": `"+json(a)+"` and `"+json(b)+"`")}
tokens=function(input,st){
  var t={},s=0,p=0,w=0,ts=[];
  t.nextChar=function(){
    if(p>=input.length){w=0;return eof}
    var c=input[p];w=1;p+=w;return c}
  t.backup=function(){p-=w}
  t.peek=function(){var c=this.nextChar();this.backup();return c}
  t.accept=function(valid){
    if(valid.indexOf(this.nextChar())>=0)return 1;
    this.backup();return 0}
  t.acceptRun=function(valid){
    while(valid.indexOf(this.nextChar())>=0){}
    this.backup()}
  t.until=function(stop){
    while(1){
      var c=this.nextChar();
      if(c==eof)return;
      if(stop.indexOf(c)>=0){this.backup();return}}}
  t.done=function(){return this.peek()==eof}
  t.ignore=function(){s=p}
  t.emit=function(type,part,f){ts.push({type:type,value:(f||function(x){return x})(input.slice(s,p)),part:part});s=p}
  while(st!=null)st=st(t);return ts}
exports.lex=lex=function(input){
  var init,word,symbol,number,string,each,space;
  var syms=' `~!@#$%^&*,.<>/?=+\\|-_;:"\'()[]{}',digits='0123456789',stop=syms+digits+' \n\t';
  init=function(t){
    var e=t.emit;
    while(1){
      if(t.done())return;
      switch(t.nextChar()){
        case ' ':return space;
        case '`':t.ignore();return symbol;
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
        case '"':t.ignore();return string;
        case '\'':return each;
        case '(':e('laren');break;
        case ')':e('raren');break;
        case '[':e('lacket');break;
        case ']':e('racket');break;
        case '{':e('lace');break;
        case '}':e('race');break;
        case 'C':e('channel','noun');break;
        case 'N':e('nil','noun');break;
        case '\n':e('semi');break;
        default:t.backup();return t.accept(digits)?number:word}}}
  word=function(t){t.until(stop);t.emit('word','noun');return init}
  symbol=function(t){t.until(stop);t.emit('symbol','noun');return init}
  number=function(t){t.acceptRun(digits);if(t.accept('.')){t.acceptRun(digits);t.emit('float','noun')}else t.emit('int','noun');return init}
  string=function(t){
    t.until('"\\');
    if(t.peek()=='"'){t.emit('string','noun',function(s){return s.replace('\\"','"')});t.accept('"');t.ignore();return init}
    else{t.accept('\\');t.accept('"');return string}}
  each=function(t){
    switch(t.nextChar()){
      case '/':t.emit('eachRight','adverb');break;
      case '\\':t.emit('eachLeft','adverb');break;
      case ':':t.emit('eachPair','adverb');break;
      default:t.backup();t.emit('each','adverb');break}
    return init}
  space=function(t){
    if(t.accept('/')){t.until('\n');t.ignore();return init}
    else{t.ignore();return init}}
  return tokens(input,init)}
isNum=function(x){return x.type=='int'||x.type=='float'}
expr=function(ts){
  if(ts.length==1)return ts[0];
  var st,bind,i=ts.length-1;
  st=function(a,b){
    return isNum(a)&&isNum(b)               ? 5
          :a.type=='vector'&&isNum(b)       ? 5
          :a.part=='noun'&&b.part=='noun'   ? 1
          :a.part=='verb'&&b.part=='verb'   ? 1
          :a.part=='verb'&&b.part=='noun'   ? 2
          :a.part=='noun'&&b.part=='verb'   ? 3
          :a.part=='noun'&&b.part=='adverb' ? 4
          :a.part=='verb'&&b.part=='adverb' ? 4
          :0}
  bind=function(a,b){ts.splice(i-1,2,
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
  return ts[0]}
exprs=function(ts){
  var e=ts.length;
  for(var i=e-1;i>=0;i--){
    if(i==0)ts.splice(i,e-i,ts.slice(i,e));
    if(ts[i].type=='semi'){ts.splice(i,e-i,ts.slice(i+1,e));e=i}}
  for(i=0;i<ts.length;i++)ts.splice(i,1,expr(ts[i]));
  return ts}
wraps=function(ts){
  var i=ts.length-1,t,find=function(ty,f){for(var j=i;j<ts.length;j++)if(ts[j].type==ty){var tss=ts.slice(i+1,j),tss2=tss.slice();ts.splice(i,j-i+1,f(exprs(tss),tss2));return}unmatched(t.type)};
  for(i=ts.length-1;i>=0;i--){
    t=ts[i];
    if(t.type=='laren')find('raren',function(es){return es.length==1?es[0]:{type:'list',part:'noun',values:es}});
    else if(t.type=='lacket')find('racket',function(es){return {type:'argList',part:'noun',args:es}});
    else if(t.type=='lace')find('race',function(es,tss){
      var args=tss.filter(function(t){return t.type=='word'&&(t.value=='x'||t.value=='y'||t.value=='z')}).map(function(t){return t.value});
      return {type:'func',part:'noun',args:args,body:es}})}
  return ts}
exports.parse=parse=function(src){return exprs(wraps(lex(src)))}
seq=function(xs){return {
  next:function(){return seq(xs.slice(1))},
  first:function(){return xs[0]},
  length:function(){return xs.length},
  cons:function(x){return seq([x].concat(xs))},
  conj:function(x){return seq(xs.concat([x]))}}}
op=function(){var arities=arguments;return function(R,a){R(arities[a.length-1].apply(null,a))}}
vop=function(a,b){return typeof b=='undefined'?numq(a)||seqq(a):vop(a)&&vop(b)}
reduce=function(f,m){
  var args=vf.call(arguments,2);
  while(args.every(function(a){return a.length()>0})){
    m=f.apply(null,[m].concat(args.map(function(a){return a.first()})));
    args=args.map(function(a){return a.next();})}
  return m}
map=function(f){return reduce.apply(null,[function(m){return m.conj(f.apply(null,vf.call(arguments,1)))},seq([])].concat(vf.call(arguments,1)))}
vdo=function(f,a,b){
  if(typeof b=='undefined')return numq(a)?f(a):seqq(a)?map(f,a):udf;
  return numq(a)&&numq(b)?f(a,b):seqq(a)&&numq(b)?map(function(x){return f(x,b)},a):numq(a)&&seqq(b)?map(function(y){return f(a,y)},b):seqq(a)&&seqq(b)?map(f,a,b):udf}
drop=function(n,xs){
  var l=xs.length();
  if(n>=0){for(var i=0;i<n;i++)xs=xs.next();return xs}
  else if(l)return take(l+n,xs);
  else inval('Cannot drop from end of sequence with undefined end')}
take=function(n,xs){
  var l=xs.length();
  if(n>=0){ys=seq([]);for(var i=0;i<n;i++)ys=ys.conj(xs.first()),xs=xs.next();return ys}
  else if(l)return drop(l+n,xs);
  else inval('Cannot take from end of sequence with undefined end')}
concat=function(xs,ys){while(ys.length()>0){xs.conj(ys.first());ys.next()}return xs}
ops={
  tilde:op(
    function(a){return vop(a)?vdo(function(x){return bl(!x)},a):inval('~',a)},
    function(a,b){return numq(a)&&numq(b)?a==b:seqq(a)&&seqq(b)?bl(a.length()==b.length()&&reduce(function(m,x,y){return m&&x==y},true,a,b)):invals('~',a,b)}),
  plus:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return x+y},a,b):invals('+',a,b)}),
  dash:op(
    function(a){return vop(a)?vdo(function(x){return -x},a):inval('-',a)},
    function(a,b){return vop(a,b)?vdo(function(x,y){return x-y},a,b):invals('-',a,b)}),
  star:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return x*y},a,b):invals('*',a,b)}),
  percent:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return x/y},a,b):invals('%',a,b)}),
  bang:op(
    function(a){return numq(a)?function(){var i=0,out=seq([]);for(;i<a;i++)out=out.conj(i);return out}():ival('!',a)},
    function(a,b){return numq(a)&&numq(b)?a%b:invals('!',a,b)}),
  at:op(function(a){return bl(numq(a))}),
  hash:op(null,function(a,b){return numq(a)&&seqq(b)?take(a,b):invals('#',a,b)}),
  under:op(null,function(a,b){return numq(a)&&seqq(b)?drop(a,b):invals('_',a,b)}),
  caret:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return Math.pow(x,y)},a,b):invals('^',a,b)}),
  langle:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return bl(x<y)},a,b):invals('<',a,b)}),
  rangle:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return bl(x>y)},a,b):invals('>',a,b)}),
  amp:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return x>y?y:x},a,b):invals('&',a,b)}),
  pipe:op(null,function(a,b){return vop(a,b)?vdo(function(x,y){return x>y?x:y},a,b):invals('|',a,b)}),
  comma:op(
    function(a){return numq(a)?seq([a]):inval(',',a)},
    function(a,b){return numq(a)&&numq(b)?seq([a,b]):numq(a)&&seqq(b)?b.cons(a):seqq(a)&&numq(b)?a.conj(b):seqq(a)&&seqq(b)?concat(a,b):invals(',',a,b)}),
}
eval=function(tr,r,env){
  return typeof tr.type == 'undefined'           ? r(tr)
        :tr.type=='apply'||tr.type=='applyMonad' ? evall([tr.func,tr.arg],function(f,x){f(r,[x])},env)
        :tr.type=='curry'                        ? evall([tr.func,tr.arg],function(f,x){r(function(R,y){f(R,[x,y[0]])})},env)
        :tr.type=='func'                         ? r(function(R,a){var e={};for(var i=0;i<tr.args.length;i++)e[tr.args[i]]=a[i];evals(tr.body,R,e)})
        :tr.type=='vector'                       ? evalSeq(tr.values,r,env)
        :tr.type=='list'                         ? evalSeq(tr.values,r,env)
        :tr.type=='word'                         ? eval(env[tr.value],r,{})
        :tr.type=='symbol'                       ? r({type:'symbol',value:tr.value})
        :tr.type=='int'                          ? r(parseInt(tr.value))
        :tr.type=='nil'                          ? r(null)
        :ops[tr.type]                            ? r(ops[tr.type])
        :error('Invalid AST: '+json(tr))}
evals=function(es,r,env){var i=0,next=function(rs){i<es.length?eval(es[i++],next,env):r(rs)};next()}
evall=function(es,r,env){var i=0,out=[],next=function(rs){out.push(rs);i<es.length?eval(es[i++],next,env):r.apply(null,out)};eval(es[i++],next,env)}
evalSeq=function(es,r,env){var i=0,out=[],next=function(rs){out.push(rs);i<es.length?eval(es[i++],next,env):r(seq(out))};eval(es[i++],next,env)}
exports.run=function(src,r){var env={},tr=parse(src);evals(tr,r,env)}
