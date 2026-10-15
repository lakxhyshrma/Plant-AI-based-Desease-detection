// ====================================
// PLANTCARE AI - MAIN JAVASCRIPT
// ====================================

const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const pageHeading = document.getElementById("page-heading");


// ====================================
// 1. CONNECT ALL WEBSITE PAGES
// ====================================

const pageNames = {
    home: "Home",
    detect: "Detect Disease",
    results: "Results",
    treatment: "Treatment Guide",
    tips: "Plant Care Tips",
    history: "History",
    about: "About Project"
};


function showPage(pageId) {

    const targetPage = document.getElementById(pageId);

    if (!targetPage) {
        return;
    }

    // Hide all pages
    pages.forEach(function (page) {
        page.classList.remove("active");
    });

    // Show selected page
    targetPage.classList.add("active");

    // Update active navigation button
    navButtons.forEach(function (button) {

        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );

    });

    // Update heading
    pageHeading.textContent = pageNames[pageId] || "PlantCare AI";

    // Update relevant content
    if (pageId === "history") {
        renderHistory();
    }

    if (pageId === "results") {
        renderResults();
    }

    // Scroll to the top
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// Sidebar navigation
navButtons.forEach(function (button) {

    button.addEventListener("click", function () {
        showPage(button.dataset.page);
    });

});


// Connect all buttons containing data-go
document.querySelectorAll("[data-go]").forEach(function (button) {

    button.addEventListener("click", function () {
        showPage(button.dataset.go);
    });

});


// ====================================
// 2. IMAGE UPLOAD AND PREVIEW
// ====================================

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const fileName = document.getElementById("fileName");
const removeImageButton = document.getElementById("removeImage");
const analysisMessage = document.getElementById("analysisMessage");
const analyzeButton = document.getElementById("analyzeBtn");

let selectedImage = null;
let imageObjectURL = null;


// Release old preview URL
function releaseImageURL() {

    if (imageObjectURL) {
        URL.revokeObjectURL(imageObjectURL);
        imageObjectURL = null;
    }

}


// Handle image selection
imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    analysisMessage.textContent = "";

    if (!file) {
        return;
    }

    // Only accept image files
    if (!file.type.startsWith("image/")) {

        analysisMessage.textContent =
            "Please select a valid image file.";

        imageInput.value = "";
        return;

    }

    // Limit image size to 10 MB
    if (file.size > 10 * 1024 * 1024) {

        analysisMessage.textContent =
            "Image is too large. Please select an image under 10 MB.";

        imageInput.value = "";
        return;

    }

    releaseImageURL();

    selectedImage = file;

    imageObjectURL = URL.createObjectURL(file);

    imagePreview.src = imageObjectURL;
    imagePreview.style.display = "block";

    fileName.textContent = "Selected: " + file.name;

    removeImageButton.hidden = false;

    analysisMessage.textContent =
        "Image uploaded successfully. You can now start the demo analysis.";

});


// ====================================
// 3. REMOVE SELECTED IMAGE
// ====================================

function removeSelectedImage() {

    releaseImageURL();

    selectedImage = null;

    imageInput.value = "";

    imagePreview.removeAttribute("src");
    imagePreview.style.display = "none";

    fileName.textContent = "";

    removeImageButton.hidden = true;

    analysisMessage.textContent =
        "Image removed. Choose another plant leaf image.";

}


removeImageButton.addEventListener(
    "click",
    removeSelectedImage
);


// ====================================
// 4. SAVE AND READ HISTORY
// ====================================

function getHistory() {

    try {

        const savedHistory = localStorage.getItem(
            "plantCareHistory"
        );

        const history = savedHistory
            ? JSON.parse(savedHistory)
            : [];

        return Array.isArray(history) ? history : [];

    } catch (error) {

        return [];

    }

}


function saveHistory(entry) {

    const history = getHistory();

    history.unshift(entry);

    // Keep the latest 30 records
    const limitedHistory = history.slice(0, 30);

    try {

        localStorage.setItem(
            "plantCareHistory",
            JSON.stringify(limitedHistory)
        );

        return true;

    } catch (error) {

        console.error("Could not save history:", error);

        return false;

    }

}


// ====================================
// 5. ANALYZE PLANT
// ====================================

const plantType = document.getElementById("plantType");

let latestResult = null;


analyzeButton.addEventListener("click", function () {

    if (!selectedImage) {

        analysisMessage.textContent =
            "Please upload a plant leaf image first.";

        return;

    }


    if (!plantType.value) {

        analysisMessage.textContent =
            "Please select your plant type first.";

        return;

    }


    // IMPORTANT:
    // No trained AI model is connected in this version.
    // Do not invent a disease prediction.

    latestResult = {

        plant: plantType.value,

        imageName: selectedImage.name,

        date: new Date().toLocaleString(),

        status: "AI model not connected",

        message:
            "The image was uploaded successfully, but a trained AI model is required to identify plant diseases."

    };


    const saved = saveHistory(latestResult);


    if (saved) {

        analysisMessage.textContent =
            "Image processed by the demo interface. No disease prediction was made. Your activity has been saved.";

    } else {

        analysisMessage.textContent =
            "The image was received by the demo interface, but history could not be saved in this browser.";

    }


    renderResults();

});


// ====================================
// 6. DISPLAY RESULTS
// ====================================

const resultDetails = document.getElementById("resultDetails");


function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


function renderResults() {

    if (!latestResult) {

        const history = getHistory();

        if (history.length > 0) {
            latestResult = history[0];
        }

    }


    if (!latestResult) {

        resultDetails.innerHTML = `
            <div class="empty-icon">🔬</div>

            <h3>No Analysis Yet</h3>

            <p>
                Upload a leaf image to begin.
                Actual disease prediction requires a trained AI model.
            </p>

            <button class="primary-btn" data-go="detect">
                Upload Image
            </button>
        `;

        // Connect the button created above
        resultDetails.querySelector("[data-go]").addEventListener(
            "click",
            function () {
                showPage("detect");
            }
        );

        return;

    }


    resultDetails.innerHTML = `

        <div class="empty-icon">🌿</div>

        <span class="result-status">
            Demo Status: No AI Prediction
        </span>

        <h3>Analysis Activity Recorded</h3>

        <p>
            <strong>Plant:</strong>
            ${escapeHTML(latestResult.plant)}
        </p>

        <p>
            <strong>Image:</strong>
            ${escapeHTML(latestResult.imageName)}
        </p>

        <p>
            <strong>Date:</strong>
            ${escapeHTML(latestResult.date)}
        </p>

        <p>
            ${escapeHTML(latestResult.message)}
        </p>

        <button class="primary-btn" data-go="detect">
            Analyze Another Image
        </button>

    `;


    resultDetails.querySelector("[data-go]").addEventListener(
        "click",
        function () {
            showPage("detect");
        }
    );

}


// ====================================
// 7. DISPLAY HISTORY
// ====================================

const historyList = document.getElementById("historyList");


function renderHistory() {

    const history = getHistory();


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="history-empty">
                <h3>📜 No History Available</h3>

                <p>
                    Your analysis activities will appear here
                    after you use the Detect Disease feature.
                </p>
            </div>
        `;

        return;

    }


    historyList.innerHTML = history.map(function (item) {

        return `

            <div class="history-item">

                <div>

                    <h3>
                        🌿 ${escapeHTML(item.plant)}
                    </h3>

                    <p>
                        Image: ${escapeHTML(item.imageName)}
                    </p>

                    <p>
                        Date: ${escapeHTML(item.date)}
                    </p>

                    <p>
                        Status: ${escapeHTML(item.status)}
                    </p>

                </div>

                <span class="history-status">
                    No AI Prediction
                </span>

            </div>

        `;

    }).join("");

}


// ====================================
// 8. CLEAR HISTORY
// ====================================

const clearHistoryButton = document.getElementById("clearHistory");


clearHistoryButton.addEventListener("click", function () {

    const history = getHistory();

    if (history.length === 0) {

        alert("Your history is already empty.");

        return;

    }


    const confirmed = confirm(
        "Are you sure you want to clear all saved history?"
    );


    if (confirmed) {

        localStorage.removeItem("plantCareHistory");

        latestResult = null;

        renderHistory();
        renderResults();

        alert("History cleared successfully.");

    }

});


// ====================================
// 9. SEARCH TREATMENT GUIDE
// ====================================

const treatmentSearch = document.getElementById("treatmentSearch");

const treatmentCards = document.querySelectorAll(".treatment-card");

const treatmentGrid = document.getElementById("treatmentGrid");


treatmentSearch.addEventListener("input", function () {

    const searchTerm = treatmentSearch.value
        .toLowerCase()
        .trim();

    let visibleCards = 0;


    treatmentCards.forEach(function (card) {

        const searchableText = (
            card.innerText + " " + card.dataset.search
        ).toLowerCase();

        const matches = searchableText.includes(searchTerm);

        card.style.display = matches ? "" : "none";

        if (matches) {
            visibleCards++;
        }

    });


    const existingMessage = treatmentGrid.querySelector(".no-matches");

    if (existingMessage) {
        existingMessage.remove();
    }


    if (visibleCards === 0) {

        const message = document.createElement("p");

        message.className = "no-matches";

        message.textContent =
            "No matching treatment information found.";

        treatmentGrid.appendChild(message);

    }

});


// ====================================
// 10. INITIALIZE WEBSITE
// ====================================

renderHistory();

renderResults();

showPage("home");