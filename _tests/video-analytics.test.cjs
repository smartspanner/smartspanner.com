const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('assets/js/video-analytics.js', 'utf8');
const flush = () => new Promise(resolve => setImmediate(resolve));
function fixture(provider = 'bunny', withGtag = true) {
  let clock = 0;
  const events = [], players = [];
  class Player {
    constructor() { this.callbacks = {}; players.push(this); }
    on(name, callback) { (this.callbacks[name] ||= []).push(callback); }
    off(name, callback) { this.callbacks[name] = (this.callbacks[name] || []).filter(fn => fn !== callback); }
    emit(name, data) { (this.callbacks[name] || []).forEach(fn => fn(data)); }
    getDuration(callback) { if (callback) callback(100); else return Promise.resolve(100); }
    getPaused(callback) { if (callback) callback(true); else return Promise.resolve(true); }
    getCurrentTime(callback) { if (callback) callback(0); else return Promise.resolve(0); }
    ready() { return Promise.resolve(); }
  }
  const window = {Vimeo: {Player}, playerjs: {Player}, location: {pathname: '/smartspanner.com/'}};
  if (withGtag) window.gtag = (...args) => events.push(args);
  const document = {hidden: false};
  vm.runInNewContext(code, {window, document, Date: {now: () => clock}, Map, Set, Promise, Number});
  const link = {href: 'https://example.test/video?token=secret#private', dataset: {
    videoName: 'product_overview', videoVersion: 'v1', videoProvider: provider, videoPlacement: 'home-hero-overview'
  }};
  const iframe = {isConnected: true, getBoundingClientRect: () => ({width: 500})};
  return {window, events, players, link, iframe, advance: seconds => { clock += seconds * 1000; }, attach: () => window.SmartspannerVideoAnalytics.attach(iframe, link)};
}
for (const provider of ['bunny', 'vimeo']) {
  test(provider + ': starts on playback, reaches milestones once and completes once', async () => {
    const f = fixture(provider); f.attach(); await flush();
    const player = f.players[0];
    assert.equal(f.events.length, 0, 'Opening/loading must not count as playback');
    player.emit(provider === 'vimeo' ? 'playing' : 'play');
    assert.equal(f.events.length, 0, 'A playback request without advancing frames is not a start');
    player.emit('timeupdate', {seconds: 0, duration: 100});
    for (let seconds = 1; seconds <= 100; seconds++) {
      f.advance(1); player.emit('timeupdate', {seconds, duration: 100});
    }
    player.emit('ended'); player.emit('ended'); player.emit(provider === 'vimeo' ? 'playing' : 'play');
    assert.deepEqual(f.events.map(e => e[1]), ['video_start', 'video_progress', 'video_progress', 'video_progress', 'video_progress', 'video_complete']);
    assert.deepEqual(f.events.slice(1, 5).map(e => e[2].video_percent), [25, 50, 75, 90]);
    f.events.forEach(e => {
      assert.equal(e[2].video_title, 'product_overview');
      assert.equal(e[2].video_version, 'v1');
      assert.equal(e[2].video_provider, provider);
      assert.equal(e[2].video_url, 'https://example.test/video');
    });
  });
}
test('seeking and buffering without playback do not award skipped milestones', async () => {
  const f = fixture(); f.attach(); await flush(); const p = f.players[0];
  p.emit('timeupdate', {seconds: 40, duration: 100});
  assert.equal(f.events.length, 0);
  p.emit('play'); p.emit('timeupdate', {seconds: 0, duration: 100});
  f.advance(1); p.emit('timeupdate', {seconds: 80, duration: 100}); p.emit('seeked');
  assert.equal(f.events.length, 1);
  p.emit('timeupdate', {seconds: 89, duration: 100});f.advance(1);p.emit('timeupdate', {seconds: 90, duration: 100});
  assert.deepEqual(f.events.map(e => e[2].video_percent), [0, 90]);
});
test('reopening deduplicates a version; a new version has fresh statistics', async () => {
  const f = fixture(); const dispose = f.attach(); await flush();
  f.players[0].emit('play'); f.players[0].emit('timeupdate', {seconds: 1, duration: 100}); dispose();
  f.players[0].emit('ended'); assert.equal(f.events.length, 1);
  f.attach(); await flush();f.players[1].emit('play');f.players[1].emit('timeupdate', {seconds: 1, duration: 100});assert.equal(f.events.length, 1);
  f.link.dataset.videoVersion = 'v2'; f.attach(); await flush(); f.players[2].emit('play');f.players[2].emit('timeupdate', {seconds: 1, duration: 100});
  assert.equal(f.events.length, 2);assert.equal(f.events[1][2].video_version, 'v2');
});
test('closing before attachment, malformed timing and unavailable GA4 are harmless', async () => {
  const f = fixture(); const dispose = f.attach(); dispose(); await flush();assert.equal(f.players.length, 0);
  const g = fixture('bunny', false);g.attach();await flush();g.players[0].emit('play');
  g.players[0].emit('timeupdate', {seconds: NaN, duration: -1});g.players[0].emit('ended');assert.equal(g.events.length, 0);
});
