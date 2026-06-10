export function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export function throttle(fn, limit) {
  let inThrottle = false
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function debouncePromise(fn, delay) {
  let timer = null
  return async function (...args) {
    return new Promise((resolve) => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(async () => {
        const result = await fn.apply(this, args)
        resolve(result)
      }, delay)
    })
  }
}

export function batchUpdate(updates, batchSize = 50) {
  return new Promise((resolve) => {
    const batches = []
    for (let i = 0; i < updates.length; i += batchSize) {
      batches.push(updates.slice(i, i + batchSize))
    }

    let completed = 0
    batches.forEach(async (batch) => {
      await Promise.all(batch)
      completed++
      if (completed === batches.length) {
        resolve()
      }
    })
  })
}
