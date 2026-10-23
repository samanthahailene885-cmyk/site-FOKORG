(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const jobs = [];
  const GOLD = "216, 171, 93";
  const BLUE = "120, 170, 190";

  function tick(now) {
    for (let index = 0; index < jobs.length; index += 1) jobs[index](now);
  }

  if (window.gsap) gsap.ticker.add((time) => tick(time * 1000));
  else requestAnimationFrame(function loop(now) {
    tick(now);
    requestAnimationFrame(loop);
  });

  initHeroField();
  initRouteBeacon();
  initSheen();
  initColdMist();
  initContactField();
  initGlobe();

  function watch(element, onChange) {
    const observer = new IntersectionObserver(
      ([entry]) => onChange(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(element);
    const rect = element.getBoundingClientRect();
    onChange(rect.bottom > 0 && rect.top < window.innerHeight);
  }

  function fitCanvas(canvas, context) {
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const bufferWidth = Math.round(width * dpr);
      const bufferHeight = Math.round(height * dpr);
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        canvas.width = bufferWidth;
        canvas.height = bufferHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width, height };
    };
    const size = resize();
    window.addEventListener("resize", resize);
    return { resize, size };
  }

  function clock() {
    let last = -1;
    return function delta(now) {
      if (last < 0) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      return dt;
    };
  }

  function initHeroField() {
    const hero = document.querySelector(".hero");
    const grid = document.querySelector(".hero__grid");
    if (!hero) return;

    const canvas = document.createElement("canvas");
    canvas.className = "fx-layer fx-hero";
    canvas.setAttribute("aria-hidden", "true");
    hero.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (!context) return;

    const view = fitCanvas(canvas, context);
    let width = view.size.width;
    let height = view.size.height;
    window.addEventListener("resize", () => {
      const next = view.resize();
      width = next.width;
      height = next.height;
    });

    const specks = Array.from({ length: Math.round(Math.min(84, Math.max(32, window.innerWidth / 18))) }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.01 + Math.random() * 0.02,
      depth: 0.35 + Math.random() * 0.65,
      radius: Math.random() < 0.28 ? 1.15 + Math.random() * 0.55 : 0.55 + Math.random() * 0.7,
      gold: Math.random() < 0.3,
      alpha: 0.2 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }));

    const signals = Array.from({ length: 4 }, () => ({
      x: 0.58 + Math.random() * 0.36,
      y: 0.22 + Math.random() * 0.58,
      speed: 0.012 + Math.random() * 0.012,
      phase: Math.random() * Math.PI * 2,
    }));

    const lanes = [
      { y0: 0.36, y1: 0.44, bend: -0.05, gold: true },
      { y0: 0.57, y1: 0.5, bend: 0.06, gold: false },
      { y0: 0.73, y1: 0.66, bend: -0.035, gold: true },
    ];

    let aimX = 0.5;
    let aimY = 0.5;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let hovering = false;
    let visible = true;
    const delta = clock();

    if (finePointer) {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        aimX = (event.clientX - rect.left) / rect.width;
        aimY = (event.clientY - rect.top) / rect.height;
        hovering = true;
      });
      hero.addEventListener("pointerleave", () => {
        hovering = false;
        aimX = 0.5;
        aimY = 0.5;
      });
    }

    watch(hero, (isVisible) => {
      visible = isVisible;
    });

    jobs.push((now) => {
      const dt = delta(now);
      if (!visible) return;

      pointerX += (aimX - pointerX) * 0.06;
      pointerY += (aimY - pointerY) * 0.06;

      if (grid) {
        const sway = hovering ? 0 : Math.sin(now * 0.00018) * 0.28;
        const lift = hovering ? 0 : Math.cos(now * 0.00015) * 0.18;
        const travel = hovering ? 16 : 8;
        grid.style.transform = `translate3d(${(pointerX - 0.5 + sway) * -travel}px, ${(pointerY - 0.5 + lift) * -travel * 0.7}px, 0)`;
      }

      context.clearRect(0, 0, width, height);

      lanes.forEach((lane) => {
        const xStart = width * 0.98;
        const xEnd = width * 0.46;
        const yStart = height * lane.y0;
        const yEnd = height * lane.y1;
        context.beginPath();
        context.moveTo(xStart, yStart);
        context.quadraticCurveTo((xStart + xEnd) / 2, (yStart + yEnd) / 2 + height * lane.bend, xEnd, yEnd);
        context.strokeStyle = lane.gold ? "rgba(216, 171, 93, 0.5)" : "rgba(186, 214, 222, 0.38)";
        context.lineWidth = 1;
        context.setLineDash([2, 10]);
        context.lineDashOffset = now * 0.018;
        context.stroke();
      });
      context.setLineDash([]);

      const originX = pointerX * width;
      const originY = pointerY * height;

      specks.forEach((speck) => {
        speck.x -= speck.speed * dt;
        speck.phase += dt * 0.7;
        speck.y += Math.sin(speck.phase) * 0.006 * dt;
        if (speck.x < -0.04) {
          speck.x = 1.04;
          speck.y = Math.random();
        }

        let x = speck.x * width + (pointerX - 0.5) * speck.depth * 18;
        let y = speck.y * height + (pointerY - 0.5) * speck.depth * 12;

        if (hovering) {
          const dx = x - originX;
          const dy = y - originY;
          const dist = Math.hypot(dx, dy);
          if (dist < 128 && dist > 0) {
            const push = (1 - dist / 128) * 16 * speck.depth;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
        }

        const presence = 0.18 + 0.82 * Math.min(1, Math.max(0, (speck.x - 0.22) / 0.7));
        context.beginPath();
        context.fillStyle = speck.gold
          ? `rgba(${GOLD}, ${speck.alpha * presence})`
          : `rgba(186, 214, 222, ${speck.alpha * presence})`;
        context.arc(x, y, speck.radius * (0.75 + speck.depth * 0.45), 0, Math.PI * 2);
        context.fill();
      });

      signals.forEach((signal) => {
        signal.x -= signal.speed * dt;
        signal.phase += dt;
        if (signal.x < 0.42) {
          signal.x = 1.02;
          signal.y = 0.2 + Math.random() * 0.62;
        }
        const x = signal.x * width;
        const y = signal.y * height + Math.sin(signal.phase) * 4;
        const halo = 6 + Math.sin(signal.phase * 1.6) * 1.4;
        context.beginPath();
        context.strokeStyle = "rgba(216, 171, 93, 0.35)";
        context.lineWidth = 1;
        context.arc(x, y, halo, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.fillStyle = "rgba(216, 171, 93, 0.9)";
        context.arc(x, y, 1.7, 0, Math.PI * 2);
        context.fill();
      });
    });
  }

  function initRouteBeacon() {
    const route = document.querySelector(".route");
    if (!route || !window.gsap || !window.ScrollTrigger) return;

    const beacon = document.createElement("span");
    beacon.className = "route-beacon";
    beacon.setAttribute("aria-hidden", "true");
    route.appendChild(beacon);

    const vertical = window.matchMedia("(max-width: 700px)");

    ScrollTrigger.create({
      trigger: route,
      start: "top 78%",
      end: "bottom 58%",
      scrub: 0.65,
      onUpdate(self) {
        const progress = self.progress;
        beacon.style.opacity = progress <= 0.01 ? "0" : "1";
        if (vertical.matches) {
          beacon.style.left = "5px";
          beacon.style.top = `${progress * Math.max(0, route.clientHeight - 18)}px`;
        } else {
          beacon.style.top = "8px";
          beacon.style.left = `${8 + progress * Math.max(0, route.clientWidth - 8)}px`;
        }
      },
    });
  }

  function initSheen() {
    if (!finePointer) return;
    document.querySelectorAll(".service-card, .temperature-grid article").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        card.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    });
  }

  function initColdMist() {
    const section = document.querySelector(".cold-chain");
    if (!section) return;

    const canvas = document.createElement("canvas");
    canvas.className = "fx-layer fx-cold";
    canvas.setAttribute("aria-hidden", "true");
    section.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (!context) return;

    const view = fitCanvas(canvas, context);
    let width = view.size.width;
    let height = view.size.height;
    window.addEventListener("resize", () => {
      const next = view.resize();
      width = next.width;
      height = next.height;
    });

    const count = window.innerWidth < 700 ? 18 : 34;
    const flakes = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      speed: 7 + Math.random() * 14,
      size: Math.random() < 0.15 ? 1.8 : 0.7 + Math.random() * 0.6,
      gold: Math.random() < 0.14,
      alpha: 0.16 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
    }));

    let visible = false;
    const delta = clock();
    watch(section, (isVisible) => {
      visible = isVisible;
    });

    jobs.push((now) => {
      const dt = delta(now);
      if (!visible) return;
      context.clearRect(0, 0, width, height);

      flakes.forEach((flake) => {
        flake.y -= (flake.speed * dt) / height;
        flake.x += Math.sin(now * 0.00035 + flake.phase) * dt * 0.012;
        if (flake.y < -0.08) {
          flake.y = 1.06;
          flake.x = Math.random();
        }

        const x = flake.x * width;
        const y = flake.y * height;
        context.beginPath();
        context.fillStyle = flake.gold
          ? `rgba(${GOLD}, ${flake.alpha})`
          : `rgba(214, 232, 238, ${flake.alpha})`;
        context.arc(x, y, flake.size, 0, Math.PI * 2);
        context.fill();
      });
    });
  }

  function initContactField() {
    const section = document.querySelector(".contact-section");
    if (!section) return;

    const canvas = document.createElement("canvas");
    canvas.className = "fx-layer fx-contact";
    canvas.setAttribute("aria-hidden", "true");
    section.appendChild(canvas);
    const context = canvas.getContext("2d");
    if (!context) return;

    section.querySelector(".contact-bg")?.classList.add("is-replaced");
    if (window.gsap) gsap.killTweensOf(".contact-bg");

    const view = fitCanvas(canvas, context);
    let width = view.size.width;
    let height = view.size.height;
    window.addEventListener("resize", () => {
      const next = view.resize();
      width = next.width;
      height = next.height;
    });

    const rings = [
      { radius: 0.62, speed: 0.11, count: 26, color: BLUE, alpha: 0.18 },
      { radius: 0.82, speed: -0.08, count: 38, color: GOLD, alpha: 0.28 },
      { radius: 1, speed: 0.045, count: 48, color: BLUE, alpha: 0.16 },
    ];

    const dots = rings.flatMap((ring) =>
      Array.from({ length: ring.count }, (_, index) => ({
        angle: (index / ring.count) * Math.PI * 2,
        speed: ring.speed * (0.75 + Math.random() * 0.5),
        radius: ring.radius,
        color: ring.color,
        size: Math.random() < 0.16 ? 2 : 1.05,
        alpha: 0.28 + Math.random() * 0.55,
      })),
    );

    let visible = false;
    const delta = clock();
    watch(section, (isVisible) => {
      visible = isVisible;
    });

    jobs.push((now) => {
      const dt = delta(now);
      if (!visible) return;
      context.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const base = Math.min(width, height) * 0.46;

      const glow = context.createRadialGradient(cx, cy, 0, cx, cy, base * 0.42);
      glow.addColorStop(0, "rgba(216, 171, 93, 0.14)");
      glow.addColorStop(1, "rgba(216, 171, 93, 0)");
      context.fillStyle = glow;
      context.beginPath();
      context.arc(cx, cy, base * 0.42, 0, Math.PI * 2);
      context.fill();

      rings.forEach((ring) => {
        context.beginPath();
        context.strokeStyle = `rgba(${ring.color}, ${ring.alpha})`;
        context.lineWidth = 1;
        context.arc(cx, cy, base * ring.radius, 0, Math.PI * 2);
        context.stroke();
      });

      context.save();
      context.beginPath();
      context.strokeStyle = "rgba(216, 171, 93, 0.55)";
      context.lineWidth = 1.35;
      context.arc(cx, cy, base * 0.82, now * 0.00016, now * 0.00016 + 0.62);
      context.stroke();
      context.restore();

      dots.forEach((dot) => {
        dot.angle += dot.speed * dt;
        const radius = base * dot.radius;
        const x = cx + Math.cos(dot.angle) * radius;
        const y = cy + Math.sin(dot.angle) * radius;
        context.beginPath();
        context.fillStyle = `rgba(${dot.color}, ${dot.alpha})`;
        context.arc(x, y, dot.size, 0, Math.PI * 2);
        context.fill();
      });
    });
  }

  function initGlobe() {
    const sceneEl = document.querySelector(".globe-scene");
    if (!sceneEl || sceneEl.dataset.webgl === "on") return;

    const wide = window.matchMedia("(min-width: 981px)");
    if (!wide.matches) {
      const onChange = () => {
        if (!wide.matches) return;
        wide.removeEventListener("change", onChange);
        initGlobe();
      };
      wide.addEventListener("change", onChange);
      return;
    }

    sceneEl.dataset.webgl = "on";
    loadThree()
      .then((THREE) => mountGlobe(THREE, sceneEl))
      .catch(() => {
        delete sceneEl.dataset.webgl;
      });
  }

  function loadThree() {
    if (loadThree.promise) return loadThree.promise;
    loadThree.promise = import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
    return loadThree.promise;
  }

  function mountGlobe(THREE, sceneEl) {
    const label = sceneEl.querySelector(":scope > span");
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;

    const canvas = renderer.domElement;
    canvas.className = "globe-webgl";
    canvas.setAttribute("aria-hidden", "true");
    sceneEl.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
    camera.position.set(0.15, 0.22, 5.15);
    camera.lookAt(0, 0, 0);

    const tilt = new THREE.Group();
    tilt.rotation.z = -0.42;
    tilt.rotation.x = 0.18;
    const earth = new THREE.Group();
    tilt.add(earth);
    scene.add(tilt);

    scene.add(new THREE.HemisphereLight(0xe7f3f8, 0x102838, 1.35));
    const key = new THREE.DirectionalLight(0xfff6ea, 2.4);
    key.position.set(-2.8, 2.6, 4.4);
    scene.add(key);

    const radius = 1.08;
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0x1d5870,
        emissive: 0x0e3344,
        emissiveIntensity: 0.7,
        specular: 0xd5ebf3,
        shininess: 26,
      }),
    );
    tilt.add(body);

    const abidjan = { lat: 5.3167, lon: -4.0167 };
    const ports = [
      { lat: 51.9225, lon: 4.4792, lift: 0.2 },
      { lat: 31.2304, lon: 121.4737, lift: 0.36 },
      { lat: -23.9608, lon: -46.333, lift: 0.28 },
    ];

    const latLon = (lat, lon, distance) => {
      const phi = THREE.MathUtils.degToRad(90 - lat);
      const theta = THREE.MathUtils.degToRad(lon + 180);
      return new THREE.Vector3(
        -distance * Math.sin(phi) * Math.cos(theta),
        distance * Math.cos(phi),
        distance * Math.sin(phi) * Math.sin(theta),
      );
    };

    const addLine = (points, color, opacity, dashed) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = dashed
        ? new THREE.LineDashedMaterial({
            color,
            transparent: true,
            opacity,
            dashSize: 0.045,
            gapSize: 0.13,
            depthWrite: false,
          })
        : new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            depthWrite: false,
          });
      const line = new THREE.Line(geometry, material);
      if (dashed) line.computeLineDistances();
      earth.add(line);
      return line;
    };

    const graticule = [];
    const pushSegment = (a, b, bucket) => bucket.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -60; lat <= 60; lat += 20) {
      if (lat === 0) continue;
      let previous = null;
      for (let lon = -180; lon <= 180; lon += 3) {
        const point = latLon(lat, lon, radius + 0.012);
        if (previous) pushSegment(previous, point, graticule);
        previous = point;
      }
    }
    for (let lon = -180; lon < 180; lon += 20) {
      let previous = null;
      for (let lat = -78; lat <= 78; lat += 3) {
        const point = latLon(lat, lon, radius + 0.012);
        if (previous) pushSegment(previous, point, graticule);
        previous = point;
      }
    }
    const graticuleGeometry = new THREE.BufferGeometry();
    graticuleGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(graticule), 3));
    earth.add(
      new THREE.LineSegments(
        graticuleGeometry,
        new THREE.LineBasicMaterial({
          color: 0x8eb8c8,
          transparent: true,
          opacity: 0.34,
          depthWrite: false,
        }),
      ),
    );

    const equator = [];
    const meridian = [];
    for (let lon = -180; lon <= 180; lon += 2) equator.push(latLon(0, lon, radius + 0.016));
    for (let lat = -78; lat <= 78; lat += 2) meridian.push(latLon(lat, abidjan.lon, radius + 0.018));
    addLine(equator, 0xd8ab5d, 0.82, false);
    addLine(meridian, 0xd8ab5d, 0.48, false);

    const flows = [];
    ports.forEach((port) => {
      const points = [];
      const start = latLon(port.lat, port.lon, radius);
      const end = latLon(abidjan.lat, abidjan.lon, radius);
      for (let step = 0; step <= 72; step += 1) {
        const t = step / 72;
        const point = start.clone().lerp(end, t);
        point.normalize().multiplyScalar(radius * (1 + Math.sin(Math.PI * t) * port.lift));
        points.push(point);
      }
      addLine(points, 0xd8ab5d, 0.5, false);
      flows.push(addLine(points, 0xf3e6c8, 0.95, true));

      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.02, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xc5dde6 }),
      );
      marker.position.copy(latLon(port.lat, port.lon, radius + 0.02));
      earth.add(marker);
    });

    const pinPosition = latLon(abidjan.lat, abidjan.lon, radius + 0.02);
    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.046, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xd8ab5d }),
    );
    pin.position.copy(pinPosition);
    earth.add(pin);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.055, 0.072, 40),
      new THREE.MeshBasicMaterial({
        color: 0xd8ab5d,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      }),
    );
    halo.position.copy(pinPosition);
    halo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pinPosition.clone().normalize());
    earth.add(halo);

    const ringGroup = new THREE.Group();
    tilt.add(ringGroup);
    [
      { inner: radius * 1.1, outer: radius * 1.114, color: 0xd8ab5d, opacity: 0.5, x: 1.2, z: 0.15 },
      { inner: radius * 1.16, outer: radius * 1.172, color: 0x78aabe, opacity: 0.28, x: 0.5, z: -0.35 },
    ].forEach((ring) => {
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(ring.inner, ring.outer, 96),
        new THREE.MeshBasicMaterial({
          color: ring.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: ring.opacity,
          depthWrite: false,
        }),
      );
      mesh.rotation.x = ring.x;
      mesh.rotation.z = ring.z;
      ringGroup.add(mesh);
    });

    const facingPin = latLon(abidjan.lat, abidjan.lon, 1);
    const baseYaw = -Math.atan2(facingPin.x, facingPin.z) + 0.28;
    let spin = 0;
    let scrollYaw = 0;
    let aimX = 0.18;
    let aimY = 0;
    let visible = false;
    const delta = clock();
    const world = new THREE.Vector3();
    const center = new THREE.Vector3();

    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: ".sectors",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate(self) {
          scrollYaw = self.progress * 0.32;
        },
      });
    }

    if (finePointer) {
      sceneEl.addEventListener("pointermove", (event) => {
        const rect = sceneEl.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        aimY = x * 0.45;
        aimX = 0.18 - y * 0.32;
      });
      sceneEl.addEventListener("pointerleave", () => {
        aimX = 0.18;
        aimY = 0;
      });
    }

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(sceneEl);

    watch(sceneEl, (isVisible) => {
      visible = isVisible;
    });

    const placeLabel = () => {
      if (!label) return;
      pin.getWorldPosition(world);
      earth.getWorldPosition(center);
      const normal = world.clone().sub(center).normalize();
      const facing = normal.dot(camera.position.clone().sub(center).normalize());
      const projected = world.clone().project(camera);
      if (facing < 0.28 || projected.z > 1) {
        label.style.opacity = "0";
        return;
      }
      const rect = sceneEl.getBoundingClientRect();
      label.style.left = `${(projected.x * 0.5 + 0.5) * rect.width}px`;
      label.style.top = `${(-projected.y * 0.5 + 0.5) * rect.height}px`;
      label.style.opacity = "1";
    };

    earth.rotation.y = baseYaw;
    renderer.render(scene, camera);
    sceneEl.classList.add("is-webgl");
    if (window.gsap) gsap.killTweensOf(".globe");

    jobs.push((now) => {
      const dt = delta(now);
      tilt.rotation.x += (aimX - tilt.rotation.x) * 0.06;
      tilt.rotation.y += (aimY - tilt.rotation.y) * 0.06;
      tilt.position.y = Math.sin(now * 0.0009) * 0.045;
      if (visible) spin += dt * ((Math.PI * 2) / 86);
      earth.rotation.y = baseYaw + spin + scrollYaw;
      if (!visible) return;
      ringGroup.rotation.y -= dt * 0.07;
      const pulse = 1 + Math.sin(now * 0.0032) * 0.22;
      halo.scale.setScalar(pulse);
      halo.material.opacity = 0.72 - (pulse - 1) * 0.8;
      flows.forEach((flow, index) => {
        flow.material.dashOffset -= dt * (0.16 + index * 0.05);
      });
      renderer.render(scene, camera);
      placeLabel();
    });
  }
})();
