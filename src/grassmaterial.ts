import * as THREE from "./three/build/three.module.js"

export class GrassMaterial extends THREE.ShaderMaterial {
	constructor(color:number, texture:string, threshold:number, dy:number) {
		const uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.phong.uniforms)
		uniforms.uDy = { value:dy }
		uniforms.uGrassColor = { value:new THREE.Color(color) }
		uniforms.uNoiseTexture = { value:new THREE.TextureLoader().load(texture) }
		uniforms.uNoiseThreshold = { value:threshold }
		uniforms.uVisibleDistance = { value:20.0 }

		super({
			defines: {
				USE_UV: true,
			},
			lights:true,
			fog:true,
			uniforms,
			vertexShader,
			fragmentShader,
		})
	}
}

const vertexShader = `
#define PHONG

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

varying vec3 vPosition;
varying vec3 vRawPosition;
varying vec3 vRawNormal;

void main() {

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

	vRawPosition = position;
	vRawNormal = objectNormal;
	vPosition = mvPosition.xyz;
}
`

const fragmentShader = `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec3 vPosition;
varying vec3 vRawPosition;
varying vec3 vRawNormal;

uniform sampler2D uNoiseTexture;
uniform float uNoiseThreshold;
uniform vec3 uGrassColor;
uniform float uDy;
uniform float uVisibleDistance;

void main() {

	if (uVisibleDistance < distance(vPosition, vViewPosition)) {
		discard;
	}

	vec4 noiseTex = texture2D(uNoiseTexture, vUv);
	if (noiseTex.r < uNoiseThreshold) {
		discard;
	}

	if (vRawPosition.y - uDy < -0.01 || 8.0 < vRawPosition.y - uDy) {
		discard;
	}

	if (vRawNormal.y < 0.5) {
		discard;
	}

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4( diffuse, opacity );
	diffuseColor = vec4(uGrassColor, opacity);

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	#include <envmap_fragment>

	gl_FragColor = vec4( outgoingLight, diffuseColor.a );

	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}
`