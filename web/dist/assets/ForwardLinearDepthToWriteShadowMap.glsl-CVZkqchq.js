import{p as e}from"./ShaderOutput-BpkC-wrv.js";import{n as t,t as n}from"./glsl-D85RBwKC.js";import{t as r}from"./Float2BindUniform-C6b2PHzh.js";import{n as i}from"./VertexPosition.glsl-ljeW1mX9.js";import{n as a}from"./ForwardLinearDepth.glsl-DgvdPZSv.js";function o(e){e.vertex.uniforms.add(new r(`nearFar`,e=>e.camera.nearFar))}function s(e){e.vertex.code.add(t`float calculateLinearDepth(vec2 nearFar,float z) {
return (-z - nearFar[0]) / (nearFar[1] - nearFar[0]);
}`)}function c(r,c){let{vertex:l}=r,u=e(c.output);u&&(r.include(i,c),a(r,!0),o(r),s(r)),l.code.add(t`
    void forwardLinearDepthToWriteShadowMap() {
      ${n(u,`forwardLinearDepth(calculateLinearDepth(nearFar, vPosition_view.z));`)}
    }
  `)}export{o as n,c as r,s as t};