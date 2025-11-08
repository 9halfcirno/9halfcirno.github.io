

/*=== 初始变量 ===*/

// 获取主容器
const ele_poetry = document.getElementById("poetry");
const ele_content = document.getElementById("content");

let lastRefreshTime = 0;

// === 统一定义 options（修复作用域问题） ===
this.options = this.options || {
	refreshTime: 3600000,
	bgColor: "#f8f5ef",
	textOnhoverColor: "#7b5e2a",
	boxBorderColor: "#d5c8b6",
	enableBgAnimation: true,
	runBgAnimation: true,
	bgAnimationType: 0
};

this.animationType = ["Ball", "LightLine"];

function livelyPropertyListener(key, value) {
	if (!this.options) this.options = {};
	if (!this.animationType) this.animationType = ["Ball", "LightLine"];
	if (key === "refreshTime") {
		options[key] = parseInt(value) || 3600000; // 默认1h
	}
	options[key] = value;
	updateSetting();
}

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
		if (chipaiData.some(c => title.startsWith(c + "·") || title === c)) return "词";
	}
	return "诗";
}

function setPoetryType(type) {
	ele_poetry.className = type === "词" ? "chii" : "shi";
	document.querySelectorAll(".s").forEach(e => {
		e.classList.toggle("chi", type === "词");
	});
}

/*=== 刷新诗词函数 ===*/
function setPoetry() {
	jinrishici.load(r => {
		if (r.data.origin.content.length > 10 || r.data.origin.content.join("").length > 200) {
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
		setPoetryType(type)

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

		function lockTime() {
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
		}
		symbol.onclick = lockTime;
		lockTime() // 立即调用一次检测
		lockTime() // 立即调用二次检测(把locked状态去掉)
	});
}

// 刷新按钮
let refreshButton = document.getElementById("refresh");
let lastRefBtnTime = 0; // 上一次主动刷新时间
refreshButton.onclick = () => {
	if (Date.now() - lastRefBtnTime < 10000) return; // 禁止频繁刷新
	setPoetry();
	lastRefBtnTime = Date.now();
	lastRefreshTime = Date.now();
	refreshButton.classList.add("rotation");
	setTimeout(() => refreshButton.classList.remove("rotation"), 900);
};

function updateSetting() {
	let vars = document.documentElement.style;
	vars.setProperty("--box-border-color", options.boxBorderColor);
	vars.setProperty("--bg-color", options.bgColor);
	vars.setProperty("--poety-onhover-color", options.textOnhoverColor);
}

/*=== 背景动画 ===*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawGradientRect(ctx, color1, color2, x, y, width, height) {
	const gradient = ctx.createLinearGradient(x, y, x, y + height);
	gradient.addColorStop(0, color1);
	gradient.addColorStop(1, color2);
	ctx.fillStyle = gradient;
	ctx.fillRect(x, y, width, height);
}

/*=== 颜色相关函数 ===*/
/**
 * 生成随机高亮度色相，并返回其十六进制颜色及临近色
 * @returns {{baseColor: string, adjacentColor: string}} 包含基础颜色和临近色的对象
 */
function randomColors() {
	// 生成随机色相 (0-360度)
	const randomHue = Math.floor(Math.random() * 361);
	// 固定高饱和度和高亮度以确保颜色明亮
	const saturation = 80; // 80% 饱和度
	const lightness = 70; // 70% 亮度，大于0.7(70%)符合高亮度要求

	// 生成基础颜色
	const baseColor = hslToHex(randomHue, saturation, lightness);
	// 在色相环上偏移30度生成临近色
	const adjacentHue = (randomHue + 30) % 360;
	const adjacentColor = hslToHex(adjacentHue, saturation, lightness);

	return {
		baseColor: baseColor,
		adjacentColor: adjacentColor
	};
}

/**
 * 将HSL颜色值转换为十六进制格式
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 饱和度 (0-100)
 * @param {number} l - 亮度 (0-100)
 * @returns {string} 十六进制颜色码
 */
function hslToHex(h, s, l) {
	// 将饱和度s和亮度l从百分比转换为0-1的小数
	s /= 100;
	l /= 100;

	const c = (1 - Math.abs(2 * l - 1)) * s;
	const x = c * (1 - Math.abs((h / 60) % 2 - 1));
	const m = l - c / 2;

	let r, g, b;

	if (h >= 0 && h < 60) {
		[r, g, b] = [c, x, 0];
	} else if (h >= 60 && h < 120) {
		[r, g, b] = [x, c, 0];
	} else if (h >= 120 && h < 180) {
		[r, g, b] = [0, c, x];
	} else if (h >= 180 && h < 240) {
		[r, g, b] = [0, x, c];
	} else if (h >= 240 && h < 300) {
		[r, g, b] = [x, 0, c];
	} else {
		[r, g, b] = [c, 0, x];
	}

	// 将RGB值转换为十六进制
	const toHex = (color) => {
		const hex = Math.round((color + m) * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


/*=== 小球动画 ===*/
let balls = [];

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
		ctx.fillStyle = "#dda7896e";
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

/*=== 光束动画 ===*/
let lightLines = [];

function addLightLine() {
	let {
		baseColor,
		adjacentColor
	} = randomColors();
	let headColor = baseColor + "DD";
	let tailColor = adjacentColor + "00";
	let length = canvas.height * 0.25;
	let speed = 2.25;
	let x = Math.random() * canvas.width;
	let y = canvas.height + length;
	let line = {
		headColor,
		tailColor,
		length,
		speed,
		x,
		y
	};
	lightLines.push(line)
}

function drawLightLine() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	lightLines.forEach(l => {
		drawGradientRect(ctx, l.headColor, l.tailColor, l.x, l.y, Math.max(8, canvas.width * 0.01), Math.max(400, l.length))
	});
}

function updateLightLine() {
	lightLines.forEach((l, i) => {
		l.y -= l.speed;
		if (l.y < -Math.max(400, l.length)) {
			lightLines.splice(i, 1);
		}
	})
	drawLightLine();
	if (Math.random() < 0.012) {
		addLightLine();
	}
}

let lastPTime = 0; // 上一次暂停时间
/*=== 动画主循环 ===*/
function update() {
	requestAnimationFrame(update);
	//console.log(animationType[options.bgAnimationType])
	if (options.enableBgAnimation && options.runBgAnimation) this[`update${animationType[options.bgAnimationType] || "Ball"}`]();
	else if (options.enableBgAnimation && !options.runBgAnimation) this[`draw${animationType[options.bgAnimationType] || "Ball"}`]();
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
livelyPropertyListener("bgAnimationType", 1)