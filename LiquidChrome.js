import { Renderer, Program, Mesh, Triangle } from 'https://cdn.skypack.dev/ogl';

export function initLiquidChrome({
  baseColor = [0.05, 0.05, 0.05], // dark chrome-like black
  speed = 0.4,
  amplitude = 0.3,
  frequencyX = 10,
  frequencyY = 10,
  interactive = true,
} = {}) {
  const container = document.getElementById("liquid-background");
  if (!container) return;

  const renderer = new Renderer({ antialias: true });
  const gl = renderer.gl;
  gl.clearColor(1, 1, 1, 1);

  const vertexShader = `
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShader = `
    precision highp float;

    uniform float uTime;
    uniform vec3 uBaseColor;
    uniform vec2 uMouse;
    uniform vec3 uResolution;
    uniform float uAmplitude;
    uniform float uFrequencyX;
    uniform float uFrequencyY;

    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) +
            (c - a) * u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
    }

    void main() {
      vec2 st = gl_FragCoord.xy / uResolution.xy;
      vec2 uv = vUv;

      float t = uTime * 0.5;
      vec2 mouse = uMouse;

      float n = noise(uv * vec2(uFrequencyX, uFrequencyY) + t);
      float distorted = sin(n * 10.0 + t * 2.0) * uAmplitude;

      vec3 color = uBaseColor + vec3(distorted);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const geometry = new Triangle(gl);
  const program = new Program(gl, {
    vertex: vertexShader,
    fragment: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: {
        value: new Float32Array([gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height]),
      },
      uBaseColor: { value: new Float32Array(baseColor) },
      uAmplitude: { value: amplitude },
      uFrequencyX: { value: frequencyX },
      uFrequencyY: { value: frequencyY },
      uMouse: { value: new Float32Array([0, 0]) },
    },
  });

  const mesh = new Mesh(gl, { geometry, program });

  function resize() {
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    const resUniform = program.uniforms.uResolution.value;
    resUniform[0] = gl.canvas.width;
    resUniform[1] = gl.canvas.height;
    resUniform[2] = gl.canvas.width / gl.canvas.height;
  }

  window.addEventListener("resize", resize);
  resize();

  if (interactive) {
    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      program.uniforms.uMouse.value[0] = x;
      program.uniforms.uMouse.value[1] = y;
    });
  }

  let animationId;
  function update(t) {
    animationId = requestAnimationFrame(update);
    program.uniforms.uTime.value = t * 0.001 * speed;
    renderer.render({ scene: mesh });
  }

  container.appendChild(gl.canvas);
  animationId = requestAnimationFrame(update);
}