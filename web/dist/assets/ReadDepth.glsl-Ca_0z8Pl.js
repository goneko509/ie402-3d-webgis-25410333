import{D as e}from"./vec2-C5dJMieJ.js";import{o as t}from"./vec2f64-IO40D2xB.js";import{n}from"./glsl-D85RBwKC.js";import{t as r}from"./Float2BindUniform-C6b2PHzh.js";function i(e){e.uniforms.add(new r(`zProjectionMap`,e=>a(e.camera))),e.code.add(n`float linearizeDepth(float depth, vec2 zProjectionConstants) {
float depthNdc = depth * 2.0 - 1.0;
return -(zProjectionConstants[0] / (depthNdc + zProjectionConstants[1] + 1e-7));
}
float linearizeDepth(float depth) {
return linearizeDepth(depth, zProjectionMap);
}`),e.code.add(n`float delinearizeDepth(float linearDepth) {
float c1 = zProjectionMap[0];
float c2 = zProjectionMap[1];
float depthNdc = (-c1/linearDepth) - c2 - 1e-7;
float depthNonlinear01 = (depthNdc + 1.0 ) / 2.0;
return depthNonlinear01;
}`),e.code.add(n`float depthFromTexture(sampler2D depthTexture, vec2 uv) {
ivec2 iuv = ivec2(uv * vec2(textureSize(depthTexture, 0)));
return texelFetch(depthTexture, iuv, 0).r;
}`),e.code.add(n`float linearDepthFromTexture(sampler2D depthTexture, vec2 uv) {
return linearizeDepth(depthFromTexture(depthTexture, uv));
}`)}function a(t){let n=t.projectionMatrix;return e(o,n[14],n[10])}var o=t();export{a as n,i as t};