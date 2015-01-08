Error.stackTraceLimit = 30
var util=require('util'),failures=0,spect=@util.inspect(x,{depth:N}),l=console.log,err=@{process.stderr.write('\n');console.error.apply(N,A)},s=JSON.stringify,diff=@{err('expected',spect(x));err('actually',spect(y))},success=@{process.stdout.write('.')},spy=@{l(x);^^x};

process.stdout.write('\n');
@!{
  var expect=@{[src,tokens]
    var ts=lex(src);
    if(ts.length!=tokens.length){err('lexing "'+src+'" produces '+ts.length+' tokens instead of '+tokens.length);diff(tokens,ts);failures=1;return};
    for(var i=0;i<tokens.length;i++){
      var a=ts[i],e=tokens[i];if(a.t!=e.t||a.v!=e.v||a.p!=e.p){err('Token '+(i+1)+' differs: '+s(a)+' != '+s(e));failures=1;return}};
    success()}
  expect('a b',[{t:'word',v:'a',p:'n'},{t:'word',v:'b',p:'n'}]);
  expect('`sym',[{t:'symbol',v:'sym',p:'n'}]);
  expect('1 1.2',[{t:'int',v:'1',p:'n'},{t:'float',v:'1.2',p:'n'}]);
  expect('"string" "str\\"ing"',[{t:'string',v:'string',p:'n'},{t:'string',v:'str"ing',p:'n'}]);
  expect('~!@#$%^&*,.<>?=+|-_;:()[]{}',[
    {t:'~',v:'~',p:'v'},
    {t:'!',v:'!',p:'v'},
    {t:'@',v:'@',p:'v'},
    {t:'#',v:'#',p:'v'},
    {t:'$',v:'$',p:'v'},
    {t:'%',v:'%',p:'v'},
    {t:'^',v:'^',p:'v'},
    {t:'&',v:'&',p:'v'},
    {t:'*',v:'*',p:'v'},
    {t:',',v:',',p:'v'},
    {t:'.',v:'.',p:'v'},
    {t:'<',v:'<',p:'v'},
    {t:'>',v:'>',p:'v'},
    {t:'?',v:'?',p:'v'},
    {t:'=',v:'=',p:'v'},
    {t:'+',v:'+',p:'v'},
    {t:'|',v:'|',p:'v'},
    {t:'-',v:'-',p:'v'},
    {t:'_',v:'_',p:'v'},
    {t:';',v:';',p:void 0},
    {t:':',v:':',p:'v'},
    {t:'(',v:'(',p:void 0},
    {t:')',v:')',p:void 0},
    {t:'[',v:'[',p:void 0},
    {t:']',v:']',p:void 0},
    {t:'{',v:'{',p:void 0},
    {t:'}',v:'}',p:void 0}]);
  expect("' /: \\: ': 'ello",[
    {t:"'",v:"'",p:'a'},
    {t:'/:',v:"/:",p:'a'},
    {t:'\\:',v:"\\:",p:'a'},
    {t:"':",v:"':",p:'a'},
    {t:"'",v:"'",p:'a'},
    {t:'word',v:'ello',p:'n'}]);
  expect("abCDN Ci Di Ni",[
    {t:'word',v:'abCDN',p:'n'},
    {t:'C',v:'C',p:'n'},{t:'word',v:'i',p:'n'},
    {t:'D',v:'D',p:'v'},{t:'word',v:'i',p:'n'},
    {t:'N',v:'N',p:'n'},{t:'word',v:'i',p:'n'}]);
  expect("abc\ndef",[{t:'word',v:'abc',p:'n'},{t:';',v:'\n',p:void 0},{t:'word',v:'def',p:'n'}]);
  expect("abc NB. this",[{t:'word',v:'abc',p:'n'}]);
};

@!{
  var expect=@{[src,expected]
    try{var ast=parse(src)}catch(e){err('Error parsing `'+src+'`: '+e);return}
    if(ast.length!=expected.length){err('parsing "'+src+'" produces '+ast.length+' statements instead of '+expected.length);diff(expected,ast);failures=1;return};
    for(var i=0;i<ast.length;i++){
      var a=ast[i],e=expected[i];
      if(s(a)!=s(e)){err('unexpected result when parsing "'+src+'"');diff(e,a);failures=1;return}}
    success()}
  var expectFailure=@{[src]try{parse(src);err('Should not have parsed `'+src+'`')}catch(e){}}
  expect('a b',[{t:'apply',p:'n',func:{t:'word',v:'a',p:'n'},arg:{t:'word',v:'b',p:'n'}}]);
  expect('1+',[{t:'curry',p:'v',func:{t:'+',v:'+',p:'v'},arg:{t:'int',v:'1',p:'n'}}]);
  expect("1'",[{t:'modNoun',p:'v',mod:{t:"'",v:"'",p:'a'},arg:{t:'int',v:'1',p:'n'}}]);
  expect("+1",[{t:'applyMonad',p:'n',func:{t:'+',v:'+',p:'v'},arg:{t:'int',v:'1',p:'n'}}]);
  expect("+-",[{t:'compose',p:'n',f:{t:'+',v:'+',p:'v'},g:{t:'-',v:'-',p:'v'}}]);
  expect("+/",[{t:'modVerb',p:'v',mod:{t:'/',v:'/',p:'a'},arg:{t:'+',v:'+',p:'v'}}]);
  expect("1+/",[
    {t:'curry',p:'v',
     func:{t:'modVerb',p:'v',
           mod:{t:'/',v:'/',p:'a'},
           arg:{t:'+',v:'+',p:'v'}},
     arg:{t:'int',v:'1',p:'n'}}]);
  expect("+/1",[
    {t:'applyMonad',p:'n',
     func:{t:'modVerb',p:'v',
           mod:{t:'/',v:'/',p:'a'},
           arg:{t:'+',v:'+',p:'v'}},
     arg:{t:'int',v:'1',p:'n'}}]);
  expect("2+/1",[
    {t:'applyMonad',p:'n',
     func:{t:'curry',p:'v',
           func:{t:'modVerb',p:'v',
                 mod:{t:'/',v:'/',p:'a'},
                 arg:{t:'+',v:'+',p:'v'}},
           arg:{t:'int',v:'2',p:'n'}},
     arg:{t:'int',v:'1',p:'n'}}]);
  expect('a;b',[{t:'word',v:'a',p:'n'},{t:'word',v:'b',p:'n'}]);
  expect('a+;b/',[
    {t:'curry',p:'v',
     func:{t:'+',v:'+',p:'v'},
     arg:{t:'word',v:'a',p:'n'}},
    {t:'modNoun',p:'v',
     mod:{t:'/',v:'/',p:'a'},
     arg:{t:'word',v:'b',p:'n'}}]);
  expectFailure('1-(}')
  expect('1-(2*3)+4',[
    {t:'applyMonad',p:'n',
     func:{t:'curry',p:'v',
           func:{t:'-',v:'-',p:'v'},
           arg:{t:'int',v:'1',p:'n'}},
     arg:{t:'applyMonad',p:'n',
          func:{t:'curry',p:'v',
                func:{t:'+',v:'+',p:'v'},
                arg:{t:'applyMonad',p:'n',
                     func:{t:'curry',p:'v',
                           func:{t:'*',v:'*',p:'v'},
                           arg:{t:'int',v:'2',p:'n'}},
                     arg:{t:'int',v:'3',p:'n'}}},
          arg:{t:'int',v:'4',p:'n'}}}]);
  expect('1-(2;3)+4',[
    {t:'applyMonad',p:'n',
     func:{t:'curry',p:'v',
           func:{t:'-',v:'-',p:'v'},
           arg:{t:'int',v:'1',p:'n'}},
     arg:{t:'applyMonad',p:'n',
          func:{t:'curry',p:'v',
                func:{t:'+',v:'+',p:'v'},
                arg:{t:'list',p:'n',
                     values:[{t:'int',v:'2',p:'n'},
                             {t:'int',v:'3',p:'n'}]}},
          arg:{t:'int',v:'4',p:'n'}}}]);
  expect('(2;(3;4);5)',[
    {t:'list',p:'n',
     values:[{t:'int',v:'2',p:'n'},
             {t:'list',p:'n',
              values:[{t:'int',v:'3',p:'n'},
                      {t:'int',v:'4',p:'n'}]},
             {t:'int',v:'5',p:'n'}]}]);
  expect('[x;y]',[
    {t:'args',p:'n',
     args:[{t:'word',v:'x',p:'n'},
           {t:'word',v:'y',p:'n'}]}]);
  expect('{x*2}',[
    {t:'func',p:'n',
     args:['x'],
     body:[{t:'applyMonad',p:'n',
            func:{t:'curry',p:'v',
                  func:{t:'*',v:'*',p:'v'},
                  arg:{t:'word',v:'x',p:'n'}},
            arg:{t:'int',v:'2',p:'n'}}]}]);
  expect('1 2 3',[
    {t:'vector',p:'n',
     values:[{t:'int',v:'1',p:'n'},
             {t:'int',v:'2',p:'n'},
             {t:'int',v:'3',p:'n'}]}]);
  expect('1.0 2.0 3.0',[
    {t:'vector',p:'n',
     values:[{t:'float',v:'1.0',p:'n'},
             {t:'float',v:'2.0',p:'n'},
             {t:'float',v:'3.0',p:'n'}]}]);
  expect('1.0 2 3.0',[
    {t:'vector',p:'n',
     values:[{t:'float',v:'1.0',p:'n'},
             {t:'int',v:'2',p:'n'},
             {t:'float',v:'3.0',p:'n'}]}]);
  expect('1+1 2 3',[
    {t:'applyMonad',p:'n',
     func:{t:'curry',p:'v',
           func:{t:'+',v:'+',p:'v'},
           arg:{t:'int',v:'1',p:'n'}},
     arg:{t:'vector',p:'n',
          values:[{t:'int',v:'1',p:'n'},
                  {t:'int',v:'2',p:'n'},
                  {t:'int',v:'3',p:'n'}]}}]);
  expect('((`a;5);)',[
    {t:'list',p:'n',
      values:[{t:'list',p:'n',
               values:[{t:'symbol',v:'a',p:'n'},
                       {t:'int',v:'5',p:'n'}]}]}]);
  expect('()',[{t:'list',p:'n',values:[]}]);
  expect('{[a]a}',[
    {t:'func',p:'n',
     args:['a'],
     body:[{t:'word',v:'a',p:'n'}]}]);
  expect('{{x}5}',[
    {t:'func',p:'n',
     args:[],
     body:[{t:'apply',p:'n',
            func:{t:'func',p:'n',
                  args:['x'],
                  body:[{t:'word',v:'x',p:'n'}]},
            arg:{t:'int',v:'5',p:'n'}}]}]);
  expect('{y}',[{t:'func',p:'n',args:['x','y'],body:[{t:'word',v:'y',p:'n'}]}]);
  expect('{z}',[{t:'func',p:'n',args:['x','y','z'],body:[{t:'word',v:'z',p:'n'}]}]);
  expect('%[;2]',[
    {t:'applyMonad',p:'n',
     func:{t:'%',v:'%',p:'v'},
     arg:{t:'args',p:'n',args:[void 0,{t:'int',v:'2',p:'n'}]}}]);
  expect('ne:~=',[
    {t:'apply',p:'n',
     func:{t:'assign',p:'n',name:'ne'},
     arg:{t:'compose',p:'n',
          f:{t:'~',v:'~',p:'v'},
          g:{t:'=',v:'=',p:'v'}}}]);
  expect('`"hello world"',[{t:'symbol',v:'hello world',p:'n'}]);
  expect('.data',[{t:'data',p:'n',v:'data'}]);
  expect('`a.obj',[{t:'apply',p:'n',func:{t:'symbol',v:'a',p:'n'},arg:{t:'data',p:'n',v:'obj'}}]);
  expect('.:N',[{t:'apply',p:'n',func:{t:'assign',p:'n',name:'.'},arg:{t:'N',v:'N',p:'n'}}]);
  expect('.nil:N',[{t:'apply',p:'n',func:{t:'assign',p:'n',name:'.nil'},arg:{t:'N',v:'N',p:'n'}}]);
};

@!{
  var ar=@{[R,v]seqq(v)?@!{var a=[];@(v){[xs]xs?xs.first(@{ar(@{[xr]a.push(xr);xs.next(C)},x)}):R(a)}}:R(v)},
      srcErr=@{err('`'+x+'` '+y)},
      expect=@{[src,x,opts]
    var c=0,go=@{[]run(src,@{[r]c=1;ar(@{[r]c=2
      if(x&&x.call){if(!x(r)){srcErr(src,'== '+spect(r)+' and does not pass check');failures=1;return}}
      else if(s(r)!=s(x)){srcErr(src,'== '+s(r)+' != '+s(x));failures=1;return}
      success()},r);if(c==1){srcErr(src,'produces unconvertable result '+spect(r));failures=1}},opts)}
    try{go()}catch(e){err(e)}
    if(c==0){srcErr(src,'does not return a result');failures=1}};
  expect('{x*2}2',4);
  expect('1 2 3',[1,2,3]);
  expect('"a" "b" "c"',['a','b','c']);
  expect('1+1 2 3',[2,3,4]);
  expect('1 2 3+1 2 3',[2,4,6]);
  expect('12-1 2 3 4 6',[11,10,9,8,6]);
  expect('-1',-1);
  expect('12%1 2 3 4 6',[12,6,4,3,2]);
  expect('%2',0.5);
  expect('%2 4 8 16',[0.5,0.25,0.125,0.0625]);
  expect('~5',0);
  expect('~0',1);
  expect('~0 1 2',[1,0,0]);
  expect('1 2~1 2',1);
  expect('1 2~3 3',0);
  expect('5!3',2);
  expect('!5',[0,1,2,3,4]);
  expect('@1',1);
  expect('@1 2 3',0);
  expect('@`sym',1);
  expect('@0.1',1);
  expect('@(1;2)',0);
  expect('#1 2 3 4',4);
  expect('2#1 2 3',[1,2]);
  expect('(-2)#1 2 3',[2,3]);
  expect('#"abc"',3);
  expect('_2.1',2);
  expect('_2.1 5.6',[2,5]);
  expect('2_1 2 3',[3]);
  expect('(-2)_1 2 3',[1]);
  expect('(2;3;5;7;11)[2]',5);
  expect('2^3',8);
  expect('3<5',1);
  expect('9<5',0);
  expect('9>5',1);
  expect('9>15',0);
  expect('5&9',5);
  expect('11&9',9);
  expect('5|11',11);
  expect('15|11',15);
  expect('|1 2 3',[3,2,1]);
  expect('15=15',1);
  expect('15=14',0);
  expect('2=0 1 2 3',[0,0,1,0]);
  expect('"a"="a"',1);
  expect('"a"="b"',0);
  expect('`a=`a',1);
  expect('`a=`b',0);
  expect('1,15',[1,15]);
  expect('1,15 30',[1,15,30]);
  expect('2 4,1 5',[2,4,1,5]);
  expect(',1',[1]);
  expect('N',null);
  expect('(1;2;3)',[1,2,3]);
  expect('((1;2);(3;4))',[[1,2],[3,4]]);
  expect('D((`a;1);(`b;2))`a',1);
  expect('D((`a;1);(`b;2))`b',2);
  expect('`a@D((`a;2);(`b;4))',2);
  expect('`b@D((`a;2);(`b;4))',4);
  expect('`a@~D((`a;0);(`b;4))',1);
  expect('`b@~D((`a;0);(`b;4))',0);
  expect('`b@~~D((`a;0);(`b;4))',1);
  expect('`a@1+D((`a;5);(`b;4))',6);
  expect('`c@1+D((`a;5);(`b;4))',null);
  expect('`a@(D((`a;5);(`b;4)))+2',7);
  expect('`a@(D((`a;5);(`b;4)))+D((`a;2);(`b;6))',7);
  expect('`a@D((`a;5);)',5);
  expect('`a@D()',null);
  expect('`a@(D()),(`a;2)',2);
  expect('`a@(`a;5),D()',5);
  expect('<D((`a;5);(`c;25))',[{t:'symbol',v:'a'},{t:'symbol',v:'c'}]);
  expect('>D((`a;5);(`c;25))',[5,25]);
  expect('(D((`a;5);(`b;10)))~D((`b;10);(`a;5))',1);
  expect('(D((`a;5);))~D((`a;10);)',0);
  expect('(D((`a;5);))~D((`b;5);)',0);
  expect('(D((`a;5);))~D((`b;10);)',0);
  expect('*5 10 15',5);
  expect('5#1L{x*2}',[1,2,4,8,16]);
  expect('5#1L{N}',[1]);
  expect('5#6,1L{N}',[6,1]);
  expect('5#(1L{N}),9',[1,9]);
  expect('(1L{x*2})[5]',32);
  expect('$5','5');
  expect('{[a]a*2}3',6);
  expect('{x*y}[9;5]',45);
  expect('({x*y}[9;])4',36);
  expect('{[a]a+({x}1)}15',16);
  expect('a:2;a',2);
  expect('c:C;Y{c!5};*c',5);
  expect(':[9]',9);
  expect(':[1;2;3]',2);
  expect(':[0;2;3]',3);
  expect(':[0;2;0;3;1;4;5]',4);
  expect(':[0;2;0;3;0;4;5]',5);
  expect('{x*x}\'1 2 3 4',[1,4,9,16]);
  expect('~\'0 2 0 4',[1,0,1,0]);
  expect('*\':1 2 3 4 5',[2,6,12,20]);
  expect('+/1 2 3',6);
  expect('{x%2}/30',@{^^x<1e-10});
  expect('5(*[2;])/3',96);
  expect('5{x*2}/1',32);
  expect('{x<100}{x*2}/1',128);
  expect('{x+2*y}/1 2 3',11);
  expect('+\\1 2 3 4',[1,3,6,10]);
  expect('{x+2*y}\\1 2 3 4',[1,5,11,19]);
  expect('2#/:("alpha";"bravo";"charlie")',['al','br','ch']);
  expect('0 1 2 3#\\:"alpha"',['','a','al','alp']);
  expect('ne:~=;ne[1;2]',1);
  expect('(~=)[1;1]',0);
  expect('1+(1 2;3 4;5 6)',[[2,3],[4,5],[6,7]]);
  expect('1 2 3+(1 2;3 4;5 6)',[[2,3],[5,6],[8,9]]);
  expect('(1 2;3 4;5 6)+5',[[6,7],[8,9],[10,11]]);
  expect('c:C;d:5+c;Y{c!2};*d',7);
  expect('c:C;d:~c;Y{c!0};*d',1);
  expect('c:C;d:c+2;Y{c!1};*d',3);
  expect('c:C;Y{c!1};**(c;)+5',6);
  expect('c:C;d:C;Y{c!1};Y{d!2};*c+d',3);
  @!{var src='c:C;!c;*c';
    try{run(src,@{});srcErr(src,'does not cause an error');failures=1}
    catch(e){if(e!='Cannot take from a closed channel'){srcErr(src,'errors with "'+e+'"');failures=1;^^}success()}}
  expect('c:C;#c',1);
  expect('c:C;!c;#c',0);
  expect('c:C;d:C;Y{c!5;c!9;!c};*c',5);
  expect('(`t;{x*2})$`li$1 2 3',@{
    ^^(x.length!=3)0;
    ^^(x[0].tagName!='li')0;
    ^^(x[0].children.length!=1)0;
    ^^(x[0].children[0].text!='2')0;
    ^^(x[1].tagName!='li')0;
    ^^(x[1].children.length!=1)0;
    ^^(x[1].children[0].text!='4')0;
    ^^(x[2].tagName!='li')0;
    ^^(x[2].children.length!=1)0;
    ^^(x[2].children[0].text!='6')0;
    ^^1});
  expect('(`a;`dataX;{x})$`li$1 2 3',@{
    ^^(x[0].properties['dataX']!=1)0;
    ^^(x[1].properties['dataX']!=2)0;
    ^^(x[2].properties['dataX']!=3)0;
    ^^1});
  expect('(`s;`fill;{x})$`li$("green";"blue")',@{
    ^^(x[0].properties.style.fill!="green")0;
    ^^(x[1].properties.style.fill!="blue")0;
    ^^1});
  expect('(`a;`height;{x*2})$(`a;`width;{x})$`rect$1 2 3',@{
    ^^(x[0].properties.width!=1)0;
    ^^(x[0].properties.height!=2)0;
    ^^(x[1].properties.width!=2)0;
    ^^(x[1].properties.height!=4)0;
    ^^(x[2].properties.width!=3)0;
    ^^(x[2].properties.height!=6)0;
    ^^1});
  expect('(`a;`width;{x};`height;{x*2})$`rect$1 2 3',@{
    ^^(x[0].properties.width!=1)0;
    ^^(x[0].properties.height!=2)0;
    ^^(x[1].properties.width!=2)0;
    ^^(x[1].properties.height!=4)0;
    ^^(x[2].properties.width!=3)0;
    ^^(x[2].properties.height!=6)0;
    ^^1});
  expect('(`a;`width;{y})$`rect$1 2 3',@{
    ^^(x[0].properties.width!=0)0;
    ^^(x[1].properties.width!=1)0;
    ^^(x[2].properties.width!=2)0;
    ^^1});
  expect('`ul@`li$1 2 3',@{
    ^^(x.tagName!='ul')0;
    ^^(x.children.length!=3)0;
    ^^(x.children[0].tagName!='li')0;
    ^^(x.children[1].tagName!='li')0;
    ^^(x.children[2].tagName!='li')0;
    ^^1});
  expect('`ul@(`t;{x})$`li$!15',@{
    ^^(x.tagName!='ul')0;
    ^^(x.children.length!=15)0;
    ^^1});
  expect('`div$"Hello, World"',@{
    ^^(x.tagName!='div')0;
    ^^(x.children.length!=1)0;
    ^^(x.children[0].text!="Hello, World")0;
    ^^1});
  expect('(`a;`width;5)$`rect',@{
    ^^(x.tagName!='rect')0;
    ^^(x.properties.width!=5)0;
    ^^1});
  expect('(`a;`width;5)$(`a;`height;15)$`rect',@{
    ^^(x.tagName!='rect')0;
    ^^(x.properties.width!=5)0;
    ^^(x.properties.height!=15)0;
    ^^1});
  expect('`svg`rect',@{
    ^^(x.tagName!='svg')0;
    ^^(x.children[0].tagName!='rect')0;
    ^^1});
  expect('(`svg$`rect)$`circle',@{
    ^^(x.tagName!='svg')0;
    ^^(x.children.length!=2)0;
    ^^(x.children[0].tagName!='rect')0;
    ^^(x.children[1].tagName!='circle')0;
    ^^1});
  expect('(`svg$`rect)$`circle$1 2 3',@{
    ^^(x.tagName!='svg')0;
    ^^(x.children.length!=4)0;
    ^^(x.children[0].tagName!='rect')0;
    ^^(x.children[1].tagName!='circle')0;
    ^^(x.children[2].tagName!='circle')0;
    ^^(x.children[3].tagName!='circle')0;
    ^^1});
  @!{var src='$`div$"Hello"',c=0,d=0;
    try{run.call({appendChild:@{d=1}},src,@{c=1})}
    catch(e){srcErr(src,'failed with "'+e+'"');failures=1;return}
    if(!c){srcErr(src,"does not return a result");failures=1;return}
    if(!d){srcErr(src,"does not add HTML to DOM");failures=1;return}
    success()};
  @!{var src='$`div$"Hello";$`div$"Goodbye"',c=0,d=0;
    try{run.call({appendChild:@{d++}},src,@{c=1})}
    catch(e){srcErr(src,'failed with "'+e+'"');failures=1;return}
    if(!c){srcErr(src,"does not return a result");failures=1;return}
    if(!d){srcErr(src,"does not add HTML to DOM");failures=1;return}
    if(d>1){srcErr(src,"calls appendChild more than once");failures;return}
    success()};
  @!{var src='$(`a;`width;200;`height;200)$`svg@(`a;`width;100;`height;100;`x;50;`y;50;`fill;"green")$`rect',c=0,d=0;
    try{run.call({appendChild:@{d++}},src,@{c=1})}
    catch(e){srcErr(src,'failed with "'+e+'"');failures=1;return}
    if(!c){srcErr(src,"does not return a result");failures=1;return}
    if(!d){srcErr(src,"does not add HTML to DOM");failures=1;return}
    if(d>1){srcErr(src,"calls appendChild more than once");failures;return}
    success()};
  expect('.hi','hello',{data:{hi:'hello'}});
  expect('+\\.nums',[5,15,30],{data:{nums:[5,10,15]}});
  expect('.obj`a','b',{data:{obj:{a:'b'}}});
  expect('`b(`a.obj)','c',{data:{obj:{a:{b:'c'}}}});
  expect('1+.obj',[[2,3],[4,5]],{data:{obj:[[1,2],[3,4]]}});
  expect('.:D((`nums;1 2 3););+/.nums',6);
  expect('.nums:1 2 3;+/.nums',6);
  expect('req`scales',5,{env:{req:@{[R,n]n.v=='scales'?R(5):R(-1)}}});
  @!{var src='$(`t;"';
    try{run(src,@{});srcErr(src,'does not cause an error');failures=1}
    catch(e){if(e!='Unmatched "'){srcErr(src,'errors with "'+e+'"');failures=1}success()}};
  expect('5\n NB. Comment',5);
};
process.stdout.write('\n');
process.exit(failures);
