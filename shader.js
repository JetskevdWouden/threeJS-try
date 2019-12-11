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
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.autoClearColor = false;
  
    const camera = new THREE.OrthographicCamera(
      -1, // left
       1, // right
       1, // top
      -1, // bottom
      -1, // near,
       1, // far
    );
    const scene = new THREE.Scene();
    const plane = new THREE.PlaneBufferGeometry(2, 2);
  
    const fragmentShader = `
    #include <common>
  
    //Calculate the squared length of a vector
    float length2(vec2 p){
        return dot(p,p);
    }
    
    //Generate some noise to scatter points.
    float noise(vec2 p){
        return fract(sin(fract(sin(p.x) * (43.13311)) + p.y) * 31.0011);
    }
    
    float worley(vec2 p) {
        //Set our distance to infinity
        float d = 1e30;
        //For the 9 surrounding grid points
        for (int xo = -1; xo <= 1; ++xo) {
            for (int yo = -1; yo <= 1; ++yo) {
                //Floor our vec2 and add an offset to create our point
                vec2 tp = floor(p) + vec2(xo, yo);
                //Calculate the minimum distance for this grid point
                //Mix in the noise value too!
                d = min(d, length2(p - tp - noise(tp)));
            }
        }
        return 3.0*exp(-4.0*abs(2.5*d - 1.0));
    }
    
    float fworley(vec2 p) {
        //Stack noise layers 
        return sqrt(sqrt(sqrt(
            worley(p*5.0 + 0.05*iTime) *
            sqrt(worley(p * 50.0 + 0.12 + -0.1*iTime)) *
            sqrt(sqrt(worley(p * -10.0 + 0.03*iTime))))));
    }
          
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
        vec2 uv = fragCoord.xy / iResolution.xy;
        //Calculate an intensity
        float t = fworley(uv * iResolution.xy / 1500.0);
        //Add some gradient
        t*=exp(-length2(abs(0.7*uv - 1.0)));	
        //Make it blue!
        fragColor = vec4(t * vec3(0.1, 1.1*t, pow(t, 0.5-t)), 1.0);
    }
    `;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/bayer.png');
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const uniforms = {
      iTime: { value: 0 },
      iResolution:  { value: new THREE.Vector3() },
      iChannel0: { value: texture },
    };
    const material = new THREE.ShaderMaterial({
      fragmentShader,
      uniforms,
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
      time *= 0.001;  // convert to seconds
  
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