(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/cube-vertices.js":[function(require,module,exports){
'use strict';

(function () {

  'use strict';

  var b = [[-1, -1, 1], [0, 0, 1], [1, -1, 1], [0, 0, 1], [1, 1, 1], [0, 0, 1], [-1, -1, 1], [0, 0, 1], [1, 1, 1], [0, 0, 1], [-1, 1, 1], [0, 0, 1]];

  var bm = function bm(_xRot, _yRot) {
    return b.reduce(function (_arr, _v, _i) {
      var x = b[_i][0];
      var y = b[_i][1];
      var z = b[_i][2];

      var zTemp = Math.cos(_yRot) * z - Math.sin(_yRot) * x;
      x = Math.sin(_yRot) * z + Math.cos(_yRot) * x;
      z = zTemp;

      var yTemp = Math.cos(_xRot) * y - Math.sin(_xRot) * z;
      z = Math.sin(_xRot) * y + Math.cos(_xRot) * z;
      y = yTemp;

      return _arr.concat([x, y, z, 0]);
    }, []);
  };

  var cubeVertices = function cubeVertices() {
    var a = bm(0.0, 0.0);
    a = a.concat(bm(0.0, Math.PI / 2.0));
    a = a.concat(bm(0.0, Math.PI));
    a = a.concat(bm(0.0, Math.PI / 2.0 * 3.0));
    a = a.concat(bm(Math.PI / 2.0, 0.0));
    a = a.concat(bm(-Math.PI / 2.0, 0.0));
    return a;
  };

  module.exports = cubeVertices();
})();

},{}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/glcat.js":[function(require,module,exports){
'use strict';

var _createClass = function () {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
		}
	}return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
	};
}();

function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) {
		throw new TypeError("Cannot call a class as a function");
	}
}

(function () {

	'use strict';

	var GLCat = function () {
		function GLCat(_gl) {
			_classCallCheck(this, GLCat);

			this.gl = _gl;
			var it = this;
			var gl = it.gl;

			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

			gl.getExtension('OES_texture_float');
			gl.getExtension('OES_float_linear');
			gl.getExtension('OES_half_float_linear');

			it.program = null;
		}

		_createClass(GLCat, [{
			key: 'createProgram',
			value: function createProgram(_vert, _frag, _onError) {

				var it = this;
				var gl = it.gl;

				var error = void 0;
				if (typeof _onError === 'function') {
					error = _onError;
				} else {
					error = function error(_str) {
						console.error(_str);
					};
				}

				var vert = gl.createShader(gl.VERTEX_SHADER);
				gl.shaderSource(vert, _vert);
				gl.compileShader(vert);
				if (!gl.getShaderParameter(vert, gl.COMPILE_STATUS)) {
					error(gl.getShaderInfoLog(vert));
					return null;
				}

				var frag = gl.createShader(gl.FRAGMENT_SHADER);
				gl.shaderSource(frag, _frag);
				gl.compileShader(frag);
				if (!gl.getShaderParameter(frag, gl.COMPILE_STATUS)) {
					error(gl.getShaderInfoLog(frag));
					return null;
				}

				var program = gl.createProgram();
				gl.attachShader(program, vert);
				gl.attachShader(program, frag);
				gl.linkProgram(program);
				if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
					program.locations = {};
					return program;
				} else {
					error(gl.getProgramInfoLog(program));
					return null;
				}
			}
		}, {
			key: 'useProgram',
			value: function useProgram(_program) {

				var it = this;
				var gl = it.gl;

				gl.useProgram(_program);
				it.program = _program;
			}
		}, {
			key: 'createVertexbuffer',
			value: function createVertexbuffer(_array) {

				var it = this;
				var gl = it.gl;

				var buffer = gl.createBuffer();

				gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_array), gl.STATIC_DRAW);
				gl.bindBuffer(gl.ARRAY_BUFFER, null);

				buffer.length = _array.length;
				return buffer;
			}
		}, {
			key: 'createIndexbuffer',
			value: function createIndexbuffer(_array) {

				var it = this;
				var gl = it.gl;

				var buffer = gl.createBuffer();

				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(_array), gl.STATIC_DRAW);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

				buffer.length = _array.length;
				return buffer;
			}
		}, {
			key: 'attribute',
			value: function attribute(_name, _buffer, _stride) {

				var it = this;
				var gl = it.gl;

				var location = void 0;
				if (it.program.locations[_name]) {
					location = it.program.locations[_name];
				} else {
					location = gl.getAttribLocation(it.program, _name);
					it.program.locations[_name] = location;
				}

				gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
				gl.enableVertexAttribArray(location);
				gl.vertexAttribPointer(location, _stride, gl.FLOAT, false, 0, 0);

				gl.bindBuffer(gl.ARRAY_BUFFER, null);
			}
		}, {
			key: 'getUniformLocation',
			value: function getUniformLocation(_name) {

				var it = this;
				var gl = it.gl;

				var location = void 0;

				if (it.program.locations[_name]) {
					location = it.program.locations[_name];
				} else {
					location = gl.getUniformLocation(it.program, _name);
					it.program.locations[_name] = location;
				}

				return location;
			}
		}, {
			key: 'uniform1i',
			value: function uniform1i(_name, _value) {

				var it = this;
				var gl = it.gl;

				var location = it.getUniformLocation(_name);
				gl.uniform1i(location, _value);
			}
		}, {
			key: 'uniform1f',
			value: function uniform1f(_name, _value) {

				var it = this;
				var gl = it.gl;

				var location = it.getUniformLocation(_name);
				gl.uniform1f(location, _value);
			}
		}, {
			key: 'uniform2fv',
			value: function uniform2fv(_name, _value) {

				var it = this;
				var gl = it.gl;

				var location = it.getUniformLocation(_name);
				gl.uniform2fv(location, _value);
			}
		}, {
			key: 'uniform3fv',
			value: function uniform3fv(_name, _value) {

				var it = this;
				var gl = it.gl;

				var location = it.getUniformLocation(_name);
				gl.uniform3fv(location, _value);
			}
		}, {
			key: 'uniformCubemap',
			value: function uniformCubemap(_name, _texture, _number) {

				var it = this;
				var gl = it.gl;

				var location = it.getUniformLocation(_name);
				gl.activeTexture(gl.TEXTURE0 + _number);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, _texture);
				gl.uniform1i(location, _number);
			}
		}, {
			key: 'uniformTexture',
			value: function uniformTexture(_name, _texture, _number) {

				var it = this;
				var gl = it.gl;

				var location = it.getUniformLocation(_name);
				gl.activeTexture(gl.TEXTURE0 + _number);
				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.uniform1i(location, _number);
			}
		}, {
			key: 'createTexture',
			value: function createTexture() {

				var it = this;
				var gl = it.gl;

				var texture = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.bindTexture(gl.TEXTURE_2D, null);

				return texture;
			}
		}, {
			key: 'textureFilter',
			value: function textureFilter(_texture, _filter) {

				var it = this;
				var gl = it.gl;

				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, _filter);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _filter);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}, {
			key: 'textureWrap',
			value: function textureWrap(_texture, _wrap) {

				var it = this;
				var gl = it.gl;

				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _wrap);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _wrap);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}, {
			key: 'setTexture',
			value: function setTexture(_texture, _image) {

				var it = this;
				var gl = it.gl;

				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _image);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}, {
			key: 'setTextureFromArray',
			value: function setTextureFromArray(_texture, _width, _height, _array) {

				var it = this;
				var gl = it.gl;

				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(_array));
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}, {
			key: 'setTextureFromFloatArray',
			value: function setTextureFromFloatArray(_texture, _width, _height, _array) {

				var it = this;
				var gl = it.gl;

				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, new Float32Array(_array));
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}, {
			key: 'copyTexture',
			value: function copyTexture(_texture, _width, _height) {

				var it = this;
				var gl = it.gl;

				gl.bindTexture(gl.TEXTURE_2D, _texture);
				gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, _width, _height, 0);
				gl.bindTexture(gl.TEXTURE_2D, null);
			}
		}, {
			key: 'createCubemap',
			value: function createCubemap(_arrayOfImage) {

				var it = this;
				var gl = it.gl;

				// order : X+, X-, Y+, Y-, Z+, Z-
				var texture = gl.createTexture();

				gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
				for (var i = 0; i < 6; i++) {
					gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, _arrayOfImage[i]);
				}
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

				return texture;
			}
		}, {
			key: 'createFramebuffer',
			value: function createFramebuffer(_width, _height) {

				var it = this;
				var gl = it.gl;

				var framebuffer = gl.createFramebuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

				framebuffer.depth = gl.createRenderbuffer();
				gl.bindRenderbuffer(gl.RENDERBUFFER, framebuffer.depth);
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth);

				framebuffer.texture = it.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, framebuffer.texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
				gl.bindTexture(gl.TEXTURE_2D, null);

				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);

				return framebuffer;
			}
		}, {
			key: 'createFloatFramebuffer',
			value: function createFloatFramebuffer(_width, _height) {

				var it = this;
				var gl = it.gl;

				var framebuffer = gl.createFramebuffer();
				gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

				framebuffer.depth = gl.createRenderbuffer();
				gl.bindRenderbuffer(gl.RENDERBUFFER, framebuffer.depth);
				gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, _width, _height);
				gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, framebuffer.depth);

				framebuffer.texture = it.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, framebuffer.texture);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, _width, _height, 0, gl.RGBA, gl.FLOAT, null);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
				gl.bindTexture(gl.TEXTURE_2D, null);

				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, framebuffer.texture, 0);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);

				return framebuffer;
			}
		}, {
			key: 'clear',
			value: function clear(_r, _g, _b, _a, _d) {

				var it = this;
				var gl = it.gl;

				var r = _r || 0.0;
				var g = _g || 0.0;
				var b = _b || 0.0;
				var a = typeof _a === 'number' ? _a : 1.0;
				var d = typeof _d === 'number' ? _d : 1.0;

				gl.clearColor(r, g, b, a);
				gl.clearDepth(d);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			}
		}]);

		return GLCat;
	}();

	if (typeof window !== 'undefined') {
		window.GLCat = GLCat;
	}

	if (typeof module !== 'undefined' && module.exports) {
		module.exports = GLCat;
	}
})();

},{}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/main.js":[function(require,module,exports){
'use strict';

(function () {

  'use strict';

  var xorshift = require('./xorshift');
  xorshift(421458254021);

  
  var GLCat = require('./glcat');

  // ---

  var clamp = function clamp(_value, _min, _max) {
    return Math.min(Math.max(_value, _min), _max);
  };

  var saturate = function saturate(_value) {
    return clamp(_value, 0.0, 1.0);
  };

  // ---

  var width = canvas.width = 300;
  var height = canvas.height = 300;
  var gl = canvas.getContext('webgl');
  var glCat = new GLCat(gl);

  var particleCountSqrt = 256;
  var particleCount = particleCountSqrt * particleCountSqrt;

  // ---

  var vboQuad = glCat.createVertexbuffer([-1, -1, 1, -1, -1, 1, 1, 1]);
  var vboCube = glCat.createVertexbuffer(function () {
    var a = [];
    for (var iy = 0; iy < particleCountSqrt; iy++) {
      for (var ix = 0; ix < particleCountSqrt; ix++) {
        for (var iz = 0; iz < 36; iz++) {
          a.push(ix);
          a.push(iy);
          a.push(iz);
        }
      }
    }
    return a;
  }());

  // ---

  var vertQuad = "#define GLSLIFY 1\nattribute vec2 p;\n\nvoid main() {\n  gl_Position = vec4( p, 0.0, 1.0 );\n}\n";

  var programReturn = glCat.createProgram(vertQuad, "precision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform sampler2D texture;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  gl_FragColor = texture2D( texture, uv );\n}\n");

  var programParticleCompute = glCat.createProgram(vertQuad, "#define PI 3.14159265\n#define V vec2(0.,1.)\n#define saturate(i) clamp(i,0.,1.)\n\n// ---\n\nprecision highp float;\n#define GLSLIFY 1\n\nuniform float time;\nuniform float particleCountSqrt;\nuniform bool frameZero;\nuniform float deltaTime;\n\nuniform sampler2D textureParticle;\nuniform sampler2D textureRandom;\nuniform sampler2D textureNemui;\nuniform sampler2D textureSphereRandom;\n\n// ---\n\nmat2 rotate2D( float _t ) {\n  return mat2( cos( _t ), sin( _t ), -sin( _t ), cos( _t ) );\n}\n\nvec3 rotateEuler( vec3 _p, vec3 _r ) {\n  vec3 p = _p;\n  p.yz = rotate2D( _r.x ) * p.yz;\n  p.zx = rotate2D( _r.y ) * p.zx;\n  p.xy = rotate2D( _r.z ) * p.xy;\n  return p;\n}\n\n// ---\n\nvoid main() {\n  vec2 reso = vec2( 4.0, 1.0 ) * particleCountSqrt;\n\n  float type = mod( floor( gl_FragCoord.x ), 4.0 );\n\n  vec3 pos = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 0.0 - type, 0.0 ) ) / reso ).xyz;\n  vec3 vel = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 1.0 - type, 0.0 ) ) / reso ).xyz;\n  vec3 rot = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 2.0 - type, 0.0 ) ) / reso ).xyz;\n  vec3 life = texture2D( textureParticle, ( gl_FragCoord.xy + vec2( 3.0 - type, 0.0 ) ) / reso ).xyz;\n\n  vec3 posI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 0.0 - type, 0.0 ) ) / reso ).xyz;\n  vec3 velI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 1.0 - type, 0.0 ) ) / reso ).xyz;\n  vec3 rotI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 2.0 - type, 0.0 ) ) / reso ).xyz;\n  vec3 lifeI = texture2D( textureRandom, ( gl_FragCoord.xy + vec2( 3.0 - type, 0.0 ) ) / reso ).xyz;\n\n  if ( frameZero ) {\n    pos = V.xxx;\n\n    vel = 7.0 * texture2D( textureSphereRandom, gl_FragCoord.xy / particleCountSqrt ).xyz;\n\n    rot = ( rotI - 0.5 ) * 3.0;\n\n    life = lifeI;\n    life.y = 0.0;\n  }\n\n  if ( mod( time, 1.0 ) < 0.2 ) {\n    life.x *= exp( -deltaTime * 6.0 );\n\n    pos.yz = rotate2D( life.x * deltaTime * 9.0 ) * pos.yz;\n    pos.zx = rotate2D( life.x * deltaTime * 19.0 ) * pos.zx;\n    vel.yz = rotate2D( life.x * deltaTime * 9.0 ) * vel.yz;\n    vel.zx = rotate2D( life.x * deltaTime * 19.0 ) * vel.zx;\n\n    pos += deltaTime * vel * life.x;\n\n    life.y = mix(\n      pow( lifeI.y, 19.0 ) * 2.0,\n      life.y,\n      exp( -deltaTime * 6.0 )\n    );\n\n  } else if ( mod( time, 1.0 ) < 0.4 ) {\n    vec3 target = texture2D( textureRandom, gl_FragCoord.xy / particleCountSqrt ).xyz;\n    target = ( target - 0.5 ) * 1.2;\n\n    pos = mix(\n      target,\n      pos,\n      exp( -deltaTime * 6.0 )\n    );\n\n    life.y = mix(\n      pow( lifeI.y, 1E1 ) * 3.0,\n      life.y,\n      exp( -deltaTime * 6.0 )\n    );\n\n    rot = mix(\n      PI * V.xyx,\n      rot,\n      exp( -deltaTime * 6.0 )\n    );\n\n  } else if ( mod( time, 1.0 ) < 0.6 ) {\n    vec3 target = texture2D( textureNemui, gl_FragCoord.xy / particleCountSqrt ).xyz;\n\n    pos = mix(\n      target,\n      pos,\n      exp( -deltaTime * 6.0 )\n    );\n\n    life.y = mix(\n      pow( lifeI.y, 4E2 ) * 9.0,\n      life.y,\n      exp( -deltaTime * 6.0 )\n    );\n\n    rot = mix(\n      ( rotI - 0.5 ) * 0.7 + PI * V.yyx,\n      rot,\n      exp( -deltaTime * 6.0 )\n    );\n\n  } else if ( mod( time, 1.0 ) < 0.8 ) {\n    vel = ( velI - 0.5 ) * 0.6;\n    vec3 target = texture2D( textureNemui, gl_FragCoord.xy / particleCountSqrt ).xyz;\n    target.xy *= 1.2;\n    target.z *= 0.1;\n\n    life.y = mix(\n      lifeI.y,\n      life.y,\n      exp( -deltaTime * 6.0 )\n    );\n\n    pos = mix(\n      target,\n      pos,\n      exp( -deltaTime * 6.0 )\n    );\n\n    rot = mix(\n      PI * V.yyx,\n      rot,\n      exp( -deltaTime * 4.0 )\n    );\n\n  } else {\n    vel *= exp( -deltaTime * 5.0 );\n\n    vel.x += 9.0 * life.z * deltaTime;\n    life.y *= exp( -deltaTime * 6.0 );\n    pos += vel * deltaTime;\n  }\n\n  vec3 ret;\n  if ( type == 0.0 ) {\n    ret = pos;\n  } else if ( type == 1.0 ) {\n    ret = vel;\n  } else if ( type == 2.0 ) {\n    ret = rot;\n  } else if ( type == 3.0 ) {\n    ret = life;\n  }\n\n  gl_FragColor = vec4( ret, 1.0 );\n}\n");

  var programMotionblur = glCat.createProgram(vertQuad, "precision highp float;\n#define GLSLIFY 1\n\nuniform bool init;\nuniform float add;\nuniform vec2 resolution;\nuniform sampler2D renderTexture;\nuniform sampler2D blurTexture;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  vec3 ret = texture2D( renderTexture, uv ).xyz * add;\n  if ( !init ) {\n    ret += texture2D( blurTexture, uv ).xyz;\n  }\n  gl_FragColor = vec4( ret, 1.0 );\n}\n");

  var programPost = glCat.createProgram(vertQuad, "#define PI 3.14159265\n\nprecision highp float;\n#define GLSLIFY 1\n\nuniform vec2 resolution;\nuniform sampler2D texture;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution;\n  vec4 tex = texture2D( texture, uv );\n\n  tex *= 1.0 - length( uv - 0.5 ) * 0.2;\n\n  gl_FragColor = vec4( vec3( tex.xyz ), 1.0 );\n}\n");

  var programParticleRender = glCat.createProgram("#define GLSLIFY 1\n#define PI 3.14159265\n#define V vec2(0.,1.)\n\n// ---\n\nattribute vec3 uv;\n\nvarying vec3 vPos;\nvarying vec3 vNormal;\nvarying float vLightDist;\nvarying vec2 vTextureShadowCoord;\n\nuniform float time;\nuniform vec2 resolution;\nuniform float particleCountSqrt;\nuniform vec3 u_cameraPos;\nuniform vec3 u_lightPos;\n\nuniform sampler2D textureParticle;\nuniform sampler2D textureCube;\n\n// ---\n\nmat4 lookAt( vec3 _pos, vec3 _tar, vec3 _air ) {\n  vec3 dir = normalize( _tar - _pos );\n  vec3 sid = normalize( cross( dir, _air ) );\n  vec3 top = normalize( cross( sid, dir ) );\n  return mat4(\n    sid.x, top.x, dir.x, 0.0,\n    sid.y, top.y, dir.y, 0.0,\n    sid.z, top.z, dir.z, 0.0,\n    - sid.x * _pos.x - sid.y * _pos.y - sid.z * _pos.z,\n    - top.x * _pos.x - top.y * _pos.y - top.z * _pos.z,\n    - dir.x * _pos.x - dir.y * _pos.y - dir.z * _pos.z,\n    1.0\n  );\n}\n\nmat4 perspective( float _fov, float _aspect, float _near, float _far ) {\n  float p = 1.0 / tan( _fov * PI / 180.0 / 2.0 );\n  float d = _far / ( _far - _near );\n  return mat4(\n    p / _aspect, 0.0, 0.0, 0.0,\n    0.0, p, 0.0, 0.0,\n    0.0, 0.0, d, 1.0,\n    0.0, 0.0, -_near * d, 0.0\n  );\n}\n\nmat2 rotate2D( float _theta ) {\n  return mat2( cos( _theta ), sin( _theta ), -sin( _theta ), cos( _theta ) );\n}\n\n// ---\n\nvoid main() {\n  vec3 pos = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 0.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n  vec3 vel = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 1.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n  vec3 rot = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 2.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n  vec3 life = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 3.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n\n  mat4 matP = perspective( 90.0, resolution.x / resolution.y, 0.01, 100.0 );\n  mat4 matV = lookAt( u_cameraPos, vec3( 0.0, 0.0, 0.0 ), vec3( 0.0, 1.0, 0.0 ) );\n\n  vec3 cubeVert = texture2D( textureCube, vec2( 0.5 / 2.0, uv.z / 36.0 ) ).xyz;\n  cubeVert.yz = rotate2D( rot.x ) * cubeVert.yz;\n  cubeVert.zx = rotate2D( rot.y ) * cubeVert.zx;\n  cubeVert.xy = rotate2D( rot.z ) * cubeVert.xy;\n  pos += cubeVert * 0.02 * life.y;\n\n  vNormal = texture2D( textureCube, vec2( 1.5 / 2.0, uv.z / 36.0 ) ).xyz;\n  vNormal.yz = rotate2D( rot.x ) * vNormal.yz;\n  vNormal.zx = rotate2D( rot.y ) * vNormal.zx;\n  vNormal.xy = rotate2D( rot.z ) * vNormal.xy;\n  vNormal = ( matV * vec4( vNormal, 0.0 ) ).xyz;\n\n  gl_Position = (\n    matP\n    * matV\n    * vec4( pos, 1.0 )\n  );\n\n  vec4 posFromLight = (\n    matP\n    * lookAt( u_lightPos, vec3( 0.0, 0.0, 0.0 ), vec3( 0.0, 1.0, 0.0 ) )\n    * vec4( pos, 1.0 )\n  );\n  vTextureShadowCoord = posFromLight.xy / posFromLight.w;\n\n  vLightDist = length( u_lightPos - pos );\n  vPos = pos;\n}\n", "#define PI 3.14159265\n#define saturate(i) clamp(i,0.,1.)\n#define V vec2(0.,1.)\n\n#define SHADOW_EPSILON 0.04\n\n// ---\n\nprecision highp float;\n#define GLSLIFY 1\n\nvarying vec3 vPos;\nvarying vec3 vNormal;\nvarying float vLightDist;\nvarying vec2 vTextureShadowCoord;\n\nuniform vec2 resolution;\nuniform vec3 u_cameraPos;\nuniform vec3 u_lightPos;\n\nuniform sampler2D textureShadow;\n\n// ---\n\nvoid main() {\n  float dist = length( u_cameraPos - vPos );\n  float decay = exp( -dist * 1E-1 );\n  vec3 ligDir = normalize( vPos - u_lightPos );\n  float dif = saturate( dot( vNormal, ligDir ) ) * 0.4 + 0.6;\n\n  float shadow = 1.0;\n  vec4 proj = texture2D( textureShadow, vTextureShadowCoord.xy * 0.5 + 0.5 );\n  if ( proj.y < 0.5 && proj.x + SHADOW_EPSILON < vLightDist ) {\n    shadow = 0.7;\n  }\n\n  gl_FragColor = vec4( mix(\n    V.yyy,\n    vec3( 1.1, 0.2, 0.2 ) * dif * shadow,\n    decay\n  ), 1.0 );\n}\n");

  var programParticleRenderShadow = glCat.createProgram("#define GLSLIFY 1\n#define PI 3.14159265\n#define V vec2(0.,1.)\n\n// ---\n\nattribute vec3 uv;\n\nvarying vec3 vPos;\nvarying vec3 vNormal;\nvarying float vLightDist;\nvarying vec2 vTextureShadowCoord;\n\nuniform float time;\nuniform vec2 resolution;\nuniform float particleCountSqrt;\nuniform vec3 u_cameraPos;\nuniform vec3 u_lightPos;\n\nuniform sampler2D textureParticle;\nuniform sampler2D textureCube;\n\n// ---\n\nmat4 lookAt( vec3 _pos, vec3 _tar, vec3 _air ) {\n  vec3 dir = normalize( _tar - _pos );\n  vec3 sid = normalize( cross( dir, _air ) );\n  vec3 top = normalize( cross( sid, dir ) );\n  return mat4(\n    sid.x, top.x, dir.x, 0.0,\n    sid.y, top.y, dir.y, 0.0,\n    sid.z, top.z, dir.z, 0.0,\n    - sid.x * _pos.x - sid.y * _pos.y - sid.z * _pos.z,\n    - top.x * _pos.x - top.y * _pos.y - top.z * _pos.z,\n    - dir.x * _pos.x - dir.y * _pos.y - dir.z * _pos.z,\n    1.0\n  );\n}\n\nmat4 perspective( float _fov, float _aspect, float _near, float _far ) {\n  float p = 1.0 / tan( _fov * PI / 180.0 / 2.0 );\n  float d = _far / ( _far - _near );\n  return mat4(\n    p / _aspect, 0.0, 0.0, 0.0,\n    0.0, p, 0.0, 0.0,\n    0.0, 0.0, d, 1.0,\n    0.0, 0.0, -_near * d, 0.0\n  );\n}\n\nmat2 rotate2D( float _theta ) {\n  return mat2( cos( _theta ), sin( _theta ), -sin( _theta ), cos( _theta ) );\n}\n\n// ---\n\nvoid main() {\n  vec3 pos = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 0.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n  vec3 vel = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 1.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n  vec3 rot = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 2.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n  vec3 life = texture2D( textureParticle, ( uv.xy * vec2( 4.0, 1.0 ) + vec2( 3.5, 0.5 ) ) / vec2( 4.0, 1.0 ) / particleCountSqrt ).xyz;\n\n  mat4 matP = perspective( 90.0, resolution.x / resolution.y, 0.01, 100.0 );\n  mat4 matV = lookAt( u_cameraPos, vec3( 0.0, 0.0, 0.0 ), vec3( 0.0, 1.0, 0.0 ) );\n\n  vec3 cubeVert = texture2D( textureCube, vec2( 0.5 / 2.0, uv.z / 36.0 ) ).xyz;\n  cubeVert.yz = rotate2D( rot.x ) * cubeVert.yz;\n  cubeVert.zx = rotate2D( rot.y ) * cubeVert.zx;\n  cubeVert.xy = rotate2D( rot.z ) * cubeVert.xy;\n  pos += cubeVert * 0.02 * life.y;\n\n  vNormal = texture2D( textureCube, vec2( 1.5 / 2.0, uv.z / 36.0 ) ).xyz;\n  vNormal.yz = rotate2D( rot.x ) * vNormal.yz;\n  vNormal.zx = rotate2D( rot.y ) * vNormal.zx;\n  vNormal.xy = rotate2D( rot.z ) * vNormal.xy;\n  vNormal = ( matV * vec4( vNormal, 0.0 ) ).xyz;\n\n  gl_Position = (\n    matP\n    * matV\n    * vec4( pos, 1.0 )\n  );\n\n  vec4 posFromLight = (\n    matP\n    * lookAt( u_lightPos, vec3( 0.0, 0.0, 0.0 ), vec3( 0.0, 1.0, 0.0 ) )\n    * vec4( pos, 1.0 )\n  );\n  vTextureShadowCoord = posFromLight.xy / posFromLight.w;\n\n  vLightDist = length( u_lightPos - pos );\n  vPos = pos;\n}\n", "#define PI 3.14159265\n#define saturate(i) clamp(i,0.,1.)\n#define V vec2(0.,1.)\n\n// ---\n\nprecision highp float;\n#define GLSLIFY 1\n\nvarying float vLightDist;\n\n// ---\n\nvoid main() {\n  gl_FragColor = vec4(\n    vLightDist,\n    0.0,\n    0.0,\n    1.0\n  );\n}\n");

  // ---

  var framebufferParticleCompute = glCat.createFloatFramebuffer(particleCountSqrt * 4, particleCountSqrt);
  var framebufferParticleComputeReturn = glCat.createFloatFramebuffer(particleCountSqrt * 4, particleCountSqrt);

  var shadowSize = 2048;
  var framebufferParticleShadow = glCat.createFloatFramebuffer(shadowSize, shadowSize);
  var framebufferParticleRender = glCat.createFloatFramebuffer(width, height);

  var framebufferMotionblur = glCat.createFloatFramebuffer(width, height);
  var framebufferMotionblurReturn = glCat.createFloatFramebuffer(width, height);

  // ---

  var textureRandomSize = 2048;
  var textureRandom = glCat.createTexture();
  glCat.textureWrap(textureRandom, gl.REPEAT);
  glCat.setTextureFromFloatArray(textureRandom, textureRandomSize, textureRandomSize, function () {
    var len = textureRandomSize * textureRandomSize * 4;
    var ret = new Float32Array(len);

    for (var iArr = 0; iArr < len; iArr++) {
      ret[iArr] = xorshift();
    }

    return ret;
  }());

  var textureNemui = glCat.createTexture();
  glCat.textureWrap(textureNemui, gl.REPEAT);
  glCat.setTextureFromFloatArray(textureNemui, particleCountSqrt, particleCountSqrt, require('./nemui')(particleCount));

  var textureSphereRandom = glCat.createTexture();
  glCat.textureWrap(textureSphereRandom, gl.REPEAT);
  glCat.setTextureFromFloatArray(textureSphereRandom, particleCountSqrt, particleCountSqrt, require('./sphere-random')(particleCount));

  var textureCube = glCat.createTexture();
  glCat.setTextureFromFloatArray(textureCube, 2, 36, require('./cube-vertices'));

  // ---

  var frame = 0;
  var frames = 150;
  var blurSample = 40;
  var time = 0.0;
  var stop = false;

  // ---

  var cameraPos = [0.0, 0.0, 1.5];
  var lightPos = [1.0 * 0.6, 2.0 * 0.6, 3.0 * 0.6];

  // ---

  var computeParticle = function computeParticle(_target, _deltaTime) {

    gl.viewport(0, 0, particleCountSqrt * 4.0, particleCountSqrt);
    glCat.useProgram(programParticleCompute);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferParticleComputeReturn);
    glCat.clear(0.0, 0.0, 0.0, 0.0);

    glCat.attribute('p', vboQuad, 2);

    glCat.uniform1f('time', time);
    glCat.uniform1f('particleCountSqrt', particleCountSqrt);
    glCat.uniform1i('frameZero', frame % frames === 0);
    glCat.uniform1f('deltaTime', _deltaTime);

    glCat.uniformTexture('textureRandom', textureRandom, 0);
    glCat.uniformTexture('textureParticle', framebufferParticleCompute.texture, 1);
    glCat.uniformTexture('textureNemui', textureNemui, 2);
    glCat.uniformTexture('textureSphereRandom', textureSphereRandom, 3);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // ---

    gl.viewport(0, 0, particleCountSqrt * 4.0, particleCountSqrt);
    glCat.useProgram(programReturn);
    gl.bindFramebuffer(gl.FRAMEBUFFER, _target);
    glCat.clear(0.0, 0.0, 0.0, 0.0);

    glCat.attribute('p', vboQuad, 2);

    glCat.uniform2fv('resolution', [particleCountSqrt * 4.0, particleCountSqrt]);

    glCat.uniformTexture('texture', framebufferParticleComputeReturn.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // ---

  var renderParticle = function renderParticle(_compute, _target, _shadow) {

    gl.viewport(0, 0, shadowSize, shadowSize);
    glCat.useProgram(programParticleRenderShadow);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferParticleShadow);
    glCat.clear(1.0, 1.0, 1.0);

    glCat.attribute('uv', vboCube, 3);

    glCat.uniform1f('time', time);
    glCat.uniform1f('particleCountSqrt', particleCountSqrt);
    glCat.uniform2fv('resolution', [shadowSize, shadowSize]);
    glCat.uniform3fv('u_cameraPos', lightPos);
    glCat.uniform3fv('u_lightPos', lightPos);

    glCat.uniformTexture('textureParticle', _compute, 0);
    glCat.uniformTexture('textureCube', textureCube, 1);

    gl.drawArrays(gl.TRIANGLES, 0, vboCube.length / 3.0);

    // ---

    gl.viewport(0, 0, width, height);
    glCat.useProgram(programParticleRender);
    gl.bindFramebuffer(gl.FRAMEBUFFER, _target);
    glCat.clear(1.0, 1.0, 1.0);

    glCat.attribute('uv', vboCube, 3);

    glCat.uniform1f('time', time);
    glCat.uniform1f('particleCountSqrt', particleCountSqrt);
    glCat.uniform2fv('resolution', [width, height]);
    glCat.uniform3fv('u_cameraPos', cameraPos);
    glCat.uniform3fv('u_lightPos', lightPos);

    glCat.uniformTexture('textureParticle', _compute, 0);
    glCat.uniformTexture('textureCube', textureCube, 1);
    glCat.uniformTexture('textureShadow', framebufferParticleShadow.texture, 2);

    gl.drawArrays(gl.TRIANGLES, 0, vboCube.length / 3.0);
  };

  // ---

  var render = function render(_target, _deltaTime) {

    computeParticle(framebufferParticleCompute, _deltaTime);
    renderParticle(framebufferParticleCompute.texture, _target, false);

    gl.flush();
  };

  // ---

  var motionblur = function motionblur(_texture, _target, _blurCount) {

    gl.viewport(0, 0, width, height);
    glCat.useProgram(programMotionblur);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferMotionblurReturn);
    glCat.clear();

    glCat.attribute('p', vboQuad, 2);
    glCat.uniform1f('add', 1.0 / blurSample);
    glCat.uniform1i('init', _blurCount === 0);
    glCat.uniform2fv('resolution', [width, height]);
    glCat.uniformTexture('renderTexture', _texture, 0);
    glCat.uniformTexture('blurTexture', framebufferMotionblur.texture, 1);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // ------

    gl.viewport(0, 0, width, height);
    glCat.useProgram(programReturn);
    gl.bindFramebuffer(gl.FRAMEBUFFER, _target);
    glCat.clear();

    glCat.attribute('p', vboQuad, 2);
    glCat.uniform2fv('resolution', [width, height]);
    glCat.uniformTexture('texture', framebufferMotionblurReturn.texture, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // ---

  var post = function post(_input, _target) {

    gl.viewport(0, 0, width, height);
    glCat.useProgram(programPost);
    gl.bindFramebuffer(gl.FRAMEBUFFER, _target);
    glCat.clear();

    glCat.attribute('p', vboQuad, 2);

    glCat.uniform1f('time', time);
    glCat.uniform2fv('resolution', [width, height]);

    glCat.uniformTexture('texture', _input, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  // ---

  var renderA = document.createElement('a');

  var saveFrame = function saveFrame() {
    renderA.href = canvas.toDataURL();
    renderA.download = ('0000' + frame).slice(-5) + '.png';
    renderA.click();
  };

  // ---

  var update = function update() {

    if (!checkboxPlay.checked) {
      requestAnimationFrame(update);
      return;
    }

    if (checkboxBlur.checked) {
      for (var i = 0; i < blurSample; i++) {
        var timePrev = time;
        time += 1.0 / blurSample / frames;
        var deltaTime = time - timePrev;

        render(framebufferParticleRender, deltaTime * 4.0);
        motionblur(framebufferParticleRender.texture, framebufferMotionblur, i);
      }
      post(framebufferMotionblur.texture, null);
    } else {
      var _timePrev = time;
      time += 1.0 / frames;
      var _deltaTime2 = time - _timePrev;

      render(framebufferParticleRender, _deltaTime2 * 4.0);
      post(framebufferParticleRender.texture, null);
    }

    if (checkboxSave.checked && frames <= frame) {
      saveFrame();
    }

    frame++;
    if (frame % frames === 0) {}

    requestAnimationFrame(update);
  };
  update();
})();

},{"./cube-vertices":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/cube-vertices.js","./glcat":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/glcat.js","./nemui":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/nemui.js","./sphere-random":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/sphere-random.js","./xorshift":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/xorshift.js"}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/nemui.js":[function(require,module,exports){
'use strict';

(function () {

  var xorshift = require('./xorshift');

  var canvas = document.createElement('canvas');
  var canvasSize = 2048;
  canvas.width = canvasSize;
  canvas.height = canvasSize;

  var context = canvas.getContext('2d');
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '900 ' + canvasSize / 2.0 + 'px Times New Roman';

  context.fillStyle = '#000';
  context.fillRect(0, 0, canvasSize, canvasSize);

  context.fillStyle = '#fff';
  context.fillText('眠い', canvasSize / 2.0, canvasSize / 2.0);

  var imageData = context.getImageData(0, 0, canvasSize, canvasSize).data;

  var testNemui = function testNemui(_x, _y) {
    var x = _x;
    var y = _y;

    return 127 < imageData[4 * (x + canvasSize * y)];
  };

  var hits = new Float32Array(canvasSize * canvasSize * 2);
  var head = 0;
  for (var iy = 0; iy < canvasSize; iy++) {
    for (var ix = 0; ix < canvasSize; ix++) {
      if (testNemui(ix, iy)) {
        hits[head * 2 + 0] = ix / canvasSize * 2.0 - 1.0;
        hits[head * 2 + 1] = -(iy / canvasSize) * 2.0 + 1.0;
        head++;
      }
    }
  }

  module.exports = function (_size) {
    var out = new Float32Array(_size * 4);
    for (var iOut = 0; iOut < _size; iOut++) {
      var dice = Math.floor(xorshift() * head);
      out[iOut * 4 + 0] = hits[dice * 2 + 0];
      out[iOut * 4 + 1] = hits[dice * 2 + 1];
      out[iOut * 4 + 2] = xorshift() - 0.5;
      out[iOut * 4 + 3] = xorshift();
    }
    return out;
  };
})();

},{"./xorshift":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/xorshift.js"}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/sphere-random.js":[function(require,module,exports){
'use strict';

(function () {

  var xorshift = require('./xorshift');

  module.exports = function (_size) {
    var len = _size * 4;
    var ret = new Float32Array(len);

    for (var iPix = 0; iPix < len / 4; iPix++) {
      var x = 1.0;
      var y = 1.0;
      var z = 1.0;

      while (1.0 < x * x + y * y + z * z) {
        x = xorshift() * 2.0 - 1.0;
        y = xorshift() * 2.0 - 1.0;
        z = xorshift() * 2.0 - 1.0;
      }

      ret[iPix * 4 + 0] = x;
      ret[iPix * 4 + 1] = y;
      ret[iPix * 4 + 2] = z;
      ret[iPix * 4 + 3] = xorshift();
    }

    return ret;
  };
})();

},{"./xorshift":"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/xorshift.js"}],"/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/xorshift.js":[function(require,module,exports){
"use strict";

(function () {

  var seed = void 0;
  var xorshift = function xorshift(_seed) {
    seed = _seed || seed || 1;
    seed = seed ^ seed << 13;
    seed = seed ^ seed >>> 17;
    seed = seed ^ seed << 5;
    return seed / Math.pow(2, 32) + 0.5;
  };

  module.exports = xorshift;
})();

},{}]},{},["/Users/Yutaka/Dropbox/pro/_Projects/_eom/20160428/src/script/main.js"]);
