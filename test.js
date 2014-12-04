var v=require('./v'),l=console.log,err=function(v){process.stdout.write('\n');console.error(v)},s=JSON.stringify,diff=function(ex,ac){err('expected',s(ex));err('actually',s(ac))},success=function(){process.stdout.write('.')};
(function(){
  var expect=function(src,tokens){
    var ts=v.lex(src);
    if(ts.length!=tokens.length){err('lexing "'+src+'" produces '+ts.length+' tokens instead of '+tokens.length);diff(tokens,ts);return};
    for(var i=0;i<tokens.length;i++){
      var a=ts[i],e=tokens[i];if(a.type!=e.type||a.value!=e.value||a.part!=e.part){err('Token '+(i+1)+' differs: '+s(a)+' != '+s(e));return}};
    success()}
  expect('a b',[{type:'word',value:'a',part:'noun'},{type:'word',value:'b',part:'noun'}]);
  expect('`sym',[{type:'symbol',value:'sym',part:'noun'}]);
  expect('1 1.2',[{type:'int',value:'1',part:'noun'},{type:'float',value:'1.2',part:'noun'}]);
  expect('"string" "str\\"ing"',[{type:'string',value:'string',part:'noun'},{type:'string',value:'str"ing',part:'noun'}]);
  expect('~!@#$%^&*,.<>?=+|-_;:()[]{}',[
    {type:'tilde',value:'~',part:'verb'},
    {type:'bang',value:'!',part:'verb'},
    {type:'at',value:'@',part:'verb'},
    {type:'hash',value:'#',part:'verb'},
    {type:'dollar',value:'$',part:'verb'},
    {type:'percent',value:'%',part:'verb'},
    {type:'caret',value:'^',part:'verb'},
    {type:'amp',value:'&',part:'verb'},
    {type:'star',value:'*',part:'verb'},
    {type:'comma',value:',',part:'verb'},
    {type:'dot',value:'.',part:'verb'},
    {type:'langle',value:'<',part:'verb'},
    {type:'rangle',value:'>',part:'verb'},
    {type:'query',value:'?',part:'verb'},
    {type:'equals',value:'=',part:'verb'},
    {type:'plus',value:'+',part:'verb'},
    {type:'pipe',value:'|',part:'verb'},
    {type:'dash',value:'-',part:'verb'},
    {type:'under',value:'_',part:'verb'},
    {type:'semi',value:';',part:void 0},
    {type:'colon',value:':',part:'verb'},
    {type:'laren',value:'(',part:void 0},
    {type:'raren',value:')',part:void 0},
    {type:'lacket',value:'[',part:void 0},
    {type:'racket',value:']',part:void 0},
    {type:'lace',value:'{',part:void 0},
    {type:'race',value:'}',part:void 0}]);
  expect("' '/ '\\ ': 'ello",[
    {type:'each',value:"'",part:'adverb'},
    {type:'eachRight',value:"'/",part:'adverb'},
    {type:'eachLeft',value:"'\\",part:'adverb'},
    {type:'eachPair',value:"':",part:'adverb'},
    {type:'each',value:"'",part:'adverb'},
    {type:'word',value:'ello',part:'noun'}]);
  expect("abCN Ci Ni",[
    {type:'word',value:'abCN',part:'noun'},
    {type:'channel',value:'C',part:'noun'},{type:'word',value:'i',part:'noun'},
    {type:'nil',value:'N',part:'noun'},{type:'word',value:'i',part:'noun'}]);
  expect("abc\ndef",[{type:'word',value:'abc',part:'noun'},{type:'semi',value:'\n',part:void 0},{type:'word',value:'def',part:'noun'}]);
  expect("abc / this",[{type:'word',value:'abc',part:'noun'}]);
})();
(function(){
  var expect=function(src,expected){
    try{var ast=v.parse(src)}catch(e){err('Error parsing `'+src+'`: '+e);return}
    if(ast.length!=expected.length){err('parsing "'+src+'" produces '+ast.length+' statements instead of '+expected.length);diff(expected,ast);return};
    for(var i=0;i<ast.length;i++){
      var a=ast[i],e=expected[i];
      if(s(a)!=s(e)){err('unexpected result when parsing "'+src+'"');diff(e,a);return}}
    success()}
  var expectFailure=function(src){try{v.parse(src);err('Should not have parsed `'+src+'`')}catch(e){}}
  expect('a b',[{type:'apply',part:'noun',func:{type:'word',value:'a',part:'noun'},arg:{type:'word',value:'b',part:'noun'}}]);
  expect('1+',[{type:'curry',part:'verb',func:{type:'plus',value:'+',part:'verb'},arg:{type:'int',value:'1',part:'noun'}}]);
  expect("1'",[{type:'modNoun',part:'verb',mod:{type:'each',value:"'",part:'adverb'},noun:{type:'int',value:'1',part:'noun'}}]);
  expect("+1",[{type:'applyMonad',part:'noun',func:{type:'plus',value:'+',part:'verb'},arg:{type:'int',value:'1',part:'noun'}}]);
  expect("+-",[{type:'compose',part:'verb',f:{type:'plus',value:'+',part:'verb'},g:{type:'dash',value:'-',part:'verb'}}]);
  expect("+/",[{type:'modVerb',part:'verb',mod:{type:'slash',value:'/',part:'adverb'},verb:{type:'plus',value:'+',part:'verb'}}]);
  expect("1+/",[
    {type:'curry',part:'verb',
     func:{type:'modVerb',part:'verb',
           mod:{type:'slash',value:'/',part:'adverb'},
           verb:{type:'plus',value:'+',part:'verb'}},
     arg:{type:'int',value:'1',part:'noun'}}]);
  expect("+/1",[
    {type:'applyMonad',part:'noun',
     func:{type:'modVerb',part:'verb',
           mod:{type:'slash',value:'/',part:'adverb'},
           verb:{type:'plus',value:'+',part:'verb'}},
     arg:{type:'int',value:'1',part:'noun'}}]);
  expect("2+/1",[
    {type:'applyMonad',part:'noun',
     func:{type:'curry',part:'verb',
           func:{type:'modVerb',part:'verb',
                 mod:{type:'slash',value:'/',part:'adverb'},
                 verb:{type:'plus',value:'+',part:'verb'}},
           arg:{type:'int',value:'2',part:'noun'}},
     arg:{type:'int',value:'1',part:'noun'}}]);
  expect('a;b',[{type:'word',value:'a',part:'noun'},{type:'word',value:'b',part:'noun'}]);
  expect('a+;b/',[
    {type:'curry',part:'verb',
     func:{type:'plus',value:'+',part:'verb'},
     arg:{type:'word',value:'a',part:'noun'}},
    {type:'modNoun',part:'verb',
     mod:{type:'slash',value:'/',part:'adverb'},
     noun:{type:'word',value:'b',part:'noun'}}]);
  expectFailure('1-(}')
  expect('1-(2*3)+4',[
    {type:'applyMonad',part:'noun',
     func:{type:'curry',part:'verb',
           func:{type:'dash',value:'-',part:'verb'},
           arg:{type:'int',value:'1',part:'noun'}},
     arg:{type:'applyMonad',part:'noun',
          func:{type:'curry',part:'verb',
                func:{type:'plus',value:'+',part:'verb'},
                arg:{type:'applyMonad',part:'noun',
                     func:{type:'curry',part:'verb',
                           func:{type:'star',value:'*',part:'verb'},
                           arg:{type:'int',value:'2',part:'noun'}},
                     arg:{type:'int',value:'3',part:'noun'}}},
          arg:{type:'int',value:'4',part:'noun'}}}]);
  expect('1-(2;3)+4',[
    {type:'applyMonad',part:'noun',
     func:{type:'curry',part:'verb',
           func:{type:'dash',value:'-',part:'verb'},
           arg:{type:'int',value:'1',part:'noun'}},
     arg:{type:'applyMonad',part:'noun',
          func:{type:'curry',part:'verb',
                func:{type:'plus',value:'+',part:'verb'},
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
    {type:'argList',part:'noun',
      args:[{type:'word',value:'x',part:'noun'},
            {type:'word',value:'y',part:'noun'}]}]);
  expect('{x*2}',[
    {type:'func',part:'noun',
     args:['x'],
     body:[{type:'applyMonad',part:'noun',
            func:{type:'curry',part:'verb',
                  func:{type:'star',value:'*',part:'verb'},
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
           func:{type:'plus',value:'+',part:'verb'},
           arg:{type:'int',value:'1',part:'noun'}},
     arg:{type:'vector',part:'noun',
          values:[{type:'int',value:'1',part:'noun'},
                  {type:'int',value:'2',part:'noun'},
                  {type:'int',value:'3',part:'noun'}]}}]);
})();
(function(){
  var ar=function(s){if(s.length&&s.first&&s.next){var a=[];while(s.length()>0){a.push(ar(s.first()));s=s.next()}return a}return s},
      expect=function(src,x){
    var c=0,
      go=function(){v.run(src,function(r){c=1;if(Object.prototype.toString.call(x)=='[object Array]')r=ar(r);if(s(r)!=s(x)){err('`'+src+'` == '+s(r)+' != '+s(x));return}success()})}
    try{go()}catch(e){err(e)}
    if(!c)err('`'+src+'` does not return a result')}
  expect('{x*2}2',4);
  expect('1 2 3',[1,2,3]);
  expect('1+1 2 3',[2,3,4]);
  expect('1 2 3+1 2 3',[2,4,6]);
  expect('12-1 2 3 4 6',[11,10,9,8,6]);
  expect('-1',-1);
  expect('12%1 2 3 4 6',[12,6,4,3,2]);
  expect('~5',0);
  expect('~0',1);
  expect('~0 1 2',[1,0,0]);
  expect('1 2~1 2',1);
  expect('1 2~3 3',0);
  expect('5!3',2);
  expect('!5',[0,1,2,3,4]);
  expect('@1',1);
  expect('@1 2 3',0);
  expect('2#1 2 3',[1,2]);
  expect('(-2)#1 2 3',[2,3]);
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
  expect('1,15',[1,15]);
  expect('1,15 30',[1,15,30]);
  expect(',1',[1]);
  expect('N',null);
  expect('(1;2;3)',[1,2,3]);
  expect('`hello',{type:'symbol',value:'hello'});
  expect('((1;2);(3;4))',[[1,2],[3,4]]);
})();
process.stdout.write('\n');
