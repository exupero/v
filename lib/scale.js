var d3=require('d3');
module.exports=function(v,req){
  return {
    linear:function(R,d,r){
      v.vTjs(function(d){
        v.vTjs(function(r){
          var s=d3.scale.linear().domain(d).range(r);
          R(v.atomic(function(x){return s(x)}));
        },r)
      },d)
    }
  }
}
