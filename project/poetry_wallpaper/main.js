/*=== 初始变量 ===*/

// 获取主容器
const ele_poetry = document.getElementById("poetry");
const ele_content = document.getElementById("content");

let lastRefreshTime = 0;

// === 统一定义 options（修复作用域问题） ===
let options = Object.assign({
	refreshTime: 3600000,
	bgColor: "#f8f5ef",
	textOnhoverColor: "#7b5e2a",
	boxBorderColor: "#d5c8b6",
	enableBgAnimation: true,
	runBgAnimation: true,
	ballColor: "#dda7896e"
}, JSON.parse(localStorage.getItem("poetryWallPaperOption") || "{}"));

updateSetting();

/*=== 工具函数 ===*/
function createEle(ele, id, cN) {
	let e = document.createElement(ele);
	if (id) e.id = id;
	if (cN) e.className = cN;
	return e;
}

function tip(text) {
	let t = document.createElement("p");
	t.className = "tip";
	t.innerHTML = text;
	document.getElementById("tip-box").append(t);
	setTimeout(() => {
		t.className = "tip out";
		setTimeout(() => {
			t.remove();
		}, 900)
	}, 1800)
}

/*=== 判断词牌 ===*/
let chipaiData = [
	"十六字令", "梧桐影", "醉妆词", "忆江南", "捣练子", "渔歌子", "忆王孙", "调笑令", "如梦令", "长相思",
	"相见欢", "乌夜啼", "生查子", "点绛唇", "浣溪沙", "菩萨蛮", "卜算子", "采桑子", "减字木兰花", "诉衷情",
	"谒金门", "好事近", "忆秦娥", "清平乐", "更漏子", "画堂春", "阮郎归", "摊破浣溪沙", "人月圆", "桃源忆故人",
	"眼儿媚", "贺圣朝", "柳梢青", "太常引", "武陵春", "惜分飞", "南歌子", "醉花阴", "浪淘沙", "鹧鸪天",
	"鹊桥仙", "虞美人", "南乡子", "玉楼春", "一斛珠", "踏莎行", "小重山", "蝶恋花", "一剪梅", "临江仙",
	"渔家傲", "苏幕遮", "定风波", "破阵子", "青玉案", "江城子", "风入松", "满江红", "水调歌头", "满庭芳",
	"八声甘州", "声声慢", "念奴娇", "桂枝香", "水龙吟", "雨霖铃", "永遇乐", "沁园春", "贺新郎", "摸鱼儿",
	"钗头凤", "祝英台近", "洞仙歌", "齐天乐", "暗香", "疏影", "扬州慢", "双双燕", "宴山亭", "望海潮",
	"一萼红", "六州歌头", "石州慢", "瑞龙吟", "夜半乐", "兰陵王", "琐窗寒", "过秦楼", "莺啼序", "江城梅花引",
	"月下笛", "霓裳中序第一", "曲玉管", "天香", "眉妩", "长亭怨慢", "西河", "醉蓬莱", "望湘人", "南浦"
];

// 异步加载 chipai.json
fetch('./chipai.json')
	.then(r => r.ok ? r.json() : Promise.reject())
	.then(data => {
		chipaiData = data.chipai;
		console.log('词牌文件加载成功', chipaiData);
	})
	.catch(err => console.warn('加载词牌文件出错', err));

function poetryType(title) {
	if (chipaiData && title) {
		if (chipaiData.some(c => title.startsWith(c))) return "词";
	}
	return "诗";
}

/*=== 刷新诗词函数 ===*/
function setPoetry() {
	jinrishici.load(r => {
		if (r.data.origin.content > 10 || r.data.origin.content.join("").length > 200) {
			setPoetry();
			return;
		}
		let title = r.data.origin.title || "无题";
		let content = r.data.origin.content;
		let dynasty = r.data.origin.dynasty || "未知";
		let name = r.data.origin.author || "佚名";
		let type = poetryType(title);

		let html = `<div id="symbol" class="${type === "诗" ? "sy-shi" : "sy-chi"}">${type}</div>
		<strong id="title">${title}</strong>
		<p><span id="dynasty">[${dynasty}]</span> <span id="author">${name}</span></p>
		<div id="content">`;
		for (let s of content) html += `<p class="s">${s}</p>`;
		html += "</div>";

		ele_poetry.innerHTML = html;
		ele_poetry.className = type === "词" ? "chii" : "shi";
		document.querySelectorAll(".s").forEach(e => {
			e.classList.toggle("chi", type === "词");
		});

		// 设置点击复制事件
		document.getElementById("title").onclick = () => {
			navigator.clipboard.writeText(`${title}\n[${dynasty}] ${name}\n${content.join("\n")}`).then(() => {
				console.log("复制成功");
				tip("复制成功")
			}, () => {
				console.log("复制失败");
				tip("复制失败")
			});
		}
		document.querySelectorAll(".s").forEach(p => {
			p.onclick = () => {
				navigator.clipboard.writeText(p.innerHTML).then(() => {
					console.log("复制成功");
					tip("复制成功")
				}, () => {
					console.log("复制失败");
					tip("复制失败")
				});
			}
		})

		// ✅ 新的锁定逻辑
		const symbol = document.getElementById("symbol");
		symbol.onclick = () => {
			const locked = document.getElementById("symbol").classList.toggle("locked");
			if (locked) {
				// 刚锁定：记录暂停时间
				lastPTime = Date.now();
			} else {
				// 解锁：计算暂停持续时间并补偿
				if (lastPTime) {
					const pausedDuration = Date.now() - lastPTime;
					lastRefreshTime += pausedDuration;
					lastPTime = 0;
				}
			}
		};
	});
}

// 刷新按钮
let refreshButton = document.getElementById("refresh");
refreshButton.onclick = () => {
	setPoetry();
	lastRefreshTime = Date.now();
	refreshButton.classList.add("rotation");
	setTimeout(() => refreshButton.classList.remove("rotation"), 900);
};

/*=== 背景动画 ===*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let balls = [];

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function addBall(r, x, y) {
	const vx = (Math.random() - 0.5) * 1.5;
	const vy = -Math.random() - 0.5;
	balls.push({
		r,
		x,
		y,
		vx,
		vy
	});
}

function drawBall() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	balls.forEach(ball => {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
		ctx.fillStyle = options.ballColor;
		ctx.fill();
		ctx.closePath();
	});
}

function updateBall() {
	for (let i = balls.length - 1; i >= 0; i--) {
		const b = balls[i];
		b.x += b.vx;
		b.y += b.vy;
		if (b.x - b.r < 0 || b.x + b.r > canvas.width) b.vx = -b.vx;
		if (b.y + b.r < 0) balls.splice(i, 1);
	}
	drawBall();
	if (Math.random() < 0.01) {
		const r = (0.02 + 0.06 * Math.random()) * Math.sqrt(window.innerHeight ** 2 + window.innerWidth ** 2);
		const x = Math.random() * (canvas.width - r * 2) + r;
		const y = canvas.height + r;
		addBall(r, x, y);
	}
}

/*=== 更新设置样式 ===*/
function updateSetting() {
	let vars = document.documentElement.style;
	vars.setProperty("--box-border-color", options.boxBorderColor);
	vars.setProperty("--bg-color", options.bgColor);
	vars.setProperty("--poety-onhover-color", options.textOnhoverColor);
	localStorage.setItem("poetryWallPaperOption", JSON.stringify(options));
}

/*=== 恢复默认设置 ===*/
function reSetting() {
	options = {
		refreshTime: 3600000,
		bgColor: "#f8f5ef",
		textOnhoverColor: "#7b5e2a",
		boxBorderColor: "#d5c8b6",
		enableBgAnimation: true,
		runBgAnimation: true,
		ballColor: "#dda7896e"
	};
	updateSetting();
}

/*=== 设置界面 ===*/
function createSetting(settings, opts) {
	let container = createEle("div", "setting");
	document.body.append(container);

	settings.forEach((setting, i) => {
		const itemEl = document.createElement('div');
		itemEl.className = 'setting-item';
		const label = document.createElement('label');
		label.textContent = setting.label;
		itemEl.appendChild(label);

		let ctrl;
		if (setting.type === 'input') {
			ctrl = document.createElement('input');
			ctrl.type = setting.inputType || 'text';
			ctrl.value = opts[setting.key] ?? setting.placeholder ?? '';
			ctrl.addEventListener('change', () => {
				let v = ctrl.value;
				if (setting.inputType === 'number') v = parseFloat(v);
				opts[setting.key] = v;
				updateSetting();
			});
		} else if (setting.type === 'switch') {
			ctrl = document.createElement('label');
			ctrl.className = 'switch';
			const input = document.createElement('input');
			input.type = 'checkbox';
			input.checked = Boolean(opts[setting.key]);
			const slider = document.createElement('span');
			slider.className = 'slider';
			ctrl.append(input, slider);
			input.addEventListener('change', () => {
				if (setting.key === "default") {
					reSetting();
					container.remove();
					createSetting(settings, options);
					return;
				}
				opts[setting.key] = input.checked;
				updateSetting();
			});
		}

		itemEl.appendChild(ctrl);
		container.appendChild(itemEl);
		if (i < settings.length - 1) container.appendChild(document.createElement("hr"));
	});

	// 关闭按钮动画修复
	let close = createEle("p", "setting-close");
	close.innerHTML = "◀";
	close.onclick = () => {
		container.classList.add("out");
		// setTimeout(() => {
		container.remove();
		document.getElementById("setting-icon").style.visibility = "visible";
		// }, 300);
	};
	container.append(close);
}

/*=== 设置项 ===*/
const settings = [{
		type: 'input',
		key: 'refreshTime',
		label: '刷新间隔',
		inputType: 'number',
		placeholder: 3600000
	},
	{
		type: 'input',
		key: 'bgColor',
		label: '背景色',
		inputType: 'text',
		placeholder: '#f7f3e9'
	},
	{
		type: 'input',
		key: 'boxBorderColor',
		label: '盒边框色',
		inputType: 'text',
		placeholder: '#d5c8b6'
	},
	{
		type: 'input',
		key: 'textOnhoverColor',
		label: '鼠标悬浮色',
		inputType: 'text',
		placeholder: '#7b5e2a'
	},
	{
		type: 'switch',
		key: 'enableBgAnimation',
		label: '启用背景动画'
	},
	{
		type: 'switch',
		key: 'runBgAnimation',
		label: '运行背景动画'
	},
	{
		type: 'input',
		key: 'ballColor',
		label: '背景小球色',
		inputType: 'text',
		placeholder: '#dda7896e'
	},
	{
		type: 'switch',
		key: 'default',
		label: '恢复默认设置'
	}
];

document.getElementById("setting-icon").onclick = () => {
	createSetting(settings, options);
	document.getElementById("setting-icon").style.visibility = "hidden";
};


let lastPTime = 0; // 上一次暂停时间
/*=== 动画主循环 ===*/
function update() {
	requestAnimationFrame(update);
	if (options.enableBgAnimation && options.runBgAnimation) updateBall();
	else if (options.enableBgAnimation && !options.runBgAnimation) drawBall();
	else if (!options.enableBgAnimation) ctx.clearRect(0, 0, canvas.width, canvas.height);

	// ✅ 只有未锁定时才自动刷新
	if (!document.getElementById("symbol").classList.contains("locked")) {
		if (Date.now() - lastRefreshTime > Math.max(2500, options.refreshTime)) {
			setPoetry();
			lastRefreshTime = Date.now();
		}
	}
}
update();