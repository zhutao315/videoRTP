'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

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
/**
 * 在视频开始播放前调用canvas定时录屏
 * @param {DOM} video  -  要录制的原视频DOM对象
 * @param {*} cb  -  每次录屏 返回的'image/webp' 图片数据
 * @param {*} options  -  {duration: 录屏间隔时长，ended: 录屏结束的回调方法 }
 * @returns {Promise}  -  stop: 停止录屏接口，canvasRecordPromise： 判断是否成功录屏
 */

function CanvasRecord(video, cb) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var timer = null;
  var endFunc = null;
  var promise = new Promise(function (resolve) {
    return endFunc = resolve;
  }); // 视频开始播放

  video.addEventListener('canplay', startRecord, false); // 视频播放完

  video.addEventListener('ended', endRecord, false);

  function getVideoHeight() {
    return video.videoHeight || video.clientHeight;
  }

  function getVideoWidth() {
    return video.videoWidth || video.clientWidth;
  }

  function getCanvas() {
    var canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.setAttribute('height', getVideoHeight());
    canvas.setAttribute('width', getVideoWidth());
    document.body.append(canvas);
    return canvas;
  }

  function startRecord() {
    var canvas = getCanvas();
    var context = canvas.getContext('2d');
    var videoHeight = getVideoHeight();
    var videoWidth = getVideoWidth();
    timer = setInterval(function () {
      context.drawImage(video, 0, 0, videoHeight, videoWidth);
      canvas.toBlob(function (blob) {
        cb && cb(blob);
      }, 'image/webp'); // cb && cb(canvas.toDataURL('image/webp'))
    }, options.duration || 200);
  }

  function endRecord() {
    cancel();
    endFunc();
    console.log('视频播放完毕！');
  }

  function cancel() {
    timer && clearInterval(timer);
    video.removeEventListener('canplay', startRecord, false);
    video.removeEventListener('ended', endRecord, false);
    options.ended && options.ended();
  }

  return {
    stop: cancel,
    canvasRecordPromise: promise
  };
}

var config = {
  width: 450,
  height: 450,
  duration: 100,
  MAXTIME: 15,
  MINSIZE: 1048576 // 最小1M，1M内直接返回file数据，不做压缩处理

};
var URL = window.URL || window.webkitURL; // 页面上创建一个video用于抽帧

function createPlayVideo() {
  var video = document.createElement('video'); // video1.style.display = "none";

  video.setAttribute('width', config.width);
  video.setAttribute('height', config.height);
  video.style.width = config.width;
  video.style.height = config.height;
  video.muted = true;
  document.body.append(video);
  return video;
} // 文件转化为blob地址


function getFileURL(file) {
  var createObjectURL = URL.createObjectURL;
  if (createObjectURL) return createObjectURL(file);
  return new Promise(function (resolve) {
    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
      resolve(reader.result);
    };
  });
}
/**
 * 利用canvas实现视频抽帧
 * @param {*} videoFile -  input获取的file文件
 * @param {*} cb        -  返回image/webp的图片chunks
 * @param {*} option    -  配置 {duration(录屏间隔), MAXTIME(要求视频最大时长), MINSIZE(要求视频最小size)}
 * @return {Promise}    -  录屏结束会resolve掉promise，返回的record可以提供给外部随时stop掉录屏
 */


function pressVideo(_x, _x2, _x3) {
  return _pressVideo.apply(this, arguments);
}

function _pressVideo() {
  _pressVideo = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(videoFile, cb, options) {
    var video, record;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            options && Object.assign(config, options); // 自定义配置

            video = createPlayVideo(); // 视频太小，可直接返回文件

            if (!(videoFile.size < config.MINSIZE)) {
              _context.next = 7;
              break;
            }

            console.info("\u89C6\u9891\u5C0F\u4E8E".concat(config.MINSIZE, ", \u4E0D\u505A\u5904\u7406"));
            cb && cb(videoFile);
            return _context.abrupt("return", videoFile);

          case 7:
            record = CanvasRecord(video, cb, options); // 监听play事件，准备录屏

            video.onloadedmetadata = function () {
              if (video.duration > config.MAXTIME) {
                URL.revokeObjectURL(video.src); // 释放blob资源

                record.stop(); // 移除video的监听事件

                throw new Error("\u89C6\u9891\u65F6\u957F".concat(video.duration, "\u8D85\u8FC7").concat(config.MAXTIME));
              }
            };

            _context.next = 11;
            return getFileURL(videoFile);

          case 11:
            video.src = _context.sent;
            video.play();
            return _context.abrupt("return", record);

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](0);
            console.error(_context.t0);
            return _context.abrupt("return", Promise.reject(_context.t0));

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[0, 16]]);
  }));
  return _pressVideo.apply(this, arguments);
}

exports.default = pressVideo;
