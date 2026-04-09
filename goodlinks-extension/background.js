// Service worker for Save to GoodLinks extension.
// Handles keyboard shortcut commands if configured.

chrome.commands?.onCommand?.addListener(async (command) => {
  if (command === "quick-save") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const settings = await chrome.storage.sync.get({
      saveMethod: "urlscheme",
      apiUrl: "",
      apiToken: "",
      defaultTags: "",
    });

    const tags = settings.defaultTags
      ? settings.defaultTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      if (settings.saveMethod === "api" && settings.apiUrl && settings.apiToken) {
        await saveViaApi(settings, {
          url: tab.url,
          title: tab.title || "",
          tags,
          starred: false,
        });
      } else {
        await saveViaUrlScheme({
          url: tab.url,
          title: tab.title || "",
          tags,
          starred: false,
        });
      }
      showBadge("OK", "#1a7f37");
    } catch {
      showBadge("ERR", "#cf222e");
    }
  }
});

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
    throw new Error(`API error ${response.status}`);
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

  const newTab = await chrome.tabs.create({ url: goodlinksUrl, active: false });
  await new Promise((resolve) => setTimeout(resolve, 500));
  try {
    await chrome.tabs.remove(newTab.id);
  } catch {
    // Tab may have already closed
  }
}

function showBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
}
