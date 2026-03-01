import './style.css'; 
// import '@my-ptr/core/style.css'; 
import { PullToRefresh } from '@tqpull-to-refresh/core';

const container = document.getElementById('ptr-container');
const content = document.getElementById('ptr-content');
const list = document.getElementById('list');

let itemCount = 0;

const customIcon = document.createElement('div');
customIcon.innerHTML = `
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
</svg>`

new PullToRefresh({
  container: container,
  content: content,
  // indicatorIcon: customIcon,
  distanceToRefresh: 60,
  
  // ★ 核心库运算完状态后抛出，由我们自己控制 UI 变化
  onStateChange: (state) => {
    switch (state) {
      case 'pending':
      case 'pulling':
        // customIcon.textContent = '👀';
        // customIcon.classList.remove('icon-loading');
        // customText.textContent = '下拉寻找惊喜...';
        break;
      case 'releasing':
        // customIcon.textContent = '🚀';
        // customText.textContent = '松开准备起飞...';
        break;
      case 'refreshing':
        // customIcon.textContent = '💖';
        // customIcon.classList.add('icon-loading'); // 增加心跳动画
        // customText.textContent = '拼命为你加载中...';
        break;
    }
  },

  onRefresh: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        itemCount++;
        const newItem = document.createElement('li');
        newItem.innerHTML = `<strong>✨ 新鲜动态 ${itemCount}</strong>`;
        newItem.style.backgroundColor = '#f0fafe';
        list.insertBefore(newItem, list.children[0]); 
        resolve(); 
      }, 200000); 
    });
  }
});