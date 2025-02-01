var pageList = [];

function sendPageEvent(page, type) {
    const pageLoadEvent = new CustomEvent('loadPage', {
        detail: {
            page: page,
            type: type
        }
    });
    document.dispatchEvent(pageLoadEvent);
}

function getPages() {
    /*    fetch('https://9halfcirno.github.io/pages/pages.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法获取页面列表！');
                    setHTML('ERROR')
                }
                return response.json(); // 解析 JSON 响应
            })
            .then(data => {
                pageList = data.pages; // 将 pages 数组赋值给 pageList
                setHTML(pageList); // 更新页面内容
            })
            .catch(error => {
                setHTML(error); // 处理错误
            });*/
    pageList = [{
        "name": "home",
        "Introduction": "这里是9半分cirno的页面！\n默认就是这个页面啦……",
        "color": null,
        "icon": null,
        "load": {
            "html": "home",
            "styles": null,
            "javascript": null
        }
    }, {
        "name": "chat",
        "Introduction": "和琪露诺聊天的界面\n还没做好……",
        "color": null,
        "icon": null,
        "load": {
            "html": "chat",
            "styles": null,
            "javascript": null
        }
    }];
}

function setHTML(content) {
    // 将内容转换为字符串（如果是对象或数组，使用 JSON.stringify）
    const contentString = typeof content === 'object' ? JSON.stringify(content, null, 2) : content.toString();
    // 更新页面内容
    document.getElementById("pagejs").innerHTML = '<div>' + contentString + '</div>';
};

function test() {
    const url = new URL('https://9halfcirno.github.io');
    // 获取URL的查询参数对象
    const searchParams = new URLSearchParams(url.search);
    // 获取page参数的值
    let page = searchParams.get('page') || 'home';
    return page;
};

window.onload = function() {
    getPages();
    sendPageEvent('dysbot', 'html');
};