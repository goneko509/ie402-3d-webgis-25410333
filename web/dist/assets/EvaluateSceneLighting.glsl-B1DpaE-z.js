const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/SSAOBlur.glsl-DC-Y0P1Y.js","assets/glsl-D85RBwKC.js","assets/ReadDepth.glsl-Ca_0z8Pl.js","assets/vec2-C5dJMieJ.js","assets/mathUtils-D79yUFwW.js","assets/common-DhvcAEWc.js","assets/vec2f64-IO40D2xB.js","assets/Float2BindUniform-C6b2PHzh.js","assets/Uniform-FnPH-ujw.js","assets/ScreenSpacePass.glsl-9L-_X5OK.js","assets/ShaderBuilder-DxA0HNjK.js","assets/Error-CVoK2uyB.js","assets/typedArrayUtil-ob_YkLNY.js","assets/arrayUtils-DXfY1bBO.js","assets/SSAOBlur.glsl-De5GnsX9.js","assets/FloatPassUniform-DeUP8HjM.js","assets/Texture2DPassUniform-CiCHIiok.js","assets/Texture2DDrawUniform-D7tKvlQx.js","assets/Float2DrawUniform-BbCPIPVz.js","assets/SSAO.glsl-BCXY8pMS.js","assets/Gamma.glsl-BiRghhbe.js","assets/colorUtils-DZZ966ow.js","assets/CameraSpace.glsl-DcIGS7L_.js","assets/vec4f64-CjgU5APJ.js","assets/vec4-B-G2J025.js","assets/Float4BindUniform-CcjALdTT.js","assets/SSAO.glsl-L9SXTRTT.js","assets/FloatBindUniform-C4h6J6-v.js","assets/Float2PassUniform-BYZ61_RB.js","assets/GlobalIlluminationBlur.glsl-D_Y_JRZn.js","assets/NoParameters-XZJ-8n06.js","assets/oitResolution.glsl-DBbxNNXQ.js","assets/tslib.es6-qUHyP9zl.js","assets/ShaderTechniqueConfiguration-B1x-rScA.js","assets/GlobalIlluminationColorQuantization.glsl-DASwhWnI.js","assets/GlobalIlluminationWeights.glsl-Bk-lJUwL.js","assets/GlobalIlluminationBlur.glsl-ze2hntS-.js","assets/BooleanBindUniform-B2b909hF.js","assets/ditherNoise.glsl-UOpZ2vbN.js","assets/GlobalIllumination.glsl-MlsrW0iJ.js","assets/enums-C3NXllrX.js","assets/MainLighting.glsl-BzpgU6pB.js","assets/Float3BindUniform-BmdF9XGj.js","assets/GlobalIllumination.glsl-BCkS0Bt2.js","assets/Matrix4BindUniform-DnHs9Hq_.js","assets/Texture2DBindUniform-4_yYNByJ.js","assets/ScreenSpaceRayMarching.glsl-CHeCgPTI.js","assets/GlobalIlluminationUpscale.glsl-ZGsLHnx6.js","assets/GlobalIlluminationUpscale.glsl-CCSKtkqv.js"])))=>i.map(i=>d[i]);
import{r as e}from"./tslib.es6-qUHyP9zl.js";import{F as t,I as n}from"./promiseUtils-BA3LEme1.js";import{n as r,t as i}from"./decorators-whvBKDev.js";import{n as a}from"./time-BzYz5R50.js";import{t as o}from"./preload-helper-DjzSQ1t3.js";import{T as s}from"./mathUtils-D79yUFwW.js";import{c,s as l}from"./reactiveUtils-D22Cre6W.js";import{D as u}from"./vec2-C5dJMieJ.js";import{o as d}from"./vec2f64-IO40D2xB.js";import{l as f,t as p}from"./RenderNode-BWy6JO7Q.js";import{t as m}from"./SceneLighting-CVMMYdmQ.js";import{h,n as g}from"./enums-C3NXllrX.js";import{o as _,t as v}from"./Texture-D7vRC9-Q.js";import{n as y,s as b}from"./renderState-CcgUUyHH.js";import{n as x,t as S}from"./ShaderTechnique-j9ngpNWg.js";import{t as C}from"./NoParameters-XZJ-8n06.js";import{n as w,t as T}from"./glsl-D85RBwKC.js";import{t as E}from"./FloatBindUniform-C4h6J6-v.js";import{n as D,t as O}from"./ShaderTechniqueConfiguration-B1x-rScA.js";import{t as k}from"./BooleanBindUniform-B2b909hF.js";import{t as A}from"./Texture2DBindUniform-4_yYNByJ.js";import{t as ee}from"./Gamma.glsl-BiRghhbe.js";import{i as j,r as te,t as ne}from"./PhysicallyBasedRendering.glsl-BFHZucno.js";import{n as re,t as ie}from"./SSAO.glsl-L9SXTRTT.js";import{t as M}from"./SSAOBlur.glsl-De5GnsX9.js";import{t as N}from"./EvaluateAmbientLighting.glsl-BbYe-Nat.js";import{n as P,r as F,t as I}from"./MainLighting.glsl-BzpgU6pB.js";import{t as ae}from"./PiUtils.glsl-CpyVHJCx.js";import{a as oe,c as se,s as ce}from"./GlobalIllumination.glsl-BCkS0Bt2.js";import{n as le,r as L}from"./GlobalIlluminationBlur.glsl-ze2hntS-.js";import{n as R,t as z}from"./GlobalIlluminationUpscale.glsl-CCSKtkqv.js";import{t as B}from"./ToneMapping.glsl-BO4QToFy.js";var V=class extends S{constructor(){super(...arguments),this.shader=new x(M,()=>o(()=>import(`./SSAOBlur.glsl-DC-Y0P1Y.js`),__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18])))}initializePipeline(){return y({colorWrite:b})}};V=e([r(`esri.views.3d.webgl-engine.effects.ssao.SSAOBlurTechnique`)],V);var H=`eXKEvZaUc66cjIKElE1jlJ6MjJ6Ufkl+jn2fcXp5jBx7c6KEflSGiXuXeW6OWs+tfqZ2Yot2Y7Zzfo2BhniEj3xoiXuXj4eGZpqEaHKDWjSMe7palFlzc3BziYOGlFVzg6Zzg7CUY5JrjFF7eYJ4jIKEcyyEonSXe7qUfqZ7j3xofqZ2c4R5lFZ5Y0WUbppoe1l2cIh2ezyUho+BcHN2cG6DbpqJhqp2e1GcezhrdldzjFGUcyxjc3aRjDyEc1h7Sl17c6aMjH92pb6Mjpd4dnqBjMOEhqZleIOBYzB7gYx+fnqGjJuEkWlwnCx7fGl+c4hjfGyRe5qMlNOMfnqGhIWHc6OMi4GDc6aMfqZuc6aMzqJzlKZ+lJ6Me3qRfoFue0WUhoR5UraEa6qMkXiPjMOMlJOGe7JrUqKMjK6MeYRzdod+Sl17boiPc6qEeYBlcIh2c1WEe7GDiWCDa0WMjEmMdod+Y0WcdntzhmN8WjyMjKJjiXtzgYxYaGd+a89zlEV7e2GJfnd+lF1rcK5zc4p5cHuBhL6EcXp5eYB7fnh8iX6HjIKEeaxuiYOGc66RfG2Ja5hzjlGMjEmMe9OEgXuPfHyGhPeEdl6JY02McGuMfnqGhFiMa3WJfnx2l4hwcG1uhmN8c0WMc39og1GBbrCEjE2EZY+JcIh2cIuGhIWHe0mEhIVrc09+gY5+eYBlnCyMhGCDl3drfmmMgX15aGd+gYx+fnuRfnhzY1SMsluJfnd+hm98WtNrcIuGh4SEj0qPdkqOjFF7jNNjdnqBgaqUjMt7boeBhnZ4jDR7c5pze4GGjEFrhLqMjHyMc0mUhKZze4WEa117kWlwbpqJjHZ2eX2Bc09zeId+e0V7WlF7jHJ2l72BfId8l3eBgXyBe897jGl7c66cgW+Xc76EjKNbgaSEjGx4fId8jFFjgZB8cG6DhlFziZhrcIh2fH6HgUqBgXiPY8dahGFzjEmMhEFre2dxhoBzc5SGfleGe6alc7aUeYBlhKqUdlp+cH5za4OEczxza0Gcc4J2jHZ5iXuXjH2Jh5yRjH2JcFx+hImBjH+MpddCl3dreZeJjIt8ZW18bm1zjoSEeIOBlF9oh3N7hlqBY4+UeYFwhLJjeYFwaGd+gUqBYxiEYot2fqZ2ondzhL6EYyiEY02Ea0VjgZB8doaGjHxoc66cjEGEiXuXiXWMiZhreHx8frGMe75rY02Ec5pzfnhzlEp4a3VzjM+EhFFza3mUY7Zza1V5e2iMfGyRcziEhDyEkXZ2Y4OBnCx7g5t2eyBjgV6EhEFrcIh2dod+c4Z+nJ5zjm15jEmUeYxijJp7nL6clIpjhoR5WrZraGd+fnuRa6pzlIiMg6ZzfHx5foh+eX1ufnB5eX1ufnB5aJt7UqKMjIh+e3aBfm5lbYSBhGFze6J4c39oc0mUc4Z+e0V7fKFVe0WEdoaGY02Ec4Z+Y02EZYWBfH6HgU1+gY5+hIWUgW+XjJ57ebWRhFVScHuBfJ6PhBx7WqJzlM+Ujpd4gHZziX6HjHmEgZN+lJt5boiPe2GJgX+GjIGJgHZzeaxufnB5hF2JtdN7jJ57hp57hK6ElFVzg6ZzbmiEbndzhIWHe3uJfoFue3qRhJd2j3xoc65zlE1jc3p8lE1jhniEgXJ7e657vZaUc3qBh52BhIF4aHKDa9drgY5+c52GWqZzbpqJe8tjnM+UhIeMfo2BfGl+hG1zSmmMjKJjZVaGgX15c1lze0mEp4OHa3mUhIWHhDyclJ6MeYOJkXiPc0VzhFiMlKaEboSJa5Jze41re3qRhn+HZYWBe0mEc4p5fnORbox5lEp4hGFjhGGEjJuEc1WEhLZjeHeGa7KlfHx2hLaMeX1ugY5+hIWHhKGPjMN7c1WEho1zhoBzZYx7fnhzlJt5exyUhFFziXtzfmmMa6qMYyiEiXxweV12kZSMeWqXSl17fnhzxmmMrVGEe1mcc4p5eHeGjK6MgY5+doaGa6pzlGV7g1qBh4KHkXiPeW6OaKqafqZ2eXZ5e1V7jGd7boSJc3BzhJd2e0mcYot2h1RoY8dahK6EQmWEWjx7e1l2lL6UgXyBdnR4eU9zc0VreX1umqaBhld7fo2Bc6KEc5Z+hDyEcIeBWtNrfHyGe5qMhMuMe5qMhEGEbVVupcNzg3aHhIF4boeBe0mEdlptc39ofFl5Y8uUlJOGiYt2UmGEcyxjjGx4jFF7a657ZYWBnElzhp57iXtrgZN+tfOEhIOBjE2HgU1+e8tjjKNbiWCDhE15gUqBgYN7fnqGc66ce9d7iYSBj0qPcG6DnGGcT3eGa6qMZY+JlIiMl4hwc3aRdnqBlGV7eHJ2hLZjfnuRhDyEeX6MSk17g6Z+c6aUjHmEhIF4gXyBc76EZW18fGl+fkl+jCxrhoVwhDyUhIqGlL2DlI6EhJd2tdN7eYORhEGMa2Faa6pzc3Bzc4R5lIRznM+UY9eMhDycc5Z+c4p5c4iGY117pb6MgXuPrbJafnx2eYOJeXZ5e657hDyEcziElKZjfoB5eHeGj4WRhGGEe6KGeX1utTStc76EhFGJnCyMa5hzfH6HnNeceYB7hmN8gYuMhIVrczSMgYF8h3N7c5pza5hzjJqEYIRdgYuMlL2DeYRzhGGEeX1uhLaEc4iGeZ1zdl6JhrVteX6Me2iMfm5lWqJzSpqEa6pzdnmchHx2c6OMhNdrhoR5g3aHczxzeW52gV6Ejm15frGMc0Vzc4Z+l3drfniJe+9rWq5rlF1rhGGEhoVwe9OEfoh+e7pac09+c3qBY0lrhDycdnp2lJ6MiYOGhGCDc3aRlL2DlJt5doaGdnp2gYF8gWeOjF2Uc4R5c5Z+jEmMe7KEc4mEeYJ4dmyBe0mcgXiPbqJ7eYB7fmGGiYSJjICGlF1reZ2PnElzbpqJfH6Hc39oe4WEc5eJhK6EhqyJc3qBgZB8c09+hEmEaHKDhFGJc5SGiXWMUpaEa89zc6OMnCyMiXtrho+Be5qMc7KEjJ57dmN+hKGPjICGbmiEe7prdod+hGCDdnmchBx7eX6MkXZ2hGGEa657hm98jFFjY5JreYOJgY2EjHZ2a295Y3FajJ6Mc1J+YzB7e4WBjF2Uc4R5eV12gYxzg1qBeId+c9OUc5pzjFFjgY5+hFiMlIaPhoR5lIpjjIKBlNdSe7KEeX2BfrGMhIqGc65zjE2UhK6EklZ+QmWEeziMWqZza3VzdnR4foh+gYF8n3iJiZhrnKp7gYF8eId+lJ6Me1lrcIuGjKJjhmN8c66MjFF7a6prjJ6UnJ5zezyUfruRWlF7nI5zfHyGe657h4SEe8tjhBx7jFFjc09+c39ojICMeZeJeXt+YzRzjHZ2c0WEcIeBeXZ5onSXkVR+gYJ+eYFwdldzgYF7eX2BjJ6UiXuXlE1jh4SEe1mchLJjc4Z+hqZ7eXZ5bm1zlL6Ue5p7iWeGhKqUY5pzjKJjcIeBe8t7gXyBYIRdlEp4a3mGnK6EfmmMZpqEfFl5gYxzjKZuhGFjhoKGhHx2fnx2eXuMe3aBiWeGvbKMe6KGa5hzYzB7gZOBlGV7hmN8hqZlYot2Y117a6pzc6KEfId8foB5rctrfneJfJ6PcHN2hFiMc5pzjH92c0VzgY2EcElzdmCBlFVzg1GBc65zY4OBboeBcHiBeYJ4ewxzfHx5lIRzlEmEnLKEbk1zfJ6PhmN8eYBljBiEnMOEiXxwezyUcIeBe76EdsKEeX2BdnR4jGWUrXWMjGd7fkl+j4WRlEGMa5Jzho+BhDyEfnqMeXt+g3aHlE1jczClhNN7ZW18eHx8hGFjZW18iXWMjKJjhH57gYuMcIuGWjyMe4ZtjJuExmmMj4WRdntzi4GDhFFzYIRdnGGcjJp7Y0F7e4WEkbCGiX57fnSHa657a6prhBCMe3Z+SmmMjH92eHJ2hK6EY1FzexhrvbKMnI5za4OEfnd+eXuMhImBe897hLaMjN+EfG+BeIOBhF1+eZeJi4GDkXZ2eXKEgZ6Ejpd4c2GHa1V5e5KUfqZuhCx7jKp7lLZrg11+hHx2hFWUoot2nI5zgbh5mo9zvZaUe3qRbqKMfqZ2kbCGhFiM`,U=class extends C{constructor(){super(...arguments),this.projScale=1}},ue=class extends U{constructor(){super(...arguments),this.intensity=1}},de=class extends C{},fe=class extends de{constructor(){super(...arguments),this.blurSize=d()}},W=class extends S{constructor(){super(...arguments),this.shader=new x(ie,()=>o(()=>import(`./SSAO.glsl-BCXY8pMS.js`),__vite__mapDeps([19,3,4,5,6,1,2,7,8,9,10,11,12,13,20,21,22,23,24,25,26,27,15,28,16])))}initializePipeline(){return y({colorWrite:b})}};W=e([r(`esri.views.3d.webgl-engine.effects.ssao.SSAOTechnique`)],W);var G=class extends p{constructor(e){super(e),this.consumes={required:[`normals`]},this.produces=f.AMBIENT_ILLUMINATION,this._enableTime=a(0),this._passParameters=new ue,this._drawParameters=new fe}initialize(){let e=Uint8Array.from(atob(H),e=>e.charCodeAt(0)),t=new _(32);t.wrapMode=33071,t.pixelFormat=6407,t.wrapMode=10497,t.hasMipmap=!0,this._passParameters.noiseTexture=new v(this.renderingContext,t,e),this.addHandles(l(()=>this.view.stage.renderer.hasAmbientIllumination,()=>this._enableTime=a(0)))}destroy(){this._passParameters.noiseTexture=t(this._passParameters.noiseTexture)}render(e){let t=e.find(({name:e})=>e===`normals`),n=t?.getTexture(),r=t?.getTexture(h);if(!n||!r)return;let i=this.techniques.getCompiled(W),o=this.techniques.getCompiled(V);if(!i||!o)return this._enableTime=a(performance.now()),void this.requestRender(1);this._enableTime===0&&(this._enableTime=a(performance.now()));let c=this.renderingContext,l=this.view.qualitySettings.fadeDuration,d=this.bindParameters,p=d.camera,m=p.relativeElevation,g=s((j-m)/(j-te),0,1),_=l>0?Math.min(l,performance.now()-this._enableTime)/l:1,v=_*g;this._passParameters.normalTexture=n,this._passParameters.depthTexture=r,this._passParameters.projScale=1/p.computeScreenPixelSizeAtDist(1),this._passParameters.intensity=4*pe/re(p)**6*v;let y=p.fullViewport[2],b=p.fullViewport[3],x=this.fboCache.acquire(y,b,`ssao input`,2);c.bindFramebuffer(x.fbo),c.setViewport(0,0,y,b),c.bindTechnique(i,d,this._passParameters,this._drawParameters),c.screen.draw();let S=Math.round(y/2),C=Math.round(b/2),w=this.fboCache.acquire(S,C,`ssao blur`,0);c.bindFramebuffer(w.fbo),this._drawParameters.colorTexture=x.getTexture(),u(this._drawParameters.blurSize,0,2/b),c.bindTechnique(o,d,this._passParameters,this._drawParameters),c.setViewport(0,0,S,C),c.screen.draw(),x.release();let T=this.fboCache.acquire(S,C,f.AMBIENT_ILLUMINATION,0);return c.bindFramebuffer(T.fbo),c.setViewport(0,0,y,b),c.setClearColor(1,1,1,0),c.clear(16384),this._drawParameters.colorTexture=w.getTexture(),u(this._drawParameters.blurSize,2/y,0),c.bindTechnique(o,d,this._passParameters,this._drawParameters),c.setViewport(0,0,S,C),c.screen.draw(),c.setViewport4fv(p.fullViewport),w.release(),_<1&&this.requestRender(2),T}};e([i()],G.prototype,`consumes`,void 0),e([i()],G.prototype,`produces`,void 0),G=e([r(`esri.views.3d.webgl-engine.effects.ssao.SSAO`)],G);var pe=.5;function K(e,t){t.receiveAmbientOcclusion?(e.uniforms.add(new A(`ssaoTex`,e=>e.ssao?.getTexture())),e.constants.add(`blurSizePixelsInverse`,`float`,1/2),e.code.add(w`float evaluateAmbientOcclusionInverse() {
vec2 ssaoTextureSizeInverse = 1.0 / vec2(textureSize(ssaoTex, 0));
return texture(ssaoTex, gl_FragCoord.xy * blurSizePixelsInverse * ssaoTextureSizeInverse).r;
}
float evaluateAmbientOcclusion() {
return 1.0 - evaluateAmbientOcclusionInverse();
}`)):e.code.add(w`float evaluateAmbientOcclusionInverse() { return 1.0; }
float evaluateAmbientOcclusion() { return 0.0; }`)}var q=class extends S{constructor(){super(...arguments),this.shader=new x(L,()=>o(()=>import(`./GlobalIlluminationBlur.glsl-D_Y_JRZn.js`),__vite__mapDeps([29,6,30,1,2,3,4,5,7,8,9,10,11,12,13,31,32,33,22,23,24,25,34,35,36,15,37,16,17,38,18])))}initializePipeline(){return y({colorWrite:b})}};q=e([r(`esri.views.3d.webgl-engine.effects.globalIllumination.GlobalIlluminationBlurTechnique`)],q);var J=class extends S{constructor(){super(...arguments),this.shader=new x(se,()=>o(()=>import(`./GlobalIllumination.glsl-MlsrW0iJ.js`),__vite__mapDeps([39,40,30,1,9,10,11,12,13,20,21,22,3,4,5,6,23,24,25,8,7,41,42,43,44,15,45,2,16,46,27,34])))}initializePipeline(){return y({colorWrite:b})}};J=e([r(`esri.views.3d.webgl-engine.effects.globalIllumination.GlobalIlluminationTechnique`)],J);var Y=class extends O{constructor(){super(...arguments),this.hasColor=!0,this.hasEmission=!1,this.rayMarchMaxReach=ce,this.rayMarchMaxSteps=16,this.useProjectedRayLength=!0,this.clampRayToScreen=!1}};e([D()],Y.prototype,`hasColor`,void 0),e([D()],Y.prototype,`hasEmission`,void 0);var X=class extends S{constructor(){super(...arguments),this.shader=new x(z,()=>o(()=>import(`./GlobalIlluminationUpscale.glsl-ZGsLHnx6.js`),__vite__mapDeps([47,30,1,2,3,4,5,6,7,8,9,10,11,12,13,22,23,24,25,34,35,48,15,16,17])))}initializePipeline(){return y({colorWrite:b})}};X=e([r(`esri.views.3d.webgl-engine.effects.globalIllumination.GlobalIlluminationUpscaleTechnique`)],X);var Z=class extends p{constructor(e){super(e),this.consumes={required:[`normals`]},this.produces=f.AMBIENT_ILLUMINATION,this._passParameters=new oe,this._drawParameters=new le,this._drawParametersUpscale=new R,this._maxFrames=256,this._lowQualityResolutionScale=.25,this._configuration=new Y,this._globalIllumination=null,this._isGlobalIlluminationUpdate=!1,this._resetBuffer=!1}initialize(){this.addHandles(l(()=>this.view.stage.renderer.hasGlobalIllumination,()=>{this._resetAccumulatedFrames(),this._requestRender()},c))}destroy(){this._globalIllumination=n(this._globalIllumination)}resetAccumulatedFrames(){this._isGlobalIlluminationUpdate||this._resetAccumulatedFrames()}render(e){if(this._passParameters.accumulatedFrames>=this._maxFrames)return this._globalIllumination?.retain(),this._globalIllumination;let t=e.find(({name:e})=>e===`normals`),n=t?.getTexture(),r=t?.getTexture(h),i=this._mode;if(!n||!r)return this._emptyOutput;if(i===0)return this._resetBuffer=!1,this._emptyOutput;if(!this._canRender)return this._resetBuffer=!1,this._requestRender(),this._emptyOutput;let a=this.bindParameters;this._configuration.hasEmission=!!a.reprojection.lastFrameEmission;let o=this.techniques.getCompiled(J,this._configuration),s=this.techniques.getCompiled(q),c=i===1,l=c?this._lowQualityResolutionScale:1,d=c?this.techniques.getCompiled(X):null;if(!o||!s||c&&!d)return this._requestRender(),this._emptyOutput;let p=this.renderingContext,{camera:m}=a;this._passParameters.normalTexture=n,this._passParameters.depthTexture=r,this._passParameters.projScale=1/m.computeScreenPixelSizeAtDist(1),this._passParameters.scaleGlobalIllumination=l;let{fullWidth:_,fullHeight:v}=m,y=Math.max(1,Math.floor(_*l)),b=Math.max(1,Math.floor(v*l)),x=this.fboCache.acquire(y,b,`global illumination input`).acquireColor(g,0);p.bindFramebuffer(x.fbo),p.setViewport(0,0,y,b),p.bindTechnique(o,a,this._passParameters,this._drawParameters),p.screen.draw();let S=x.obtainAttachment(g),C=Math.max(1,Math.round(y/1)),w=Math.max(1,Math.round(b/1)),T=this.fboCache.acquire(C,w,`global illumination blur horizontal`);p.bindFramebuffer(T.fbo),this._drawParameters.texture=x.getTexture(),this._drawParameters.weightTexture=S.attachment,u(this._drawParameters.blurSize,0,1/b),p.bindTechnique(s,a,this._passParameters,this._drawParameters),p.setViewport(0,0,C,w),p.screen.draw(),x.release();let E=c?`global illumination blur vertical`:f.AMBIENT_ILLUMINATION,D=this.fboCache.acquire(C,w,E);p.bindFramebuffer(D.fbo),p.setViewport(0,0,C,w),p.setClearColor(1,1,1,0),p.clear(16384),this._drawParameters.texture=T.getTexture(),this._drawParameters.weightTexture=S.attachment,u(this._drawParameters.blurSize,1/C,0),p.bindTechnique(s,a,this._passParameters,this._drawParameters),p.setViewport(0,0,C,w),p.screen.draw(),T.release(),D.attachColor(S,g),S.release();let O=D;return d&&(O=this.fboCache.acquire(_,v,f.AMBIENT_ILLUMINATION).acquireColor(36065,0),p.bindFramebuffer(O.fbo),p.setViewport(0,0,_,v),p.setClearColor(1,1,1,0),p.clear(16384),this._drawParametersUpscale.colorTexture=D.getTexture(),this._drawParametersUpscale.weightTexture=D.getTexture(36065),p.bindTechnique(d,a,this._passParameters,this._drawParametersUpscale),p.screen.draw(),D.release()),p.setViewport4fv(m.fullViewport),this._passParameters.temporalSampleFrame=(this._passParameters.temporalSampleFrame+1)%64,++this._passParameters.accumulatedFrames,this._cacheGlobalIllumination(O),this._passParameters.accumulatedFrames<this._maxFrames&&this._requestRender(),O}_requestRender(){this._isGlobalIlluminationUpdate=!0,this.requestRender(1),this._isGlobalIlluminationUpdate=!1}_cacheGlobalIllumination(e){this._globalIllumination!==e&&(this._globalIllumination=n(this._globalIllumination),this._globalIllumination=e,this._globalIllumination.retain())}get _emptyOutput(){let e=this.renderingContext,{fullWidth:t,fullHeight:n}=this.bindParameters.camera,r=this.fboCache.acquire(t,n,f.AMBIENT_ILLUMINATION).acquireColor(g,0);return e.bindFramebuffer(r.fbo),e.setViewport(0,0,t,n),e.clearBuffer(0,[0,0,0,1]),e.clearBuffer(1,[0,0,0,0]),r}get _canRender(){let{reprojection:e,hasEmission:t,globalIllumination:n}=this.bindParameters;return!(!e.lastFrameColor||t&&!e.lastFrameEmission||!e.lastFrameDepth||!n||this._resetBuffer)}get _mode(){let{hasGlobalIlluminationHighQuality:e,hasGlobalIllumination:t}=this.view.stage.renderer;return e?2:+!!t}_resetAccumulatedFrames(){this._passParameters.accumulatedFrames=0,this._globalIllumination=n(this._globalIllumination)}get test(){let e=this;return{passParameters:this._passParameters,configuration:this._configuration,get maxFrames(){return e._maxFrames},set maxFrames(t){e._maxFrames=t},get lowQualityResolutionScale(){return e._lowQualityResolutionScale},set lowQualityResolutionScale(t){e._lowQualityResolutionScale=t},get mode(){return e._mode},restartAccumulation:()=>{this._resetAccumulatedFrames(),this._passParameters.temporalSampleFrame=0,this._resetBuffer=!0,this._requestRender()}}}};e([i()],Z.prototype,`consumes`,void 0),e([i()],Z.prototype,`produces`,void 0),Z=e([r(`esri.views.3d.webgl-engine.effects.globalIllumination.GlobalIllumination`)],Z);function me(e,t){t.receiveGlobalIllumination?(e.uniforms.add(new k(`hasGlobalIlluminationTexture`,e=>e.globalIllumination!=null),new A(`globalIlluminationTexture`,e=>e.globalIllumination?.getTexture())),e.constants.add(`blurSizePixelsInverse`,`float`,1),e.code.add(w`vec3 readGlobalIlluminationOcclusionInverse() {
if (!hasGlobalIlluminationTexture) {
return vec3(1.0);
}
ivec2 texel = ivec2(gl_FragCoord.xy * blurSizePixelsInverse);
return vec3(texelFetch(globalIlluminationTexture, texel, 0).a);
}
vec3 readGlobalIlluminationOcclusion() {
return 1.0 - readGlobalIlluminationOcclusionInverse();
}
vec4 readGlobalIlluminationEmissionInverse() {
if (!hasGlobalIlluminationTexture) {
return vec4(1.0);
}
ivec2 texel = ivec2(gl_FragCoord.xy * blurSizePixelsInverse);
return 1.0 - vec4(texelFetch(globalIlluminationTexture, texel, 0).rgb, 0.0);
}
vec4 readGlobalIlluminationEmission() {
return max((1.0 - readGlobalIlluminationEmissionInverse() - 0.01) / 0.99, 0.0);
}`)):e.code.add(w`vec3 readGlobalIlluminationOcclusionInverse() { return vec3(1.0); }
vec3 readGlobalIlluminationOcclusion() { return vec3(0.0); }
vec4 readGlobalIlluminationEmissionInverse() { return vec4(1.0); }
vec4 readGlobalIlluminationEmission() { return vec4(0.0); }`)}function he(e){e.code.add(w`float mapChannel(float x, vec2 p) {
if((x < p.x) && (p.x == 0.0) || !(x < p.x) && (p.x == 1.0)) {
return 0.0;
}
float result = (x < p.x) ? mix(0.0, p.y, x/p.x) : mix(p.y, 1.0, (x - p.x) / (1.0 - p.x) );
return max(result, 0.0);
}`),e.code.add(w`vec3 blackLevelSoftCompression(vec3 color, float averageAmbientRadiance) {
vec2 p = vec2(0.02, 0.0075) * averageAmbientRadiance;
return vec3(mapChannel(color.x, p), mapChannel(color.y, p), mapChannel(color.z, p));
}`)}function Q(e){e.constants.add(`ambientBoostFactor`,`float`,m)}function $(e){e.uniforms.add(new E(`lightingGlobalFactor`,e=>e.lighting.globalFactor))}function ge(e,t){let{pbrMode:n,spherical:r,hasColorTexture:i,receiveGlobalIllumination:a}=t;e.include(ee),e.include(me,t),e.include(K,t),n!==0&&e.include(ne,t),e.include(N,t),e.include(ae),e.include(B,t);let o=!(n===2&&!i);o&&e.include(he),Q(e),$(e),F(e),e.code.add(w`
    float additionalDirectedAmbientLight(float lightAlignment) {
      return smoothstep(0.0, 1.0, clamp(lightAlignment * 2.5, 0.0, 1.0));
    }

    float additionalDirectedAmbientLight(vec3 vPosWorld) {
      float lightAlignment = dot(${r?w`normalize(vPosWorld)`:w`vec3(0.0, 0.0, 1.0)`}, mainLightDirection);
      return smoothstep(0.0, 1.0, clamp(lightAlignment * 2.5, 0.0, 1.0));
    }
  `),P(e),e.code.add(w`vec3 evaluateAdditionalLighting(float ambientOcclusion, vec3 vPosWorld) {
float additionalAmbientScale = additionalDirectedAmbientLight(vPosWorld);
return (1.0 - ambientOcclusion) * additionalAmbientScale * ambientBoostFactor * lightingGlobalFactor * mainLightIntensity;
}`);let s=a?`globalIlluminationOcclusion`:`ssao`,c=a?.75:1,l=a?1.5:1;switch(n){case 0:case 4:case 3:e.include(I),e.code.add(w`vec3 evaluateSceneLighting(vec3 normalWorld, vec3 albedo, float shadow, float ssao, vec3 additionalLight) {
vec3 mainLighting = applyShading(normalWorld, shadow);
vec3 ambientLighting = calculateAmbientIrradiance(normalWorld) * (1.0 - ssao);
vec3 albedoLinear = linearizeGamma(albedo);
vec3 totalLight = mainLighting + ambientLighting + additionalLight;
totalLight = min(totalLight, vec3(PI));
vec3 outColor = vec3((albedoLinear / PI) * totalLight);
return delinearizeGamma(outColor);
}`);break;case 1:case 2:{let n=a?.35:.2;e.code.add(w`
        const float fillLightIntensity = 0.25;
        const float horizonLightDiffusion = 0.4;
        const float additionalAmbientIrradianceFactor = 0.02;
        const float groundReflectance = ${w.float(n)};

        vec3 evaluateSceneLightingPBR(vec3 normal, vec3 albedo, float shadow, float ssao, vec3 additionalLight,
                                      vec3 viewDirection, vec3 upDirection, vec3 mrr, float additionalAmbientIrradiance) {
          PBRShadingInfo inputs;
          calculatePBRInputs(inputs, normal, viewDirection, upDirection, albedo, mrr);

          ${T(a,w`vec3 globalIlluminationOcclusion = min(1.2 * readGlobalIlluminationOcclusion(), 1.0);`)}
      `),t.useFillLights?e.uniforms.add(new k(`hasFillLights`,e=>e.enableFillLights)):e.constants.add(`hasFillLights`,`bool`,!1),e.code.add(w`
        vec3 ambientDir = vec3(5.0 * upDirection[1] - upDirection[0] * upDirection[2], - 5.0 * upDirection[0] - upDirection[2] * upDirection[1], upDirection[1] * upDirection[1] + upDirection[0] * upDirection[0]);
        ambientDir = ambientDir != vec3(0.0) ? normalize(ambientDir) : normalize(vec3(5.0, -1.0, 0.0));

        inputs.NdotAmbDir = hasFillLights ? abs(dot(normal, ambientDir)) : 1.0;

        // Calculate the irradiance components: sun, fill lights and the sky.
        vec3 mainLightIrradianceComponent = ${w.float(c)} * inputs.NdotL * (1.0 - shadow) * mainLightIntensity;
        vec3 fillLightsIrradianceComponent = inputs.NdotAmbDir * mainLightIntensity * fillLightIntensity;
        // calculate ambient irradiance for localView and additionalLight for globalView
        vec3 ambientLightIrradianceComponent = ${w.float(l)} * calculateAmbientIrradiance(normal) * (1.0 - ${s}) + additionalLight;

        // Assemble the overall irradiance of the sky that illuminates the surface
        inputs.skyIrradianceToSurface = ambientLightIrradianceComponent + mainLightIrradianceComponent + fillLightsIrradianceComponent ;
        // Assemble the overall irradiance of the ground that illuminates the surface. for this we use the simple model that changes only the sky irradiance by the groundReflectance
        inputs.groundIrradianceToSurface = groundReflectance * ambientLightIrradianceComponent + mainLightIrradianceComponent + fillLightsIrradianceComponent ;
      `),e.uniforms.add(new E(`lightingSpecularStrength`,e=>e.lighting.mainLight.specularStrength),new E(`lightingEnvironmentStrength`,e=>e.lighting.mainLight.environmentStrength)).code.add(w`
        vec3 horizonRingDir = inputs.RdotUP * upDirection - inputs.reflectedView;
        vec3 horizonRingH = normalize(horizonRingDir - viewDirection);
        inputs.NdotH_Horizon = dot(normal, horizonRingH);

        vec3 mainLightRadianceComponent = lightingSpecularStrength * normalDistribution(inputs.NdotH, inputs.roughness) * mainLightIntensity * (1.0 - shadow);
        vec3 horizonLightRadianceComponent = lightingEnvironmentStrength * normalDistribution(inputs.NdotH_Horizon, min(inputs.roughness + horizonLightDiffusion, 1.0)) * mainLightIntensity * fillLightIntensity;

        // calculateAmbientRadiance for localView and additionalLight for global view
        vec3 ambientLightRadianceComponent = lightingEnvironmentStrength * calculateAmbientRadiance() * (1.0 - ${s}) + additionalLight;
        float normalDirectionModifier = mix(1., min(mix(0.1, 2.0, (inputs.NdotUP + 1.) * 0.5), 1.0), clamp(inputs.roughness * 5.0, 0.0 , 1.0));

        // Assemble the overall radiance of the sky that illuminates the surface
        inputs.skyRadianceToSurface = (ambientLightRadianceComponent + horizonLightRadianceComponent) * normalDirectionModifier + mainLightRadianceComponent;

        // Assemble the overall radiance of the ground that illuminates the surface. for this we use the simple model that changes only the sky radiance by the groundReflectance
        inputs.groundRadianceToSurface = 0.5 * groundReflectance * (ambientLightRadianceComponent + horizonLightRadianceComponent) * normalDirectionModifier + mainLightRadianceComponent;

        // Calculate average ambient radiance - This is used in the gamut mapping process to determine the black level for compression
        inputs.averageAmbientRadiance = ambientLightIrradianceComponent[1] * (1.0 + groundReflectance);
      `),e.code.add(w`
        vec3 reflectedColorComponent = evaluateEnvironmentIllumination(inputs);
        vec3 additionalMaterialReflectanceComponent = inputs.albedoLinear * additionalAmbientIrradiance;
        vec3 outColorLinear = reflectedColorComponent + additionalMaterialReflectanceComponent;

        ${T(a,w`
        vec3 globalIlluminationEmission = 2.25 * (0.75 * inputs.albedoLinear + 0.25) * readGlobalIlluminationEmission().rgb;
        outColorLinear += globalIlluminationEmission;`)}

      ${o?w`vec3 adjustedOutColorLinear = blackLevelSoftCompression(outColorLinear, inputs.averageAmbientRadiance);`:w`vec3 adjustedOutColorLinear = max(vec3(0.0), outColorLinear - 0.005 * inputs.averageAmbientRadiance);`}

        return delinearizeGamma(adjustedOutColorLinear);
      }
    `);break}case 5:case 6:{let t=a?.35:.5,n=a?.75:1,r=a?1.5:1;F(e),P(e),e.code.add(w`
      const float roughnessTerrain = 0.5;
      const float specularityTerrain = ${w.float(t)};

      vec3 evaluatePBRSimplifiedLighting(vec3 normal, vec3 albedo, float shadow, float ssao, vec3 additionalLight, vec3 viewDirection, vec3 upDirection) {
        PBRShadingInfo inputs;
        calculateSimplifiedInputs(inputs, normal, viewDirection, upDirection, albedo);

        ${T(a,w`vec3 globalIlluminationOcclusion = min(1.2 * readGlobalIlluminationOcclusion(), 1.0);`)}

        vec3 mainLightIrradianceComponent = ${w.float(n)} * (1.0 - shadow) * inputs.NdotL * mainLightIntensity;
        vec3 ambientLightIrradianceComponent = ${w.float(r)} * calculateAmbientIrradiance(normal) * (1.0 - ${s}) + additionalLight;
        vec3 ambientSky = ambientLightIrradianceComponent + mainLightIrradianceComponent;

        vec3 indirectDiffuse = ((1.0 - inputs.NdotUP) * mainLightIrradianceComponent + (1.0 + inputs.NdotUP ) * ambientSky) * 0.5;
        vec3 outDiffColor = inputs.albedoLinear * (1.0 - inputs.f0) * indirectDiffuse / PI;

        vec3 mainLightRadianceComponent = normalDistribution(inputs.NdotH, roughnessTerrain) * mainLightIntensity;
        vec2 dfg = prefilteredDFGAnalytical(roughnessTerrain, inputs.NdotV);
        vec3 specularColor = inputs.f0 * dfg.x + inputs.f90 * dfg.y;
        vec3 specularComponent = specularityTerrain * specularColor * mainLightRadianceComponent;

        vec3 outColorLinear = outDiffColor + specularComponent;

        ${T(a,w`
        vec3 globalIlluminationEmission = 2.25 * (0.75 * inputs.albedoLinear + 0.25) * readGlobalIlluminationEmission().rgb;
        outColorLinear += globalIlluminationEmission;`)}

        return delinearizeGamma(outColorLinear);
      }
      `);break}}}export{K as a,Z as i,Q as n,G as o,ge as r,$ as t};