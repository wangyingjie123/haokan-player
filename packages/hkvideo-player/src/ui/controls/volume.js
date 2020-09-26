/* eslint-disable */
import Player from '../../player';
import MutedIcon from '../assets/volumeMuted.svg';
import SmallIcon from '../assets/volumeSmall.svg';
import LargeIcon from '../assets/volumeLarge.svg';
let s_volume = function () {
    let player = this;
    let util = Player.util;
    let container = util.createDom('hk-volume',
        `<hk-icon class="hkplayer-icon">
            <div class="hkplayer-icon-large">${LargeIcon}</div>
            <div class="hkplayer-icon-small">${SmallIcon}</div>
            <div class="hkplayer-icon-muted">${MutedIcon}</div>
        </hk-icon>
        <hk-slider class="hkplayer-slider" tabindex="2">
            <hk-bar class="hkplayer-bar">
            <hk-drag class="hkplayer-drag"></hk-drag>
            </hk-bar>
        </hk-slider>`,
    {}, 'hkplayer-volume');
    player.once('ready', () => {
        player.controls.appendChild(container);
    });
    let slider = container.querySelector('.hkplayer-slider');
    let bar = container.querySelector('.hkplayer-bar');
    let selected = container.querySelector('.hkplayer-drag');
    let icon = container.querySelector('.hkplayer-icon');
    selected.style.height = `${player.config.volume * 100}%`;
    slider.volume = player.config.volume;

    bar.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        player.emit('volumeBarClick', e);
    });

    ['click', 'touchend'].forEach(item => {
        icon.addEventListener(item, e => {
            e.preventDefault();
            e.stopPropagation();
            player.emit('volumeIconClick')
        });
    });

    icon.addEventListener('mouseenter', e => {
        e.preventDefault();
        e.stopPropagation();
        player.emit('volumeIconEnter');
    });

    ['blur', 'mouseleave'].forEach(item => {
        container.addEventListener(item, e => {
            e.preventDefault();
            e.stopPropagation();
            player.emit('volumeIconLeave');
        })
    })
}

Player.install('s_volume', s_volume);