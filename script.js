document.addEventListener('DOMContentLoaded', function () {
    const rectangle = document.getElementById('rectangle');
    const overlay = document.getElementById('overlay');

    rectangle.addEventListener('click', function () {
    rectangle.style.width = '80%';
    rectangle.style.height = '70%';
    overlay.style.display = 'flex';
    var img = document.getElementById('rectangle - image');
    img.style.display = 'block';// 确保图片显示
});

    const closeBtn = document.getElementById('close-btn');
    closeBtn.addEventListener('click', function () {
        overlay.style.display = 'none';
        rectangle.style.width = '150px';
        rectangle.style.height = '100px';
    });

    // 添加点击 overlay 外部关闭的功能
    window.addEventListener('click', function (event) {
        if (event.target === overlay && overlay.style.display === 'flex') {
            overlay.style.display = 'none';
            rectangle.style.width = '150px';
            rectangle.style.height = '100px';
        }
    });

    // 阻止 overlay 内部元素的点击事件冒泡到 window
    overlay.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    // 特别处理 close-btn，因为它应该关闭 overlay 但不应该阻止事件冒泡
    closeBtn.addEventListener('click', function (event) {
        event.stopPropagation(true); // 在这里其实不需要，因为上面已经阻止了 overlay 的冒泡
        // 但为了清晰，还是保留这行代码
        overlay.style.display = 'none';
        rectangle.style.width = '150px';
        rectangle.style.height = '100px';
    });
});
