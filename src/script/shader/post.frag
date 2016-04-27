#define PI 3.14159265

precision highp float;

uniform vec2 resolution;
uniform sampler2D texture;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 tex = texture2D( texture, uv );

  tex *= 1.0 - length( uv - 0.5 ) * 0.2;

  gl_FragColor = vec4( vec3( tex.xyz ), 1.0 );
}
