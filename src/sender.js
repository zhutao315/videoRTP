// TODO：缓存 + 发送数据机制,  消费数据 data_consume
function f(url, useSocket = true, chunkLimit) {
  self.addEventListener(
    'message',
    function (e) {
      console.log('push to worker', e.data)
      if (useSocket) {
        Consumer.sender.socket(e.data)
      } else {
        if (e.data === 0) {
          Consumer.sender.fetch(0).then(() => {
            Consumer.sender.destroy = true
            self.postMessage({
              code: 0,
              data: Consumer.storage.bufs,
            })
          })
        } else {
          Consumer.wirte(e.data)
        }
      }
    },
    false
  )

  const Consumer = {
    storage: {
      bufs: [],
      cursor: 0,
    },
    // 读取缓存
    read(flag = false) {
      if (this.storage.bufs.length === 0) return []
      if (this.storage.cursor === this.storage.bufs.length) return []
      if (flag) {
        const cursor = this.storage.cursor
        this.storage.cursor = this.storage.bufs.length
        return {
          data: this.storage.bufs.slice(cursor),
          start: cursor,
        }
      }
      const arr = []
      let total = 0

      for (let i = this.storage.cursor; i < this.storage.bufs.length; i++) {
        if (total + this.storage.bufs[i].size > (chunkLimit || 1024 * 1024 * 3)) {
          const cursor = this.storage.cursor
          this.storage.cursor = i
          return {
            data: arr.length ? arr : [this.storage.bufs[i]],
            start: arr.length ? i - 1 : cursor,
          }
        }
        arr.push(this.storage.bufs[i])
        total += this.storage.bufs[i].size
      }
    },
    wirte(data) {
      const bufs = Consumer.storage.bufs

      bufs.push(data)

      Consumer.sender.send(data) // 通知发送器，发送数据
    },
    sender: {
      wx: null,
      promise: null,
      fetchPromise: [],
      initSocket() {
        Consumer.sender.ws = new WebSocket(url)
        return (Consumer.sender.promise = new Promise((resolve) => {
          Consumer.sender.ws.onopen = () => {
            resolve(Consumer.sender.ws)
          }
        }))
      },
      socket(data) {
        if (!Consumer.sender.promise) Consumer.sender.promise = Consumer.sender.initSocket()
        Consumer.sender.promise.then((wx) => {
          console.log('socket', data)
          wx.send(data)
          return wx
        })
      },
      fetch(data) {
        // return fetch(url, { method: "POST", body: data, headers: {} });

        // TODO 直接传blob，一次传多张图片

        // let file = new File([data], self.id + '.jpg', {type: 'image/jpeg'})
        const formData = new FormData()
        formData.enctype = 'multipart/form-data'
        const obj = data === 0 ? Consumer.read(true) : data

        obj.data.forEach((file, index) => {
          formData.append('files', file, `${obj.start + index}.webp`)
        })
        // formData.append('file', new Blob(['123'], {type: 'text/plain'}))
        formData.append('start', obj.start)
        formData.append('end', obj.start + obj.data.length)
        formData.append('total', data === 0 ? Consumer.storage.cursor : null)

        const promise = new Promise((resolve) => {
          const xhr = new XMLHttpRequest()

          // 开始上传
          xhr.open('POST', url, true)
          xhr.send(formData)
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
              resolve(xhr)
            }
          }
        })

        Consumer.sender.fetchPromise.push(promise)

        return data === 0 ? Promise.all(Consumer.sender.fetchPromise) : promise
      },
      destroy: false,
      block: false,
      // 工人是否空闲
      sendAbles: [true, true, true],
      isSendAble() {
        return !Consumer.sender.sendAbles.some((status) => !status)
      },
      // 将缓存里面的数据分批发送出去
      send() {
        // TODO 优化：websocket 走缓存机制，多条websocket可同时进行
        // if (useSocket) {
        //   let data = Consumer.read(1);
        //   if (data === -1) return (Consumer.sender.block = true);
        //   Consumer.sender.worker(0, data);
        //   return;
        // }

        const datas = Consumer.read()

        // 缓存中的数据不足，则发送器阻塞掉
        if (!datas || datas.length === 0) return (Consumer.sender.block = true)

        Consumer.sender.fetch(datas).then(() => {
          Consumer.sender.send()
        })
      },
    },
  }
}

// 获取 typeArray 字节数组
function base64ToTypeArray(base64) {
  // let base64 = canvas.toDataURL();    // 同样通过canvas的toDataURL方法将canvas图片Base64编码

  const bstr = atob(base64.split(',')[1]) // atob是将base64编码解码，去掉data:image/png;base64,部分
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return u8arr
}

// 大数据传送，data : 0 | base64, url: 请求地址支持普通请求或者websocket
export default function sender({ url, useSocket = true, chunkLimit }) {
  // 生成线程
  const blob = new Blob(['(' + f.toString() + ")('" + url + "'," + useSocket + ',' + chunkLimit + ')'])
  const script = window.URL.createObjectURL(blob)
  const worker = new Worker(script)
  const tool = {}
  worker.onmessage = (event) => {
    if (event.data && event.data.code === 0) {
      // document.getElementsByTagName('video')[0].src = ''
      worker.terminate() // 终止worker线程
      tool.finished && tool.finished(event.data.data)
    }
  }

  tool.send = function (data) {
    // let binary = data === 0 ? 0 : base64ToTypeArray(data)
    worker.postMessage(data)
  }

  return tool
}
