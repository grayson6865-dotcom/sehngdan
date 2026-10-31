/* XPPen Christmas 2026 — drawing pad
 * Pointer-based canvas with normalized stroke storage so a drawing survives
 * resizes and orientation changes.
 */
(function (global) {
  'use strict';

  var MAX_DPR = 2.5;

  function midpoint(a, b) {
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  }

  function DrawingPad(canvas, onChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.strokes = [];
    this.redoStack = [];
    this.tool = 'brush';
    this.color = '#1b2130';
    this.size = 0.016;
    this.active = null;
    this.onChange = onChange || function () {};
    this.dpr = Math.min(global.devicePixelRatio || 1, MAX_DPR);
    this.w = 0;
    this.h = 0;

    this._onDown = this._onDown.bind(this);
    this._onMove = this._onMove.bind(this);
    this._onUp = this._onUp.bind(this);

    canvas.addEventListener('pointerdown', this._onDown);
    canvas.addEventListener('pointermove', this._onMove);
    canvas.addEventListener('pointerup', this._onUp);
    canvas.addEventListener('pointercancel', this._onUp);
    canvas.addEventListener('pointerleave', this._onUp);

    if (global.ResizeObserver) {
      this._ro = new ResizeObserver(this.resize.bind(this));
      this._ro.observe(canvas.parentElement || canvas);
    }
    global.addEventListener('resize', this.resize.bind(this));
    this.resize();
  }

  DrawingPad.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.dpr = Math.min(global.devicePixelRatio || 1, MAX_DPR);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.redraw();
  };

  DrawingPad.prototype._pos = function (e) {
    var rect = this.canvas.getBoundingClientRect();
    return [
      Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
      Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    ];
  };

  DrawingPad.prototype._style = function (stroke) {
    var px = stroke.size * Math.min(this.w, this.h);
    var ctx = this.ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.tool === 'eraser' ? px * 2.2 : px;
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
  };

  DrawingPad.prototype._onDown = function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    this.canvas.setPointerCapture && this.canvas.setPointerCapture(e.pointerId);
    var p = this._pos(e);
    this.active = {
      tool: this.tool,
      color: this.color,
      size: this.size,
      points: [p]
    };
    this.strokes.push(this.active);
    this.redoStack = [];

    this.ctx.save();
    this._style(this.active);
    var px = (this.tool === 'eraser' ? this.size * 2.2 : this.size) * Math.min(this.w, this.h);
    this.ctx.beginPath();
    this.ctx.arc(p[0] * this.w, p[1] * this.h, Math.max(0.8, px / 2), 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    this.onChange(this);
  };

  DrawingPad.prototype._onMove = function (e) {
    if (!this.active) return;
    e.preventDefault();
    var pts = this.active.points;
    var p = this._pos(e);
    var last = pts[pts.length - 1];
    if (Math.abs(p[0] - last[0]) * this.w < 0.6 && Math.abs(p[1] - last[1]) * this.h < 0.6) return;
    pts.push(p);

    var ctx = this.ctx;
    ctx.save();
    this._style(this.active);
    if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0][0] * this.w, pts[0][1] * this.h);
      ctx.lineTo(pts[1][0] * this.w, pts[1][1] * this.h);
      ctx.stroke();
    } else {
      var p0 = pts[pts.length - 3];
      var p1 = pts[pts.length - 2];
      var p2 = pts[pts.length - 1];
      var m1 = midpoint(p0, p1);
      var m2 = midpoint(p1, p2);
      ctx.beginPath();
      ctx.moveTo(m1[0] * this.w, m1[1] * this.h);
      ctx.quadraticCurveTo(p1[0] * this.w, p1[1] * this.h, m2[0] * this.w, m2[1] * this.h);
      ctx.stroke();
    }
    ctx.restore();
  };

  DrawingPad.prototype._onUp = function () {
    if (!this.active) return;
    this.active = null;
    this.onChange(this);
  };

  DrawingPad.prototype._drawStroke = function (stroke) {
    var pts = stroke.points;
    if (!pts.length) return;
    var ctx = this.ctx;
    ctx.save();
    this._style(stroke);
    if (pts.length === 1) {
      var r = (stroke.tool === 'eraser' ? stroke.size * 2.2 : stroke.size) * Math.min(this.w, this.h) / 2;
      ctx.beginPath();
      ctx.arc(pts[0][0] * this.w, pts[0][1] * this.h, Math.max(0.8, r), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0][0] * this.w, pts[0][1] * this.h);
    for (var i = 1; i < pts.length - 1; i++) {
      var m = midpoint(pts[i], pts[i + 1]);
      ctx.quadraticCurveTo(pts[i][0] * this.w, pts[i][1] * this.h, m[0] * this.w, m[1] * this.h);
    }
    var last = pts[pts.length - 1];
    ctx.lineTo(last[0] * this.w, last[1] * this.h);
    ctx.stroke();
    ctx.restore();
  };

  DrawingPad.prototype.redraw = function () {
    if (!this.ctx) return;
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    for (var i = 0; i < this.strokes.length; i++) this._drawStroke(this.strokes[i]);
  };

  DrawingPad.prototype.setColor = function (color) { this.color = color; this.tool = 'brush'; };
  DrawingPad.prototype.setSize = function (size) { this.size = size; this.tool = 'brush'; };
  DrawingPad.prototype.setTool = function (tool) { this.tool = tool; };

  DrawingPad.prototype.undo = function () {
    var s = this.strokes.pop();
    if (!s) return false;
    this.redoStack.push(s);
    this.redraw();
    this.onChange(this);
    return true;
  };

  DrawingPad.prototype.clear = function () {
    this.strokes = [];
    this.redoStack = [];
    this.redraw();
    this.onChange(this);
  };

  DrawingPad.prototype.hasInk = function () {
    return this.strokes.some(function (s) {
      return s.tool === 'brush' && s.points.length > 0;
    });
  };

  DrawingPad.prototype.isEmpty = function () {
    return this.strokes.length === 0;
  };

  DrawingPad.prototype.toCanvas = function (targetW, withPaper) {
    targetW = targetW || 640;
    var ratio = this.w ? this.h / this.w : 0.75;
    var c = document.createElement('canvas');
    c.width = targetW;
    c.height = Math.round(targetW * ratio);
    var ctx = c.getContext('2d');
    if (withPaper !== false) {
      var g = ctx.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0, '#fffefb');
      g.addColorStop(1, '#fbf5e8');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    var scale = c.width;
    for (var i = 0; i < this.strokes.length; i++) {
      var s = this.strokes[i];
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = s.size * Math.min(c.width, c.height) * (s.tool === 'eraser' ? 2.2 : 1);
      ctx.globalCompositeOperation = s.tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.color;
      ctx.fillStyle = s.color;
      var pts = s.points;
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0][0] * scale, pts[0][1] * c.height, Math.max(1, ctx.lineWidth / 2), 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(pts[0][0] * scale, pts[0][1] * c.height);
        for (var j = 1; j < pts.length - 1; j++) {
          var mx = (pts[j][0] + pts[j + 1][0]) / 2 * scale;
          var my = (pts[j][1] + pts[j + 1][1]) / 2 * c.height;
          ctx.quadraticCurveTo(pts[j][0] * scale, pts[j][1] * c.height, mx, my);
        }
        var last = pts[pts.length - 1];
        ctx.lineTo(last[0] * scale, last[1] * c.height);
        ctx.stroke();
      }
      ctx.restore();
    }
    return c;
  };

  DrawingPad.prototype.toDataURL = function (targetW) {
    var c = this.toCanvas(targetW || 480, true);
    return c.toDataURL('image/jpeg', 0.72);
  };

  global.DrawingPad = DrawingPad;
})(window);
