function init() {

    //구체, 광원을 저장할 scene과 배경을 저장할 bgScene 각각 생성
    var scene = new THREE.Scene();
    var bgScene = new THREE.Scene();

    //장면을 렌더링했을 때, 어떻게 보여질지 정의
    var camera = new THREE.PerspectiveCamera(45,
        window.innerWidth / window.innerHeight, 0.1, 1000);

    //camera의 위치
    camera.position.x = -10;
    camera.position.y = 15;
    camera.position.z = 25;

    //camera가 객체를 향하도록 하기위해 중앙을 가리키도록 함.
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    //배경을 위해 직교 카메라로 정의
    var bgCamera = new THREE.OrthographicCamera(
        -window.innerWidth, window.innerWidth,
        window.innerHeight, -window.innerHeight, -10000, 10000);
    bgCamera.position.z = 50; //bgCamera의 위치 지정

    //renerer을 생성하고 color와 size결정
    var renderer = new THREE.WebGLRenderer(); //렌더링하는데 그래픽카드 사용
    renderer.setClearColor(new THREE.Color(0xffffff, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);

    //지구를 만들고 scene에 추가
    var sphere = createMesh(new THREE.SphereGeometry(10, 50, 50));
    scene.add(sphere);

    //배경이미지 생성하여 bgScene에 추가
    var materialColor = new THREE.MeshBasicMaterial(
        {map:THREE.ImageUtils.loadTexture("hubble.jpg"),
            depthTest: false
        });
    var bgPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(1,1),materialColor);
    bgPlane.position.z = -100;
    bgPlane.scale.set(window.innerWidth*2, window.innerHeight*2,1);
    bgScene.add(bgPlane);


    //위성을 시뮬레이션, 마우스로 컨트롤
    var orbitControls = new THREE.OrbitControls(camera);
    orbitControls.autoRotate = false;   //자동으로 회전하지 않도록 설정

    //함수를 호출하고 종료하는 소요시간을 정확히 계산하는데 사용
    var clock = new THREE.Clock();

    //객체 전체에 빛(색상) 적용, scene에 추가
    var ambi = new THREE.AmbientLight(0xffffff);
    scene.add(ambi);

    //HTML의 div요소에 렌더러의 결과 추가
    document.getElementById("output").appendChild(renderer.domElement);

    //dat.GUI에서 변경할 속성을 가진 객체
    var controls = new function(){
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.Scale = 1;
    };

    //dat.GUI 객체에 속성을 pass하고 범위 설정
    var gui = new dat.GUI();
    gui.add(controls, 'rotationX', -5, 5);
    gui.add(controls, 'rotationY', -5, 5);
    gui.add(controls, 'rotationZ', -5, 5);
    gui.add(controls, 'Scale', 0, 3);


    //렌더링 함수 호출
    render();

    //지구를 만들기 위한 함수
    function createMesh(geom) {

        //텍스쳐 추가
        var planetTexture = THREE.ImageUtils.loadTexture("Earth.png");
        var specularTexture = THREE.ImageUtils.loadTexture("EarthSpec.png");

        //빛을 받아 반짝이는 속성을 가진 객체의 색상, 반짝임 정도 정의
        var planetMaterial = new THREE.MeshPhongMaterial();
        planetMaterial.specularMap = specularTexture;
        planetMaterial.specular = new THREE.Color(0xffffff);
        planetMaterial.shininess = 2;

        planetMaterial.map = planetTexture;
        planetMaterial.shininess = 150;


        //여러 물질을 사용해 메시를 생성
       var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [planetMaterial]);

        return mesh;
    }

    function render() {

        //렌더링된 장면이 지워지지 않도록 false
        renderer.autoClear = false;
        renderer.clear();

        //dat.GUI를 통해 값을 변경했을 때, 객체의 값 변경
        sphere.rotation.x = controls.rotationX;
        sphere.rotation.y = controls.rotationY;
        sphere.rotation.z = controls.rotationZ;
        sphere.scale.set(controls.Scale,controls.Scale,controls.Scale);

        //경과시간delta를 통해 update
        var delta = clock.getDelta();
        orbitControls.update(delta);

        //다음 렌더링을 스케쥴링
        requestAnimationFrame(render);

        //두 개의 scene 렌더링
        renderer.render(bgScene, bgCamera);
        renderer.render(scene, camera);
    }
}
window.onload = init;