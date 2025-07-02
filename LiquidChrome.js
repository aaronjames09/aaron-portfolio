import { Renderer, Program, Mesh, Triangle } from "ogl";

export function initLiquidChrome({
  baseColor = [0.1, 0.1, 0.1],
  speed = 1,
  amplitude = 0.6,
  frequencyX = 3,
  frequencyY = 3,
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

  const fragmentShader = `...`; // (use same shader as in your code)

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