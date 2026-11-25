// Lightbox for case-study images
(function () {
  const lb = document.querySelector(".lightbox");
  if (!lb) return;
  const img = lb.querySelector("img");
  document.querySelectorAll(".cs-figure img").forEach((el) => {
    el.addEventListener("click", () => { img.src = el.currentSrc || el.src; lb.classList.add("open"); });
  });
  lb.addEventListener("click", () => lb.classList.remove("open"));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") lb.classList.remove("open"); });
})();

// Scroll reveal + pause videos that are off-screen (saves CPU/battery)
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const reveals = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 3, 2) * 80 + "ms";
      io.observe(el);
    });
  }

  const videos = document.querySelectorAll("video[autoplay], video[data-autoplay]");
  if (reduce) {
    videos.forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });
    return;
  }
  if ("IntersectionObserver" in window) {
    const vo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { const p = v.play(); if (p) p.catch(() => {}); }
        else v.pause();
      });
    }, { threshold: 0.15 });
    videos.forEach((v) => vo.observe(v));
  }
})();

// Case-study pages: subtle blurred bar after half a screen (splash stays behind via CSS sticky)
(function () {
  const bar = document.querySelector(".cs-sticky");
  if (!bar) return;
  const update = () => bar.classList.toggle("show", window.scrollY > window.innerHeight / 2);
  window.addEventListener("scroll", update, { passive: true });
  update();
})();

// Home nav: frosted background only once the page has scrolled
(function () {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  const u = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", u, { passive: true }); u();
})();

/* hero code ↔ design comparer */
(function () {
    var cd = document.querySelector('.cd'); if (!cd || window.gsap) return;
    var stage = cd.querySelector('.cd__stage'), dragging = false, raf;
    function set(p) { cd.style.setProperty('--x', Math.max(0, Math.min(100, p)) + '%'); }
    function fromEvent(e) { var r = stage.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    stage.addEventListener('pointermove', function (e) { if (dragging) { cancelAnimationFrame(raf); fromEvent(e); } });
    stage.addEventListener('pointerdown', function (e) { dragging = true; stage.setPointerCapture(e.pointerId); fromEvent(e); });
    stage.addEventListener('pointerup', function () { dragging = false; });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var t0; set(0);
    function sweep(t) { t0 = t0 || t; var k = Math.min(1, (t - t0) / 1600), e = k < .5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2) / 2; set(e * 38); if (k < 1) raf = requestAnimationFrame(sweep); }
    setTimeout(function () { raf = requestAnimationFrame(sweep); }, 600);
})();

/* hero widget: live Buenos Aires clock + WebGL mesh gradient */
(function () {
    var cd = document.querySelector('.cd'); if (!cd) return;
    var tz = 'America/Argentina/Buenos_Aires';
    var $ = function (s) { return cd.querySelector(s); };
    var clock = $('[data-clock]'), day = $('[data-day]'), H = $('[data-h]'), M = $('[data-m]'), S = $('[data-s]');
    var fmt = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, visible = true;
    function parts() { var p = {}; fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = +x.value; }); return p; }
    function draw() {
        var p = parts(), ms = new Date().getMilliseconds() / 1000, s = p.second + (reduce ? 0 : ms);
        clock.textContent = String(p.hour).padStart(2, '0') + ':' + String(p.minute).padStart(2, '0');
        day.textContent = new Date().toLocaleDateString('en-US', { timeZone: tz, weekday: 'long' });
        H.style.transform = 'rotate(' + ((p.hour % 12) * 30 + p.minute * .5) + 'deg)';
        M.style.transform = 'rotate(' + (p.minute * 6 + s * .1) + 'deg)';
        if (!window.gsap) S.style.transform = 'rotate(' + (s * 6) + 'deg)';
    }
    draw();

    var cv = $('.cd__gl'), gl = cv && (cv.getContext('webgl') || cv.getContext('experimental-webgl')), u;
    if (gl) {
        var vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        var fs = 'precision mediump float;uniform vec2 r;uniform float t;' +
            'float g(vec2 u,vec2 p,float k){vec2 d=u-p;return exp(-dot(d,d)*k);}' +
            'void main(){vec2 u=gl_FragCoord.xy/r.y;float A=r.x/r.y;' +
            'vec2 p1=vec2(A*.74+.16*sin(t*.31),.64+.14*cos(t*.27));' +
            'vec2 p2=vec2(A*.62+.22*cos(t*.23),.30+.12*sin(t*.37));' +
            'vec2 p3=vec2(A*.42+.18*sin(t*.19+1.),.70+.14*cos(t*.29));' +
            'vec2 p4=vec2(A*.90+.10*cos(t*.41),.18+.10*sin(t*.33));' +
            'vec3 c=vec3(.961,.961,.969);' +
            'c=mix(c,vec3(.74,.84,1.0),g(u,p1,5.)*.85);' +
            'c=mix(c,vec3(.87,.83,.99),g(u,p2,6.)*.8);' +
            'c=mix(c,vec3(1.0,.88,.82),g(u,p3,8.)*.55);' +
            'c=mix(c,vec3(.82,.94,.93),g(u,p4,10.)*.5);' +
            'float n=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);' +
            'c+=(n-.5)*.012;gl_FragColor=vec4(c,1.);}';
        function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return o; }
        var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
        if (gl.getProgramParameter(pr, gl.LINK_STATUS)) {
            gl.useProgram(pr); cd.classList.add('has-gl');
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
            var loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            u = { r: gl.getUniformLocation(pr, 'r'), t: gl.getUniformLocation(pr, 't') };
        } else gl = null;
    }
    function size() { if (!gl) return; var d = Math.min(devicePixelRatio || 1, 2), w = cv.clientWidth, h = cv.clientHeight;
        if (cv.width !== w * d || cv.height !== h * d) { cv.width = w * d; cv.height = h * d; gl.viewport(0, 0, cv.width, cv.height); } }
    function paint(t) { if (!gl) return; size(); gl.uniform2f(u.r, cv.width, cv.height); gl.uniform1f(u.t, t / 1000 + 20); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cd);
    var last = 0;
    function loop(t) { requestAnimationFrame(loop); if (!visible || document.hidden) return;
        if (reduce) { if (t - last > 1000) { last = t; draw(); paint(0); } return; }
        draw(); paint(t); }
    requestAnimationFrame(loop);
})();

/* GSAP layer: intro timeline, inertial divider, widget tilt, ticking second hand */
(function () {
    var root = document.documentElement;
    if (!window.gsap) { root.classList.remove('ja-intro'); return; }
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cd = document.querySelector('.cd'), name = document.querySelector('.hero__name'), sub = document.querySelector('.hero__sub span');
    if (window.SplitText) gsap.registerPlugin(SplitText);
    if (window.Draggable) gsap.registerPlugin(Draggable);
    if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);

    /* divider */
    var setX = function () {};
    if (cd) {
        var stage = cd.querySelector('.cd__stage'), widget = cd.querySelector('.cd__stack') || cd.querySelector('.cd__widget');
        var proxy = document.createElement('div'), w = function () { return stage.clientWidth; }, dragging = false;
        setX = function (pct) { gsap.set(proxy, { x: pct / 100 * w() }); upd(); };
        function upd() { var p = gsap.getProperty(proxy, 'x') / w() * 100; cd.style.setProperty('--x', Math.max(0, Math.min(100, p)) + '%'); }
        stage.addEventListener('pointermove', function (e) {
            if (e.pointerType !== 'mouse' || dragging) return;
            var r = stage.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
            if (!reduce) gsap.to(widget, { rotationY: (nx - .5) * 10, rotationX: (.5 - ny) * 8, duration: .8, ease: 'power3.out', overwrite: 'auto' });
        });
        stage.addEventListener('pointerleave', function () { gsap.to(widget, { rotationX: 0, rotationY: 0, duration: 1, ease: 'elastic.out(1, .5)', onComplete: function () { gsap.set(widget, { clearProps: 'transform' }); } }); });
        if (window.Draggable) Draggable.create(proxy, {
            trigger: stage, type: 'x', inertia: !!window.InertiaPlugin, bounds: { minX: 0, maxX: w() },
            onPress: function (e) { dragging = true; var r = stage.getBoundingClientRect(); gsap.killTweensOf(proxy); gsap.set(proxy, { x: (e.clientX || (e.touches && e.touches[0].clientX)) - r.left }); this.update(); upd(); },
            onDrag: upd, onThrowUpdate: upd,
            onRelease: function () { if (!this.isThrowing) dragging = false; }, onThrowComplete: function () { dragging = false; }
        });
        addEventListener('resize', function () { Draggable.get && Draggable.get(proxy) && Draggable.get(proxy).applyBounds({ minX: 0, maxX: w() }); });

        /* second hand: Apple-style tick with a tiny overshoot */
        var S = cd.querySelector('[data-s]'), fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        function secs() { var p = {}; fmt.formatToParts(new Date()).forEach(function (x) { p[x.type] = +x.value; }); return p.hour * 3600 + p.minute * 60 + p.second; }
        var total = secs(); gsap.set(S, { rotation: total * 6, svgOrigin: '50 50' });
        setTimeout(function step() {
            total++; gsap.to(S, { rotation: total * 6, svgOrigin: '50 50', duration: reduce ? 0 : .45, ease: 'elastic.out(1.15, .45)' });
            setTimeout(step, 1000 - new Date().getMilliseconds());
        }, 1000 - new Date().getMilliseconds());
    }

    root.classList.remove('ja-intro');
    if (reduce) { setX(34); return; }

    /* intro timeline */
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    if (name && window.SplitText) {
        var split = SplitText.create(name, { type: 'chars', charsClass: 'hero__char' });
        tl.from(split.chars, { yPercent: 60, opacity: 0, filter: 'blur(12px)', duration: 1.1, stagger: .035 });
    } else if (name) tl.from(name, { y: 30, opacity: 0, duration: 1 });
    if (sub) {
        gsap.set(sub, { backgroundImage: 'linear-gradient(var(--accent), var(--accent))', backgroundRepeat: 'no-repeat', backgroundColor: 'transparent', backgroundSize: '0% 100%', color: 'rgba(17,17,17,0)' });
        tl.to(sub, { backgroundSize: '100% 100%', duration: .7, ease: 'power2.inOut' }, '-=.55')
          .to(sub, { color: '#111', duration: .35, ease: 'none' }, '-=.3');
    }
    if (cd) {
        setX(0);
        tl.from(cd, { opacity: 0, y: 40, scale: .97, duration: 1.1, ease: 'expo.out' }, '-=.6')
          .to({ p: 0 }, { p: 34, duration: 1.4, ease: 'power3.inOut', onUpdate: function () { setX(this.targets()[0].p); } }, '-=.5');
    }
})();

/* widget stack: live weather (Open-Meteo, no key) + rotation every few seconds */
(function () {
    var stack = document.querySelector('.cd__stack'); if (!stack) return;
    var clip = stack.querySelector('.cd__stack-clip'), dots = stack.querySelector('.cd__dots');
    var wx = stack.querySelector('[data-weather]'), timer, i = 0;
    var W = '#fff', Y = '#ffd60a';
    var ICONS = {
        sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.6" fill="' + Y + '"/><g stroke="' + Y + '" stroke-width="2" stroke-linecap="round"><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7"/></g></svg>',
        moon: '<svg viewBox="0 0 24 24"><path d="M15.6 21.2A9 9 0 0 1 8.4 4.6a.6.6 0 0 1 .8.7 7.2 7.2 0 0 0 8.6 8.9.6.6 0 0 1 .7.8 9 9 0 0 1-2.9 6.2z" fill="' + W + '" transform="translate(-2 0)"/><path d="M17 2.2l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6zM20.6 7.4l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4z" fill="' + W + '"/></svg>',
        partlyDay: '<svg viewBox="0 0 24 24"><circle cx="8.5" cy="8" r="3.8" fill="' + Y + '"/><path d="M7.5 20h10.2a3.8 3.8 0 0 0 .3-7.6 5.2 5.2 0 0 0-10 1.4A3.1 3.1 0 0 0 7.5 20z" fill="' + W + '"/></svg>',
        partlyNight: '<svg viewBox="0 0 24 24"><path d="M11 3.2a5 5 0 0 0 5.6 6.3A5.6 5.6 0 1 1 11 3.2z" fill="' + W + '" opacity=".9"/><path d="M7.5 21h10.2a3.8 3.8 0 0 0 .3-7.6 5.2 5.2 0 0 0-10 1.4A3.1 3.1 0 0 0 7.5 21z" fill="' + W + '"/></svg>',
        cloud: '<svg viewBox="0 0 24 24"><path d="M6.5 19h11a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.6A3.8 3.8 0 0 0 6.5 19z" fill="' + W + '"/></svg>',
        rain: '<svg viewBox="0 0 24 24"><path d="M6.5 15h11a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.6A3.8 3.8 0 0 0 6.5 15z" fill="' + W + '"/><g stroke="#64d2ff" stroke-width="2" stroke-linecap="round"><path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3"/></g></svg>',
        storm: '<svg viewBox="0 0 24 24"><path d="M6.5 14h11a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.6A3.8 3.8 0 0 0 6.5 14z" fill="' + W + '"/><path d="M12.5 14l-3 5h3l-1.5 4 4.5-6h-3l1.5-3z" fill="' + Y + '"/></svg>',
        fog: '<svg viewBox="0 0 24 24"><g stroke="' + W + '" stroke-width="2" stroke-linecap="round"><path d="M4 9h16M3 13h18M5 17h14"/></g></svg>',
        snow: '<svg viewBox="0 0 24 24"><path d="M6.5 14h11a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.6A3.8 3.8 0 0 0 6.5 14z" fill="' + W + '"/><g fill="' + W + '"><circle cx="8" cy="19" r="1.2"/><circle cx="12" cy="21" r="1.2"/><circle cx="16" cy="19" r="1.2"/></g></svg>'
    };
    /* [label, icon, sky group] — wording as in iOS Weather (English) */
    function describe(code, day) {
        if (code === 0) return [day ? 'Sunny' : 'Clear', day ? 'sun' : 'moon', 'clear'];
        if (code === 1) return [day ? 'Mostly Sunny' : 'Mostly Clear', day ? 'sun' : 'moon', 'clear'];
        if (code === 2) return ['Partly Cloudy', day ? 'partlyDay' : 'partlyNight', 'clear'];
        if (code === 3) return ['Cloudy', 'cloud', 'cloud'];
        if (code === 45 || code === 48) return ['Foggy', 'fog', 'cloud'];
        if (code >= 51 && code <= 57) return ['Drizzle', 'rain', 'rain'];
        if (code >= 61 && code <= 67) return ['Rain', 'rain', 'rain'];
        if (code >= 80 && code <= 82) return ['Showers', 'rain', 'rain'];
        if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['Snow', 'snow', 'cloud'];
        if (code >= 95) return ['Thunderstorms', 'storm', 'rain'];
        return ['Cloudy', 'cloud', 'cloud'];
    }
    /* sky colours follow the time of day (sunrise/sunset from the API) */
    var SKY = {
        clear: { night: ['#0e1a3a', '#2a3a6a'], dawn: ['#3c5687', '#d9a07f'], day: ['#2a72d4', '#62a9ee'], dusk: ['#304569', '#8e7782'] },
        cloud: { night: ['#1c2431', '#414b5c'], dawn: ['#4c5a70', '#a3928c'], day: ['#5b6f85', '#97a9bb'], dusk: ['#3c4659', '#7d7680'] },
        rain:  { night: ['#161d29', '#384354'], dawn: ['#45526a', '#8a8790'], day: ['#3f5066', '#76879b'], dusk: ['#343e51', '#6c6873'] }
    };
    function mins(iso) { var t = iso.split('T')[1].split(':'); return +t[0] * 60 + +t[1]; }
    function phase(now, rise, set) {
        if (Math.abs(now - rise) <= 45) return 'dawn';
        if (Math.abs(now - set) <= 60) return 'dusk';
        return now > rise && now < set ? 'day' : 'night';
    }
    function loadWeather() {
        if (!wx || !window.fetch) return;
        var url = 'https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=America%2FArgentina%2FBuenos_Aires&forecast_days=1';
        fetch(url).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) {
            var cur = d.current, dl = d.daily, info = describe(cur.weather_code, cur.is_day === 1);
            var ph = dl.sunrise && dl.sunset ? phase(mins(cur.time), mins(dl.sunrise[0]), mins(dl.sunset[0])) : (cur.is_day ? 'day' : 'night');
            var sky = SKY[info[2]][ph];
            wx.style.setProperty('--sky-a', sky[0]); wx.style.setProperty('--sky-b', sky[1]);
            wx.querySelector('[data-wx-temp]').textContent = Math.round(cur.temperature_2m) + '°';
            wx.querySelector('[data-wx-cond]').textContent = info[0];
            wx.querySelector('[data-wx-icon]').innerHTML = ICONS[info[1]];
            wx.querySelector('[data-wx-hl]').textContent = 'H:' + Math.round(dl.temperature_2m_max[0]) + '° L:' + Math.round(dl.temperature_2m_min[0]) + '°';
            if (wx.hidden) { wx.hidden = false; build(); }
        }).catch(function () { /* no real data → the weather widget stays hidden */ });
    }
    function slides() { return [].slice.call(clip.querySelectorAll('.cd__w')).filter(function (s) { return !s.hidden; }); }
    function build() {
        var s = slides(); dots.innerHTML = s.map(function () { return '<i></i>'; }).join('');
        s.forEach(function (el, k) { el.classList.toggle('is-active', k === i % s.length); el.classList.remove('is-prev'); });
        paintDots();
    }
    function paintDots() { var s = slides(); [].forEach.call(dots.children, function (d, k) { d.classList.toggle('is-active', k === i % s.length); }); }
    function next() {
        var s = slides(); if (s.length < 2) return;
        var cur = s[i % s.length]; i = (i + 1) % s.length; var nx = s[i];
        s.forEach(function (el) { if (el !== cur && el !== nx) { el.style.transition = 'none'; el.classList.remove('is-prev', 'is-active'); void el.offsetWidth; el.style.transition = ''; } });
        nx.style.transition = 'none'; nx.classList.remove('is-prev'); void nx.offsetWidth; nx.style.transition = '';
        cur.classList.remove('is-active'); cur.classList.add('is-prev'); nx.classList.add('is-active');
        paintDots();
    }
    function start() { clearInterval(timer); timer = setInterval(function () { if (!document.hidden) next(); }, 5000); }
    build(); loadWeather(); setInterval(loadWeather, 30 * 60 * 1000);
    setTimeout(start, 2500);
})();
