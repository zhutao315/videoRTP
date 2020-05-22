# [video-rtp](https://github.com/zhutao315/videoRTP)

[![npm](https://img.shields.io/npm/v/video-rtp.svg)](https://www.npmjs.com/package/video-rtp)

A cross-browser implementation to record video on real time

> <br>1. Use webRTC/mediaRecord first <br>2. Degrade to use "input[type = file]" when not support webRTC

video-rtp can open the camera and record video to a series of blobs.
You can upload the recorded blobs in realtime to the server! Or you can get the blobs and combine to a smaller video after specific time-intervals.

## Browser Support

According to webRTC/MediaRecord/Canvas's compatibility

| Browser        | Support           | Features |
| ------------- |-------------|-------------|
| Firefox | mobile / PC | webRTC to webm |
| Google Chrome | mobile / PC | webRTC to webm |
| Opera | mobile / PC | mobile: canvas to webp, PC: webRTC to webm |
| Android | ALL | Chrome: webRTC to webm, Other: canvas to webp |
| Microsoft Edge | Suggest: rtmp-streamer | canvas to webp |
| Safari 11 | mobile / PC | canvas to webp now |

> There is a similar project: **RecordRTC**! [Demo](https://www.webrtc-experiment.com/RecordRTC/)

## How to use it

You can [install scripts using NPM](https://www.npmjs.com/package/video-rtp):

```javascript
npm install video-rtp
```

## Record video

```javascript
import {webrtcSurport, openVideo} from 'video-rtp'

function getSocket(isRTC) {
    let url = `ws://localhost:3000/${isRTC ? 'webm' : 'webp'}`
    const ws = new WebSocket(url);
    return new Promise(resolve => {
    ws.onopen = () => resolve(ws)
    })
},

const wsP = getSocket(webrtcSurport())

const record = await openVideo({
    video: document.getElementById('webrtc'),
    duration: 100,
    MINSIZE: 1024,
    chunks(chunk) {
    // sender chunks
    console.log('sender chunks', chunk)
    wsP.then(ws => ws.send(chunk))
    },
    ended() {
    // record chunks ended, You can save video in this function.
    console.log('record chunks ended')
    wsP.then(ws => ws.send(0))
    },
    degrade:document.getElementById('p') // 不支持webRTC则降级处理打开本地视频
})

```

## How to manually stop recordings?

```javascript
record.stop();
```

## How to pause recordings?

```javascript
record.pause();
```

## How to resume recordings?

```javascript
record.resume();
```

## How to save recordings?

```javascript
import {webrtcSurport, openVideo} from 'video-rtp'
import Whammy from 'whammy'

let video = null
const blobs = []
openVideo({
    /* .....*/
    chunks(chunk) {
        // save webm/webp to blobs
        blobs.push(chunk)
    },
    ended() {
        // create video by blobs
        if (webrtcSurport()) {
            video = new Blob(blobs, {type: 'video/webm;codecs=vp9'});
        }else {
            video = Whammy.fromImageArray(blobs, 15)
        }
    },
    degrade:document.getElementById('p') // 不支持webRTC则降级处理打开本地视频
})
```

## Upload to Server


## How to handle the blobs on Server


# API Documentation

| Name                   | Type          | Default       | Description                                                                                                                                               |
| ---------------| ------------- | ------------- | ---------------------------------------------------------------|
| `video`        |  String/DOM  |       -       | Display video recorded by the camera |
| `duration`        |  Number  |       100(ms)       | The time interval when Canvas draws frames |
| `collectTime`        |  Number  |       1000(ms)      | The time length of chunks by mediaRecord record |
| `MINSIZE`        |  Number  |       1M       | If the video size is lower than this value, the video will be returned without processing |
| `MAXTIME`        |  Number  |       15(m)      | The Maximum duration of the upload video  |
| `chunks`        |  Function  |       () => { }       | The callback Function executed each time when the screen is recorded.<br> The param is a blob and the blob's type is webm/webp |
| `ended`        |  Function  |       () => { }       | The callback Function executed when the record is end |
| `degrade`        |  String/DOM/Boolen  |       -       | The degrage is usefull when the webRTC is not supported |


> When the "degrade" is a string, the component will find the DOM by id/class. The dom will bind a click event to open the local video. When the value of "degrade" is true, the openVideo function will open the local video directly. 

## License

If you have any Suggestions, let me know. Thanks!
MIT licence
