// 為了使用 facemesh，您需要在 HTML 檔案中引入 ml5.js 函式庫，例如：
// <script src="https://unpkg.com/ml5@latest/dist/ml5.min.js"></script>

let capture;
let facemesh;
let predictions = []; // 儲存臉部偵測結果的陣列

// 根據要求，定義要連接的臉部關鍵點索引
// 新增：右眼外圈（眉毛）的關鍵點索引 (包含 247)
const rightEyebrowIndices = [ 70, 63, 105, 66, 107, 55, 65, 52, 53, 46, 247 ];

// 新增：右眼內圈（眼眶）的關鍵點索引 (包含 246)
const rightEyeOutlineIndices = [ 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246 ];

function setup() {
  // 建立一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);

  // 啟動攝影機擷取影像
  capture = createCapture(VIDEO, videoReady);
  // 隱藏原始的 HTML 影像元素，因為我們將在畫布上手動繪製它
  capture.hide();
}

function videoReady() {
  // 當攝影機準備好後，載入 facemesh 模型
  facemesh = ml5.facemesh(capture, modelReady);
}

function modelReady() {
  console.log("FaceMesh Model ready!");
  // 設定一個監聽器，當偵測到臉部時，會執行回呼函式
  facemesh.on("predict", results => {
    // 將偵測結果儲存到 predictions 陣列
    predictions = results;
  });
}

function draw() {
  // 設定畫布背景顏色
  background('#e7c6ff');

  // 計算影像要顯示的寬度和高度 (全螢幕的 50%)
  const videoWidth = width * 0.5;
  const videoHeight = height * 0.5;

  // 計算影像的 x 和 y 座標，使其置中
  const x = (width - videoWidth) / 2;
  const y = (height - videoHeight) / 2;

  // --- 影像左右顛倒的處理 ---
  // push() 和 pop() 用於儲存和恢復繪圖設定，確保變換效果只作用於這段程式碼區塊
  push();
  
  // 1. 將畫布的原點 (0,0) 移動到影像將要繪製的區域的右上角
  translate(x + videoWidth, y);
  
  // 2. 將 X 軸進行 -1 的縮放，這會讓所有後續的繪圖都左右翻轉
  scale(-1, 1);
  
  // 3. 在新的原點 (現在是右上角) 繪製影像。由於 X 軸是翻轉的，
  //    影像會從右向左繪製，產生鏡像效果。
  image(capture, 0, 0, videoWidth, videoHeight);

  // 4. 在翻轉後的影像上繪製臉部輪廓
  drawFaceKeypoints(videoWidth, videoHeight);
  
  // 恢復到原始的繪圖設定
  pop();
}

function drawFaceKeypoints(vWidth, vHeight) {
  // 遍歷所有偵測到的臉部 (通常只有一個)
  for (let i = 0; i < predictions.length; i++) {
    const keypoints = predictions[i].scaledMesh;

    // 計算縮放比例，因為我們繪製的影像大小(vWidth, vHeight)與攝影機原始大小(capture.width, capture.height)不同
    const scaleX = vWidth / capture.width;
    const scaleY = vHeight / capture.height;

    // 設定線條樣式
    strokeWeight(2); // 讓線條粗一點比較清楚
    noFill(); // 我們只畫線，不填滿

    // 繪製右眼外圈 (眉毛) - 綠色
    stroke(0, 255, 0);
    beginShape();
    for (let j = 0; j < rightEyebrowIndices.length; j++) {
      const index = rightEyebrowIndices[j];
      const [px, py] = keypoints[index];
      vertex(px * scaleX, py * scaleY);
    }
    endShape(); // 眉毛不用閉合

    // 繪製右眼內圈 (眼眶) - 藍色
    stroke(0, 0, 255);
    beginShape();
    for (let j = 0; j < rightEyeOutlineIndices.length; j++) {
      const index = rightEyeOutlineIndices[j];
      const [px, py] = keypoints[index];
      vertex(px * scaleX, py * scaleY);
    }
    endShape(CLOSE); // 眼眶要閉合
  }
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
