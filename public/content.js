// Check if overlay already exists
if (document.getElementById("custom-overlay")) {
    return;
}

// Create overlay div
const overlay = document.createElement("div");
overlay.id = "custom-overlay";
overlay.style.position = "fixed";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100vw";
overlay.style.height = "100vh";
overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
overlay.style.display = "flex";
overlay.style.justifyContent = "center";
overlay.style.alignItems = "center";
overlay.style.zIndex = "9999";

// Create modal container
const modal = document.createElement("div");
modal.style.background = "white";
modal.style.padding = "20px";
modal.style.borderRadius = "10px";
modal.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.3)";
modal.style.width = "300px";
modal.style.textAlign = "center";
modal.innerHTML = "<h2>Overlay</h2><p>This is an injected overlay.</p>";

// Append elements
overlay.appendChild(modal);
document.body.appendChild(overlay);

// Close overlay when clicking outside
overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
        overlay.remove();
    }
});
