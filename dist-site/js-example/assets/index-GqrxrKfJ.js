var x=Object.defineProperty;var v=(t,e,n)=>e in t?x(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var i=(t,e,n)=>v(t,typeof e!="symbol"?e+"":e,n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const p of s.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&r(p)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();function M(t,{insertAt:e}={}){if(typeof document>"u")return;const n=document.head||document.getElementsByTagName("head")[0],r=document.createElement("style");r.type="text/css",e==="top"&&n.firstChild?n.insertBefore(r,n.firstChild):n.appendChild(r),r.styleSheet?r.styleSheet.cssText=t:r.appendChild(document.createTextNode(t))}M(`.ptr-indicator-wrapper {
  position: absolute;
  top: -60px;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  opacity: 0;
  pointer-events: none;
}
.ptr-indicator-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
}
.ptr-icon {
  width: 20px;
  height: 20px;
  color: #007bff;
  display: flex;
}
@keyframes ptr-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.ptr-spinning {
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ptr-spin 0.8s linear infinite;
}
.ptr-footer {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #888;
  font-size: 14px;
  display: none;
}
.ptr-footer .ptr-icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  color: #888;
}
`);var L=class{constructor(t){i(this,"options");i(this,"indicator");i(this,"icon");i(this,"footer");i(this,"startY",0);i(this,"currentY",0);i(this,"distance",0);i(this,"isPulling",!1);i(this,"state","pending");i(this,"hasMore",!0);i(this,"loadMoreState","idle");i(this,"onScrollFn");i(this,"iosSpinnerSvg",`<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="8" stroke-linecap="round">
      <line x1="50" y1="15" x2="50" y2="30" opacity="1.0" transform="rotate(0 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.9" transform="rotate(30 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.8" transform="rotate(60 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.7" transform="rotate(90 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.6" transform="rotate(120 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.5" transform="rotate(150 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.4" transform="rotate(180 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.3" transform="rotate(210 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.2" transform="rotate(240 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.15" transform="rotate(270 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.1" transform="rotate(300 50 50)"/><line x1="50" y1="15" x2="50" y2="30" opacity="0.05" transform="rotate(330 50 50)"/>
    </g>
  </svg>`);this.options={indicator:void 0,distanceToRefresh:60,resistance:2.5,onPulling:()=>{},onPulldownProgress:()=>{},onLoadMore:void 0,distanceToLoadMore:50,footer:void 0,onLoadMoreProgress:()=>{},...t},this.onTouchStart=this.onTouchStart.bind(this),this.onTouchMove=this.onTouchMove.bind(this),this.onTouchEnd=this.onTouchEnd.bind(this),this.onScrollFn=this.handleScroll.bind(this),this.init()}init(){const{container:t}=this.options;t.style.position="relative",this.setupIndicator(),this.setupFooter(),t.addEventListener("touchstart",this.onTouchStart),t.addEventListener("touchmove",this.onTouchMove,{passive:!1}),t.addEventListener("touchend",this.onTouchEnd),this.options.onLoadMore&&t.addEventListener("scroll",this.onScrollFn)}setupFooter(){if(!this.options.onLoadMore)return;const{content:t,footer:e}=this.options;e?(this.footer=e,this.footer.parentNode||t.appendChild(this.footer)):(this.footer=document.createElement("div"),this.footer.className="ptr-footer",t.appendChild(this.footer))}setLoadMoreState(t){this.loadMoreState!==t&&(this.loadMoreState=t,this.options.onLoadMoreProgress(t),this.updateDefaultFooterUI())}handleScroll(){if(!this.options.onLoadMore||this.loadMoreState!=="idle")return;const{container:t,distanceToLoadMore:e}=this.options;t.scrollTop+t.clientHeight>=t.scrollHeight-e&&this.triggerLoadMore()}triggerLoadMore(){this.setLoadMoreState("loading"),this.options.onLoadMore().then(()=>{this.hasMore&&this.setLoadMoreState("idle")}).catch(()=>{this.hasMore&&this.setLoadMoreState("idle")})}setHasMore(t){this.hasMore=t,t?this.loadMoreState==="noMore"&&this.setLoadMoreState("idle"):this.setLoadMoreState("noMore")}updateDefaultFooterUI(){!this.footer||this.options.footer||(this.loadMoreState==="noMore"?(this.footer.innerHTML="没有更多数据了",this.footer.style.display="flex"):this.loadMoreState==="loading"?(this.footer.innerHTML=`<div class="ptr-icon ptr-spinning">${this.iosSpinnerSvg}</div> <span>正在加载...</span>`,this.footer.style.display="flex"):this.footer.style.display="none")}setupIndicator(){const{container:t,indicator:e}=this.options;if(e){this.indicator=e,this.indicator.parentNode||t.appendChild(this.indicator);return}this.indicator=document.createElement("div"),this.indicator.className="ptr-indicator-wrapper";const n=document.createElement("div");n.className="ptr-indicator-circle",this.icon=this.createDefaultIcon(),n.appendChild(this.icon),this.indicator.appendChild(n),t.appendChild(this.indicator)}createDefaultIcon(){const t=document.createElement("div");return t.className="ptr-icon",t.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.67-1.35"/></svg>',t}setState(t){this.state!==t&&(this.state=t,this.options.onPulldownProgress(t))}onTouchStart(t){this.state!=="refreshing"&&(this.options.container.scrollTop>0||(this.startY=t.touches[0].clientY,this.isPulling=!0,this.setState("pending"),this.options.content.style.transition="none",this.indicator.style.transition="none"))}calculateDamping(t){return t/(1+t/(window.innerHeight/this.options.resistance))}onTouchMove(t){if(!this.isPulling)return;this.currentY=t.touches[0].clientY;const e=this.currentY-this.startY;if(e<0){this.isPulling=!1;return}t.cancelable&&t.preventDefault(),this.distance=this.calculateDamping(e),this.setState(this.distance>this.options.distanceToRefresh?"releasing":"pulling");const n=Math.min(this.distance/this.options.distanceToRefresh,1);this.indicator.style.opacity=n.toString(),this.indicator.style.transform=`translate3d(0, ${this.distance}px, 0)`,this.icon&&(this.icon.style.transform=`rotate(${this.distance*4}deg)`),this.options.onPulling(this.distance)}onTouchEnd(){if(!this.isPulling)return;this.isPulling=!1;const t="transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1)";this.indicator.style.transition=t,this.state==="releasing"?(this.setState("refreshing"),this.indicator.style.transform=`translate3d(0, ${this.options.distanceToRefresh}px, 0)`,this.icon&&(this.icon.style.transform="",this.icon.classList.add("ptr-spinning")),this.options.onRefresh().then(()=>this.reset()).catch(()=>this.reset())):this.reset()}reset(){this.setState("refreshend"),this.distance=0,this.options.content.style.transition="transform 0.3s",this.options.content.style.transform="translate3d(0, 0, 0)",this.indicator.style.transition="transform 0.3s, opacity 0.3s",this.indicator.style.transform="translate3d(0, 0, 0)",this.indicator.style.opacity="0",setTimeout(()=>{this.icon&&this.icon.classList.remove("ptr-spinning"),this.indicator.style.transition="none"},300)}destroy(){const{container:t}=this.options;t.removeEventListener("touchstart",this.onTouchStart),t.removeEventListener("touchmove",this.onTouchMove),t.removeEventListener("touchend",this.onTouchEnd),t.removeEventListener("scroll",this.onScrollFn),this.indicator&&this.indicator.parentNode&&this.indicator.parentNode.removeChild(this.indicator)}};const m=document.getElementById("ptr-container"),T=document.getElementById("ptr-content"),c=document.getElementById("list"),a=document.getElementById("my-custom-footer");let d=1,u=0;const h=document.createElement("div");h.className="ptr-indicator-wrapper";const f=document.createElement("div");f.className="ptr-indicator-circle";const l=document.createElement("div");l.className="ptr-indicator-icon";l.innerHTML=`
  <svg class="ios-spinner" viewBox="0 0 100 100" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <g stroke="currentColor" stroke-width="8" stroke-linecap="round">
      <line x1="50" y1="15" x2="50" y2="30" opacity="1.0" transform="rotate(0 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.9" transform="rotate(30 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.8" transform="rotate(60 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.7" transform="rotate(90 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.6" transform="rotate(120 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.5" transform="rotate(150 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.4" transform="rotate(180 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.3" transform="rotate(210 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.2" transform="rotate(240 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.15" transform="rotate(270 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.1" transform="rotate(300 50 50)"/>
      <line x1="50" y1="15" x2="50" y2="30" opacity="0.05" transform="rotate(330 50 50)"/>
    </g>
  </svg>
`;f.appendChild(l);h.appendChild(f);m.appendChild(h);function g(){c.innerHTML="";for(let t=1;t<=15;t++){const e=document.createElement("li");e.innerText=`初始数据 - ${t}`,c.appendChild(e)}}function w(t){const e=document.createElement("li");e.innerText=`新数据 - ${t}`,c.insertBefore(e,c.children[0])}function S(){for(let t=1;t<=5;t++){const e=document.createElement("li");e.innerText=`第 ${d} 页的数据 - ${t}`,c.appendChild(e)}}window.onload=()=>{g()};const y=new L({container:m,content:T,indicator:h,distanceToRefresh:60,footer:a,onLoadMoreProgress:t=>{t==="idle"?a.style.display="none":t==="loading"?(a.style.display="block",a.innerHTML='<span class="diy-loading-icon">🔥</span> 拼命燃烧卡路里加载中...'):t==="noMore"&&(a.style.display="block",a.innerHTML="🛑 到底啦，一滴都不剩了！",a.style.color="#ccc")},onPulldownProgress:t=>{switch(t){case"pending":console.log("等待下拉...");break;case"pulling":console.log("正在下拉，但距离不足以触发刷新");break;case"releasing":console.log("下拉距离已足，松开即可刷新");break;case"refreshing":console.log("正在刷新..."),l.classList.add("ptr-spinning");break;case"refreshend":console.log("刷新结束，重置状态"),l.classList.remove("ptr-spinning");break}},onRefresh:()=>new Promise(t=>{setTimeout(()=>{d=1,u++,g(),w(u),y.setHasMore(!0),t()},2e3)}),onLoadMore:()=>new Promise(t=>{setTimeout(()=>{d++,S(),d>=3&&y.setHasMore(!1),t()},1500)})});
