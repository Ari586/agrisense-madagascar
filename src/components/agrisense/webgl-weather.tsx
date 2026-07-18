'use client'

import { useEffect, useRef, useMemo, useState } from 'react'

const vsSrc = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const fsSrc = `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform float uAspect;
uniform vec3  uCloudColor;
uniform float uDensity;
uniform float uSoftness;
uniform float uSpeed;
uniform float uWarp;
uniform float uBaseline;
uniform float uFlatBase;
uniform vec2  uLightDir;
uniform float uLightStrength;
uniform float uMaxAlpha;
uniform vec3  uHiColor;
uniform float uHiCoverage;
uniform float uHiSpeed;
uniform float uHiStretch;
uniform float uHiMax;

vec3 gradHash(vec3 p){
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float perlin3(vec3 p){
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f*f*f*(f*(f*6.0-15.0)+10.0);

  float n000 = dot(gradHash(i+vec3(0,0,0)), f-vec3(0,0,0));
  float n100 = dot(gradHash(i+vec3(1,0,0)), f-vec3(1,0,0));
  float n010 = dot(gradHash(i+vec3(0,1,0)), f-vec3(0,1,0));
  float n110 = dot(gradHash(i+vec3(1,1,0)), f-vec3(1,1,0));
  float n001 = dot(gradHash(i+vec3(0,0,1)), f-vec3(0,0,1));
  float n101 = dot(gradHash(i+vec3(1,0,1)), f-vec3(1,0,1));
  float n011 = dot(gradHash(i+vec3(0,1,1)), f-vec3(0,1,1));
  float n111 = dot(gradHash(i+vec3(1,1,1)), f-vec3(1,1,1));

  float nx00 = mix(n000, n100, u.x);
  float nx10 = mix(n010, n110, u.x);
  float nx01 = mix(n001, n101, u.x);
  float nx11 = mix(n011, n111, u.x);
  float nxy0 = mix(nx00, nx10, u.y);
  float nxy1 = mix(nx01, nx11, u.y);
  return mix(nxy0, nxy1, u.z) * 0.5 + 0.5;
}

float fbm(vec3 p, int octaves){
  float total = 0.0, amp = 0.55, freq = 1.0, maxAmp = 0.0;
  for (int i=0; i<6; i++){
    if (i >= octaves) break;
    total += perlin3(p*freq) * amp;
    maxAmp += amp;
    amp *= 0.55;
    freq *= 2.0;
  }
  return total / maxAmp;
}

float smoothstepc(float lo, float hi, float x){
  float t = clamp((x-lo)/(hi-lo), 0.0, 1.0);
  return t*t*(3.0-2.0*t);
}

void main(){
  vec2 uv = vUv;
  uv.x *= uAspect;

  float t = uTime * uSpeed * 0.05;
  vec3 p = vec3(uv.x*1.6, uv.y*1.6, 0.0);

  vec2 warp = vec2(
    fbm(vec3(p.x*0.6 + t*0.5, p.y*0.6, t*0.25), 2),
    fbm(vec3(p.x*0.6, p.y*0.6 + t*0.4, -t*0.3), 2)
  );
  vec3 wp = vec3(p.x + warp.x*uWarp, p.y + warp.y*uWarp, t*0.6);
  float n = fbm(wp, 5);

  float vf = 1.0 - vUv.y;
  float baseCut = mix(1.0, 1.0 - smoothstepc(uBaseline-0.02, uBaseline+0.10, vf), uFlatBase);

  float lo = uDensity - uSoftness, hi = uDensity + uSoftness;
  float a = smoothstepc(lo, hi, n) * baseCut;

  float eps = 0.025;
  float n2 = fbm(wp + vec3(eps,0.0,0.0), 5);
  float n3 = fbm(wp + vec3(0.0,eps,0.0), 5);
  float dx = n2-n, dy = n3-n;
  float shade = clamp(0.5 + (dx*uLightDir.x + dy*uLightDir.y) * uLightStrength, 0.0, 1.0);
  vec3 cloudCol = clamp(mix(uCloudColor*0.6, uCloudColor*1.45, shade), 0.0, 1.0);

  vec3 hp = vec3(uv.x*uHiStretch*0.4 + t*1.4, uv.y*2.4, t*0.4);
  float hn = fbm(hp, 4);
  float ha = smoothstepc(uHiCoverage-0.22, uHiCoverage+0.22, hn) * uHiMax;

  float cloudAlpha = clamp(a*uMaxAlpha, 0.0, 1.0);
  float hiAlpha = clamp(ha, 0.0, 1.0);
  
  float totalAlpha = max(cloudAlpha, hiAlpha);
  vec3 finalColor = mix(cloudCol, uHiColor, hiAlpha / (totalAlpha + 0.0001));

  gl_FragColor = vec4(finalColor, totalAlpha);
}
`;

const hexToRgb = (h: string) => { const n = parseInt(h.slice(1), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]; };

const weathers: Record<string, any> = {
  clear: {
    u: { cloudColor: "#ffffff", density: .58, softness: .28, speed: .10, warp: .5, baseline: .58, flatBase: 1, lightDir: [-.6, -.8], lightStrength: 1.4, maxAlpha: 1.4, hiColor: "#ffffff", hiCoverage: .7, hiSpeed: .5, hiStretch: 1.6, hiMax: .22 }
  },
  partly_cloudy: {
    u: { cloudColor: "#ffffff", density: .5, softness: .30, speed: .12, warp: .6, baseline: .5, flatBase: 1, lightDir: [-.6, -.8], lightStrength: 1.3, maxAlpha: 1.5, hiColor: "#ffffff", hiCoverage: .68, hiSpeed: .6, hiStretch: 1.8, hiMax: .2 }
  },
  cloudy: {
    u: { cloudColor: "#d5dae0", density: .40, softness: .42, speed: .09, warp: .55, baseline: .5, flatBase: 0, lightDir: [-.4, -.9], lightStrength: .8, maxAlpha: 1.7, hiColor: "#dce0e4", hiCoverage: .75, hiSpeed: .3, hiStretch: 1.4, hiMax: .1 }
  },
  foggy: {
    u: { cloudColor: "#f0f1f4", density: .28, softness: .58, speed: .04, warp: .3, baseline: .5, flatBase: 0, lightDir: [0, -1], lightStrength: .3, maxAlpha: 1.5, hiColor: "#f5f6f8", hiCoverage: .8, hiSpeed: .1, hiStretch: 1.0, hiMax: .05 }
  },
  rainy: {
    u: { cloudColor: "#646f80", density: .38, softness: .44, speed: .13, warp: .7, baseline: .5, flatBase: 0, lightDir: [-.3, -.9], lightStrength: .7, maxAlpha: 1.7, hiColor: "#82909b", hiCoverage: .75, hiSpeed: .35, hiStretch: 1.2, hiMax: .1 }
  },
  stormy: {
    u: { cloudColor: "#2a2e3c", density: .36, softness: .40, speed: .20, warp: .9, baseline: .42, flatBase: 1, lightDir: [.3, -.7], lightStrength: 1.7, maxAlpha: 1.8, hiColor: "#3c4050", hiCoverage: .6, hiSpeed: .7, hiStretch: 1.1, hiMax: .14 }
  },
  windy: {
    u: { cloudColor: "#ffffff", density: .55, softness: .38, speed: .32, warp: 1.1, baseline: .55, flatBase: 1, lightDir: [-.6, -.8], lightStrength: 1.2, maxAlpha: 1.2, hiColor: "#ffffff", hiCoverage: .62, hiSpeed: 1.2, hiStretch: 2.2, hiMax: .3 }
  },
  clear_night: {
    u: { cloudColor: "#323a5a", density: .6, softness: .32, speed: .05, warp: .4, baseline: .5, flatBase: 0, lightDir: [-.5, -.8], lightStrength: .6, maxAlpha: .6, hiColor: "#d2dcff", hiCoverage: .72, hiSpeed: .15, hiStretch: 1.8, hiMax: .16 }
  },
};

function toState(w: any) {
  return {
    cloudColor: hexToRgb(w.u.cloudColor), hiColor: hexToRgb(w.u.hiColor),
    density: w.u.density, softness: w.u.softness, speed: w.u.speed, warp: w.u.warp,
    baseline: w.u.baseline, flatBase: w.u.flatBase,
    lightDir: [...w.u.lightDir], lightStrength: w.u.lightStrength, maxAlpha: w.u.maxAlpha,
    hiCoverage: w.u.hiCoverage, hiSpeed: w.u.hiSpeed, hiStretch: w.u.hiStretch, hiMax: w.u.hiMax
  };
}

export function WebGLWeatherOverlay({ weatherType }: { weatherType: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const mappedType = useMemo(() => {
    switch (weatherType) {
      case 'clear': return 'clear';
      case 'partly_cloudy': return 'partly_cloudy';
      case 'cloudy': return 'cloudy';
      case 'foggy': return 'foggy';
      case 'rainy': return 'rainy';
      case 'humid_rain': return 'rainy'; 
      case 'stormy': return 'stormy';
      case 'windy': return 'windy';
      case 'hot_windy': return 'windy'; 
      case 'clear_night': return 'clear_night';
      case 'extreme_dry': return 'clear'; 
      case 'highlands': return 'partly_cloudy'; 
      default: return 'clear';
    }
  }, [weatherType])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true }) || canvas.getContext('experimental-webgl') as WebGLRenderingContext
    if (!gl) return

    function compile(type: number, src: string) {
      const sh = gl.createShader(type)!
      gl.shaderSource(sh, src)
      gl.compileShader(sh)
      return sh
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1])
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const U: Record<string, WebGLUniformLocation | null> = {};
    ['uTime', 'uAspect', 'uCloudColor', 'uDensity', 'uSoftness', 'uSpeed', 'uWarp',
      'uBaseline', 'uFlatBase', 'uLightDir', 'uLightStrength', 'uMaxAlpha', 'uHiColor', 'uHiCoverage', 'uHiSpeed', 'uHiStretch', 'uHiMax']
      .forEach(name => U[name] = gl.getUniformLocation(prog, name))

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const w = Math.floor(window.innerWidth * dpr)
      const h = Math.floor(window.innerHeight * dpr)
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w; canvas!.height = h;
        gl.viewport(0, 0, w, h)
      }
    }
    window.addEventListener('resize', resize)
    resize()

    let cur = toState(weathers[mappedType] || weathers['clear'])
    let tgt = toState(weathers[mappedType] || weathers['clear'])

    let startTime = performance.now()
    let animationFrameId: number;

    function lerp(a: number, b: number, f: number) { return a + (b - a) * f; }
    function lerpArr(a: number[], b: number[], f: number) { for (let i = 0; i < a.length; i++) a[i] = lerp(a[i], b[i], f); }
    
    function stepState() {
      const f = 0.02;
      lerpArr(cur.cloudColor, tgt.cloudColor, f); lerpArr(cur.hiColor, tgt.hiColor, f);
      lerpArr(cur.lightDir, tgt.lightDir, f);
      ['density', 'softness', 'speed', 'warp', 'baseline', 'flatBase', 'lightStrength', 'maxAlpha',
        'hiCoverage', 'hiSpeed', 'hiStretch', 'hiMax'].forEach(k => {
          (cur as any)[k] = lerp((cur as any)[k], (tgt as any)[k], f)
        });
    }

    function frame(now: number) {
      stepState();

      gl.uniform1f(U.uTime, (now - startTime) / 1000);
      gl.uniform1f(U.uAspect, canvas!.width / canvas!.height);
      gl.uniform3fv(U.uCloudColor, cur.cloudColor);
      gl.uniform1f(U.uDensity, cur.density);
      gl.uniform1f(U.uSoftness, cur.softness);
      gl.uniform1f(U.uSpeed, cur.speed);
      gl.uniform1f(U.uWarp, cur.warp);
      gl.uniform1f(U.uBaseline, cur.baseline);
      gl.uniform1f(U.uFlatBase, cur.flatBase);
      gl.uniform2fv(U.uLightDir, cur.lightDir);
      gl.uniform1f(U.uLightStrength, cur.lightStrength);
      gl.uniform1f(U.uMaxAlpha, cur.maxAlpha);
      gl.uniform3fv(U.uHiColor, cur.hiColor);
      gl.uniform1f(U.uHiCoverage, cur.hiCoverage);
      gl.uniform1f(U.uHiSpeed, cur.hiSpeed);
      gl.uniform1f(U.uHiStretch, cur.hiStretch);
      gl.uniform1f(U.uHiMax, cur.hiMax);

      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      animationFrameId = requestAnimationFrame(frame)
    }

    animationFrameId = requestAnimationFrame(frame)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mappedType])

  const rainCanvasRef = useRef<HTMLCanvasElement>(null)
  const [lightningIntensity, setLightningIntensity] = useState(0)

  useEffect(() => {
    if (mappedType !== "rainy" && mappedType !== "stormy") return;
    
    const canvas = rainCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    let particles: any[] = []
    let splashes: any[] = []
    let lightningBolts: any[] = []
    
    const isStorm = mappedType === "stormy"
    const count = isStorm ? 600 : 250

    for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width, 
          y: Math.random() * height - height,
          l: Math.random() * 20 + 20, 
          xs: (Math.random() * 2 - 1) + (isStorm ? 3 : 1), 
          ys: Math.random() * 15 + 25, 
          opacity: Math.random() * 0.4 + 0.1,
          thickness: Math.random() * 1.5 + 0.5
        })
    }

    let lastLightningTime = 0;
    
    function createLightning() {
      const x = Math.random() * width;
      const branches = [];
      let currentX = x;
      let currentY = 0;
      
      branches.push([{x: currentX, y: currentY}]);
      
      for(let i=0; i < 15; i++) {
        currentY += Math.random() * 60 + 20;
        currentX += (Math.random() - 0.5) * 120;
        branches[0].push({x: currentX, y: currentY});
        
        if (Math.random() > 0.6) {
           let bx = currentX;
           let by = currentY;
           let branch = [{x: bx, y: by}];
           for(let j=0; j < 5; j++) {
             by += Math.random() * 50 + 10;
             bx += (Math.random() - 0.5) * 90;
             branch.push({x: bx, y: by});
           }
           branches.push(branch);
        }
      }
      return { branches, life: 1.0 };
    }

    const loop = () => {
      ctx.clearRect(0, 0, width, height)
      
      if (isStorm) {
        if (Math.random() < 0.01 && Date.now() - lastLightningTime > 2500) {
           lightningBolts.push(createLightning());
           lastLightningTime = Date.now();
           setLightningIntensity(0.7);
           setTimeout(() => setLightningIntensity(0), 80);
           if (Math.random() > 0.5) {
             setTimeout(() => {
               setLightningIntensity(0.9);
               setTimeout(() => setLightningIntensity(0), 80);
             }, 150);
           }
        }
        
        for (let i = lightningBolts.length - 1; i >= 0; i--) {
          const bolt = lightningBolts[i];
          ctx.beginPath();
          ctx.strokeStyle = `rgba(220, 230, 255, ${bolt.life})`;
          ctx.lineWidth = 3 * bolt.life;
          ctx.shadowBlur = 15;
          ctx.shadowColor = "#ffffff";
          
          for (const branch of bolt.branches) {
            ctx.moveTo(branch[0].x, branch[0].y);
            for (let j = 1; j < branch.length; j++) {
               ctx.lineTo(branch[j].x, branch[j].y);
            }
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
          
          bolt.life -= 0.08;
          if (bolt.life <= 0) lightningBolts.splice(i, 1);
        }
      }

      ctx.lineCap = 'round';
      for (let p of particles) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.xs, p.y + p.l)
          const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.xs, p.y + p.l);
          grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
          grad.addColorStop(1, `rgba(200, 220, 255, ${p.opacity})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = p.thickness
          ctx.stroke()
          p.x += p.xs; p.y += p.ys
          
          if (p.y > height) { 
             if (Math.random() > 0.4) {
                splashes.push({ x: p.x, y: height, life: 1, radius: p.thickness * 1.5 });
             }
             p.x = Math.random() * width; 
             p.y = -20 - Math.random() * 100;
          }
      }
      
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.beginPath();
        ctx.ellipse(s.x, s.y - s.radius * 0.5, s.radius * 2, s.radius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 220, 255, ${s.life * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        s.life -= 0.15;
        s.radius += 0.8;
        if (s.life <= 0) splashes.splice(i, 1);
      }
      
      animationFrameId = requestAnimationFrame(loop)
    }
    loop()

    const handleResize = () => {
      width = window.innerWidth; height = window.innerHeight
      canvas.width = width; canvas.height = height
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mappedType])

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .flake { position:absolute; top:-5%; background:#fff; border-radius:50%; opacity:.7; animation: fall linear infinite; }
        @keyframes fall { to { transform: translateY(115vh) translateX(20px); } }
        .streak { position:absolute; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); animation: blow linear infinite; }
        @keyframes blow { from { transform: translateX(-20vw); } to { transform: translateX(120vw); } }
        .star { position:absolute; width:2px; height:2px; background:#fff; border-radius:50%; animation: twinkle ease-in-out infinite; }
        @keyframes twinkle { 0%,100% { opacity:.1; } 50% { opacity:.85; } }
      `}} />
      <div className="absolute inset-0 pointer-events-none z-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
        
        {mappedType === 'clear_night' && (
          <div className="absolute inset-0">
            {Array.from({length: 60}).map((_, i) => (
              <div key={i} className="star" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 65}%`,
                animationDuration: '4.5s',
                animationDelay: `${-Math.random() * 4}s`
              }} />
            ))}
          </div>
        )}
        
        {mappedType === 'windy' && (
          <div className="absolute inset-0">
            {Array.from({length: 8}).map((_, i) => (
              <div key={i} className="streak" style={{
                top: `${10 + Math.random() * 70}%`,
                width: `${70 + Math.random() * 70}px`,
                animationDuration: `${2.5 + Math.random() * 2}s`,
                animationDelay: `${-Math.random() * 3}s`
              }} />
            ))}
          </div>
        )}

        <canvas ref={rainCanvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: (mappedType === 'rainy' || mappedType === 'stormy') ? 1 : 0, transition: 'opacity 1s' }} />
        
        <div className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay" style={{ opacity: lightningIntensity, transition: 'opacity 0.05s' }} />
      </div>
    </>
  )
}
