# [video-rtp]() - [Demos]()

[![npm](https://img.shields.io/npm/v/msr.svg)](https://www.npmjs.com/package/video-rtp)

A cross-browser implementation to record video on real time

1. Use webRTC/mediaRecord first
2. Degrade to use "input[type = file]" when not support webRTC

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


## License

If you have any Suggestions, let me know. Thanks!
MIT licence
