var tokens,lex,parse,expr,exprs,wraps,eval,evals,binop,eof=-1,log=console.log,spy=function(v){log(v);return v},error=function(m){throw m};
tokens=function(input,st){
  var t={},s=0,p=0,w=0,ts=[];
  t.nextChar=function(){
    if(p>=input.length){w=0;return eof}
    var c=input[p];w=1;p+=w;return c}
  t.backup=function(){p-=w}
  t.peek=function(){var c=this.nextChar();this.backup();return c}
  t.accept=function(valid){
    if(valid.indexOf(this.nextChar())>=0)return true;
    this.backup();return false}
  t.acceptRun=function(valid){
    while(valid.indexOf(this.nextChar())>=0){}
    this.backup()}
  t.until=function(stop){
    while(true){
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
    while(true){
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
        case 'D':e('dict','verb');break;
        case 'N':e('nil','noun');break;
        case 'L':e('lazy','verb');break;
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
expr=function(ts){
  if(ts.length==1)return ts[0];
  var st,bind,i=ts.length-1;
  st=function(a,b){
    return a.type=='int'&&b.type=='int'      ? 5
          :a.type=='int'&&b.type=='float'    ? 5
          :a.type=='float'&&b.type=='int'    ? 5
          :a.type=='float'&&b.type=='float'  ? 5
          :a.type=='vector'&&b.type=='int'   ? 5
          :a.type=='vector'&&b.type=='float' ? 5
          :a.part=='noun'&&b.part=='noun'    ? 1
          :a.part=='verb'&&b.part=='verb'    ? 1
          :a.part=='verb'&&b.part=='noun'    ? 2
          :a.part=='noun'&&b.part=='verb'    ? 3
          :a.part=='noun'&&b.part=='adverb'  ? 4
          :a.part=='verb'&&b.part=='adverb'  ? 4
          :0}
  bind=function(a,b){ts.splice(i-1,2,
     a.type=='int'&&b.type=='int'      ? {type:'vector',part:'noun',values:[a,b]}
    :a.type=='int'&&b.type=='float'    ? {type:'vector',part:'noun',values:[a,b]}
    :a.type=='float'&&b.type=='int'    ? {type:'vector',part:'noun',values:[a,b]}
    :a.type=='float'&&b.type=='float'  ? {type:'vector',part:'noun',values:[a,b]}
    :a.type=='vector'&&b.type=='int'   ? {type:'vector',part:'noun',values:a.values.concat([b])}
    :a.type=='vector'&&b.type=='float' ? {type:'vector',part:'noun',values:a.values.concat([b])}
    :a.part=='noun'&&b.part=='noun'    ? {type:'apply',part:'noun',func:a,arg:b}
    :a.part=='noun'&&b.part=='verb'    ? {type:'curry',part:'verb',func:b,arg:a}
    :a.part=='noun'&&b.part=='adverb'  ? {type:'modNoun',part:'verb',mod:b,noun:a}
    :a.part=='verb'&&b.part=='noun'    ? {type:'applyMonad',part:'noun',func:a,arg:b}
    :a.part=='verb'&&b.part=='verb'    ? {type:'compose',part:'verb',f:a,g:b}
    :a.part=='verb'&&b.part=='adverb'  ? {type:'modVerb',part:'verb',mod:b,verb:a}
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
  var stack=[],i,t,es,unmatched=function(v){throw 'Unmatched `'+v+'`'},
      li=function(type){var l=stack.pop();if(l.type!=type)unmatched(l.value);return l.i},
      body=function(ld,f){var j=li(ld),tss=ts.slice(j+1,i),tss2=tss.slice();ts.splice(j,i-j+1,f(exprs(tss),tss2))}
  for(i=0;i<ts.length;i++){
    t=ts[i];
    if(t.type=='laren'||t.type=='lacket'||t.type=='lace')stack.push({i:i,type:t.type,value:t.value});
    else if(t.type=='raren')body('laren',function(es){return es.length==1?es[0]:{type:'list',part:'noun',items:es}});
    else if(t.type=='racket')body('lacket',function(es){return {type:'argList',part:'noun',args:es}});
    else if(t.type=='race')body('lace',function(es,tss){
      var args=tss.filter(function(t){return t.type=='word'&&(t.value=='x'||t.value=='y'||t.value=='z')}).map(function(t){return t.value});
      return {type:'func',part:'noun',args:args,body:es}})}
  return ts}
exports.parse=parse=function(src){return exprs(wraps(lex(src)))}
binop=function(f){return function(R,a){R(f.apply(null,a))}}
eval=function(tr,r,env){
  if(typeof tr.type == 'undefined'){r(tr);return}
  if(tr.type=='apply'||tr.type=='applyMonad'){eval(tr.func,function(f){eval(tr.arg,function(x){f(r,[x])},env)},env);return}
  if(tr.type=='curry'){eval(tr.func,function(f){eval(tr.arg,function(x){r(function(R,y){f(R,[x,y])})},env)},env);return}
  if(tr.type=='func'){r(function(R,a){var e={};for(var i=0;i<tr.args.length;i++)e[tr.args[i]]=a[i];evals(tr.body,R,e)});return}
  if(tr.type=='star'){r(binop(function(a,b){return a*b}));return}
  if(tr.type=='word'){eval(env[tr.value],function(rs){r(rs)},{});return}
  if(tr.type=='int'){r(parseInt(tr.value));return}
  error('Invalid AST: '+JSON.stringify(tr))}
evals=function(es,r,env){var i=0,next=function(rs){i<es.length?eval(es[i++],next,env):r(rs)};next()}
exports.run=function(src,r){var env={},tr=parse(src);evals(tr,r,env)}
