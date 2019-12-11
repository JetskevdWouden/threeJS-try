import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

//   const fov = 75;
//   const aspect = 2; // the canvas default
//   const near = 0.1;
//   const far = 5;
//   const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
//   camera.position.z = 2;

const fov = 85;
const aspect = 20; // the canvas default
const near = 0.1;
const far = 300;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 0);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();

const scene = new THREE.Scene();
scene.background = new THREE.Color("#DEFEFF");

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  
    const loader = new THREE.FontLoader();
    // promisify font loading
    function loadFont(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    // async function doit() {
      const font = await loadFont('./Fonts/GT Super WT Super_Regular.json');  
      const geometry = new THREE.TextBufferGeometry('Hello', {
        font: font,
        size: 13.0,
        height: 2.2,
        curveSegments: 22,
        bevelEnabled: true,
        bevelThickness: 3.15,
        bevelSize: 1.3,
        bevelSegments: 15,
      });
      const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 });
      const mesh = new THREE.Mesh(geometry, material);
    //   geometry.computeBoundingBox();
    //   geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

    //   const parent = new THREE.Object3D();
    //   parent.add(mesh);

    //   scene.add(parent)
      scene.add(mesh)
    // }
    // doit();
  


  //const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }); // greenish blue
  //const material = new THREE.MeshPhongMaterial({ color: 0x44aa88 }); // greenish blue

  //const cube = new THREE.Mesh(geometry, material);
  //scene.add(cube);

  //renderer.render(scene, camera);

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
    time *= 0.001; // convert time to seconds

    //setSize
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    //responsiveness
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    
    mesh.rotation.x += 0.001;
    mesh.rotation.y += 0.001;


    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
