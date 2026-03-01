let lasttime = 0
const nextFrame = window.requestAnimationFrame || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame || 
                  window.msRequestAnimationFrame ||
                  function(callback) {
                    let curtime = +new Date, delay = Math.max(1000 / 60, 1000 / 60 - (curtime - lasttime));
                    lasttime = curtime + delay
                    return setTimeout(callback, delay)
                  }

const cancelFrame = window.cancelAnimationFrame ||
                    window.webkitCancelAnimationFrame ||
                    clearTimeout;

// 动画函数
const tween = {
  linear: function (t, b, c, d) { return c * t / d + b; },
  ease: function (t, b, c, d) { return -c * ((t = t / d - 1) * t * t * t - 1) + b; },
  'ease-in': function (t, b, c, d) { return c * (t /= d) * t * t + b; },
  'ease-out': function (t, b, c, d) { return c * ((t = t / d - 1) * t * t + 1) + b; },
  'ease-in-out': function (t, b, c, d) { if ((t /= d / 2) < 1) return c / 2 * t * t * t + b; return c / 2 * ((t -= 2) * t * t + 2) + b; },
  bounce: function (t, b, c, d) { if ((t /= d) < (1 / 2.75)) { return c * (7.5625 * t * t) + b; } else if (t < (2 / 2.75)) { return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b; } else if (t < (2.5 / 2.75)) { return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b; } else { return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b; } }
}

// target 为目标距离
const slideTo = (el, target, callback) => {
  // 动画持续时间                    
  const duration = 1000
  let timer1 = null

  const stime = Date.now()
  cancelFrame(timer1)
  ani()
  function ani() {
    const offset = Math.min(duration, Date.now() - stime)
    const s = tween.ease(offset, 0, 1, duration)
    const newY = (1 - s) * target
    if (offset < duration) {
      el.style.transform = `translate(0px, ${newY}px)`
      timer1 = nextFrame(ani)
    } 
    if (Date.now() - stime > duration) {
      console.log('回弹动画结束')
      el.style.transform = `translate(0px, 0px)`
      cancelFrame(timer1)
      timer1 = null
      callback && callback()
    }
  }
}

export { cancelFrame, nextFrame, slideTo }