console.log("js running");
window.onload = function() {
    async function getPage(page = "home", type = "html") {
let target = document.getElementById("pageindex");
        //获取文件
        let file = function() {
            switch (type) {
                case "html":
                    target = document.getElementById("pageindex");
                    return "index.html";
                    break;
                case "css":
                    target = document.getElementById("pagestyles");
                    return "styles.css";
                    break;
                case "js":
                    target = document.getElementById("pagejs");
                    return "script.js";
                    break;
                default:
                    target = document.getElementById("pageindex");
                    return "index.html";
                    break;
            }
        };
        target.innerHTML = '<h3>LOADING……</h3>';
        let url = "https://9halfcirno.github.io/pages/" + page + "/" + file;
        try {
            let response = await fetch(url);
            if (response) {
                let html = await response.text();
                target.innerHTML = html;
            } else {
                console.log(`fail to get page : ${url}`);
                setTimeout(() => getPage(page,type), 500);
                target.innerHTML = '<h1>FAIL:try again after 5s……</h1>';
            }
        } catch (e) {
            console.log(`Error to get html in ${url} :`, e);
            target.innerHTML = '<h1>ERROR</h1>';
        }
    };
    getPage("chat", "html");
};