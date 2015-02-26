macro(@){
  case{$lambda{[$params...]$body...}}=>{return #{(function($params ...){$body...})}}
  case{$lambda{$body...}}=>{
    letstx $x=[makeIdent('x',#{$lambda})],$y=[makeIdent('y',#{$lambda})],$z=[makeIdent('z',#{$lambda})];
    return #{(function($x,$y,$z){$body...})}}
  case{$lambda($args...){[$params...]$body...}}=>{
    letstx $C=[makeIdent('C',#{$lambda})];
    return #{var $C=(function($params...){$body...});$C($args...)}}
  case{$lambda($args...){$body...}}=>{
    letstx $C=[makeIdent('C',#{$lambda})],$x=[makeIdent('x',#{$lambda})],$y=[makeIdent('y',#{$lambda})],$z=[makeIdent('z',#{$lambda})];
    return #{var $C=(function($x,$y,$z){$body...});$C($args...)}}
  case{$lambda!{$body...}}=>{return #{(function(){$body...})()}}
  case{$lambda $e:expr}=>{
    letstx $x=[makeIdent('x',#{$lambda})],$y=[makeIdent('y',#{$lambda})],$z=[makeIdent('z',#{$lambda})];
    return #{(function($x,$y,$z){return $e})}}
}
macro(^^){
  rule{$x:expr $y:expr}=>{if($x)return $y}
  rule{$x:expr}=>{return $x}
  rule{}=>{return}}
macro A{rule{}=>{arguments}}
macro S{
  rule{{$x:ident<-$y:ident($args...)}}=>{$y(function($x){return $x},$args...)}
  rule{{$x:ident<-$a:ident.$y:ident($args...)}}=>{$a.$y(function($x){return $x},$args...)}
  rule{{$x:ident<-$a:ident.$y:ident($args...);$rest...}}=>{$a.$y(function($x){S{$rest...}},$args...)}
  rule{{$x:ident<-$y:ident($args...);$rest...}}=>{$y(function($x){S{$rest...}},$args...)}
  rule{{$x:ident(,)...<-$y:ident($args...);$rest...}}=>{$y(function($x(,)...){S{$rest...}},$args...)}
  rule{{$x:ident(,)...<-$a:ident.$y:ident($args...);$rest...}}=>{$a.$y(function($x(,)...){S{$rest...}},$args...)}
  rule{{$x:ident<-$y:ident}}=>{$y(function($x){return $x})}
  rule{{$x:ident<-$a:ident.$y:ident}}=>{$a.$y(function($x){return $x})}
  rule{{$x:ident<-$a:ident.$y:ident;$rest...}}=>{$a.$y(function($x){S{$rest...}})}
  rule{{$x:ident<-$y:ident;$rest...}}=>{$y(function($x){S{$rest...}})}
  rule{{$x:ident(,)...<-$y:ident;$rest...}}=>{$y(function($x(,)...){S{$rest...}})}
  rule{{$x:ident(,)...<-$a:ident.$y:ident;$rest...}}=>{$a.$y(function($x(,)...){S{$rest...}})}
  rule{{$x:expr;$rest...}}=>{$x;S{$rest...}}
  rule{{$x:expr}}=>{return $x}
}
