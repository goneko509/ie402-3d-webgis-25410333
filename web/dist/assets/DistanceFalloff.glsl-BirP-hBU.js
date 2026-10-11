import{t as e}from"./NoParameters-XZJ-8n06.js";import{n as t}from"./glsl-D85RBwKC.js";import{t as n}from"./Float3BindUniform-BmdF9XGj.js";import{t as r}from"./FloatPassUniform-DeUP8HjM.js";import{t as i}from"./SphereIntersect.glsl-DoZEFl8k.js";var a=class extends e{constructor(){super(...arguments),this.atmosphereC=1}};function o(e){e.include(i),e.uniforms.add(new r(`atmosphereC`,e=>e.atmosphereC),new n(`cameraPosition`,e=>e.camera.eye)).code.add(t`float getDistanceFalloff(float dist, vec3 rayDir, float weight) {
if(dist == -1.0){
dist = 0.055 * sphereIntersect(cameraPosition, rayDir, atmosphereC).y;
}
return (1.0 - exp(-dist * weight));
}`)}export{o as n,a as t};