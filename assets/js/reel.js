/* XPPen Christmas 2026 — prize reel
 * A horizontal light-track reel. The winning prize is placed at a fixed index
 * and the track is translated so that cell lands under the pointer.
 */
(function (global) {
  'use strict';

  var WIN_INDEX = 30;

  function shuffle(list) {
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function prizeLabel(prize) {
    if (global.XMASI18N && global.XMASI18N.current() === 'zh' && prize.nameZh) return prize.nameZh;
    return prize.name;
  }

  function cellMarkup(prize) {
    return '<div class="reel-cell" data-prize="' + prize.id + '">' +
      global.XMASArt.prizeIcon(prize.kind, prize.iconLabel, prize.rarity) +
      '<span>' + prizeLabel(prize) + '</span>' +
      '</div>';
  }

  function buildTrack(track, pool, prize) {
    var cells = [];
    var filler = shuffle(pool);
    for (var i = 0; i < 38; i++) cells.push(filler[i % filler.length]);
    cells[WIN_INDEX] = prize;
    // avoid a duplicate win just before the target, which can look like a miss
    if (cells[WIN_INDEX - 1] && cells[WIN_INDEX - 1].id === prize.id) {
      cells[WIN_INDEX - 1] = filler[(WIN_INDEX + 3) % filler.length];
    }
    track.innerHTML = cells.map(cellMarkup).join('');
    track.style.transition = 'none';
    track.style.transform = 'translate3d(0,0,0)';
  }

  function spin(frame, pool, prize, opts) {
    opts = opts || {};
    var track = frame.querySelector('.reel-track');
    if (!track) return Promise.resolve(null);
    buildTrack(track, pool, prize);

    return new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var cells = track.children;
          var target = cells[WIN_INDEX];
          if (!target) return resolve(null);
          var frameW = frame.clientWidth;
          var center = target.offsetLeft + target.offsetWidth / 2;
          var dx = Math.round(frameW / 2 - center);
          var fast = opts.fast || (global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
          var duration = fast ? 500 : (opts.duration || 3500);

          track.style.transition = 'transform ' + duration + 'ms cubic-bezier(.08,.74,.14,1)';
          track.style.transform = 'translate3d(' + dx + 'px,0,0)';
          track.classList.add('is-spinning');
          frame.classList.add('is-spinning');

          var done = false;
          function finish() {
            if (done) return;
            done = true;
            track.classList.remove('is-spinning');
            frame.classList.remove('is-spinning');
            target.classList.add('is-win');
            resolve(target);
          }
          target.addEventListener('transitionend', finish, { once: true });
          setTimeout(finish, duration + 220);
        });
      });
    });
  }

  global.XMASReel = { spin: spin, WIN_INDEX: WIN_INDEX };
})(window);
