import webrtc from './webrtc'
import webrtcRecorde from './record'
import getVideo from './getVideo'
import pressVideo from './pressVideo'

export function webrtcSurport() {
  return !!navigator.mediaDevices.getUserMedia
}
function getDOM(dom) {
  if (typeof dom === 'string') return (dom = document.querySelector(dom))
  return dom
}
async function degrade(config) {
  const file = await getVideo()
  const record = await pressVideo(file, config.chunks, config)
  return record
}

/**
 * 优先唤起webRTC录制视频，若不支持则降级用上传本地视频方式，IE录屏推荐用rtmp-streamer
 * @param {*} config { chunks: 每次录屏返回的数据包(webp/webm),
 *                     ended: 录屏结束回调方法，
 *                     duration： 录屏间隔时间，
 *                     collectTime: 录制的视频时长,
 *                     MINSIZE: 最小视频size，低于此值，则直接返回视频不做处理
 *                     MAXTIME: 视频的最大时长限制}
 * @return {Promise} 返回初始化成功后的相关配置信息，提供给外部随时stop录屏的接口
 * let recorder = await openVideo({
 *     video: document.getElementById('webrtc'),
 *     duration: 100,
 *     MINSIZE: 1024,
 *     MAXTIME: 15,
 *     chunks(chunk) {
 *       // sender chunks
 *
 *     },
 *     ended() {
 *       // record chunks ended
 *     },
 *     degrade:document.getElementById('p') // 不支持webRTC则降级处理打开本地视频
 *   })
 *
 *   setTimeout(() => {
 *       recorder.stop()
 *     }, 5000)
 */
export async function openVideo(config) {
  const isWebrtcSurport = webrtcSurport()
  if (isWebrtcSurport) {
    const stream = await webrtc(config.video)
    const record = webrtcRecorde(stream, config.video, config.chunks, config)
    return {
      stop() {
        const tracks = stream.getTracks()
        tracks[0].stop()
        record.stop()
      },
    }
  } else {
    if (!config.degrade) return Promise.reject({ isWebrtcSurport: false })
    if (config.degrade === true) return degrade(config)
    if (config.degrade) {
      let resolveP = null
      const promise = new Promise((resolve) => (resolveP = resolve))
      getDOM(config.degrade).addEventListener('click', function () {
        degrade(config).then(resolveP)
      })
      return promise
    }
  }
}
