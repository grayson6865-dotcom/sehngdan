/* XPPen Christmas 2026 — keepsake & share cards
 * Renders the town artwork plus personalised copy into downloadable PNGs.
 */
(function (global) {
  'use strict';

  var SERIF = '"Fraunces", "Iowan Old Style", Georgia, serif';
  var SANS = '"Manrope", "Segoe UI", Arial, sans-serif';
  var SERIF_ZH = '"Songti SC", "Noto Serif SC", "Source Han Serif SC", "SimSun", serif';
  var SANS_ZH = '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", sans-serif';

  function pad2(n) { return String(n).padStart(2, '0'); }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  function sceneImage() {
    var svg = global.XMASArt.sceneSVG({ clean: true, width: 1400, height: 875 });
    var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    return loadImage(url).then(function (img) {
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      return img;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function setSpacing(ctx, value) {
    if ('letterSpacing' in ctx) ctx.letterSpacing = value;
  }

  function wrapLines(ctx, text, maxWidth) {
    var words = String(text).split(/\s+/);
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      var test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = words[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function snowflake(ctx, cx, cy, r, color, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (var i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -r);
      ctx.moveTo(0, -r * 0.6);
      ctx.lineTo(-r * 0.22, -r * 0.8);
      ctx.moveTo(0, -r * 0.6);
      ctx.lineTo(r * 0.22, -r * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function starBurst(ctx, cx, cy, r, color, alpha) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -r); ctx.lineTo(0, r);
    ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
    ctx.moveTo(-r * 0.55, -r * 0.55); ctx.lineTo(r * 0.55, r * 0.55);
    ctx.moveTo(r * 0.55, -r * 0.55); ctx.lineTo(-r * 0.55, r * 0.55);
    ctx.stroke();
    ctx.restore();
  }

  function background(ctx, W, H) {
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#080e20');
    bg.addColorStop(.55, '#0a1226');
    bg.addColorStop(1, '#060a18');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var glow = ctx.createRadialGradient(W * .5, H * .16, 40, W * .5, H * .16, W * .8);
    glow.addColorStop(0, 'rgba(247,200,105,.13)');
    glow.addColorStop(1, 'rgba(247,200,105,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // star dust
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < 70; i++) {
      ctx.globalAlpha = .08 + rnd() * .3;
      ctx.fillStyle = '#eaf3ff';
      var x = rnd() * W;
      var y = rnd() * H;
      var r = .6 + rnd() * 1.6;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function frame(ctx, W, H, inset) {
    roundRect(ctx, inset, inset, W - inset * 2, H - inset * 2, 26);
    ctx.strokeStyle = 'rgba(247,200,105,.55)';
    ctx.lineWidth = 2;
    ctx.stroke();

    roundRect(ctx, inset + 12, inset + 12, W - (inset + 12) * 2, H - (inset + 12) * 2, 20);
    ctx.strokeStyle = 'rgba(247,200,105,.16)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawScene(ctx, img, x, y, w, h) {
    ctx.save();
    roundRect(ctx, x, y, w, h, 18);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);

    var shade = ctx.createLinearGradient(0, y + h * .55, 0, y + h);
    shade.addColorStop(0, 'rgba(5,8,26,0)');
    shade.addColorStop(1, 'rgba(5,8,26,.72)');
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, w, h);
    ctx.restore();

    roundRect(ctx, x, y, w, h, 18);
    ctx.strokeStyle = 'rgba(247,200,105,.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawFrost(ctx, x, y, w, h, pieces, radius) {
    if (pieces >= 28) return;
    var order = global.XMASArt.tileOrder();
    var lit = {};
    order.slice(0, pieces).forEach(function (p) { lit[p] = true; });

    ctx.save();
    roundRect(ctx, x, y, w, h, radius);
    ctx.clip();

    var tw = w / 7;
    var th = h / 4;
    for (var p = 0; p < 28; p++) {
      if (lit[p]) continue;
      var tx = x + (p % 7) * tw;
      var ty = y + Math.floor(p / 7) * th;
      ctx.fillStyle = 'rgba(6,12,26,.3)';
      ctx.fillRect(tx, ty, tw + .5, th + .5);
      var g = ctx.createLinearGradient(tx, ty, tx + tw, ty + th);
      g.addColorStop(0, 'rgba(210,234,255,.58)');
      g.addColorStop(.45, 'rgba(152,186,228,.4)');
      g.addColorStop(1, 'rgba(28,50,92,.62)');
      ctx.fillStyle = g;
      ctx.fillRect(tx, ty, tw + .5, th + .5);

      // a little icy crystal texture so frozen pieces read as frosted glass
      ctx.fillStyle = 'rgba(255,255,255,.16)';
      for (var k = 0; k < 9; k++) {
        var bx = tx + ((p * 37 + k * 53) % 100) / 100 * tw;
        var by = ty + ((p * 61 + k * 29) % 100) / 100 * th;
        ctx.beginPath();
        ctx.arc(bx, by, tw * (0.012 + ((k * 7 + p) % 4) / 260), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = 'rgba(220,238,255,.14)';
      ctx.lineWidth = 1;
      ctx.strokeRect(tx + .5, ty + .5, tw - 1, th - 1);
    }

    ctx.strokeStyle = 'rgba(4,9,22,.5)';
    ctx.lineWidth = 2;
    for (var c = 1; c < 7; c++) {
      ctx.beginPath(); ctx.moveTo(x + c * tw, y); ctx.lineTo(x + c * tw, y + h); ctx.stroke();
    }
    for (var r = 1; r < 4; r++) {
      ctx.beginPath(); ctx.moveTo(x, y + r * th); ctx.lineTo(x + w, y + r * th); ctx.stroke();
    }
    ctx.restore();
  }

  function drawNoticeboard(ctx, artwork, sx, sy, sw, sh) {
    if (artwork) {
        // The noticeboard is composited only into generated keepsake images.
        var bx = sx + sw * .075, by = sy + sh * .57, bw = sw * .22, bh = sh * .31;
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#563321'; ctx.fillRect(bx + bw * .08, by + bh * .85, bw * .06, bh * .45);
        ctx.fillRect(bx + bw * .86, by + bh * .85, bw * .06, bh * .45);
        roundRect(ctx, bx, by, bw, bh, 7); ctx.fill();
        ctx.shadowBlur = 0;
        var margin = bw * .08, ix = bx + margin, iy = by + margin, iw = bw - margin * 2, ih = bh - margin * 2;
        ctx.fillStyle = '#fffaf0'; ctx.fillRect(ix, iy, iw, ih);
        var scale = Math.min(iw / artwork.width, ih / artwork.height);
        var aw = artwork.width * scale, ah = artwork.height * scale;
        ctx.drawImage(artwork, ix + (iw-aw)/2, iy + (ih-ah)/2, aw, ah);
        ctx.restore();
      }

  }

  function renderKeepsake(canvas, opts) {
    opts = opts || {};
    return Promise.all([sceneImage(), opts.art ? loadImage(opts.art) : Promise.resolve(null)]).then(function (images) {
      var img = images[0], artwork = images[1];
      var W = 1200, H = 1500;
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      var zh = opts.lang === 'zh';
      var serif = zh ? SERIF_ZH : SERIF;
      var sans = zh ? SANS_ZH : SANS;

      background(ctx, W, H);
      frame(ctx, W, H, 34);

      var sx = 62, sy = 64, sw = W - 124, sh = Math.round(sw * 700 / 1120);
      drawScene(ctx, img, sx, sy, sw, sh);
      drawNoticeboard(ctx, artwork, sx, sy, sw, sh);
      drawFrost(ctx, sx, sy, sw, sh, opts.pieces || 28, 18);

      // ribbon of light under the scene
      var line = ctx.createLinearGradient(sx, 0, sx + sw, 0);
      line.addColorStop(0, 'rgba(247,200,105,0)');
      line.addColorStop(.5, 'rgba(247,200,105,.55)');
      line.addColorStop(1, 'rgba(247,200,105,0)');
      ctx.fillStyle = line;
      ctx.fillRect(sx, sy + sh + 18, sw, 1.5);

      ctx.textAlign = 'center';

      setSpacing(ctx, zh ? '3px' : '7px');
      ctx.fillStyle = 'rgba(247,200,105,.8)';
      ctx.font = '800 19px ' + sans;
      ctx.fillText(zh ? '圣诞小镇 · 2026' : 'CHRISTMAS TOWN · 2026', W / 2, 868);
      setSpacing(ctx, '0px');

      var name = (opts.name || (zh ? '你的名字' : 'Your name')).slice(0, 24);
      var nameSize = name.length > 14 ? 64 : 78;
      ctx.fillStyle = '#fff4d9';
      ctx.font = '600 ' + nameSize + 'px ' + serif;
      ctx.fillText(name, W / 2, 952);

      starBurst(ctx, W / 2, 982, 26, 'rgba(247,200,105,.8)', .55);

      var blessing = (opts.blessing || (zh ? '圣诞快乐，新年灵感不断！' : 'Merry Christmas & a creative new year!')).slice(0, 90);
      ctx.font = '400 30px ' + serif;
      ctx.fillStyle = 'rgba(214,228,250,.9)';
      var lines = wrapLines(ctx, blessing, 920).slice(0, 2);
      lines.forEach(function (l, i) {
        ctx.fillText(l, W / 2, 1042 + i * 42);
      });

      var pieces = opts.pieces || 28;
      ctx.font = '700 15px ' + sans;
      setSpacing(ctx, zh ? '2px' : '4px');
      ctx.fillStyle = 'rgba(154,172,205,.85)';
      ctx.fillText(zh ? pieces + ' / 28 块已点亮  ·  2026年12月' : pieces + ' / 28 PIECES LIT  ·  DEC 2026', W / 2, 1150);
      setSpacing(ctx, '0px');

      // code plate
      var code = opts.code || 'XM26-0000-0028';
      ctx.font = '600 22px ' + sans;
      var codeW = ctx.measureText(code).width + 44;
      roundRect(ctx, W / 2 - codeW / 2, 1182, codeW, 46, 23);
      ctx.fillStyle = 'rgba(247,200,105,.07)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(247,200,105,.32)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = 'rgba(247,200,105,.92)';
      ctx.fillText(code, W / 2, 1212);

      var rule = ctx.createLinearGradient(W * .25, 0, W * .75, 0);
      rule.addColorStop(0, 'rgba(247,200,105,0)');
      rule.addColorStop(.5, 'rgba(247,200,105,.4)');
      rule.addColorStop(1, 'rgba(247,200,105,0)');
      ctx.fillStyle = rule;
      ctx.fillRect(W * .25, 1262, W * .5, 1);
      snowflake(ctx, W / 2, 1262, 9, 'rgba(247,200,105,.6)', .7);

      ctx.font = '500 15px ' + sans;
      ctx.fillStyle = 'rgba(154,172,205,.6)';
      setSpacing(ctx, zh ? '2px' : '3px');
      ctx.fillText(zh ? 'XPPen  ·  创造魔法，传递快乐' : 'XPPen  ·  CREATE THE MAGIC, GIVE THE JOY', W / 2, 1352);
      setSpacing(ctx, '0px');

      snowflake(ctx, 96, 1310, 20, 'rgba(247,200,105,.5)', .45);
      snowflake(ctx, W - 96, 1310, 20, 'rgba(247,200,105,.5)', .45);
      snowflake(ctx, 1100, 120, 16, 'rgba(247,200,105,.5)', .35);
      snowflake(ctx, 92, 210, 11, 'rgba(247,200,105,.5)', .28);

      return canvas;
    });
  }

  function renderShareCard(canvas, opts) {
    opts = opts || {};
    return Promise.all([sceneImage(), opts.art ? loadImage(opts.art) : Promise.resolve(null)]).then(function (images) {
      var img = images[0], artwork = images[1];
      var W = 1080, H = 1350;
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      var zh = opts.lang === 'zh';
      var serif = zh ? SERIF_ZH : SERIF;
      var sans = zh ? SANS_ZH : SANS;

      background(ctx, W, H);
      frame(ctx, W, H, 28);

      var sx = 54, sy = 54, sw = W - 108, sh = Math.round(sw * 700 / 1120);
      drawScene(ctx, img, sx, sy, sw, sh);
      drawNoticeboard(ctx, artwork, sx, sy, sw, sh);

      drawFrost(ctx, sx, sy, sw, sh, opts.pieces || 0, 18);

      ctx.textAlign = 'center';

      setSpacing(ctx, zh ? '3px' : '6px');
      ctx.fillStyle = 'rgba(247,200,105,.8)';
      ctx.font = '800 15px ' + sans;
      ctx.fillText(zh ? '我的圣诞小镇' : 'MY CHRISTMAS TOWN', W / 2, 742);
      setSpacing(ctx, '0px');

      var name = (opts.name || (zh ? '圣诞创作者' : 'A Christmas maker')).slice(0, 22);
      ctx.fillStyle = '#fff4d9';
      ctx.font = '600 50px ' + serif;
      ctx.fillText(name, W / 2, 812);

      var pieces = opts.pieces || 0;
      ctx.fillStyle = '#f7c869';
      ctx.font = '600 88px ' + serif;
      ctx.fillText(pieces + ' / 28', W / 2, 928);
      setSpacing(ctx, '4px');
      ctx.fillStyle = 'rgba(154,172,205,.9)';
      ctx.font = '700 14px ' + sans;
      ctx.fillText(zh ? '碎片已点亮' : 'PIECES LIT', W / 2, 978);
      setSpacing(ctx, '0px');

      ctx.fillStyle = 'rgba(214,228,250,.85)';
      ctx.font = '400 26px ' + serif;
      ctx.fillText(zh ? '创造魔法，传递快乐。' : 'Create the Magic, Give the Joy.', W / 2, 1042);

      ctx.fillStyle = 'rgba(154,172,205,.7)';
      ctx.font = '500 16px ' + sans;
      ctx.fillText(zh ? '来 xp-pen.com 画出你的圣诞小镇' : 'Draw a piece of our Christmas town at xp-pen.com', W / 2, 1102);

      var ctaW = 330;
      roundRect(ctx, W / 2 - ctaW / 2, 1148, ctaW, 54, 27);
      ctx.fillStyle = 'rgba(247,200,105,.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(247,200,105,.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      setSpacing(ctx, '2px');
      ctx.fillStyle = '#f7c869';
      ctx.font = '800 14px ' + sans;
      ctx.fillText(zh ? 'XPPen 圣诞 2026' : 'XPPEN CHRISTMAS 2026', W / 2, 1182);
      setSpacing(ctx, '0px');

      if (opts.code) {
        ctx.fillStyle = 'rgba(154,172,205,.45)';
        ctx.font = '500 13px ' + SANS;
        ctx.fillText(opts.code, W / 2, 1268);
      }

      snowflake(ctx, 86, 1230, 18, 'rgba(247,200,105,.5)', .4);
      snowflake(ctx, W - 86, 1230, 18, 'rgba(247,200,105,.5)', .4);

      return canvas;
    });
  }

  function renderDoodleCard(canvas, opts) {
    opts = opts || {};
    return loadImage(opts.art).then(function (img) {
      var W = 1080, H = 1350;
      canvas.width = W;
      canvas.height = H;
      var ctx = canvas.getContext('2d');
      var zh = opts.lang === 'zh';
      var serif = zh ? SERIF_ZH : SERIF;
      var sans = zh ? SANS_ZH : SANS;

      background(ctx, W, H);
      frame(ctx, W, H, 28);

      ctx.textAlign = 'center';
      setSpacing(ctx, '6px');
      ctx.fillStyle = 'rgba(247,200,105,.8)';
      ctx.font = '800 15px ' + SANS;
      ctx.fillText('MY CHRISTMAS DOODLE', W / 2, 118);
      setSpacing(ctx, '0px');

      var name = opts.taskName || 'Christmas doodle';
      ctx.fillStyle = '#fff4d9';
      ctx.font = '600 ' + (name.length > 16 ? 52 : 64) + 'px ' + serif;
      ctx.fillText(name, W / 2, 196);

      ctx.fillStyle = 'rgba(154,172,205,.85)';
      ctx.font = '600 14px ' + sans;
      setSpacing(ctx, zh ? '2px' : '3px');
      var dateText = opts.dateLabel || 'DEC 2026';
      ctx.fillText(opts.isFree ? dateText : (zh ? '第 ' + pad2(opts.day || 1) + ' 天' : 'DAY ' + pad2(opts.day || 1)) + '  ·  ' + dateText, W / 2, 238);
      setSpacing(ctx, '0px');

      var px = 70, py = 280, pw = W - 140, ph = 620;
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,.55)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 18;
      roundRect(ctx, px, py, pw, ph, 20);
      ctx.fillStyle = '#fffdf7';
      ctx.fill();
      ctx.restore();

      ctx.save();
      roundRect(ctx, px, py, pw, ph, 20);
      ctx.clip();
      var ir = img.width / img.height;
      var boxR = pw / ph;
      var dw, dh;
      if (ir > boxR) { dw = pw; dh = pw / ir; } else { dh = ph; dw = ph * ir; }
      ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
      ctx.restore();

      roundRect(ctx, px, py, pw, ph, 20);
      ctx.strokeStyle = 'rgba(247,200,105,.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#f7c869';
      ctx.font = '600 64px ' + serif;
      ctx.fillText((opts.pieces || 0) + ' / 28', W / 2, 1015);
      setSpacing(ctx, '4px');
      ctx.fillStyle = 'rgba(154,172,205,.9)';
      ctx.font = '700 14px ' + sans;
      ctx.fillText(zh ? '碎片已点亮' : 'PIECES LIT', W / 2, 1048);
      setSpacing(ctx, '0px');

      ctx.fillStyle = 'rgba(214,228,250,.85)';
      ctx.font = '400 26px ' + serif;
      ctx.fillText(zh ? '创造魔法，传递快乐。' : 'Create the Magic, Give the Joy.', W / 2, 1120);

      var ctaW = 330;
      roundRect(ctx, W / 2 - ctaW / 2, 1160, ctaW, 54, 27);
      ctx.fillStyle = 'rgba(247,200,105,.1)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(247,200,105,.4)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      setSpacing(ctx, '2px');
      ctx.fillStyle = '#f7c869';
      ctx.font = '800 14px ' + sans;
      ctx.fillText(zh ? 'XPPen 圣诞 2026' : 'XPPEN CHRISTMAS 2026', W / 2, 1194);
      setSpacing(ctx, '0px');

      ctx.fillStyle = 'rgba(154,172,205,.55)';
      ctx.font = '500 14px ' + sans;
      ctx.fillText(zh ? '来 xp-pen.com 画出你的版本' : 'Draw your own at xp-pen.com', W / 2, 1250);

      snowflake(ctx, 92, 1290, 18, 'rgba(247,200,105,.5)', .4);
      snowflake(ctx, W - 92, 1290, 18, 'rgba(247,200,105,.5)', .4);

      return canvas;
    });
  }

  function download(canvas, filename) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) {
        if (!blob) return resolve(null);
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename || 'xppen-christmas-2026.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
        resolve(blob);
      }, 'image/png');
    });
  }

  function toBlob(canvas) {
    return new Promise(function (resolve) {
      canvas.toBlob(resolve, 'image/png');
    });
  }

  global.XMASCards = {
    renderKeepsake: renderKeepsake,
    renderShareCard: renderShareCard,
    renderDoodleCard: renderDoodleCard,
    download: download,
    toBlob: toBlob,
    sceneImage: sceneImage
  };
})(window);
