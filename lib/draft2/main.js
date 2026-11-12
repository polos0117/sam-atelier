/* 새 판(draft2) 시작 — Phaser.Game 하나. 캔버스는 화면(CSS 픽셀) × 기기 화소(2까지)로 그리고 zoom 으로 줄여 보인다 —
   글자가 휴대폰에서도 또렷하게. 장면은 카메라를 같은 배로 당겨 CSS 픽셀 좌표로 그린다(lib/draft2/ui.js cam).
   창 크기가 바뀌면 캔버스를 다시 맞추고 장면이 'resize' 를 받아 다시 그린다. */
(function (root) {
  'use strict';
  var el = document.getElementById('game');
  function dpr() { return Math.min(2, Math.max(1, root.devicePixelRatio || 1)); }
  function size() { return { w: Math.max(320, el.clientWidth || root.innerWidth), h: Math.max(320, el.clientHeight || root.innerHeight) }; }
  var Z = dpr(), s = size();
  root.Draft2Main = { zoom: function () { return Z; }, game: null };
  var game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#14110d',
    width: Math.round(s.w * Z),
    height: Math.round(s.h * Z),
    scale: { mode: Phaser.Scale.NONE, zoom: 1 / Z },
    render: { antialias: true },
    banner: false,
    scene: root.Draft2Scenes.list
  });
  root.Draft2Main.game = game;
  var t = 0;
  function fit() {
    clearTimeout(t);
    t = setTimeout(function () {
      var nz = dpr(), ns = size();
      if (nz !== Z) { Z = nz; game.scale.setZoom(1 / Z); }
      game.scale.resize(Math.round(ns.w * Z), Math.round(ns.h * Z));
    }, 120);
  }
  root.addEventListener('resize', fit);
  root.addEventListener('orientationchange', fit);
})(window);
