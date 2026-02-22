import { useRef, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;

  #define OCTAVE_COUNT 8

  vec3 hsv2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
               mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVE_COUNT; i++) {
      value += amplitude * noise(st);
      st *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);

    vec2 p = uv * 5.0;
    p = rotate2d(iTime * 0.04) * p;

    float noise_val = fbm(p + iTime * 0.08);
    float flow = fbm(p * 0.2 + vec2(iTime * 0.04));
    noise_val += flow * 0.4;

    vec3 baseColor = hsv2rgb(vec3(0.61, 0.7, 0.8));

    vec3 final_color = baseColor * smoothstep(0.4, 0.6, noise_val) * 0.5;
    final_color += baseColor * 0.1 * pow(noise_val, 2.5);

    gl_FragColor = vec4(final_color, 1.0);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function ATCShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const gl = canvas.getContext('webgl', { antialias: false });
    if (!gl) return;

    let vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    let fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    let program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    let buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const resLoc = gl.getUniformLocation(program, 'iResolution');
    const timeLoc = gl.getUniformLocation(program, 'iTime');

    const resize = () => {
      if (!canvas.parentElement) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const { clientWidth, clientHeight } = canvas.parentElement;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize();

    let animId: number;
    const startTime = performance.now();

    const render = () => {
      if (gl.isContextLost()) return;
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, (performance.now() - startTime) / 1000.0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Handle GPU context loss (common on mobile)
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animId);
    };

    const handleContextRestored = () => {
      // Re-setup and restart rendering after context is restored
      const newVs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
      const newFs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
      if (!newVs || !newFs) return;

      const newProgram = gl.createProgram();
      if (!newProgram) return;
      gl.attachShader(newProgram, newVs);
      gl.attachShader(newProgram, newFs);
      gl.linkProgram(newProgram);
      if (!gl.getProgramParameter(newProgram, gl.LINK_STATUS)) return;
      gl.useProgram(newProgram);

      const newBuf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, newBuf);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const newAPos = gl.getAttribLocation(newProgram, 'aPosition');
      gl.enableVertexAttribArray(newAPos);
      gl.vertexAttribPointer(newAPos, 2, gl.FLOAT, false, 0, 0);

      const newResLoc = gl.getUniformLocation(newProgram, 'iResolution');
      const newTimeLoc = gl.getUniformLocation(newProgram, 'iTime');

      // Reassign outer variables so cleanup tracks the latest resources
      vs = newVs;
      fs = newFs;
      program = newProgram;
      buf = newBuf;

      resize();

      const renderRestored = () => {
        if (gl.isContextLost()) return;
        gl.uniform2f(newResLoc, canvas.width, canvas.height);
        gl.uniform1f(newTimeLoc, (performance.now() - startTime) / 1000.0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        animId = requestAnimationFrame(renderRestored);
      };
      animId = requestAnimationFrame(renderRestored);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      cancelAnimationFrame(animId);
      if (!gl.isContextLost()) {
        if (vs) gl.detachShader(program, vs!);
        if (fs) gl.detachShader(program, fs!);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        gl.deleteProgram(program);
        gl.deleteBuffer(buf);
      }
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
