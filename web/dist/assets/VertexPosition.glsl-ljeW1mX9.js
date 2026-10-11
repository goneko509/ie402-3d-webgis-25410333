import{t as e}from"./mat3f64-B6tTkprt.js";import{c as t}from"./vec3f64-DIOQknMY.js";import{t as n}from"./NoParameters-XZJ-8n06.js";import{t as r}from"./Uniform-FnPH-ujw.js";import{t as i}from"./Float3PassUniform-YEiGS05C.js";import{n as a,t as o}from"./glsl-D85RBwKC.js";import{t as s}from"./Float3DrawUniform-C2uWcyOr.js";import{t as c}from"./Matrix4BindUniform-DnHs9Hq_.js";import{t as l}from"./Matrix3PassUniform-B98tjNzt.js";import{t as u}from"./Texture2DPassUniform-CiCHIiok.js";import{t as d}from"./DoublePrecision.glsl-7AQh4H5L.js";var f=class extends r{constructor(e,t){super(e,`int`,2,(n,r,i)=>n.setUniform1i(e,t(r,i)))}},p=class extends r{constructor(e,t,n){super(e,`mat3`,2,(r,i,a)=>r.setUniformMatrix3fv(e,t(i,a),n))}};function m(e,t){let{attributes:n,vertex:r,varyings:m,fragment:h}=e;r.include(d),n.add(`position`,`vec3`),m.add(`vPositionWorldCameraRelative`,`vec3`),m.add(`vPosition_view`,`vec3`,{invariant:!0}),r.uniforms.add(new i(`transformWorldFromViewTH`,e=>e.transformWorldFromViewTH),new i(`transformWorldFromViewTL`,e=>e.transformWorldFromViewTL),new l(`transformViewFromCameraRelativeRS`,e=>e.transformViewFromCameraRelativeRS),new c(`transformProjFromView`,e=>e.camera.projectionMatrix));let{vertexPositionRotationType:g,useTransformationTexture:_}=t,v=g===1,y=g===2,b=v||y;_?r.uniforms.add(new f(`transformationDrawId`,e=>e.transformationDrawId),new u(`transformationTexture`,e=>e.transformationTexture)):(r.uniforms.add(new s(`transformWorldFromModelTH`,e=>e.transformWorldFromModelTH),new s(`transformWorldFromModelTL`,e=>e.transformWorldFromModelTL)),b&&r.uniforms.add(new p(`transformWorldFromModelRS`,e=>e.transformWorldFromModelRS))),r.code.add(a`
      ${o(b,a`
          mat3 modelTransformation() {
          ${o(_,a`
                return mat3(
                  texelFetch(transformationTexture, ivec2(2, transformationDrawId), 0).xyz,
                  texelFetch(transformationTexture, ivec2(3, transformationDrawId), 0).xyz,
                  texelFetch(transformationTexture, ivec2(4, transformationDrawId), 0).xyz
                );`,a`return transformWorldFromModelRS;`)}
          }
        `)}

      vec3 originL() {
        return ${o(_,a`texelFetch(transformationTexture, ivec2(0, transformationDrawId), 0).xyz;`,a`transformWorldFromModelTL;`)}
      }

      vec3 originH() {
        return ${o(_,a`texelFetch(transformationTexture, ivec2(1, transformationDrawId), 0).xyz;`,a`transformWorldFromModelTH;`)};
      }

      vec3 positionWorldCameraRelative() {

      vec3 rotatedModelPosition = ${o(v,a`modelTransformation() *`)} position;

      vec3 transform_CameraRelativeFromModel = dpAdd(
        originL(),
        originH(),
        -transformWorldFromViewTL,
        -transformWorldFromViewTH
      );

      return transform_CameraRelativeFromModel + rotatedModelPosition;
    }

    vec3 positionForDraping() {
      return ${o(y,a`modelTransformation() *`)} position;
    }
  `),r.code.add(a`
    void forwardPosition(float fOffset) {
      vPositionWorldCameraRelative = positionWorldCameraRelative();
      if (fOffset != 0.0) {
        vPositionWorldCameraRelative += fOffset * ${t.spherical?a`normalize(transformWorldFromViewTL + vPositionWorldCameraRelative)`:a`vec3(0.0, 0.0, 1.0)`};
      }

      vPosition_view = transformViewFromCameraRelativeRS * vPositionWorldCameraRelative;
      gl_Position = transformProjFromView * vec4(vPosition_view, 1.0);
    }
  `),h.uniforms.add(new i(`transformWorldFromViewTL`,e=>e.transformWorldFromViewTL)),r.code.add(a`vec3 positionWorld() {
return transformWorldFromViewTL + vPositionWorldCameraRelative;
}`),h.code.add(a`vec3 positionWorld() {
return transformWorldFromViewTL + vPositionWorldCameraRelative;
}`)}var h=class extends n{constructor(){super(...arguments),this.transformWorldFromViewTH=t(),this.transformWorldFromViewTL=t(),this.transformViewFromCameraRelativeRS=e()}},g=class extends n{constructor(){super(...arguments),this.transformWorldFromModelRS=e(),this.transformWorldFromModelTH=t(),this.transformWorldFromModelTL=t(),this.transformationDrawId=0}};export{f as i,m as n,h as r,g as t};