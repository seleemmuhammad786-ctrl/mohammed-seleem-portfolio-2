
(function () {
  const S = window.MSScene = {
    ready: false,
    target: { x: 1.75, y: 0, s: 1.1, rx: 0, ry: 0, strips: 0 },
    mouse: { x: 0, y: 0 },
    render: function () {}, mount: function () {}
  };
  const fail = () => document.documentElement.classList.add('no-gl');
  if (!window.THREE) return fail();
  const T = THREE;
  const mobile = matchMedia('(max-width:760px)').matches;
  let renderer;
  try {
    renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return fail(); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.25));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'gl-canvas';
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  const pmrem = new T.PMREMGenerator(renderer);
  const env = new T.Scene();
  env.add(new T.Mesh(new T.SphereGeometry(20, 32, 16), new T.MeshBasicMaterial({ color: 0x040406, side: T.BackSide })));
  const box = (w, h, hex, k, p) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(hex).multiplyScalar(k), side: T.DoubleSide }));
    m.position.set(p[0], p[1], p[2]); m.lookAt(0, 0, 0); env.add(m);
  };
  box(12, 2.4, 0xffffff, 5, [0, 9, 3]);
  box(1.6, 14, 0xe4e9ff, 3.2, [-9, 0, 4]);
  box(1.6, 14, 0x8c7fff, 2.4, [9, 1, -1]);
  box(7, 7, 0x3f6bff, 1.5, [0, -2, -11]);
  box(16, .35, 0xffffff, 6, [0, -6, 7]);
  box(3, 3, 0xffffff, 2, [6, 5, 8]);
  scene.environment = pmrem.fromScene(env, 0.025).texture;
  const strips = new T.Group();
  const stripMat = [new T.MeshBasicMaterial({ color: 0x2a2f52 }), new T.MeshBasicMaterial({ color: 0x5a5f78 }), new T.MeshBasicMaterial({ color: 0x3b2f66 })];
  for (let i = 0; i < 9; i++) {
    const m = new T.Mesh(new T.PlaneGeometry(i % 3 === 0 ? 0.05 : 0.018, 14), stripMat[i % 3]);
    m.position.set(-5 + i * 1.35, 0, -3.2 - (i % 2) * .6);
    strips.add(m);
  }
  scene.add(strips);
  const geo = new T.TorusKnotGeometry(1, 0.34, mobile ? 140 : 280, mobile ? 20 : 48, 2, 3);
  const mat = new T.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.035,
    transmission: 1, thickness: 1.6, ior: 1.46,
    envMapIntensity: 1.5, clearcoat: 1, clearcoatRoughness: 0.04,
    iridescence: 0.4, iridescenceIOR: 1.3, iridescenceThicknessRange: [120, 480],
    attenuationColor: new T.Color(0xbcc6ff), attenuationDistance: 2.8,
    specularIntensity: 1
  });
  const knot = new T.Mesh(geo, mat);
  const group = new T.Group();
  group.add(knot);
  scene.add(group);
  const shardMat = new T.MeshPhysicalMaterial({ color: 0xdfe4ff, roughness: .05, metalness: .1, transparent: true, opacity: .55, envMapIntensity: 2, clearcoat: 1 });
  const shards = [];
  [[-1.9, 1.3, 1.4, .16], [1.7, -1.4, 1.9, .11], [2.2, 1.6, -.4, .09]].forEach(d => {
    const m = new T.Mesh(new T.OctahedronGeometry(d[3], 0), shardMat);
    m.position.set(d[0], d[1], d[2]); m.userData.base = m.position.clone();
    group.add(m); shards.push(m);
  });
  const gc = document.createElement('canvas'); gc.width = gc.height = 128;
  const gx = gc.getContext('2d'); const gr = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(150,165,255,.55)'); gr.addColorStop(.4, 'rgba(110,120,255,.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  gx.fillStyle = gr; gx.fillRect(0, 0, 128, 128);
  const glow = new T.Mesh(new T.PlaneGeometry(7, 7), new T.MeshBasicMaterial({ map: new T.CanvasTexture(gc), transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
  glow.position.z = -2.2; group.add(glow);
  const key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(3, 5, 4); scene.add(key);
  const rim = new T.PointLight(0x7f88ff, 2.2, 20); rim.position.set(-4, -2, 2); scene.add(rim);
  const cur = { x: S.target.x, y: 0, s: S.target.s, rx: 0, ry: 0, strips: 0 };
  let w = 0, h = 0;
  function size() {
    const p = canvas.parentElement; if (!p) return;
    const nw = p.clientWidth, nh = p.clientHeight;
    if (nw === w && nh === h) return;
    w = nw; h = nh; renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  S.mount = function (slot) {
    if (canvas.parentElement !== slot) { slot.appendChild(canvas); w = 0; size(); }
  };
  addEventListener('resize', () => { w = 0; size(); });
  let last = 0;
  S.render = function (t) {
    size();
    const dt = Math.min(.05, (t - last) / 1000 || .016); last = t;
    const k = 1 - Math.pow(.0018, dt);
    const tg = S.target;
    for (const key in cur) cur[key] += (tg[key] - cur[key]) * k;
    const mx = S.mouse.x, my = S.mouse.y;
    group.position.set(cur.x + mx * .12, cur.y - my * .08 + Math.sin(t * .0007) * .06, 0);
    group.scale.setScalar(cur.s);
    knot.rotation.set(cur.rx + t * .00011 + my * .15, cur.ry + t * .00018 + mx * .25, t * .00005);
    shards.forEach((m, i) => {
      m.rotation.x = t * .0006 * (i + 1); m.rotation.y = t * .0004 * (i + 2);
      m.position.y = m.userData.base.y + Math.sin(t * .001 + i * 2) * .12;
    });
    strips.position.x = -cur.strips * 1.4 - mx * .15;
    strips.position.y = cur.strips * .6;
    renderer.render(scene, camera);
  };
  S.ready = true;
})();
