import{c as e}from"./vec3f64-DIOQknMY.js";import{t}from"./NoParameters-XZJ-8n06.js";import{f as n}from"./ShaderOutput-BpkC-wrv.js";import{n as r,t as i}from"./glsl-D85RBwKC.js";import{t as a}from"./FloatBindUniform-C4h6J6-v.js";import{t as o}from"./Texture2DBindUniform-4_yYNByJ.js";import{n as s}from"./ForwardLinearDepth.glsl-DgvdPZSv.js";import{a as c,n as l,r as u,t as d}from"./Texture2DShadowBindUniform-K3x5AtUd.js";function f(e,t){let a=n(t.output)&&t.receiveShadows;a&&s(e,!0),e.vertex.code.add(r`
    void forwardLinearDepthToReadShadowMap() { ${i(a,`forwardLinearDepth(gl_Position.w);`)} }
  `)}var p=class extends t{constructor(){super(...arguments),this.origin=e()}};function m(e,t){t.receiveShadows&&e.fragment.include(u),g(e,t)}function h(e,t){t.receiveShadows&&e.fragment.include(c),g(e,t)}function g(e,t){e.fragment.uniforms.add(new a(`lightingGlobalFactor`,e=>e.lighting.globalFactor));let{hasShadowHighlights:n,receiveShadows:o,spherical:s}=t;e.include(f,t),o&&_(e.fragment,n),e.fragment.code.add(r`
    float readShadow(float additionalAmbientScale, vec3 vpos) {
      return ${o?`max(lightingGlobalFactor * (1.0 - additionalAmbientScale), readShadowMap(vpos, linearDepth))`:i(s,`lightingGlobalFactor * (1.0 - additionalAmbientScale)`,`0.0`)};
    }
  `)}function _(e,t){y(e,t),v(e)}function v(e){e.code.add(r`float readShadowMap(const in vec3 _worldPos, float _linearDepth) {
vec3 uvzShadow = calculateUVZShadow(_worldPos, _linearDepth, textureSize(shadowMap, 0));
return readShadowMaps(uvzShadow);
}`)}function y(e,t){e.include(l),e.uniforms.add(b()),t&&e.uniforms.add(new o(`shadowHighlight`,({shadowHighlight:e})=>e?.getTexture())),e.code.add(r`
    float readShadowMaps(const in vec3 uvzShadow) {
      if (uvzShadow.z < 0.0) {
        return 0.0;
      }

      float shadow1 = readShadowMapUVZ(uvzShadow, shadowMap);
      ${i(t,`float shadow2 = texelFetch(shadowHighlight, ivec2(gl_FragCoord.xy), 0).r;
         return shadow1 > shadow2 ? shadow1 : shadow2;`,`return shadow1;`)}
    }
  `)}function b(){return new d(`shadowMap`,({shadowMap:e})=>e.getOutput(5)??e.getOutput(7))}export{p as i,h as n,y as r,m as t};