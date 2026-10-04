(function(window, document) {
  'use strict';

  const libraries = {};
  const visits = new Map();
  const milestones = [25, 50, 75, 90];
  // Keep videoName stable when changing host or footage; bump videoVersion for
  // a new edit. GA4's built-in Video title uses the name. Register video_version
  // as an event-scoped custom dimension in GA4 to compare edits in reports.
  const providers = {
    vimeo: {src: 'https://player.vimeo.com/api/player.js', available: () => window.Vimeo && window.Vimeo.Player},
    bunny: {src: 'https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js', available: () => window.playerjs && window.playerjs.Player}
  };

  // SDKs load only when a video is opened. Failure never prevents playback.
  function load(provider) {
    const library = providers[provider];
    if (library.available()) return Promise.resolve();
    if (!libraries[provider]) {
      libraries[provider] = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const timeout = window.setTimeout(() => reject(new Error('Video SDK timeout')), 8000);
        script.src = library.src;
        script.async = true;
        script.onload = () => {
          window.clearTimeout(timeout);
          library.available() ? resolve() : reject(new Error('Video SDK unavailable'));
        };
        script.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error('Video SDK unavailable'));
        };
        document.head.appendChild(script);
      });
    }
    return libraries[provider];
  }

  function attach(iframe, link) {
    const name = link.dataset.videoName;
    const version = link.dataset.videoVersion;
    const provider = link.dataset.videoProvider;
    if (!name || !version || !providers[provider]) return function() {};
    const key = name + ':' + version;
    if (!visits.has(key)) visits.set(key, {started: false, completed: false, milestones: new Set()});
    const visit = visits.get(key);
    let disposed = false;
    let player;
    let playing = false;
    let current = 0;
    let duration = 0;
    let previous = null;
    let previousAt = 0;
    const listeners = [];

    function send(event, percent) {
      if (disposed || typeof window.gtag !== 'function') return;
      window.gtag('event', event, {
        video_title: name,
        video_name: name,
        video_version: version,
        video_provider: provider,
        video_url: link.href.split('?')[0].split('#')[0],
        video_current_time: Math.round(current),
        video_duration: Math.round(duration),
        video_percent: percent,
        video_placement: link.dataset.videoPlacement,
        source_path: window.location.pathname,
        visible: !document.hidden && iframe.getBoundingClientRect().width > 0,
        transport_type: 'beacon'
      });
    }

    function start() {
      if (disposed) return;
      playing = true;
      if (!visit.started) {
        visit.started = true;
        send('video_start', 0);
      }
    }

    function update(data) {
      if (disposed) return;
      const seconds = Number(data.seconds);
      const total = Number(data.duration);
      if (!Number.isFinite(seconds) || !Number.isFinite(total) || seconds < 0 || total <= 0) return;
      current = seconds;
      duration = total;
      if (playing && current > 0) start();
      const now = Date.now();
      const percent = Math.min(100, current / duration * 100);
      // Ignore jumps and backwards seeks. Progress describes timeline milestones,
      // not unique watch time; a seek must not award the skipped milestones.
      const continuous = previous !== null && current >= previous &&
        current - previous <= (now - previousAt) / 1000 * 4 + 2;
      if (playing && visit.started && continuous) {
        milestones.forEach(milestone => {
          if (!visit.milestones.has(milestone) && previous / duration * 100 < milestone && percent >= milestone) {
            visit.milestones.add(milestone);
            send('video_progress', milestone);
          }
        });
      }
      previous = current;
      previousAt = now;
    }

    function pause() { playing = false; previous = null; }
    function seek() { previous = null; }
    function ended() {
      if (disposed || !visit.started || visit.completed) return;
      playing = false;
      visit.completed = true;
      if (duration) current = duration;
      send('video_complete', 100);
    }
    function on(event, callback) { player.on(event, callback); listeners.push([event, callback]); }

    load(provider).then(() => {
      if (disposed || !iframe.isConnected) return;
      if (provider === 'vimeo') {
        player = new window.Vimeo.Player(iframe);
        on('playing', () => { playing = true; });
        on('timeupdate', update);
        on('pause', pause);
        on('seeked', seek);
        on('ended', ended);
        player.ready().then(() => Promise.all([player.getPaused(), player.getCurrentTime(), player.getDuration()]))
          .then(([paused, seconds, total]) => {
            if (disposed) return;
            update({seconds, duration: total});
            if (!paused && seconds > 0) start();
          }).catch(() => {});
      } else {
        player = new window.playerjs.Player(iframe);
        on('play', () => { playing = true; });
        on('timeupdate', update);
        on('pause', pause);
        on('seeked', seek);
        on('ended', ended);
        on('ready', () => {
          player.getDuration(total => {
            if (disposed || !Number.isFinite(Number(total)) || Number(total) <= 0) return;
            duration = Number(total);
            // Recover playback that started while the SDK was loading.
            player.getPaused(paused => {
              if (!paused) player.getCurrentTime(seconds => { if (!disposed && Number(seconds) > 0) { current = Number(seconds); start(); } });
            });
          });
        });
      }
    }).catch(() => {});

    return function dispose() {
      disposed = true;
      if (player) listeners.forEach(([event, callback]) => player.off(event, callback));
    };
  }

  window.SmartspannerVideoAnalytics = {attach};
})(window, document);
