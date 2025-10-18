function createEle(ele, id, cN) {
	let e = document.createElement(ele);
	if (id) e.id = id;
	if (cN) e.className = cN;
	return e
}

function classifyPoetry(title, lines) {
	// 常见词牌名
	const ciPai = ['如梦令', '浣溪沙', '菩萨蛮', '水调歌头', '念奴娇', '沁园春', '蝶恋花', '满江红', '临江仙', '鹧鸪天', '虞美人', '清平乐', '西江月', '浪淘沙', '卜算子', '江城子', '点绛唇', '踏莎行'];
	if (title.slice(0, 6).includes("·")) return "词";
	// 清理行数组，只保留非空行
	const validLines = lines.filter(line => line.trim().length > 0);

	if (validLines.length === 0) return '无法判断';

	// 计算每行的中文字符数
	const lineLengths = validLines.map(line => {
		const chineseChars = line.match(/[\u4e00-\u9fa5]/g) || [];
		return chineseChars.length;
	});

	// 计算长度方差
	const avgLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length;
	const variance = lineLengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / lineLengths.length;

	let shiScore = 0;
	let ciScore = 0;

	// 1. 词牌名检测
	const hasCiPai = ciPai.some(ci => lines[0].includes(ci));
	if (hasCiPai) ciScore += 3;

	// 2. 句子长度整齐度判断
	if (variance < 2) {
		shiScore += 3; // 长度很整齐，很可能是诗
	} else if (variance > 10) {
		ciScore += 3; // 长度变化很大，很可能是词
	}

	// 3. 行数特征
	if (validLines.length === 4 || validLines.length === 8) {
		shiScore += 2; // 绝句或律诗
	} else if (validLines.length > 8) {
		ciScore += 1; // 词通常较长
	}

	// 4. 每行字数特征
	const allSameLength = lineLengths.every(len => len === lineLengths[0]);
	if (allSameLength && (lineLengths[0] === 5 || lineLengths[0] === 7)) {
		shiScore += 2; // 典型的五言或七言
	}

	// 5. 检测分段（词的特征）
	const hasSegmentation = validLines.some(line => line.trim() === '' || line.includes('·'));
	if (hasSegmentation) ciScore += 2;

	// 6. 检测长短句（词的特征）
	const hasMixedLengths = Math.max(...lineLengths) - Math.min(...lineLengths) > 10;
	if (hasMixedLengths) ciScore += 2;

	console.log(`诗得分: ${shiScore}, 词得分: ${ciScore}`);

	// 判断结果
	if (shiScore > ciScore) {
		return '诗';
	} else if (ciScore > shiScore) {
		return '词';
	} else {
		return '无法确定（可能是现代诗或其他）';
	}
}

function setPoetry() {
	jinrishici.load(r => {
		console.log("已获取古诗: ", r);
		let title = r.data.origin.title || "无题";
		let content = r.data.origin.content;
		if (content.length > 8 || content.join("").length > 128) {
			setPoetry();
			return;
		}
		let dynasty = r.data.origin.dynasty || "未知";
		let name = r.data.origin.author || "佚名";
		let html = `<strong id="title">${title}</strong>
		<p><span id="dynasty">[${dynasty}]</span> <span id="author">${name}</span></p>
		<div id="content">`;
		for (let s of content) {
			html += `<p class="s">${s}</p>`;
		}
		html += "</div>";
		ele_poetry.innerHTML = html;
		if (classifyPoetry(title, content) === "词") {
			ele_poetry.className = "chii";
			document.querySelectorAll(".s").forEach(e => {
				e.classList.add("chi")
			})
		} else {
			ele_poetry.className = "shi";
			document.querySelectorAll(".s").forEach(e => {
				e.classList.remove("chi")
			})
		}
		/*// 重新触发 CSS 动画
这		ele_poetry.classList.remove('fadeInTrigger'); // 清除旧动画类
是		void ele_poetry.offsetWidth; // 强制浏览器重绘
没		ele_poetry.classList.add('fadeInTrigger'); // 重新添加动画类
用*/	})
}

// 获取主容器
const ele_poetry = document.getElementById("poetry");
const ele_content = document.getElementById("content");

setPoetry();
setInterval(setPoetry, 600000) // 10min刷新

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let balls = [];

// 设置canvas尺寸为窗口大小
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function addBall(r, x, y) {
	// 为每个小球添加随机速度
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

function removeBall(idx) {
	balls.splice(idx, 1);
}

function drawBall() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	balls.forEach(ball => {
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
		ctx.fillStyle = '#DDA7896E';
		ctx.fill();
		ctx.closePath();
	});
}

function updateBall() {
	for (let i = balls.length - 1; i >= 0; i--) {
		const ball = balls[i];

		// 更新位置
		ball.x += ball.vx;
		ball.y += ball.vy;

		// 边界检测 - 水平反弹
		if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) {
			ball.vx = -ball.vx;
		}

		// 如果小球完全移出画布顶部，删除它
		if (ball.y + ball.r < 0) {
			removeBall(i);
		}
	}

	drawBall();
	if (Math.random() < 0.01) {
		const r = (0.02 + 0.06 * Math.random()) * window.innerHeight; // 半径 10-30
		const x = Math.random() * (canvas.width - r * 2) + r;
		const y = canvas.height + r; // 从底部开始
		addBall(r, x, y);
	}
	requestAnimationFrame(updateBall);
}

// 启动动画
updateBall();