import BaseDisplay from './_base.js';

var BAS_KEY = 'ball-and-stick';

export default
class BallAndStick extends BaseDisplay {

  constructor(canvas) {
    this.lights = [];
    this.geometries = {
      sphere: new THREE.SphereGeometry(0.3, 20, 20, 0, 2 * Math.PI),
      cylinder: new THREE.CylinderGeometry(0.04, 0.04, 1)
    };

    this.geometries.cylinder.applyMatrix(new THREE.Matrix4().makeTranslation(0, length / 2, 0));
    this.geometries.cylinder.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    super(canvas);
  }

  drawLight() {
    var light = new THREE.PointLight(0xffffff, 1.5);

    var a = () => {
      let position = this.canvas.camera.position.clone();
      position.x += 100;
      position.z += 300;
      position.y += 100;
      light.position.copy(position);

      requestAnimationFrame(a);
    };

    requestAnimationFrame(a);

    this.canvas.scene.add(light);
  }

  drawAtom(atom) {
    var material = new THREE.MeshPhongMaterial({
      ambient: atom.element.color,
      color: atom.element.color,
      specular: 0x101010,
      shininess: 30
    });

    var radius = Math.exp(-Math.pow(atom.element.atomicRadius - 91, 2) / 500) * atom.element.atomicRadius / 70;
    var mesh = new THREE.Mesh(this.geometries.sphere, material);
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(atom.position);
    mesh.type = 'atom';
    mesh.model = atom;
    this.canvas.group.add(mesh);

    atom.setData(BAS_KEY, mesh);
  }

  removeAtom(atom) {

  }

  drawBond(bond) {
    var elements;


    elements = {
      cylinders: []
    };
    bond.setData(BAS_KEY, elements);

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
      beginColor = new THREE.Color(begin.element.color),
      endColor = new THREE.Color(end.element.color),
      distance = beginPosition.distanceTo(endPosition),
      middle = beginPosition.clone().add(endPosition).divideScalar(2),
      d = 0.06;

    function generateTexture(b, e) {
      b = '#' + b.getHexString();
      e = '#' + e.getHexString();

      var width = 2,
        height = 200;

      // create canvas
      canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // get context
      var context = canvas.getContext('2d');

      // draw gradient
      context.rect(0, 0, width, height);
      var gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, e);
      gradient.addColorStop(0.5, e);
      gradient.addColorStop(0.5, b);
      gradient.addColorStop(1, b);
      context.fillStyle = gradient;
      context.fill();

      return canvas;
    }

    var context = generateTexture(beginColor, endColor);
    var texture = new THREE.Texture(context);
    context.remove();

    texture.needsUpdate = true; // important!

    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x101010,
      shininess: 30,
      map: texture,
      transparent: true
    });

    var c = (bond.order - 1) * d;

    for (var i = 0; i < bond.order; i++) {

      let mesh = new THREE.Mesh(this.geometries.cylinder, material);
      mesh.scale.z = distance;
      mesh.position.copy(middle);
      mesh.lookAt(endPosition);
      elements.cylinders.push(mesh);

      group.add(mesh);
    }


    for (var j in elements.cylinders) {
      let cylinder = elements.cylinders[j];

      cylinder.position.y += j * d * 2.1 - c;
    }

  }

  removeBond(bond) {

  }

  init() {
    this.drawLight();
    this.up();
  }

  up() {
    var scene = this.canvas.scene;
  }

  down() {
    var scene = this.canvas.scene;
  }

}