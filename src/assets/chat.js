const root = document.querySelector("[data-chatbot]");

if (root) {
  const openButton = root.querySelector("[data-chat-open]");
  const closeButton = root.querySelector("[data-chat-close]");
  const panel = root.querySelector("[data-chat-panel]");
  const messages = root.querySelector("[data-chat-messages]");
  const askForm = root.querySelector("[data-chat-form]");
  const input = root.querySelector("[data-chat-input]");
  const quick = root.querySelector("[data-chat-quick]");
  const contactButton = root.querySelector("[data-chat-contact]");
  const contactForm = root.querySelector("[data-contact-form]");
  const contactBack = root.querySelector("[data-contact-back]");
  const contactMessage = root.querySelector("[data-contact-message]");
  const contactStatus = root.querySelector("[data-contact-status]");

  let knowledgePromise;
  
  let lastQuestion = "";

  function track(name, data = {}) {
    if (window.umami && typeof window.umami.track === "function") {
      window.umami.track(name, data);
    }
  }

  function openChat() {
    panel.hidden = false;
    openButton.setAttribute("aria-expanded", "true");
    root.classList.add("is-open");
    document.body.classList.add("chatbot-open");
    requestAnimationFrame(() => input.focus());
    track("chat_opened");
  }

  function closeChat() {
    panel.hidden = true;
    openButton.setAttribute("aria-expanded", "false");
    root.classList.remove("is-open");
    document.body.classList.remove("chatbot-open");
    openButton.focus();
  }

  function showChat() {
    contactForm.hidden = true;
    messages.hidden = false;
    quick.hidden = false;
    askForm.hidden = false;
    root.querySelector("[data-chat-contact-prompt]").hidden = false;
    input.focus();
  }

  function showContact(prefill = "") {
    messages.hidden = true;
    quick.hidden = true;
    askForm.hidden = true;
    root.querySelector("[data-chat-contact-prompt]").hidden = true;
    contactForm.hidden = false;
    if (prefill && !contactMessage.value) contactMessage.value = prefill;
    contactForm.querySelector('input[name="name"]').focus();
    track("contact_started", { source: "chat" });
  }

  function appendMessage(text, kind = "bot", action = null) {
    const item = document.createElement("div");
    item.className = `chat-message chat-message--${kind}`;
    const body = document.createElement("div");
    body.textContent = text;
    item.appendChild(body);

    if (action) {
      if (action.type === "contact") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-message__action";
        button.textContent = action.label || "Contact the crew";
        button.addEventListener("click", () => showContact(lastQuestion));
        item.appendChild(button);
      } else if (action.type === "link" && action.href) {
        const link = document.createElement("a");
        link.className = "chat-message__action";
        var allowedUrl;
        try {
          allowedUrl = new URL(action.href, window.location.origin);
        } catch (_) { return item; }
        if (!["https://revolutionise.com.au", window.location.origin, "https://yarrariverdragons.com.au"].includes(allowedUrl.origin)) return item;
        link.href = allowedUrl.href;
        link.textContent = action.label || "Open link";
        if (allowedUrl.origin !== window.location.origin) {
          link.target = "_blank";
          link.rel = "noopener";
        }
        link.addEventListener("click", () => track("chat_action_clicked", { intent: action.intent || "answer_link" }));
        item.appendChild(link);
      }
    }

    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
    return item;
  }

  function normalize(value) {
    return value.toLowerCase().replace(/[^a-z0-9\s']/g, " ").replace(/\s+/g, " ").trim();
  }

  function tokens(value) {
    return new Set(normalize(value).split(" ").filter((word) => word.length > 2));
  }

  function smallTalk(question) {
    const q = normalize(question);
    if (["hi", "hello", "hey", "hiya", "good morning", "good afternoon", "good evening"].includes(q)) {
      return "Hi! What can I help with?";
    }
    if (["how are you", "how are you doing", "how's it going", "hows it going"].includes(q)) {
      return "Good, thanks. What can I help with?";
    }
    if (["thanks", "thank you", "cheers"].includes(q)) {
      return "No worries. Anything else?";
    }
    if (["bye", "goodbye", "see you"].includes(q)) {
      return "See you at training.";
    }
    return null;
  }

  async function getKnowledge() {
    if (!knowledgePromise) {
      knowledgePromise = fetch(root.dataset.assistantUrl, { credentials: "same-origin" }).then((response) => {
        if (!response.ok) throw new Error("Could not load YRD assistant knowledge");
        return response.json();
      });
    }
    return knowledgePromise;
  }

  function bestFaq(question, facts) {
    const q = normalize(question);
    const qTokens = tokens(question);
    let best = null;
    let bestScore = 0;

    for (const fact of facts) {
      let score = 0;

      for (const pattern of fact.patterns || []) {
        const p = normalize(pattern);
        if (q === p) score += 20;
        else if (p.length >= 5 && q.includes(p)) score += 10;
      }

      for (const keyword of fact.keywords || []) {
        const k = normalize(keyword);
        if (q === k) score += 8;
        else if (k.includes(" ") && q.includes(k)) score += 5;
        else if (!k.includes(" ") && qTokens.has(k)) score += 3;
      }

      if (score > bestScore) {
        best = fact;
        bestScore = score;
      }
    }

    return { fact: best, score: bestScore };
  }

  // Unknown questions go to the reviewed contact fallback. No remote AI runtime
  // or third-party model code is executed in the visitor's browser.
  async function handleQuestion(rawQuestion) {
    const question = rawQuestion.trim();
    if (!question) return;

    lastQuestion = question;
    appendMessage(question, "user");
    input.value = "";

    const casualReply = smallTalk(question);
    if (casualReply) {
      appendMessage(casualReply);
      track("chat_answered", { method: "small_talk", intent: "small_talk" });
      return;
    }

    input.disabled = true;

    try {
      const knowledge = await getKnowledge();
      const match = bestFaq(question, knowledge.facts || []);
      const intent = match.score >= 3 && match.fact ? match.fact.id : "unknown";
      track("chat_question_asked", { intent });

      if (match.fact && match.score >= 3) {
        const action = match.fact.action ? { ...match.fact.action, intent: match.fact.id } : null;
        appendMessage(match.fact.answer, "bot", action);
        track("chat_answered", { method: "faq", intent: match.fact.id });
        return;
      }


      appendMessage(
        "I’m not sure. Want to send this to the crew?",
        "bot",
        { type: "contact", label: "Contact the crew" }
      );
      track("chat_answered", { method: "contact_fallback", intent: "unknown" });
    } catch (error) {
      appendMessage(
        "I can’t load the club info right now. You can send this to the crew.",
        "bot",
        { type: "contact", label: "Contact the crew" }
      );
    } finally {
      input.disabled = false;
      input.focus();
    }
  }

  openButton.addEventListener("click", openChat);
  closeButton.addEventListener("click", closeChat);
  contactButton.addEventListener("click", () => showContact(lastQuestion));
  contactBack.addEventListener("click", showChat);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closeChat();
  });

  quick.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chat-prompt]");
    if (button) handleQuestion(button.dataset.chatPrompt);
  });

  askForm.addEventListener("submit", (event) => {
    event.preventDefault();
    handleQuestion(input.value);
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    contactStatus.textContent = "";

    const formData = new FormData(contactForm);
    if (formData.get("_honey")) return;

    const submit = contactForm.querySelector('button[type="submit"]');
    const originalLabel = submit.innerHTML;
    submit.disabled = true;
    submit.textContent = "Sending…";

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      _replyto: formData.get("email"),
      _subject: "YRD website enquiry",
      _template: "table",
      source: "YRD website chatbot",
      page: window.location.origin + window.location.pathname
    };

    try {
      const response = await fetch(root.dataset.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Contact submission failed");
      contactStatus.textContent = "Thanks. Your message has been sent.";
      contactForm.reset();
      track("contact_submitted", { source: "chat" });
    } catch (error) {
      const email = root.dataset.contactEmail;
      contactStatus.replaceChildren();
      const text = document.createTextNode("Couldn’t send it. ");
      const link = document.createElement("a");
      link.href = `mailto:${email}`;
      link.textContent = "Email the crew";
      contactStatus.append(text, link);
      track("contact_failed", { source: "chat" });
    } finally {
      submit.disabled = false;
      submit.innerHTML = originalLabel;
    }
  });
}
