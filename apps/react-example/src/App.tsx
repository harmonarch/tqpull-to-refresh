import React, { useState, useRef } from 'react';
import { PullToRefresh, PullToRefreshInstance, PullState, LoadMoreState } from '@tqpull-to-refresh/react';

export default function App() {
  // mimic the js-example variables
  const [list, setList] = useState<number[]>([]);
  const [pullState, setPullState] = useState<PullState>('pending');
  const [loadMoreState, setLoadMoreState] = useState<LoadMoreState>('idle');

  const page = useRef(1);
  const itemCount = useRef(0);

  // ref to the ptr instance and footer element like js example
  const ptrRef = useRef<PullToRefreshInstance>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  // ---------------- helpers (same names as js-example) ----------------
  function initList() {
    page.current = 1;
    itemCount.current = 0;
    setList(Array.from({ length: 15 }, (_, i) => i + 1));
  }

  function createNewItem() {
    itemCount.current += 1;
    setList(prev => [itemCount.current, ...prev]);
  }

  function createMoreItem() {
    setList(prev => [...prev, ...Array.from({ length: 5 }, (_, i) => prev.length + i + 1)]);
  }

  // ---------------- callbacks ----------------
  const onRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
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

  const onLoadMoreProgress = (state: LoadMoreState) => {
    setLoadMoreState(state);
    if (footerRef.current) {
      if (state === 'idle') {
        footerRef.current.style.display = 'none';
      } else if (state === 'loading') {
        footerRef.current.style.display = 'block';
        footerRef.current.innerHTML = '<span class="diy-loading-icon">🔥</span> 拼命燃烧卡路里加载中...';
      } else if (state === 'noMore') {
        footerRef.current.style.display = 'block';
        footerRef.current.innerHTML = '🛑 到底啦，一滴都不剩了！';
        footerRef.current.style.color = '#ccc';
      }
    }
  };

  // create indicator same as js example
  const CustomIndicator = () => (
    <div className="ptr-indicator-wrapper">
      <div className="ptr-indicator-circle">
        <div
          className={
            'ptr-indicator-icon' +
            (pullState === 'refreshing' ? ' ptr-spinning' : '')
          }
        >
          <svg
            className="ios-spinner"
            viewBox="0 0 100 100"
            width="30"
            height="30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g stroke="currentColor" strokeWidth="8" strokeLinecap="round">
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="1.0"
                transform="rotate(0 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.9"
                transform="rotate(30 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.8"
                transform="rotate(60 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.7"
                transform="rotate(90 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.6"
                transform="rotate(120 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.5"
                transform="rotate(150 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.4"
                transform="rotate(180 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.3"
                transform="rotate(210 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.2"
                transform="rotate(240 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.15"
                transform="rotate(270 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.1"
                transform="rotate(300 50 50)"
              />
              <line
                x1="50"
                y1="15"
                x2="50"
                y2="30"
                opacity="0.05"
                transform="rotate(330 50 50)"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );

  // run initList on mount
  React.useEffect(() => {
    initList();
  }, []);

  return (
    <div style={{ backgroundColor: '#f5f5f5' }}>
      <PullToRefresh
        ref={ptrRef}
        onRefresh={onRefresh}
        onLoadMore={onLoadMore}
        onPulldownProgress={onPulldownProgress}
        onLoadMoreProgress={onLoadMoreProgress}
        onPulling={distance => {}}
        resistance={2.5}
        distanceToRefresh={60}
        indicator={<CustomIndicator />}
        footer={<div ref={footerRef} />}
      >        {/* 真正的业务列表区域 */}
        {list.map(item => (
          <div key={item} style={{ padding: 20, borderBottom: '1px solid #eee' }}>
            新闻列表项 {item}
          </div>
        ))}
      </PullToRefresh>
    </div>
  );
}