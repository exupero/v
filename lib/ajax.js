module.exports=function(v,req){
  return {
    get:function(R,u){
      var req=new XMLHttpRequest();
      req.onreadystatechange=function(){if(req.readyState==4&&req.status==200){R(v.jsTv(JSON.parse(req.responseText)))}};
      req.open('GET',u,true);req.send()}
  }
}
