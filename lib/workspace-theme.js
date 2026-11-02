/* Shared appearance only. Character settings and prompt generation stay independent. */
(function () {
  'use strict';
  var root = document.documentElement;
  var keys = { theme: 'samguk_room_v2', background: 'samguk_background_v1', density: 'atelier_density_v1' };
  var themeColors = {jianghu: "#111b1e", peachsword: "#fcf5f3", lacquer: "#200f10", grimoire: "#1a1324", feywood: "#f3f7ec", dragonforge: "#131a22", neonrain: "#0e111c", hangar: "#f2f4f5", orbit: "#100e24"};   /* 무협 · 판타지 · 메카 셋씩(2026-11-02) */
  var viewportFrame = 0;
  function fitVisibleViewport() {
    if (viewportFrame) cancelAnimationFrame(viewportFrame);
    viewportFrame = requestAnimationFrame(function () {
      viewportFrame = 0;
      var viewport = window.visualViewport;
      var height = viewport && viewport.height ? viewport.height : window.innerHeight;
      if (height) root.style.setProperty('--atelier-vh', Math.round(height * 100) / 100 + 'px');
    });
  }
  function normalize(key, value) {
    return key === 'theme' ? (themeColors[value] ? value : 'peachsword')
      : key === 'background' ? (value === 'off' ? 'off' : 'on')
      : (value === 'relaxed' ? value : 'compact');
  }
  /* 제목 글꼴 — 지금 공간의 것 하나만 받는다(2026-11-02 「화면 로딩이 엄청 느린데」 — 다섯 글꼴을 모든 화면이 한꺼번에 받아 글꼴 목록만 514KB, 화면이 그걸 기다렸다).
     스크립트가 붙인 글꼴 줄은 화면 그리기를 막지 않는다 — 글꼴이 오면 바뀐다(display=swap) */
  var displayFonts = {jianghu: "Song+Myung", peachsword: "Song+Myung", lacquer: "Song+Myung", grimoire: "Hahmlet:wght@600;700", feywood: "Hahmlet:wght@600;700", dragonforge: "Hahmlet:wght@600;700", neonrain: "Orbit", hangar: "Orbit", orbit: "Orbit"};
  function loadDisplayFont(theme) {
    var fam = displayFonts[theme], head = document.head || document.getElementsByTagName('head')[0];
    if (!fam || !head) return;
    var href = 'https://fonts.googleapis.com/css2?family=' + fam + '&display=swap', link = document.getElementById('display-font');
    if (link && link.getAttribute('href') === href) return;
    if (!link) { link = document.createElement('link'); link.rel = 'stylesheet'; link.id = 'display-font'; head.appendChild(link); }
    link.setAttribute('href', href);
  }
  function apply(key, value) {
    root.dataset[key] = normalize(key, value);
    if (key === 'theme') {
      loadDisplayFont(root.dataset.theme);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.content = themeColors[root.dataset.theme];
    }
  }
  function read(key) {
    var value;
    try { value = localStorage.getItem(keys[key]); } catch (e) {}
    apply(key, value);
  }
  Object.keys(keys).forEach(read);
  fitVisibleViewport();
  window.addEventListener('resize', fitVisibleViewport, { passive: true });
  window.addEventListener('orientationchange', fitVisibleViewport, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitVisibleViewport, { passive: true });
    window.visualViewport.addEventListener('scroll', fitVisibleViewport, { passive: true });
  }
  window.AtelierAppearance = {
    themes: Object.freeze(Object.keys(themeColors)),
    get: function () { return { theme: root.dataset.theme, background: root.dataset.background, density: root.dataset.density }; },
    set: function (key, value) {
      if (!keys[key]) return;
      apply(key, value);
      try { localStorage.setItem(keys[key], root.dataset[key]); } catch (e) {}
      window.dispatchEvent(new Event('atelier-appearance'));
    }
  };
  window.addEventListener('storage', function (event) {
    Object.keys(keys).forEach(function (key) {
      if (event.key === keys[key] || event.key === null) read(key);
    });
    window.dispatchEvent(new Event('atelier-appearance'));
  });
})();
