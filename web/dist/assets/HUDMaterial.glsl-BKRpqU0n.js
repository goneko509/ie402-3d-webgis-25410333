import{D as e,w as t}from"./vec2-C5dJMieJ.js";import{o as n}from"./vec2f64-IO40D2xB.js";import{r}from"./vec4f64-CjgU5APJ.js";import{f as i}from"./ShaderOutput-BpkC-wrv.js";import{n as a,t as o}from"./glsl-D85RBwKC.js";import{n as s,r as c,t as l}from"./ScreenSizePerspective.glsl-DCyTAQMw.js";import{i as u}from"./View.glsl-DjwuylqK.js";import{t as d}from"./Float4PassUniform-Cu2daSgY.js";import{t as f}from"./Float4BindUniform-CcjALdTT.js";import{t as p}from"./FloatPassUniform-DeUP8HjM.js";import{n as m,t as h}from"./AlignPixel.glsl-CIksR2ML.js";import{n as g}from"./Slice.glsl-DNk_1_Sk.js";import{t as _}from"./ObjectAndLayerIdColor.glsl-UC9jbvaT.js";import{t as v}from"./OutputHighlight.glsl-CfLvc4dK.js";import{t as y}from"./Texture2DBindUniform-4_yYNByJ.js";import{t as b}from"./ReadDepth.glsl-Ca_0z8Pl.js";import{t as x}from"./PositionOutsideClipSpace-CLdt_M-O.js";import{t as S}from"./VisualVariables.glsl-C-_1q24O.js";import{t as ee}from"./ColorConversion.glsl-C9xFjUmo.js";import{t as C}from"./Float2PassUniform-BYZ61_RB.js";import{t as w}from"./IntegerPassUniform-DN8CxRD1.js";import{t as T}from"./Texture2DPassUniform-CiCHIiok.js";import{t as E}from"./ShaderBuilder-DxA0HNjK.js";import{n as D}from"./FocusAreaColorNode-D3ap_nZd.js";import{t as O}from"./alphaCutoff.glsl-BK3hw-re.js";import{t as k}from"./OutputColorHighlightOLID.glsl-BPsfn2UR.js";var A=e=>e?D[e]:0;function j(t){let n=new E;n.include(m,t),n.vertex.include(g,t);let{output:D,hasOcclusionTexture:j,signedDistanceFieldEnabled:F,pixelSnappingEnabled:L,hasEmission:R,hasScreenSizePerspective:z,debugDrawLabelBorder:B,hasVVSize:V,hasVVColor:H,hasRotation:U,occludedFragmentFade:W,sampleSignedDistanceFieldTexelCenter:G,hasVertexColor:K,hasVertexSize:q,hasVertexRotation:J,hasVertexUVi:Y}=t;n.include(s),n.include(S,t),n.include(_,t),n.include(k,t);let{vertex:X,fragment:Z}=n;Z.include(ee),Z.code.add(a`
    vec4 applyFocusAreaStyle(vec4 color, int style) {
      const float factor = 0.46;
      const float factorBright = 0.32;

      if (style == ${a.int(0)}) {
        float luma = (color.r + color.g + color.b) / 3.0;
        float bright = luma * (1.0 - 0.6 * factorBright) + 0.6 * factorBright * color.a;
        float brightScaled = bright * factorBright;
        return vec4(brightScaled, brightScaled, brightScaled, color.a * factorBright);
      }

      float darkScaled = factor * factor;
      return vec4(color.rgb * darkScaled, color.a * factor);
    }
  `),n.varyings.add(`vcolor`,`vec4`),n.varyings.add(`vtc`,`vec2`),n.varyings.add(`vsize`,`vec2`);let Q=D===10;X.uniforms.add(new f(`viewport`,e=>e.camera.fullViewport),new C(`screenOffset`,(t,n)=>e(P,2*t.screenOffset[0]*n.camera.pixelRatio,2*t.screenOffset[1]*n.camera.pixelRatio)),new C(`anchorPosition`,e=>N(e)),new d(`materialColor`,({color:e})=>e),new p(`materialRotation`,e=>e.rotation),new C(`materialSize`,e=>e.size),new T(`tex`,e=>e.texture)),u(X),F&&(X.uniforms.add(new d(`outlineColor`,e=>e.outlineColor)),Z.uniforms.add(new d(`outlineColor`,e=>M(e)?e.outlineColor:r),new p(`outlineSize`,e=>M(e)?e.outlineSize:0))),L&&X.include(h),z&&(c(X),l(X)),B&&n.varyings.add(`debugBorderCoords`,`vec4`),n.attributes.add(`uv0`,`vec2`),Y&&n.attributes.add(`uvi`,`vec4`),K&&n.attributes.add(`color`,`vec4`),q&&n.attributes.add(`size`,`vec2`),J&&n.attributes.add(`rotation`,`float`),(V||H)&&n.attributes.add(`featureAttribute`,`vec4`),X.main.add(a`
    ProjectHUDAux projectAux;
    vec4 posProj = projectPositionHUD(projectAux);
    forwardObjectAndLayerIdColor();

    if (rejectBySlice(projectAux.posModel)) {
      gl_Position = ${x};
      return;
    }

    vec2 vertexSize = materialSize${o(q,` * size`)};
    vec2 inputSize;
    ${o(z,a`
        inputSize = screenSizePerspectiveScaleVec2(vertexSize, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspective);
        vec2 screenOffsetScaled = screenSizePerspectiveScaleVec2(screenOffset, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);`,a`
        inputSize = vertexSize;
        vec2 screenOffsetScaled = screenOffset;`)}
    ${o(V,a`inputSize *= vvScale(featureAttribute).xx;`)}

    vec2 combinedSize = inputSize * pixelRatio;
    vec4 quadOffset = vec4(0.0);
  `);let te=a`
  ${o(Y,a`
    vec2 texSize = vec2(textureSize(tex, 0));
    vec2 uv = mix(uvi.xy, uvi.zw, bvec2(uv0)) / texSize;
    `,a`
    vec2 uv = mix(vec2(0.), vec2(1.), bvec2(uv0));
    `)}

    quadOffset.xy = (uv0 - anchorPosition) * 2.0 * combinedSize;

    ${o(U,a`
        float angle = radians(materialRotation${o(J,` + rotation`)});
        float cosAngle = cos(angle);
        float sinAngle = sin(angle);
        mat2 rotate = mat2(cosAngle, -sinAngle, sinAngle,  cosAngle);

        quadOffset.xy = rotate * quadOffset.xy;
      `)}

    quadOffset.xy = (quadOffset.xy + screenOffsetScaled) / viewport.zw * posProj.w;
  `,ne=L?F?a`posProj = alignToPixelOrigin(posProj, viewport.zw) + quadOffset;`:a`posProj += quadOffset;
if (inputSize.x == vertexSize.x) {
posProj = alignToPixelOrigin(posProj, viewport.zw);
}`:a`posProj += quadOffset;`;X.include(O),X.main.add(a`
    ${te}
    ${H?`vcolor = interpolateVVColor(featureAttribute.y) * materialColor;`:K?`vcolor = color * materialColor;`:`vcolor = materialColor;`}

    ${o(D===11,a`vcolor.a = 1.0;`)}

    bool alphaDiscard = vcolor.a < alphaCutoff;
    ${o(F,`alphaDiscard = alphaDiscard && outlineColor.a < alphaCutoff;`)}
    if (alphaDiscard) {
      // "early discard" if both symbol color (= fill) and outline color (if applicable) are transparent
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
      return;
    } else {
      ${ne}
      gl_Position = posProj;
    }

    vtc = uv;

    ${o(B,a`debugBorderCoords = vec4(uv0, 1.5 / combinedSize);`)}
    vsize = inputSize;
  `);let $=i(D)&&t.hasFocusAreaStyle&&!t.draped;switch(Z.uniforms.add(new T(`tex`,e=>e.texture)),$&&Z.uniforms.add(new w(`focusAreaStyle`,e=>A(e.focusAreaStyle))),W&&!Q&&(Z.include(b),Z.uniforms.add(new y(`depthMap`,e=>e.mainDepth),new p(`occludedOpacity`,e=>e.occludedFragmentOpacity?.value??1))),j&&Z.uniforms.add(new y(`texOcclusion`,e=>e.hudOcclusion?.attachment)),B?Z.main.add(`
        float isBorder = float(any(lessThan(debugBorderCoords.xy, debugBorderCoords.zw)) || any(greaterThan(debugBorderCoords.xy, 1.0 - debugBorderCoords.zw)));
        // don't discard fragments on debug border
        float textureAlphaCutoff = isBorder > 0.0 ? 0.0 : alphaCutoff;
      `):Z.main.add(`float textureAlphaCutoff = alphaCutoff;`),Z.main.add(`vec2 samplePos = vtc;`),G&&Z.main.add(a`float txSize = float(textureSize(tex, 0).x);
float texelSize = 1.0 / txSize;
vec2 scaleFactor = (vsize - txSize) * texelSize;
samplePos += (vec2(1.0, -1.0) * texelSize) * scaleFactor;`),F?Z.main.add(a`
      vec4 fillPixelColor = vcolor;

      // Get distance in output units (i.e. pixels)

      float sdf = texture(tex, samplePos).r;
      float pixelDistance = sdf * vsize.x;

      // Create smooth transition from the icon into its outline
      float fillAlphaFactor = clamp(0.5 - pixelDistance, 0.0, 1.0);
      fillPixelColor.a *= fillAlphaFactor;

      if (outlineSize > 0.25) {
        vec4 outlinePixelColor = outlineColor;
        float clampedOutlineSize = min(outlineSize, 0.5*vsize.x);

        // Create smooth transition around outline
        float outlineAlphaFactor = clamp(0.5 - (abs(pixelDistance) - 0.5*clampedOutlineSize), 0.0, 1.0);
        outlinePixelColor.a *= outlineAlphaFactor;

        if (
          outlineAlphaFactor + fillAlphaFactor < textureAlphaCutoff ||
          fillPixelColor.a + outlinePixelColor.a < alphaCutoff
        ) {
          discard;
        }

        // perform un-premultiplied over operator (see https://en.wikipedia.org/wiki/Alpha_compositing#Description)
        float compositeAlpha = outlinePixelColor.a + fillPixelColor.a * (1.0 - outlinePixelColor.a);
        vec3 compositeColor = vec3(outlinePixelColor) * outlinePixelColor.a +
                              vec3(fillPixelColor) * fillPixelColor.a * (1.0 - outlinePixelColor.a);

        ${o(!Q,a`fragColor = vec4(compositeColor, compositeAlpha);`)}
      } else {
        if (fillAlphaFactor < textureAlphaCutoff) {
          discard;
        }

        ${o(!Q,a`fragColor = premultiplyAlpha(fillPixelColor);`)}
      }

      // visualize SDF:
      // fragColor = vec4(clamp(-pixelDistance/vsize.x*2.0, 0.0, 1.0), clamp(pixelDistance/vsize.x*2.0, 0.0, 1.0), 0.0, 1.0);
      `):Z.main.add(a`
        vec4 texColor = texture(tex, samplePos, -0.5);
        if (texColor.a < textureAlphaCutoff) {
          discard;
        }
        ${o(!Q,a`fragColor = texColor * premultiplyAlpha(vcolor);`)}
      `),W&&!Q&&Z.main.add(a`
        float zSample = -linearizeDepth(texelFetch(depthMap, ivec2(gl_FragCoord.xy), 0).x);
        float zFragment = -linearizeDepth(gl_FragCoord.z);
        if (zSample < ${a.float(1-I)} * zFragment) {
          fragColor *= occludedOpacity;
        }
      `),j&&Z.main.add(`fragColor *= texelFetch(texOcclusion, ivec2(gl_FragCoord.xy), 0).r;`),!Q&&B&&Z.main.add(`fragColor = mix(fragColor, vec4(1.0, 0.0, 1.0, 1.0), isBorder * 0.5);`),D===2&&Z.main.add(a`if (fragColor.a < alphaCutoff) {
discard;
}`),$&&Z.main.add(a`fragColor = applyFocusAreaStyle(fragColor, focusAreaStyle);`),i(D)&&R&&Z.main.add(`fragEmission = vec4(0.0);`),D){case 1:Z.main.add(`
        fragColor = vec4(fragColor.rgb * floatBlendOutputScale, fragColor.a);
        fragAlpha = fragColor.a * floatBlendOutputScale;
      `);break;case 2:Z.main.add(`fragColor.rgb /= fragColor.a;`);break;case 11:Z.main.add(`outputObjectAndLayerIdColor();`);break;case 10:n.include(v,t),Z.main.add(`outputHighlight(false);`)}return n}function M(e){return e.outlineColor[3]>0&&e.outlineSize>0}function N(e){return e.textureIsSignedDistanceField?F(e.anchorPosition,e.distanceFieldBoundingBox,P):t(P,e.anchorPosition),P}var P=n();function F(t,n,r){e(r,t[0]*(n[2]-n[0])+n[0],t[1]*(n[3]-n[1])+n[1])}var I=.08,L=Object.freeze(Object.defineProperty({__proto__:null,anchorPosition:N,build:j},Symbol.toStringTag,{value:`Module`}));export{N as n,L as r,j as t};