// Add this at the top of your script
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

// ... your existing code ...

const debouncedPredict = debounce(predict, 500); // Adjust the delay (in milliseconds) as needed

// ... inside the fileInput 'change' listener, replace predict(img); with:


const fileInput = document.getElementById('fileInput');
const uploadPhoto = document.getElementById('uploadPhoto');
const imageBox = document.getElementById('imageBox');
const imageClass = document.getElementById('imageClass');
let model;

// Load the model when the script runs
async function initialize() {
    model = await loadModel();
}
initialize();

// Function to load the model (assuming you have this from before)
async function loadModel() {
    try {
        const loadedModel = await tf.loadGraphModel('models/model.json');
        console.log('Model loaded successfully');
        return loadedModel;
    } catch (error) {
        console.error('Error loading model:', error);
        return null;
    }
}

// Function to preprocess the image for the model
function preprocessImage(imageElement) {
    // Assuming your model expects images of size 224x224 and normalized pixel values
    const tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(tf.scalar(255.0))
        .expandDims(); // Add batch dimension
    return tensor;
}

// Function to make predictions with the model
async function predict(imageElement) {
    if (!model) {
        console.error('Model not loaded yet.');
        return;
    }

    const tensor = preprocessImage(imageElement);
    const predictions = await model.predict(tensor).data();
    console.log('Predictions:', predictions);

    // Process the predictions to get the class with the highest probability
    const maxPrediction = Math.max(...predictions);
    const predictedClassIndex = predictions.indexOf(maxPrediction);
    console.log('Predicted Class Index:', predictedClassIndex);

    // Map the predicted index to your actual class names
    const classNames = ['t-shirt', 'trouser', 'pullover', 'dress', 'coat', 'sandal', 'shirt', 'sneaker', 'bag', 'ankle-boot'];

    if (predictedClassIndex >= 0 && predictedClassIndex < classNames.length) {
        const predictedClassName = classNames[predictedClassIndex];
        console.log('Predicted Class:', predictedClassName);

        // Display the prediction image by changing the src of #imageClass
        imageClass.src = `img/classes/${predictedClassName}.png`;
        imageClass.alt = `Predicted: ${predictedClassName}`;
    } else {
        console.log('Error: Predicted class index out of bounds.');
        imageClass.src = ''; // Clear the image if there's an error
        imageClass.alt = '';
    }

    // Dispose of the tensor to free up memory
    tensor.dispose();
}

// Event listener for clicking the upload photo area
uploadPhoto.addEventListener('click', () => {
    fileInput.click(); // Trigger the file input
});

// Event listener for when a file is selected
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Clear any previous uploaded image and prediction
        imageBox.innerHTML = '';
        imageClass.src = '';
        imageClass.alt = '';

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Once the image is loaded, make the prediction
                debouncedPredict(img);

                // Display the uploaded image in the imageBox
                imageBox.appendChild(img);
                img.classList.add('object-cover', 'h-full', 'w-full');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});