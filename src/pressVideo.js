import { CanvasRecord } from './record.js'

const config = {
  width: 450,
  height: 450,
  duration: 100,
  MAXTIME: 15,
  MINSIZE: 1048576, // 最小1M，1M内直接返回file数据，不做压缩处理
}

const URL = window.URL || window.webkitURL

// 页面上创建一个video用于抽帧
function createPlayVideo() {
  const video = document.createElement('video')
  // video1.style.display = "none";
  video.setAttribute('width', config.width)
  video.setAttribute('height', config.height)
  video.style.width = config.width
  video.style.height = config.height
  video.muted = true
  document.body.append(video)
  return video
}

// 文件转化为blob地址
function getFileURL(file) {
  const createObjectURL = URL.createObjectURL
  if (createObjectURL) return createObjectURL(file)
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = function () {
      resolve(reader.result)
    }
  })
}

/**
 * 利用canvas实现视频抽帧
 * @param {*} videoFile -  input获取的file文件
 * @param {*} cb        -  返回image/webp的图片chunks
 * @param {*} option    -  配置 {duration(录屏间隔), MAXTIME(要求视频最大时长), MINSIZE(要求视频最小size)}
 * @return {Promise}    -  录屏结束会resolve掉promise，返回的record可以提供给外部随时stop掉录屏
 */
export default async function pressVideo(videoFile, cb, options) {
  try {
    options && Object.assign(config, options) // 自定义配置

    const video = createPlayVideo()

    // 视频太小，可直接返回文件
    if (videoFile.size < config.MINSIZE) {
      console.info(`视频小于${config.MINSIZE}, 不做处理`)
      cb && cb(videoFile)
      return videoFile
    }

    const record = CanvasRecord(video, cb, options) // 监听play事件，准备录屏

    video.onloadedmetadata = function () {
      if (video.duration > config.MAXTIME) {
        URL.revokeObjectURL(video.src) // 释放blob资源
        record.stop() // 移除video的监听事件
        throw new Error(`视频时长${video.duration}超过${config.MAXTIME}`)
      }
    }

    video.src = await getFileURL(videoFile)
    video.play()

    return record
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}
