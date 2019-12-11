import * as THREE from "./node_modules/three/build/three.module.js";
import { OrbitControls } from "./node_modules/three/examples/jsm/controls/OrbitControls.js";

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer({ canvas });

  const fov = 85;
  const aspect = window.innerWidth / window.innerHeight; // the canvas default
  const near = 10;
  const far = 50000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  // camera.position.z = 40;
  camera.position.set(-3000, 0, 0);

  const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5, 0);
    controls.update();
//   controls.addEventListener("change", renderer);
//   controls.minDistance = 300;
//   controls.maxDistance = 3500;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(1, -2, -4);
    scene.add(light);
  }

  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load('./images/img_ft.jpg');
  let texture_bk = new THREE.TextureLoader().load('./images/img_bk.jpg');
  let texture_up = new THREE.TextureLoader().load('./images/img_up.jpg');
  let texture_dn = new THREE.TextureLoader().load('./images/img_dn.jpg');
  let texture_rt = new THREE.TextureLoader().load('./images/img_rt.jpg');
  let texture_lf = new THREE.TextureLoader().load('./images/img_lf.jpg');

  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

  for (let i = 0; i < 6; i++) {
      materialArray[i].side = THREE.BackSide;
  }

  const objects = [];
  const spread = 1;

  function addObject(x, y, obj) {
    obj.position.x = x * spread;
    obj.position.y = y * spread;

    scene.add(obj);
    objects.push(obj);
  }

  function createMaterial() {
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide
    });

    const hue = Math.random();
    const saturation = 1;
    const luminance = 0.5;
    material.color.setHSL(hue, saturation, luminance);

    return material;
  }

  //   function addSolidGeometry(x, y, geometry) {
  //     const mesh = new THREE.Mesh(geometry, createMaterial());
  //     addObject(x, y, mesh);
  //   }

  //SKYBOX
  let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);
  scene.add(skybox);

  //TEXT
  {
    const loader = new THREE.FontLoader();
    // promisify font loading
    function loadFont(url) {
      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    async function doit() {
      const font = await loadFont("./Fonts/GT Super WT Super_Regular.json");
      const geometry = new THREE.TextBufferGeometry("WeTransfer", {
        font: font,
        size: 200.0,
        height: 10.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.9,
        bevelSize: 0.1,
        bevelSegments: 15
      });

      // axis on bottom left
      // addSolidGeometry(-.5, 0, geometry);

      //axis set to center -> boxing
      const mesh = new THREE.Mesh(geometry, createMaterial());
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

      const parent = new THREE.Object3D();
      parent.add(mesh);

      addObject(200, 300, parent);
    }
    doit();
  }

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
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    // objects.forEach((obj, ndx) => {
    //   const speed = .5 + ndx * .05;
    //   const rot = time * speed;
    //   obj.rotation.x = rot;
    //   obj.rotation.y = rot;
    // });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
