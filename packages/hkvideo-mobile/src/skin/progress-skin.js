/* eslint-disable */
import Player from '../player';
const isRotateFullscreen = (player) => {
    return Player.util.hasClass(player.root, 'hkplayer-rotate-fullscreen');
}

let s_progress = function () {
    let player = this;
    let util = Player.util;
    let { diyDuration } = player.config;
    let container = util.createDom('hk-progress',
        `<hk-outerinner class="hkplayer-progress-inner">
            <hk-outer class="hkplayer-progress-outer ${diyDuration ? 'diyduration' : ''}">
                <hk-cache class="hkplayer-progress-cache"></hk-cache>
                <hk-played class="hkplayer-progress-played">
                    <hk-progress-btn class="hkplayer-progress-btn"></hk-progress-btn>
                </hk-played>
            </hk-outer>
        </hk-progress-inner>`,
        {
            tabindex: 1
        }, 'hkplayer-progress');
    let containerWidth;
    player.controls.appendChild(container);
    let progress = container.querySelector('.hkplayer-progress-played');
    let outer = container.querySelector('.hkplayer-progress-outer');
    let cache = container.querySelector('.hkplayer-progress-cache');
    player.dotArr = {};

    function dotEvent(dotItem, text) {
        dotItem.addEventListener('mouseenter', function (e) {
            if (text) {
                util.addClass(dotItem, 'hkplayer-progress-dot-show')
                util.addClass(container, 'hkplayer-progress-dot-active')
            }
        })
        dotItem.addEventListener('mouseleave', function (e) {
            if (text) {
                util.removeClass(dotItem, 'hkplayer-progress-dot-show')
                util.removeClass(container, 'hkplayer-progress-dot-active')
            }
        })
        dotItem.addEventListener('touchend', function (e) {
            // e.preventDefault()
            e.stopPropagation();
            if (text) {
                if (!util.hasClass(dotItem, 'hkplayer-progress-dot-show')) {
                    Object.keys(player.dotArr).forEach(function (key) {
                        if (player.dotArr[key]) {
                            util.removeClass(player.dotArr[key], 'hkplayer-progress-dot-show')
                        }
                    })
                }
                util.toggleClass(dotItem, 'hkplayer-progress-dot-show')
                util.toggleClass(container, 'hkplayer-progress-dot-active')
            }
        })
    }

    function onCanplay() {
        // 传入自定义时长
		if (diyDuration && player.duration < diyDuration) {
            outer.style.width = `${(player.duration / diyDuration) * 100}%`;
        }
        // 进度条特殊点位置
        if (player.config.progressDot && util.typeOf(player.config.progressDot) === 'Array') {
            player.config.progressDot.forEach(item => {
                if (item.time >= 0 && item.time <= player.duration) {
                    let dot = util.createDom('hk-progress-dot', item.text ? `<span class="hkplayer-progress-tip">${item.text}</span>` : '', {}, 'hkplayer-progress-dot')
                    dot.style.left = (item.time / player.duration) * 100 + '%'
                    if (item.duration >= 0) {
                        dot.style.width = (Math.min(item.duration, player.duration - item.time) / player.duration) * 100 + '%'
                    }
                    outer.appendChild(dot);
                    player.dotArr[item.time] = dot;
                    dotEvent(dot, item.text);
                }
            })
        }
    }
    player.once('canplay', onCanplay);
    // 添加标记
    player.addProgressDot = function (time, text, duration) {
        if (player.dotArr[time]) {
            return
        }
        if (time >= 0 && time <= player.duration) {
            let dot = util.createDom('hk-progress-dot', '', {}, 'hkplayer-progress-dot')
            dot.style.left = (time / player.duration) * 100 + '%'
            if (duration >= 0) {
                dot.style.width = (Math.min(duration, player.duration - time) / player.duration) * 100 + '%'
            }
            outer.appendChild(dot)
            player.dotArr[time] = dot
            dotEvent(dot, text)
        }
    }
    player.removeProgressDot = function (time) {
        if (time >= 0 && time <= player.duration && player.dotArr[time]) {
            let dot = player.dotArr[time]
            dot.parentNode.removeChild(dot)
            dot = null
            player.dotArr[time] = null
        }
    }
    // 删除进度条所有标记点
    player.removeAllProgressDot = function () {
        Object.keys(player.dotArr).forEach(function (key) {
            if (player.dotArr[key]) {
                let dot = player.dotArr[key]
                dot.parentNode.removeChild(dot)
                dot = null
                player.dotArr[key] = null
            }
        })
    }
    let interval = 0;
    let tnailPicNum = 0;
    let tnailWidth = 200; // default
    let tnailHeight = 112.5; // default
    let tnailCol = 0;
    let tnailRow = 0;
    let tnailUrls = [];
    // 初始化
    function initThumbnailConf(obj) {
        obj = obj || {};
        thumbnailFlag = true;
        // 进度条预览图
        tnailPicNum = obj.pic_num;
        tnailWidth = obj.width;
        tnailHeight = obj.height;
        tnailCol = obj.col;
        tnailRow = obj.row;
        tnailUrls = obj.urls;
    }
    player.on('initThumbnail', initThumbnailConf);
    if (player.config.thumbnail) {
        player.emit('initThumbnail', player.config.thumbnail);
    }
    if (typeof player.config.disableSwipeHandler === 'function' && typeof player.config.enableSwipeHandler === 'function') {
        player.root.addEventListener('touchmove', e => {
            e.preventDefault();
            e.stopPropagation();
            if (!player.disableSwipe) {
                player.disableSwipe = true
                player.config.disableSwipeHandler.call(player);
            }
        });
        player.root.addEventListener('touchstart', e => {
            // e.preventDefault();
            player.disableSwipe = true;
            player.config.disableSwipeHandler.call(player);
        });
        player.root.addEventListener('touchend', e => {
            // e.preventDefault();
            player.disableSwipe = false;
            player.config.enableSwipeHandler.call(player);
        });
    };
    // 进度条拖动事件
    ['touchstart', 'mousedown'].forEach(item => {
        outer.addEventListener(item, function (e) {
            if (player.config.disableProgress) return;
            // e.preventDefault()
            e.stopPropagation();
            util.event(e);

            outer.focus();
            let {
                left
            } = outer.getBoundingClientRect()

            const isRotate = isRotateFullscreen(player)
            if (isRotate) {
                left = progress.getBoundingClientRect().top
                containerWidth = outer.getBoundingClientRect().height
            } else {
                containerWidth = outer.getBoundingClientRect().width
                left = progress.getBoundingClientRect().left
            }

            let move = function (e) {
                // e.preventDefault()
                // e.stopPropagation()
                util.event(e)
                player.isProgressMoving = true
                let w = (isRotate ? e.clientY : e.clientX) - left
                if (w > containerWidth) {
                    w = containerWidth
                }
                let now = w / containerWidth * player.duration
                progress.style.width = `${w * 100 / containerWidth}%`

                if (player.videoConfig.mediaType === 'video' && !player.dash && !player.config.closeMoveSeek) {
                    player.currentTime = Number(now).toFixed(1)
                } else {
                    let time = util.findDom(player.controls, '.hkplayer-time')
                    if (time) {
                        // bca-disable-line
                        time.innerHTML = `<span class="hkplayer-time-current">${util.format(now || 0)}</span><span>${util.format(player.duration)}</span>`
                    }
                }
                player.emit('focus')
            }
            let up = function (e) {
                // e.preventDefault()
                e.stopPropagation();
                util.event(e)
                window.removeEventListener('mousemove', move)
                window.removeEventListener('touchmove', move, {
                    passive: false
                })
                window.removeEventListener('mouseup', up)
                window.removeEventListener('touchend', up)
                outer.blur();
                if (!player.isProgressMoving || player.videoConfig.mediaType === 'audio' || player.dash || player.config.closeMoveSeek) {
                    let w = (isRotate ? e.clientY : e.clientX) - left
                    if (w > containerWidth) {
                        w = containerWidth
                    }
                    let now = w / containerWidth * player.duration
                    progress.style.width = `${w * 100 / containerWidth}%`
                    player.currentTime = Number(now).toFixed(1)
                }
                player.emit('focus')
                player.isProgressMoving = false
            }
            window.addEventListener('mousemove', move)
            window.addEventListener('touchmove', move, {
                passive: false
            })
            window.addEventListener('mouseup', up)
            window.addEventListener('touchend', up)
            return true
        })
    })

    // timeUpdate
    let onTimeupdate = function () {
        if (!containerWidth && container) {
            containerWidth = container.getBoundingClientRect().width
        }
        if (player.videoConfig.mediaType !== 'audio' || !player.isProgressMoving || !player.dash) {
            const precent = player.currentTime / player.duration
            const prevPrecent = Number.parseFloat(progress.style.width || '0') / Number.parseFloat(container.style.width || '100');
            if (Math.abs(precent - prevPrecent) <= 1) {
                progress.style.width = `${player.currentTime * 100 / player.duration}%`
            }
        }
    }
    player.on('timeupdate', onTimeupdate);

    let onCurrentTimeChange = function () {
        progress.style.width = `${player.currentTime * 100 / player.duration}%`;
    }
    player.on('currentTimeChange', onCurrentTimeChange);

    let onSrcChange = function () {
        progress.style.width = '0%';
    }
    player.on('srcChange', onSrcChange);

    let onCacheUpdate = function () {
        let buffered = player.buffered
        if (buffered && buffered.length > 0) {
            let end = buffered.end(buffered.length - 1)
            for (let i = 0, len = buffered.length; i < len; i++) {
                if (player.currentTime >= buffered.start(i) && player.currentTime <= buffered.end(i)) {
                    end = buffered.end(i)
                    for (let j = i + 1; j < buffered.length; j++) {
                        if (buffered.start(j) - buffered.end(j - 1) >= 2) {
                            end = buffered.end(j - 1)
                            break
                        }
                    }
                    break
                }
            }
            cache.style.width = `${end / player.duration * 100}%`;
        }
    }
    const cacheUpdateEvents = ['bufferedChange', 'cacheupdate', 'ended', 'timeupdate'];
    cacheUpdateEvents.forEach(item => {
        player.on(item, onCacheUpdate);
    })

    function destroyFunc() {
        player.removeAllProgressDot();
        player.off('canplay', onCanplay);
        player.off('timeupdate', onTimeupdate);
        player.off('currentTimeChange', onCurrentTimeChange);
        player.off('srcChange', onSrcChange);
        cacheUpdateEvents.forEach(item => {
            player.off(item, onCacheUpdate);
        })
        player.off('destroy', destroyFunc);
    }
    player.once('destroy', destroyFunc);
}

Player.install('s_progress', s_progress);
