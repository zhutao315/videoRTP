(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime-corejs3/core-js-stable/promise'), require('@babel/runtime-corejs3/regenerator'), require('@babel/runtime-corejs3/helpers/asyncToGenerator'), require('@babel/runtime-corejs3/core-js-stable/instance/concat'), require('@babel/runtime-corejs3/core-js-stable/set-interval'), require('@babel/runtime-corejs3/core-js-stable/object/assign')) :
  typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime-corejs3/core-js-stable/promise', '@babel/runtime-corejs3/regenerator', '@babel/runtime-corejs3/helpers/asyncToGenerator', '@babel/runtime-corejs3/core-js-stable/instance/concat', '@babel/runtime-corejs3/core-js-stable/set-interval', '@babel/runtime-corejs3/core-js-stable/object/assign'], factory) :
  (global = global || self, factory(global.videoRTP = {}, global._Promise, global._regeneratorRuntime, global._asyncToGenerator, global._concatInstanceProperty, global._setInterval, global._Object$assign));
}(this, (function (exports, _Promise, _regeneratorRuntime, _asyncToGenerator, _concatInstanceProperty, _setInterval, _Object$assign) { 'use strict';

  _Promise = _Promise && Object.prototype.hasOwnProperty.call(_Promise, 'default') ? _Promise['default'] : _Promise;
  _regeneratorRuntime = _regeneratorRuntime && Object.prototype.hasOwnProperty.call(_regeneratorRuntime, 'default') ? _regeneratorRuntime['default'] : _regeneratorRuntime;
  _asyncToGenerator = _asyncToGenerator && Object.prototype.hasOwnProperty.call(_asyncToGenerator, 'default') ? _asyncToGenerator['default'] : _asyncToGenerator;
  _concatInstanceProperty = _concatInstanceProperty && Object.prototype.hasOwnProperty.call(_concatInstanceProperty, 'default') ? _concatInstanceProperty['default'] : _concatInstanceProperty;
  _setInterval = _setInterval && Object.prototype.hasOwnProperty.call(_setInterval, 'default') ? _setInterval['default'] : _setInterval;
  _Object$assign = _Object$assign && Object.prototype.hasOwnProperty.call(_Object$assign, 'default') ? _Object$assign['default'] : _Object$assign;

  // Put variables in global scope to make them available to the browser console.
  var constraints = window.constraints = {
    audio: false,
    video: true
  };

  function handleSuccess(stream, element) {
    var video = element;
    var videoTracks = stream.getVideoTracks();
    console.log('Got stream with constraints:', constraints);
    console.log("Using video device: ".concat(videoTracks[0].label)); // window.stream = stream; // make variable available to browser console

    video.srcObject = stream;
  }

  function handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
      var _context;

      var v = constraints.video;
      errorMsg(_concatInstanceProperty(_context = "The resolution ".concat(v.width.exact, "x")).call(_context, v.height.exact, " px is not supported by your device."));
    } else if (error.name === 'PermissionDeniedError') {
      errorMsg('Permissions have not been granted to use your camera and ' + 'microphone, you need to allow the page access to your devices in ' + 'order for the demo to work.');
    }

    errorMsg("getUserMedia error: ".concat(error.name), error);
  }

  function errorMsg(msg, error) {
    var errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += "<p>".concat(msg, "</p>");

    if (typeof error !== 'undefined') {
      console.error(error);
    }
  }

  function openRTC(_x) {
    return _openRTC.apply(this, arguments);
  }

  function _openRTC() {
    _openRTC = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(element) {
      var stream;
      return _regeneratorRuntime.wrap(function _callee$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return navigator.mediaDevices.getUserMedia(constraints);

            case 3:
              stream = _context2.sent;
              handleSuccess(stream, element);
              return _context2.abrupt("return", stream);

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](0);
              handleError(_context2.t0);
              return _context2.abrupt("return", _Promise.reject(_context2.t0));

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee, null, [[0, 8]]);
    }));
    return _openRTC.apply(this, arguments);
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
  function RTCRecord(mediaStream, cb) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var stream = null;
    var collectTime = config.collectTime || 1000;
    var options = {
      mimeType: 'video/webm;codecs=vp9'
    };
    var mediaRecorder = null;

    function getMimeType() {
      var options = {
        mimeType: 'video/webm;codecs=vp9'
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error("".concat(options.mimeType, " is not Supported"));
        options = {
          mimeType: 'video/webm;codecs=vp8'
        };

        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.error("".concat(options.mimeType, " is not Supported"));
          options = {
            mimeType: 'video/webm'
          };

          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error("".concat(options.mimeType, " is not Supported"));
            options = {
              mimeType: ''
            };
          }
        }
      }

      return options;
    }

    function startRecording() {
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        return;
      }

      mediaRecorder.onstop = function (event) {
        mediaRecorder = null;
        config.ended && config.ended();
      };

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(collectTime); // collect 1000ms of data
      // setTimeout(stopRecording, 3000)
    }

    function handleDataAvailable(event) {
      if (event.data && event.data.size > 0) {
        // recordedBlobs.push(event.data);
        // stream && startRecording()
        cb && cb(event.data);
      }
    } // function stopRecording() {
    //   mediaRecorder.stop();
    // }


    stream = mediaStream;
    options = getMimeType();
    startRecording();

    mediaStream.onended = function () {
      mediaStream = stream = null;
    };

    return mediaRecorder;
  }
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
    var promise = new _Promise(function (resolve) {
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
      timer = _setInterval(function () {
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

  function record(mediaStream, video, cb) {
    var config = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    return typeof MediaRecorder !== 'undefined' ? RTCRecord(mediaStream, cb, config) : CanvasRecord(video, cb, config);
  }

  var getVideoByInput = null;

  function getInput() {
    if (getVideoByInput) return getVideoByInput;
    var input = document.createElement('input');
    getVideoByInput = input;
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'video/*');
    input.setAttribute('capture', 'user');
    input.style.display = 'none';
    document.body.append(input);
    return input;
  }

  function getVideo() {
    var input = getInput();
    return new _Promise(function (resolve) {
      input.onchange = function (e) {
        resolve(e.target.files[0]);
      };

      input.click();
    });
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
    return new _Promise(function (resolve) {
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
    _pressVideo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(videoFile, cb, options) {
      var video, record;
      return _regeneratorRuntime.wrap(function _callee$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              options && _Object$assign(config, options); // 自定义配置

              video = createPlayVideo(); // 视频太小，可直接返回文件

              if (!(videoFile.size < config.MINSIZE)) {
                _context2.next = 7;
                break;
              }

              console.info("\u89C6\u9891\u5C0F\u4E8E".concat(config.MINSIZE, ", \u4E0D\u505A\u5904\u7406"));
              cb && cb(videoFile);
              return _context2.abrupt("return", videoFile);

            case 7:
              record = CanvasRecord(video, cb, options); // 监听play事件，准备录屏

              video.onloadedmetadata = function () {
                if (video.duration > config.MAXTIME) {
                  var _context;

                  URL.revokeObjectURL(video.src); // 释放blob资源

                  record.stop(); // 移除video的监听事件

                  throw new Error(_concatInstanceProperty(_context = "\u89C6\u9891\u65F6\u957F".concat(video.duration, "\u8D85\u8FC7")).call(_context, config.MAXTIME));
                }
              };

              _context2.next = 11;
              return getFileURL(videoFile);

            case 11:
              video.src = _context2.sent;
              video.play();
              return _context2.abrupt("return", record);

            case 16:
              _context2.prev = 16;
              _context2.t0 = _context2["catch"](0);
              console.error(_context2.t0);
              return _context2.abrupt("return", _Promise.reject(_context2.t0));

            case 20:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee, null, [[0, 16]]);
    }));
    return _pressVideo.apply(this, arguments);
  }

  function webrtcSurport() {
    return !navigator.mediaDevices.getUserMedia;
  }

  function getDOM(dom) {
    if (typeof dom === 'string') return dom = document.querySelector(dom);
    return dom;
  }

  function degrade(_x) {
    return _degrade.apply(this, arguments);
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


  function _degrade() {
    _degrade = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(config) {
      var file, record;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return getVideo();

            case 2:
              file = _context.sent;
              _context.next = 5;
              return pressVideo(file, config.chunks, config);

            case 5:
              record = _context.sent;
              return _context.abrupt("return", record);

            case 7:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));
    return _degrade.apply(this, arguments);
  }

  function openVideo(_x2) {
    return _openVideo.apply(this, arguments);
  }

  function _openVideo() {
    _openVideo = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(config) {
      var isWebrtcSurport, stream, record$1, resolveP, promise;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              isWebrtcSurport = webrtcSurport();

              if (!isWebrtcSurport) {
                _context2.next = 9;
                break;
              }

              _context2.next = 4;
              return openRTC(config.video);

            case 4:
              stream = _context2.sent;
              record$1 = record(stream, config.video, config.chunks, config);
              return _context2.abrupt("return", {
                stop: function stop() {
                  var tracks = stream.getTracks();
                  tracks[0].stop();
                  record$1.stop();
                }
              });

            case 9:
              if (config.degrade) {
                _context2.next = 11;
                break;
              }

              return _context2.abrupt("return", _Promise.reject({
                isWebrtcSurport: false
              }));

            case 11:
              if (!(config.degrade === true)) {
                _context2.next = 13;
                break;
              }

              return _context2.abrupt("return", degrade(config));

            case 13:
              if (!config.degrade) {
                _context2.next = 18;
                break;
              }

              resolveP = null;
              promise = new _Promise(function (resolve) {
                return resolveP = resolve;
              });
              getDOM(config.degrade).addEventListener('click', function () {
                degrade(config).then(resolveP);
              });
              return _context2.abrupt("return", promise);

            case 18:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));
    return _openVideo.apply(this, arguments);
  }

  exports.openVideo = openVideo;
  exports.webrtcSurport = webrtcSurport;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
