$(document).ready(function () {
    $('#uploadPhoto').click(function () {
        $('#fileInput').click();
    });

    $('#fileInput').on('change', function (event) {
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

function processImage(file) {
    let img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');

        // Set the desired dimensions (adjust based on your model's input size)
        let modelWidth = 28;
        let modelHeight = 28;

        canvas.width = modelWidth;
        canvas.height = modelHeight;

        // Resize the image
        ctx.drawImage(img, 0, 0, modelWidth, modelHeight);

        // Convert to tensor
        let imageData = ctx.getImageData(0, 0, modelWidth, modelHeight);
        let tensor = tf.browser.fromPixels(imageData).toFloat().div(255.0).expandDims(0);

        console.log(tensor);
        // Use tensor for TensorFlow model inference
    };
}
