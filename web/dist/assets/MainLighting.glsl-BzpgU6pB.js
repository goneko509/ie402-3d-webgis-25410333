import{n as e}from"./glsl-D85RBwKC.js";import{t}from"./Float3BindUniform-BmdF9XGj.js";function n(e){e.uniforms.add(new t(`mainLightDirection`,e=>e.lighting.mainLight.direction))}function r(e){e.uniforms.add(new t(`mainLightIntensity`,e=>e.lighting.mainLight.intensity))}function i(t){n(t),r(t),t.code.add(e`vec3 applyShading(vec3 shadingNormal, float shadow) {
float dotVal = clamp(dot(shadingNormal, mainLightDirection), 0.0, 1.0);
return mainLightIntensity * ((1.0 - shadow) * dotVal);
}`)}export{r as n,n as r,i as t};