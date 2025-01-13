// Set your own Google Cloud Translate API key here.
// IMPORTANT: This is for demonstration only.
// In production, do NOT expose your API key on the client side.
const API_KEY = "YOUR_API_KEY_HERE";

// On page load, attach event listeners
window.onload = function() {
  const pasteBtn = document.getElementById("pasteBtn");
  const translateBtn = document.getElementById("translateBtn");

  pasteBtn.addEventListener("click", pasteFromClipboard);
  translateBtn.addEventListener("click", onTranslateClick);
};

// Attempt to read from the system clipboard and put into the text input
function pasteFromClipboard() {
  // Some older phones/browsers may not support navigator.clipboard
  if (navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText()
      .then(text => {
        document.getElementById("textInput").value = text;
      })
      .catch(err => {
        alert("Unable to paste automatically. Please paste manually.");
        console.error(err);
      });
  } else {
    alert("Clipboard not supported on this device/browser.");
  }
}

// Detect if text contains Hebrew characters
// Hebrew range roughly \u0590-\u05FF
function hasHebrewChars(text) {
  return /[\u0590-\u05FF]/.test(text);
}

// When "תרגם" is clicked, decide if the text is English or Hebrew, then call the translation API
function onTranslateClick() {
  const textInput = document.getElementById("textInput").value.trim();
  if (!textInput) {
    alert("Please enter or paste some text.");
    return;
  }

  // If it has Hebrew, treat it as Hebrew -> English, otherwise English -> Hebrew
  const sourceLang = hasHebrewChars(textInput) ? "he" : "en";
  const targetLang = (sourceLang === "he") ? "en" : "he";

  // Call Google Translate API
  translateText(textInput, sourceLang, targetLang)
    .then(translation => {
      document.getElementById("resultBox").innerText = translation;
    })
    .catch(err => {
      console.error("Translation error:", err);
      document.getElementById("resultBox").innerText = 
        "Error translating. Check console or API settings.";
    });
}

// Uses the Google Translate REST API
// For more info: https://cloud.google.com/translate/docs/reference/rest
async function translateText(text, fromLang, toLang) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;

  const requestBody = {
    q: text,
    source: fromLang,
    target: toLang,
    format: "text"
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  // Google returns something like:
  // data: { translations: [ { translatedText: "..." } ] }
  if (data.error) {
    throw new Error(data.error.message || "Unknown error from API");
  }

  const translatedText = data.data.translations[0].translatedText;
  return translatedText;
}
