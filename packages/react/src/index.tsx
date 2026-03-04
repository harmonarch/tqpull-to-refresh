// packages/react/src/index.tsx

import React, { useEffect, useRef, useImperativeHandle, forwardRef, ReactNode } from 'react';
// 直接复用 Core 包的类型和核心类
import { PullToRefresh as CorePTR, PullState, LoadMoreState } from '@tqpull-to-refresh/core';
import '@tqpull-to-refresh/core/style.css';

// 1. 定义组件的 Props，完美继承 Core 的配置，并将 DOM 替换为 ReactNode
export interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  onLoadMore?: () => Promise<void>;
  distanceToRefresh?: number;
  distanceToLoadMore?: number;
  resistance?: number;
  
  // 支持传入 React 组件作为自定义视图
  indicator?: ReactNode;
  footer?: ReactNode;
  
  onPulldownProgress?: (state: PullState) => void;
  onLoadMoreProgress?: (state: LoadMoreState) => void;
  onPulling?: (distance: number) => void;
  
  // 允许外部控制容器的样式
  className?: string;
  style?: React.CSSProperties;
}

// 2. 定义对外暴露的实例方法
export interface PullToRefreshInstance {
  setHasMore: (hasMore: boolean) => void;
}

export const PullToRefresh = forwardRef<PullToRefreshInstance, PullToRefreshProps>((props, ref) => {
  const {
    children,
    onRefresh,
    onLoadMore,
    distanceToRefresh,
    distanceToLoadMore,
    resistance,
    indicator,
    footer,
    onPulldownProgress,
    onLoadMoreProgress,
    onPulling,
    className,
    style
  } = props;

  // 获取真实 DOM 的引用，交给 Core 去控制
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  // 保存 Core 实例
  const ptrInstance = useRef<CorePTR | null>(null);

  // 3. 将 setHasMore 方法暴露给使用该组件的父级
  useImperativeHandle(ref, () => ({
    setHasMore: (hasMore: boolean) => {
      ptrInstance.current?.setHasMore(hasMore);
    }
  }));

  // 4. 组件挂载时初始化 Core，卸载时销毁
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    ptrInstance.current = new CorePTR({
      container: containerRef.current,
      content: contentRef.current,
      // 如果用户传了 React 节点，就把它的外壳 DOM 传给 Core；否则传 undefined 让 Core 生成默认的
      indicator: indicator ? indicatorRef.current! : undefined,
      footer: footer ? footerRef.current! : undefined,
      
      onRefresh,
      onLoadMore,
      distanceToRefresh,
      distanceToLoadMore,
      resistance,
      onPulldownProgress,
      onLoadMoreProgress,
      onPulling
    });

    return () => {
      ptrInstance.current?.destroy();
      ptrInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5. 渲染基础的 DOM 骨架
  return (
    <div
      ref={containerRef}
      className={className}
      style={{ 
        height: '100%', 
        overflowY: 'auto', 
        WebkitOverflowScrolling: 'touch', // iOS 顺滑滚动 
        position: 'relative', // 必须为 relative，作为 indicator 的参考系
        ...style 
      }}
    >
      {/* 只有在用户传入了自定义 indicator 时，才渲染这个占位壳 */}
      {indicator && (
        <div ref={indicatorRef}>
          {indicator}
        </div>
      )}

      {/* 滚动的内容区 */}
      <div 
        ref={contentRef} 
        style={{ minHeight: '100%', backgroundColor: '#fff', position: 'relative', zIndex: 2 }}
      >
        {children}
        
        {/* 自定义 footer 的占位壳 */}
        {footer && (
          <div ref={footerRef}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

PullToRefresh.displayName = 'PullToRefresh';