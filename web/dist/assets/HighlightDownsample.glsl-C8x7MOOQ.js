import{t as e}from"./NoParameters-XZJ-8n06.js";import{n as t}from"./glsl-D85RBwKC.js";import{t as n}from"./ScreenSpacePass.glsl-9L-_X5OK.js";import{t as r}from"./ShaderBuilder-DxA0HNjK.js";import{t as i}from"./Texture2DUintPassUniform-B2S1A2cs.js";var a=class extends e{};function o(){let e=new r,{outputs:a,fragment:o}=e;return e.include(n),o.uniforms.add(new i(`highlightTexture`,e=>e.highlightTexture)),o.constants.add(`outlineWidth`,`int`,9),o.constants.add(`cellSize`,`int`,32),a.add(`fragGrid`,`uvec2`),o.main.add(t`ivec2 inputTextureSize = textureSize(highlightTexture, 0);
ivec2 cellBottomLeftCornerInput = ivec2(ivec2(floor(gl_FragCoord.xy) * vec2(cellSize)));
ivec2 coordMid =  cellBottomLeftCornerInput + ivec2(cellSize >> 1);
uvec2 centreTexel = texelFetch(highlightTexture, coordMid, 0).rg & uvec2(0x55u);
float marginSquare = float(outlineWidth*outlineWidth);
uvec2 outputValue = centreTexel & uvec2(0x55u);
for(int y = -outlineWidth; y <= cellSize + outlineWidth; y+=2) {
int dy = y < 0 ? -y : y > cellSize ? y-cellSize : 0;
int xMargin = dy > 0 ? int(ceil(sqrt(marginSquare - float(dy*dy)))) : outlineWidth;
for(int x = -xMargin; x <= cellSize + xMargin; x+=2) {
ivec2 coord = cellBottomLeftCornerInput + ivec2(x, y);
uvec2[4] texels = uvec2[4] (
texelFetch(highlightTexture,coord+ivec2(0,0),0).rg & uvec2(0x55u),
texelFetch(highlightTexture,coord+ivec2(1,0),0).rg & uvec2(0x55u),
texelFetch(highlightTexture,coord+ivec2(0,1),0).rg & uvec2(0x55u),
texelFetch(highlightTexture,coord+ivec2(1,1),0).rg & uvec2(0x55u)
);
if (texels[0] == texels[1] && texels[1] == texels[2] && texels[2] == texels[3] && texels[3] ==  centreTexel) {
continue;
}
for (int i=0; i<4; ++i){
outputValue |= ((texels[i] ^ centreTexel) << 1);
outputValue |= texels[i];
}
}
}
fragGrid = outputValue;`),e}var s=32,c=9,l=.4,u=Object.freeze(Object.defineProperty({__proto__:null,HighlightDownsampleDrawParameters:a,blurSize:l,build:o,gridCellPixelSize:32,outlineSize:9},Symbol.toStringTag,{value:`Module`}));export{l as a,a as i,o as n,s as o,c as r,u as t};