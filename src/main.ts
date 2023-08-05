import './style.css'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import modelSrc from '/src/Animation.gltf?url';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// SCENE SETUP
const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x004ebf)
let mainCamera = new THREE.PerspectiveCamera(40,window.innerWidth/window.innerHeight,0.1,1000);
scene.add(mainCamera);
let renderer:THREE.WebGLRenderer;
if(canvas)
{
  renderer = new THREE.WebGLRenderer({canvas:canvas});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio));
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  
}
window.addEventListener("resize",()=>{
  setUpCamera();
})
function setUpCamera()
{
  mainCamera.aspect = window.innerWidth / window.innerHeight;
  mainCamera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}
const loader = new GLTFLoader();
const clock = new THREE.Clock();
let scrollMixer:THREE.AnimationMixer;
let mixer:THREE.AnimationMixer;
let Party:THREE.Object3D;
let envTexture:any;
//TODO base url manually added
new RGBELoader().load("/ScrollThreeJS/hdri.hdr" , function ( texture ) {

    texture.mapping = THREE.EquirectangularReflectionMapping;

    // scene.background = texture;
    envTexture = texture;
  });

// ADD STUFF

loader.load(modelSrc,(gltf)=>{
  scene.add(gltf.scene);
  
  scrollMixer  = new THREE.AnimationMixer(gltf.scene);
  mixer  = new THREE.AnimationMixer(gltf.scene);
  scrollMixer.clipAction(gltf.animations[2]).play();
  mixer.clipAction(gltf.animations[0]).play();
  mixer.clipAction(gltf.animations[3]).play();
  mixer.clipAction(gltf.animations[1]).play();

  gltf.scene.traverse((node)=>{
    node.castShadow = true;
    // node.receiveShadow = true;
    if(node.name == "Apple")
    {
      let mat = (node as THREE.Mesh).material;
      (mat as THREE.MeshStandardMaterial).envMap = envTexture;
    }
    if(node.name == 'Party')
    {
      Party = node;
    }
  })

  let animCamera = gltf.cameras[0];
  animCamera.add(mainCamera);
  mainCamera.position.set(0,0,0);
  mainCamera.setRotationFromEuler(new THREE.Euler(0,0,0));
  setUpCamera();

})

const hemi = new THREE.HemisphereLight(0xffffff,0x2176ff,1);
scene.add(hemi);


const point2 = new THREE.PointLight(0xffffff,700);
point2.castShadow = true;
point2.translateY(4);
point2.translateX(-6);
point2.translateZ(2);
scene.add(point2);
point2.shadow.mapSize.width = 1024; // default
point2.shadow.mapSize.height = 1024; // default
point2.shadow.camera.near = 0.5; // default
point2.shadow.camera.far = 500; // default
scene.add(new THREE.PointLightHelper(point2));
point2.shadow.radius = 2;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1280,1280,1,1),new THREE.MeshStandardMaterial({color:0x2176ff}))
scene.add(plane);
plane.rotateX(THREE.MathUtils.degToRad(-90));
plane.receiveShadow = true;


// Update
Update();
function Update()
{
  // scrollMixer?.update(clock.getDelta());
  mixer?.update(clock.getDelta());
  Party?.rotateZ(1*clock.getDelta());
  requestAnimationFrame(Update);
  renderer.render(scene,mainCamera);
}

addEventListener("scroll",()=>{
  const el = document.documentElement
  let scrollRatio = el.scrollTop/(el.scrollHeight-el.clientHeight);
  if(scrollMixer)
  scrollMixer.setTime(scrollRatio * 8.333);
})