import './style.css'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';

// SCENE SETUP
const canvas = document.querySelector("canvas");
const scene = new THREE.Scene();
let mainCamera = new THREE.PerspectiveCamera(50,window.innerWidth/window.innerHeight,0.1,1000);
scene.add(mainCamera);
let renderer:THREE.WebGLRenderer;
if(canvas)
{
  renderer = new THREE.WebGLRenderer({canvas:canvas});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
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
// const clock = new THREE.Clock();
let scrollMixer:THREE.AnimationMixer;

// ADD STUFF

loader.load("/Animation.gltf",(gltf)=>{
  scene.add(gltf.scene);
  
  scrollMixer  = new THREE.AnimationMixer(gltf.scene);
  scrollMixer.clipAction(gltf.animations[0]).play();

  gltf.scene.traverse((node)=>{
    node.castShadow = true;
    // node.receiveShadow = true;  
  })
  gltf.scene.children[9].children[0].receiveShadow = true;
  gltf.scene.children[9].children[0].castShadow = false;

  let animCamera = gltf.cameras[0];
  animCamera.add(mainCamera);
  mainCamera.position.set(0,0,0);
  mainCamera.setRotationFromEuler(new THREE.Euler(0,0,0));
  setUpCamera();

})

const env = new THREE.AmbientLight(0xffffff,.5);;
scene.add(env);

const point = new THREE.PointLight(0xffffff,250);
point.castShadow = true;
point.translateY(4)
scene.add(point);

point.shadow.mapSize.width = 1024; // default
point.shadow.mapSize.height = 1024; // default
point.shadow.camera.near = 0.5; // default
point.shadow.camera.far = 500; // default


// Update
Update();
function Update()
{
  // scrollMixer?.update(clock.getDelta());
  requestAnimationFrame(Update);
  renderer.render(scene,mainCamera);
}

addEventListener("scroll",()=>{
  const el = document.documentElement
  let scrollRatio = el.scrollTop/(el.scrollHeight-el.clientHeight);
  if(scrollMixer)
  scrollMixer.setTime(scrollRatio * 8.333);
})