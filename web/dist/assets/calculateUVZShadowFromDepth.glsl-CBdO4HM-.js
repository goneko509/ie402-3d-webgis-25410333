import{t as e}from"./mat4f64-E_FXCKxO.js";import{C as t,S as n}from"./mat4-BL30OFHW.js";import{n as r}from"./glsl-D85RBwKC.js";import{t as i}from"./Matrix4BindUniform-DnHs9Hq_.js";import{t as a}from"./ReadDepth.glsl-Ca_0z8Pl.js";import{t as o}from"./CameraSpace.glsl-DcIGS7L_.js";import{r as s}from"./Texture2DShadowBindUniform-K3x5AtUd.js";function c(e){e.fragment.include(s),l(e)}function l(e){e.fragment.include(a),e.include(o),e.fragment.uniforms.add(new i(`inverseViewMatrix`,({camera:e})=>n(u,t(u,e.viewMatrix,e.center)))).code.add(r`vec3 calculateUVZShadowAndPixelPosFromDepth(
in vec2 _uv,
ivec2 shadowMapSize,
in sampler2D _depthMap,
out vec4 currentPixelPos
) {
float depth = depthFromTexture(_depthMap, _uv);
if (depth >= 1.0 || depth <= 0.0) {
return invalidShadowmapUVZ;
}
float currentPixelDepth = linearizeDepth(depth);
currentPixelPos = vec4(reconstructPosition(gl_FragCoord.xy, currentPixelDepth), 1.0);
vec4 worldSpacePos = inverseViewMatrix * currentPixelPos;
float linearDepth = -currentPixelDepth;
return calculateUVZShadow(worldSpacePos.xyz, linearDepth, shadowMapSize);
}
vec3 calculateUVZShadowFromDepth(
in vec2 _uv,
ivec2 shadowMapSize,
in sampler2D _depthMap
) {
vec4 currentPixelPos;
return calculateUVZShadowAndPixelPosFromDepth(_uv, shadowMapSize, _depthMap, currentPixelPos);
}`)}var u=e();export{c as t};