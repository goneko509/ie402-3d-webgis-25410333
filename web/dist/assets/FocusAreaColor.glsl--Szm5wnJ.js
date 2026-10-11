import{t as e}from"./signal-B8AeCUuR.js";import{t}from"./NoParameters-XZJ-8n06.js";import{n}from"./glsl-D85RBwKC.js";import{t as r}from"./FloatPassUniform-DeUP8HjM.js";import{t as i}from"./IntegerPassUniform-DN8CxRD1.js";import{t as a}from"./Texture2DPassUniform-CiCHIiok.js";import{t as o}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as s}from"./ShaderBuilder-DxA0HNjK.js";var c=class extends t{constructor(){super(...arguments),this.effect=0,this.fadeFactor=e(1)}};function l(){let e=new s;return e.include(o),e.outputs.add(`fragColor`,`vec4`,0),e.fragment.uniforms.add(new a(`colorTexture`,e=>e.color),new a(`focusArea`,e=>e.focusArea),new i(`focusAreaEffectMode`,e=>e.effect),new r(`fadeFactor`,e=>e.fadeFactor.value)).main.add(n`
      float mask = texture( focusArea, uv, 0.0 ).r;
      vec4 color = texture( colorTexture, uv, 0.0 );
      vec4 colorDeSaturate = vec4(color.r * 0.25 + color.g * 0.5 + color.b * 0.25);
      if (focusAreaEffectMode == ${n.int(0)}) {
        fragColor = mask > 0.0 ? color : mix(color, 0.55 * colorDeSaturate + 0.45, fadeFactor);
      } else {
        fragColor = mask > 0.0 ? color : mix(color, 0.33 * color, fadeFactor);
      }
  `),e}var u=Object.freeze(Object.defineProperty({__proto__:null,FocusAreaColorPassParameters:c,build:l},Symbol.toStringTag,{value:`Module`}));export{l as n,u as r,c as t};