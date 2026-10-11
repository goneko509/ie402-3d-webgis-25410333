import{D as e}from"./vec2-C5dJMieJ.js";import{o as t}from"./vec2f64-IO40D2xB.js";import{r as n}from"./vec4f64-CjgU5APJ.js";import{n as r,t as i}from"./glsl-D85RBwKC.js";import{t as a}from"./ScreenSizePerspective.glsl-DCyTAQMw.js";import{t as o}from"./Float4PassUniform-Cu2daSgY.js";import{t as s}from"./Float4BindUniform-CcjALdTT.js";import{t as c}from"./FloatPassUniform-DeUP8HjM.js";import{n as l,t as u}from"./AlignPixel.glsl-CIksR2ML.js";import{n as d}from"./Slice.glsl-DNk_1_Sk.js";import{t as f}from"./Float2BindUniform-C6b2PHzh.js";import{t as p}from"./Float2PassUniform-BYZ61_RB.js";import{t as m}from"./ShaderBuilder-DxA0HNjK.js";import{t as h}from"./OutputColorHighlightOLID.glsl-BPsfn2UR.js";function g(t){let g=new m,{vertex:y,fragment:b}=g;return y.include(u),g.include(l,t),g.vertex.include(d,t),t.hudDepth||g.include(h,t),g.attributes.add(`uv0`,`vec2`),y.uniforms.add(new s(`viewport`,e=>e.camera.fullViewport),new c(`lineSize`,(e,t)=>e.size>0?Math.max(1,e.size)*t.camera.pixelRatio:0),new f(`pixelToNDC`,t=>e(v,2/t.camera.fullViewport[2],2/t.camera.fullViewport[3])),new c(`borderSize`,(e,t)=>e.borderColor?t.camera.pixelRatio:0),new p(`screenOffset`,(t,n)=>e(v,t.horizontalScreenOffset*n.camera.pixelRatio,0))),g.varyings.add(`coverageSampling`,`vec4`),g.varyings.add(`lineSizes`,`vec2`),t.hasScreenSizePerspective&&a(y),y.main.add(r`
    ProjectHUDAux projectAux;
    vec4 endPoint = projectPositionHUD(projectAux);

    vec3 vpos = projectAux.posModel;
    if (rejectBySlice(vpos)) {
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
      return;
    }

    ${t.hasScreenSizePerspective?r`vec3 perspectiveFactor = screenSizePerspectiveScaleFactor(projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);
               vec2 screenOffsetScaled = applyScreenSizePerspectiveScaleFactorVec2(screenOffset, perspectiveFactor);`:`vec2 screenOffsetScaled = screenOffset;`}
    // Add view dependent polygon offset to get exact same original starting point. This is mostly used to get the
    // correct depth value
    vec3 posView = (view * vec4(position, 1.0)).xyz;

    applyHUDViewDependentPolygonOffset(groundDistance, projectAux.absCosAngle, posView);
    vec4 startPoint = proj * vec4(posView, 1.0);

    // Apply screen offset to both start and end point
    vec2 screenOffsetNorm = screenOffsetScaled * 2.0 / viewport.zw;
    startPoint.xy += screenOffsetNorm * startPoint.w;
    endPoint.xy += screenOffsetNorm * endPoint.w;

    // Align start and end to pixel origin
    vec4 startAligned = alignToPixelOrigin(startPoint, viewport.zw);
    vec4 endAligned = alignToPixelOrigin(endPoint, viewport.zw);
    ${i(t.hudDepth,t.hudDepthAlignStart?`endAligned = vec4(endAligned.xy / endAligned.w * startAligned.w, startAligned.zw);`:`startAligned = vec4(startAligned.xy / startAligned.w * endAligned.w, endAligned.zw);`)}
    vec4 projectedPosition = mix(startAligned, endAligned, uv0.y);

    // The direction of the line in screen space
    vec2 screenSpaceDirection = normalize(endAligned.xy / endAligned.w - startAligned.xy / startAligned.w);
    vec2 perpendicularScreenSpaceDirection = vec2(screenSpaceDirection.y, -screenSpaceDirection.x);
    ${t.hasScreenSizePerspective?r`float lineSizeScaled = applyScreenSizePerspectiveScaleFactorFloat(lineSize, perspectiveFactor);
               float borderSizeScaled = applyScreenSizePerspectiveScaleFactorFloat(borderSize, perspectiveFactor);`:r`float lineSizeScaled = lineSize;
               float borderSizeScaled = borderSize;`}
    float halfPixelSize = lineSizeScaled * 0.5;

    // Compute full ndc offset, adding 1px padding for doing anti-aliasing and the border size
    float padding = 1.0 + borderSizeScaled;
    vec2 ndcOffset = (-halfPixelSize - padding + uv0.x * (lineSizeScaled + padding + padding)) * pixelToNDC;

    // Offset x/y from the center of the line in screen space
    projectedPosition.xy += perpendicularScreenSpaceDirection * ndcOffset * projectedPosition.w;

    // Compute a coverage varying which we can use in the fragment shader to determine
    // how much a pixel is actually covered by the line (i.e. to anti alias the line).
    // This works by computing two coordinates that can be linearly interpolated and then
    // subtracted to find out how far away from the line edge we are.
    float edgeDirection = (uv0.x * 2.0 - 1.0);

    float halfBorderSize = 0.5 * borderSizeScaled;
    float halfPixelSizeAndBorder = halfPixelSize + halfBorderSize;
    float outerEdgeCoverageSampler = edgeDirection * (halfPixelSizeAndBorder + halfBorderSize + 1.0);

    float isOneSided = float(lineSizeScaled < 2.0 && borderSize < 2.0);

    coverageSampling = vec4(
      // Edge coordinate
      outerEdgeCoverageSampler,

      // Border edge coordinate
      outerEdgeCoverageSampler - halfPixelSizeAndBorder * isOneSided,

      // Line offset
      halfPixelSize - 0.5,

      // Border offset
      halfBorderSize - 0.5 + halfPixelSizeAndBorder * (1.0 - isOneSided)
    );

    lineSizes = vec2(lineSizeScaled, borderSizeScaled);
    gl_Position = projectedPosition;`),b.uniforms.add(new o(`uColor`,e=>e.color??n),new o(`borderColor`,e=>e.borderColor??n)),b.main.add(r`
    vec2 coverage = min(1.0 - clamp(abs(coverageSampling.xy) - coverageSampling.zw, 0.0, 1.0), lineSizes);

    float borderAlpha = uColor.a * borderColor.a * coverage.y;
    float colorAlpha = uColor.a * coverage.x;

    float finalAlpha = mix(borderAlpha, 1.0, colorAlpha);
    ${i(t.hudDepth,r`
    if (max(coverage.x, coverage.y) < ${r.float(_)}) discard;`,r`
    vec3 finalRgb = mix(borderColor.rgb * borderAlpha, uColor.rgb, colorAlpha);
    outputColorHighlightOLID(vec4(finalRgb, finalAlpha), finalRgb);`)}`),g}var _=.5,v=t(),y=Object.freeze(Object.defineProperty({__proto__:null,build:g},Symbol.toStringTag,{value:`Module`}));export{y as n,g as t};