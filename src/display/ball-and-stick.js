import BaseDisplay from './_base.js';

var BAS_KEY = 'ball-and-stick';

export default
class BallAndStick extends BaseDisplay {

  constructor(canvas) {
    super(canvas);

    this.lights = [];
    this.geometries = {
      sphere: new THREE.SphereGeometry(0.3, 20, 20, 0, 2 * Math.PI),
      cylinder: new THREE.CylinderGeometry(0.04, 0.04, 1)
    };

    var matrix1 = new THREE.Matrix4();
    matrix1.setPosition(new THREE.Vector3(0, .08, 0));

    var matrix2 = new THREE.Matrix4();
    matrix2.setPosition(new THREE.Vector3(0, -.08, 0));

    this.geometries.cylinder.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));
    this.geometries.bonds = {};
    this.geometries.bonds[1] = this.geometries.cylinder;
    this.geometries.bonds[2] = this.geometries.cylinder.clone();
    this.geometries.bonds[2].merge(this.geometries.cylinder, matrix2);
    this.geometries.bonds[3] = this.geometries.bonds[2].clone();
    this.geometries.bonds[3].merge(this.geometries.bonds[2], matrix1);
  }

  drawLight() {
    var light = new THREE.PointLight(0xffffff, 1.5);

    var updateLightPosition = () => {
      let position = this.canvas.camera.position;

      light.position.set(position.x * 100, position.y * 100, position.z * 300);

      requestAnimationFrame(updateLightPosition);
    };

    requestAnimationFrame(updateLightPosition);

    this.canvas.scene.add(light);
  }

  drawAtom(atom) {
    var mesh, material;
    if (!atom.hasData(BAS_KEY)) {
      material = new THREE.MeshPhongMaterial({
        specular: 0x101010,
        shininess: 30
      });
      mesh = new THREE.Mesh(this.geometries.sphere, material);

      atom.setData(BAS_KEY, mesh);
      this.canvas.group.add(mesh);

      mesh.type = 'atom';
      mesh.model = atom;
    } else {
      mesh = atom.getData(BAS_KEY);
      material = mesh.material;
    }

    material.ambient.set(atom.element.color);
    material.color.set(atom.element.color);

    let radius = (1 / Math.exp(-atom.element.atomicRadius / 60) - 1) * atom.element.atomicRadius / 250;
    radius = Math.min(radius, 2.1);
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(atom.position);
  }

  removeAtom(atom) {
    let mesh = atom.getData(BAS_KEY);
    this.canvas.group.remove(mesh);
  }

  drawBond(bond) {
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
        color: 0xffffff,
        specular: 0x101010,
        shininess: 30,
        transparent: true
      });

      material.colorCache = [-1, -1];
      mesh = new THREE.Mesh(this.geometries.bonds[bond.order], material);
      mesh.model = bond;
      mesh.type = 'bond';
      bond.setData(BAS_KEY, mesh);
    } else {
      mesh = bond.getData(BAS_KEY);
      let suitGeometry = this.geometries.bonds[bond.order];

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
  }

  removeBond(bond) {
    let mesh = bond.getData(BAS_KEY);
    this.canvas.group.remove(mesh);
  }

  init() {
    this.drawLight();
    this.up();
  }

  up() {
  }

  down() {
  }

  static generateTexture(b, e) {
    b = new THREE.Color(b);
    e = new THREE.Color(e);

    b = '#' + b.getHexString();
    e = '#' + e.getHexString();

    var width = 2,
        height = 200;

    // create canvas
    var canvas = document.createElement('canvas');
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

    var texture = new THREE.Texture(canvas);
    canvas.remove();

    texture.needsUpdate = true; // important!

    return texture;
  }
}