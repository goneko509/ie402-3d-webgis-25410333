import{i as e}from"./time-BzYz5R50.js";import{t}from"./uid-tFVEb1ZF.js";import{D as n}from"./vec2-C5dJMieJ.js";import{n as r}from"./uuid-CxFjXsEJ.js";import{o as i}from"./vec2f64-IO40D2xB.js";import{o as a,r as o}from"./vec4f64-CjgU5APJ.js";import{l as s}from"./vec4-B-G2J025.js";import{i as c,s as l}from"./enums-C3NXllrX.js";import{o as u,t as d}from"./Texture-D7vRC9-Q.js";import{n as f,t as p}from"./glsl-D85RBwKC.js";import{t as m}from"./FloatBindUniform-C4h6J6-v.js";import{t as h}from"./Matrix4BindUniform-DnHs9Hq_.js";import{i as g,n as _,t as v}from"./View.glsl-DjwuylqK.js";import{t as y}from"./Float4PassUniform-Cu2daSgY.js";import{t as b}from"./Float4BindUniform-CcjALdTT.js";import{t as x}from"./FloatPassUniform-DeUP8HjM.js";import{i as ee}from"./Slice.glsl-DNk_1_Sk.js";import{t as te}from"./ObjectAndLayerIdColor.glsl-UC9jbvaT.js";import{t as S}from"./Float2BindUniform-C6b2PHzh.js";import{t as C}from"./PositionOutsideClipSpace-CLdt_M-O.js";import{t as w}from"./ColorConversion.glsl-C9xFjUmo.js";import{t as T}from"./Float2PassUniform-BYZ61_RB.js";import{t as E}from"./Texture2DPassUniform-CiCHIiok.js";import{t as D}from"./ShaderBuilder-DxA0HNjK.js";import{t as O}from"./alphaCutoff.glsl-BK3hw-re.js";import{t as k}from"./OutputColorHighlightOLID.glsl-BPsfn2UR.js";import{t as A}from"./PiUtils.glsl-CpyVHJCx.js";import{t as j}from"./MixExternalColor.glsl-cTOJOQI5.js";import{c as M,l as ne,t as re,u as ie}from"./MarkerSizing.glsl-l_uyqKG3.js";var N={dash:[4,3],dot:[1,3],"long-dash":[8,3],"short-dash":[4,1],"short-dot":[1,1]},P={dash:N.dash,"dash-dot":[...N.dash,...N.dot],dot:N.dot,"long-dash":N[`long-dash`],"long-dash-dot":[...N[`long-dash`],...N.dot],"long-dash-dot-dot":[...N[`long-dash`],...N.dot,...N.dot],none:null,"short-dash":N[`short-dash`],"short-dash-dot":[...N[`short-dash`],...N[`short-dot`]],"short-dash-dot-dot":[...N[`short-dash`],...N[`short-dot`],...N[`short-dot`]],"short-dot":N[`short-dot`],solid:null},F=8,I=class{constructor(e,t,n){this.image=e,this.width=t,this.length=n,this.uuid=r()}};function L(e){return e!=null&&`image`in e}function R(e,t){return e==null?e:{pattern:e.slice(),pixelRatio:t}}function z(e){return{pattern:[e,e],pixelRatio:2}}function B(e){switch(e?.type){case`style`:return V(e.style);case`image`:return new I(e.image,e.width,e.length);case void 0:case null:return null}return null}function V(e){return e==null?null:R(P[e],F)}var H=class{constructor(e,n,r){this._createTexture=e,this._parametersKey=n,this._repository=new Map,this._orphanCache=r.newCache(`procedural-texture-repository:${t()}`,e=>e.dispose())}destroy(){for(let{texture:e}of this._repository.values())e.dispose();this._repository.clear(),this._orphanCache.destroy()}swap(e,t=null){let n=this._acquire(e);return this.release(t),n}release(e){if(e==null)return;let t=this._parametersKey(e),n=this._repository.get(t);if(n&&(n.refCount--,n.refCount===0)){this._repository.delete(t);let{texture:e}=n;this._orphanCache.put(t,e)}}_acquire(e){if(e==null)return null;let t=this._parametersKey(e),n=this._repository.get(t);if(n)return n.refCount++,n.texture;let r=this._orphanCache.pop(t)??this._createTexture(e),i=new U(r);return this._repository.set(t,i),r}},U=class{constructor(e){this.texture=e,this.refCount=1}};function W(e,t){return new H(t=>{if(L(t))return J(e,t.image);let{data:n,textureSize:r}=G(t),i=new u(r,1);return i.dataType=l.FLOAT,i.pixelFormat=6403,i.internalFormat=c.R16F,i.wrapMode=10497,new d(e,i,n)},e=>L(e)?`image-${e.uuid}`:`${e.pattern.join(`,`)}-r${e.pixelRatio}`,t)}function G(e){let t=K(e),n=1/e.pixelRatio,r=q(e),i=[],a=1;for(let e of t){for(let t=0;t<e;t++){let r=a*(Math.min(t,e-1-t)+.5)*n;i.push(r)}a=-a}let o=Math.round(t[0]/2);return{data:new Float32Array([...i.slice(o),...i.slice(0,o)]),textureSize:r}}function K(e){return e.pattern.map(t=>Math.round(t*e.pixelRatio))}function q(e){if(e==null)return 1;let t=K(e);return Math.floor(t.reduce((e,t)=>e+t))}function J(e,t){let{data:n,width:r,height:i}=t,a=new u(r,i);return a.dataType=l.UNSIGNED_BYTE,a.pixelFormat=6408,a.internalFormat=c.RGBA8,a.wrapMode={s:10497,t:33071},a.hasMipmap=!0,a.samplingMode=9987,new d(e,a,n)}function ae(e){return e==null?o:e.length===4?e:s(oe,e[0],e[1],e[2],1)}var oe=a();function se(e,t){if(!t.stippleEnabled)return void e.fragment.code.add(f`float getStippleAlpha(float lineWidth) { return 1.0; }
void discardByStippleAlpha(float stippleAlpha, float threshold) {}
vec4 blendStipple(vec4 color, float stippleAlpha) { return color; }`);let n=!(t.draped&&t.stipplePreferContinuous),{vertex:r,fragment:i}=e;t.draped||(v(r,t),r.uniforms.add(new m(`worldToScreenPerDistanceRatio`,({camera:e})=>1/e.perScreenPixelRatio)).code.add(f`float computeWorldToScreenRatio(vec3 segmentCenter) {
float segmentDistanceToCamera = length(segmentCenter - cameraPosition);
return worldToScreenPerDistanceRatio / segmentDistanceToCamera;
}`)),e.varyings.add(`vStippleDistance`,`float`),e.varyings.add(`vStippleDistanceLimits`,`vec2`),e.varyings.add(`vStipplePatternStretch`,`float`),r.code.add(f`
    float discretizeWorldToScreenRatio(float worldToScreenRatio) {
      float step = ${f.float(ce)};

      float discreteWorldToScreenRatio = log(worldToScreenRatio);
      discreteWorldToScreenRatio = ceil(discreteWorldToScreenRatio / step) * step;
      discreteWorldToScreenRatio = exp(discreteWorldToScreenRatio);
      return discreteWorldToScreenRatio;
    }
  `),g(r),r.code.add(f`
    vec2 computeStippleDistanceLimits(float startPseudoScreen, float segmentLengthPseudoScreen, float segmentLengthScreen, float patternLength) {

      // First check if the segment is long enough to support fully screen space patterns.
      // Force sparse mode for segments that are very large in screen space even if it is not allowed,
      // to avoid imprecision from calculating with large floats.
      if (segmentLengthPseudoScreen >= ${n?`patternLength`:`1e4`}) {
        // Round the screen length to get an integer number of pattern repetitions (minimum 1).
        float repetitions = segmentLengthScreen / (patternLength * pixelRatio);
        float flooredRepetitions = max(1.0, floor(repetitions + 0.5));
        float segmentLengthScreenRounded = flooredRepetitions * patternLength;

        float stretch = repetitions / flooredRepetitions;

        // We need to impose a lower bound on the stretch factor to prevent the dots from merging together when there is only 1 repetition.
        // 0.75 is the lowest possible stretch value for flooredRepetitions > 1, so it makes sense as lower bound.
        vStipplePatternStretch = max(0.75, stretch);

        return vec2(0.0, segmentLengthScreenRounded);
      }
      return vec2(startPseudoScreen, startPseudoScreen + segmentLengthPseudoScreen);
    }
  `),i.uniforms.add(new E(`stipplePatternTexture`,e=>e.stippleTexture),new x(`stipplePatternPixelSizeInv`,e=>1/Y(e))),t.stippleOffColorEnabled&&i.uniforms.add(new y(`stippleOffColor`,e=>ae(e.stippleOffColor))),e.include(M),t.worldSizedImagePattern?(e.varyings.add(`vStippleV`,`float`),e.fragment.include(j),i.code.add(f`vec4 getStippleColor(out bool isClamped) {
vec2 aaCorrectedLimits = vStippleDistanceLimits + vec2(1.0, -1.0) / gl_FragCoord.w;
isClamped = vStippleDistance < aaCorrectedLimits.x || vStippleDistance > aaCorrectedLimits.y;
float u = vStippleDistance * stipplePatternPixelSizeInv;
float v = vStippleV == -1.0 ? 0.5 : vStippleV;
return texture(stipplePatternTexture, vec2(u, v));
}
vec4 getStippleColor() {
bool ignored;
return getStippleColor(ignored);
}
float getStippleSDF() {
vec4 color = getStippleColor();
return color.a == 0.0 ? -0.5 : 0.5;
}
float getStippleAlpha(float lineWidth) {
return getStippleColor().a;
}
vec4 blendStipple(vec4 color, float stippleAlpha) {
vec4 stippleColor = getStippleColor();
int mixMode  = 1;
vec3 col = mixExternalColor(color.rgb, vec3(1.0), stippleColor.rgb, mixMode);
float opacity = mixExternalOpacity(color.a, 1.0, stippleColor.a, mixMode);
return vec4(col, opacity);
}`)):i.code.add(f`
    float getStippleSDF(out bool isClamped) {
      float stippleDistanceClamped = noPerspectiveRead(clamp(vStippleDistance, vStippleDistanceLimits.x, vStippleDistanceLimits.y));
      float lineSizeInv = noPerspectiveRead(vLineSizeInv);

      vec2 aaCorrectedLimits = vStippleDistanceLimits + vec2(1.0, -1.0) / gl_FragCoord.w;
      isClamped = vStippleDistance < aaCorrectedLimits.x || vStippleDistance > aaCorrectedLimits.y;

      float u = stippleDistanceClamped * stipplePatternPixelSizeInv * lineSizeInv;
      u = fract(u);

      float sdf = texture(stipplePatternTexture, vec2(u, 0.5)).r;

      return (sdf - 0.5) * vStipplePatternStretch + 0.5;
    }

    float getStippleSDF() {
      bool ignored;
      return getStippleSDF(ignored);
    }

    float getStippleAlpha(float lineWidth) {
      bool isClamped;
      float stippleSDF = getStippleSDF(isClamped);
      float antiAliasedResult = clamp(stippleSDF * lineWidth + 0.5, 0.0, 1.0);
      return isClamped ? floor(antiAliasedResult + 0.5) : antiAliasedResult;
    }

    vec4 blendStipple(vec4 color, float stippleAlpha) {
      return ${t.stippleOffColorEnabled?`mix(color, stippleOffColor, stippleAlpha)`:`vec4(color.rgb, color.a * stippleAlpha)`};
    }
  `),i.code.add(f`
    void discardByStippleAlpha(float stippleAlpha, float threshold) {
     ${p(!t.stippleOffColorEnabled,`if (stippleAlpha < threshold) { discard; }`)}
    }
  `)}function Y(e){let t=e.stipplePattern;return L(t)?t.length:t?q(t)/t.pixelRatio:1}var ce=.4,le=.1,X=e(1),Z=e(1),ue=1e3,Q=27e6;function de(e,t){let{hasAnimation:r,animation:i}=t;if(!r)return;let{attributes:a,varyings:o,vertex:s,fragment:c}=e;a.add(`timeStamps`,`vec4`),o.add(`vTimeStamp`,`float`),o.add(`vFirstTime`,`float`),o.add(`vLastTime`,`float`),o.add(`vTransitionType`,`float`),s.main.add(f`vTimeStamp = timeStamps.x;
vFirstTime = timeStamps.y;
vLastTime = timeStamps.z;
vTransitionType = timeStamps.w;`),i===3&&c.constants.add(`decayRate`,`float`,2.3),c.code.add(f`
    float getTrailOpacity(float x) {
      if (x < 0.0) {
        return 0.0;
      }

      ${fe(i)}
    }`),c.uniforms.add(new x(`timeElapsed`,e=>e.timeElapsed),new x(`trailLength`,e=>e.trailLength),new x(`speed`,e=>e.animationSpeed),new T(`startEndTime`,e=>n(pe,e.startTime,e.endTime))),c.constants.add(`fadeInTime`,`float`,Z),c.constants.add(`fadeOutTime`,`float`,X),c.constants.add(`incomingTransition`,`int`,0),c.constants.add(`outgoingTransition`,`int`,2),c.code.add(f`float fadeIn(float x) {
return smoothstep(0.0, fadeInTime, x);
}
float fadeOut(float x) {
return isinf(fadeOutTime) ? 1.0 : smoothstep(fadeOutTime, 0.0, x);
}
void updateAlphaIf(inout float alpha, bool condition, float newAlpha) {
alpha = condition ? min(alpha, newAlpha) : alpha;
}
vec4 animate(vec4 color) {
float startTime = startEndTime[0];
float endTime = startEndTime[1];
float totalTime = vLastTime - vFirstTime;
float actualFadeOutTime = min(fadeOutTime * speed, trailLength);
float longStreamlineThreshold = (fadeInTime + 1.0) * speed + actualFadeOutTime;
bool longStreamline = totalTime > longStreamlineThreshold;
float totalTimeWithFadeOut = longStreamline && actualFadeOutTime != trailLength ? totalTime : totalTime + actualFadeOutTime;
float fadeOutStartTime = longStreamline ? totalTime - actualFadeOutTime : totalTime;
float originTime =  -vFirstTime;
float actualEndTime = int(vTransitionType) == outgoingTransition ? min(endTime, startTime + vLastTime / speed) : endTime;
vec4 animatedColor = color;
if (speed == 0.0) {
float alpha = getTrailOpacity((totalTimeWithFadeOut - (vTimeStamp - vFirstTime)) / trailLength);
updateAlphaIf(alpha, !isinf(actualEndTime), fadeOut(timeElapsed - actualEndTime));
updateAlphaIf(alpha, true, fadeIn(timeElapsed - startTime));
animatedColor.a *= alpha;
return animatedColor;
}
float relativeStartTime = mod(startTime, totalTimeWithFadeOut);
float shiftedTimeElapsed = timeElapsed - relativeStartTime + originTime;
float headRelativeToFirst = mod(shiftedTimeElapsed * speed, totalTimeWithFadeOut);
float vRelativeToHead = headRelativeToFirst - originTime - vTimeStamp;
float vAbsoluteTime = timeElapsed - vRelativeToHead / speed;
if (startTime > timeElapsed) {
return vec4(0.0);
}
float alpha = getTrailOpacity(vRelativeToHead / trailLength);
updateAlphaIf(alpha, true, fadeIn(timeElapsed - startTime));
updateAlphaIf(alpha, !isinf(actualEndTime), fadeOut(timeElapsed - actualEndTime));
updateAlphaIf(alpha, int(vTransitionType) != incomingTransition, step(startTime, vAbsoluteTime));
updateAlphaIf(alpha, headRelativeToFirst > fadeOutStartTime, fadeOut((headRelativeToFirst - fadeOutStartTime) / speed));
alpha *= fadeIn(vTimeStamp - vFirstTime);
animatedColor.a *= alpha;
return animatedColor;
}`)}function fe(e){switch(e){case 2:return`return x >= 0.0 && x <= 1.0 ? 1.0 : 0.0;`;case 3:return`float cutOff = exp(-decayRate);
        return (exp(-decayRate * x) - cutOff) / (1.0 - cutOff);`;default:return`return 1.0;`}}var pe=i(),me=1;function $(e){let t=new D,{attributes:n,varyings:r,vertex:i,fragment:a}=t,{applyMarkerOffset:o,draped:s,output:c,capType:l,stippleEnabled:u,falloffEnabled:d,roundJoins:v,wireframe:T,innerColorEnabled:E,hasAnimation:j,hasScreenSizePerspective:N,worldSizedImagePattern:P}=e;i.inputs.add(`position`,()=>`position`),a.include(A),t.include(ie,e),t.include(se,e),t.include(te,e),t.include(de,e);let F=o&&!s;F&&(i.uniforms.add(new x(`markerScale`,e=>e.markerScale)),t.include(re,{space:2,hasScreenSizePerspective:N})),_(i,e),i.uniforms.add(new h(`inverseProjectionMatrix`,e=>e.camera.inverseProjectionMatrix),new S(`nearFar`,e=>e.camera.nearFar),new x(`miterLimit`,e=>e.join===`miter`?e.miterLimit:0),new b(`viewport`,e=>e.camera.fullViewport)),i.constants.add(`LARGE_HALF_FLOAT`,`float`,65500),i.constants.add(`EPS`,`float`,.001),i.constants.add(`NUM_JOIN_SUBDIVISIONS`,`float`,e.numJoinSubdivisions),n.add(`position`,`vec3`),n.add(`previousDelta`,`vec4`),n.add(`nextDelta`,`vec4`),n.add(`lineParameters`,`vec2`),n.add(`u0`,`float`),r.add(`vColor`,`vec4`),r.add(`vpos`,`vec3`,{invariant:!0}),r.add(`vLineDistance`,`float`),r.add(`vLineWidth`,`float`),u||(r.add(`vIsInsideJoin`,`int`),r.add(`vStretchFactor`,`float`),r.add(`vJoinCenterLineSDFs`,`vec2`),r.add(`vSubdivisionFactor`,`float`));let I=u;I&&r.add(`vLineSizeInv`,`float`);let L=l===2,R=u&&L,z=d||R;z&&r.add(`vLineDistanceNorm`,`float`),L&&(r.add(`vSegmentSDF`,`float`),r.add(`vReverseSegmentSDF`,`float`)),i.code.add(f`vec3 perpendicular(vec3 v) {
return vec3(v.y, -v.x, 0.0);
}
float interp(float ncp, vec4 a, vec4 b) {
return (-ncp - a.z) / (b.z - a.z);
}
vec3 rotateZ(vec3 v, float a) {
float s = sin(a);
float c = cos(a);
mat2 m = mat2(c, -s, s, c);
return vec3(m * v.xy, v.z);
}`),i.code.add(f`vec4 projectAndScale(vec4 pos) {
vec4 posNdc = proj * pos;
posNdc.xy *= viewport.zw / posNdc.w;
posNdc.z /= posNdc.w;
return posNdc;
}`),i.code.add(f`void clip(
inout vec4 pos,
inout vec4 prev,
inout vec4 next,
bool isStartVertex
) {
float vnp = nearFar[0] * 0.99;
if (pos.z > -nearFar[0]) {
if (!isStartVertex) {
if (prev.z < -nearFar[0]) {
pos = mix(prev, pos, interp(vnp, prev, pos));
next = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
} else {
if (next.z < -nearFar[0]) {
pos = mix(pos, next, interp(vnp, pos, next));
prev = pos;
} else {
pos = vec4(0.0, 0.0, 0.0, 1.0);
}
}
} else {
if (prev.z > -nearFar[0]) {
prev = mix(pos, prev, interp(vnp, pos, prev));
}
if (next.z > -nearFar[0]) {
next = mix(next, pos, interp(vnp, next, pos));
}
}
}`),g(i),i.constants.add(`aaWidth`,`float`,+!u).main.add(f`
    // unpack values from vertex type
    bool isStartVertex = abs(abs(lineParameters.y) - 3.0) == 1.0;
    vec3 prevPosition = position + previousDelta.xyz * previousDelta.w;
    vec3 nextPosition = position + nextDelta.xyz * nextDelta.w;

    float coverage = 1.0;

    // Check for special value of lineParameters.y which is used by the Renderer when graphics are removed before the
    // VBO is recompacted. If this is the case, then we just project outside of clip space.
    if (lineParameters.y == 0.0) {
      gl_Position = ${C};
    }
    else {
      vec4 pos  = view * vec4(position, 1.0);
      vec4 prev = view * vec4(prevPosition, 1.0);
      vec4 next = view * vec4(nextPosition, 1.0);

      bool isJoin = abs(lineParameters.y) < 3.0;
  `),F&&i.main.add(f`vec4 other = isStartVertex ? next : prev;
bool markersHidden = areWorldMarkersHidden(pos.xyz, other.xyz);
if (!isJoin && !markersHidden) {
pos.xyz += normalize(other.xyz - pos.xyz) * getWorldMarkerSize(pos.xyz) * 0.5;
}`),t.include(ne),i.main.add(f`
      clip(pos, prev, next, isStartVertex);

      vec3 clippedPos = pos.xyz;
      vec3 clippedCenter = mix(pos.xyz, isStartVertex ? next.xyz : prev.xyz, 0.5);

      pos = projectAndScale(pos);
      next = projectAndScale(next);
      prev = projectAndScale(prev);

      vec3 left = (pos.xyz - prev.xyz);
      vec3 right = (next.xyz - pos.xyz);

      float leftLen = length(left);
      float rightLen = length(right);

      float lineSize = getSize(${p(N,`clippedPos`)});
      ${p(u&&N,`float patternLineSize = getSize(clippedCenter);`)}
      ${p(u&&!N,`float patternLineSize = lineSize;`)}

      ${p(P,f`
          lineSize += aaWidth;
          float lineWidth = lineSize * pixelRatio * worldToScreenRatio;
          if (lineWidth < 1.0) {
            coverage = lineWidth;
            lineWidth = 1.0;
          }
        `,f`
          if (lineSize < 1.0) {
            coverage = lineSize; // convert sub-pixel coverage to alpha
            lineSize = 1.0;
          }

          lineSize += aaWidth;
          float lineWidth = lineSize * pixelRatio;
        `)}

      vLineWidth = noPerspectiveWrite(lineWidth, pos.w);
      ${I?f`vLineSizeInv = noPerspectiveWrite(1.0 / lineSize, pos.w);`:``}
  `),(u||L)&&i.main.add(f`
      float isEndVertex = float(!isStartVertex);
      vec3 segmentOrigin = mix(pos.xyz, prev.xyz, isEndVertex);
      vec3 segment = mix(right, left, isEndVertex);
      ${L?f`vec3 segmentEnd = mix(next.xyz, pos.xyz, isEndVertex);`:``}
    `),i.main.add(f`left = (leftLen > EPS) ? left/leftLen : vec3(0.0, 0.0, 0.0);
right = (rightLen > EPS) ? right/rightLen : vec3(0.0, 0.0, 0.0);
vec3 segmentDirection = isStartVertex ? right : left;
vec3 capDisplacementDir = vec3(0.0, 0.0, 0.0);
vec3 joinDisplacementDir = vec3(0.0, 0.0, 0.0);
float displacementLen = lineWidth;
float miterDisplacementLen = lineWidth;
float innerDisplacementLen = lineWidth;`),u||i.main.add(f`vIsInsideJoin = 0;
vStretchFactor = 1.0;
vSubdivisionFactor = 0.0;
vJoinCenterLineSDFs = vec2(LARGE_HALF_FLOAT);`),i.main.add(f`float subdivisionFactor = 0.0;
bool isOutside = false;
if (isJoin) {
isOutside = (left.x * right.y - left.y * right.x) * lineParameters.y > 0.0;
vec3 joinDirection = normalize(left + right);
joinDisplacementDir = perpendicular(joinDirection);
if (leftLen > EPS && rightLen > EPS) {
float nDotSeg = dot(joinDisplacementDir, left);
displacementLen /= length(nDotSeg * left - joinDisplacementDir);
miterDisplacementLen = displacementLen;
innerDisplacementLen = min(displacementLen, min(leftLen, rightLen)/abs(nDotSeg));
if (!isOutside) {
displacementLen = innerDisplacementLen;
}
}
subdivisionFactor = lineParameters.x;`),u||i.main.add(f`if(subdivisionFactor > 0.0) {
vIsInsideJoin = 1;
}
vSubdivisionFactor = isOutside ? subdivisionFactor : 0.5;
if (miterDisplacementLen > miterLimit * lineWidth) {
vec2 leftScreenDir = left.xy;
vec2 rightScreenDir = right.xy;
float leftScreenLen = length(leftScreenDir);
float rightScreenLen = length(rightScreenDir);
if (leftScreenLen > EPS && rightScreenLen > EPS) {
leftScreenDir /= leftScreenLen;
rightScreenDir /= rightScreenLen;
float theta = acos(clamp(dot(leftScreenDir, rightScreenDir), -1.0, 1.0));
float subdividedTriangleHeight = (innerDisplacementLen + lineWidth) * cos(theta / (2.0 + 2.0 * NUM_JOIN_SUBDIVISIONS));
float bevelTriangleHeight = innerDisplacementLen + lineWidth * cos(theta * 0.5);
float triangleHeight = NUM_JOIN_SUBDIVISIONS > 0.0 ? subdividedTriangleHeight : bevelTriangleHeight;
vStretchFactor = noPerspectiveWrite(max(triangleHeight / (2.0 * lineWidth), 1.0), pos.w);
}
}`),i.main.add(f`if (isOutside && (displacementLen > miterLimit * lineWidth)) {`),v?i.main.add(f`
        vec3 startDir = leftLen < EPS ? right : left;
        startDir = perpendicular(startDir);

        vec3 endDir = rightLen < EPS ? left : right;
        endDir = perpendicular(endDir);

        float factor = ${u?f`min(1.0, subdivisionFactor * ((NUM_JOIN_SUBDIVISIONS + 1.0) / NUM_JOIN_SUBDIVISIONS))`:f`subdivisionFactor`};

        float rotationAngle = acos(clamp(dot(startDir.xy, endDir.xy), -1.0, 1.0));
        joinDisplacementDir = rotateZ(startDir, -sign(lineParameters.y) * factor * rotationAngle);
      `):i.main.add(f`
        vec3 startDir = perpendicular(leftLen < EPS ? right : left);
        vec3 endDir = perpendicular(rightLen < EPS ? left : right);

        ${p(u,f`joinDisplacementDir = (isStartVertex || subdivisionFactor > 0.0) ? endDir : startDir;`,f`joinDisplacementDir = mix(startDir, endDir, subdivisionFactor);`)}
  `);let B=l!==0;return i.main.add(f`
        displacementLen = lineWidth;
      }
    } else {
      // CAP handling ---------------------------------------------------
      joinDisplacementDir = isStartVertex ? right : left;
      joinDisplacementDir = perpendicular(joinDisplacementDir);

      ${B?f`capDisplacementDir = vec3((isStartVertex ? -right : left).xy, 0.0);`:``}
    }
  `),i.main.add(f`
    // Displacement (in pixels) caused by join/or cap
    vec2 dposXY = (joinDisplacementDir.xy * sign(lineParameters.y) + capDisplacementDir.xy) * displacementLen;

    /**
     * To prevent z-fighting between layers, we also adjust the z value.
     * We want to ensure that the orientation of the final triangles is the same, regardless of the line width.
     * To do so, the below formula projects the xy displacement onto the original segment direction
     * to find the z-offset necessary so the triangle orientation is independent of the width.
     */
    float dposZ = dot(dposXY, segmentDirection.xy) / dot(segmentDirection.xy, segmentDirection.xy) * segmentDirection.z;
    vec3 dpos = vec3(dposXY, dposZ);

    float lineDistNorm = noPerspectiveWrite(sign(lineParameters.y), pos.w);

    vLineDistance = lineWidth * lineDistNorm;
    ${z?f`vLineDistanceNorm = lineDistNorm;`:``}

    pos.xyz += dpos;
  `),u||i.main.add(f`if (isJoin) {
vec2 joinCenterToVertex = dposXY;
vec2 leftCenterlineDir = left.xy;
vec2 rightCenterlineDir = right.xy;
float leftCenterlineLen = length(leftCenterlineDir);
float rightCenterlineLen = length(rightCenterlineDir);
leftCenterlineDir = leftCenterlineLen > EPS ? leftCenterlineDir / leftCenterlineLen : vec2(1.0, 0.0);
rightCenterlineDir = rightCenterlineLen > EPS ? rightCenterlineDir / rightCenterlineLen : leftCenterlineDir;
vJoinCenterLineSDFs = noPerspectiveWrite(
vec2(
dot(vec2(rightCenterlineDir.y, -rightCenterlineDir.x), joinCenterToVertex),
dot(vec2(leftCenterlineDir.y, -leftCenterlineDir.x), joinCenterToVertex)
),
pos.w
);
}`),L&&i.main.add(f`vec2 segmentDir = normalize(segment.xy);
vSegmentSDF = noPerspectiveWrite((isJoin && isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentOrigin.xy, segmentDir)), pos.w);
vReverseSegmentSDF = noPerspectiveWrite((isJoin && !isStartVertex) ? LARGE_HALF_FLOAT : (dot(pos.xy - segmentEnd.xy, -segmentDir)), pos.w);`),u&&(s?i.uniforms.add(new m(`worldToScreenRatio`,e=>1/e.screenToPCSRatio)):i.main.add(f`vec3 segmentCenter = mix((nextPosition + position) * 0.5, (position + prevPosition) * 0.5, isEndVertex);
float worldToScreenRatio = computeWorldToScreenRatio(segmentCenter);`),i.main.add(f`float segmentLengthScreenDouble = length(segment.xy);
float segmentLengthScreen = segmentLengthScreenDouble * 0.5;
float discreteWorldToScreenRatio = discretizeWorldToScreenRatio(worldToScreenRatio);
float segmentLengthRender = length(mix(nextPosition - position, position - prevPosition, isEndVertex));
vStipplePatternStretch = worldToScreenRatio / discreteWorldToScreenRatio;`),s?i.main.add(f`float segmentLengthPseudoScreen = segmentLengthScreen / pixelRatio * discreteWorldToScreenRatio / worldToScreenRatio;
float startPseudoScreen = u0 * discreteWorldToScreenRatio - mix(0.0, segmentLengthPseudoScreen, isEndVertex);`):i.main.add(f`float startPseudoScreen = mix(u0, u0 - segmentLengthRender, isEndVertex) * discreteWorldToScreenRatio;
float segmentLengthPseudoScreen = segmentLengthRender * discreteWorldToScreenRatio;`),i.uniforms.add(new x(`stipplePatternPixelSize`,e=>Y(e))),i.main.add(f`
      float patternLength = patternLineSize * stipplePatternPixelSize;

      ${p(P,f`
          float uu = mix(u0, u0 - segmentLengthRender, isEndVertex);
          vStippleDistanceLimits = vec2(uu, uu + segmentLengthRender);
          vStipplePatternStretch = 1.0;

          // The v-coordinate used in case of an image pattern.
          bool isLeft = sign(lineParameters.y) < 0.0;
          vStippleV = isLeft ? 0.0 : 1.0;
        `,f`
          // Compute the coordinates at both start and end of the line segment, because we need both to clamp to in the
          // fragment shader
          vStippleDistanceLimits = computeStippleDistanceLimits(startPseudoScreen, segmentLengthPseudoScreen, segmentLengthScreen, patternLength);
        `)}

      vStippleDistance = mix(vStippleDistanceLimits.x, vStippleDistanceLimits.y, isEndVertex);

      // Adjust the coordinate to the displaced position (the pattern is shortened/overextended on the in/outside of
      // joins)
      if (segmentLengthScreenDouble >= EPS) {
        // Project the actual vertex position onto the line segment. Note that the resulting factor is within [0..1]
        // at the original vertex positions, and slightly outside of that range at the displaced positions
        vec3 stippleDisplacement = pos.xyz - segmentOrigin;
        float stippleDisplacementFactor = dot(segment.xy, stippleDisplacement.xy) / (segmentLengthScreenDouble * segmentLengthScreenDouble);

        // Apply this offset to the actual vertex coordinate (can be screen or pseudo-screen space)
        vStippleDistance += (stippleDisplacementFactor - isEndVertex) * (vStippleDistanceLimits.y - vStippleDistanceLimits.x);
      }

      // Cancel out perspective correct interpolation because we want this length the really represent the screen
      // distance
      vStippleDistanceLimits = noPerspectiveWrite(vStippleDistanceLimits, pos.w);
      vStippleDistance = noPerspectiveWrite(vStippleDistance, pos.w);

      // Disable stipple distance limits on caps
      vStippleDistanceLimits = isJoin ?
                                 vStippleDistanceLimits :
                                 isStartVertex ?
                                  vec2(-1e34, vStippleDistanceLimits.y) :
                                  vec2(vStippleDistanceLimits.x, 1e34);
    `)),i.main.add(f`
      // Convert back into NDC
      pos.xy = (pos.xy / viewport.zw) * pos.w;
      pos.z = pos.z * pos.w;

      vColor = getColor();
      vColor.a = noPerspectiveWrite(vColor.a * coverage, pos.w);

      ${T&&!s?`pos.z -= EPS * pos.w;`:``}

      // transform final position to camera space for slicing
      vpos = (inverseProjectionMatrix * pos).xyz;
      gl_Position = pos;
      forwardObjectAndLayerIdColor();
    }`),t.fragment.include(ee,e),t.include(k,e),a.include(w),a.main.add(f`discardBySlice(vpos);`),t.include(M),a.include(O),a.main.add(f`
    float lineWidth = noPerspectiveRead(vLineWidth);
    float lineDistance = noPerspectiveRead(vLineDistance);
    ${p(z,f`float lineDistanceNorm = noPerspectiveRead(vLineDistanceNorm);`)}
  `),T?a.main.add(f`vec4 finalColor = vec4(1.0, 0.0, 1.0, 1.0);`):(L&&a.main.add(f`float sdf = noPerspectiveRead(min(vSegmentSDF, vReverseSegmentSDF));
vec2 fragmentPosition = vec2(min(sdf, 0.0), lineDistance);
float fragmentRadius = length(fragmentPosition);
float fragmentCapSDF = (fragmentRadius - lineWidth) * 0.5;
float capCoverage = clamp(0.5 - fragmentCapSDF, 0.0, 1.0);
if (capCoverage < alphaCutoff) {
discard;
}`),R?a.main.add(f`vec2 stipplePosition = vec2(
min(getStippleSDF() * 2.0 - 1.0, 0.0),
lineDistanceNorm
);
float stippleRadius = length(stipplePosition * lineWidth);
float stippleCapSDF = (stippleRadius - lineWidth) * 0.5;
float stippleCoverage = clamp(0.5 - stippleCapSDF, 0.0, 1.0);
float stippleAlpha = step(alphaCutoff, stippleCoverage);`):a.main.add(f`float stippleAlpha = getStippleAlpha(lineWidth);`),c!==11&&a.main.add(f`discardByStippleAlpha(stippleAlpha, alphaCutoff);`),t.include(M),a.uniforms.add(new y(`intrinsicColor`,e=>e.color)).main.add(f`vec4 color = intrinsicColor * vColor;
color.a = noPerspectiveRead(color.a);`),E&&a.uniforms.add(new y(`innerColor`,e=>e.innerColor??e.color),new x(`innerWidth`,(e,t)=>e.innerWidth*t.camera.pixelRatio)).main.add(f`float distToInner = abs(lineDistance) - innerWidth;
float innerAA = clamp(0.5 - distToInner, 0.0, 1.0);
float innerAlpha = innerColor.a + color.a * (1.0 - innerColor.a);
color = mix(color, vec4(innerColor.rgb, innerAlpha), innerAA);`),a.main.add(f`vec4 finalColor = blendStipple(color, stippleAlpha);`),d&&(a.uniforms.add(new x(`falloff`,e=>e.falloff)),a.main.add(f`finalColor.a *= pow(max(0.0, 1.0 - abs(lineDistanceNorm)), falloff);`)),u||a.main.add(f`float stretchFactor = vIsInsideJoin == 1 ? noPerspectiveRead(vStretchFactor) : 1.0;
float featherWidth = 2.0;
float featherStartDistance = max(lineWidth - featherWidth / stretchFactor, 0.0);
float straightFeatherStartDistance = max(lineWidth - featherWidth, 0.0);
float value = abs(lineDistance);
float feather = (value - featherStartDistance) / (lineWidth - featherStartDistance);
vec2 joinCenterSDFs = noPerspectiveRead(vJoinCenterLineSDFs);
float joinCenterDistance = abs(vSubdivisionFactor > 0.5 ? joinCenterSDFs.x : joinCenterSDFs.y);
float straightFeather = (joinCenterDistance - straightFeatherStartDistance) / (lineWidth - straightFeatherStartDistance);
feather = vIsInsideJoin == 1 ? max(feather, straightFeather) : feather;
finalColor.a *= 1.0 - clamp(feather, 0.0, 1.0);`),j&&a.main.add(f`
        finalColor = animate(finalColor);

        ${p(c!==11,f`
            if (finalColor.a <= alphaCutoff) {
              discard;
            }`)}
      `)),a.main.add(f`outputColorHighlightOLID(applySlice(finalColor, vpos), finalColor.rgb);`),t}var he=Object.freeze(Object.defineProperty({__proto__:null,build:$,ribbonlineNumRoundJoinSubdivisions:1},Symbol.toStringTag,{value:`Module`}));export{le as a,Z as c,B as d,L as f,ue as i,W as l,me as n,X as o,z as p,he as r,Q as s,$ as t,H as u};