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
    var mat = new THREE.Matrix4();
    mat.translate(new THREE.Vector3(0, 1, 0));
    this.geometries.single = this.geometries.cylinder;
    this.geometries.double = new THREE.Geometry();
    this.geometries.double.merge(this.geometries.single, mat);

    this.geometries.cylinder.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

    super(canvas);
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
    if( ! atom.hasData(BAS_KEY)) {
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

    let radius = Math.exp(-Math.pow(atom.element.atomicRadius - 91, 2) / 500) * atom.element.atomicRadius / 70;
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
      beginColor = new THREE.Color(begin.element.color),
      endColor = new THREE.Color(end.element.color),
      distance = beginPosition.distanceTo(endPosition),
      middle = beginPosition.clone().add(endPosition).divideScalar(2),
      d = 0.06;

    var material, mesh;

    if(! bond.hasData(BAS_KEY)) {


      material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0x101010,
        shininess: 30,
        transparent: true
      });

      mesh = new THREE.Mesh(this.geometries.cylinder, material);
      bond.setData(BAS_KEY, mesh);
    } else {
      mesh = bond.getData(BAS_KEY);
      material = mesh.material;
    }

    let texture = BallAndStick.generateTexture(beginColor, endColor);

    material.map = texture;
    mesh.scale.z = distance;
    mesh.position.copy(middle);
    mesh.lookAt(endPosition);

    group.add(mesh);

/*
    var c = (bond.order - 1) * d;

    for (let i = 0; i < bond.order; i++) {
      let mesh = new THREE.Mesh(this.geometries.cylinder, material);
      mesh.scale.z = distance;
      mesh.position.copy(middle);
      mesh.lookAt(endPosition);
      elements.add(mesh);
    }
 for (let j in elements.children) {
 let cylinder = elements.children[j];

 cylinder.position.y += j * d * 2.1 - c;
 }
*/



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
    var scene = this.canvas.scene;
  }

  down() {
    var scene = this.canvas.scene;
  }

  static generateTexture(b, e) {
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