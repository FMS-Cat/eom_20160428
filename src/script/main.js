( function() {

  'use strict';

  let xorshift = require( './xorshift' );
  xorshift( 421458254021 );

  let glslify = require( 'glslify' );
  let GLCat = require( './glcat' );

  // ---

  let clamp = function( _value, _min, _max ) {
    return Math.min( Math.max( _value, _min ), _max );
  };

  let saturate = function( _value ) {
    return clamp( _value, 0.0, 1.0 );
  };

  // ---

  let width = canvas.width = 300;
  let height = canvas.height = 300;
  let gl = canvas.getContext( 'webgl' );
  let glCat = new GLCat( gl );

  let particleCountSqrt = 256;
  let particleCount = particleCountSqrt * particleCountSqrt;

  // ---

  let vboQuad = glCat.createVertexbuffer( [ -1, -1, 1, -1, -1, 1, 1, 1 ] );
  let vboCube = glCat.createVertexbuffer( ( function() {
		let a = [];
		for ( let iy = 0; iy < particleCountSqrt; iy ++ ) {
			for ( let ix = 0; ix < particleCountSqrt; ix ++ ) {
				for ( let iz = 0; iz < 36; iz ++ ) {
					a.push( ix );
					a.push( iy );
					a.push( iz );
				}
			}
		}
		return a;
	} )() );

  // ---

  let vertQuad = glslify( './shader/quad.vert' );

  let programReturn = glCat.createProgram(
    vertQuad,
    glslify( './shader/return.frag' )
  );

  let programParticleCompute = glCat.createProgram(
    vertQuad,
    glslify( './shader/particle-compute.frag' )
  );

  let programMotionblur = glCat.createProgram(
    vertQuad,
    glslify( './shader/motionblur.frag' )
  );

  let programPost = glCat.createProgram(
    vertQuad,
    glslify( './shader/post.frag' )
  );

  let programParticleRender = glCat.createProgram(
    glslify( './shader/particle-render.vert' ),
    glslify( './shader/particle-render.frag' )
  );

  let programParticleRenderShadow = glCat.createProgram(
    glslify( './shader/particle-render.vert' ),
    glslify( './shader/particle-render-shadow.frag' )
  );

  // ---

  let framebufferParticleCompute = glCat.createFloatFramebuffer( particleCountSqrt * 4, particleCountSqrt );
  let framebufferParticleComputeReturn = glCat.createFloatFramebuffer( particleCountSqrt * 4, particleCountSqrt );

  let shadowSize = 2048;
  let framebufferParticleShadow = glCat.createFloatFramebuffer( shadowSize, shadowSize );
  let framebufferParticleRender = glCat.createFloatFramebuffer( width, height );

  let framebufferMotionblur = glCat.createFloatFramebuffer( width, height );
  let framebufferMotionblurReturn = glCat.createFloatFramebuffer( width, height );

  // ---

  let textureRandomSize = 2048;
  let textureRandom = glCat.createTexture();
  glCat.textureWrap( textureRandom, gl.REPEAT );
  glCat.setTextureFromFloatArray(
    textureRandom,
    textureRandomSize,
    textureRandomSize,
    ( function() {
      let len = textureRandomSize * textureRandomSize * 4;
      let ret = new Float32Array( len );

      for ( let iArr = 0; iArr < len; iArr ++ ) {
        ret[ iArr ] = xorshift();
      }

      return ret;
    } )()
  );

  let textureNemui = glCat.createTexture();
  glCat.textureWrap( textureNemui, gl.REPEAT );
  glCat.setTextureFromFloatArray(
    textureNemui,
    particleCountSqrt,
    particleCountSqrt,
    require( './nemui' )( particleCount )
  );

  let textureSphereRandom = glCat.createTexture();
  glCat.textureWrap( textureSphereRandom, gl.REPEAT );
  glCat.setTextureFromFloatArray(
    textureSphereRandom,
    particleCountSqrt,
    particleCountSqrt,
    require( './sphere-random' )( particleCount )
  );

  let textureCube = glCat.createTexture();
  glCat.setTextureFromFloatArray( textureCube, 2, 36, require( './cube-vertices' ) );

  // ---

  let frame = 0;
  let frames = 150;
  let blurSample = 40;
  let time = 0.0;
  let stop = false;

  // ---

  let cameraPos = [ 0.0, 0.0, 1.5 ];
  let lightPos = [ 1.0 * 0.6, 2.0 * 0.6, 3.0 * 0.6 ];

  // ---

  let computeParticle = function( _target, _deltaTime ) {

    gl.viewport( 0, 0, particleCountSqrt * 4.0, particleCountSqrt );
    glCat.useProgram( programParticleCompute );
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferParticleComputeReturn );
    glCat.clear( 0.0, 0.0, 0.0, 0.0 );

    glCat.attribute( 'p', vboQuad, 2 );

    glCat.uniform1f( 'time', time );
    glCat.uniform1f( 'particleCountSqrt', particleCountSqrt );
    glCat.uniform1i( 'frameZero', frame % frames === 0 );
    glCat.uniform1f( 'deltaTime', _deltaTime );

    glCat.uniformTexture( 'textureRandom', textureRandom, 0 );
    glCat.uniformTexture( 'textureParticle', framebufferParticleCompute.texture, 1 );
    glCat.uniformTexture( 'textureNemui', textureNemui, 2 );
    glCat.uniformTexture( 'textureSphereRandom', textureSphereRandom, 3 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    // ---

    gl.viewport( 0, 0, particleCountSqrt * 4.0, particleCountSqrt );
    glCat.useProgram( programReturn );
    gl.bindFramebuffer( gl.FRAMEBUFFER, _target );
    glCat.clear( 0.0, 0.0, 0.0, 0.0 );

    glCat.attribute( 'p', vboQuad, 2 );

    glCat.uniform2fv( 'resolution', [ particleCountSqrt * 4.0, particleCountSqrt ] );

    glCat.uniformTexture( 'texture', framebufferParticleComputeReturn.texture, 0 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  };

  // ---

  let renderParticle = function( _compute, _target, _shadow ) {

    gl.viewport( 0, 0, shadowSize, shadowSize );
    glCat.useProgram( programParticleRenderShadow );
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferParticleShadow );
    glCat.clear( 1.0, 1.0, 1.0 );

    glCat.attribute( 'uv', vboCube, 3 );

    glCat.uniform1f( 'time', time );
    glCat.uniform1f( 'particleCountSqrt', particleCountSqrt );
    glCat.uniform2fv( 'resolution', [ shadowSize, shadowSize ] );
    glCat.uniform3fv( 'u_cameraPos', lightPos );
    glCat.uniform3fv( 'u_lightPos', lightPos );

    glCat.uniformTexture( 'textureParticle', _compute, 0 );
    glCat.uniformTexture( 'textureCube', textureCube, 1 );

    gl.drawArrays( gl.TRIANGLES, 0, vboCube.length / 3.0 );

    // ---

    gl.viewport( 0, 0, width, height );
    glCat.useProgram( programParticleRender );
    gl.bindFramebuffer( gl.FRAMEBUFFER, _target );
    glCat.clear( 1.0, 1.0, 1.0 );

    glCat.attribute( 'uv', vboCube, 3 );

    glCat.uniform1f( 'time', time );
    glCat.uniform1f( 'particleCountSqrt', particleCountSqrt );
    glCat.uniform2fv( 'resolution', [ width, height ] );
    glCat.uniform3fv( 'u_cameraPos', cameraPos );
    glCat.uniform3fv( 'u_lightPos', lightPos );

    glCat.uniformTexture( 'textureParticle', _compute, 0 );
    glCat.uniformTexture( 'textureCube', textureCube, 1 );
    glCat.uniformTexture( 'textureShadow', framebufferParticleShadow.texture, 2 );

    gl.drawArrays( gl.TRIANGLES, 0, vboCube.length / 3.0 );

  };

  // ---

  let render = function( _target, _deltaTime ) {

    computeParticle( framebufferParticleCompute, _deltaTime );
    renderParticle( framebufferParticleCompute.texture, _target, false );

    gl.flush();

  };

  // ---

  let motionblur = function( _texture, _target, _blurCount ) {

    gl.viewport( 0, 0, width, height );
    glCat.useProgram( programMotionblur );
    gl.bindFramebuffer( gl.FRAMEBUFFER, framebufferMotionblurReturn );
    glCat.clear();

    glCat.attribute( 'p', vboQuad, 2 );
    glCat.uniform1f( 'add', 1.0 / blurSample );
    glCat.uniform1i( 'init', _blurCount === 0 );
    glCat.uniform2fv( 'resolution', [ width, height ] );
    glCat.uniformTexture( 'renderTexture', _texture, 0 );
    glCat.uniformTexture( 'blurTexture', framebufferMotionblur.texture, 1 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    // ------

    gl.viewport( 0, 0, width, height );
    glCat.useProgram( programReturn );
    gl.bindFramebuffer( gl.FRAMEBUFFER, _target );
    glCat.clear();

    glCat.attribute( 'p', vboQuad, 2 );
    glCat.uniform2fv( 'resolution', [ width, height ] );
    glCat.uniformTexture( 'texture', framebufferMotionblurReturn.texture, 0 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  };

  // ---

  let post = function( _input, _target ) {

    gl.viewport( 0, 0, width, height );
    glCat.useProgram( programPost );
    gl.bindFramebuffer( gl.FRAMEBUFFER, _target );
    glCat.clear();

    glCat.attribute( 'p', vboQuad, 2 );

    glCat.uniform1f( 'time', time );
    glCat.uniform2fv( 'resolution', [ width, height ] );

    glCat.uniformTexture( 'texture', _input, 0 );

    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

  };

  // ---

  let renderA = document.createElement( 'a' );

  let saveFrame = function() {
    renderA.href = canvas.toDataURL();
    renderA.download = ( '0000' + frame ).slice( -5 ) + '.png';
    renderA.click();
  };

  // ---

  let update = function() {

    if ( !checkboxPlay.checked ) {
      requestAnimationFrame( update );
      return;
    }

    if ( checkboxBlur.checked ) {
      for ( let i = 0; i < blurSample; i ++ ) {
        let timePrev = time;
        time += 1.0 / blurSample / frames;
        let deltaTime = ( time - timePrev );

        render( framebufferParticleRender, deltaTime * 4.0 );
        motionblur(
          framebufferParticleRender.texture,
          framebufferMotionblur,
          i
        );
      }
      post( framebufferMotionblur.texture, null );
    } else {
      let timePrev = time;
      time += 1.0 / frames;
      let deltaTime = ( time - timePrev );

      render( framebufferParticleRender, deltaTime * 4.0 );
      post( framebufferParticleRender.texture, null );
    }

    if ( checkboxSave.checked && frames <= frame ) {
      saveFrame();
    }

    frame ++;
    if ( frame % frames === 0 ) {
    }

    requestAnimationFrame( update );

  };
  update();

} )();
