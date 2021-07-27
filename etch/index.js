const regl = createREGL({attributes: {antialies: false}, extensions: 'OES_texture_float'});

let stateWidth = Math.floor(window.innerWidth);
let stateHeight = Math.floor(window.innerHeight);
let size = stateWidth * stateHeight;

let initialData = (new Float32Array(size * 4)).fill().map(() => 0);
/* X: direction of growth
 *  0: no growth
 *  1: up
 *  2: right
 *  3: down
 *  4: left
*/

initialData[2 * size - 4] = Math.random();
initialData[2 * size - 3] = Math.random();
initialData[2 * size - 2] = Math.random();
initialData[2 * size - 1] = 4;

const state = (Array(2)).fill().map(() => {
    return regl.framebuffer({
        color: regl.texture({
            width: stateWidth,
            height: stateHeight,
            data: initialData,
        }),
        depthStencil: false,
    })
});

const grow = regl({
    frag: `
        precision highp float;
        uniform sampler2D prevState;
        uniform float time;
        uniform float seed;
        uniform float width;
        uniform float height;
        uniform float branchChance;
        uniform float haltChance;
        uniform float restartChance;
        uniform vec3 colorMagnitude;
        uniform vec3 colorOffset;
        varying vec2 uv;

        float rand(vec2 co){
            return fract(sin(dot(co, vec2(12.989819, 78.23433))) * 43758.532453);
        }

        void main() {
            vec2 offset = vec2(1.0/width, 1.0/height);

            vec2 upVec = vec2(0.0, offset.y);
            vec2 downVec = vec2(0.0, -offset.y);
            vec2 rightVec = vec2(offset.x, 0.0);
            vec2 leftVec = vec2(-offset.x, 0.0);

            float up = 1.0;
            float down = 3.0;
            float right = 2.0;
            float left = 4.0;

            vec4 data = texture2D(prevState, uv);
            vec4 upData = texture2D(prevState, uv + upVec);
            vec4 downData = texture2D(prevState, uv + downVec);
            vec4 rightData = texture2D(prevState, uv + rightVec);
            vec4 leftData = texture2D(prevState, uv + leftVec);

            vec3 color = data.xyz;
            float direction = data.w;

            if (direction < 0.0) {
                float q = rand(2.5*uv + vec2(time, -seed)/1000.0 + 324.0);
                if (q > 1.0 - restartChance) {
                    direction = -direction;
                }
            }

            if (direction == 0.0) {
                direction = upData.w == down ? down : direction; 
                direction = downData.w == up ? up : direction; 
                direction = rightData.w == left ? left : direction; 
                direction = leftData.w == right ? right : direction; 
                color = upData.w == down ? upData.xyz : color; 
                color = downData.w == up ? downData.xyz : color; 
                color = rightData.w == left ? rightData.xyz : color; 
                color = leftData.w == right ? leftData.xyz : color; 

                if (direction > 0.0) {
                    float s = rand(3.8*uv + vec2(-time, seed)/1000.0 + 113.0);
                    if (s > 1.0 - haltChance) {
                        direction = -direction;
                    }
                }
            }

            float r = rand(uv + vec2(time + seed)/1000.0);

            if (direction == 0.0 && r > 1.0 - branchChance && upData.w + downData.w + rightData.w + leftData.w > 0.0) {
                direction = upData.w > 0.0 ? down : direction; 
                direction = downData.w > 0.0 ? up : direction; 
                direction = rightData.w > 0.0 ? left : direction; 
                direction = leftData.w > 0.0 ? right : direction; 
                color = upData.w > 0.0 ? upData.xyz : color; 
                color = downData.w > 0.0 ? downData.xyz : color; 
                color = rightData.w > 0.0 ? rightData.xyz : color; 
                color = leftData.w > 0.0 ? leftData.xyz : color; 
                
                if (direction > 0.0) {
                    float x = rand(-13.3 * uv + vec2(2.1 * time - 1.3 * seed)/1000.0 + 314.0);
                    float y = rand(-23.3 * uv + vec2(-1.3 * time + 1.8 * seed)/1000.0 + 234.0);
                    float z = rand(8.3 * uv + vec2(-0.9 * time - 2.3 * seed)/1000.0 + 554.0);
                    color += colorMagnitude * (colorOffset + vec3(x, y, z));
                }
            }
            
            gl_FragColor = vec4(color, direction);
        }`,

    vert: `
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;

        void main() {
            uv = (position + 1.0) * 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }`,

    attributes: {
        position: [
            -4, 0,
            4, 4,
            4, -4
        ]
    },

    uniforms: {
        prevState: ({tick}) => state[(tick) % 2], 
        time: ({tick}) => tick,
        seed: () => Math.random() * 10**4,
        width: () => stateWidth,
        height: () => stateHeight,
        branchChance: ({tick}) => tick > 2500 ? 0.1 : 0.001,
        haltChance: 0.01,
        restartChance: 0.05,
        colorMagnitude: [-0.29, 0.35, 0.32],
        colorOffset: [-0.3, -0.2, -0.3],
    },

    framebuffer: ({tick}) => state[(tick + 1) % 2],

    count: 3,
});

const draw = regl({
    frag: `
        precision mediump float;
        uniform sampler2D state;
        varying vec2 uv;

        void main() {
            vec4 data = texture2D(state, uv);
            vec3 color = data.xyz;
            color = 2.0 * abs(color/2.0 - floor(color/2.0 + 0.5));
            gl_FragColor = vec4(color, 1.0);
        }`, 

    vert: `
        precision mediump float;
        attribute vec2 position;
        varying vec2 uv;

        void main() {
            uv = (position + 1.0) * 0.5;
            gl_Position = vec4(position, 0.0, 1.0);
        }`,

    attributes: {
        position: [
            -4, 0,
            4, 4,
            4, -4
        ]
    },

    uniforms: {
        state: ({tick}) => state[(tick + 1) % 2],
    },

    count: 3,
})

regl.frame(() => {
    grow();
    draw();
});
