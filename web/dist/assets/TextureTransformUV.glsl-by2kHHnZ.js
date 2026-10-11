import{l as e}from"./mat3-BVwMHPeC.js";import{r as t,t as n}from"./mat3f64-B6tTkprt.js";import{c as r}from"./vec3f64-DIOQknMY.js";import{P as i}from"./vec3-CMyaVPVc.js";import{r as a}from"./mat4f64-E_FXCKxO.js";import{n as o}from"./MaterialUtil-D2ESw9-Q.js";import"./NoParameters-XZJ-8n06.js";import{n as s,t as c}from"./glsl-D85RBwKC.js";import{t as l}from"./Float3BindUniform-BmdF9XGj.js";import{n as u,r as d}from"./View.glsl-DjwuylqK.js";import{i as f}from"./Slice.glsl-DNk_1_Sk.js";import{t as p}from"./ObjectAndLayerIdColor.glsl-UC9jbvaT.js";import{t as m}from"./OutputHighlight.glsl-CfLvc4dK.js";import{a as h,n as g,r as _,t as v}from"./VisualVariables.glsl-C-_1q24O.js";import{t as y}from"./Matrix3PassUniform-B98tjNzt.js";import{t as b}from"./IntegerPassUniform-DN8CxRD1.js";import{t as x}from"./Texture2DPassUniform-CiCHIiok.js";import{i as S}from"./Emissions.glsl-BPJzLPVg.js";import{t as C}from"./NormalAttribute.glsl-C7jpaUvF.js";import{t as w}from"./DoublePrecision.glsl-7AQh4H5L.js";import{a as T,t as E}from"./DiscardOrAdjustAlpha.glsl-BmyZeaqn.js";import{n as D}from"./ForwardLinearDepthToWriteShadowMap.glsl-CVZkqchq.js";import{t as O}from"./Transform.glsl-ByRGlEcg.js";import{t as k}from"./Matrix4PassUniform-Bb5ATfS6.js";import{n as A,t as j}from"./doublePrecisionUtils-DAAZLysj.js";import{t as M}from"./OutputDepth.glsl-C_Yal9Dw.js";function N(e,t){t.instancedColor?(e.attributes.add(`instanceColor`,`vec4`),e.vertex.include(h),e.vertex.include(_),e.vertex.include(g),e.vertex.code.add(s`
      MaskedColor applyInstanceColor(MaskedColor color) {
        return multiplyMaskedColors( color, createMaskedFromUInt8NaNColor(${`instanceColor`}));
      }
    `)):e.vertex.code.add(s`MaskedColor applyInstanceColor(MaskedColor color) {
return color;
}`)}var P=n();function F(t,n){let{hasModelTransformation:r,instancedDoublePrecision:o,instanced:c,output:u,hasVertexTangents:f}=n;r&&(t.vertex.uniforms.add(new k(`model`,e=>e.modelTransformation??a)),t.vertex.uniforms.add(new y(`normalLocalOriginFromModel`,t=>(e(P,t.modelTransformation??a),P)))),c&&o&&(t.attributes.add(`instanceModelOriginHi`,`vec3`),t.attributes.add(`instanceModelOriginLo`,`vec3`),t.attributes.add(`instanceModel`,`mat3`),t.attributes.add(`instanceModelNormal`,`mat3`));let p=t.vertex;o&&(p.include(w),p.uniforms.add(new l(`viewOriginHi`,e=>j(i(I,e.camera.viewInverseTransposeMatrix[3],e.camera.viewInverseTransposeMatrix[7],e.camera.viewInverseTransposeMatrix[11]),I)),new l(`viewOriginLo`,e=>A(i(I,e.camera.viewInverseTransposeMatrix[3],e.camera.viewInverseTransposeMatrix[7],e.camera.viewInverseTransposeMatrix[11]),I)))),p.code.add(s`
    vec3 getVertexInLocalOriginSpace() {
      return ${r?o?`(model * vec4(instanceModel * localPosition().xyz, 1.0)).xyz`:`(model * localPosition()).xyz`:o?`instanceModel * localPosition().xyz`:`localPosition().xyz`};
    }

    vec3 subtractOrigin(vec3 _pos) {
      ${o?s`
          // Issue: (should be resolved now with invariant position) https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/56280
          vec3 originDelta = dpAdd(viewOriginHi, viewOriginLo, -instanceModelOriginHi, -instanceModelOriginLo);
          return _pos - originDelta;`:`return vpos;`}
    }
    `),p.code.add(s`
    vec3 dpNormal(vec4 _normal) {
      return normalize(${r?o?`normalLocalOriginFromModel * (instanceModelNormal * _normal.xyz)`:`normalLocalOriginFromModel * _normal.xyz`:o?`instanceModelNormal * _normal.xyz`:`_normal.xyz`});
    }
    `),u===4&&(d(p),p.code.add(s`
    vec3 dpNormalView(vec4 _normal) {
      return normalize((viewNormal * ${r?o?`vec4(normalLocalOriginFromModel * (instanceModelNormal * _normal.xyz), 1.0)`:`vec4(normalLocalOriginFromModel * _normal.xyz, 1.0)`:o?`vec4(instanceModelNormal * _normal.xyz, 1.0)`:`_normal`}).xyz);
    }
    `)),f&&p.code.add(s`
    vec4 dpTransformVertexTangent(vec4 _tangent) {
      ${r?o?`return vec4(normalLocalOriginFromModel * (instanceModelNormal * _tangent.xyz), _tangent.w);`:`return vec4(normalLocalOriginFromModel * _tangent.xyz, _tangent.w);`:o?`return vec4(instanceModelNormal * _tangent.xyz, _tangent.w);`:`return _tangent;`}
    }`)}var I=r();function L(e,t){e.varyings.add(`colorMixMode`,`int`),e.varyings.add(`opacityMixMode`,`int`),e.vertex.uniforms.add(new b(`symbolColorMixMode`,e=>o[e.colorMixMode])),t.hasSymbolColors?(e.vertex.include(h),e.vertex.include(_),e.vertex.include(g),e.attributes.add(`symbolColor`,`vec4`),e.vertex.code.add(s`
    MaskedColor applySymbolColor(MaskedColor color) {
      return multiplyMaskedColors(color, createMaskedFromUInt8NaNColor(${`symbolColor`}));
    }
  `)):e.vertex.code.add(s`MaskedColor applySymbolColor(MaskedColor color) {
return color;
}`),e.vertex.code.add(s`
    void forwardColorMixMode(bvec4 mask) {
      colorMixMode = mask.r ? ${s.int(o.ignore)} : symbolColorMixMode;
      opacityMixMode = mask.a ? ${s.int(o.ignore)} : symbolColorMixMode;
    }
  `)}function R(e,t){let{vertex:n,fragment:r,varyings:i}=e,{hasColorTexture:a,alphaDiscardMode:o}=t,l=a&&o!==1,{output:d,normalType:h,hasColorTextureTransform:g}=t;switch(d){case 3:u(n,t),e.include(O),r.include(f,t),e.include(S,t),l&&r.uniforms.add(new x(`tex`,e=>e.texture)),n.main.add(s`vpos = getVertexInLocalOriginSpace();
vpos = subtractOrigin(vpos);
vpos = addVerticalOffset(vpos, localOrigin);
gl_Position = transformPosition(proj, view, vpos);
forwardTextureCoordinates();`),e.include(E,t),r.main.add(s`
        discardBySlice(vpos);
        ${c(l,s`vec4 texColor = texture(tex, ${g?`colorUV`:`vuv0`});
                discardOrAdjustAlpha(texColor);`)}`);break;case 5:case 6:case 7:case 8:case 11:u(n,t),e.include(O),e.include(S,t),e.include(v,t),e.include(M,t),r.include(f,t),e.include(p,t),D(e),i.add(`depth`,`float`,{invariant:!0}),l&&r.uniforms.add(new x(`tex`,e=>e.texture)),n.main.add(s`vpos = getVertexInLocalOriginSpace();
vpos = subtractOrigin(vpos);
vpos = addVerticalOffset(vpos, localOrigin);
gl_Position = transformPositionWithDepth(proj, view, vpos, nearFar, depth);
forwardTextureCoordinates();
forwardObjectAndLayerIdColor();`),e.include(E,t),r.main.add(s`
        discardBySlice(vpos);
        ${c(l,s`vec4 texColor = texture(tex, ${g?`colorUV`:`vuv0`});
               discardOrAdjustAlpha(texColor);`)}
        ${d===11?s`outputObjectAndLayerIdColor();`:s`outputDepth(depth);`}`);break;case 4:{u(n,t),e.include(O),e.include(C,t),e.include(T,t),e.include(S,t),e.include(v,t),l&&r.uniforms.add(new x(`tex`,e=>e.texture)),h===2&&i.add(`vPositionView`,`vec3`,{invariant:!0});let a=h===0||h===1;n.main.add(s`
        vpos = getVertexInLocalOriginSpace();
        ${a?s`vNormalWorld = dpNormalView(vvLocalNormal(normalModel()));`:s`vPositionView = (view * vec4(vpos, 1.0)).xyz;`}
        vpos = subtractOrigin(vpos);
        vpos = addVerticalOffset(vpos, localOrigin);
        gl_Position = transformPosition(proj, view, vpos);
        forwardTextureCoordinates();`),r.include(f,t),e.include(E,t),r.main.add(s`
        discardBySlice(vpos);
        ${c(l,s`vec4 texColor = texture(tex, ${g?`colorUV`:`vuv0`});
                discardOrAdjustAlpha(texColor);`)}

        ${h===2?s`vec3 normal = screenDerivativeNormal(vPositionView);`:s`vec3 normal = normalize(vNormalWorld);
                    if (gl_FrontFacing == false){
                      normal = -normal;
                    }`}
        fragColor = vec4(0.5 + 0.5 * normal, 1.0);`);break}case 10:u(n,t),e.include(O),e.include(S,t),e.include(v,t),l&&r.uniforms.add(new x(`tex`,e=>e.texture)),n.main.add(s`vpos = getVertexInLocalOriginSpace();
vpos = subtractOrigin(vpos);
vpos = addVerticalOffset(vpos, localOrigin);
gl_Position = transformPosition(proj, view, vpos);
forwardTextureCoordinates();`),r.include(f,t),e.include(E,t),e.include(m,t),r.main.add(s`
        discardBySlice(vpos);
        ${c(l,s`vec4 texColor = texture(tex, ${g?`colorUV`:`vuv0`});
                discardOrAdjustAlpha(texColor);`)}
        calculateOcclusionAndOutputHighlight();`)}}function z(e,n){n.hasColorTextureTransform?(e.varyings.add(`colorUV`,`vec2`),e.vertex.uniforms.add(new y(`colorTextureTransformMatrix`,e=>e.colorTextureTransformMatrix??t)).code.add(s`void forwardColorUV(){
colorUV = (colorTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)):e.vertex.code.add(s`void forwardColorUV(){}`)}function B(e,n){n.hasNormalTextureTransform&&n.textureCoordinateType!==0?(e.varyings.add(`normalUV`,`vec2`),e.vertex.uniforms.add(new y(`normalTextureTransformMatrix`,e=>e.normalTextureTransformMatrix??t)).code.add(s`void forwardNormalUV(){
normalUV = (normalTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)):e.vertex.code.add(s`void forwardNormalUV(){}`)}function V(e,n){n.hasEmissionTextureTransform&&n.textureCoordinateType!==0?(e.varyings.add(`emissiveUV`,`vec2`),e.vertex.uniforms.add(new y(`emissiveTextureTransformMatrix`,e=>e.emissiveTextureTransformMatrix??t)).code.add(s`void forwardEmissiveUV(){
emissiveUV = (emissiveTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)):e.vertex.code.add(s`void forwardEmissiveUV(){}`)}function H(e,n){n.hasOcclusionTextureTransform&&n.textureCoordinateType!==0?(e.varyings.add(`occlusionUV`,`vec2`),e.vertex.uniforms.add(new y(`occlusionTextureTransformMatrix`,e=>e.occlusionTextureTransformMatrix??t)).code.add(s`void forwardOcclusionUV(){
occlusionUV = (occlusionTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)):e.vertex.code.add(s`void forwardOcclusionUV(){}`)}function U(e,n){n.hasMetallicRoughnessTextureTransform&&n.textureCoordinateType!==0?(e.varyings.add(`metallicRoughnessUV`,`vec2`),e.vertex.uniforms.add(new y(`metallicRoughnessTextureTransformMatrix`,e=>e.metallicRoughnessTextureTransformMatrix??t)).code.add(s`void forwardMetallicRoughnessUV(){
metallicRoughnessUV = (metallicRoughnessTextureTransformMatrix * vec3(vuv0, 1.0)).xy;
}`)):e.vertex.code.add(s`void forwardMetallicRoughnessUV(){}`)}export{U as a,F as c,B as i,N as l,H as n,R as o,V as r,L as s,z as t};