const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");

// درخواست دسترسی به دوربین پس از کلیک روی دکمه
startButton.addEventListener("click", () => {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.play(); // پخش ویدیو پس از دسترسی به دوربین
      startButton.style.display = "none"; // مخفی کردن دکمه بعد از دریافت دسترسی
    })
    .catch(err => {
      console.error("خطا در دریافت ویدیو:", err);
      alert("دسترسی به دوربین رد شد.");
    });
});

async function detectHumans() {
  const model = await cocoSsd.load();
  setInterval(async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const predictions = await model.detect(video);

    let foundHuman = false;
    predictions.forEach(prediction => {
      if (prediction.class === "person") {
        foundHuman = true;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(...prediction.bbox);
        ctx.fillStyle = "red";
        ctx.fillText("انسان", prediction.bbox[0], prediction.bbox[1] - 10);
      }
    });

    if (foundHuman) {
      sendImageToServer();
    }
  }, 1000);
}

function sendImageToServer() {
  const imageData = canvas.toDataURL("image/png");
  fetch("save_image.php", {
    method: "POST",
    body: JSON.stringify({ image: imageData }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(response => response.text())
  .then(data => console.log("نتیجه:", data))
  .catch(error => console.error("خطا در ارسال تصویر:", error));
}

video.addEventListener("loadeddata", detectHumans);