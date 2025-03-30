let main = function() {
	const MODEL_URL = 'model/cirno/cirno.pmx';

	/*+++*/
	//ui

	let doc = document;
	doc.idGet = document.getElementById;

	let nowMenu = 'ctrlmenu';

	//获取所有menu
	function getAllMenu() {
		return document.querySelectorAll('[class*="menu"]');
	};

	function getAllMenuName() {
		let menus = getAllMenu();
		let menusName = [];
		for (let i = 0; i < menus.length; i++) {
			menusName.push(menus[i].id);
		};
		return menusName;
	};

	function switchMenu(m) {
		if (!getAllMenuName().includes(m)) {
			throw new Error('😅你有这个菜单吗');
		};
		if (nowMenu) {
			if (m == 'modelmenu') updateModelList();
			let menu = document.getElementById(nowMenu);
			menu.style.top = '-100%';
		};
		if (m == 'modelmenu') updateModelList();
		menu = document.getElementById(m);
		menu.style.top = '0';
		console.log('由' + nowMenu + '变为' + m);
		nowMenu = m;
	};

	function getMenu(id) {
		return document.getElementById(id);
	}

	function updateModelList() {
		let menu = getMenu('modelmenu');
		let list = document.getElementById('model-list');
		list.innerHTML = '';
		if (SCENE && SCENE.mmdModels) {
			SCENE.mmdModels.forEach((m, i) => {
				console.log(i)
				let obj = document.createElement('div');
				obj.className = 'item'
				obj.innerHTML = m.model.name;
				list.append(obj);
			});
		};
	}
	//ui
	/*+++*/
	//main

	// 控制器类
	class BoneCtrller {
		constructor(bone) {
			if (bone) this.bone = bone;
			else throw new Error('no bone');
		}

		// 获取旋转
		getRot() {
			return this.bone.rotation;
		}

		// 获取坐标
		getPos() {
			return this.bone.position;
		}

		setRot(x, y, z) {
			if (x) this.bone.rotation.x = x;
			if (y) this.bone.rotation.y = y;
			if (z) this.bone.rotation.z = z;
		}

		setPos(x, y, z) {
			this.bone.position.x = x;
			this.bone.position.y = y;
			this.bone.position.z = z;
		}
	}

	class MMDScene {
		constructor(outputTarget) {
			// 初始化 Three.js 核心组件
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera(
				50,
				this.calculateAspectRatio(),
				0.1,
				1000
			);
			this.camera.position.set(-40, 35, 40);
			this.scene.add(this.camera);
			// 初始化渲染器
			this.renderer = new THREE.WebGLRenderer({
				antialias: true
			});
			//设置渲染器
			if (window.innerWidth >= window.innerHeight) this.renderer.setSize(window.innerWidth, window.innerHeight);
			else this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.renderer.setClearColor(0xffffff);
			this.renderer.setPixelRatio(window.devicePixelRatio);
			if (outputTarget) this.output = document.getElementById(outputTarget);
			if (this.output) this.output.appendChild(this.renderer.domElement); // 得到output元素
			else document.body.appendChild(this.renderer.domElement);
			console.log('渲染器准备完毕');
			this.effectRenderer = new THREE.OutlineEffect(this.renderer);
			// 集成相机控制器
			this.cameraControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
			// 配置渲染器尺寸
			this.updateRendererSize();
			console.log("MMDScene initialized");
			this.mmdLoader = new THREE.MMDLoader();
			this.mmdModels = [];
			this.highlightMaterial = new THREE.MeshBasicMaterial({
				color: 0xFFD700,
				transparent: true,
				opacity: 0.5,
				blending: THREE.AdditiveBlending
			});
			this.currentHighlight = null;
			this.clock = new THREE.Clock();
			this.count = 0;
		}

		//=== 核心方法 ===//
		/**
		 * 渲染场景
		 * @param {string} mode - 渲染模式: 'normal' 或 'outline'
		 */
		render(mode = MMDScene.RENDER_MODE.OUTLINE) {
			this.count++;
			const delta = this.clock.getDelta();
			if (this.physics) this.physics.update(delta);
			this.cameraControls.update();
			if (mode === MMDScene.RENDER_MODE.NORMAL) {
				this.renderer.render(this.scene, this.camera);
			} else {
				this.effectRenderer.render(this.scene, this.camera);
			}
		}

		/**
		 * 向场景中添加网格对象
		 * @param {THREE.BufferGeometry} geometry - 几何体
		 * @param {THREE.Material} material - 材质
		 * @returns {THREE.Mesh} 创建的网格对象
		 */
		addMesh(geometry, material) {
			if (!(geometry instanceof THREE.BufferGeometry)) {
				throw new TypeError("Invalid geometry: must be a THREE.BufferGeometry");
			}
			if (!(material instanceof THREE.Material)) {
				throw new TypeError("Invalid material: must be a THREE.Material");
			}
			const mesh = new THREE.Mesh(geometry, material);
			this.scene.add(mesh);
			return mesh;
		}

		loadMMDModel(url, onload, onprocess, onerror, p) {
			this.mmdLoader.load(url, (model) => {
				this.mmdModels.push({
					model: model,
					bones: model.skeleton.bones
				});
				if (p.showSkeleton) {
					let skeHelper = new THREE.SkeletonHelper(model);
					this.skeletonHelper = skeHelper;
					SCENE.scene.add(skeHelper);
				};
				model.name = p.name || 'undefined';
				if (p.physics && p.physics == true) this.physics = new THREE.MMDPhysics(model, model.geometry.userData.MMD.rigidBodies, model.geometry.userData.MMD.constraints, p.physicsP || {});
				onload(model);
			}, onprocess, onerror)
		}


		//=== 工具方法 ===//
		/** 释放资源 */
		dispose() {
			this.renderer.dispose();
			this.cameraControls.dispose();
			this.scene.traverse(obj => {
				if (obj.isMesh) {
					obj.geometry.dispose();
					if (Array.isArray(obj.material)) {
						obj.material.forEach(m => m.dispose());
					} else {
						obj.material.dispose();
					}
				}
			});
		}

		/** 响应窗口大小变化 */
		handleResize() {
			this.camera.aspect = this.calculateAspectRatio();
			this.camera.updateProjectionMatrix();
			this.updateRendererSize();
		}

		//=== 私有方法 ===//
		/** 计算相机宽高比（横向扩展 1.5 倍以避免中心裁剪） */
		calculateAspectRatio() {
			const {
				innerWidth: w,
				innerHeight: h
			} = window;
			return w >= h ? (w * 1) / h : w / (h * 1);
		}

		/** 更新渲染器尺寸 */
		updateRendererSize() {
			const {
				innerWidth: w,
				innerHeight: h
			} = window;
			const [width, height] = w >= h ? [w * 1, h] : [w, h * 1];
			this.renderer.setSize(width, height);
		}
	};

	// 静态常量定义渲染模式
	MMDScene.RENDER_MODE = {
		NORMAL: 'normal',
		OUTLINE: 'outline'
	};

	let SCENE = new MMDScene();

	//创建stats
	let stats = new Stats();
	stats.setMode(0);
	stats.domElement.style.left = window.innerWidth - 80 + 'px';
	stats.domElement.style.top = '0px';
	document.body.append(stats.domElement);

	//唤出菜单
	switchMenu('modelmenu');
	//doc.idGet('ctrlmenu').style.top = '5px';




	//设置网格辅助线
	let gridHelper = new THREE.GridHelper(100, 100);
	SCENE.scene.add(gridHelper);
	console.log('辅助线完毕');

	//设置光源
	let allLight = new THREE.AmbientLight("#ffffff");
	//scene.add(allLight);
	let dirLight = new THREE.DirectionalLight();
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 1;
	dirLight.shadow.camera.far = 160;
	dirLight.shadow.camera.left = -160;
	dirLight.shadow.camera.right = 160;
	dirLight.shadow.camera.top = 160;
	dirLight.shadow.camera.bottom = -160;
	dirLight.intensity = 0.9;
	dirLight.position.set(80, 80, 80);
	dirLight.target = SCENE.scene;
	SCENE.scene.add(dirLight);
	console.log('光源完毕');

	let ctrlLayer = doc.idGet('ctrl');

	let ctrller, bindBone, phymmd;

	//doc.idGet('play').addEventListener('click', () => {
	Ammo().then(init);
	//});
	render();

	function init() {
		doc.idGet('ctrl-model').addEventListener('click', () => {
			switchMenu('ctrlmenu');
		});
		doc.idGet('reset').addEventListener('click', () => {
			SCENE.physics.reset();
		});
		doc.idGet('load-model').addEventListener('click', () => {
			switchMenu('ctrlmenu');
			SCENE.loadMMDModel(doc.idGet('model-load-url').value || MODEL_URL, (m) => {
				m.castShadow = true;
				m.receiveShadow = true;
				setBonesSwitch(m)
				//后期模型处理
				m.material.forEach((f) => {
					f.type = "MeshToonMaterial";
					f.wireframe = false;
				});
				SCENE.scene.add(m);
				updateModelList();
				bindCtrl(m.skeleton.bones[0]);
				//let mmdPhysics = new THREE.MMDPhysics(m);
				//物理helper
				//let phyHelper = SCENE.MMDPhysics.createHelper();
				//scene.add(phyHelper);
				console.log('MMD模型准备完毕');
				console.log(m);
			}, (progress) => {
				console.log('MMD模型加载:' + (progress.loaded / progress.total * 100).toFixed(1) + '%');
			}, (e) => {
				console.error('MMD模型加载失败');
				console.error(e);
			}, {
				showSkeleton: true,
				name: doc.idGet('model-load-name').value,
				physics: true,
				physicsP: {
					maxStepNum: 20
				}
			});
		});
	}
	//渲染循环
	function render() {
		stats.update();
		//mmdPhysics.update();
		requestAnimationFrame(render);
		//if (mmdModels) mmdModels[0].bones.forEach((b, i) => {
		//
		//});
		SCENE.render(MMDScene.RENDER_MODE.OUTLINE);
	}

	window.addEventListener('resize', () => {
		SCENE.handleResize();
		stats.domElement.style.left = window.innerWidth - 80 + 'px';
	});

	doc.idGet('hidden-switch').addEventListener('click', () => {
		switchMenu('modelmenu');
	});

	// 遍历骨骼，添加选择按钮
	function setBonesSwitch(model) {
		if (model.type !== 'SkinnedMesh') throw new Error('不是mmd模型网格！');
		if (!model.skeleton.bones) throw new Error('你骨骼呢😅');
		doc.idGet('ctrl').innerHTML = '';
		model.skeleton.bones.forEach((b) => {
			let ctrlRing = document.createElement('div');
			ctrlRing.className = 'ring';
			ctrlRing.id = b.name;
			ctrlRing.addEventListener('click', (e) => {
				bindCtrl(b);
			});
			ctrlRing.innerHTML = b.name;
			//ctrlRing.append
			ctrlLayer.append(ctrlRing);
			b.ring = ctrlRing;
		});
	}
	// 骨骼控制器 指定操作哪一个骨骼
	function bindCtrl(bone) {
		if (!bone || bone.type !== 'Bone') return false;

		// 清理旧事件监听器
		['x', 'y', 'z'].forEach(axis => {
			const input = doc.idGet(`ctrl-${axis}`);
			const newInput = input.cloneNode(true); // 克隆元素移除旧监听器
			input.parentNode.replaceChild(newInput, input);
		});

		// 将弧度转换为角度（保留1位小数）
		const currentRot = {
			x: THREE.MathUtils.radToDeg(bone.rotation.x).toFixed(1),
			y: THREE.MathUtils.radToDeg(bone.rotation.y).toFixed(1),
			z: THREE.MathUtils.radToDeg(bone.rotation.z).toFixed(1)
		};

		// 更新滑动条和显示数值
		['x', 'y', 'z'].forEach(axis => {
			const input = doc.idGet(`ctrl-${axis}`);
			const display = input.nextElementSibling;

			// 设置当前值
			input.value = currentRot[axis];
			display.textContent = currentRot[axis];

			// 绑定新事件
			input.addEventListener('input', (e) => {
				const degrees = parseFloat(e.target.value);
				bone.rotation[axis] = THREE.MathUtils.degToRad(degrees);
				display.textContent = degrees.toFixed(1);
			});
		});

		// 高亮当前选中骨骼（可选）
		const rings = document.querySelectorAll('.ring');
		rings.forEach(r => r.style.backgroundColor = '#DAEBF6');
		if (bone.ring) bone.ring.style.backgroundColor = '#FFD700';
	}
};
main();