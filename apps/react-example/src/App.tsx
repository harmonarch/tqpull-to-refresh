import React, { useState, useRef, useEffect } from 'react';
import { PullToRefresh, PullToRefreshInstance, PullState, LoadMoreState } from '@tqpull-to-refresh/react';

interface ListItem { key: number; value: number; }

export default function App() {
  const [list, setList] = useState<ListItem[]>([]);
  const [pullState, setPullState] = useState<PullState>('pending');
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>('idle');

  const page = useRef(1);
  const itemCount = useRef(0);
  const ptrRef = useRef<PullToRefreshInstance>(null);

  // ---------------- 数据初始化与生成 ----------------
  function initList() {
    page.current = 1;
    itemCount.current = 0;
    setList(Array.from({ length: 15 }, (_, i) => ({ key: Math.random(), value: i + 1 })));
  }

  function createNewItem() {
    itemCount.current += 1;
    setList(prev => [{ key: Math.random(), value: itemCount.current }, ...prev]);
  }

  function createMoreItem() {
    setList(prev => [
      ...prev,
      ...Array.from({ length: 5 }, (_, i) => ({ key: Math.random(), value: prev.length + i + 1 }))
    ]);
  }

  useEffect(() => {
    initList();
  }, []);

  // ---------------- 核心回调函数 ----------------
  const onRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    initList();
    createNewItem();
    ptrRef.current?.setHasMore(true);
  };

  const onLoadMore = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    page.current += 1;
    createMoreItem();
    if (page.current >= 3) {
      ptrRef.current?.setHasMore(false);
    }
  };

  // ---------------- 自定义顶部 Indicator ----------------
  const CustomIndicator = () => (
    <div className="indicator-wrapper">
      <div className="indicator-circle">
        <div className={`indicator-icon ${pullState === 'refreshing' ? 'spinning' : ''}`}>
          <svg className="ios-spinner" viewBox="0 0 100 100" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <g stroke="currentColor" strokeWidth="8" strokeLinecap="round">
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
        </div>
      </div>
    </div>
  );

  const CustomFooter = () => (
    <div className="diy-footer" style={{ display: loadMoreState === 'idle' ? 'none' : 'block' }}>
      {loadMoreState === 'loading' && (
        <span><span className="diy-loading-icon">🔥</span> 拼命燃烧卡路里加载中...</span>
      )}
      {loadMoreState === 'noMore' && (
        <span style={{ color: '#ccc' }}>🛑 到底啦，一滴都不剩了！</span>
      )}
    </div>
  );

    // ✨ 监听状态，我们自己决定界面怎么画
  const onLoadMoreProgress = (state: LoadMoreState) => {
    if (state === 'idle') {
      // customFooter.style.display = 'none'; // 空闲时藏起来
    } else if (state === 'loading') {
      // customFooter.style.display = 'block';
      // customFooter.innerHTML = '<span class="diy-loading-icon">🔥</span> 拼命燃烧卡路里加载中...';
    } else if (state === 'noMore') {
      // customFooter.style.display = 'block';
      // customFooter.innerHTML = '🛑 到底啦，一滴都不剩了！';
      // customFooter.style.color = '#ccc'; // 没数据了，变灰
    }
  };
  
  // ★ 核心库运算完状态后抛出，由我们自己控制 UI 变化
  const onPulldownProgress = (state: PullState) => {
    setPullState(state);
    switch (state) {
      case 'pending':
         console.log('等待下拉...');
         break;
      case 'pulling':
        console.log('正在下拉，但距离不足以触发刷新');
        break;
      case 'releasing':
        console.log('下拉距离已足，松开即可刷新');        
        break;
      case 'refreshing':      
        console.log('正在刷新...'); 
        break;
      case 'refreshend':
        console.log('刷新结束，重置状态');
        break;
    }
  };

  return (
    <div id="app">
      <header className="app-header">React 首页</header>
      
      {/* 核心组件调用 */}
      <PullToRefresh
        ref={ptrRef}
        onRefresh={onRefresh}
        onLoadMore={onLoadMore}
        onPulldownProgress={onPulldownProgress}
        onLoadMoreProgress={onLoadMoreProgress}
        indicator={<CustomIndicator />}
        footer={<CustomFooter />}
      >       
        <ul style={{ minHeight: '100%', backgroundColor: '#fff' }}>
          {list.map((item) => (
            <li key={item.key}>新闻列表项 {item.value}</li>
          ))}
        </ul>
      </PullToRefresh>
    </div>
  );
}