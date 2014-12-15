macro(@){
  case{$lambda{[$params...]$body...}}=>{return #{(function($params ...){$body...})}}
  case{$lambda{$body...}}=>{
    letstx $x=[makeIdent('x',#{$lambda})],$y=[makeIdent('y',#{$lambda})],$z=[makeIdent('z',#{$lambda})];
    return #{(function($x,$y,$z){$body...})}}}
macro(^^){rule{}=>{return}}
macro A{rule{}=>{arguments}}
