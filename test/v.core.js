Error.stackTraceLimit = 30
var util=require('util'),failures=0,spect=@util.inspect(x,{depth:N}),l=console.log,err=@{process.stderr.write('\n');console.error.apply(N,A)},s=JSON.stringify,diff=@{err('expected',spect(x));err('actually',spect(y))},success=@{process.stdout.write('.')},spy=@{l(x);^^x};

process.stdout.write('\n');
@!{
  var expect=@{[src,tokens]
    var ts=lex(src);
    if(ts.length!=tokens.length){err('lexing "'+src+'" produces '+ts.length+' tokens instead of '+tokens.length);diff(tokens,ts);failures=1;return};
    for(var i=0;i<tokens.length;i++){
      var a=ts[i],e=tokens[i];if(a.type!=e.type||a.value!=e.value||a.part!=e.part){err('Token '+(i+1)+' differs: '+s(a)+' != '+s(e));failures=1;return}};
    success()}
  expect('a b',[{type:'word',value:'a',part:'noun'},{type:'word',value:'b',part:'noun'}]);
  expect('`sym',[{type:'symbol',value:'sym',part:'noun'}]);
  expect('1 1.2',[{type:'int',value:'1',part:'noun'},{type:'float',value:'1.2',part:'noun'}]);
  expect('"string" "str\\"ing"',[{type:'string',value:'string',part:'noun'},{type:'string',value:'str"ing',part:'noun'}]);
  expect('~!@#$%^&*,.<>?=+|-_;:()[]{}',[
    {type:'~',value:'~',part:'verb'},
    {type:'!',value:'!',part:'verb'},
    {type:'@',value:'@',part:'verb'},
    {type:'#',value:'#',part:'verb'},
    {type:'$',value:'$',part:'verb'},
    {type:'%',value:'%',part:'verb'},
    {type:'^',value:'^',part:'verb'},
    {type:'&',value:'&',part:'verb'},
    {type:'*',value:'*',part:'verb'},
    {type:',',value:',',part:'verb'},
    {type:'.',value:'.',part:'verb'},
    {type:'<',value:'<',part:'verb'},
    {type:'>',value:'>',part:'verb'},
    {type:'?',value:'?',part:'verb'},
    {type:'=',value:'=',part:'verb'},
    {type:'+',value:'+',part:'verb'},
    {type:'|',value:'|',part:'verb'},
    {type:'-',value:'-',part:'verb'},
    {type:'_',value:'_',part:'verb'},
    {type:';',value:';',part:void 0},
    {type:':',value:':',part:'verb'},
    {type:'(',value:'(',part:void 0},
    {type:')',value:')',part:void 0},
    {type:'[',value:'[',part:void 0},
    {type:']',value:']',part:void 0},
    {type:'{',value:'{',part:void 0},
    {type:'}',value:'}',part:void 0}]);
  expect("' /: \\: ': 'ello",[
    {type:"'",value:"'",part:'adverb'},
    {type:'/:',value:"/:",part:'adverb'},
    {type:'\\:',value:"\\:",part:'adverb'},
    {type:"':",value:"':",part:'adverb'},
    {type:"'",value:"'",part:'adverb'},
    {type:'word',value:'ello',part:'noun'}]);
  expect("abCDN Ci Di Ni",[
    {type:'word',value:'abCDN',part:'noun'},
    {type:'channel',value:'C',part:'noun'},{type:'word',value:'i',part:'noun'},
    {type:'dict',value:'D',part:'verb'},{type:'word',value:'i',part:'noun'},
    {type:'nil',value:'N',part:'noun'},{type:'word',value:'i',part:'noun'}]);
  expect("abc\ndef",[{type:'word',value:'abc',part:'noun'},{type:';',value:'\n',part:void 0},{type:'word',value:'def',part:'noun'}]);
  expect("abc NB. this",[{type:'word',value:'abc',part:'noun'}]);
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
  expect('a b',[{type:'apply',part:'noun',func:{type:'word',value:'a',part:'noun'},arg:{type:'word',value:'b',part:'noun'}}]);
  expect('1+',[{type:'curry',part:'verb',func:{type:'+',value:'+',part:'verb'},arg:{type:'int',value:'1',part:'noun'}}]);
  expect("1'",[{type:'modNoun',part:'verb',mod:{type:"'",value:"'",part:'adverb'},arg:{type:'int',value:'1',part:'noun'}}]);
  expect("+1",[{type:'applyMonad',part:'noun',func:{type:'+',value:'+',part:'verb'},arg:{type:'int',value:'1',part:'noun'}}]);
  expect("+-",[{type:'compose',part:'noun',f:{type:'+',value:'+',part:'verb'},g:{type:'-',value:'-',part:'verb'}}]);
  expect("+/",[{type:'modVerb',part:'verb',mod:{type:'/',value:'/',part:'adverb'},arg:{type:'+',value:'+',part:'verb'}}]);
  expect("1+/",[
    {type:'curry',part:'verb',
     func:{type:'modVerb',part:'verb',
           mod:{type:'/',value:'/',part:'adverb'},
           arg:{type:'+',value:'+',part:'verb'}},
     arg:{type:'int',value:'1',part:'noun'}}]);
  expect("+/1",[
    {type:'applyMonad',part:'noun',
     func:{type:'modVerb',part:'verb',
           mod:{type:'/',value:'/',part:'adverb'},
           arg:{type:'+',value:'+',part:'verb'}},
     arg:{type:'int',value:'1',part:'noun'}}]);
  expect("2+/1",[
    {type:'applyMonad',part:'noun',
     func:{type:'curry',part:'verb',
           func:{type:'modVerb',part:'verb',
                 mod:{type:'/',value:'/',part:'adverb'},
                 arg:{type:'+',value:'+',part:'verb'}},
           arg:{type:'int',value:'2',part:'noun'}},
     arg:{type:'int',value:'1',part:'noun'}}]);
  expect('a;b',[{type:'word',value:'a',part:'noun'},{type:'word',value:'b',part:'noun'}]);
  expect('a+;b/',[
    {type:'curry',part:'verb',
     func:{type:'+',value:'+',part:'verb'},
     arg:{type:'word',value:'a',part:'noun'}},
    {type:'modNoun',part:'verb',
     mod:{type:'/',value:'/',part:'adverb'},
     arg:{type:'word',value:'b',part:'noun'}}]);
  expectFailure('1-(}')
  expect('1-(2*3)+4',[
    {type:'applyMonad',part:'noun',
     func:{type:'curry',part:'verb',
           func:{type:'-',value:'-',part:'verb'},
           arg:{type:'int',value:'1',part:'noun'}},
     arg:{type:'applyMonad',part:'noun',
          func:{type:'curry',part:'verb',
                func:{type:'+',value:'+',part:'verb'},
                arg:{type:'applyMonad',part:'noun',
                     func:{type:'curry',part:'verb',
                           func:{type:'*',value:'*',part:'verb'},
                           arg:{type:'int',value:'2',part:'noun'}},
                     arg:{type:'int',value:'3',part:'noun'}}},
          arg:{type:'int',value:'4',part:'noun'}}}]);
  expect('1-(2;3)+4',[
    {type:'applyMonad',part:'noun',
     func:{type:'curry',part:'verb',
           func:{type:'-',value:'-',part:'verb'},
           arg:{type:'int',value:'1',part:'noun'}},
     arg:{type:'applyMonad',part:'noun',
          func:{type:'curry',part:'verb',
                func:{type:'+',value:'+',part:'verb'},
                arg:{type:'list',part:'noun',
                     values:[{type:'int',value:'2',part:'noun'},
                             {type:'int',value:'3',part:'noun'}]}},
          arg:{type:'int',value:'4',part:'noun'}}}]);
  expect('(2;(3;4);5)',[
    {type:'list',part:'noun',
     values:[{type:'int',value:'2',part:'noun'},
             {type:'list',part:'noun',
              values:[{type:'int',value:'3',part:'noun'},
                      {type:'int',value:'4',part:'noun'}]},
             {type:'int',value:'5',part:'noun'}]}]);
  expect('[x;y]',[
    {type:'arglist',part:'noun',
     args:[{type:'word',value:'x',part:'noun'},
           {type:'word',value:'y',part:'noun'}]}]);
  expect('{x*2}',[
    {type:'func',part:'noun',
     args:['x'],
     body:[{type:'applyMonad',part:'noun',
            func:{type:'curry',part:'verb',
                  func:{type:'*',value:'*',part:'verb'},
                  arg:{type:'word',value:'x',part:'noun'}},
            arg:{type:'int',value:'2',part:'noun'}}]}]);
  expect('1 2 3',[
    {type:'vector',part:'noun',
     values:[{type:'int',value:'1',part:'noun'},
             {type:'int',value:'2',part:'noun'},
             {type:'int',value:'3',part:'noun'}]}]);
  expect('1.0 2.0 3.0',[
    {type:'vector',part:'noun',
     values:[{type:'float',value:'1.0',part:'noun'},
             {type:'float',value:'2.0',part:'noun'},
             {type:'float',value:'3.0',part:'noun'}]}]);
  expect('1.0 2 3.0',[
    {type:'vector',part:'noun',
     values:[{type:'float',value:'1.0',part:'noun'},
             {type:'int',value:'2',part:'noun'},
             {type:'float',value:'3.0',part:'noun'}]}]);
  expect('1+1 2 3',[
    {type:'applyMonad',part:'noun',
     func:{type:'curry',part:'verb',
           func:{type:'+',value:'+',part:'verb'},
           arg:{type:'int',value:'1',part:'noun'}},
     arg:{type:'vector',part:'noun',
          values:[{type:'int',value:'1',part:'noun'},
                  {type:'int',value:'2',part:'noun'},
                  {type:'int',value:'3',part:'noun'}]}}]);
  expect('((`a;5);)',[
    {type:'list',part:'noun',
      values:[{type:'list',part:'noun',
               values:[{type:'symbol',value:'a',part:'noun'},
                       {type:'int',value:'5',part:'noun'}]}]}]);
  expect('()',[{type:'list',part:'noun',values:[]}]);
  expect('{[a]a}',[
    {type:'func',part:'noun',
     args:['a'],
     body:[{type:'word',value:'a',part:'noun'}]}]);
  expect('{{x}5}',[
    {type:'func',part:'noun',
     args:[],
     body:[{type:'apply',part:'noun',
            func:{type:'func',part:'noun',
                  args:['x'],
                  body:[{type:'word',value:'x',part:'noun'}]},
            arg:{type:'int',value:'5',part:'noun'}}]}]);
  expect('{y}',[{type:'func',part:'noun',args:['x','y'],body:[{type:'word',value:'y',part:'noun'}]}]);
  expect('{z}',[{type:'func',part:'noun',args:['x','y','z'],body:[{type:'word',value:'z',part:'noun'}]}]);
  expect('%[;2]',[
    {type:'applyMonad',part:'noun',
     func:{type:'%',value:'%',part:'verb'},
     arg:{type:'arglist',part:'noun',args:[void 0,{type:'int',value:'2',part:'noun'}]}}]);
  expect('ne:~=',[
    {type:'apply',part:'noun',
     func:{type:'assign',part:'noun',name:'ne'},
     arg:{type:'compose',part:'noun',
          f:{type:'~',value:'~',part:'verb'},
          g:{type:'=',value:'=',part:'verb'}}}]);
};

@!{
  var ar=@{[R,v]
    if(v&&v.first&&v.next){var a=[],next=@{[xs]if(!xs){R(a);return}xs.first(@{ar(@{[xr]a.push(xr);xs.next(next)},x)})};next(v)}
    else R(v)},
      srcErr=@{err('`'+x+'` '+y)},
      expect=@{[src,x]
    var c=0,go=@{[]run(src,@{[r]c=1;ar(@{[r]
      if(x&&x.call){if(!x(r)){srcErr(src,'== '+spect(r)+' and does not pass check');failures=1;return}}
      else if(s(r)!=s(x)){srcErr(src,'== '+s(r)+' != '+s(x));failures=1;return}
      success()},r)})}
    try{go()}catch(e){err(e)}
    if(!c){srcErr(src,'does not return a result');failures=1}}
  expect('{x*2}2',4);
  expect('1 2 3',[1,2,3]);
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
  expect('_2.1',2);
  expect('_2.1 5.6',[2,5]);
  expect('2_1 2 3',[3]);
  expect('(-2)_1 2 3',[1]);
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
  expect('<D((`a;5);(`c;25))',[{type:'symbol',value:'a'},{type:'symbol',value:'c'}]);
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
  expect('$5','5');
  expect('$1 2 3',[1,2,3]);
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
  @!{var src='c:C;!c;*c';try{run(src,@{});srcErr(src,'does not cause an error');failures=1}catch(e){if(e!='Cannot take from a closed channel'){srcErr(src,'errors with "'+e+'"');failures=1}}}
  expect('c:C;#c',1);
  expect('c:C;!c;#c',0);
  expect('c:C;d:C;Y{c!5;c!9;!c};*c',5);
  expect('(`text;{x*2})$`li$1 2 3',@{
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
  expect('`ul(`li$1 2 3)',@{
    ^^(x.tagName!='ul')0;
    ^^(x.children.length!=3)0;
    ^^(x.children[0].tagName!='li')0;
    ^^(x.children[1].tagName!='li')0;
    ^^(x.children[2].tagName!='li')0;
    ^^1});
  expect('`div$"Hello, World"',@{
    ^^(x.tagName!='div')0;
    ^^(x.children.length!=1)0;
    ^^(x.children[0].text!="Hello, World")0;
    ^^1});
  @!{var src='$`div$"Hello"',c=0,d=0;
    try{run.call({appendChild:@{d=1}},src,@{c=1})}catch(e){srcErr(src,'failed with "'+e+'"');failures=1;return}
    if(!c){srcErr(src,"does not return a result");failures=1;return}
    if(!d){srcErr(src,"does not add HTML to DOM");failures=1;return}
    success()};
  @!{var src='$`div$"Hello";$`div$"Goodbye"',c=0,d=0;
    try{run.call({appendChild:@{d++}},src,@{c=1})}catch(e){srcErr(src,'failed with "'+e+'"');failures=1;return}
    if(!c){srcErr(src,"does not return a result");failures=1;return}
    if(!d){srcErr(src,"does not add HTML to DOM");failures=1;return}
    if(d>1){srcErr(src,"calls appendChild more than once");failures;return}
    success()};
};
process.stdout.write('\n');
process.exit(failures);
