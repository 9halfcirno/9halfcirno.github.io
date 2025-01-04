//   window.onload = setRandomProperties;
document.addEventListener('DOMContentLoaded', function() {
    const textboxes = document.querySelectorAll('.textbox');
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight + (textboxes.length * 0.2); //* textboxes.length * 0.2;
    const maxWidth = 175;
    const maxHeight = 175;
    //     github-link.style.top = screenHeight + `px`;
    setInterval(moveDivs, 9);
//    setInterval(check, 9);

    function setRandomProperties() {
        const bodyWidth = document.body.clientWidth;
        const bodyHeight = document.body.clientHeight;
        const minWidth = 78; // 最小宽度，可根据需求修改
        const maxWidth = 160; // 最大宽度，可根据需求修改
        const minHeight = 85; // 最小高度，可根据需求修改
        const maxHeight = 160; // 最大高度，可根据需求修改
        textboxes.forEach((textbox) => {
   //         const oldLeft = 0;
            const randomLeft = Math.random() * (maxWidth - minWidth) + minWidth;
            const randomTop = Math.random() * screenHeight + 24;
            const randomWidth = Math.random() * (maxWidth - minWidth) + minWidth;
            const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;
            textbox.style.position = 'absolute';
            textbox.style.left = `${randomLeft}px`;
            textbox.style.top = `${randomTop}px`;
            textbox.style.width = `${randomWidth}px`;
            textbox.style.height = `${randomHeight}px`;
            textbox.speedX = Math.random() * 2 - 1; // 水平方向速度，在 -1到1之间随机
            //  textbox.speedY = Math.random() * 1 - 1; // 垂直方向速度，在 -1到1之间随机
            /*         textbox.addEventListener('click', function() {
                         textbox.o.speedX = textbox.speedX;
                         textbox.speedX = 0;
                     });*/








        });
    };
    setRandomProperties();

    function moveDivs() {
        textboxes.forEach((textbox) => {
            const newLeft = parseFloat(textbox.style.left) + textbox.speedX;
            const newTop = parseFloat(textbox.style.top) + textbox.speedY;
            const bodyWidth = document.body.clientWidth;
            const bodyHeight = document.body.clientHeight;
            if (newLeft < 0 || newLeft > bodyWidth - textbox.offsetWidth) {
                textbox.speedX = -textbox.speedX;
                newLeft = 0; //bodyWidth - textbox.offsetWidth;
            }
            if (newTop < 0 || newTop > bodyHeight - textbox.offsetHeight) {
                textbox.speedY = -textbox.speedY;
            }
            textbox.style.left = `${newLeft}px`;
            textbox.style.top = `${newTop}px`;
    //        check();
        });
    };

/*    function check() {
        textboxes.forEach((textbox) => {
            if (oldLeft - parseFloat(textbox.style.left) << -textbox.speedX) {
                textbox.style.left = `0px`;
            };
            else {
                oldLeft = parseFloat(textbox.style.left);
            };
        });

    };*/
})
/*
textbox.addEventListener('click', function () {
           // 这里是点击事件发生时要执行的操作
       });


textboxes.forEach((textbox) => {
       textbox.addEventListener('click', function () {
           const originalSpeedX = textbox.speedX;
           const originalSpeedY = textbox.speedY;
           const originalLeft = textbox.style.left;
           const originalTop = textbox.style.top;
           const originalWidth = textbox.offsetWidth;
           const originalHeight = textbox.offsetHeight;
           const div = this;
           div.speedX = 0;
           div.speedY = 0;
           const centerX = (document.body.clientWidth)/2;
           const centerY = (document.body.clientHeight)/2;
           // 移动到中间的动画函数
           function moveToCenter(currentX, currentY, steps = 0) {
               if (steps > 30) {
                   return;
               }
               const newX = currentX+(centerX - parseFloat(div.style.left))/10;
               const newY = currentY+(centerY - parseFloat(div.style.top))/10;
               div.style.left = `${newX}px`;
               div.style.top = `${newY}px`;
               requestAnimationFrame(() => {
                   moveToCenter(newX, newY, steps + 1);
               });
           }
           moveToCenter(parseFloat(div.style.left), parseFloat(div.style.top));
           // 放大到填充大半个屏幕的动画函数
           function enlargeDiv(currentWidth, currentHeight, steps = 0) {
               if (steps > 30) {
                   return;
               }
               const newWidth = currentWidth+(document.body.clientWidth * 0.6 - originalWidth)/10;
               const newHeight = currentHeight+(document.body.clientHeight * 0.6 - originalHeight)/10;
               div.style.width = `${newWidth}px`;
               div.style.height = `${newHeight}px`;
               div.style.left = centerX - newWidth/2 + 'px';
               div.style.top = centerY - newHeight/2 + 'px';
               requestAnimationFrame(() => {
                   enlargeDiv(newWidth, newHeight, steps + 1);
               });
           }
           enlargeDiv(originalWidth, originalHeight);
           // 添加事件监听器，当在其他地方点击时恢复原始状态
           document.addEventListener('click', function otherClickHandler(event) {
               if (event.target!== div) {
                   div.speedX = originalSpeedX;
                   div.speedY = originalSpeedY;
                   const moveBack = function () {
                       if (parseFloat(div.style.left)> originalLeft - 1 && parseFloat(div.style.left)< originalLeft + 1 &&
                          parseFloat(div.style.top)> originalTop - 1 && parseFloat(div.style.top)< originalTop + 1 &&
                          parseFloat(div.style.width)> originalWidth - 1 && parseFloat(div.style.width)< originalWidth + 1 &&
                          parseFloat(div.style.height)> originalHeight - 1 && parseFloat(div.style.height)< originalHeight + 1) {
                           return;
                       }
                       const newX = parseFloat(div.style.left)-(parseFloat(div.style.left) - parseFloat(originalLeft))/10;
                       const newY = parseFloat(div.style.top)-(parseFloat(div.style.top) - parseFloat(originalTop))/10;
                       const newWidth = parseFloat(div.style.width)-(parseFloat(div.style.width) - parseFloat(originalWidth))/10;
                       const newHeight = parseFloat(div.style.height)-(parseFloat(div.style.height) - parseFloat(originalHeight))/10;
                       div.style.left = `${newX}px`;
                       div.style.top = `${newY}px`;
                       div.style.width = `${newWidth}px`;
                       div.style.height = `${newHeight}px`;
                       requestAnimationFrame(moveBack);
                   };
                   moveBack();
                   document.removeEventListener('click', otherClickHandler);
               }
           });
       });
   });







   /*document.addEventListener('DOMContentLoaded', function() {
       const allTextbox = document.querySelectorAll('.textbox');
       const screenWidth = window.innerWidth;
       const screenHeight = window.innerHeight * allTextbox.length * 0.4;
       const maxWidth = 175;
       const maxHeight = 175;


       // 定义mimdis和mindis，如果它们有实际意义的话，可以修改为合适的值
       const mindis = 10;

       //检测坐标
       function isPositionValid(x, y, existingDivs) {
           for (let i = 0; i < existingDivs.length; i++) {
               const div = existingDivs[i];
               const divX = parseInt(div.style.left);
               const divY = parseInt(div.style.top);
               const distX = Math.abs(x - divX);
               const distY = Math.abs(y - divY);
               if (distX < mindis || distY < mindis) {
                   return false;
               }
           }
           return true;
       }

       allTextbox.forEach((textbox) => {
           let posOK = false;
           while (!posOK) {
               let boxX = -9;
               let boxY = -9;
               let boxX = Math.floor(Math.random() * (screenWidth - maxWidth));
               let boxY = Math.floor(Math.random() * (screenHeight - maxHeight));
               if (isPositionValid(boxX, boxY, allTextbox)) {
                   posOK = true;
               }
           };
           let divWidth = Math.floor(Math.random() * (maxWidth - 60) + 50);
           let divHeight = Math.floor(Math.random() * (maxHeight - 60) + 50);
           if (divWidth / 2 + boxX > screenWidth) {
               divWidth = (screenWidth - boxX) * 2 - 40;
           }
           div.style.width = divWidth + 'px';
           div.style.height = divHeight + 'px';
           div.style.position = 'absolute';
           div.style.left = boxX + 'px';
           div.style.top = boxY + 'px';
       });
   });




   /*
   window.onload = function() {
       const num = 10;
       const screenWidth = window.innerWidth;
       const screenHeight = window.innerHeight * num *0.4;
       const num2 = 60 / num;
       const maxWidth = 175;
       const maxHeight = 175;
       const divs = [];

       function isPositionValid(x, y, existingDivs) {
           for (let i = 0; i < existingDivs.length; i++) {
               const div = existingDivs[i];
               const divX = parseInt(div.style.left);
               const divY = parseInt(div.style.top);
               const distX = Math.abs(x - divX);
               const distY = Math.abs(y - divY);
               if (distX < num2 || distY < num2) {
                   return false;
               }
           }
           return true;
       }

       for (let i = 0; i < num; i++) {
           // 先确定位置
           let divX = -1;
           let divY = -1;
           let validPosition = false;
           while (!validPosition) {
               divX = Math.floor(Math.random() * (screenWidth - maxWidth));
               divY = Math.floor(Math.random() * (screenHeight - maxHeight));
               if (isPositionValid(divX, divY, divs)) {
                   validPosition = true;
               }
           }

           // 再确定大小
           let divWidth = Math.floor(Math.random() * (maxWidth - 60) + 50);
           let divHeight = Math.floor(Math.random() * (maxHeight - 60) + 50);
           if (divWidth / 2 + divX > screenWidth) {
               let divWidth = (screenWidth - divX) * 2 - 40;
           };

           // 创建div元素
           const div = document.createElement('div');
           div.className = 'div-item';
           div.textContent = `Div ${i + 1}`;
           div.style.width = divWidth + 'px';
           div.style.height = divHeight + 'px';
           div.style.position = 'absolute';
           div.style.left = divX + 'px';
           div.style.top = divY + 'px';

           divs.push(div);
           document.body.appendChild(div);
       }
   };
   /*
   window.onload = function () {
       const screenWidth = window.innerWidth;
       const screenHeight = window.innerHeight;
       const maxWidth = 200;
       const maxHeight = 200;
       const num2 = 20;

       // 获取所有class为div - item的元素
       const divElements = Array.from(document.querySelectorAll('.div - item'));

       function isPositionValid(x, y, existingDivs) {
           for (let i = 0; i < existingDivs.length; i++) {
               const div = existingDivs[i];
               const divX = parseInt(div.style.left);
               const divY = parseInt(div.style.top);
               const distX = Math.abs(x - divX);
               const distY = Math.abs(y - divY);
               if (distX < num2 || distY < num2) {
                   return false;
               }
           }
           return true;
       }

       divElements.forEach((div) => {
           // 重新计算位置
           let divX = parseInt(div.style.left);
           let divY = parseInt(div.style.top);
           let validPosition = false;
           while (!validPosition) {
               divX = Math.floor(Math.random() * (screenWidth - maxWidth));
               divY = Math.floor(Math.random() * (screenHeight - maxHeight));
               if (isPositionValid(divX, divY, divElements)) {
                   validPosition = true;
               }
           }
           div.style.left = divX + 'px';
           div.style.top = divY + 'px';

           // 重新计算大小
           let divWidth = Math.floor(Math.random() * maxWidth);
           let divHeight = Math.floor(Math.random() * maxHeight);
           div.style.width = divWidth + 'px';
           div.style.height = divHeight + 'px';

           // 确保最右端在屏幕内
           if (divX + divWidth > screenWidth) {
               divWidth = screenWidth - divX;
               div.style.width = divWidth + 'px';
           }
       });
   };
   */