import{a as e}from"./screenUtils-CHZh2QsI.js";import{o as t}from"./vec4f64-CjgU5APJ.js";import{l as n}from"./vec4-B-G2J025.js";import{n as r}from"./glsl-D85RBwKC.js";import{n as i,t as a}from"./ScreenSizePerspective.glsl-DCyTAQMw.js";import{t as o}from"./View.glsl-DjwuylqK.js";import{t as s}from"./Float4PassUniform-Cu2daSgY.js";var c=class{constructor(t){this.screenLength=e(t.screenLength),this.minWorldLength=t.minWorldLength??0,this.maxWorldLength=t.maxWorldLength??1/0}};function l(e,t){let n=e.vertex;t.hasVerticalOffset?(d(n),t.hasScreenSizePerspective&&(e.include(i),a(n),o(e.vertex,t)),n.code.add(r`
      vec3 calculateVerticalOffset(vec3 worldPos, vec3 localOrigin) {
        float viewDistance = length((view * vec4(worldPos, 1.0)).xyz);
        ${t.spherical?r`vec3 worldNormal = normalize(worldPos + localOrigin);`:r`vec3 worldNormal = vec3(0.0, 0.0, 1.0);`}
        ${t.hasScreenSizePerspective?r`
            float cosAngle = dot(worldNormal, normalize(worldPos - cameraPosition));
            float verticalOffsetScreenHeight = screenSizePerspectiveScaleFloat(verticalOffset.x, abs(cosAngle), viewDistance, screenSizePerspectiveAlignment);`:r`
            float verticalOffsetScreenHeight = verticalOffset.x;`}
        // Screen sized offset in world space, used for example for line callouts
        float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * viewDistance, verticalOffset.z, verticalOffset.w);
        return worldNormal * worldOffset;
      }

      vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) {
        return worldPos + calculateVerticalOffset(worldPos, localOrigin);
      }
    `)):n.code.add(r`vec3 addVerticalOffset(vec3 worldPos, vec3 localOrigin) { return worldPos; }`)}var u=t();function d(e){e.uniforms.add(new s(`verticalOffset`,(e,t)=>{let{minWorldLength:r,maxWorldLength:i,screenLength:a}=e.verticalOffset,o=Math.tan(.5*t.camera.fovY)/(.5*t.camera.fullViewport[3]),s=t.camera.pixelRatio||1;return n(u,a*s,o,r,i)}))}export{d as n,l as r,c as t};