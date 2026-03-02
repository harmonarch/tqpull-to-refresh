import './style.css'; 
// import '@my-ptr/core/style.css'; 
import { PullToRefresh } from '@tqpull-to-refresh/core';

const container = document.getElementById('ptr-container');
const content = document.getElementById('ptr-content');
const list = document.getElementById('list');

// 获取自定义 Footer 节点
const customFooter = document.getElementById('my-custom-footer');

let page = 1; // 用于模拟分页加载
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

function initList () {
  // 清空列表
  list.innerHTML = '';

  for (let i = 1; i <= 15; i++) {
    const item = document.createElement('li');
    item.innerText = `初始数据 - ${i}`;
    list.appendChild(item);
  }
}

function createNewItem(count) {
  const newItem = document.createElement('li');
  newItem.innerText = `新数据 - ${count}`;
  list.insertBefore(newItem, list.children[0]);
}

function createMoreItem() {
  for (let i = 1; i <= 5; i++) {
    const newItem = document.createElement('li');
    newItem.innerText = `第 ${page} 页的数据 - ${i}`;
    list.appendChild(newItem);
  }
}

window.onload = () => {
  initList();
}

const ptr = new PullToRefresh({
  container: container,
  content: content,
  // indicatorIcon: customIcon,
  distanceToRefresh: 60,

  // ✨ 将自定义 DOM 交给 Core 挂载
  footer: customFooter,

  // ✨ 监听状态，我们自己决定界面怎么画
  onLoadMoreStateChange: (state) => {
    console.log('上拉加载状态:', state);
    if (state === 'idle') {
      customFooter.style.display = 'none'; // 空闲时藏起来
    } else if (state === 'loading') {
      customFooter.style.display = 'block';
      customFooter.innerHTML = '<span class="diy-loading-icon">🔥</span> 拼命燃烧卡路里加载中...';
    } else if (state === 'noMore') {
      customFooter.style.display = 'block';
      customFooter.innerHTML = '🛑 到底啦，一滴都不剩了！';
      customFooter.style.color = '#ccc'; // 没数据了，变灰
    }
  },
  
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
        page = 1;
        itemCount++;
        initList();
        createNewItem(itemCount);
        ptr.setHasMore(true);
        resolve(); 
      }, 2000); 
    });
  },

  onLoadMore: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        page++;
        createMoreItem();

        if (page >= 3) {
          ptr.setHasMore(false); // 触发 noMore 状态
        }
        resolve(); 
      }, 1500); // 留长一点时间看你的心跳动画
    });
  }
});