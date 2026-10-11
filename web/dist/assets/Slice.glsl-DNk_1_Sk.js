import{r as e}from"./tslib.es6-qUHyP9zl.js";import{c as t,r as n}from"./vec3f64-DIOQknMY.js";import{C as r,P as i,p as a,x as o}from"./vec3-CMyaVPVc.js";import{t as s}from"./mat4f64-E_FXCKxO.js";import{C as c}from"./mat4-BL30OFHW.js";import{t as l}from"./NoParameters-XZJ-8n06.js";import{t as u}from"./Float3PassUniform-YEiGS05C.js";import{n as d}from"./glsl-D85RBwKC.js";import{t as f}from"./Float3DrawUniform-C2uWcyOr.js";import{n as p,t as m}from"./ShaderTechniqueConfiguration-B1x-rScA.js";var h=class extends m{constructor(){super(...arguments),this.output=0,this.hasEmission=!1,this.useFloatBlend=!0}};e([p({count:12})],h.prototype,`output`,void 0),e([p()],h.prototype,`hasEmission`,void 0),e([p()],h.prototype,`useFloatBlend`,void 0);var g=class extends h{constructor(){super(...arguments),this.instancedDoublePrecision=!1,this.hasModelTransformation=!1}},_=class extends g{constructor(){super(...arguments),this.hasSlicePlane=!1,this.hasSliceTranslatedView=!1}};e([p()],_.prototype,`hasSlicePlane`,void 0);var v=class extends l{constructor(e=null){super(),this.slicePlaneLocalOrigin=e}};function y(e,t){T(e,t,...E(t))}function b(e,t){T(e,t,...D(t))}function x(e,t){w(e,t,...D(t))}function S(e,t){w(e,t,...E(t))}var C=d`struct SliceFactors {
float front;
float side0;
float side1;
float side2;
float side3;
};
SliceFactors calculateSliceFactors(vec3 pos) {
vec3 rel = pos - slicePlaneOrigin;
vec3 slicePlaneNormal = -cross(slicePlaneBasis1, slicePlaneBasis2);
float slicePlaneW = -dot(slicePlaneNormal, slicePlaneOrigin);
float basis1Len2 = dot(slicePlaneBasis1, slicePlaneBasis1);
float basis2Len2 = dot(slicePlaneBasis2, slicePlaneBasis2);
float basis1Dot = dot(slicePlaneBasis1, rel);
float basis2Dot = dot(slicePlaneBasis2, rel);
return SliceFactors(
dot(slicePlaneNormal, pos) + slicePlaneW,
-basis1Dot - basis1Len2,
basis1Dot - basis1Len2,
-basis2Dot - basis2Len2,
basis2Dot - basis2Len2
);
}
bool sliceByFactors(SliceFactors factors) {
return factors.front < 0.0
&& factors.side0 < 0.0
&& factors.side1 < 0.0
&& factors.side2 < 0.0
&& factors.side3 < 0.0;
}
bool sliceEnabled() {
return dot(slicePlaneBasis1, slicePlaneBasis1) != 0.0;
}
bool rejectBySlice(vec3 pos) {
return sliceEnabled() && sliceByFactors(calculateSliceFactors(pos));
}`;function w(e,t,...n){t.hasSlicePlane?(e.uniforms.add(...n),e.code.add(C)):e.code.add(`bool rejectBySlice(vec3 pos) { return false; }`)}function T(e,t,...n){e.constants.add(`groundSliceOpacity`,`float`,.2),w(e,t,...n),t.hasSlicePlane?e.code.add(`
    void discardBySlice(vec3 pos) {
      if (rejectBySlice(pos)) {
        discard;
      }
    }

    vec4 applySliceOutline(vec4 color, vec3 pos) {
      SliceFactors factors = calculateSliceFactors(pos);

      factors.front /= 2.0 * fwidth(factors.front);
      factors.side0 /= 2.0 * fwidth(factors.side0);
      factors.side1 /= 2.0 * fwidth(factors.side1);
      factors.side2 /= 2.0 * fwidth(factors.side2);
      factors.side3 /= 2.0 * fwidth(factors.side3);

      // return after calling fwidth, to avoid aliasing caused by discontinuities in the input to fwidth
      if (sliceByFactors(factors)) {
        return color;
      }

      float outlineFactor = (1.0 - step(0.5, factors.front))
        * (1.0 - step(0.5, factors.side0))
        * (1.0 - step(0.5, factors.side1))
        * (1.0 - step(0.5, factors.side2))
        * (1.0 - step(0.5, factors.side3));

      return mix(color, vec4(vec3(0.0), color.a), outlineFactor * 0.3);
    }

    vec4 applySlice(vec4 color, vec3 pos) {
      return sliceEnabled() ? applySliceOutline(color, pos) : color;
    }
  `):e.code.add(d`void discardBySlice(vec3 pos) { }
vec4 applySlice(vec4 color, vec3 pos) { return color; }`)}function E(e){return[new u(`slicePlaneOrigin`,(t,n)=>j(e,t,n)),new u(`slicePlaneBasis1`,(t,n)=>M(e,t,n,n.slicePlane?.basis1)),new u(`slicePlaneBasis2`,(t,n)=>M(e,t,n,n.slicePlane?.basis2))]}function D(e){return[new f(`slicePlaneOrigin`,(t,n)=>j(e,t,n)),new f(`slicePlaneBasis1`,(t,n)=>M(e,t,n,n.slicePlane?.basis1)),new f(`slicePlaneBasis2`,(t,n)=>M(e,t,n,n.slicePlane?.basis2))]}function O(e,t,n){return e.instancedDoublePrecision?i(N,n.camera.viewInverseTransposeMatrix[3],n.camera.viewInverseTransposeMatrix[7],n.camera.viewInverseTransposeMatrix[11]):t.slicePlaneLocalOrigin}function k(e,t){return e==null?t.origin:o(P,t.origin,e)}function A(e,t,n){return e.hasSliceTranslatedView?t==null?n.camera.viewMatrix:c(I,n.camera.viewMatrix,t):null}function j(e,t,r){if(r.slicePlane==null)return n;let i=O(e,t,r),o=k(i,r.slicePlane),s=A(e,i,r);return s==null?o:a(P,o,s)}function M(e,t,i,s){if(s==null||i.slicePlane==null)return n;let c=O(e,t,i),l=k(c,i.slicePlane),u=A(e,c,i);return u==null?s:(r(F,s,l),a(P,l,u),a(F,F,u),o(F,F,P))}var N=t(),P=t(),F=t(),I=s();export{y as a,b as i,x as n,S as o,v as r,h as s,_ as t};