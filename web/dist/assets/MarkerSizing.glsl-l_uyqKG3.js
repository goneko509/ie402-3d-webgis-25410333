import{t as e}from"./mat4f64-E_FXCKxO.js";import{C as t,S as n}from"./mat4-BL30OFHW.js";import{i as r}from"./vec4f64-CjgU5APJ.js";import{i,s as a}from"./enums-C3NXllrX.js";import{o,t as s}from"./Texture-D7vRC9-Q.js";import{t as c}from"./Float3PassUniform-YEiGS05C.js";import{n as l,t as u}from"./glsl-D85RBwKC.js";import{n as d,r as f}from"./ScreenSizePerspective.glsl-DCyTAQMw.js";import{t as p}from"./FloatBindUniform-C4h6J6-v.js";import{t as m}from"./Matrix4DrawUniform-CQqS-mc3.js";import{i as h,t as g}from"./View.glsl-DjwuylqK.js";import{t as _}from"./FloatPassUniform-DeUP8HjM.js";import{t as v}from"./VisualVariables.glsl-C-_1q24O.js";import{t as y}from"./FloatsPassUniform-DfJ8EJ1F.js";import{t as b}from"./ManagedTexture-4zozdZMJ.js";var x=8;function S(e,r){let{vertex:i,attributes:a}=e;i.uniforms.add(new _(`intrinsicWidth`,e=>e.width));let{hasScreenSizePerspective:o,spherical:s}=r;o?(e.include(d,r),f(i),g(i,r),i.uniforms.add(new m(`inverseViewMatrix`,(e,r)=>n(C,t(C,r.camera.viewMatrix,e.origin)))),i.code.add(l`
      float applyLineSizeScreenSizePerspective(float size, vec3 pos) {
        vec3 worldPos = (inverseViewMatrix * vec4(pos, 1)).xyz;
        vec3 groundUp = ${s?l`normalize(worldPos + localOrigin)`:l`vec3(0.0, 0.0, 1.0)`};
        float absCosAngle = abs(dot(groundUp, normalize(worldPos - cameraPosition)));

        return screenSizePerspectiveScaleFloat(size, absCosAngle, length(pos), screenSizePerspective);
      }
    `)):i.code.add(l`float applyLineSizeScreenSizePerspective(float size, vec3 pos) {
return size;
}`),r.hasVVSize?(a.add(`sizeFeatureAttribute`,`float`),i.uniforms.add(new c(`vvSizeMinSize`,e=>e.vvSize.minSize),new c(`vvSizeMaxSize`,e=>e.vvSize.maxSize),new c(`vvSizeOffset`,e=>e.vvSize.offset),new c(`vvSizeFactor`,e=>e.vvSize.factor),new c(`vvSizeFallback`,e=>e.vvSize.fallback)),i.code.add(l`
    float getSize(${u(o,`vec3 pos`)}) {
      float size = isnan(sizeFeatureAttribute)
        ? vvSizeFallback.x
        : intrinsicWidth * clamp(vvSizeOffset + sizeFeatureAttribute * vvSizeFactor, vvSizeMinSize, vvSizeMaxSize).x;

      return ${u(o,`applyLineSizeScreenSizePerspective(size, pos)`,`size`)};
    }
    `)):(a.add(`size`,`float`),i.code.add(l`
    float getSize(${u(o,`vec3 pos`)}) {
      float fullSize = intrinsicWidth * size;
      return ${u(o,`applyLineSizeScreenSizePerspective(fullSize, pos)`,`fullSize`)};
    }
    `)),r.hasVVOpacity?(a.add(`opacityFeatureAttribute`,`float`),i.constants.add(`vvOpacityNumber`,`int`,8),i.uniforms.add(new y(`vvOpacityValues`,x,e=>e.vvOpacity.values),new y(`vvOpacityOpacities`,x,e=>e.vvOpacity.opacityValues),new _(`vvOpacityFallback`,e=>e.vvOpacity.fallback,{supportsNaN:!0})),i.code.add(l`
    float interpolateOpacity(float value) {
      if (value <= vvOpacityValues[0]) {
        return vvOpacityOpacities[0];
      }

      for (int i = 1; i < vvOpacityNumber; ++i) {
        if (vvOpacityValues[i] >= value) {
          float f = (value - vvOpacityValues[i-1]) / (vvOpacityValues[i] - vvOpacityValues[i-1]);
          return mix(vvOpacityOpacities[i-1], vvOpacityOpacities[i], f);
        }
      }

      return vvOpacityOpacities[vvOpacityNumber - 1];
    }

    vec4 applyOpacity(vec4 color) {
      if (isnan(opacityFeatureAttribute)) {
        // If there is a color vv then it will already have taken care of applying the fallback
        return ${u(r.hasVVColor,`color`,`vec4(color.rgb, vvOpacityFallback)`)};
      }

      return vec4(color.rgb, interpolateOpacity(opacityFeatureAttribute));
    }
    `)):i.code.add(l`vec4 applyOpacity(vec4 color) {
return color;
}`),r.hasVVColor?(e.include(v,r),a.add(`colorFeatureAttribute`,`float`),i.code.add(l`vec4 getColor() {
vec4 color = interpolateVVColor(colorFeatureAttribute);
if (isnan(color.r)) {
return vec4(0);
}
return applyOpacity(color);
}`)):(a.add(`color`,`vec4`),i.code.add(l`vec4 getColor() {
return applyOpacity(color);
}`))}var C=e();function w(e){e.vertex.code.add(`#define noPerspectiveWrite(x, w) (x * w)`)}function T(e){e.fragment.code.add(`#define noPerspectiveRead(x) (x * gl_FragCoord.w)`)}var E=.5,D=r(E/2,E/2,1-E/2,1-E/2);function O(e){return e===`cross`||e===`x`}function k(e,t=128,n=t*E,r=0){let{data:i,parameters:a}=A(e,t,n,r);return new b(i,a)}function A(e,t=128,n=t*E,r=0){return{data:j(e,t,n,r),parameters:{mipmap:!1,wrap:{s:33071,t:33071},width:t,height:t,noUnpackFlip:!0,dataType:a.FLOAT,pixelFormat:6403,internalFormat:i.R16F,reloadable:!0}}}function j(e,t=128,n=t*E,r=0){switch(e){case`circle`:default:return M(t,n);case`square`:return N(t,n);case`cross`:return F(t,n,r);case`x`:return I(t,n,r);case`kite`:return P(t,n);case`triangle`:return L(t,n);case`arrow`:return R(t,n)}}function M(e,t){let n=e/2-.5;return U(e,V(n,n,t/2))}function N(e,t){return z(e,t,!1)}function P(e,t){return z(e,t,!0)}function F(e,t,n=0){return B(e,t,!1,n)}function I(e,t,n=0){return B(e,t,!0,n)}function L(e,t){return U(e,H(e/2,t,t/2))}function R(e,t){let n=t,r=t/2,i=e/2,a=.8*n,o=V(i,(e-t)/2-a,Math.sqrt(a*a+r*r)),s=H(i,n,r);return U(e,(e,t)=>Math.max(s(e,t),-o(e,t)))}function z(e,t,n){return n&&(t/=Math.SQRT2),U(e,(r,i)=>{let a=r-.5*e+.25,o=.5*e-i-.75;if(n){let e=(a+o)/Math.SQRT2;o=(o-a)/Math.SQRT2,a=e}return Math.max(Math.abs(a),Math.abs(o))-.5*t})}function B(e,t,n,r=0){t-=r,n&&(t*=Math.SQRT2);let i=.5*t;return U(e,(t,a)=>{let o,s=t-.5*e,c=.5*e-a-1;if(n){let e=(s+c)/Math.SQRT2;c=(c-s)/Math.SQRT2,s=e}return s=Math.abs(s),c=Math.abs(c),o=s>c?s>i?Math.sqrt((s-i)*(s-i)+c*c):c:c>i?Math.sqrt(s*s+(c-i)*(c-i)):s,o-=r/2,o})}function V(e,t,n){return(r,i)=>{let a=r-e,o=i-t;return Math.sqrt(a*a+o*o)-n}}function H(e,t,n){let r=Math.sqrt(t*t+n*n);return(i,a)=>{let o=Math.abs(i-e)-n,s=a-e+t/2+.75,c=(t*o+n*s)/r,l=-s;return Math.max(c,l)}}function U(e,t){let n=new Float32Array(e*e);for(let r=0;r<e;r++)for(let i=0;i<e;i++)n[i+e*r]=t(i,r)/e;return n}var W=32/5;64/W;var G=.25;function K(e,t){let n=j(e,64,32,W),r=new o(64);return r.internalFormat=i.R16F,r.dataType=a.FLOAT,r.pixelFormat=6403,r.wrapMode=33071,new s(t,r,n)}function q(e,t){let n=e.vertex,r=t.hasScreenSizePerspective;h(n),n.uniforms.get(`markerScale`)??n.constants.add(`markerScale`,`float`,1),n.constants.add(`markerSizePerLineWidth`,`float`,10).code.add(l`
  float getLineWidth(${u(r,`vec3 pos`)}) {
     return max(getSize(${u(r,`pos`)}), 1.0) * pixelRatio;
  }

  float getScreenMarkerSize(float lineWidth) {
    return markerScale * markerSizePerLineWidth * lineWidth;
  }
  `),t.space===2&&(n.constants.add(`maxSegmentLengthFraction`,`float`,.45),n.uniforms.add(new p(`perRenderPixelRatio`,e=>e.camera.perRenderPixelRatio)),n.code.add(l`
  bool areWorldMarkersHidden(vec3 pos, vec3 other) {
    vec3 midPoint = mix(pos, other, 0.5);
    float distanceToCamera = length(midPoint);
    float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
    float worldMarkerSize = getScreenMarkerSize(getLineWidth(${u(r,`pos`)})) * screenToWorldRatio;
    float segmentLen = length(pos - other);
    return worldMarkerSize > maxSegmentLengthFraction * segmentLen;
  }

  float getWorldMarkerSize(vec3 pos) {
    float distanceToCamera = length(pos);
    float screenToWorldRatio = perRenderPixelRatio * distanceToCamera * 0.5;
    return getScreenMarkerSize(getLineWidth(${u(r,`pos`)})) * screenToWorldRatio;
  }
  `))}export{E as a,T as c,O as i,w as l,G as n,k as o,K as r,D as s,q as t,S as u};