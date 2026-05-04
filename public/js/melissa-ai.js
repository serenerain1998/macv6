/* =====================================================================
   Melissa AI — conversational portfolio widget (vanilla JS)
   - Chat with Anthropic Claude (via /api/chat)
   - Voice playback via ElevenLabs (via /api/tts)
   - Mic input via Web Speech API (browser-native, free)
   - Page-aware: detects current page/project, sends as context
   ===================================================================== */
console.log('[melissa-ai] script loaded v=3');
(function () {
  'use strict';

  if (window.__MELISSA_AI_LOADED__) return;
  window.__MELISSA_AI_LOADED__ = true;

  // -----------------------------
  // Auth gate — only init after the visitor passes the password modal
  // -----------------------------
  function isAuthenticated() {
    if (document.body.classList.contains('password-protected')) return false;
    if (localStorage.getItem('portfolioAuthenticated') !== 'true') return false;
    const ts = parseInt(localStorage.getItem('portfolioAuthTimestamp') || '0', 10);
    if (!ts) return false;
    return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
  }

  function whenAuthenticated(cb) {
    if (isAuthenticated()) { cb(); return; }
    const obs = new MutationObserver(() => {
      if (isAuthenticated()) { obs.disconnect(); cb(); }
    });
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  whenAuthenticated(initWidget);

  function initWidget() {

  // -----------------------------
  // Config
  // -----------------------------
  const STORAGE_GREETING_KEY = 'mai-greeting-shown-v1';
  const STORAGE_VOICE_KEY = 'mai-voice-on';
  const GREETING_DELAY_MS = 5000;
  const MAX_HISTORY = 20;

  // -----------------------------
  // Page context detection
  // -----------------------------
  function detectPageContext() {
    const path = window.location.pathname || '';
    const file = path.split('/').pop() || 'index.html';
    const title = (document.title || '').trim();

    const projectMap = {
      'project1.html': 'Project 1: Design System Leadership',
      'project2.html': 'Project 2: Healthcare Workflow UX',
      'project3.html': 'Project 3: AI Interaction Prototype',
      'project4.html': 'Project 4: Advanced Prototyping / Hardware Interaction',
    };
    const projectSlug = projectMap[file] || null;

    return { title, path: file, projectSlug };
  }

  // -----------------------------
  // DOM build
  // -----------------------------
  const ICON = {
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
    volumeOn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    volumeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>',
  };

  const root = document.createElement('div');
  root.className = 'mai-root';
  root.innerHTML = `
    <button class="mai-launcher" type="button" aria-label="Chat with Melissa">${ICON.chat}</button>

    <div class="mai-greeting" role="status" aria-live="polite">
      <button class="mai-greeting-close" type="button" aria-label="Dismiss">×</button>
      <div class="mai-greeting-text">Hi — I'm Melissa. Ask me anything about my work.</div>
    </div>

    <div class="mai-panel" role="dialog" aria-label="Chat with Melissa" aria-hidden="true">
      <div class="mai-header">
        <div class="mai-avatar">M</div>
        <div class="mai-header-text">
          <div class="mai-header-name">Melissa Casole</div>
          <div class="mai-header-role">Sr UX Designer · AI &amp; Design Systems</div>
        </div>
        <div class="mai-header-actions">
          <button class="mai-iconbtn mai-voice-toggle" type="button" aria-label="Toggle voice" title="Voice on">${ICON.volumeOn}</button>
          <button class="mai-iconbtn mai-close" type="button" aria-label="Close chat">${ICON.close}</button>
        </div>
      </div>

      <div class="mai-messages" role="log" aria-live="polite"></div>

      <form class="mai-input-row" autocomplete="off">
        <button class="mai-mic" type="button" aria-label="Speak" title="Hold to speak">${ICON.mic}</button>
        <textarea class="mai-textarea" rows="1" placeholder="Type a message…" aria-label="Message"></textarea>
        <button class="mai-send" type="submit" aria-label="Send" disabled>${ICON.send}</button>
      </form>
      <div class="mai-footnote">Voice is generated by AI · keys &amp; conversations are private.</div>
    </div>
  `;
  document.body.appendChild(root);

  const $launcher  = root.querySelector('.mai-launcher');
  const $panel     = root.querySelector('.mai-panel');
  const $messages  = root.querySelector('.mai-messages');
  const $form      = root.querySelector('.mai-input-row');
  const $textarea  = root.querySelector('.mai-textarea');
  const $send      = root.querySelector('.mai-send');
  const $mic       = root.querySelector('.mai-mic');
  const $close     = root.querySelector('.mai-close');
  const $voiceBtn  = root.querySelector('.mai-voice-toggle');
  const $greeting  = root.querySelector('.mai-greeting');
  const $greetClose = root.querySelector('.mai-greeting-close');

  // -----------------------------
  // State
  // -----------------------------
  const history = []; // [{ role: 'user'|'assistant', content: string }]
  let voiceOn = (localStorage.getItem(STORAGE_VOICE_KEY) ?? 'on') !== 'off';
  let isOpen = false;
  let isSending = false;

  applyVoiceUI();

  // -----------------------------
  // Open / close panel
  // -----------------------------
  function openPanel() {
    isOpen = true;
    $panel.classList.add('mai-open');
    $panel.setAttribute('aria-hidden', 'false');
    $launcher.classList.add('mai-hidden');
    hideGreeting();
    setTimeout(() => $textarea.focus(), 250);

    if (history.length === 0) {
      addBotMessage(
        "Hi — I'm Melissa. I'm a senior UX designer and creative technologist. Ask me about my design process, work in AI interaction design, or the kinds of roles I'm exploring.",
        { speak: false, pushHistory: false }
      );
    }
  }

  function closePanel() {
    isOpen = false;
    $panel.classList.remove('mai-open');
    $panel.setAttribute('aria-hidden', 'true');
    $launcher.classList.remove('mai-hidden');
    stopAudio();
    stopListening();
  }

  $launcher.addEventListener('click', openPanel);
  $close.addEventListener('click', closePanel);

  // -----------------------------
  // Greeting bubble (5s tease)
  // -----------------------------
  function hideGreeting() {
    $greeting.classList.remove('mai-show');
  }

  $greetClose.addEventListener('click', (e) => {
    e.stopPropagation();
    hideGreeting();
    sessionStorage.setItem(STORAGE_GREETING_KEY, '1');
  });

  $greeting.addEventListener('click', () => {
    if (!isOpen) openPanel();
  });

  if (!sessionStorage.getItem(STORAGE_GREETING_KEY)) {
    setTimeout(() => {
      if (!isOpen) {
        $greeting.classList.add('mai-show');
        sessionStorage.setItem(STORAGE_GREETING_KEY, '1');
      }
    }, GREETING_DELAY_MS);
  }

  // -----------------------------
  // Voice toggle
  // -----------------------------
  function applyVoiceUI() {
    $voiceBtn.innerHTML = voiceOn ? ICON.volumeOn : ICON.volumeOff;
    $voiceBtn.classList.toggle('mai-off', !voiceOn);
    $voiceBtn.title = voiceOn ? 'Voice on — click to mute' : 'Voice off — click to enable';
  }

  $voiceBtn.addEventListener('click', () => {
    voiceOn = !voiceOn;
    localStorage.setItem(STORAGE_VOICE_KEY, voiceOn ? 'on' : 'off');
    applyVoiceUI();
    if (!voiceOn) stopAudio();
  });

  // -----------------------------
  // Message rendering
  // -----------------------------
  // Strip ElevenLabs v3 audio cues like [soft laugh], [thoughtful] from text.
  // Spoken audio gets the raw text; the chat bubble + history get the clean version.
  function stripAudioCues(text) {
    return text
      .replace(/\s*\[[a-z][a-z\s'!-]{0,30}\]\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.!?;:])/g, '$1')
      .trim();
  }

  function addBotMessage(text, { speak = true, pushHistory = true } = {}) {
    const visible = stripAudioCues(text);
    const el = document.createElement('div');
    el.className = 'mai-msg mai-from-bot';
    el.textContent = visible;
    $messages.appendChild(el);
    if (pushHistory) {
      history.push({ role: 'assistant', content: visible });
      if (history.length > MAX_HISTORY * 2) history.splice(0, history.length - MAX_HISTORY * 2);
    }
    scrollToBottom();
    if (speak && voiceOn) speakText(text);
  }

  function addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'mai-msg mai-from-user';
    el.textContent = text;
    $messages.appendChild(el);
    history.push({ role: 'user', content: text });
    scrollToBottom();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'mai-typing';
    el.dataset.role = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    $messages.appendChild(el);
    scrollToBottom();
    return el;
  }

  function scrollToBottom() {
    $messages.scrollTop = $messages.scrollHeight;
  }

  // -----------------------------
  // Text input handling
  // -----------------------------
  function autosize() {
    $textarea.style.height = 'auto';
    $textarea.style.height = Math.min($textarea.scrollHeight, 120) + 'px';
    $send.disabled = !$textarea.value.trim() || isSending;
  }

  $textarea.addEventListener('input', autosize);
  $textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  });

  $form.addEventListener('submit', (e) => {
    e.preventDefault();
    submit();
  });

  async function submit() {
    if (isSending) return;
    const text = $textarea.value.trim();
    if (!text) return;

    $textarea.value = '';
    autosize();
    addUserMessage(text);
    await sendToServer();
  }

  // Match a complete sentence: any non-punctuation run, ending in . ! or ?
  // (one or more), followed by whitespace. The trailing-whitespace lookahead
  // prevents committing a sentence mid-stream when more text is still coming.
  const SENTENCE_RE = /[^.!?]+[.!?]+(?=\s)/g;

  async function sendToServer() {
    isSending = true;
    $send.disabled = true;
    ttsQueue.stop();
    const typingEl = showTyping();
    let bubbleEl = null;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.slice(-MAX_HISTORY),
          pageContext: detectPageContext(),
        }),
      });

      if (!res.ok || !res.body) {
        typingEl.remove();
        addBotMessage(
          "Sorry — I'm having trouble connecting right now. You can reach Melissa directly through the contact form on this site.",
          { speak: false }
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let typingRemoved = false;
      let ttsCursor = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        fullText += chunk;

        if (!typingRemoved) {
          typingEl.remove();
          typingRemoved = true;
          bubbleEl = document.createElement('div');
          bubbleEl.className = 'mai-msg mai-from-bot';
          $messages.appendChild(bubbleEl);
        }
        bubbleEl.textContent = stripAudioCues(fullText);
        scrollToBottom();

        // Extract any newly-completed sentences and dispatch each to TTS.
        const remaining = fullText.slice(ttsCursor);
        SENTENCE_RE.lastIndex = 0;
        let m;
        let lastEnd = 0;
        while ((m = SENTENCE_RE.exec(remaining)) !== null) {
          if (m.index !== lastEnd) break; // gap = incomplete text in between
          console.log('[tts] sentence detected mid-stream:', JSON.stringify(m[0]));
          ttsQueue.add(m[0]);
          lastEnd = m.index + m[0].length;
        }
        ttsCursor += lastEnd;
      }
      if (!typingRemoved) typingEl.remove();

      const reply = fullText.trim();
      if (!reply) {
        if (bubbleEl) bubbleEl.remove();
        addBotMessage("I didn't catch that. Could you rephrase?");
        return;
      }

      // Flush any trailing text that didn't end with punctuation+whitespace.
      const tail = fullText.slice(ttsCursor).trim();
      console.log('[tts] stream done; ttsCursor=', ttsCursor, 'fullText.length=', fullText.length, 'tail=', JSON.stringify(tail));
      if (tail) ttsQueue.add(tail);

      const visible = stripAudioCues(reply);
      history.push({ role: 'assistant', content: visible });
      if (history.length > MAX_HISTORY * 2) history.splice(0, history.length - MAX_HISTORY * 2);
    } catch (err) {
      try { typingEl.remove(); } catch (_) {}
      if (bubbleEl) bubbleEl.remove();
      console.error('[melissa-ai] chat error', err);
      addBotMessage(
        "Looks like the connection dropped. Try again in a moment.",
        { speak: false }
      );
    } finally {
      isSending = false;
      autosize();
      $textarea.focus();
    }
  }

  // -----------------------------
  // Voice playback (ElevenLabs via /api/tts) — sentence-level queue
  // Each enqueued sentence kicks off its TTS fetch immediately (so the next
  // one is already buffering while the current one plays); playback is
  // strictly sequential via onended chaining.
  // -----------------------------
  const ttsQueue = {
    q: [],
    playing: null,

    add(text) {
      const trimmed = (text || '').trim();
      console.log('[tts] add called; voiceOn=', voiceOn, 'len=', trimmed.length, 'preview=', trimmed.slice(0, 60));
      if (!voiceOn) return;
      if (!trimmed) return;
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = `/api/tts?text=${encodeURIComponent(trimmed)}`;
      this.q.push(audio);
      console.log('[tts] enqueued; q.length=', this.q.length, 'playing?', !!this.playing);
      if (!this.playing) this._next();
    },

    _next() {
      console.log('[tts] _next; q.length=', this.q.length);
      if (this.q.length === 0) {
        this.playing = null;
        return;
      }
      const audio = this.q.shift();
      this.playing = audio;
      audio.onended = () => {
        console.log('[tts] audio ended');
        if (this.playing === audio) this._next();
      };
      audio.onerror = () => {
        console.warn('[tts] audio element error', audio.error);
        if (this.playing === audio) this._next();
      };
      audio.play()
        .then(() => console.log('[tts] play() resolved — audio started'))
        .catch((err) => {
          console.warn('[tts] play() rejected:', err?.name, err?.message);
          if (this.playing === audio) this._next();
        });
    },

    stop() {
      if (this.playing) {
        try { this.playing.pause(); } catch (_) {}
        this.playing.src = '';
      }
      for (const a of this.q) a.src = '';
      this.q = [];
      this.playing = null;
    },
  };

  function stopAudio() { ttsQueue.stop(); }
  function speakText(text) { ttsQueue.add(text); }

  // -----------------------------
  // Mic input (Web Speech API)
  // -----------------------------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;

  if (!SR) {
    $mic.classList.add('mai-disabled');
    $mic.title = 'Voice input not supported in this browser';
    $mic.disabled = true;
  } else {
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) finalTranscript += r[0].transcript;
        else interim += r[0].transcript;
      }
      $textarea.value = (finalTranscript + interim).trim();
      autosize();
    };

    recognition.onerror = (e) => {
      console.warn('[melissa-ai] speech error', e.error);
      stopListening();
    };

    recognition.onend = () => {
      isListening = false;
      $mic.classList.remove('mai-listening');
      const text = $textarea.value.trim();
      if (text && finalTranscript.trim()) {
        // Auto-submit when user finished speaking
        setTimeout(() => submit(), 200);
      }
    };

    $mic.addEventListener('click', () => {
      if (isListening) stopListening();
      else startListening();
    });
  }

  function startListening() {
    if (!recognition || isListening) return;
    stopAudio();
    try {
      $textarea.value = '';
      autosize();
      recognition.start();
      isListening = true;
      $mic.classList.add('mai-listening');
    } catch (err) {
      console.warn('[melissa-ai] could not start recognition', err);
    }
  }

  function stopListening() {
    if (!recognition || !isListening) return;
    try { recognition.stop(); } catch (_) {}
    isListening = false;
    $mic.classList.remove('mai-listening');
  }

  // -----------------------------
  // ESC closes panel
  // -----------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  } // end initWidget
})();
