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
  }
macro(^^){
  rule{$x:expr $y:expr}=>{if($x)return $y}
  rule{$x:expr}=>{return $x}
  rule{}=>{return}}
macro A{rule{}=>{arguments}}
