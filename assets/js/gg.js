/*
let vertexCount=10000*4
let depth=0
let fontName='Arial,Helvetica'
let fontSize=17
let frame=0
let smoothness=6
let vertices=[]
let dVertices=[]
let refctx=document.createElement('canvas').getContext('2d')
let gl=document.createElement('canvas').getContext('webgl')
let postctx=document.body.appendChild(document.createElement('canvas')).getContext('2d')
let canvas=gl.canvas
let compileShader=function(type,source){let shader=gl.createShader(type),status;gl.shaderSource(shader,source)
gl.compileShader(shader)
status=gl.getShaderParameter(shader,gl.COMPILE_STATUS)
if(status)return shader
console.error('Shader compile error',gl.getShaderInfoLog(shader))
gl.deleteShader(shader)}
let createProgram=function(vertexShader,fragmentShader){let program=gl.createProgram(),status
gl.attachShader(program,vertexShader)
gl.attachShader(program,fragmentShader)
gl.linkProgram(program)
status=gl.getProgramParameter(program,gl.LINK_STATUS)
if(status)return program
console.error('program link error',gl.getProgramInfoLog())
gl.deleteProgram(program)}
let vertexShader=compileShader(gl.VERTEX_SHADER,`
	attribute vec4 a_position;
  uniform vec2 u_resolution;
  uniform float u_frame;
  varying vec4 v_position;
  varying float v_frame;
  void main () {
  	v_position = a_position;
    v_frame = u_frame;
    v_position.xy /= u_resolution;
    v_position.y *= -1.0;
    
    v_position.xy *= 10.0;
    v_position.z += cos(u_frame / 20.0 + v_position.x * 10.0) * sin(u_frame / 10.0 + v_position.y * 12.0) * 0.02;
    v_position.xy /= (1.0 + v_position.z);
    
  	gl_Position = vec4(v_position.xy, 0.0, 1.0);
    gl_PointSize = 3.0;
  }
`)
let fragmentShader=compileShader(gl.FRAGMENT_SHADER,`
	precision mediump float;
  varying vec4 v_position;
  varying float v_frame;
 	float pi = 3.141592653589793;
  float hue2rgb(float f1, float f2, float hue) {
      if (hue < 0.0)
          hue += 1.0;
      else if (hue > 1.0)
          hue -= 1.0;
      float res;
      if ((6.0 * hue) < 1.0)
          res = f1 + (f2 - f1) * 6.0 * hue;
      else if ((2.0 * hue) < 1.0)
          res = f2;
      else if ((3.0 * hue) < 2.0)
          res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
      else
          res = f1;
      return res;
  }

  vec3 hsl2rgb(vec3 hsl) {
      vec3 rgb;
      
      hsl.x = mod(hsl.x, 360.0);
      hsl.x /= 360.0;

      if (hsl.y == 0.0) {
          rgb = vec3(hsl.z); // Luminance
      } else {
          float f2;

          if (hsl.z < 0.5)
              f2 = hsl.z * (1.0 + hsl.y);
          else
              f2 = hsl.z + hsl.y - hsl.y * hsl.z;

          float f1 = 2.0 * hsl.z - f2;

          rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
          rgb.g = hue2rgb(f1, f2, hsl.x);
          rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
      }   
      return rgb;
  }
  
  void main () {
 		vec4 col = vec4(hsl2rgb(vec3(v_frame + v_position.z * 2000.0, 1.0, .5)) * v_position.w, 1.0);
  	gl_FragColor = col;
  }
`)
let program=createProgram(vertexShader,fragmentShader)
let aPosition=gl.getAttribLocation(program,'a_position')
let uResolution=gl.getUniformLocation(program,'u_resolution')
let uColor=gl.getUniformLocation(program,'u_color')
let uFrame=gl.getUniformLocation(program,'u_frame')
let vertexBuffer=gl.createBuffer()
gl.useProgram(program)
gl.clearColor(0,0,0,1)
gl.clear(gl.COLOR_BUFFER_BIT)
gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer)
gl.vertexAttribPointer(aPosition,4,gl.FLOAT,!1,0,0)
gl.enableVertexAttribArray(aPosition)
let render=()=>{frame++
gl.uniform1f(uFrame,frame)
gl.clear(gl.COLOR_BUFFER_BIT)
if(postctx.canvas.width!==postctx.canvas.offsetWidth||postctx.canvas.height!==postctx.canvas.offsetHeight){canvas.width=postctx.canvas.width=postctx.canvas.offsetWidth
canvas.height=postctx.canvas.height=postctx.canvas.offsetHeight
gl.viewport(0,0,canvas.width,canvas.height)
gl.uniform2fv(uResolution,[canvas.width,canvas.height])}
for(let i=0;i<vertices.length;i+=4){let x=i
let y=i+1
let z=i+2
let v=i+3
dVertices[x]-=(dVertices[x]-vertices[x])/smoothness
dVertices[y]-=(dVertices[y]-vertices[y])/smoothness
dVertices[z]-=(dVertices[z]-vertices[z])/smoothness
dVertices[v]-=(dVertices[v]-vertices[v])/smoothness*2}
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(dVertices),gl.STATIC_DRAW)
gl.drawArrays(gl.POINTS,0,dVertices.length/4)
postctx.globalAlpha=0.2
postctx.globalCompositeOperation='source-over'
postctx.drawImage(canvas,0,0)
postctx.globalCompositeOperation='lighten'
postctx.globalAlpha=1
postctx.filter='blur(8px)'
postctx.drawImage(canvas,0,0)
postctx.filter='blur(0)'
requestAnimationFrame(render)}
let setText=(text)=>{vertices=[]
refctx.font=fontSize.toString()+"px "+fontName
refctx.canvas.width=refctx.measureText(text).width||100
refctx.canvas.height=fontSize
refctx.font=fontSize.toString()+"px "+fontName
refctx.textBaseline="top"
refctx.clearRect(0,0,refctx.canvas.width,refctx.canvas.height)
refctx.fillStyle="#fff"
refctx.fillText(text,0,0)
let{data}=refctx.getImageData(0,0,refctx.canvas.width,refctx.canvas.height)
for(let i=0;i<vertexCount;i+=4){j=i%data.length
let dI=(j/4>>0)
let x=dI%refctx.canvas.width-refctx.canvas.width/2
let y=((dI/refctx.canvas.width>>0)%refctx.canvas.height)-refctx.canvas.height/2
let z=-depth/2+Math.random()*depth
let v=(data[j]*(data[j+3]/255))/255
vertices.push(x)
vertices.push(y)
vertices.push(z)
vertices.push(v)}}
const textList=['I know','the','answer','before','the','question.',]
let textIndex=0
let textGeneration=()=>{setText(textList[textIndex])
setTimeout(()=>{textIndex++
if(textIndex===textList.length){textIndex=0}
textGeneration()},1100)}
textGeneration()
for(let i=0;i<vertexCount;i++){dVertices.push(0)}
render()

*/
