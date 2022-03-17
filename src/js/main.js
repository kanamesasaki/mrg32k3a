import { getVertexShader, getFragmentShader } from './utils.js'

let gl
let program
let squareVertexBuffer
let widthLoc
let heightLoc
const canvas = document.getElementById('webgl-canvas')

function draw() {
  // Clear the scene
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.vertexAttribPointer(program.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(program.aVertexPosition);

  // Draw to the scene using triangle primitives from array data
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  // Clean
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function init() {
  // Set the canvas size
  canvas.width = 100; // window.innerWidth;
  canvas.height = 20; // window.innerHeight;

  // Retrieve a WebGL context
  gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true})
  // Set the clear color to be black
  gl.clearColor(0, 0, 0, 1);

  // Call the functions in an appropriate order
  const vertexShader = getVertexShader(gl);
  const fragmentShader = getFragmentShader(gl);

  // Create a program
  program = gl.createProgram();
  // Attach the shaders to this program
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Could not initialize shaders');
  }

  // Use this program instance
  gl.useProgram(program);
  program.aVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
  program.aVertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");

  const { width, height } = canvas;
  program.uInverseTextureSize = gl.getUniformLocation(program, 'uInverseTextureSize');
  gl.uniform2f(program.uInverseTextureSize, 1/width, 1/height);
  console.log('width', width);
  console.log('height', height);
  
  /*
    (-1, 1, 0)        (1, 1, 0)
    X---------------------X
    |                     |
    |       (0, 0)        |
    |                     |
    X---------------------X
    (-1, -1, 0)       (1, -1, 0)
  */
  const vertices = [
    -1, -1, 0,
    1, -1, 0,
    -1, 1, 0,
    -1, 1, 0,
    1, -1, 0,
    1, 1, 0
  ]

  // Init the VBO
  squareVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  // Clean up the buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  widthLoc = gl.getUniformLocation(program, 'uWidth');
  gl.uniform1i(widthLoc, canvas.width);
  heightLoc = gl.getUniformLocation(program, 'uHeight');
  gl.uniform1i(heightLoc, canvas.height);
  draw();

  let uintResult = readUint32Array();
  console.log(uintResult);
  let result = new readUint32Array();
  console.log(result);
}

function readUint32Array() {
  let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return new Uint32Array(pixels.buffer);
}

function readFloat32Array() {
  let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return new Float32Array(pixels.buffer);
}

function readInt32Array() {
  let pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
  gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  return new Int32Array(pixels.buffer);
}

window.onload = init;