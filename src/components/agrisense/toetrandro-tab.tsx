'use client'

import React, { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { RefreshCw, MapPin } from 'lucide-react'
import { useBgStore } from '@/lib/bg-store'

// Dynamic import of leaflet to avoid SSR issues
let L: any = null
if (typeof window !== 'undefined') {
  L = require('leaflet')
}

const WEEKDAYS_MG = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Sabotsy']
const MONTHS_MG = ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra']

export function getMalagasyDate(date: Date) {
  return `${WEEKDAYS_MG[date.getDay()]}, ${date.getDate()} ${MONTHS_MG[date.getMonth()]}`
}

const VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main(){
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FS = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform vec3  uSkyTop;
uniform vec3  uSkyBottom;
uniform float uSkyAlpha;
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

  vec3 sky = mix(uSkyBottom, uSkyTop, vUv.y);
  float alpha = uSkyAlpha;

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

  float cAlpha = clamp(a*uMaxAlpha, 0.0, 1.0);
  vec3 col = mix(sky, cloudCol, cAlpha);
  alpha = alpha + cAlpha * (1.0 - alpha);

  float hAlpha = clamp(ha, 0.0, 1.0);
  col = mix(col, uHiColor, hAlpha);
  alpha = alpha + hAlpha * (1.0 - alpha);
  
  gl_FragColor = vec4(col, alpha);
}
`;

const hexToRgb = (h: string) => { 
  const n = parseInt(h.slice(1),16); 
  return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255]; 
};

function CloudyWebGLCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false }) as WebGLRenderingContext | null;
    if (!gl) return;

    function compile(type: number, src: string) {
      const sh = gl!.createShader(type)!;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      return sh;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const quad = new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U: Record<string, WebGLUniformLocation | null> = {};
    ['uTime','uAspect','uSkyTop','uSkyBottom','uSkyAlpha','uCloudColor','uDensity','uSoftness','uSpeed','uWarp',
     'uBaseline','uFlatBase','uLightDir','uLightStrength','uMaxAlpha','uHiColor','uHiCoverage','uHiSpeed','uHiStretch','uHiMax']
     .forEach(name => { U[name] = gl.getUniformLocation(prog, name); });

    const wState = {
        skyTop: hexToRgb("#7f8a99"), skyBottom: hexToRgb("#b6bfc9"),
        cloudColor: hexToRgb("#d5dae0"), hiColor: hexToRgb("#dce0e4"),
        density: 0.40, softness: 0.42, speed: 0.09, warp: 0.55,
        baseline: 0.5, flatBase: 0, skyAlpha: 0.1,
        lightDir: [-0.4, -0.9], lightStrength: 0.8, maxAlpha: 0.6,
        hiCoverage: 0.75, hiSpeed: 0.3, hiStretch: 1.4, hiMax: 0.1
    };

    let animationId: number;
    const startTime = performance.now();

    function resize(){
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w; canvas!.height = h;
        gl!.viewport(0, 0, w, h);
      }
    }
    window.addEventListener('resize', resize);
    resize();

    function frame(now: number){
      resize();
      gl!.uniform1f(U.uTime, (now - startTime) / 1000);
      gl!.uniform1f(U.uAspect, canvas!.width / canvas!.height);
      gl!.uniform3fv(U.uSkyTop, wState.skyTop);
      gl!.uniform3fv(U.uSkyBottom, wState.skyBottom);
      gl!.uniform1f(U.uSkyAlpha, wState.skyAlpha);
      gl!.uniform3fv(U.uCloudColor, wState.cloudColor);
      gl!.uniform1f(U.uDensity, wState.density);
      gl!.uniform1f(U.uSoftness, wState.softness);
      gl!.uniform1f(U.uSpeed, wState.speed);
      gl!.uniform1f(U.uWarp, wState.warp);
      gl!.uniform1f(U.uBaseline, wState.baseline);
      gl!.uniform1f(U.uFlatBase, wState.flatBase);
      gl!.uniform2fv(U.uLightDir, wState.lightDir);
      gl!.uniform1f(U.uLightStrength, wState.lightStrength);
      gl!.uniform1f(U.uMaxAlpha, wState.maxAlpha);
      gl!.uniform3fv(U.uHiColor, wState.hiColor);
      gl!.uniform1f(U.uHiCoverage, wState.hiCoverage);
      gl!.uniform1f(U.uHiSpeed, wState.hiSpeed);
      gl!.uniform1f(U.uHiStretch, wState.hiStretch);
      gl!.uniform1f(U.uHiMax, wState.hiMax);

      gl!.drawArrays(gl!.TRIANGLES, 0, 6);
      animationId = requestAnimationFrame(frame);
    }
    animationId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    }
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-[1] w-full h-full transition-opacity duration-1000 opacity-65" />;
}

export function WeatherBackground({ bgUrl, weatherType }: { bgUrl: string, weatherType: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [lightning, setLightning] = useState(0)

  useEffect(() => {
    if (weatherType === "highlands") return;

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight
    canvas.width = width
    canvas.height = height

    let particles: any[] = []
    let mode = "none"

    if (weatherType === "humid_rain") mode = "rain"
    else if (weatherType === "stormy") mode = "heavy_rain"

    const count = mode === "heavy_rain" ? 400 : mode === "rain" ? 150 : 0

    for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width, y: Math.random() * height - height,
          l: Math.random() * 1 + 10, xs: (Math.random() * 4 - 2),
          ys: Math.random() * 10 + 15, opacity: Math.random() * 0.4 + 0.2
        })
    }

    const loop = () => {
      ctx.clearRect(0, 0, width, height)
      for (let p of particles) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.xs, p.y + p.l + p.ys)
          ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`
          ctx.lineWidth = 1.5
          ctx.stroke()
          p.x += p.xs; p.y += p.ys
          if (p.y > height) { p.x = Math.random() * width; p.y = -20 }
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
  }, [weatherType])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (weatherType === "stormy") {
      const lightningLoop = () => {
        if (Math.random() < 0.02) {
          setLightning(Math.random() * 0.6 + 0.2)
          setTimeout(() => setLightning(0), 50)
          if (Math.random() > 0.5) {
            setTimeout(() => {
              setLightning(Math.random() * 0.8 + 0.2)
              setTimeout(() => setLightning(0), 50)
            }, 150)
          }
        }
        timeoutId = setTimeout(lightningLoop, 100)
      }
      lightningLoop()
    } else {
      setLightning(0)
    }
    return () => clearTimeout(timeoutId)
  }, [weatherType])

  return (
    <div className="fixed inset-0 z-[-10] overflow-hidden bg-transparent pointer-events-none">
      <style>{`
        @keyframes slowKen {
          from { transform: scale(1.00) translateX(0px); }
          to   { transform: scale(1.08) translateX(-18px); }
        }
      `}</style>
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-[1500ms] ease-in-out origin-center"
        style={{ backgroundImage: `url('${bgUrl}')`, animation: 'slowKen 25s ease-in-out infinite alternate' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#06101e]/60 via-[#06101e]/30 to-[#06101e]/90" />
      </div>
      
      {weatherType === "highlands" ? (
        <CloudyWebGLCanvas />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 z-[1] transition-opacity duration-1000" />
      )}
      
      <div 
        className="absolute inset-0 z-[2] bg-white pointer-events-none transition-opacity duration-75"
        style={{ opacity: lightning }}
      />
    </div>
  )
}
const weatherProfiles = {
    "hot_windy": {
        temp: 32, max: 35, min: 22, icon: "💨", condition: "Rivotra be", bgUrl: "/assets/weather/bg_windy_madagascar_1784322010456.png",
        alert: { borderClass: "border-l-orange-500", text: "Sarotra ny manao fanafody noho ny rivotra mitsoka mafy.", title: "Vatsi-rivotra", icon: "💨" },
        soil: { val: 30, status: "Maina", color: "text-orange-300" }, rain: { val: 0, prob: "5%" }, wind: { val: 40 }, etp: { val: 6.5 },
        forecast: [ { day: 'Anio', temp: 32, icon: '☀️' }, { day: 'Rahampitso', temp: 33, icon: '💨' }, { day: 'Rahafakampitso', temp: 31, icon: '🌤️' }, { day: 'Alarobia', temp: 30, icon: '🌤️' }, { day: 'Alakamisy', temp: 29, icon: '☀️' } ]
    },
    "humid_rain": {
        temp: 27, max: 29, min: 24, icon: "🌧️", condition: "Avy ny orana", bgUrl: "/assets/weather/bg_rainy_madagascar_1784322002163.png",
        alert: { borderClass: "border-l-blue-500", text: "Tandremo ny fiakaran'ny rano amin'ny faritra iva.", title: "Tondra-drano", icon: "🌊" },
        soil: { val: 90, status: "Tondraka", color: "text-blue-300" }, rain: { val: 45, prob: "95%" }, wind: { val: 20 }, etp: { val: 1.5 },
        forecast: [ { day: 'Anio', temp: 27, icon: '🌧️' }, { day: 'Rahampitso', temp: 26, icon: '⛈️' }, { day: 'Rahafakampitso', temp: 26, icon: '🌧️' }, { day: 'Alarobia', temp: 28, icon: '☁️' }, { day: 'Alakamisy', temp: 27, icon: '🌧️' } ]
    },
    "highlands": {
        temp: 22, max: 25, min: 12, icon: "☁️", condition: "Manjombona", bgUrl: "/assets/weather/bg_cloudy_madagascar_1784321993761.png",
        alert: { borderClass: "border-l-green-500", text: "Fepetra tsara. Azo atao tsara ny mampiasa fanafody na zezika anio.", title: "Tsara", icon: "✅" },
        soil: { val: 65, status: "Tsara", color: "text-green-300" }, rain: { val: 2, prob: "15%" }, wind: { val: 12 }, etp: { val: 2.1 },
        forecast: [ { day: 'Anio', temp: 23, icon: '☁️' }, { day: 'Rahampitso', temp: 24, icon: '🌤️' }, { day: 'Rahafakampitso', temp: 25, icon: '☀️' }, { day: 'Alarobia', temp: 22, icon: '🌧️' }, { day: 'Alakamisy', temp: 21, icon: '☁️' } ]
    },
    "stormy": {
        temp: 28, max: 31, min: 18, icon: "⛈️", condition: "Misy varatra", bgUrl: "/assets/weather/bg_stormy_madagascar_1784321976650.png",
        alert: { borderClass: "border-l-red-500", text: "Aza manao fanafody anio. Mafy ny rivotra ary ahiana hisy orana.", title: "Loza", icon: "⚠️" },
        soil: { val: 38, status: "Maina", color: "text-orange-300" }, rain: { val: 15, prob: "85%" }, wind: { val: 18 }, etp: { val: 4.5 },
        forecast: [ { day: 'Anio', temp: 28, icon: '⛈️' }, { day: 'Rahampitso', temp: 26, icon: '🌧️' }, { day: 'Rahafakampitso', temp: 27, icon: '☁️' }, { day: 'Alarobia', temp: 23, icon: '⛈️' }, { day: 'Alakamisy', temp: 25, icon: '🌤️' } ]
    },
    "extreme_dry": {
        temp: 36, max: 39, min: 24, icon: "🏜️", condition: "Maina be", bgUrl: "/assets/weather/bg_clear_madagascar_1784321986254.png",
        alert: { borderClass: "border-l-red-500", text: "Tena maina ny tany eto. Ilaina ny mitahiry rano ho an'ny fambolena.", title: "Haintany", icon: "🌵" },
        soil: { val: 5, status: "Tany efitra", color: "text-red-400" }, rain: { val: 0, prob: "0%" }, wind: { val: 10 }, etp: { val: 8.5 },
        forecast: [ { day: 'Anio', temp: 36, icon: '☀️' }, { day: 'Rahampitso', temp: 37, icon: '☀️' }, { day: 'Rahafakampitso', temp: 35, icon: '💨' }, { day: 'Alarobia', temp: 36, icon: '☀️' }, { day: 'Alakamisy', temp: 34, icon: '☀️' } ]
    }
}

const regionsBase = [
    { id: "Diana", name: "Diana", lat: -12.27, lng: 49.29, color: "#FF3366", type: "hot_windy" },
    { id: "Sava", name: "Sava", lat: -14.26, lng: 50.16, color: "#33CCFF", type: "humid_rain" },
    { id: "Itasy", name: "Itasy", lat: -19.00, lng: 46.75, color: "#FF9933", type: "highlands" },
    { id: "Analamanga", name: "Analamanga", lat: -18.87, lng: 47.50, color: "#FFCC00", type: "highlands" },
    { id: "Vakinankaratra", name: "Vakinankaratra", lat: -19.86, lng: 47.03, color: "#CC33FF", type: "stormy" },
    { id: "Bongolava", name: "Bongolava", lat: -18.75, lng: 46.00, color: "#33FF99", type: "extreme_dry" },
    { id: "Sofia", name: "Sofia", lat: -15.87, lng: 48.75, color: "#FF6633", type: "hot_windy" },
    { id: "Boeny", name: "Boeny", lat: -15.71, lng: 46.31, color: "#3366FF", type: "humid_rain" },
    { id: "Betsiboka", name: "Betsiboka", lat: -16.85, lng: 46.96, color: "#99FF33", type: "highlands" },
    { id: "Melaky", name: "Melaky", lat: -17.50, lng: 44.75, color: "#FF3333", type: "extreme_dry" },
    { id: "AlaotraMangoro", name: "Alaotra-Mangoro", lat: -17.83, lng: 48.25, color: "#33A8FF", type: "humid_rain" },
    { id: "Atsinanana", name: "Atsinanana", lat: -18.14, lng: 49.39, color: "#A8FF33", type: "humid_rain" },
    { id: "Analanjirofo", name: "Analanjirofo", lat: -16.20, lng: 49.60, color: "#FF338C", type: "hot_windy" },
    { id: "AmoroniMania", name: "Amoron'i Mania", lat: -20.50, lng: 47.00, color: "#A833FF", type: "highlands" },
    { id: "HauteMatsiatra", name: "Haute Matsiatra", lat: -21.45, lng: 47.08, color: "#FF8C8C", type: "highlands" },
    { id: "VatovavyFitovinany", name: "Vatovavy-Fitovinany", lat: -22.00, lng: 47.75, color: "#8CFF8C", type: "humid_rain" },
    { id: "AtsimoAtsinanana", name: "Atsimo-Atsinanana", lat: -23.50, lng: 47.50, color: "#8C8CFF", type: "stormy" },
    { id: "Ihorombe", name: "Ihorombe", lat: -22.50, lng: 46.00, color: "#FFFF8C", type: "extreme_dry" },
    { id: "Menabe", name: "Menabe", lat: -20.00, lng: 44.50, color: "#8CFFFF", type: "hot_windy" },
    { id: "AtsimoAndrefana", name: "Atsimo-Andrefana", lat: -23.35, lng: 43.66, color: "#FFD700", type: "extreme_dry" },
    { id: "Androy", name: "Androy", lat: -24.60, lng: 45.10, color: "#FF69B4", type: "hot_windy" },
    { id: "Anosy", name: "Anosy", lat: -24.11, lng: 46.28, color: "#CD5C5C", type: "humid_rain" }
]

const meteoData = regionsBase.reduce((acc, r) => {
  acc[r.id] = { ...r, ...weatherProfiles[r.type as keyof typeof weatherProfiles] }
  return acc
}, {} as Record<string, any>)

const regionNameMapping: Record<string, string> = { 
    'diana': 'Diana', 'sava': 'Sava', 'itasy': 'Itasy', 'analamanga': 'Analamanga', 
    'vakinankaratra': 'Vakinankaratra', 'bongolava': 'Bongolava', 'sofia': 'Sofia', 
    'boeny': 'Boeny', 'betsiboka': 'Betsiboka', 'melaky': 'Melaky', 
    'alaotra': 'AlaotraMangoro', 'atsinanana': 'Atsinanana', 'analanjirofo': 'Analanjirofo', 
    'amoron': 'AmoroniMania', 'matsiatra': 'HauteMatsiatra', 'vatovavy': 'VatovavyFitovinany', 
    'fitovinany': 'VatovavyFitovinany', 'atsimo atsinanana': 'AtsimoAtsinanana', 
    'atsimo-atsinanana': 'AtsimoAtsinanana', 'ihorombe': 'Ihorombe', 'menabe': 'Menabe', 
    'atsimo andrefana': 'AtsimoAndrefana', 'atsimo-andrefana': 'AtsimoAndrefana', 
    'androy': 'Androy', 'anosy': 'Anosy' 
}

function parseWMO(code: number) {
  if (code === 0) return { condition: "Masoandro be", type: "clear", icon: "☀️", prob: "10%" };
  if (code === 1 || code === 2) return { condition: "Somary mandrahona", type: "cloudy", icon: "⛅", prob: "20%" };
  if (code === 3) return { condition: "Mandrahona", type: "cloudy", icon: "☁️", prob: "40%" };
  if (code === 45 || code === 48) return { condition: "Zavona", type: "cloudy", icon: "🌫️", prob: "30%" };
  if (code >= 51 && code <= 67) return { condition: "Orana", type: "rainy", icon: "🌧️", prob: "90%" };
  if (code >= 80 && code <= 82) return { condition: "Oram-baratra", type: "rainy", icon: "🌦️", prob: "80%" };
  if (code >= 95) return { condition: "Rivo-doza", type: "stormy", icon: "⛈️", prob: "100%" };
  return { condition: "Masoandro be", type: "clear", icon: "☀️", prob: "10%" };
}

export function ToetrandroTab() {
  const [activeRegion, setActiveRegion] = useState('Vakinankaratra')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [liveWeather, setLiveWeather] = useState<any>(null)
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const geoJsonLayerRef = useRef<any>(null)

  const staticData = meteoData[activeRegion]

  useEffect(() => {
    async function fetchLiveWeather() {
      setIsRefreshing(true)
      try {
        const { lat, lng } = staticData
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`)
        if (res.ok) {
          const data = await res.json()
          setLiveWeather(data)
        }
      } catch (err) {
        console.error('Failed to fetch live weather', err)
      } finally {
        setIsRefreshing(false)
      }
    }
    fetchLiveWeather()
  }, [activeRegion, staticData])

  const currentTemp = liveWeather?.current?.temperature_2m !== undefined ? Math.round(liveWeather.current.temperature_2m) : staticData.temp
  const currentRain = liveWeather?.current?.precipitation ?? staticData.rain.val
  const currentWind = liveWeather?.current?.wind_speed_10m ?? staticData.wind.val
  const currentMax = liveWeather?.daily?.temperature_2m_max ? Math.round(liveWeather.daily.temperature_2m_max[0]) : staticData.max
  const currentMin = liveWeather?.daily?.temperature_2m_min ? Math.round(liveWeather.daily.temperature_2m_min[0]) : staticData.min

  const currentWmo = liveWeather?.current?.weathercode !== undefined ? parseWMO(liveWeather.current.weathercode) : null
  const currentCondition = currentWmo?.condition ?? staticData.condition
  const currentType = currentWmo?.type ?? staticData.weatherType
  const currentProb = currentWmo?.prob ?? staticData.rain.prob

  const forecast = liveWeather?.daily?.time ? liveWeather.daily.time.slice(0, 7).map((t: string, i: number) => {
    let dayName = ""
    if (i === 0) dayName = "Anio"
    else if (i === 1) dayName = "Rahampitso"
    else {
      const d = new Date(t)
      const days = ['Alahady', 'Alatsinainy', 'Talata', 'Alarobia', 'Alakamisy', 'Zoma', 'Sabotsy']
      dayName = days[d.getDay()]
    }
    const wmo = parseWMO(liveWeather.daily.weathercode[i])
    return {
      day: dayName,
      icon: wmo.icon,
      temp: `${Math.round(liveWeather.daily.temperature_2m_max[i])}°`
    }
  }) : staticData.forecast

  const data = { 
    ...staticData, 
    temp: currentTemp, 
    max: currentMax,
    min: currentMin,
    condition: currentCondition,
    weatherType: currentType,
    forecast: forecast,
    rain: { ...staticData.rain, val: currentRain, prob: currentProb }, 
    wind: { ...staticData.wind, val: currentWind } 
  }

  const userRegionImages: Record<string, string> = {
    "AlaotraMangoro": "/assets/regions/AlaotraMangoro.jpg",
    "AmoroniMania": "/assets/regions/AmoroniMania.jpg",
    "Analamanga": "/assets/regions/Analamanga.jpg",
    // Androy & Anosy images were too small/low quality, falling back to 8K AI images
    "AtsimoAndrefana": "/assets/regions/AtsimoAndrefana.jpg",
    "AtsimoAtsinanana": "/assets/regions/AtsimoAtsinanana.webp",
    "Atsinanana": "/assets/regions/Atsinanana.jpg",
    "Betsiboka": "/assets/regions/Betsiboka.jpg",
    "Boeny": "/assets/regions/Boeny.jpg",
    "Bongolava": "/assets/regions/Bongolava.jpg",
    "Diana": "/assets/regions/Diana.jpg",
    // VatovavyFitovinany & Analanjirofo too small/low quality, falling back to 8K AI images
    "HauteMatsiatra": "/assets/regions/HauteMatsiatra.jpg",
    "Ihorombe": "/assets/regions/Ihorombe.jpg",
    "Itasy": "/assets/regions/Itasy.jpg",
    "Melaky": "/assets/regions/Melaky.jpg",
    "Menabe": "/assets/regions/Menabe.jpg",
    "Sava": "/assets/regions/Sava.jpg",
    "Sofia": "/assets/regions/Sofia.jpg",
    "Vakinankaratra": "/assets/regions/Vakinankaratra.jpg"
  };

  const dynamicBgUrl = userRegionImages[activeRegion] || `/assets/weather/${activeRegion}_${data.type}.jpg`;
  
  const setBg = useBgStore(state => state.setBg);

  useEffect(() => {
    setBg(dynamicBgUrl, data.type);
  }, [dynamicBgUrl, data.type, setBg]);

  useEffect(() => {
    if (!L || !mapContainerRef.current) return

    // Initialize Map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
          maxBounds: [[-26.0, 40.0], [-11.0, 53.0]],
          minZoom: 4, maxZoom: 8
      }).setView([-18.8792, 47.5052], 5.5)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
          subdomains: 'abcd',
          maxZoom: 10,
          opacity: 0.3 
      }).addTo(mapRef.current)

      fetch('https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/main/releaseData/gbOpen/MDG/ADM1/geoBoundaries-MDG-ADM1_simplified.geojson')
      .then(async res => {
          if (!res.ok) throw new Error('Failed to fetch GeoJSON')
          const text = await res.text()
          try {
              return JSON.parse(text)
          } catch (e) {
              throw new Error('Invalid JSON')
          }
      })
      .then(geoData => {
          geoJsonLayerRef.current = L.geoJSON(geoData, {
              style: function(feature: any) {
                  const rawName = feature.properties.shapeName || feature.properties.name || feature.properties.NAME || ""
                  const name = rawName.toLowerCase()
                  
                  let rId: string | null = null
                  for(let k in regionNameMapping) { if(name.includes(k)) rId = regionNameMapping[k] }
                  
                  // In useEffect closures, activeRegion might be stale, but we update styles dynamically in a subsequent effect
                  const isActive = rId === 'Vakinankaratra' 
                  const regionColor = (rId && meteoData[rId]) ? meteoData[rId].color : '#555555'

                  return {
                      fillColor: regionColor,
                      color: isActive ? '#ffffff' : regionColor,
                      weight: isActive ? 2 : 1,
                      opacity: isActive ? 1 : 0.4,
                      fillOpacity: isActive ? 0.6 : 0.25 
                  }
              },
              onEachFeature: function(feature: any, layer: any) {
                  const rawName = feature.properties.shapeName || feature.properties.name || ""
                  const name = rawName.toLowerCase()
                  
                  let rId: string | null = null
                  for(let k in regionNameMapping) { if(name.includes(k)) rId = regionNameMapping[k] }
                  
                  if(rId) {
                      layer.on('click', () => setActiveRegion(rId))
                      layer.bindTooltip(meteoData[rId].name, {
                          sticky: true,
                          className: 'glass-tooltip'
                      })
                  }
              }
          }).addTo(mapRef.current)

          updateMapStyles('Vakinankaratra')
      }).catch(err => {
          console.error("GeoJSON failed, safety basemap fallback used.", err)
      })

      // Add Markers
      Object.keys(meteoData).forEach(regionId => {
          const rData = meteoData[regionId]
          const customIcon = L.divIcon({
              className: '',
              html: `<div class="w-2.5 h-2.5 agri-marker" id="marker-${regionId}" style="--marker-color: ${rData.color};"></div>`,
              iconSize: [10, 10], iconAnchor: [5, 5]
          })
          const marker = L.marker([rData.lat, rData.lng], { icon: customIcon }).addTo(mapRef.current)
          
          marker.on('click', () => setActiveRegion(regionId))
          marker.bindTooltip(rData.name, {
              direction: 'top',
              offset: [0, -10],
              className: 'glass-tooltip'
          })
      })

      setTimeout(() => { mapRef.current?.invalidateSize() }, 300)
    }

    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // Run once

  // Update map styles on activeRegion change
  const updateMapStyles = (regionId: string) => {
    if (!L) return

    // Update marker CSS classes manually since Leaflet controls DOM
    document.querySelectorAll('.agri-marker').forEach(el => el.classList.remove('active'))
    const activeMarkerDiv = document.getElementById('marker-' + regionId)
    if(activeMarkerDiv) activeMarkerDiv.classList.add('active')

    // Update GeoJSON layer style
    if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.setStyle(function(feature: any) {
            const rawName = feature.properties.shapeName || feature.properties.name || ""
            const name = rawName.toLowerCase()
            let rId: string | null = null
            for(let k in regionNameMapping) { if(name.includes(k)) rId = regionNameMapping[k] }
            
            const isActive = rId === regionId
            const regionColor = (rId && meteoData[rId]) ? meteoData[rId].color : '#555555'

            return {
                fillColor: regionColor,
                color: isActive ? '#ffffff' : regionColor,
                weight: isActive ? 2.5 : 1,
                opacity: isActive ? 1 : 0.4,
                fillOpacity: isActive ? 0.7 : 0.25
            }
        })
    }
    
    // Pan map
    const targetData = meteoData[regionId]
    if (mapRef.current && targetData) {
        mapRef.current.setView([targetData.lat, targetData.lng], 6, { animate: true, duration: 1 })
    }
  }

  useEffect(() => {
    updateMapStyles(activeRegion)
  }, [activeRegion])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      updateMapStyles(activeRegion)
      setIsRefreshing(false)
    }, 500)
  }

  const heights = ["translate-y-0", "translate-y-[-15px]", "translate-y-[5px]", "translate-y-[-20px]", "translate-y-[10px]"]

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .bg-app-toetrandro {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            z-index: 0;
            transition: background-image 1s ease-in-out;
        }

        .bg-overlay-toetrandro {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(5, 5, 10, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            z-index: 1;
        }

        .agri-marker {
            background-color: var(--marker-color);
            border: 2px solid rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            box-shadow: 0 0 15px var(--marker-color);
            transition: all 0.3s ease;
        }
        
        @keyframes pulseActivePro {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); transform: scale(1); }
            70% { box-shadow: 0 0 0 15px rgba(255, 255, 255, 0); transform: scale(1.4); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); transform: scale(1); }
        }

        .agri-marker.active {
            animation: pulseActivePro 2s infinite;
            border-color: white;
            z-index: 1000 !important;
        }

        .glass-panel-toetrandro {
            background: rgba(10, 15, 30, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }

        .dark .glass-panel-toetrandro {
            background: rgba(10, 15, 30, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7);
        }

        .glass-card-toetrandro {
            background: rgba(15, 20, 40, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            backdrop-filter: blur(16px);
            transition: all 0.3s ease;
        }
        .dark .glass-card-toetrandro {
            background: rgba(5, 10, 20, 0.45);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-card-toetrandro:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-3px);
            border-color: rgba(255, 255, 255, 0.6);
            box-shadow: 0 8px 20px -8px rgba(0,0,0,0.15);
        }
        .dark .glass-card-toetrandro:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .forecast-line {
            position: absolute;
            top: 50%;
            left: 0;
            width: 100%;
            height: 1px;
            background: rgba(255, 255, 255, 0.3);
            z-index: 0;
        }
        .dark .forecast-line {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .glass-tooltip {
            background: rgba(10, 10, 15, 0.9) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            color: white !important;
            border-radius: 12px !important;
            padding: 8px 14px !important;
            font-size: 13px !important;
            font-weight: 400 !important;
            letter-spacing: 0.05em !important;
            box-shadow: 0 10px 25px rgba(0,0,0,0.8) !important;
        }
        .leaflet-tooltip-top:before, .leaflet-tooltip-bottom:before, .leaflet-tooltip-left:before, .leaflet-tooltip-right:before {
            display: none !important;
        }
      `}} />

      <div className="relative w-full lg:h-[800px] flex flex-col">
        {/* Conteneur Principal */}
        <div className="font-sans text-white antialiased w-full h-full flex flex-col lg:flex-row gap-6 lg:gap-10 relative z-10 overflow-visible">
          
          {/* Panneau Latéral (Carte et Alertes) */}
          <aside className="w-full lg:w-[420px] lg:h-full flex-shrink-0 flex flex-col gap-4 sm:gap-6 relative z-20">
              
              <div className="glass-panel-toetrandro rounded-[2rem] p-6 text-center relative overflow-hidden">
                  <h1 className="text-2xl font-extralight tracking-widest mb-1 text-white">TOETRANDRO</h1>
                  <p className="text-[10px] text-white/50 tracking-[0.2em] uppercase">Fambolena - Madagasikara</p>
              </div>


              <div className="glass-panel-toetrandro rounded-[2.5rem] p-1 flex-1 min-h-[350px] flex flex-col relative overflow-hidden group">
                  <div className="absolute top-6 left-6 z-20 pointer-events-none">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                        Safidio ny Faritra
                      </span>
                  </div>
                  <div ref={mapContainerRef} className="w-full flex-1 min-h-[300px] rounded-[2.2rem] opacity-90 group-hover:opacity-100 transition-opacity duration-500 bg-transparent"></div>
              </div>
          </aside>

          <main className="flex-1 w-full min-w-0 lg:h-full flex flex-col justify-start lg:justify-between py-2 lg:py-6 relative z-10 gap-8 lg:gap-0">
              <header className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                      <span className="text-white/60"><MapPin className="w-5 h-5" /></span>
                      <div>
                          <h2 className="text-xl font-light tracking-wide text-white">{data.name}, MDG</h2>
                          <p className="text-xs text-white/40 tracking-wider uppercase mt-1">
                            {getMalagasyDate(new Date())}
                          </p>
                      </div>
                  </div>
                  
                  <button onClick={handleRefresh} className="px-5 py-2 rounded-full glass-panel-toetrandro flex items-center gap-2 hover:bg-white/10 transition-colors text-xs tracking-wider uppercase text-white">
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Havaozina
                  </button>
              </header>

              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mt-10 lg:mt-0">
                  
                  <div className="mb-12 lg:mb-0">
                      <div className="flex items-start gap-4">
                          <h1 className="text-7xl sm:text-8xl lg:text-[180px] font-extralight leading-none tracking-tighter text-white">
                            {data.temp}°
                          </h1>
                          <div className="flex flex-col gap-2 mt-2 sm:mt-4 lg:mt-12">
                              <div className="glass-panel-toetrandro px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm text-white/80">M <span className="text-white">{data.max}°</span></div>
                              <div className="glass-panel-toetrandro px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm text-white/50">A <span className="text-white">{data.min}°</span></div>
                          </div>
                      </div>
                      <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extralight mt-4 tracking-tight text-white">{data.condition}</h2>
                      <p className="text-sm sm:text-lg text-white/40 font-light mt-2 lg:mt-3 tracking-wide">Miaraka amin'ny rahona vitsivitsy</p>
                  </div>

                  <div className="w-full lg:w-[480px] grid grid-cols-2 gap-3 lg:gap-4">
                      
                      <div className="glass-card-toetrandro p-4 lg:p-6 flex flex-col justify-between h-[110px] lg:h-[130px]">
                          <div className="flex justify-between items-start">
                              <span className="text-white/50 text-lg lg:text-xl">🌱</span>
                              <span className="text-[9px] lg:text-[10px] font-medium tracking-widest uppercase px-2 py-1 rounded-full bg-white/10 text-white">{data.soil.status}</span>
                          </div>
                          <div>
                              <div className="text-2xl lg:text-3xl font-light mb-1 text-white">{data.soil.val}%</div>
                              <div className="text-[9px] lg:text-[10px] text-white/40 uppercase tracking-widest truncate">Hamandoan'ny tany</div>
                          </div>
                      </div>

                      <div className="glass-card-toetrandro p-4 lg:p-6 flex flex-col justify-between h-[110px] lg:h-[130px]">
                          <div className="flex justify-between items-start">
                              <span className="text-white/50 text-lg lg:text-xl">💧</span>
                              <span className="text-[9px] lg:text-[10px] font-medium tracking-widest uppercase px-2 py-1 rounded-full bg-white/10 text-white">{data.rain.prob}</span>
                          </div>
                          <div>
                              <div className="text-2xl lg:text-3xl font-light mb-1 text-white"><span>{data.rain.val}</span> <span className="text-xs lg:text-sm">mm</span></div>
                              <div className="text-[9px] lg:text-[10px] text-white/40 uppercase tracking-widest truncate">Orana andrasana</div>
                          </div>
                      </div>

                      <div className="glass-card-toetrandro p-4 lg:p-6 flex flex-col justify-between h-[110px] lg:h-[130px]">
                          <div className="flex justify-between items-start">
                              <span className="text-white/50 text-lg lg:text-xl">💨</span>
                          </div>
                          <div>
                              <div className="text-2xl lg:text-3xl font-light mb-1 text-white"><span>{data.wind.val}</span> <span className="text-xs lg:text-sm">km/h</span></div>
                              <div className="text-[9px] lg:text-[10px] text-white/40 uppercase tracking-widest truncate">Rivotra mitsoka</div>
                          </div>
                      </div>

                      <div className="glass-card-toetrandro p-4 lg:p-6 flex flex-col justify-between h-[110px] lg:h-[130px]">
                          <div className="flex justify-between items-start">
                              <span className="text-white/50 text-lg lg:text-xl">☀️</span>
                          </div>
                          <div>
                              <div className="text-2xl lg:text-3xl font-light mb-1 text-white"><span>{data.etp.val}</span> <span className="text-xs lg:text-sm">mm</span></div>
                              <div className="text-[9px] lg:text-[10px] text-white/40 uppercase tracking-widest truncate">Fietonan'ny rano</div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="mt-12 lg:mt-0 relative w-full min-w-0 pt-8 lg:pt-12 pb-2 lg:pb-6 overflow-hidden">
                  <div className="forecast-line hidden lg:block"></div>
                  
                  <div className="flex justify-between items-end relative z-10 overflow-x-auto lg:overflow-visible gap-4 sm:gap-6 lg:gap-0 pb-4 lg:pb-0 px-2 scrollbar-none snap-x snap-mandatory">
                      {data.forecast.map((fc: any, idx: number) => (
                          <div key={idx} className={`flex flex-col items-center min-w-[70px] lg:min-w-[90px] transition-transform duration-700 ${heights[idx]} snap-center`}>
                              <div className="text-[10px] lg:text-[11px] tracking-widest uppercase font-medium text-white/50 mb-3 lg:mb-4">{fc.day}</div>
                              <div className="text-xl lg:text-2xl mb-4 lg:mb-5 opacity-80">{fc.icon}</div>
                              <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-white shadow-[0_0_15px_white] z-10 mb-4 lg:mb-6 relative">
                                  <div className="absolute w-full h-full bg-white rounded-full animate-ping opacity-50"></div>
                              </div>
                              <div className="text-2xl lg:text-3xl font-extralight text-white">{fc.temp}°</div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Bloc Alerte Agricole (Déplacé en bas) */}
              <div className={`mt-4 glass-panel-toetrandro rounded-2xl p-4 relative overflow-hidden border-l-2 ${data.alert.borderClass} flex items-center gap-4`}>
                  <div className="text-2xl sm:text-3xl shrink-0">{data.alert.icon}</div>
                  <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/70">Fampitandremana</span>
                          <span className="px-2 py-0.5 bg-white/10 rounded-full text-[9px] font-bold tracking-wide text-white">
                            {data.alert.title}
                          </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium leading-snug text-white/90">
                          {data.alert.text}
                      </p>
                  </div>
              </div>

          </main>
      </div>
      </div>
    </>
  )
}
