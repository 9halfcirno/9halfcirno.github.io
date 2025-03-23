const audioURL = 'music/dance cirno fix.mp3';
const modelURL = 'model/cirno/cirno.pmx';
const motionURL = 'an/dance.vmd';
const cameraMotionURL = 'an/dance camera.vmd'

let mainmenu = document.getElementById('mainmenu');
let ctrlmenu = document.getElementById('ctrlmenu');
ctrlmenu.style.top = '-100%';
let output = document.getElementById('three-output');
let selCamera;
document.querySelectorAll('input[name="cam"]').forEach(radio => {
    radio.addEventListener('change', event => {
        selCamera = event.target.value;
        console.log("相机切换为:", event.target.value);
    });
});
load('exit');

function load(m, p) {
    let loadingEle = document.getElementById('loading');
    if (!loadingEle) {
        console.error("找不到 #loading 元素");
        return;
    }

    function setLoadingMessage(msg) {
        loadingEle.innerHTML = `LOADING…<div>${msg}</div>`;
    }
    if (m === "enter") {
        loadingEle.style.top = '0px';
        setLoadingMessage(p);
        console.log('loading…\n' + p);
    } else if (m === "exit") {
        loadingEle.style.top = '-100%';
        console.log('exit loading');
    } else if (m === "msg") {
        setLoadingMessage(p);
        console.log('loading…\n' + p);
    } else {
        console.warn(`LOADING的无效值: ${m}`);
    };
}

document.getElementById('startButton').addEventListener('click', () => {
    Ammo().then(main());
});

function main() {
    // 防止重复初始化
    if (window._mmdInitialized) return;
    window._mmdInitialized = true;
    mainmenu.style.top = '-25%';
    mainmenu.style.maxHeight = '20%';
    output.style.top = '0px';
    load('enter', '加载THREE场景\n(ᗜˬᗜ)');
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    let camHelper = new THREE.CameraHelper(camera);
    scene.add(camHelper);
    let anCamera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 1000);
    let anCamHelper = new THREE.CameraHelper(anCamera);
    scene.add(anCamHelper);
    let renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xddf8fc);
    output.appendChild(renderer.domElement);
    scene.add(camera);
    setTimeout(() => {
        // 添加网格辅助线
        let grid = new THREE.GridHelper(15, 15);
        scene.add(grid);

        let cubes = [];
        let cubesNum = 1000;
        for (let i = 0; i <= cubesNum; i++) {
            // load('msg', '加载THREE场景\n立方体\n' + i + '/' + cubesNum);
            let size = 2 + Math.random() * 5;
            let color = new THREE.Color();
            color.setRGB(
                0.25 + Math.random() * 0.6,
                0.7 + Math.random() * 0.2,
                1 // + Math.random() * 0.2
            );
            let cM = new THREE.MeshBasicMaterial({
                color: color
            });
            cM.transparent = true;
            cM.opacity = 0.3 + Math.random() * 0.3;
            cubes[i] = new THREE.Mesh(
                new THREE.BoxGeometry(size, size, size),
                cM
            );
            cubes[i].position.x = -100 + Math.random() * 200;
            cubes[i].position.y = -100 + Math.random() * 200;
            cubes[i].position.z = -100 + Math.random() * 200;
            if (Math.abs(cubes[i].position.x) < 15 && Math.abs(cubes[i].position.z) < 15) cubes[i].visible = false;
            else cubes[i].visible = true;
            scene.add(cubes[i]);
        };
        console.log(cubes[1]);
        load('msg', '加载THREE场景');

        let planeG = new THREE.PlaneGeometry(200, 200);
        // 平面材质改为xx材质
        let planeM = new THREE.MeshToonMaterial({
            color: 0xbacfff
        });
        let plane = new THREE.Mesh(planeG, planeM);
        plane.receiveShadow = true;
        plane.rotation.x = Math.PI / -2;
        //    scene.add(plane);

        let tG = new THREE.CylinderGeometry(15, 15, 1, 9);
        // 平面材质改为xx材质
        let tM = new THREE.MeshToonMaterial({
            color: 0x86aeff
        });
        let t = new THREE.Mesh(tG, tM);
        t.receiveShadow = true;
        t.position.set(0, -1, 0);
        scene.add(t);

        // 设置相机位置
        camera.position.set(0, 15, 30);
        camera.rotation.set(0, 0, 0);
        //    camera.lookAt(0, 10, 0);

        // 轨道控制
        const controls = new THREE.OrbitControls(camera, renderer.domElement);

        load('msg', '载入灯光');
        // 添加光照
        const light = new THREE.SpotLight();
        light.angle = Math.PI;
        light.castShadow = true;
        light.shadow.mapSize = new THREE.Vector2(1024, 1024);
        light.shadow.camera.far = 800;
        light.shadow.camera.near = 1;
        light.shadow.camera.fov = 50;
        light.position.set(100, 100, 100);
        light.penumbra = 0.8;
        light.distance = 0;
        light.color = new THREE.Color(0xffffff);
        light.intensity = 1;
        light.target.position.set(0, 50, 0);
        scene.add(light);
        scene.add(light.target);

        load('msg', '载入MMD依赖');
        //        load('exit');
        // MMD 动画助手
        const helper = new THREE.MMDAnimationHelper({
            sync: true
        });

        //mMDLoader v1
        // 加载 HTML5 音频
        let audioElement = new Audio(audioURL);
        audioElement.loop = true;
        let isMusicPlaying = false;

        // 播放/暂停 音乐 & 同步 MMD
        document.getElementById('playMusic').addEventListener('click', () => {
            if (!isMusicPlaying) {
                audioElement.play().then(() => {
                    // 重置动画到起点
                    if (model && model.mixer) {
                        model.mixer.setTime(0);
                        console.log('动画重置到起点');
                    }
                }).catch((e) => {
                    alert(e);
                });
                isMusicPlaying = true;
            } else {
                audioElement.pause();
                isMusicPlaying = false;
            }
        });

        let phymmd;
        var model;
        // MMD 模型加载
        load('msg', '载入MMD模型');
        let loader = new THREE.MMDLoader();
        loader.load(modelURL, (m) => {
            model = m;
            console.log('model')
            console.log(model);
            model.material.forEach((m, i) => {
                model.material[i].type = "MeshToonMaterial";
                model.material[i].light = true;
                //model.material[i].wireframe = true;
            });
            model.castShadow = true;

            console.log('THREE');
            console.log(THREE);
            scene.add(model);
            try {
                if (THREE.MMDPhysics) {
                    phymmd = new THREE.MMDPhysics(model, []);
                    console.log('phymmd');
                    console.log(phymmd);
                } else console.warn('THREE.MMDPhysics 载入失败');
            } catch (e) {
                console.error(e);
            };


            // 加载 VMD 动画
            load('msg', '载入MMD动画');
            loader.loadAnimation(motionURL, model, (mmdAnimation) => {
                helper.add(model, {
                    animation: mmdAnimation,
                    physics: true,
                });
                //                helper.setPhysics(model); // 启用物理效果
                // 监听音频播放事件，确保动画同步
                audioElement.addEventListener('play', () => {
                    console.log(helper);
                    helper.seek(0); // 重新同步动画
                });

                console.log('MMD 动画加载完成');
                console.log('scene');
                console.log(scene);
                console.log('helper');
                console.log(helper);
                setTimeout(() => {
                    load('exit');
                    ctrlmenu.style.top = '5px';
                    ctrlmenu.style.maxHeight = '100%';
                }, 750);
            });
            loader.loadAnimation(cameraMotionURL, anCamera, (cameraAnimation) => {
                helper.add(anCamera, {
                    animation: cameraAnimation,
                    physics: false
                });
            });
        }, (progress) => {
            load('msg', '载入MMD模型:' + (progress.loaded / progress.total * 100).toFixed(1) + '%');
            console.log(`模型加载进度: ${(progress.loaded / progress.total * 100).toFixed(1)}%`);
        });

        //load('exit');
        renderer.shadowMap.enable = true;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        let effect = new THREE.OutlineEffect(renderer);
        effect.shadowMap.enable = true;
        // 动画循环

        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            //mMDLoader v1
            if (phymmd !== undefined) {
                phymmd.update(delta);
            };
            if (isMusicPlaying) {
                helper.update(delta);
                //helper.animate(delta); // 确保物理模拟生效
                //helper.updatePhysics(delta); // 让 MMDPhysics.js 计算布料、头发
            };


            cubes.forEach((c, i) => {
                if (!cubes[i].yspeed) cubes[i].yspeed = 0.1 + Math.random() * 0.2;
                cubes[i].position.y += cubes[i].yspeed;
                if (cubes[i].position.y > 100) {
                    let size = 2 + Math.random() * 5;
                    cubes[i].geometry = new THREE.BoxGeometry(size, size, size);
                    cubes[i].position.y = -100;
                    cubes[i].position.x = -100 + Math.random() * 200;
                    cubes[i].position.z = -100 + Math.random() * 200;
                    cubes[i].yspeed = 0.1 + Math.random() * 0.2;
                    if (Math.abs(cubes[i].position.x) < 15 && Math.abs(cubes[i].position.z) < 15) cubes[i].visible = false;
                    else cubes[i].visible = true;
                    cubes[i].colorWrite = true;
                };
            });
            controls.update();
            if (selCamera == 'anCamera') effect.render(scene, anCamera);
            else effect.render(scene, camera);
            //renderer.render(scene, camera);
        }
        animate();

        // 适配窗口变化
        output.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            anCamera.aspect = window.innerWidth / window.innerHeight;
            anCamera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            anCamera.aspect = window.innerWidth / window.innerHeight;
            anCamera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }, 2500);
};