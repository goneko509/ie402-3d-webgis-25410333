import{c as e}from"./vec3f64-DIOQknMY.js";import{P as t}from"./vec3-CMyaVPVc.js";import{t as n}from"./Float3PassUniform-YEiGS05C.js";import{n as r}from"./glsl-D85RBwKC.js";function i(e){e.vertex.code.add(r`float screenSizePerspectiveViewAngleDependentFactor(float absCosAngle) {
return absCosAngle * absCosAngle * absCosAngle;
}`),e.vertex.code.add(r`vec3 screenSizePerspectiveScaleFactor(float absCosAngle, float distanceToCamera, vec3 params) {
return vec3(
min(params.x / (distanceToCamera - params.y), 1.0),
screenSizePerspectiveViewAngleDependentFactor(absCosAngle),
params.z
);
}`),e.vertex.code.add(r`float applyScreenSizePerspectiveScaleFactorFloat(float size, vec3 factor) {
return size * clamp(mix(factor.x, 1.0, factor.y), factor.z, 1.0);
}`),e.vertex.code.add(r`float screenSizePerspectiveScaleFloat(float size, float absCosAngle, float distanceToCamera, vec3 params) {
return applyScreenSizePerspectiveScaleFactorFloat(
size,
screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params)
);
}`),e.vertex.code.add(r`vec2 applyScreenSizePerspectiveScaleFactorVec2(vec2 size, vec3 factor) {
return size * clamp(mix(factor.x, 1.0, factor.y), factor.z, 1.0);
}`),e.vertex.code.add(r`vec2 screenSizePerspectiveScaleVec2(vec2 size, float absCosAngle, float distanceToCamera, vec3 params) {
return applyScreenSizePerspectiveScaleFactorVec2(size, screenSizePerspectiveScaleFactor(absCosAngle, distanceToCamera, params));
}`)}function a(e){e.uniforms.add(new n(`screenSizePerspective`,e=>s(e.screenSizePerspective,e.screenSizePerspectiveMinPixelReferenceSize)))}function o(e){e.uniforms.add(new n(`screenSizePerspectiveAlignment`,e=>s(e.screenSizePerspectiveAlignment||e.screenSizePerspective,e.screenSizePerspectiveAlignment?null:e.screenSizePerspectiveMinPixelReferenceSize)))}function s(e,n){let r=n!=null&&e!=null?Math.min(e.minPixelSize/n,1):0;return e?t(c,e.divisor,e.offset,r):t(c,0,0,0)}var c=e();export{i as n,a as r,o as t};