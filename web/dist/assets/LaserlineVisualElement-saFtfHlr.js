const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/Laserline.glsl-D_73Ypfx.js","assets/mathUtils-D79yUFwW.js","assets/vec2-C5dJMieJ.js","assets/common-DhvcAEWc.js","assets/vec3f64-DIOQknMY.js","assets/vec3-CMyaVPVc.js","assets/vec2f64-IO40D2xB.js","assets/vec4f64-CjgU5APJ.js","assets/lineSegment-UK1LWD8i.js","assets/ObjectStack-DcapzbTw.js","assets/nextTick-e2wXLyPh.js","assets/vectorStacks-CPX4YoOU.js","assets/Error-CVoK2uyB.js","assets/typedArrayUtil-ob_YkLNY.js","assets/arrayUtils-DXfY1bBO.js","assets/mat3f64-B6tTkprt.js","assets/mat4f64-E_FXCKxO.js","assets/quatf64-CwpDH0r1.js","assets/vec4-B-G2J025.js","assets/plane-B87UY0HR.js","assets/mathUtils-C-fWQXdy.js","assets/glsl-D85RBwKC.js","assets/ScreenSpacePass.glsl-9L-_X5OK.js","assets/ShaderBuilder-DxA0HNjK.js","assets/LaserlinePath.glsl-BCgxry7s.js","assets/mat4-BL30OFHW.js"])))=>i.map(i=>d[i]);
import{r as e}from"./tslib.es6-qUHyP9zl.js";import"./Error-CVoK2uyB.js";import{F as t}from"./promiseUtils-BA3LEme1.js";import{n,t as r}from"./decorators-whvBKDev.js";import{t as i}from"./preload-helper-DjzSQ1t3.js";import{_ as a}from"./mathUtils-D79yUFwW.js";import{D as o}from"./vec2-C5dJMieJ.js";import{c as s,f as c,u as l}from"./vec3f64-DIOQknMY.js";import{A as u,C as ee,P as d,b as f,d as te,j as p,p as m,x as h,y as g}from"./vec3-CMyaVPVc.js";import{t as ne}from"./mat4f64-E_FXCKxO.js";import{n as re}from"./DoubleArray-CH6Bxnae.js";import{C as ie}from"./mat4-BL30OFHW.js";import{o as _}from"./vec2f64-IO40D2xB.js";import{o as v}from"./vec4f64-CjgU5APJ.js";import{d as y,i as ae,t as oe,u as b}from"./lineSegment-UK1LWD8i.js";import{g as se}from"./vec4-B-G2J025.js";import{m as ce,x as le}from"./plane-B87UY0HR.js";import{s as ue}from"./ray-SBFRkJYp.js";import{l as x,t as de}from"./RenderNode-BWy6JO7Q.js";import{f as fe,h as pe,m as me,n as he,p as ge}from"./frustum-DE_VJL9n.js";import{m as _e,r as S}from"./enums-C3NXllrX.js";import{t as ve}from"./VertexBuffer-Cj2PVc6f.js";import{i as C,n as w}from"./InterleavedLayout-CKErJRvt.js";import{n as T,t as E}from"./ShaderTechnique-j9ngpNWg.js";import{t as ye}from"./VertexArrayObject-CMjmqkAv.js";import{r as be}from"./MaterialUtil-D2ESw9-Q.js";import{t as xe}from"./NoParameters-XZJ-8n06.js";import{t as D}from"./Float3PassUniform-YEiGS05C.js";import{n as O,t as k}from"./glsl-D85RBwKC.js";import{t as Se}from"./Float3BindUniform-BmdF9XGj.js";import{t as A}from"./FloatBindUniform-C4h6J6-v.js";import{t as Ce}from"./Matrix4BindUniform-DnHs9Hq_.js";import{t as j}from"./Float4PassUniform-Cu2daSgY.js";import{t as M}from"./FloatPassUniform-DeUP8HjM.js";import{n as N,t as we}from"./ShaderTechniqueConfiguration-B1x-rScA.js";import{t as Te}from"./Texture2DBindUniform-4_yYNByJ.js";import{t as Ee}from"./Float2BindUniform-C6b2PHzh.js";import{t as De}from"./ReadDepth.glsl-Ca_0z8Pl.js";import{t as P}from"./Float2PassUniform-BYZ61_RB.js";import{t as F}from"./Texture2DPassUniform-CiCHIiok.js";import{t as Oe}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as I}from"./ShaderBuilder-DxA0HNjK.js";import{t as ke}from"./Matrix4PassUniform-Bb5ATfS6.js";import{t as Ae}from"./CameraSpace.glsl-DcIGS7L_.js";import{t as je}from"./BlendColorsPremultiplied.glsl-BnH2fynI.js";import{ht as Me}from"./index-DxbfLeiq.js";import{t as Ne}from"./VisualElement-Gb5xDYGR.js";function L(e,t){let n=e.fragment;n.include(De),e.include(Ae),n.include(je),n.uniforms.add(new M(`globalAlpha`,e=>e.globalAlpha),new D(`glowColor`,e=>e.glowColor),new M(`glowWidth`,(e,t)=>e.glowWidth*t.camera.pixelRatio),new M(`glowFalloff`,e=>e.glowFalloff),new D(`innerColor`,e=>e.innerColor),new M(`innerWidth`,(e,t)=>e.innerWidth*t.camera.pixelRatio),new Te(`depthMap`,e=>e.depth?.attachment),new F(`normalMap`,e=>e.normals)),n.code.add(O`vec4 premultipliedColor(vec3 rgb, float alpha) {
return vec4(rgb * alpha, alpha);
}`),n.code.add(O`vec4 laserlineProfile(float dist) {
if (dist > glowWidth) {
return vec4(0.0);
}
float innerAlpha = (1.0 - smoothstep(0.0, innerWidth, dist));
float glowAlpha = pow(max(0.0, 1.0 - dist / glowWidth), glowFalloff);
return blendColorsPremultiplied(
premultipliedColor(innerColor, innerAlpha),
premultipliedColor(glowColor, glowAlpha)
);
}`),n.code.add(O`bool laserlineReconstructFromDepth(out vec3 pos, out vec3 normal, out float angleCutoffAdjust, out float depthDiscontinuityAlpha) {
float depth = depthFromTexture(depthMap, uv);
if (depth == 1.0) {
return false;
}
float linearDepth = linearizeDepth(depth);
pos = reconstructPosition(gl_FragCoord.xy, linearDepth);
float minStep = 6e-8;
float depthStep = clamp(depth + minStep, 0.0, 1.0);
float linearDepthStep = linearizeDepth(depthStep);
float depthError = abs(linearDepthStep - linearDepth);
vec3 normalReconstructed = normalize(cross(dFdx(pos), dFdy(pos)));
vec3 normalFromTexture = normalize(texture(normalMap, uv).xyz * 2.0 - 1.0);
float blendFactor = smoothstep(0.15, 0.2, depthError);
normal = normalize(mix(normalReconstructed, normalFromTexture, blendFactor));
angleCutoffAdjust = mix(0.0, 0.004, blendFactor);
float ddepth = fwidth(linearDepth);
depthDiscontinuityAlpha = 1.0 - smoothstep(0.0, 0.01, -ddepth / linearDepth);
return true;
}`),t.contrastControlEnabled?n.uniforms.add(new F(`frameColor`,(e,t)=>e.colors),new M(`globalAlphaContrastBoost`,e=>e.globalAlphaContrastBoost)).code.add(O`float rgbToLuminance(vec3 color) {
return dot(vec3(0.2126, 0.7152, 0.0722), color);
}
vec4 laserlineOutput(vec4 color) {
float backgroundLuminance = rgbToLuminance(texture(frameColor, uv).rgb);
float alpha = clamp(globalAlpha * max(backgroundLuminance * globalAlphaContrastBoost, 1.0), 0.0, 1.0);
return color * alpha;
}`):n.code.add(O`vec4 laserlineOutput(vec4 color) {
return color * globalAlpha;
}`)}var R=a(6);function z(e){let t=new I;t.include(Oe),t.include(L,e);let n=t.fragment;if(e.lineVerticalPlaneEnabled||e.heightManifoldEnabled){if(n.uniforms.add(new M(`maxPixelDistance`,(t,n)=>e.heightManifoldEnabled?2*n.camera.computeScreenPixelSizeAt(t.heightManifoldTarget):2*n.camera.computeScreenPixelSizeAt(t.lineVerticalPlaneSegment.origin))),n.code.add(O`float planeDistancePixels(vec4 plane, vec3 pos) {
float dist = dot(plane.xyz, pos) + plane.w;
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}`),e.spherical){let e=(e,t,n)=>m(e,t.heightManifoldTarget,n.camera.viewMatrix),t=(e,t)=>m(e,[0,0,0],t.camera.viewMatrix);n.uniforms.add(new j(`heightManifoldOrigin`,(n,r)=>(e(H,n,r),t(W,r),h(W,W,H),g(U,W),U[3]=f(W),U)),new Se(`globalOrigin`,e=>t(H,e)),new M(`cosSphericalAngleThreshold`,(e,t)=>1-Math.max(2,p(t.camera.eye,e.heightManifoldTarget)*t.camera.perRenderPixelRatio)/f(e.heightManifoldTarget))),n.code.add(O`float globeDistancePixels(float posInGlobalOriginLength) {
float dist = abs(posInGlobalOriginLength - heightManifoldOrigin.w);
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}
float heightManifoldDistancePixels(vec4 heightPlane, vec3 pos) {
vec3 posInGlobalOriginNorm = normalize(globalOrigin - pos);
float cosAngle = dot(posInGlobalOriginNorm, heightManifoldOrigin.xyz);
vec3 posInGlobalOrigin = globalOrigin - pos;
float posInGlobalOriginLength = length(posInGlobalOrigin);
float sphericalDistance = globeDistancePixels(posInGlobalOriginLength);
float planarDistance = planeDistancePixels(heightPlane, pos);
return cosAngle < cosSphericalAngleThreshold ? sphericalDistance : planarDistance;
}`)}else n.code.add(O`float heightManifoldDistancePixels(vec4 heightPlane, vec3 pos) {
return planeDistancePixels(heightPlane, pos);
}`)}if(e.pointDistanceEnabled&&(n.uniforms.add(new M(`maxPixelDistance`,(e,t)=>2*t.camera.computeScreenPixelSizeAt(e.pointDistanceTarget))),n.code.add(O`float sphereDistancePixels(vec4 sphere, vec3 pos) {
float dist = distance(sphere.xyz, pos) - sphere.w;
float width = fwidth(dist);
dist /= min(width, maxPixelDistance);
return abs(dist);
}`)),e.intersectsLineEnabled&&n.uniforms.add(new A(`perScreenPixelRatio`,e=>e.camera.perScreenPixelRatio)).code.add(O`float lineDistancePixels(vec3 start, vec3 dir, float radius, vec3 pos) {
float dist = length(cross(dir, pos - start)) / (length(pos) * perScreenPixelRatio);
return abs(dist) - radius;
}`),(e.lineVerticalPlaneEnabled||e.intersectsLineEnabled)&&n.code.add(O`bool pointIsWithinLine(vec3 pos, vec3 start, vec3 end) {
vec3 dir = end - start;
float t2 = dot(dir, pos - start);
float l2 = dot(dir, dir);
return t2 >= 0.0 && t2 <= l2;
}`),n.main.add(O`vec3 pos;
vec3 normal;
float angleCutoffAdjust;
float depthDiscontinuityAlpha;
if (!laserlineReconstructFromDepth(pos, normal, angleCutoffAdjust, depthDiscontinuityAlpha)) {
fragColor = vec4(0.0);
return;
}
vec4 color = vec4(0.0);`),e.heightManifoldEnabled){n.uniforms.add(new P(`angleCutoff`,e=>B(e)),new j(`heightPlane`,(e,t)=>V(e.heightManifoldTarget,e.renderCoordsHelper.worldUpAtPosition(e.heightManifoldTarget,H),t.camera.viewMatrix)));let t=e.spherical?O`normalize(globalOrigin - pos)`:O`heightPlane.xyz`;n.main.add(O`
      vec2 angleCutoffAdjusted = angleCutoff - angleCutoffAdjust;
      // Fade out laserlines on flat surfaces
      float heightManifoldAlpha = 1.0 - smoothstep(angleCutoffAdjusted.x, angleCutoffAdjusted.y, abs(dot(normal, ${t})));
      vec4 heightManifoldColor = laserlineProfile(heightManifoldDistancePixels(heightPlane, pos));
      color = max(color, heightManifoldColor * heightManifoldAlpha);`)}return e.pointDistanceEnabled&&(n.uniforms.add(new P(`angleCutoff`,e=>B(e)),new j(`pointDistanceSphere`,(e,t)=>Pe(e,t))),n.main.add(O`float pointDistanceSphereDistance = sphereDistancePixels(pointDistanceSphere, pos);
vec4 pointDistanceSphereColor = laserlineProfile(pointDistanceSphereDistance);
float pointDistanceSphereAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, abs(dot(normal, normalize(pos - pointDistanceSphere.xyz))));
color = max(color, pointDistanceSphereColor * pointDistanceSphereAlpha);`)),e.lineVerticalPlaneEnabled&&(n.uniforms.add(new P(`angleCutoff`,e=>B(e)),new j(`lineVerticalPlane`,(e,t)=>Fe(e,t)),new D(`lineVerticalStart`,(e,t)=>Ie(e,t)),new D(`lineVerticalEnd`,(e,t)=>Le(e,t))),n.main.add(O`if (pointIsWithinLine(pos, lineVerticalStart, lineVerticalEnd)) {
float lineVerticalDistance = planeDistancePixels(lineVerticalPlane, pos);
vec4 lineVerticalColor = laserlineProfile(lineVerticalDistance);
float lineVerticalAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, abs(dot(normal, lineVerticalPlane.xyz)));
color = max(color, lineVerticalColor * lineVerticalAlpha);
}`)),e.intersectsLineEnabled&&(n.uniforms.add(new P(`angleCutoff`,e=>B(e)),new D(`intersectsLineStart`,(e,t)=>m(H,e.lineStartWorld,t.camera.viewMatrix)),new D(`intersectsLineEnd`,(e,t)=>m(H,e.lineEndWorld,t.camera.viewMatrix)),new D(`intersectsLineDirection`,(e,t)=>(u(U,e.intersectsLineSegment.vector),U[3]=0,g(H,se(U,U,t.camera.viewMatrix)))),new M(`intersectsLineRadius`,e=>e.intersectsLineRadius)),n.main.add(O`if (pointIsWithinLine(pos, intersectsLineStart, intersectsLineEnd)) {
float intersectsLineDistance = lineDistancePixels(intersectsLineStart, intersectsLineDirection, intersectsLineRadius, pos);
vec4 intersectsLineColor = laserlineProfile(intersectsLineDistance);
float intersectsLineAlpha = 1.0 - smoothstep(angleCutoff.x, angleCutoff.y, 1.0 - abs(dot(normal, intersectsLineDirection)));
color = max(color, intersectsLineColor * intersectsLineAlpha);
}`)),n.main.add(O`fragColor = laserlineOutput(color * depthDiscontinuityAlpha);`),t}function B(e){return o(Re,Math.cos(e.angleCutoff),Math.cos(Math.max(0,e.angleCutoff-a(2))))}function Pe(e,t){return m(K,e.pointDistanceOrigin,t.camera.viewMatrix),K[3]=p(e.pointDistanceOrigin,e.pointDistanceTarget),K}function Fe(e,t){let n=oe(e.lineVerticalPlaneSegment,.5,H),r=e.renderCoordsHelper.worldUpAtPosition(n,ze),i=g(W,e.lineVerticalPlaneSegment.vector),a=te(H,r,i);return g(a,a),V(e.lineVerticalPlaneSegment.origin,a,t.camera.viewMatrix)}function Ie(e,t){let n=u(H,e.lineVerticalPlaneSegment.origin);return e.renderCoordsHelper.setAltitude(n,0),m(n,n,t.camera.viewMatrix)}function Le(e,t){let n=ee(H,e.lineVerticalPlaneSegment.origin,e.lineVerticalPlaneSegment.vector);return e.renderCoordsHelper.setAltitude(n,0),m(n,n,t.camera.viewMatrix)}function V(e,t,n){return m(G,e,n),u(U,t),U[3]=0,se(U,U,n),ce(G,U,Be)}var Re=_(),H=s(),U=v(),ze=s(),W=s(),G=s(),Be=le(),K=v(),Ve=Object.freeze(Object.defineProperty({__proto__:null,build:z,defaultAngleCutoff:R},Symbol.toStringTag,{value:`Module`}));function q(e){let t=new I;t.include(L,e);let{vertex:n,fragment:r}=t;n.uniforms.add(new ke(`modelView`,(e,{camera:t})=>ie(Ue,t.viewMatrix,e.origin)),new Ce(`proj`,({camera:e})=>e.projectionMatrix),new M(`glowWidth`,(e,{camera:t})=>e.glowWidth*t.pixelRatio),new Ee(`pixelToNDC`,({camera:e})=>o(He,2/e.fullViewport[2],2/e.fullViewport[3]))),t.attributes.add(`start`,`vec3`),t.attributes.add(`end`,`vec3`),e.spherical&&(t.attributes.add(`startUp`,`vec3`),t.attributes.add(`endUp`,`vec3`)),t.attributes.add(`extrude`,`vec2`),t.varyings.add(`uv`,`vec2`),t.varyings.add(`vViewStart`,`vec3`),t.varyings.add(`vViewEnd`,`vec3`),t.varyings.add(`vViewSegmentNormal`,`vec3`),t.varyings.add(`vViewStartNormal`,`vec3`),t.varyings.add(`vViewEndNormal`,`vec3`);let i=!e.spherical;return n.main.add(O`
    vec3 pos = mix(start, end, extrude.x);

    vec4 viewPos = modelView * vec4(pos, 1);
    vec4 projPos = proj * viewPos;
    vec2 ndcPos = projPos.xy / projPos.w;

    // in planar we hardcode the up vectors to be Z-up */
    ${k(i,O`vec3 startUp = vec3(0, 0, 1);`)}
    ${k(i,O`vec3 endUp = vec3(0, 0, 1);`)}

    // up vector corresponding to the location of the vertex, selecting either startUp or endUp */
    vec3 up = extrude.y * mix(startUp, endUp, extrude.x);
    vec3 viewUp = (modelView * vec4(up, 0)).xyz;

    vec4 projPosUp = proj * vec4(viewPos.xyz + viewUp, 1);
    vec2 projUp = normalize(projPosUp.xy / projPosUp.w - ndcPos);

    // extrude ndcPos along projUp to the edge of the screen
    vec2 lxy = abs(sign(projUp) - ndcPos);
    ndcPos += length(lxy) * projUp;

    vViewStart = (modelView * vec4(start, 1)).xyz;
    vViewEnd = (modelView * vec4(end, 1)).xyz;

    vec3 viewStartEndDir = vViewEnd - vViewStart;

    vec3 viewStartUp = (modelView * vec4(startUp, 0)).xyz;

    // the normal of the plane that aligns with the segment and the up vector
    vViewSegmentNormal = normalize(cross(viewStartUp, viewStartEndDir));

    // the normal orthogonal to the segment normal and the start up vector
    vViewStartNormal = -normalize(cross(vViewSegmentNormal, viewStartUp));

    // the normal orthogonal to the segment normal and the end up vector
    vec3 viewEndUp = (modelView * vec4(endUp, 0)).xyz;
    vViewEndNormal = normalize(cross(vViewSegmentNormal, viewEndUp));

    // Add enough padding in the X screen space direction for "glow"
    float xPaddingPixels = sign(dot(vViewSegmentNormal, viewPos.xyz)) * (extrude.x * 2.0 - 1.0) * glowWidth;
    ndcPos.x += xPaddingPixels * pixelToNDC.x;

    // uv is used to read back depth to reconstruct the position at the fragment
    uv = ndcPos * 0.5 + 0.5;

    gl_Position = vec4(ndcPos, 0, 1);
  `),r.uniforms.add(new A(`perScreenPixelRatio`,e=>e.camera.perScreenPixelRatio)),r.code.add(O`float planeDistance(vec3 planeNormal, vec3 planeOrigin, vec3 pos) {
return dot(planeNormal, pos - planeOrigin);
}
float segmentDistancePixels(vec3 segmentNormal, vec3 startNormal, vec3 endNormal, vec3 pos, vec3 start, vec3 end) {
float distSegmentPlane = planeDistance(segmentNormal, start, pos);
float distStartPlane = planeDistance(startNormal, start, pos);
float distEndPlane = planeDistance(endNormal, end, pos);
float dist = max(max(distStartPlane, distEndPlane), abs(distSegmentPlane));
float width = fwidth(distSegmentPlane);
float maxPixelDistance = length(pos) * perScreenPixelRatio * 2.0;
float pixelDist = dist / min(width, maxPixelDistance);
return abs(pixelDist);
}`),r.main.add(O`fragColor = vec4(0.0);
vec3 dEndStart = vViewEnd - vViewStart;
if (dot(dEndStart, dEndStart) < 1e-5) {
return;
}
vec3 pos;
vec3 normal;
float angleCutoffAdjust;
float depthDiscontinuityAlpha;
if (!laserlineReconstructFromDepth(pos, normal, angleCutoffAdjust, depthDiscontinuityAlpha)) {
return;
}
float distance = segmentDistancePixels(
vViewSegmentNormal,
vViewStartNormal,
vViewEndNormal,
pos,
vViewStart,
vViewEnd
);
vec4 color = laserlineProfile(distance);
float alpha = (1.0 - smoothstep(0.995 - angleCutoffAdjust, 0.999 - angleCutoffAdjust, abs(dot(normal, vViewSegmentNormal))));
fragColor = laserlineOutput(color * alpha * depthDiscontinuityAlpha);`),t}var He=_(),Ue=ne(),We=Object.freeze(Object.defineProperty({__proto__:null,build:q},Symbol.toStringTag,{value:`Module`})),Ge=class extends xe{constructor(){super(...arguments),this.innerColor=l(1,1,1),this.innerWidth=1,this.glowColor=l(1,.5,0),this.glowWidth=8,this.glowFalloff=8,this.globalAlpha=.75,this.globalAlphaContrastBoost=2,this.angleCutoff=a(6),this.pointDistanceOrigin=s(),this.pointDistanceTarget=s(),this.lineVerticalPlaneSegment=y(),this.intersectsLineSegment=y(),this.intersectsLineRadius=3,this.heightManifoldTarget=s(),this.lineStartWorld=s(),this.lineEndWorld=s()}},J=class extends E{constructor(){super(...arguments),this.shader=new T(Ve,()=>i(()=>import(`./Laserline.glsl-D_73Ypfx.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23])))}};J=e([n(`esri.views.3d.webgl-engine.effects.laserlines.LaserlineTechnique`)],J);var Ke=class extends Ge{constructor(){super(...arguments),this.origin=s()}},Y=class extends E{constructor(e,t){super(e,t,C(t.spherical?qe:Je)),this.shader=new T(We,()=>i(()=>import(`./LaserlinePath.glsl-BCgxry7s.js`),__vite__mapDeps([24,2,1,3,16,25,4,6,21,23,12,13,14])))}};Y=e([n(`esri.views.3d.webgl-engine.effects.laserlines.LaserlinePathTechnique`)],Y);var qe=w().vec3f(`start`).vec3f(`end`).vec2f(`extrude`).vec3f(`startUp`).vec3f(`endUp`),Je=w().vec3f(`start`).vec3f(`end`).vec2f(`extrude`),Ye=class{constructor(e){this._renderCoordsHelper=e,this._origin=s(),this._dirty=!1,this._count=0}set vertices(e){let t=re(3*e.length),n=0;for(let r of e)t[n++]=r[0],t[n++]=r[1],t[n++]=r[2];this.buffers=[t]}set buffers(e){if(this._buffers=e,this._buffers.length>0){let e=this._buffers[0],t=3*Math.floor(e.length/3/2);d(this._origin,e[t],e[t+1],e[t+2])}else d(this._origin,0,0,0);this._dirty=!0}get origin(){return this._origin}draw(e){let t=this._ensureVAO(e);t!=null&&(e.bindVAO(t),e.drawArrays(_e.TRIANGLES,0,this._count))}dispose(){this._vao!=null&&this._vao.dispose()}get _layout(){return this._renderCoordsHelper.viewingMode===1?qe:Je}_ensureVAO(e){return this._buffers==null?null:(this._vao??=this._createVAO(e,this._buffers),this._ensureVertexData(this._vao,this._buffers),this._vao)}_createVAO(e,t){let n=this._createDataBuffer(t);return this._dirty=!1,new ye(e,new ve(e,C(this._layout),n))}_ensureVertexData(e,t){if(!this._dirty)return;let n=this._createDataBuffer(t);e.buffer()?.setData(n),this._dirty=!1}_createDataBuffer(e){let t=e.reduce((e,t)=>e+Xe(t),0);this._count=t;let n=this._layout.createBuffer(t),r=this._origin,i=0,a=0,o=`startUp`in n?this._setUpVectors.bind(this,n):void 0;for(let t of e){for(let e=0;e<t.length;e+=3){let s=d(Qe,t[e],t[e+1],t[e+2]);e===0?a=this._renderCoordsHelper.getAltitude(s):this._renderCoordsHelper.setAltitude(s,a);let c=i+2*e;o?.(e,c,t,s);let l=h(Qe,s,r);if(e<t.length-3){for(let e=0;e<6;e++)n.start.setVec(c+e,l);n.extrude.setValues(c,0,-1),n.extrude.setValues(c+1,1,-1),n.extrude.setValues(c+2,1,1),n.extrude.setValues(c+3,0,-1),n.extrude.setValues(c+4,1,1),n.extrude.setValues(c+5,0,1)}if(e>0)for(let e=-6;e<0;e++)n.end.setVec(c+e,l)}i+=Xe(t)}return n.buffer}_setUpVectors(e,t,n,r,i){let a=this._renderCoordsHelper.worldUpAtPosition(i,Ze);if(t<r.length-3)for(let t=0;t<6;t++)e.startUp.setVec(n+t,a);if(t>0)for(let t=-6;t<0;t++)e.endUp.setVec(n+t,a)}};function Xe(e){return 3*(2*(e.length/3-1))}var Ze=s(),Qe=s(),X=class extends we{constructor(){super(...arguments),this.contrastControlEnabled=!1,this.spherical=!1}};e([N()],X.prototype,`contrastControlEnabled`,void 0),e([N()],X.prototype,`spherical`,void 0);var Z=class extends X{constructor(){super(...arguments),this.heightManifoldEnabled=!1,this.pointDistanceEnabled=!1,this.lineVerticalPlaneEnabled=!1,this.intersectsLineEnabled=!1}};e([N()],Z.prototype,`heightManifoldEnabled`,void 0),e([N()],Z.prototype,`pointDistanceEnabled`,void 0),e([N()],Z.prototype,`lineVerticalPlaneEnabled`,void 0),e([N()],Z.prototype,`intersectsLineEnabled`,void 0);var Q=class extends de{get requireGeometryDepth(){return!0}constructor(e){super(e),this.isDecoration=!0,this.produces=x.LASERLINES,this.consumes={required:[x.LASERLINES,`normals`]},this._configuration=new Z,this._pathTechniqueConfiguration=new X,this._intersectsLineInfinite=!1,this._pathVerticalPlaneEnabled=!1,this._passParameters=new Ke,this._blit=new Me(e.view.stage.renderView.techniques,2)}initialize(){this._passParameters.renderCoordsHelper=this.view.renderCoordsHelper,this._configuration.spherical=this.view.state.viewingMode===1,this._configuration.contrastControlEnabled=this.contrastControlEnabled,this._pathTechniqueConfiguration.spherical=this.view.state.viewingMode===1,this._pathTechniqueConfiguration.contrastControlEnabled=this.contrastControlEnabled}destroy(){this._pathVerticalPlaneData=t(this._pathVerticalPlaneData)}get heightManifoldEnabled(){return this._configuration.heightManifoldEnabled}set heightManifoldEnabled(e){this._configuration.heightManifoldEnabled!==e&&(this._configuration.heightManifoldEnabled=e,this.requestRender(1))}get heightManifoldTarget(){return this._passParameters.heightManifoldTarget}set heightManifoldTarget(e){u(this._passParameters.heightManifoldTarget,e),this.requestRender(1)}get pointDistanceEnabled(){return this._configuration.pointDistanceEnabled}set pointDistanceEnabled(e){e!==this._configuration.pointDistanceEnabled&&(this._configuration.pointDistanceEnabled=e,this.requestRender(1))}get pointDistanceTarget(){return this._passParameters.pointDistanceTarget}set pointDistanceTarget(e){u(this._passParameters.pointDistanceTarget,e),this.requestRender(1)}get pointDistanceOrigin(){return this._passParameters.pointDistanceOrigin}set pointDistanceOrigin(e){u(this._passParameters.pointDistanceOrigin,e),this.requestRender(1)}get lineVerticalPlaneEnabled(){return this._configuration.lineVerticalPlaneEnabled}set lineVerticalPlaneEnabled(e){e!==this._configuration.lineVerticalPlaneEnabled&&(this._configuration.lineVerticalPlaneEnabled=e,this.requestRender(1))}get lineVerticalPlaneSegment(){return this._passParameters.lineVerticalPlaneSegment}set lineVerticalPlaneSegment(e){b(e,this._passParameters.lineVerticalPlaneSegment),this.requestRender(1)}get intersectsLineEnabled(){return this._configuration.intersectsLineEnabled}set intersectsLineEnabled(e){e!==this._configuration.intersectsLineEnabled&&(this._configuration.intersectsLineEnabled=e,this.requestRender(1))}get intersectsLineSegment(){return this._passParameters.intersectsLineSegment}set intersectsLineSegment(e){b(e,this._passParameters.intersectsLineSegment),this.requestRender(1)}get intersectsLineInfinite(){return this._intersectsLineInfinite}set intersectsLineInfinite(e){e!==this._intersectsLineInfinite&&(this._intersectsLineInfinite=e,this.requestRender(1))}get pathVerticalPlaneEnabled(){return this._pathVerticalPlaneEnabled}set pathVerticalPlaneEnabled(e){e!==this._pathVerticalPlaneEnabled&&(this._pathVerticalPlaneEnabled=e,this._pathVerticalPlaneData!=null&&this.requestRender(1))}set pathVerticalPlaneVertices(e){this._pathVerticalPlaneData??=new Ye(this._passParameters.renderCoordsHelper),this._pathVerticalPlaneData.vertices=e,this.pathVerticalPlaneEnabled&&this.requestRender(1)}set pathVerticalPlaneBuffers(e){this._pathVerticalPlaneData??=new Ye(this._passParameters.renderCoordsHelper),this._pathVerticalPlaneData.buffers=e,this.pathVerticalPlaneEnabled&&this.requestRender(1)}setParameters(e){be(this._passParameters,e)&&this.requestRender(1)}precompile(){this.techniques.precompile(J,this._configuration),this.contrastControlEnabled&&this._blit.precompile(),this.pathVerticalPlaneEnabled&&this._pathVerticalPlaneData&&this.techniques.precompile(Y,this._pathTechniqueConfiguration)}render(e){let t=e.find(({name:e})=>e===this.produces);if(this.isDecoration&&!this.bindParameters.decorations)return t;let n=this.renderingContext,r=e.find(({name:e})=>e===`normals`);if(this._passParameters.normals=r?.getTexture(),!this.contrastControlEnabled)return n.bindFramebuffer(t.fbo),this._renderLaserLines(),t;this._passParameters.colors=t.getTexture();let i=this.fboCache.acquire(t.fbo.width,t.fbo.height,`laser lines`);return n.bindFramebuffer(i.fbo),n.setClearColor(0,0,0,0),n.clear(16640),this._renderLaserLines(),n.unbindTexture(t.getTexture()),this._blit.blend(i,t,this.bindParameters)||this.requestRender(1),i.release(),t}_renderLaserLines(){(this.heightManifoldEnabled||this.pointDistanceEnabled||this.lineVerticalPlaneSegment||this.intersectsLineEnabled)&&this._renderUnified(),this.pathVerticalPlaneEnabled&&this._renderPath()}_renderUnified(){if(!this._updatePassParameters())return;let e=this.techniques.getCompiled(J,this._configuration);if(e){let t=this.renderingContext;t.setDrawBuffers([S]),t.bindTechnique(e,this.bindParameters,this._passParameters),t.screen.draw()}else this.requestRender(1)}_renderPath(){if(this._pathVerticalPlaneData==null)return;let e=this.techniques.get(Y,this._pathTechniqueConfiguration);if(e.compiled){let t=this.renderingContext;this._passParameters.origin=this._pathVerticalPlaneData.origin,t.setDrawBuffers([S]),t.bindTechnique(e,this.bindParameters,this._passParameters),this._pathVerticalPlaneData.draw(t)}else this.requestRender(1)}_updatePassParameters(){if(!this.intersectsLineEnabled)return!0;let e=this.bindParameters.camera,t=this._passParameters;if(this._intersectsLineInfinite){if(me(ue(t.intersectsLineSegment.origin,t.intersectsLineSegment.vector),$),$.c0=-Number.MAX_VALUE,!he(e.frustum,$))return!1;pe($,t.lineStartWorld),fe($,t.lineEndWorld)}else u(t.lineStartWorld,t.intersectsLineSegment.origin),ee(t.lineEndWorld,t.intersectsLineSegment.origin,t.intersectsLineSegment.vector);return!0}get test(){}};e([r({constructOnly:!0})],Q.prototype,`contrastControlEnabled`,void 0),e([r()],Q.prototype,`isDecoration`,void 0),e([r()],Q.prototype,`produces`,void 0),e([r()],Q.prototype,`consumes`,void 0),Q=e([n(`esri.views.3d.webgl-engine.effects.laserlines.LaserLineRenderer`)],Q);var $=ge(),$e=class extends Ne{constructor(e){super(e),this._angleCutoff=R,this._style={},this._heightManifoldTarget=s(),this._heightManifoldEnabled=!1,this._intersectsLine=y(),this._intersectsLineEnabled=!1,this._intersectsLineInfinite=!1,this._lineVerticalPlaneSegment=null,this._pathVerticalPlaneBuffers=null,this._pointDistanceLine=null,this.applyProperties(e)}get testData(){}createResources(){this._ensureRenderer()}destroyResources(){this._disposeRenderer()}updateVisibility(){this._syncRenderer(),this._syncHeightManifold(),this._syncIntersectsLine(),this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance()}get angleCutoff(){return this._angleCutoff}set angleCutoff(e){this._angleCutoff!==e&&(this._angleCutoff=e,this._syncAngleCutoff())}get style(){return this._style}set style(e){this._style=e,this._syncStyle()}get heightManifoldTarget(){return this._heightManifoldEnabled?this._heightManifoldTarget:null}set heightManifoldTarget(e){e==null?this._heightManifoldEnabled=!1:(u(this._heightManifoldTarget,e),this._heightManifoldEnabled=!0),this._syncRenderer(),this._syncHeightManifold()}set intersectsWorldUpAtLocation(e){if(e==null)return void(this.intersectsLine=null);let t=this.view.renderCoordsHelper.worldUpAtPosition(e,et);this.intersectsLine=ae(e,t),this.intersectsLineInfinite=!0}get intersectsLine(){return this._intersectsLineEnabled?this._intersectsLine:null}set intersectsLine(e){e==null?this._intersectsLineEnabled=!1:(b(e,this._intersectsLine),this._intersectsLineEnabled=!0),this._syncIntersectsLine(),this._syncRenderer()}get intersectsLineInfinite(){return this._intersectsLineInfinite}set intersectsLineInfinite(e){this._intersectsLineInfinite=e,this._syncIntersectsLineInfinite()}get lineVerticalPlaneSegment(){return this._lineVerticalPlaneSegment}set lineVerticalPlaneSegment(e){this._lineVerticalPlaneSegment=e==null?null:b(e),this._syncLineVerticalPlane(),this._syncRenderer()}get pathVerticalPlane(){return this._pathVerticalPlaneBuffers}set pathVerticalPlane(e){this._pathVerticalPlaneBuffers=e,this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance(),this._syncRenderer()}get pointDistanceLine(){return this._pointDistanceLine}set pointDistanceLine(e){this._pointDistanceLine=e==null?null:{origin:c(e.origin),target:e.target?c(e.target):null},this._syncPointDistance(),this._syncRenderer()}get isDecoration(){return this._isDecoration}set isDecoration(e){this._isDecoration=e,this._renderer&&(this._renderer.isDecoration=e)}_syncRenderer(){this.attached&&this.visible&&(this._intersectsLineEnabled||this._heightManifoldEnabled||this._pointDistanceLine!=null||this._pathVerticalPlaneBuffers!=null)?this._ensureRenderer():this._disposeRenderer()}_ensureRenderer(){this._renderer??(this._renderer=new Q({view:this.view,contrastControlEnabled:!0,isDecoration:this.isDecoration}),this._syncStyle(),this._syncHeightManifold(),this._syncIntersectsLine(),this._syncIntersectsLineInfinite(),this._syncPathVerticalPlane(),this._syncLineVerticalPlane(),this._syncPointDistance(),this._syncAngleCutoff())}_syncStyle(){this._renderer!=null&&this._renderer.setParameters(this._style)}_syncAngleCutoff(){this._renderer?.setParameters({angleCutoff:this._angleCutoff})}_syncHeightManifold(){this._renderer!=null&&(this._renderer.heightManifoldEnabled=this._heightManifoldEnabled&&this.visible,this._heightManifoldEnabled&&(this._renderer.heightManifoldTarget=this._heightManifoldTarget))}_syncIntersectsLine(){this._renderer!=null&&(this._renderer.intersectsLineEnabled=this._intersectsLineEnabled&&this.visible,this._intersectsLineEnabled&&(this._renderer.intersectsLineSegment=this._intersectsLine))}_syncIntersectsLineInfinite(){this._renderer!=null&&(this._renderer.intersectsLineInfinite=this._intersectsLineInfinite)}_syncPathVerticalPlane(){this._renderer!=null&&(this._renderer.pathVerticalPlaneEnabled=this._pathVerticalPlaneBuffers!=null&&this.visible,this._pathVerticalPlaneBuffers!=null&&(this._renderer.pathVerticalPlaneBuffers=this._pathVerticalPlaneBuffers))}_syncLineVerticalPlane(){this._renderer!=null&&(this._renderer.lineVerticalPlaneEnabled=this._lineVerticalPlaneSegment!=null&&this.visible,this._lineVerticalPlaneSegment!=null&&(this._renderer.lineVerticalPlaneSegment=this._lineVerticalPlaneSegment))}_syncPointDistance(){if(this._renderer==null)return;let e=this._pointDistanceLine,t=e!=null;this._renderer.pointDistanceEnabled=t&&e.target!=null&&this.visible,t&&(this._renderer.pointDistanceOrigin=e.origin,e.target!=null&&(this._renderer.pointDistanceTarget=e.target))}_disposeRenderer(){this._renderer!=null&&this.view.stage&&(this._renderer.destroy(),this._renderer=null)}forEachMaterial(){}},et=s();export{z as i,q as n,R as r,$e as t};