document.addEventListener('DOMContentLoaded',function(){
var t=document.querySelector('[role="tablist"]');
if(!t)return;
var b=t.querySelectorAll('[role="tab"]');
var p=document.querySelectorAll('[role="tabpanel"]');
b.forEach(function(tab,i){
tab.addEventListener('click',function(){
b.forEach(function(t){
t.removeAttribute('data-active');
t.setAttribute('aria-selected','false');
});
tab.setAttribute('data-active','');
tab.setAttribute('aria-selected','true');
p.forEach(function(pan,j){
if(i===j){
pan.removeAttribute('hidden');
pan.removeAttribute('inert');
pan.style.display='';
}else{
pan.setAttribute('hidden','');
pan.setAttribute('inert','');
pan.style.display='none';
}
});
});
});
});
