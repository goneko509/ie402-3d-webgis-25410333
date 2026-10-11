import{n as e}from"./glsl-D85RBwKC.js";import{t}from"./ForwardLinearDepthToWriteShadowMap.glsl-CVZkqchq.js";function n(n){t(n),n.vertex.code.add(e`vec4 transformPositionWithDepth(mat4 proj, mat4 view, vec3 pos, vec2 nearFar, out float depth) {
vec4 eye = view * vec4(pos, 1.0);
depth = calculateLinearDepth(nearFar,eye.z);
return proj * eye;
}`),n.vertex.code.add(e`vec4 transformPosition(mat4 proj, mat4 view, vec3 pos) {
return proj * (view * vec4(pos, 1.0));
}`)}export{n as t};