import * as THREE from "./node_modules/three/build/three.module.js";

// function main() {
//   const canvas = document.querySelector("#c");
//   const renderer = new THREE.WebGLRenderer({ canvas });
//   renderer.autoClearColor = false;

//   const camera = new THREE.OrthographicCamera(
//     -1, // left
//     1, // right
//     1, // top
//     -1, // bottom
//     -1, // near,
//     1 // far
//   );
//   const scene = new THREE.Scene();
//   const plane = new THREE.PlaneBufferGeometry(2, 2);

//   const fragmentShader = `
//     #include <common>

//     uniform vec3 iResolution;
//     uniform float iTime;

//     // By iq: https://www.shadertoy.com/user/iq
//     // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
//     void mainImage( out vec4 fragColor, in vec2 fragCoord )
//     {
//         // Normalized pixel coordinates (from 0 to 1)
//         vec2 uv = fragCoord/iResolution.xy;

//         // Time varying pixel color
//         // vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
//         vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx*40.0+vec3(0,2,4));

//         // Output to screen
//         fragColor = vec4(col,1.0);
//     }

//     void main() {
//       mainImage(gl_FragColor, gl_FragCoord.xy);
//     }
//     `;
//   const uniforms = {
//     iTime: { value: 0 },
//     iResolution: { value: new THREE.Vector3() }
//   };
//   const material = new THREE.ShaderMaterial({
//     fragmentShader,
//     uniforms
//   });
//   scene.add(new THREE.Mesh(plane, material));

//   function resizeRendererToDisplaySize(renderer) {
//     const canvas = renderer.domElement;
//     const width = canvas.clientWidth;
//     const height = canvas.clientHeight;
//     const needResize = canvas.width !== width || canvas.height !== height;
//     if (needResize) {
//       renderer.setSize(width, height, false);
//     }
//     return needResize;
//   }

//   function render(time) {
//     time *= 0.001; // convert to seconds

//     resizeRendererToDisplaySize(renderer);

//     const canvas = renderer.domElement;
//     uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
//     uniforms.iTime.value = time;

//     renderer.render(scene, camera);

//     requestAnimationFrame(render);
//   }

//   requestAnimationFrame(render);
// }

// main();

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.autoClearColor = false;

  const camera = new THREE.OrthographicCamera(
    -1, // left
    1, // right
    1, // top
    -1, // bottom
    -1, // near,
    1 // far
  );
  const scene = new THREE.Scene();
  const plane = new THREE.PlaneBufferGeometry(2, 2);

  const fragmentShader = `
    // #include <common>
  
    // uniform vec3 iResolution;
    // uniform float iTime;
    // uniform sampler2D iChannel0;
  
    // // By Daedelus: https://www.shadertoy.com/user/Daedelus
    // // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
    // #define TIMESCALE 0.25 
    // #define TILES 8
    // #define COLOR 0.7, 1.6, 2.8
  
    // void mainImage( out vec4 fragColor, in vec2 fragCoord )
    // {
    //   vec2 uv = fragCoord.xy / iResolution.xy;
    //   uv.x *= iResolution.x / iResolution.y;
      
    //   vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
    //   float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
    //   p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
      
    //   vec2 r = mod(uv * float(TILES), 1.0);
    //   r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
    //   p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
      
    //   fragColor = vec4(COLOR, 1.0) * p;
    // }
  
    // void main() {
    //   mainImage(gl_FragColor, gl_FragCoord.xy);
    // }

    // Found this on GLSL sandbox. I really liked it, changed a few things and made it tileable.
    // :)
    // by David Hoskins.
    
    
    // Water turbulence effect by joltz0r 2013-07-04, improved 2013-07-07
    
    
    // Redefine below to see the tiling...
    //#define SHOW_TILING
    
    #define TAU 6.28318530718
    #define MAX_ITER 5
    
    void mainImage( out vec4 fragColor, in vec2 fragCoord ) 
    {
        float time = iTime * .5+23.0;
        // uv should be the 0-1 uv of texture...
        vec2 uv = fragCoord.xy / iResolution.xy;
        
    #ifdef SHOW_TILING
        vec2 p = mod(uv*TAU*2.0, TAU)-250.0;
    #else
        vec2 p = mod(uv*TAU, TAU)-250.0;
    #endif
        vec2 i = vec2(p);
        float c = 1.0;
        float inten = .005;
    
        for (int n = 0; n < MAX_ITER; n++) 
        {
            float t = time * (1.0 - (3.5 / float(n+1)));
            i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
            c += 1.0/length(vec2(p.x / (sin(i.x+t)/inten),p.y / (cos(i.y+t)/inten)));
        }
        c /= float(MAX_ITER);
        c = 1.17-pow(c, 1.4);
        vec3 colour = vec3(pow(abs(c), 8.0));
        colour = clamp(colour + vec3(0.0, 0.35, 0.5), 0.0, 1.0);
        
    
        #ifdef SHOW_TILING
        // Flash tile borders...
        vec2 pixel = 2.0 / iResolution.xy;
        uv *= 2.0;
    
        float f = floor(mod(iTime*.5, 2.0)); 	// Flash value.
        vec2 first = step(pixel, uv) * f;		   	// Rule out first screen pixels and flash.
        uv  = step(fract(uv), pixel);				// Add one line of pixels per tile.
        colour = mix(colour, vec3(1.0, 1.0, 0.0), (uv.x + uv.y) * first.x * first.y); // Yellow line
        
        #endif
        fragColor = vec4(colour, 1.0);
    }

    `;
  const loader = new THREE.TextureLoader();
  const texture = loader.load(
    "https://threejsfundamentals.org/threejs/resources/images/bayer.png"
  );
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() },
    iChannel0: { value: texture }
  };
  const material = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms
  });
  scene.add(new THREE.Mesh(plane, material));

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001; // convert to seconds

    resizeRendererToDisplaySize(renderer);

    const canvas = renderer.domElement;
    uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
    uniforms.iTime.value = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
