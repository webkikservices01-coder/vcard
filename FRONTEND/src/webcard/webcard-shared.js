(function () {
  var P = {
    phone:
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    wa: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    linkedin:
      '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
    instagram:
      '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    youtube:
      '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    xsoc: '<path d="M4 4l11.7 16H20L8.3 4z"/><path d="M4 20l6.8-6.8M13.2 10.8 20 4"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    share:
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    badge:
      '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    mobile: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    trend: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
    cpu: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    handshake:
      '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3M3 4h8"/>',
    cal: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
    fork: '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9M12 12v3"/>',
    repo: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    volX: '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/>',
    spark:
      '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
  };
  function svg(p, s, sw) {
    s = s || 20;
    return {
      __html:
        '<svg width="' +
        s +
        '" height="' +
        s +
        '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
        (sw || 1.75) +
        '" stroke-linecap="round" stroke-linejoin="round" style="display:block">' +
        p +
        '</svg>',
    };
  }
  var ic = {};
  Object.keys(P).forEach(function (k) {
    ic[k] = svg(P[k]);
  });
  ic.play = {
    __html:
      '<svg width="18" height="18" viewBox="0 0 24 24" style="display:block;margin-left:2px"><path d="M6 3l14 9-14 9z" fill="currentColor"/></svg>',
  };
  function grad(a, b, s, id) {
    return {
      __html:
        '<svg width="' +
        s +
        '" height="' +
        s +
        '" viewBox="0 0 24 24" fill="none" stroke="url(#' +
        id +
        ')" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><defs><linearGradient id="' +
        id +
        '" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="' +
        a +
        '"/><stop offset="1" stop-color="' +
        b +
        '"/></linearGradient></defs>' +
        P.spark +
        '</svg>',
    };
  }
  var qrCache = {};
  function qr(color) {
    color = color || '#111';
    if (qrCache[color]) return qrCache[color];
    var n = 25,
      s = 7,
      r = '';
    function rnd() {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    }
    var F = [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ];
    for (var y = 0; y < n; y++)
      for (var x = 0; x < n; x++) {
        var on = null;
        F.forEach(function (fp) {
          var fx = fp[0],
            fy = fp[1];
          if (x >= fx && x < fx + 7 && y >= fy && y < fy + 7) {
            var dx = x - fx,
              dy = y - fy;
            on = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
          }
        });
        var zone = (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
        if (on === null) on = zone ? false : rnd() > 0.52;
        if (x >= 10 && x <= 14 && y >= 10 && y <= 14) on = false;
        if (on) r += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02"/>';
      }
    qrCache[color] = {
      __html:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="100%" height="100%" fill="' +
        color +
        '" shape-rendering="crispEdges">' +
        r +
        '</svg>',
    };
    return qrCache[color];
  }
  function frames(extra) {
    var F = [
      {
        key: 'hero',
        label: 'Hero · 390×844',
        w: 390,
        h: '844px',
        statusH: 44,
        r: 44,
        bezelR: 54,
        above: true,
        rest: false,
        chat: false,
        tip: true,
        launch: true,
        launchBottom: 34,
      },
      {
        key: 'small',
        label: 'Small phone · 360×640',
        w: 360,
        h: '640px',
        statusH: 24,
        r: 26,
        bezelR: 36,
        above: true,
        rest: false,
        chat: false,
        tip: false,
        launch: true,
        launchBottom: 12,
      },
      {
        key: 'chat',
        label: 'AI chat open · 390×844',
        w: 390,
        h: '844px',
        statusH: 44,
        r: 44,
        bezelR: 54,
        above: false,
        rest: false,
        chat: true,
        tip: false,
        launch: false,
        launchBottom: 34,
      },
      {
        key: 'full',
        label: 'Full scroll · 390 wide',
        w: 390,
        h: 'auto',
        statusH: 44,
        r: 44,
        bezelR: 54,
        above: true,
        rest: true,
        chat: false,
        tip: false,
        launch: true,
        launchBottom: 100,
      },
    ];
    return F.map(function (f) {
      return Object.assign({}, f, (extra && extra[f.key]) || {});
    });
  }
  var data = {
    bio2: 'Building scalable web and mobile apps with clean code, reliable APIs and results that move the business.',
    bio: 'A skilled and results-driven Software Developer with experience in designing, developing, and maintaining scalable web and software applications. Proficient in API integration and database management, with a focus on clean, reliable code.',
    skills: ['React', 'Node.js', 'TypeScript', 'Next.js', 'Flutter', 'PostgreSQL', 'AWS'],
    stats: [
      { v: '10+', l: 'Years' },
      { v: '250+', l: 'Projects' },
      { v: '120+', l: 'Clients' },
    ],
    services: [
      { title: 'Web Development', short: 'Web Dev', desc: 'Business sites, web apps and dashboards.', icon: 'code' },
      { title: 'Mobile Apps', short: 'Apps', desc: 'iOS and Android from one codebase.', icon: 'mobile' },
      { title: 'SEO & Marketing', short: 'SEO', desc: 'Get found and convert more visitors.', icon: 'trend' },
      { title: 'AI Solutions', short: 'AI', desc: 'Chatbots and workflow automation.', icon: 'cpu' },
    ],
    projects: [
      {
        title: 'Retail POS Dashboard',
        tag: 'Web App',
        result: 'Checkout time down 38%',
        repo: 'webkik/retail-pos',
        stack: 'TypeScript',
        stackC: '#3178C6',
        stars: '1.2k',
        forks: '184',
      },
      {
        title: 'Clinic Booking App',
        tag: 'Mobile',
        result: '12k bookings in 6 months',
        repo: 'webkik/clinic-book',
        stack: 'Dart',
        stackC: '#00B4AB',
        stars: '842',
        forks: '97',
      },
      {
        title: 'D2C Store Revamp',
        tag: 'E-commerce',
        result: '2.1× conversion rate',
        repo: 'webkik/d2c-store',
        stack: 'JavaScript',
        stackC: '#F1E05A',
        stars: '516',
        forks: '63',
      },
    ],
    reels: [
      { platform: 'YouTube', title: 'Building a POS in 60s', views: '1.2M' },
      { platform: 'Instagram', title: 'A day at Webkik', views: '486K' },
      { platform: 'YouTube', title: 'React tips for founders', views: '312K' },
    ],
    fields: ['Name', 'Phone', 'Email'],
    chips: ['What services do you offer?', 'Show recent projects', 'Book a call', 'Pricing?', 'Share contact on WhatsApp'],
  };
  window.WC = { P: P, svg: svg, ic: ic, grad: grad, qr: qr, frames: frames, data: data };
})();

export default window.WC;
