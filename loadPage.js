window.onload = function() {
    async function getPage(url, iframe = false) {
        let content = document.getElementById("content");
        content.innerHTML = '<h1>LOADING……</h1>';
        url = url || "https://9halfcirno.github.io/pages/chat.html";
        try {
            let response = await fetch(url);
            if (response) {
                let html = await response.text();
                content.innerHTML = html;
            } else {
                console.log(`fail to get page : ${url}`);
                setTimeout(() => getPage(url), 500);
                content.innerHTML = '<h1>FAIL:try again after 5s……</h1>';
            }
        } catch (e) {
            console.log(`Error to get html in ${url} :`, e);
            content.innerHTML = '<h1>ERROR</h1>';
        }
    }
    getPage("pages/chat.html", false);
};



/*window.onload = function() {
    async function getPage(url, iframe = false) {
        url = url || "https://9halfcirno.github.io/pages/chat.html";
        fetch(url).then(html => {
            if (html) {
                html = html.text;
                let content = document.getElementById("content");
                content.innerHTML = '${html}';
            } else {
                console.log(`fail to get page : ${url}`)
                setTimeout(() => getPage(url), 500)
            }
        }).catch(e =>
            console.log(`Error to get html in ${url} :`, e)
        )
    };
    
    getPage("https://9halfcirno/pages/chat.html",false)
}

//fetch("https://9halfcirno.githib.io/pages/chat.html ").then