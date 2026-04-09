document.addEventListener("DOMContentLoaded", async () => {
  const titleInput = document.getElementById("title");
  const urlInput = document.getElementById("url");
  const tagsInput = document.getElementById("tags");
  const starredInput = document.getElementById("starred");
  const saveBtn = document.getElementById("save-btn");
  const statusBanner = document.getElementById("status-banner");
  const setupPrompt = document.getElementById("setup-prompt");
  const saveForm = document.getElementById("save-form");
  const openOptionsBtn = document.getElementById("open-options");

  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    titleInput.value = tab.title || "";
    urlInput.value = tab.url || "";
  }

  // Load saved settings
  const settings = await chrome.storage.sync.get({
    saveMethod: "urlscheme",
    apiUrl: "",
    apiToken: "",
    defaultTags: "",
  });

  // Pre-fill default tags
  if (settings.defaultTags) {
    tagsInput.value = settings.defaultTags;
  }

  // Check if API method is selected but not configured
  if (settings.saveMethod === "api" && (!settings.apiUrl || !settings.apiToken)) {
    saveForm.classList.add("hidden");
    setupPrompt.classList.remove("hidden");
  }

  openOptionsBtn?.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  saveBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) {
      showStatus("No URL to save", "error");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    showStatus("Saving to GoodLinks...", "saving");

    const linkData = {
      url: url,
      title: titleInput.value.trim(),
      tags: tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      starred: starredInput.checked,
    };

    try {
      if (settings.saveMethod === "api") {
        await saveViaApi(settings, linkData);
      } else {
        await saveViaUrlScheme(linkData);
      }
      showStatus("Saved!", "success");
      setTimeout(() => window.close(), 800);
    } catch (err) {
      showStatus(err.message || "Failed to save", "error");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save to GoodLinks";
    }
  });

  function showStatus(message, type) {
    statusBanner.textContent = message;
    statusBanner.className = type;
  }

  async function saveViaApi(settings, linkData) {
    const body = {
      url: linkData.url,
      title: linkData.title || undefined,
      tags: linkData.tags.length > 0 ? linkData.tags : undefined,
      starred: linkData.starred || undefined,
    };

    const response = await fetch(`${settings.apiUrl}/api/v1/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`API error ${response.status}: ${text || response.statusText}`);
    }
  }

  async function saveViaUrlScheme(linkData) {
    const params = new URLSearchParams();
    params.set("url", linkData.url);
    if (linkData.title) params.set("title", linkData.title);
    if (linkData.tags.length > 0) params.set("tags", linkData.tags.join(" "));
    if (linkData.starred) params.set("starred", "1");
    params.set("quick", "1");

    const goodlinksUrl = `goodlinks://x-callback-url/save?${params.toString()}`;

    // Open in a new tab and close it to avoid navigating away from the current page
    const newTab = await chrome.tabs.create({ url: goodlinksUrl, active: false });

    // Give the OS time to handle the protocol, then close the tab
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      await chrome.tabs.remove(newTab.id);
    } catch {
      // Tab may have already closed
    }
  }
});
