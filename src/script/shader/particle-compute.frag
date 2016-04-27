#define PI 3.14159265
#define V vec2(0.,1.)
#define saturate(i) clamp(i,0.,1.)

// ---

precision highp float;

uniform float time;
uniform float particleCountSqrt;
uniform bool frameZero;
uniform float deltaTime;

uniform sampler2D textureParticle;
uniform sampler2D textureRandom;
uniform sampler2D textureNemui;
uniform sampler2D textureSphereRandom;

// ---

mat2 rotate2D( float _t ) {
  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );
}

vec3 rotateEuler( vec3 _p, vec3 _r ) {
  vec3 p = _p;
  p.yz = rotate2D( _r.x ) * p.yz;
  p.zx = rotate2D( _r.y ) * p.zx;
  p.xy = rotate2D( _r.z ) * p.xy;
  return p;
}

// ---

void main() {
  vec2 reso = vec2( 4.0, 1.0 ) * particleCountSqrt;

  float type = mod( floor( gl_FragCoord.x ), 4.0 );

  vec3 pos = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 0.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 vel = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 1.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 rot = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 2.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 life = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 3.0 - type, 0.0 ) ) / reso ).xyz;

  vec3 posI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 0.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 velI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 1.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 rotI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 2.0 - type, 0.0 ) ) / reso ).xyz;
  vec3 lifeI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 3.0 - type, 0.0 ) ) / reso ).xyz;

  if ( frameZero ) {
    pos = V.xxx;

    vel = 7.0 * texture2D( textureSphereRandom, gl_FragCoord.xy / particleCountSqrt ).xyz;

    rot = ( rotI - 0.5 ) * 3.0;

    life = lifeI;
    life.y = 0.0;
  }

  if ( mod( time, 1.0 ) < 0.2 ) {
    life.x *= exp( -deltaTime * 6.0 );

    pos.yz = rotate2D( life.x * deltaTime * 9.0 ) * pos.yz;
    pos.zx = rotate2D( life.x * deltaTime * 19.0 ) * pos.zx;
    vel.yz = rotate2D( life.x * deltaTime * 9.0 ) * vel.yz;
    vel.zx = rotate2D( life.x * deltaTime * 19.0 ) * vel.zx;

    pos += deltaTime * vel * life.x;

    life.y = mix(
      pow( lifeI.y, 19.0 ) * 2.0,
      life.y,
      exp( -deltaTime * 6.0 )
    );

  } else if ( mod( time, 1.0 ) < 0.4 ) {
    vec3 target = texture2D( textureRandom, gl_FragCoord.xy / particleCountSqrt ).xyz;
    target = ( target - 0.5 ) * 1.2;

    pos = mix(
      target,
      pos,
      exp( -deltaTime * 6.0 )
    );

    life.y = mix(
      pow( lifeI.y, 1E1 ) * 3.0,
      life.y,
      exp( -deltaTime * 6.0 )
    );

    rot = mix(
      PI * V.xyx,
      rot,
      exp( -deltaTime * 6.0 )
    );

  } else if ( mod( time, 1.0 ) < 0.6 ) {
    vec3 target = texture2D( textureNemui, gl_FragCoord.xy / particleCountSqrt ).xyz;

    pos = mix(
      target,
      pos,
      exp( -deltaTime * 6.0 )
    );

    life.y = mix(
      pow( lifeI.y, 4E2 ) * 9.0,
      life.y,
      exp( -deltaTime * 6.0 )
    );

    rot = mix(
      ( rotI - 0.5 ) * 0.7 + PI * V.yyx,
      rot,
      exp( -deltaTime * 6.0 )
    );

  } else if ( mod( time, 1.0 ) < 0.8 ) {
    vel = ( velI - 0.5 ) * 0.6;
    vec3 target = texture2D( textureNemui, gl_FragCoord.xy / particleCountSqrt ).xyz;
    target.xy *= 1.2;
    target.z *= 0.1;

    life.y = mix(
      lifeI.y,
      life.y,
      exp( -deltaTime * 6.0 )
    );

    pos = mix(
      target,
      pos,
      exp( -deltaTime * 6.0 )
    );

    rot = mix(
      PI * V.yyx,
      rot,
      exp( -deltaTime * 4.0 )
    );

  } else {
    vel *= exp( -deltaTime * 5.0 );

    vel.x += 9.0 * life.z * deltaTime;
    life.y *= exp( -deltaTime * 6.0 );
    pos += vel * deltaTime;
  }

  vec3 ret;
  if ( type == 0.0 ) {
    ret = pos;
  } else if ( type == 1.0 ) {
    ret = vel;
  } else if ( type == 2.0 ) {
    ret = rot;
  } else if ( type == 3.0 ) {
    ret = life;
  }

  gl_FragColor = vec4( ret, 1.0 );
}
