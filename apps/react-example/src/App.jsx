import React from 'react'
import { PullToRefresh } from '@tqpull-to-refresh/react'

export default function App() {
  return (
    <div className="app">
      <h1>React 19 Pull-to-Refresh Example</h1>
      <PullToRefresh onRefresh={() => alert('refreshed!')}>
        <p>Pull down inside this area to trigger the refresh callback.</p>
      </PullToRefresh>
    </div>
  )
}
