import{t as e}from"./mat4f64-E_FXCKxO.js";import{y as t}from"./mat4-BL30OFHW.js";import{t as n}from"./Matrix4BindUniform-DnHs9Hq_.js";function r(e,r={needUVs:!0,needEyeDirection:!0}){e.attributes.add(`position`,`vec2`),e.varyings.add(`worldRay`,`vec3`);let{needUVs:a,needEyeDirection:o}=r;e.vertex.uniforms.add(new n(`inverseProjectionMatrix`,e=>e.camera.inverseProjectionMatrix),new n(`inverseViewMatrix`,e=>t(i,e.camera.viewMatrix))).main.add(`
    gl_Position = vec4(position, 1, 1);

    vec3 posViewNear = (inverseProjectionMatrix * vec4(position, -1.0, 1.0)).xyz;
    worldRay = (inverseViewMatrix * vec4(posViewNear, 0)).xyz;
  `),a&&(e.varyings.add(`uv`,`vec2`),e.vertex.main.add(`uv = position * 0.5 + vec2(0.5);`)),o&&(e.varyings.add(`eyeDir`,`vec3`),e.vertex.main.add(`eyeDir = posViewNear;`))}var i=e();export{r as t};