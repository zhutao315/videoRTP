/**
 * mediaRecord 录屏方式
 * @param {*} mediaStream - webrtc 返回的媒体流，用于MediaRecord录制返回blob视频段
 * @param {*} cb - MediaRecord 每次录屏返回的视频段传入执行回调
 * @param {*} config - {collectTime：每次录得的视频段的时长，ended：录屏结束后的回调}
 * @returns {*} mediaRecorder, 用于外部停止录屏等操作
 * 与 MediaStreamRecord.js 的录屏差异：
 * startRecording() {... setTimeout(stopRecording, 3000)}
 * mediaRecorder.onstop() { startRecording()}
 * 此方式录制出来的视频段是完整的独立的视频段，而本方法录制的视频段是整个视频段切割成的若干部分
 */
export function RTCRecord(mediaStream, cb, config = {}) {
  let stream = null
  const collectTime = config.collectTime || 1000
  let options = { mimeType: 'video/webm;codecs=vp9' }
  let mediaRecorder = null

  function getMimeType() {
    let options = { mimeType: 'video/webm;codecs=vp9' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`)
      options = { mimeType: 'video/webm;codecs=vp8' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not Supported`)
        options = { mimeType: 'video/webm' }
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error(`${options.mimeType} is not Supported`)
          options = { mimeType: '' }
        }
      }
    }

    return options
  }

  function startRecording() {
    try {
      mediaRecorder = new MediaRecorder(stream, options)
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e)
      return
    }

    mediaRecorder.onstop = (event) => {
      mediaRecorder = null
      config.ended && config.ended()
    }

    mediaRecorder.ondataavailable = handleDataAvailable
    mediaRecorder.start(collectTime) // collect 1000ms of data

    // setTimeout(stopRecording, 3000)
  }

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      // recordedBlobs.push(event.data);
      // stream && startRecording()
      cb && cb(event.data)
    }
  }

  // function stopRecording() {
  //   mediaRecorder.stop();
  // }

  stream = mediaStream
  options = getMimeType()

  startRecording()

  mediaStream.onended = function () {
    mediaStream = stream = null
  }

  return mediaRecorder
}

/**
 * 在视频开始播放前调用canvas定时录屏
 * @param {DOM} video  -  要录制的原视频DOM对象
 * @param {*} cb  -  每次录屏 返回的'image/webp' 图片数据
 * @param {*} options  -  {duration: 录屏间隔时长，ended: 录屏结束的回调方法 }
 * @returns {Promise}  -  stop: 停止录屏接口，canvasRecordPromise： 判断是否成功录屏
 */
export function CanvasRecord(video, cb, options = {}) {
  let timer = null
  const videoHeight = video.videoHeight || video.clientHeight
  const videoWidth = video.videoWidth || video.clientWidth
  const record = {
    ondataavailable() {},
    onstop() {},
    stop: stopRecord,
    start() {
      video.play()
    },
  }
  // 视频开始播放
  video.addEventListener('canplay', startRecord, false)

  // 视频播放完
  video.addEventListener('ended', endRecord, false)

  let canvas = document.createElement('canvas')
  canvas.style.display = 'none'
  canvas.setAttribute('height', videoHeight)
  canvas.setAttribute('width', videoWidth)

  function recordFunc() {
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, videoHeight, videoWidth)
    canvas.toBlob((blob) => {
      record.ondataavailable(blob, context)
    }, 'image/webp')
  }

  function startRecord() {
    recordFunc()
    timer = setInterval(() => {
      recordFunc()
    }, options.duration || 200)
  }

  function endRecord() {
    stopRecord()
    record.onstop()
    console.log('视频录制结束!')
  }

  function stopRecord() {
    timer && clearInterval(timer)
    video.removeEventListener('canplay', startRecord, false)
    video.removeEventListener('ended', endRecord, false)
    canvas = null
  }

  return record
}

/**
 * This method stops recording MediaStream.
 * @param {MediaStream} mediaStream - webrtc 返回的媒体流，用于MediaRecord录制返回blob视频段
 * @param {DOM} video - webrtc 的呈现视频的video元素，用于Canvas 返回视频画面
 * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
 * @param {Object} config - duration：canvas 每隔{duration}捕获视频画面，collectTime：MediaRecord 每次捕获{collectTime}时长的视频段
 * @method
 * @memberof MediaStreamRecorder
 * @example
 * webrtcRecorde(stream, config.video, function(data) {
 *         worker.send(data)
 *      })
 */
export default function record(mediaStream, video, cb, config = {}) {
  return typeof MediaRecorder !== 'undefined' ? RTCRecord(mediaStream, cb, config) : CanvasRecord(video, cb, config)
}
