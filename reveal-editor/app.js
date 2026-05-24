// Reveal Editor — a small browser GUI for building reveal.js decks.
(() => {
  'use strict';

  const REVEAL_VERSION = '5.1.0';
  const STORAGE_KEY = 'reveal-editor:project:v1';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const uid = () => 'id-' + Math.random().toString(36).slice(2, 10);

  const els = {
    deckTitle: $('#deck-title'),
    themeSelect: $('#theme-select'),
    slideList: $('#slide-list'),
    addSlide: $('#btn-add-slide'),
    editor: $('#slide-editor'),
    source: $('#slide-source'),
    toggleSource: $('#toggle-source'),
    toolbar: $('#toolbar'),
    frame: $('#slide-frame'),
    dropOverlay: $('#drop-overlay'),
    transition: $('#slide-transition'),
    bg: $('#slide-bg'),
    notes: $('#slide-notes'),
    status: $('#status'),
    fileInput: $('#file-input'),
    jsonInput: $('#json-input'),
    previewModal: $('#preview-modal'),
    previewFrame: $('#preview-frame'),
    previewClose: $('#preview-close'),
  };

  // -------- State --------
  function newSlide(content = '<h2>New slide</h2>') {
    return {
      id: uid(),
      content,
      notes: '',
      transition: '',
      backgroundColor: '',
    };
  }

  function blankProject() {
    const first = newSlide('<h1>My presentation</h1><p>Subtitle or intro</p>');
    return {
      title: 'Untitled presentation',
      theme: 'black',
      slides: [first],
      currentId: first.id,
    };
  }

  let state = loadProject() || blankProject();
  let sourceMode = false;
  let saveTimer = null;

  // -------- Persistence --------
  function loadProject() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) return null;
      if (!data.currentId || !data.slides.some(s => s.id === data.currentId)) {
        data.currentId = data.slides[0].id;
      }
      return data;
    } catch {
      return null;
    }
  }

  function saveProject() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStatus('Saved', true);
    } catch (e) {
      setStatus('Save failed: ' + e.message, false);
    }
  }

  function scheduleSave() {
    setStatus('Saving…', false);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveProject, 400);
  }

  function setStatus(text, ok) {
    els.status.textContent = text;
    els.status.classList.toggle('saved', !!ok);
  }

  // -------- Rendering --------
  function currentSlide() {
    return state.slides.find(s => s.id === state.currentId) || state.slides[0];
  }

  function renderSidebar() {
    els.slideList.innerHTML = '';
    state.slides.forEach((slide, idx) => {
      const li = document.createElement('li');
      li.dataset.id = slide.id;
      li.draggable = true;
      if (slide.id === state.currentId) li.classList.add('active');

      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = String(idx + 1);

      const label = document.createElement('span');
      label.className = 'label';
      label.textContent = slideLabel(slide);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'del';
      del.title = 'Delete slide';
      del.textContent = '×';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteSlide(slide.id);
      });

      li.appendChild(num);
      li.appendChild(label);
      li.appendChild(del);

      li.addEventListener('click', () => selectSlide(slide.id));

      li.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/x-slide-id', slide.id);
        e.dataTransfer.effectAllowed = 'move';
      });
      li.addEventListener('dragover', (e) => {
        if (e.dataTransfer.types.includes('text/x-slide-id')) {
          e.preventDefault();
          li.classList.add('drag-over');
        }
      });
      li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
      li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        const fromId = e.dataTransfer.getData('text/x-slide-id');
        if (fromId && fromId !== slide.id) moveSlide(fromId, slide.id);
      });

      els.slideList.appendChild(li);
    });
  }

  function slideLabel(slide) {
    const tmp = document.createElement('div');
    tmp.innerHTML = slide.content;
    const txt = (tmp.textContent || '').trim().replace(/\s+/g, ' ');
    return txt ? (txt.length > 48 ? txt.slice(0, 48) + '…' : txt) : '(empty)';
  }

  function renderEditor() {
    const slide = currentSlide();
    if (sourceMode) {
      els.source.value = slide.content;
    } else {
      els.editor.innerHTML = slide.content;
    }
    els.transition.value = slide.transition || '';
    els.bg.value = slide.backgroundColor || '';
    els.notes.value = slide.notes || '';
  }

  function renderAll() {
    els.deckTitle.value = state.title;
    els.themeSelect.value = state.theme;
    renderSidebar();
    renderEditor();
  }

  // -------- Slide operations --------
  function selectSlide(id) {
    captureCurrentContent();
    state.currentId = id;
    renderAll();
    scheduleSave();
  }

  function addSlide() {
    captureCurrentContent();
    const s = newSlide('');
    const idx = state.slides.findIndex(x => x.id === state.currentId);
    state.slides.splice(idx + 1, 0, s);
    state.currentId = s.id;
    renderAll();
    scheduleSave();
    els.editor.focus();
  }

  function deleteSlide(id) {
    if (state.slides.length === 1) {
      // Reset the only slide instead of deleting
      state.slides[0] = newSlide('');
      state.currentId = state.slides[0].id;
    } else {
      const idx = state.slides.findIndex(s => s.id === id);
      state.slides.splice(idx, 1);
      if (state.currentId === id) {
        state.currentId = state.slides[Math.max(0, idx - 1)].id;
      }
    }
    renderAll();
    scheduleSave();
  }

  function moveSlide(fromId, beforeId) {
    const fromIdx = state.slides.findIndex(s => s.id === fromId);
    if (fromIdx < 0) return;
    const [moved] = state.slides.splice(fromIdx, 1);
    const toIdx = state.slides.findIndex(s => s.id === beforeId);
    state.slides.splice(toIdx, 0, moved);
    renderSidebar();
    scheduleSave();
  }

  function captureCurrentContent() {
    const slide = currentSlide();
    if (!slide) return;
    if (sourceMode) {
      slide.content = els.source.value;
    } else {
      slide.content = els.editor.innerHTML;
    }
  }

  // -------- Toolbar / editing --------
  function execCmd(cmd, arg = null) {
    els.editor.focus();
    document.execCommand(cmd, false, arg);
    onEditorInput();
  }

  function wrapSelection(tag, className) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const node = document.createElement(tag);
    if (className) node.className = className;
    try {
      node.appendChild(range.extractContents());
      range.insertNode(node);
      sel.removeAllRanges();
      const r = document.createRange();
      r.selectNodeContents(node);
      sel.addRange(r);
    } catch (e) {
      console.warn(e);
    }
    onEditorInput();
  }

  function insertHTMLAtCursor(html) {
    els.editor.focus();
    if (!document.execCommand('insertHTML', false, html)) {
      // Fallback
      const sel = window.getSelection();
      if (sel && sel.rangeCount) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const wrap = document.createElement('div');
        wrap.innerHTML = html;
        const frag = document.createDocumentFragment();
        while (wrap.firstChild) frag.appendChild(wrap.firstChild);
        range.insertNode(frag);
      } else {
        els.editor.insertAdjacentHTML('beforeend', html);
      }
    }
    onEditorInput();
  }

  function handleToolbarAction(action) {
    switch (action) {
      case 'blockquote':
        execCmd('formatBlock', 'blockquote');
        break;
      case 'code-inline':
        wrapSelection('code');
        break;
      case 'code-block': {
        const sel = window.getSelection();
        const text = sel && !sel.isCollapsed ? sel.toString() : 'code here';
        insertHTMLAtCursor(`<pre><code>${escapeHtml(text)}</code></pre><p></p>`);
        break;
      }
      case 'link': {
        const url = prompt('Link URL:', 'https://');
        if (url) execCmd('createLink', url);
        break;
      }
      case 'image':
        els.fileInput.click();
        break;
      case 'hr':
        insertHTMLAtCursor('<hr><p></p>');
        break;
      case 'fragment':
        wrapSelection('span', 'fragment');
        break;
    }
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function onEditorInput() {
    captureCurrentContent();
    // Update sidebar label
    const li = els.slideList.querySelector(`li[data-id="${state.currentId}"] .label`);
    if (li) li.textContent = slideLabel(currentSlide());
    scheduleSave();
  }

  // -------- Image drop / paste --------
  function insertImageFromFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (sourceMode) {
        const ta = els.source;
        const pos = ta.selectionStart;
        const before = ta.value.slice(0, pos);
        const after = ta.value.slice(ta.selectionEnd);
        const tag = `<img src="${dataUrl}" alt="">`;
        ta.value = before + tag + after;
        ta.selectionStart = ta.selectionEnd = pos + tag.length;
        onEditorInput();
      } else {
        insertHTMLAtCursor(`<img src="${dataUrl}" alt="">`);
      }
    };
    reader.readAsDataURL(file);
  }

  let dragDepth = 0;
  function setupDropZone() {
    const target = els.frame;
    const isFileDrag = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');

    target.addEventListener('dragenter', (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragDepth++;
      els.dropOverlay.hidden = false;
    });
    target.addEventListener('dragover', (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    });
    target.addEventListener('dragleave', (e) => {
      if (!isFileDrag(e)) return;
      dragDepth = Math.max(0, dragDepth - 1);
      if (dragDepth === 0) els.dropOverlay.hidden = true;
    });
    target.addEventListener('drop', (e) => {
      if (!isFileDrag(e)) return;
      e.preventDefault();
      dragDepth = 0;
      els.dropOverlay.hidden = true;
      const files = Array.from(e.dataTransfer.files || []);
      files.filter(f => f.type.startsWith('image/')).forEach(insertImageFromFile);
    });
  }

  function setupPaste() {
    els.editor.addEventListener('paste', (e) => {
      const items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault();
          insertImageFromFile(item.getAsFile());
          return;
        }
      }
    });
  }

  // -------- Preview / Export --------
  function buildDeckHtml({ standalone }) {
    const cdn = `https://cdn.jsdelivr.net/npm/reveal.js@${REVEAL_VERSION}`;
    const themeHref = `${cdn}/dist/theme/${state.theme}.css`;
    const revealCss = `${cdn}/dist/reveal.css`;
    const revealJs = `${cdn}/dist/reveal.js`;

    const sections = state.slides.map(s => {
      const attrs = [];
      if (s.transition) attrs.push(`data-transition="${escapeAttr(s.transition)}"`);
      if (s.backgroundColor) attrs.push(`data-background="${escapeAttr(s.backgroundColor)}"`);
      const notes = s.notes ? `<aside class="notes">${escapeHtml(s.notes)}</aside>` : '';
      return `<section ${attrs.join(' ')}>${s.content}${notes}</section>`;
    }).join('\n');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(state.title || 'Presentation')}</title>
<link rel="stylesheet" href="${revealCss}">
<link rel="stylesheet" href="${themeHref}" id="theme">
</head>
<body>
<div class="reveal"><div class="slides">
${sections}
</div></div>
<script src="${revealJs}"><\/script>
<script>
  Reveal.initialize({ hash: ${standalone ? 'true' : 'false'}, controls: true, progress: true });
<\/script>
</body>
</html>`;
  }

  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  function showPreview() {
    captureCurrentContent();
    const html = buildDeckHtml({ standalone: false });
    els.previewFrame.srcdoc = html;
    els.previewModal.hidden = false;
  }

  function closePreview() {
    els.previewModal.hidden = true;
    els.previewFrame.srcdoc = '';
  }

  function exportHtml() {
    captureCurrentContent();
    const html = buildDeckHtml({ standalone: true });
    download(html, (state.title || 'presentation') + '.html', 'text/html');
  }

  function exportJson() {
    captureCurrentContent();
    const json = JSON.stringify(state, null, 2);
    download(json, (state.title || 'presentation') + '.json', 'application/json');
  }

  function download(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.slides || !Array.isArray(data.slides) || data.slides.length === 0) {
          throw new Error('Not a valid project file');
        }
        // Repair missing IDs
        data.slides.forEach(s => { if (!s.id) s.id = uid(); });
        if (!data.currentId || !data.slides.some(s => s.id === data.currentId)) {
          data.currentId = data.slides[0].id;
        }
        data.title = data.title || 'Untitled presentation';
        data.theme = data.theme || 'black';
        state = data;
        renderAll();
        saveProject();
      } catch (e) {
        alert('Could not load project: ' + e.message);
      }
    };
    reader.readAsText(file);
  }

  function newProject() {
    if (!confirm('Discard the current deck and start a new one?')) return;
    state = blankProject();
    renderAll();
    saveProject();
  }

  // -------- Wiring --------
  function wire() {
    els.deckTitle.addEventListener('input', () => { state.title = els.deckTitle.value; scheduleSave(); });
    els.themeSelect.addEventListener('change', () => { state.theme = els.themeSelect.value; scheduleSave(); });

    els.addSlide.addEventListener('click', addSlide);

    els.editor.addEventListener('input', onEditorInput);
    els.source.addEventListener('input', onEditorInput);

    els.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const cmd = btn.dataset.cmd;
      const arg = btn.dataset.arg || null;
      const action = btn.dataset.action;
      if (cmd) {
        execCmd(cmd, arg);
      } else if (action) {
        handleToolbarAction(action);
      }
    });

    els.toggleSource.addEventListener('click', () => {
      captureCurrentContent();
      sourceMode = !sourceMode;
      els.editor.hidden = sourceMode;
      els.source.hidden = !sourceMode;
      els.toggleSource.style.background = sourceMode ? '#3a4663' : '';
      renderEditor();
    });

    els.transition.addEventListener('change', () => { currentSlide().transition = els.transition.value; scheduleSave(); });
    els.bg.addEventListener('input', () => { currentSlide().backgroundColor = els.bg.value; scheduleSave(); });
    els.notes.addEventListener('input', () => { currentSlide().notes = els.notes.value; scheduleSave(); });

    els.fileInput.addEventListener('change', () => {
      const file = els.fileInput.files && els.fileInput.files[0];
      if (file) insertImageFromFile(file);
      els.fileInput.value = '';
    });

    $('#btn-preview').addEventListener('click', showPreview);
    $('#btn-export-html').addEventListener('click', exportHtml);
    $('#btn-export-json').addEventListener('click', exportJson);
    $('#btn-import-json').addEventListener('click', () => els.jsonInput.click());
    $('#btn-new').addEventListener('click', newProject);
    els.previewClose.addEventListener('click', closePreview);

    els.jsonInput.addEventListener('change', () => {
      const file = els.jsonInput.files && els.jsonInput.files[0];
      if (file) importJson(file);
      els.jsonInput.value = '';
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 's') { e.preventDefault(); saveProject(); }
      else if (mod && e.shiftKey && e.key === 'Enter') { e.preventDefault(); addSlide(); }
      else if (mod && e.key === 'p') { e.preventDefault(); showPreview(); }
      else if (e.key === 'Escape' && !els.previewModal.hidden) { closePreview(); }
    });

    setupDropZone();
    setupPaste();

    window.addEventListener('beforeunload', () => {
      captureCurrentContent();
      saveProject();
    });
  }

  // -------- Init --------
  renderAll();
  wire();
  setStatus('Ready', true);
})();
