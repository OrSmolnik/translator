// On page load, attach event listeners
window.onload = function() {
  const pasteBtn = document.getElementById("pasteBtn");
  const translateBtn = document.getElementById("translateBtn");

  pasteBtn.addEventListener("click", pasteFromClipboard);
  translateBtn.addEventListener("click", onTranslateClick);
};

// Attempt to read from the system clipboard and put it into the text input
function pasteFromClipboard() {
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

// Quick check: if the text has Hebrew characters
function hasHebrewChars(text) {
  return /[\u0590-\u05FF]/.test(text);
}

// When "תרגם" is clicked, decide if the text is English or Hebrew, then translate
async function onTranslateClick() {
  const textInput = document.getElementById("textInput").value.trim();
  if (!textInput) {
    alert("Please enter or paste some text.");
    return;
  }

  // If there's Hebrew, treat it as Hebrew -> English; else English -> Hebrew
  const targetLang = hasHebrewChars(textInput) ? "en" : "he";
  
  // Call LibreTranslate API
  try {
    const translatedText = await translateText(textInput, targetLang);
    document.getElementById("resultBox").innerText = translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    document.getElementById("resultBox").innerText = 
      "Error translating. Check console or API settings.";
  }
}

// Actual call to LibreTranslate
async function translateText(text, target) {
  const url = "https://libretranslate.com/translate";
  const bodyData = {
    q: text,
    source: "auto",   // Let the API detect automatically
    target: target,   // either "he" or "en"
    format: "text",
    alternatives: 3,
    api_key: ""       // no API key needed for the public instance, but keep an eye on usage
  };

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(bodyData),
    headers: { "Content-Type": "application/json" }
  });

  const data = await res.json();

  // data.translatedText is the final translation
  return data.translatedText || "";
}
