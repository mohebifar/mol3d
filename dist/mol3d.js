(function(root) {
"use strict";

var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) subClass.__proto__ = superClass;
};

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Canvas = (function () {
  function Canvas() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.z = 5;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0, 0);
    this.currentMode = null;

    this.renderer.domElement.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      return false;
    });

    this.group = new THREE.Object3D();
    this.scene.add(this.group);

    this.atoms = [];
    this.bonds = [];

    this._displays = [];
    this._display = null;

    this._modes = [];
    this._mode = null;

    this.data = {};

    this.setData("element", 6);
  }

  _prototypeProperties(Canvas, null, {
    setData: {

      /**
       * Inject some data
       *
       * @method setData
       * @param key
       * @param value
       * @returns {*}
       */
      value: function setData(key, value) {
        this.data[key] = value;
        return this;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getData: {

      /**
       * Get injected data
       *
       * @method getData
       * @param key
       * @returns {*}
       */
      value: function getData(key) {
        return this.data[key];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    hasData: {

      /**
       * Checks if data with given key exists
       *
       * @method hasData
       * @param key
       * @returns {boolean}
       */
      value: function hasData(key) {
        return typeof this.data[key] !== "undefined";
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getMolecule: {
      value: function getMolecule() {
        var molecule = new Chem.Molecule();

        for (var i in this.atoms) {
          molecule.addAtom(this.atoms[i]);
        }

        for (var i in this.bonds) {
          molecule.addBond(this.bonds[i]);
        }

        return molecule;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    attach: {
      value: function attach(molecule) {
        for (var i in molecule.atoms) {
          var atom = molecule.atoms[i];

          this.addAtom(atom);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addAtom: {
      value: function addAtom(atom) {
        var _this = this;
        var drawBonds = arguments[1] === undefined ? true : arguments[1];
        this.atoms.push(atom);

        atom.on("bond", function () {});

        atom.on("delete", function () {
          for (var i in _this._displays) {
            var _display = _this._displays[i];
            _display.removeAtom(atom);
          }

          _this.atoms.splice(_this.atoms.indexOf(atom), 1);
        });

        this._display.drawAtom(atom);

        if (drawBonds) {
          for (var i in atom.bonds) {
            this.addBond(atom.bonds[i]);
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    update: {
      value: function update() {
        for (var _iterator = this.atoms[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
          var atom = _step.value;
          for (var _iterator2 = this._displays[Symbol.iterator](), _step2; !(_step2 = _iterator2.next()).done;) {
            var display = _step2.value;
            display.drawAtom(atom);
          }
        }

        for (var _iterator3 = this.bonds[Symbol.iterator](), _step3; !(_step3 = _iterator3.next()).done;) {
          var bond = _step3.value;
          for (var _iterator4 = this._displays[Symbol.iterator](), _step4; !(_step4 = _iterator4.next()).done;) {
            var display = _step4.value;
            display.drawBond(bond);
          }
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeAtom: {
      value: function removeAtom(atom) {
        atom.emit("delete");
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addBond: {
      value: function addBond(bond) {
        var _this2 = this;
        this.bonds.push(bond);

        bond.on("delete", function () {
          for (var i in _this2._displays) {
            var _display = _this2._displays[i];
            _display.removeBond(bond);
          }

          _this2.bonds.splice(_this2.bonds.indexOf(bond), 1);
        });


        this._display.drawBond(bond);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeBond: {
      value: function removeBond(bond) {
        bond.emit("delete");
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    clear: {
      value: function clear() {
        var atoms = this.atoms.slice(0, this.atoms.length);
        var bonds = this.bonds.slice(0, this.bonds.length);

        for (var _iterator5 = atoms[Symbol.iterator](), _step5; !(_step5 = _iterator5.next()).done;) {
          var atom = _step5.value;
          this.removeAtom(atom);
        }

        for (var _iterator6 = bonds[Symbol.iterator](), _step6; !(_step6 = _iterator6.next()).done;) {
          var bond = _step6.value;
          this.removeBond(bond);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setMode: {
      value: function setMode(mode) {
        if (this._mode) {
          this._mode.down();
        }

        this.currentMode = mode;

        for (var i in this._modes) {
          var _mode = this._modes[i];

          if (_mode instanceof mode) {
            this._mode = _mode;
            this._mode.up();
            return;
          }
        }

        this._mode = new mode(this);
        this._mode.create();
        this._modes.push(this._mode);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    setDisplay: {
      value: function setDisplay(display) {
        if (this._display) {
          this._display.down();
        }

        for (var i in this._displays) {
          var _display = this._displays[i];

          if (_display instanceof display) {
            this._display = _display;
            this._display.up();
            return;
          }
        }

        this._display = new display(this);
        this._display.init();
        this._displays.push(this._display);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    show: {
      value: function show() {
        var _this3 = this;
        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(function () {
          return _this3.show();
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Canvas;
})();

var OrbitHelper = (function () {
  function OrbitHelper(canvas) {
    this.canvas = canvas;

    this.quaternion = new LiThree.Math.Quaternion();
    this.matrix = null;

    this.origin = new LiThree.Math.Vector3();
    this.speed = 1;

    canvas.renderer.camera.position.z = -10;

    this._getMatrix();
  }

  _prototypeProperties(OrbitHelper, null, {
    rotate: {
      value: function rotate(dx, dy) {
        dx *= this.speed;
        dy *= this.speed;

        var r = Math.sqrt(dx * dx + dy * dy),
            dq = new LiThree.Math.Quaternion(1, 0, 0, 0),
            cq = this.quaternion,
            rs = Math.sin(r * Math.PI) / r;

        if (r < 0.000001) {
          return;
        }

        dq.x = Math.cos(r * Math.PI);
        dq.y = 0;
        dq.z = rs * dx;
        dq.w = -rs * dy;

        this.quaternion = new LiThree.Math.Quaternion(1, 0, 0, 0);
        this.quaternion.multiply(dq);
        this.quaternion.multiply(cq);

        this._getMatrix();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    distance: {
      value: function distance(delta) {
        var canvas = this.canvas,
            camera = canvas.renderer.camera;

        delta *= this.speed / 50;

        if (canvas.getData("tween")) {
          var z = camera.position.z + delta;
          new TWEEN.Tween(camera.position).to({ z: z }, 200).easing(TWEEN.Easing.Cubic.Out).start();
        } else {
          camera.position.z += delta / 2;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getMatrix: {
      value: function GetMatrix() {
        this.matrix = LiThree.Math.Matrix4.fromRotationTranslationScaleOrigin(this.quaternion, this.origin, new LiThree.Math.Vector3(1, 1, 1), this.origin);
        return this.matrix;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return OrbitHelper;
})();

var BaseDisplay = function BaseDisplay(canvas) {
  this.canvas = canvas;
  this._atoms = [];
};

var BAS_KEY = "ball-and-stick";

var BallAndStick = (function (BaseDisplay) {
  function BallAndStick(canvas) {
    this.lights = [];
    this.geometries = {
      sphere: new THREE.SphereGeometry(0.3, 20, 20, 0, 2 * Math.PI),
      cylinder: new THREE.CylinderGeometry(0.04, 0.04, 1)
    };

    var matrix1 = new THREE.Matrix4();
    matrix1.setPosition(new THREE.Vector3(0, 0.08, 0));

    var matrix2 = new THREE.Matrix4();
    matrix2.setPosition(new THREE.Vector3(0, -0.08, 0));

    this.geometries.cylinder.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    this.geometries.bonds = {};
    this.geometries.bonds[1] = this.geometries.cylinder;
    this.geometries.bonds[2] = this.geometries.cylinder.clone();
    this.geometries.bonds[2].merge(this.geometries.cylinder, matrix2);
    this.geometries.bonds[3] = this.geometries.bonds[2].clone();
    this.geometries.bonds[3].merge(this.geometries.bonds[2], matrix1);

    _get(Object.getPrototypeOf(BallAndStick.prototype), "constructor", this).call(this, canvas);
  }

  _inherits(BallAndStick, BaseDisplay);

  _prototypeProperties(BallAndStick, {
    generateTexture: {
      value: function generateTexture(b, e) {
        b = new THREE.Color(b);
        e = new THREE.Color(e);

        b = "#" + b.getHexString();
        e = "#" + e.getHexString();

        var width = 2,
            height = 200;

        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // get context
        var context = canvas.getContext("2d");

        // draw gradient
        context.rect(0, 0, width, height);
        var gradient = context.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, e);
        gradient.addColorStop(0.5, e);
        gradient.addColorStop(0.5, b);
        gradient.addColorStop(1, b);
        context.fillStyle = gradient;
        context.fill();

        var texture = new THREE.Texture(canvas);
        canvas.remove();

        texture.needsUpdate = true; // important!

        return texture;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  }, {
    drawLight: {
      value: function drawLight() {
        var _this4 = this;
        var light = new THREE.PointLight(16777215, 1.5);

        var updateLightPosition = function () {
          var position = _this4.canvas.camera.position;

          light.position.set(position.x * 100, position.y * 100, position.z * 300);

          requestAnimationFrame(updateLightPosition);
        };

        requestAnimationFrame(updateLightPosition);

        this.canvas.scene.add(light);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    drawAtom: {
      value: function drawAtom(atom) {
        var mesh, material;
        if (!atom.hasData(BAS_KEY)) {
          material = new THREE.MeshPhongMaterial({
            specular: 1052688,
            shininess: 30
          });
          mesh = new THREE.Mesh(this.geometries.sphere, material);

          atom.setData(BAS_KEY, mesh);
          this.canvas.group.add(mesh);

          mesh.type = "atom";
          mesh.model = atom;
        } else {
          mesh = atom.getData(BAS_KEY);
          material = mesh.material;
        }

        material.ambient.set(atom.element.color);
        material.color.set(atom.element.color);

        var radius = (1 / Math.exp(-atom.element.atomicRadius / 60) - 1) * atom.element.atomicRadius / 250;
        radius = Math.min(radius, 2.1);
        mesh.scale.set(radius, radius, radius);
        mesh.position.copy(atom.position);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeAtom: {
      value: function removeAtom(atom) {
        var mesh = atom.getData(BAS_KEY);
        this.canvas.group.remove(mesh);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    drawBond: {
      value: function drawBond(bond) {
        var canvas = this.canvas,
            group = canvas.group,
            begin = bond.begin,
            end = bond.end,
            beginData = begin.getData(BAS_KEY),
            endData = end.getData(BAS_KEY);


        if (!beginData || !endData) {
          return;
        }

        var beginPosition = beginData.position,
            endPosition = endData.position,
            beginColor = begin.element.color,
            endColor = end.element.color,
            distance = beginPosition.distanceTo(endPosition),
            middle = beginPosition.clone().add(endPosition).divideScalar(2),
            d = 0.06;

        var material, mesh;

        if (!bond.hasData(BAS_KEY)) {
          material = new THREE.MeshPhongMaterial({
            color: 16777215,
            specular: 1052688,
            shininess: 30,
            transparent: true
          });

          material.colorCache = [-1, -1];
          mesh = new THREE.Mesh(this.geometries.bonds[bond.order], material);
          mesh.model = bond;
          mesh.type = "bond";
          bond.setData(BAS_KEY, mesh);
        } else {
          mesh = bond.getData(BAS_KEY);
          var suitGeometry = this.geometries.bonds[bond.order];

          if (mesh.geometry !== suitGeometry) {
            bond.removeData(BAS_KEY);
            group.remove(mesh);
            this.drawBond(bond);
            return;
          }
          material = mesh.material;
        }

        if (material.colorCache[0] !== beginColor || material.colorCache[1] !== endColor) {
          material.colorCache[0] = beginColor;
          material.colorCache[1] = endColor;
          material.map = BallAndStick.generateTexture(beginColor, endColor);
        }

        mesh.scale.z = distance;
        mesh.position.copy(middle);
        mesh.lookAt(endPosition);

        group.add(mesh);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    removeBond: {
      value: function removeBond(bond) {
        var mesh = bond.getData(BAS_KEY);
        this.canvas.group.remove(mesh);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    init: {
      value: function init() {
        this.drawLight();
        this.up();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    up: {
      value: function up() {},
      writable: true,
      enumerable: true,
      configurable: true
    },
    down: {
      value: function down() {},
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return BallAndStick;
})(BaseDisplay);

/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
var OrbitControls = (function () {
  function OrbitControls(object, domElement) {
    this.object = object;
    this.domElement = domElement !== undefined ? domElement : document;

    // API

    // Set to false to disable this control
    this.enabled = true;

    // "target" sets the location of focus, where the control orbits around
    // and where it pans with respect to.
    this.target = new THREE.Vector3();

    // center is old, deprecated; use "target" instead
    this.center = this.target;

    // This option actually enables dollying in and out; left as "zoom" for
    // backwards compatibility
    this.noZoom = false;
    this.zoomSpeed = 1;

    // Limits to how far you can dolly in and out
    this.minDistance = 0;
    this.maxDistance = Infinity;

    // Set to true to disable this control
    this.noRotate = false;
    this.rotateSpeed = 1;

    // Set to true to disable this control
    this.noPan = false;
    this.keyPanSpeed = 7; // pixels moved per arrow key push

    // Set to true to automatically rotate around the target
    this.autoRotate = false;
    this.autoRotateSpeed = 2; // 30 seconds per round when fps is 60

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    this.minPolarAngle = 0; // radians
    this.maxPolarAngle = Math.PI; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    this.minAzimuthAngle = -Infinity; // radians
    this.maxAzimuthAngle = Infinity; // radians

    // Set to true to disable use of the keys
    this.noKeys = false;

    // The four arrow keys
    this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

    ////////////
    // internals

    var scope = this;

    var EPS = 0.000001;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();
    var panOffset = new THREE.Vector3();

    var offset = new THREE.Vector3();

    var dollyStart = new THREE.Vector2();
    var dollyEnd = new THREE.Vector2();
    var dollyDelta = new THREE.Vector2();

    var theta;
    var phi;
    var phiDelta = 0;
    var thetaDelta = 0;
    var scale = 1;
    var pan = new THREE.Vector3();

    var lastPosition = new THREE.Vector3();
    var lastQuaternion = new THREE.Quaternion();

    var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY: 4, TOUCH_PAN: 5 };

    var state = STATE.NONE;

    // for reset

    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();

    // so camera.up is the orbit axis

    var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
    var quatInverse = quat.clone().inverse();

    // events

    var changeEvent = { type: "change" };
    var startEvent = { type: "start" };
    var endEvent = { type: "end" };

    this.rotateLeft = function (angle) {
      if (angle === undefined) {
        angle = getAutoRotationAngle();
      }

      thetaDelta -= angle;
    };

    this.rotateUp = function (angle) {
      if (angle === undefined) {
        angle = getAutoRotationAngle();
      }

      phiDelta -= angle;
    };

    // pass in distance in world space to move left
    this.panLeft = function (distance) {
      var te = this.object.matrix.elements;

      // get X column of matrix
      panOffset.set(te[0], te[1], te[2]);
      panOffset.multiplyScalar(-distance);

      pan.add(panOffset);
    };

    // pass in distance in world space to move up
    this.panUp = function (distance) {
      var te = this.object.matrix.elements;

      // get Y column of matrix
      panOffset.set(te[4], te[5], te[6]);
      panOffset.multiplyScalar(distance);

      pan.add(panOffset);
    };

    // pass in x,y of change desired in pixel space,
    // right and down are positive
    this.pan = function (deltaX, deltaY) {
      var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

      if (scope.object.fov !== undefined) {
        // perspective
        var position = scope.object.position;
        var offset = position.clone().sub(scope.target);
        var targetDistance = offset.length();

        // half of the fov is center to top of screen
        targetDistance *= Math.tan(scope.object.fov / 2 * Math.PI / 180);

        // we actually don't use screenWidth, since perspective camera is fixed to screen height
        scope.panLeft(2 * deltaX * targetDistance / element.clientHeight);
        scope.panUp(2 * deltaY * targetDistance / element.clientHeight);
      } else if (scope.object.top !== undefined) {
        // orthographic
        scope.panLeft(deltaX * (scope.object.right - scope.object.left) / element.clientWidth);
        scope.panUp(deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight);
      } else {
        // camera neither orthographic or perspective
        console.warn("WARNING: orbit-controls.js encountered an unknown camera type - pan disabled.");
      }
    };

    this.dollyIn = function (dollyScale) {
      if (dollyScale === undefined) {
        dollyScale = scope.getZoomScale();
      }

      scale /= dollyScale;
    };

    this.dollyOut = function (dollyScale) {
      if (dollyScale === undefined) {
        dollyScale = scope.getZoomScale();
      }

      scale *= dollyScale;
    };

    this.update = function () {
      var position = this.object.position;

      offset.copy(position).sub(this.target);

      // rotate offset to "y-axis-is-up" space
      offset.applyQuaternion(quat);

      // angle from z-axis around y-axis

      theta = Math.atan2(offset.x, offset.z);

      // angle from y-axis

      phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

      if (this.autoRotate && state === STATE.NONE) {
        this.rotateLeft(getAutoRotationAngle());
      }

      theta += thetaDelta;
      phi += phiDelta;

      // restrict theta to be between desired limits
      theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, theta));

      // restrict phi to be between desired limits
      phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));

      // restrict phi to be betwee EPS and PI-EPS
      phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));

      var radius = offset.length() * scale;

      // restrict radius to be between desired limits
      radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

      // move target to panned location
      this.target.add(pan);

      offset.x = radius * Math.sin(phi) * Math.sin(theta);
      offset.y = radius * Math.cos(phi);
      offset.z = radius * Math.sin(phi) * Math.cos(theta);

      // rotate offset back to "camera-up-vector-is-up" space
      offset.applyQuaternion(quatInverse);

      position.copy(this.target).add(offset);

      this.object.lookAt(this.target);

      thetaDelta = 0;
      phiDelta = 0;
      scale = 1;
      pan.set(0, 0, 0);

      // update condition is:
      // min(camera displacement, camera rotation in radians)^2 > EPS
      // using small-angle approximation cos(x/2) = 1 - x^2 / 8

      if (lastPosition.distanceToSquared(this.object.position) > EPS || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS) {
        //this.dispatchEvent(changeEvent);

        lastPosition.copy(this.object.position);
        lastQuaternion.copy(this.object.quaternion);
      }
    };


    this.reset = function () {
      state = STATE.NONE;

      this.target.copy(this.target0);
      this.object.position.copy(this.position0);

      this.update();
    };

    this.getPolarAngle = function () {
      return phi;
    };

    this.getAzimuthalAngle = function () {
      return theta;
    };

    this.getAutoRotationAngle = function () {
      return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    };

    this.getZoomScale = function () {
      return Math.pow(0.95, scope.zoomSpeed);
    };

    this.onMouseDown = function (event) {
      if (scope.enabled === false) return;
      event.preventDefault();

      if (event.button === scope.mouseButtons.ORBIT) {
        if (scope.noRotate === true) return;

        state = STATE.ROTATE;

        rotateStart.set(event.clientX, event.clientY);
      } else if (event.button === scope.mouseButtons.ZOOM) {
        if (scope.noZoom === true) return;

        state = STATE.DOLLY;

        dollyStart.set(event.clientX, event.clientY);
      } else if (event.button === scope.mouseButtons.PAN) {
        if (scope.noPan === true) return;

        state = STATE.PAN;

        panStart.set(event.clientX, event.clientY);
      }

      if (state !== STATE.NONE) {
        document.addEventListener("mousemove", scope.onMouseMove, false);
        document.addEventListener("mouseup", scope.onMouseUp, false);
        //scope.dispatchEvent(startEvent);
      }
    };

    this.onMouseMove = function (event) {
      if (scope.enabled === false) return;

      event.preventDefault();

      var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

      if (state === STATE.ROTATE) {
        if (scope.noRotate === true) return;

        rotateEnd.set(event.clientX, event.clientY);
        rotateDelta.subVectors(rotateEnd, rotateStart);

        // rotating across whole screen goes 360 degrees around
        scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);

        // rotating up and down along whole screen attempts to go 360, but limited to 180
        scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

        rotateStart.copy(rotateEnd);
      } else if (state === STATE.DOLLY) {
        if (scope.noZoom === true) return;

        dollyEnd.set(event.clientX, event.clientY);
        dollyDelta.subVectors(dollyEnd, dollyStart);

        if (dollyDelta.y > 0) {
          scope.dollyIn();
        } else {
          scope.dollyOut();
        }

        dollyStart.copy(dollyEnd);
      } else if (state === STATE.PAN) {
        if (scope.noPan === true) return;

        panEnd.set(event.clientX, event.clientY);
        panDelta.subVectors(panEnd, panStart);

        scope.pan(panDelta.x, panDelta.y);

        panStart.copy(panEnd);
      }

      if (state !== STATE.NONE) scope.update();
    };

    this.onMouseUp = function () {
      if (scope.enabled === false) return;

      document.removeEventListener("mousemove", scope.onMouseMove, false);
      document.removeEventListener("mouseup", scope.onMouseUp, false);
      //scope.dispatchEvent(endEvent);
      state = STATE.NONE;
    };

    this.onMouseWheel = function (event) {
      if (scope.enabled === false || scope.noZoom === true || state !== STATE.NONE) return;

      event.preventDefault();
      event.stopPropagation();

      var delta = 0;

      if (event.wheelDelta !== undefined) {
        // WebKit / Opera / Explorer 9

        delta = event.wheelDelta;
      } else if (event.detail !== undefined) {
        // Firefox

        delta = -event.detail;
      }

      if (delta > 0) {
        scope.dollyOut();
      } else {
        scope.dollyIn();
      }

      scope.update();
      //scope.dispatchEvent(startEvent);
      //scope.dispatchEvent(endEvent);
    };

    this.onKeyDown = function (event) {
      if (scope.enabled === false || scope.noKeys === true || scope.noPan === true) return;

      switch (event.keyCode) {

        case scope.keys.UP:
          scope.pan(0, scope.keyPanSpeed);
          scope.update();
          break;

        case scope.keys.BOTTOM:
          scope.pan(0, -scope.keyPanSpeed);
          scope.update();
          break;

        case scope.keys.LEFT:
          scope.pan(scope.keyPanSpeed, 0);
          scope.update();
          break;

        case scope.keys.RIGHT:
          scope.pan(-scope.keyPanSpeed, 0);
          scope.update();
          break;

      }
    };

    this.touchstart = function (event) {
      if (scope.enabled === false) return;

      switch (event.touches.length) {

        case 1:
          // one-fingered touch: rotate

          if (scope.noRotate === true) return;

          state = STATE.TOUCH_ROTATE;

          rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
          break;

        case 2:
          // two-fingered touch: dolly

          if (scope.noZoom === true) return;

          state = STATE.TOUCH_DOLLY;

          var dx = event.touches[0].pageX - event.touches[1].pageX;
          var dy = event.touches[0].pageY - event.touches[1].pageY;
          var distance = Math.sqrt(dx * dx + dy * dy);
          dollyStart.set(0, distance);
          break;

        case 3:
          // three-fingered touch: pan

          if (scope.noPan === true) return;

          state = STATE.TOUCH_PAN;

          panStart.set(event.touches[0].pageX, event.touches[0].pageY);
          break;

        default:


          state = STATE.NONE;

      }

      //if (state !== STATE.NONE) scope.dispatchEvent(startEvent);
    };

    this.touchmove = function (event) {
      if (scope.enabled === false) return;

      event.preventDefault();
      event.stopPropagation();

      var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

      switch (event.touches.length) {

        case 1:
          // one-fingered touch: rotate

          if (scope.noRotate === true) return;
          if (state !== STATE.TOUCH_ROTATE) return;

          rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
          rotateDelta.subVectors(rotateEnd, rotateStart);

          // rotating across whole screen goes 360 degrees around
          scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
          // rotating up and down along whole screen attempts to go 360, but limited to 180
          scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);

          rotateStart.copy(rotateEnd);

          scope.update();
          break;

        case 2:
          // two-fingered touch: dolly

          if (scope.noZoom === true) return;
          if (state !== STATE.TOUCH_DOLLY) return;

          var dx = event.touches[0].pageX - event.touches[1].pageX;
          var dy = event.touches[0].pageY - event.touches[1].pageY;
          var distance = Math.sqrt(dx * dx + dy * dy);

          dollyEnd.set(0, distance);
          dollyDelta.subVectors(dollyEnd, dollyStart);

          if (dollyDelta.y > 0) {
            scope.dollyOut();
          } else {
            scope.dollyIn();
          }

          dollyStart.copy(dollyEnd);

          scope.update();
          break;

        case 3:
          // three-fingered touch: pan

          if (scope.noPan === true) return;
          if (state !== STATE.TOUCH_PAN) return;

          panEnd.set(event.touches[0].pageX, event.touches[0].pageY);
          panDelta.subVectors(panEnd, panStart);

          scope.pan(panDelta.x, panDelta.y);

          panStart.copy(panEnd);

          scope.update();
          break;

        default:


          state = STATE.NONE;

      }
    };

    this.touchend = function () {
      if (scope.enabled === false) return;

      //scope.dispatchEvent(endEvent);
      state = STATE.NONE;
    };

    this.domElement.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    }, false);

    // force an update at start
    this.update();
  }

  _prototypeProperties(OrbitControls, null, {
    up: {
      value: function up() {
        this.domElement.addEventListener("mousedown", this.onMouseDown, false);
        this.domElement.addEventListener("mousewheel", this.onMouseWheel, false);
        this.domElement.addEventListener("DOMMouseScroll", this.onMouseWheel, false); // firefox

        this.domElement.addEventListener("touchstart", this.touchstart, false);
        this.domElement.addEventListener("touchend", this.touchend, false);
        this.domElement.addEventListener("touchmove", this.touchmove, false);

        window.addEventListener("keydown", this.onKeyDown, false);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    down: {
      value: function down() {
        this.domElement.removeEventListener("mousedown", this.onMouseDown, false);
        this.domElement.removeEventListener("mousewheel", this.onMouseWheel, false);
        this.domElement.removeEventListener("DOMMouseScroll", this.onMouseWheel, false); // firefox

        this.domElement.removeEventListener("touchstart", this.touchstart, false);
        this.domElement.removeEventListener("touchend", this.touchend, false);
        this.domElement.removeEventListener("touchmove", this.touchmove, false);

        window.removeEventListener("keydown", this.onKeyDown, false);
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return OrbitControls;
})();

var EditorMode = (function () {
  function EditorMode(canvas) {
    this.canvas = canvas;

    this._attachListeners();
  }

  _prototypeProperties(EditorMode, null, {
    up: {
      value: function up() {
        var canvas = this.canvas,
            renderer = canvas.renderer,
            element = renderer.domElement;

        element.addEventListener("mousedown", this.listeners.mousedown);
        element.addEventListener("mousemove", this.listeners.mousemove);
        element.addEventListener("mouseup", this.listeners.mouseup);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    down: {
      value: function down() {
        var canvas = this.canvas,
            renderer = canvas.renderer,
            element = renderer.domElement;

        element.removeEventListener("mousedown", this.listeners.mousedown);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    create: {
      value: function create() {
        this.up();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _attachListeners: {
      value: function AttachListeners() {
        var _this5 = this;
        var downPosition = new THREE.Vector2(),
            movePosition = new THREE.Vector2(),
            upPosition = new THREE.Vector2(),
            canvas = this.canvas;

        var atom1 = undefined,
            atom2 = undefined;

        var fixed = false;

        this.listeners = {};

        this.listeners.mousedown = function (e) {
          e.preventDefault();

          downPosition.set(e.clientX, e.clientY);

          var caster = _this5._getRayCaster(downPosition);
          var intersect = caster.intersectObjects(canvas.group.children);
          var position = _this5._getPosition(downPosition);

          if (e.which === 1 && position && intersect.length === 0) {
            var atom = new Chem.Atom();

            atom.atomicNumber = canvas.getData("element");
            atom.position = position;
            canvas.addAtom(atom);

            atom1 = atom;
          } else if (position && intersect.length > 0) {
            var model = _this5._getNearest(intersect);

            if (model instanceof Chem.Atom) {
              if (e.which === 1) {
                atom1 = model;
              } else if (e.which === 3) {
                canvas.removeAtom(model);
              }
            } else if (model instanceof Chem.Bond) {
              if (e.which === 1) {
                if (model.order !== 3) {
                  model.order++;
                } else {
                  model.order = 1;
                }
                canvas.update();
              } else if (e.which === 3) {
                canvas.removeBond(model);
              }
            }
          }
        };

        this.listeners.mousemove = function (e) {
          var prevPosition = movePosition.clone();
          movePosition.set(e.clientX, e.clientY);

          var delta = prevPosition.distanceTo(movePosition);

          var caster = _this5._getRayCaster(movePosition);
          var position = _this5._getPosition(movePosition);

          if (e.which === 1 && atom1 && movePosition.distanceTo(downPosition) > 60) {
            var intersect = caster.intersectObjects(canvas.group.children);

            intersect = intersect.filter(function (item) {
              return item.object && item.object.type === "atom" && item.object.model !== atom2;
            });

            var model = _this5._getNearest(intersect);

            if (!fixed) {
              if (model) {
                if (atom2) {
                  canvas.removeAtom(atom2);
                }

                atom2 = model;
                fixed = true;

                if (!atom1.isConnected(atom2)) {
                  var bond = new Chem.Bond(atom1, atom2);
                  canvas.addBond(bond);
                }
              } else {
                if (!atom2) {
                  atom2 = new Chem.Atom();
                  atom2.atomicNumber = canvas.getData("element");
                  atom2.position = position;
                  new Chem.Bond(atom1, atom2);

                  canvas.addAtom(atom2);
                }

                atom2.position = position;
                canvas.update();
              }
            }
          }
        };

        this.listeners.mouseup = function (e) {
          e.preventDefault();
          upPosition.set(e.clientX, e.clientY);

          if (e.which === 1 && upPosition.distanceTo(downPosition) < 2 && atom1) {
            atom1.atomicNumber = canvas.getData("element");
            _this5.canvas.update();
          }

          atom1 = false;
          atom2 = false;
          fixed = false;
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getPosition: {
      value: function GetPosition(point) {
        var rayCaster = this._getRayCaster(point);
        var canvas = this.canvas;
        var planeZ = new THREE.Plane(rayCaster.ray.direction, -2);
        var position = rayCaster.ray.intersectPlane(planeZ);

        if (position) {
          var mat = new THREE.Matrix4();
          mat.getInverse(canvas.group.matrix);
          position.applyMatrix4(mat);
          return position;
        } else {
          return null;
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getRayCaster: {
      value: function GetRayCaster(point) {
        var element = this.canvas.renderer.domElement;

        var point3d = new THREE.Vector3(point.x / element.offsetWidth * 2 - 1, -(point.y / element.offsetHeight) * 2 + 1, 0.5);

        var rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(point3d, this.canvas.camera);

        return rayCaster;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    _getNearest: {
      value: function GetNearest(objects) {
        var distance = 0,
            result = null;

        for (var _iterator7 = objects[Symbol.iterator](), _step7; !(_step7 = _iterator7.next()).done;) {
          var object = _step7.value;
          if (!result || object.distance < distance) {
            distance = object.distance;
            result = object.object.model;
          }
        }

        return result;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return EditorMode;
})();

var OrbitMode = (function () {
  function OrbitMode(canvas) {
    this.canvas = canvas;

    this.orbitControl = new OrbitControls(canvas.camera, canvas.renderer.domElement);
  }

  _prototypeProperties(OrbitMode, null, {
    up: {
      value: function up() {
        this.orbitControl.up();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    down: {
      value: function down() {
        this.orbitControl.down();
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    create: {
      value: function create() {
        this.up();
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return OrbitMode;
})();

// TODO: draw cylinder dynamically
/* event */ /* event */
//
root.Mol3D = {
  Canvas: Canvas,
  Display: {
    BallAndStick: BallAndStick
  },
  Mode: {
    Orbit: OrbitMode,
    Editor: EditorMode
  }
};
})
(this);
//# sourceMappingURL=mol3d.js.map