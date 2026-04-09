document.addEventListener("DOMContentLoaded", async () => {
  const saveMethodRadios = document.querySelectorAll('input[name="saveMethod"]');
  const apiUrlInput = document.getElementById("apiUrl");
  const apiTokenInput = document.getElementById("apiToken");
  const defaultTagsInput = document.getElementById("defaultTags");
  const apiSettingsSection = document.getElementById("api-settings");
  const saveBtn = document.getElementById("save-btn");
  const testBtn = document.getElementById("test-btn");
  const testResult = document.getElementById("test-result");
  const statusMsg = document.getElementById("status-msg");

  // Load saved settings
  const settings = await chrome.storage.sync.get({
    saveMethod: "urlscheme",
    apiUrl: "",
    apiToken: "",
    defaultTags: "",
  });

  // Populate form
  document.querySelector(`input[name="saveMethod"][value="${settings.saveMethod}"]`).checked = true;
  apiUrlInput.value = settings.apiUrl;
  apiTokenInput.value = settings.apiToken;
  defaultTagsInput.value = settings.defaultTags;

  updateApiSettingsVisibility();

  // Toggle API settings visibility
  saveMethodRadios.forEach((radio) => {
    radio.addEventListener("change", updateApiSettingsVisibility);
  });

  function updateApiSettingsVisibility() {
    const method = document.querySelector('input[name="saveMethod"]:checked').value;
    if (method === "api") {
      apiSettingsSection.classList.remove("disabled");
    } else {
      apiSettingsSection.classList.add("disabled");
    }
  }

  // Test connection
  testBtn.addEventListener("click", async () => {
    const url = apiUrlInput.value.trim();
    const token = apiTokenInput.value.trim();

    if (!url || !token) {
      showTestResult("Please enter both URL and token", "error");
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = "Testing...";
    testResult.classList.add("hidden");

    try {
      const response = await fetch(`${url}/api/v1/tags`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        showTestResult("Connected!", "success");
      } else {
        showTestResult(`Error: ${response.status} ${response.statusText}`, "error");
      }
    } catch (err) {
      showTestResult(`Connection failed: ${err.message}`, "error");
    }

    testBtn.disabled = false;
    testBtn.textContent = "Test Connection";
  });

  function showTestResult(message, type) {
    testResult.textContent = message;
    testResult.className = type;
    testResult.classList.remove("hidden");
  }

  // Save settings
  saveBtn.addEventListener("click", async () => {
    const newSettings = {
      saveMethod: document.querySelector('input[name="saveMethod"]:checked').value,
      apiUrl: apiUrlInput.value.trim().replace(/\/+$/, ""), // strip trailing slashes
      apiToken: apiTokenInput.value.trim(),
      defaultTags: defaultTagsInput.value.trim(),
    };

    await chrome.storage.sync.set(newSettings);

    statusMsg.textContent = "Settings saved!";
    statusMsg.className = "success";
    statusMsg.classList.remove("hidden");
    setTimeout(() => statusMsg.classList.add("hidden"), 2500);
  });
});
