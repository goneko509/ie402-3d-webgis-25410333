import{c as e}from"./vec3f64-DIOQknMY.js";import{t}from"./NoParameters-XZJ-8n06.js";import{t as n}from"./Uniform-FnPH-ujw.js";import{n as r}from"./glsl-D85RBwKC.js";import{t as i}from"./Float4BindUniform-CcjALdTT.js";import{t as a}from"./IntegerBindUniform--7lrioD5.js";import{t as o}from"./Matrix4sPassUniform-BCkM81Sa.js";var s=class extends n{constructor(e,t,n,r){super(e,`mat4`,2,(n,i,a,o)=>n.setUniformMatrices4fv(e,t(i,a,o),r),n)}},c=class extends t{constructor(){super(...arguments),this.origin=e()}};function l(e){e.uniforms.add(new o(`shadowMapMatrix`,(e,t)=>t.shadowMap.getShadowMapMatrices(e.origin),4)),e.include(d)}function u(e){e.uniforms.add(new s(`shadowMapMatrix`,(e,t)=>t.shadowMap.getShadowMapMatrices(e.origin),4)),e.include(d)}function d(e){e.uniforms.add(new i(`cascadeDistances`,e=>e.shadowMap.cascadeDistances),new a(`numCascades`,e=>e.shadowMap.numCascades)),e.code.add(f)}var f=r`const vec3 invalidShadowmapUVZ = vec3(0.0, 0.0, -1.0);
vec3 lightSpacePosition(vec3 _vpos, mat4 mat) {
vec4 lv = mat * vec4(_vpos, 1.0);
lv.xy /= lv.w;
return 0.5 * lv.xyz + vec3(0.5);
}
vec2 cascadeCoordinates(int i, ivec2 textureSize, vec3 lvpos) {
float xScale = float(textureSize.y) / float(textureSize.x);
return vec2((float(i) + lvpos.x) * xScale, lvpos.y);
}
vec3 calculateUVZShadow(in vec3 _worldPos, in float _linearDepth, in ivec2 shadowMapSize) {
int i = _linearDepth < cascadeDistances[1] ? 0 : _linearDepth < cascadeDistances[2] ? 1 : _linearDepth < cascadeDistances[3] ? 2 : 3;
if (i >= numCascades) {
return invalidShadowmapUVZ;
}
mat4 shadowMatrix = i == 0 ? shadowMapMatrix[0] : i == 1 ? shadowMapMatrix[1] : i == 2 ? shadowMapMatrix[2] : shadowMapMatrix[3];
vec3 lvpos = lightSpacePosition(_worldPos, shadowMatrix);
if (lvpos.z >= 1.0 || lvpos.x < 0.0 || lvpos.x > 1.0 || lvpos.y < 0.0 || lvpos.y > 1.0) {
return invalidShadowmapUVZ;
}
vec2 uvShadow = cascadeCoordinates(i, shadowMapSize, lvpos);
return vec3(uvShadow, lvpos.z);
}`;function p(e){e.code.add(r`float readShadowMapUVZ(vec3 uvzShadow, sampler2DShadow _shadowMap) {
return texture(_shadowMap, uvzShadow);
}`)}var m=class extends n{constructor(e,t){super(e,`sampler2DShadow`,0,(n,r)=>n.bindTexture(e,t(r)))}};export{u as a,c as i,p as n,l as r,m as t};