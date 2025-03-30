let model;

async function loadModel() {
    model = await tf.loadGraphModel('models/model.json');
    console.log("Model loaded!");
}

$(document).ready(async function () {
    await loadModel();

    $('#uploadPhoto').click(function () {
        $('#fileInput').click();
    });

    $('#fileInput').on('change', async function (event) {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                $('#imageBox').html(`<img id="uploadedImage" src="${e.target.result}" class="h-full w-full object-contain">`);
                processImage(file);
            };
            reader.readAsDataURL(file);
        }
    });
});

async function processImage(file) {
    let img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async function () {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        // Resize image to match MobileNetV2 input size
        const modelSize = 224;
        canvas.width = modelSize;
        canvas.height = modelSize;

        ctx.drawImage(img, 0, 0, modelSize, modelSize);

        // Convert to TensorFlow tensor
        let imageData = ctx.getImageData(0, 0, modelSize, modelSize);
        let tensor = tf.browser.fromPixels(imageData)
            .toFloat()
            .div(255.0)
            .expandDims(0);

        let prediction = await model.predict(tensor).data();
        console.log("Prediction:", prediction);

        displayPrediction(prediction);
    };
}

function displayPrediction(prediction) {
    let classes = ["T-shirt/top", "Trouser", "Pullover", "Dress", "Coat", "Sandal", "Shirt", "Sneaker", "Bag", "Ankle boot"];
    let maxIndex = prediction.indexOf(Math.max(...prediction));

    $('#imageBox').append(`<p class="absolute bottom-5 left-5 text-white bg-black px-2 py-1">${classes[maxIndex]}</p>`);
}