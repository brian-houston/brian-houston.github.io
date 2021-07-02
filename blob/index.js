const regl = createREGL();

let frag = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;
    uniform float dpr;

    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

    float snoise(vec3 v){ 
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;

      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );

      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1. + 3.0 * C.xxx;

      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

      float n_ = 1.0/7.0;
      vec3  ns = n_ * D.wyz - D.xzx;

      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  

      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );    

      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);

      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );

      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));

      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);

      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;

      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
        vec2 pos = gl_FragCoord.xy - resolution.xy/2.0;
        vec2 circle = normalize(pos) * 0.6;

        float len = length(pos);
        float r1 = (125.0 + snoise(vec3(circle, time)) * 50.0) * dpr;
        float r2 = (175.0 + snoise(vec3(circle, time + 50000.0)) * 100.0) * dpr;
        float r3 = (225.0 + snoise(vec3(circle, time + 100000.0)) * 100.0) * dpr;
        float r4 = (275.0 + snoise(vec3(circle, time + 150000.0)) * 100.0) * dpr;

        float count = step(r1, len) + step(r2, len) + step(r3, len) + step(r4, len);

        vec3 c1 = vec3(0.0, 0.0, 0.0);
        vec3 c2 = vec3(1.0, 1.0, 1.0);

        gl_FragColor = vec4(mix(c2, c1, count/4.0), 1.0);
}`;

let vert = `
    precision mediump float;
    attribute vec2 position;

    void main() {
      gl_Position = vec4(position.x, position.y, 0, 1);
}`;

const draw = regl({
    frag: frag, 

    vert: vert,

    attributes: {
        position: regl.buffer([
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, 1],
            [1, -1],
            [-1, -1],
        ]),
    },

    uniforms: {
        time: regl.prop('time'),
        resolution: () => [window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio],
        dpr: window.devicePixelRatio,
    },

    count: 6
})

console.log(window.devicePixelRatio);

let time = 0;
regl.frame(() => {
    draw({time: time * 0.01});

    time++;
});
