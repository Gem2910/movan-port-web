/**
 * Movan AI Floating Chat Widget
 * Connects to Cloudflare Worker Proxy (Model: Movan-Code)
 */

(function () {
  const WORKER_URL = 'https://movan-platform-worker.nguyentatluong2910.workers.dev';

  // Inject Styles
  const style = document.createElement('style');
  style.textContent = `
    .movan-ai-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
      z-index: 99999;
      border: 2px solid #fff;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .movan-ai-btn:hover {
      transform: scale(1.08) rotate(5deg);
      box-shadow: 0 12px 32px rgba(249, 115, 22, 0.6);
    }
    .movan-ai-btn svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }
    .movan-ai-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #10b981;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid #000;
    }

    .movan-ai-box {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 540px;
      max-height: calc(100vh - 120px);
      background: #121216;
      border: 1px solid #27272a;
      border-radius: 16px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.6);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 99999;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
    }
    .movan-ai-box.active {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    .movan-ai-header {
      padding: 14px 16px;
      background: #18181b;
      border-bottom: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .movan-ai-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .movan-ai-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    .movan-ai-title {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1.2;
    }
    .movan-ai-status {
      font-size: 11px;
      color: #10b981;
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0;
    }
    .movan-ai-status::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10b981;
    }
    .movan-ai-close {
      background: none;
      border: none;
      color: #a1a1aa;
      font-size: 20px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }
    .movan-ai-close:hover {
      color: #fff;
      background: #27272a;
    }

    .movan-ai-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      font-size: 13.5px;
      line-height: 1.5;
    }
    .movan-ai-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 12px;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .movan-ai-msg.user {
      align-self: flex-end;
      background: #f97316;
      color: #000;
      font-weight: 500;
      border-bottom-right-radius: 2px;
    }
    .movan-ai-msg.assistant {
      align-self: flex-start;
      background: #202026;
      color: #e4e4e7;
      border-bottom-left-radius: 2px;
      border: 1px solid #2e2e38;
    }

    .movan-ai-input-area {
      padding: 12px;
      background: #18181b;
      border-top: 1px solid #27272a;
      display: flex;
      gap: 8px;
    }
    .movan-ai-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 8px;
      background: #0f0f12;
      border: 1px solid #3f3f46;
      color: #fff;
      font-size: 13.5px;
      outline: none;
      font-family: inherit;
    }
    .movan-ai-input:focus {
      border-color: #f97316;
    }
    .movan-ai-send {
      padding: 0 16px;
      background: #f97316;
      color: #000;
      font-weight: 700;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .movan-ai-send:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .movan-ai-send:hover:not(:disabled) {
      background: #ea580c;
    }
  `;
  document.head.appendChild(style);

  // Render Widget DOM
  const btn = document.createElement('div');
  btn.className = 'movan-ai-btn';
  btn.title = 'Trò chuyện với Movan-Code AI';
  btn.innerHTML = `
    <span class="movan-ai-badge"></span>
    <svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.38-1 1.72V7h2a5 5 0 0 1 5 5v1a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-1v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1H4a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4v-1a5 5 0 0 1 5-5h2V5.72c-.6-.34-1-.98-1-1.72a2 2 0 0 1 2-2m-3 9a1.5 1.5 0 0 0-1.5 1.5A1.5 1.5 0 0 0 9 14a1.5 1.5 0 0 0 1.5-1.5A1.5 1.5 0 0 0 9 11m6 0a1.5 1.5 0 0 0-1.5 1.5A1.5 1.5 0 0 0 15 14a1.5 1.5 0 0 0 1.5-1.5A1.5 1.5 0 0 0 15 11m-6 5v1h6v-1z"/></svg>
  `;

  const box = document.createElement('div');
  box.className = 'movan-ai-box';
  box.innerHTML = `
    <div class="movan-ai-header">
      <div class="movan-ai-header-left">
        <div class="movan-ai-avatar">⚡</div>
        <div>
          <h4 class="movan-ai-title">Movan-Code AI</h4>
          <p class="movan-ai-status">Trực tuyến (Cloudflare Worker)</p>
        </div>
      </div>
      <button class="movan-ai-close" id="movan-ai-close-btn">&times;</button>
    </div>
    <div class="movan-ai-messages" id="movan-ai-messages">
      <div class="movan-ai-msg assistant">Xin chào! Tôi là <strong>Movan-Code</strong>, trợ lý AI của Movan Studio. Tôi có thể hỗ trợ bạn tìm hiểu về các dự án, dịch vụ hoặc giải đáp các thắc mắc kỹ thuật!</div>
    </div>
    <form class="movan-ai-input-area" id="movan-ai-form">
      <input type="text" class="movan-ai-input" id="movan-ai-input" placeholder="Nhập câu hỏi của bạn..." autocomplete="off" />
      <button type="submit" class="movan-ai-send" id="movan-ai-send">Gửi</button>
    </form>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(box);

  // Logic
  const closeBtn = document.getElementById('movan-ai-close-btn');
  const form = document.getElementById('movan-ai-form');
  const input = document.getElementById('movan-ai-input');
  const sendBtn = document.getElementById('movan-ai-send');
  const messagesDiv = document.getElementById('movan-ai-messages');

  const history = [
    { role: 'assistant', content: 'Xin chào! Tôi là Movan-Code, trợ lý AI của Movan Studio. Tôi có thể hỗ trợ bạn tìm hiểu về các dự án, dịch vụ hoặc giải đáp các thắc mắc kỹ thuật!' }
  ];

  btn.addEventListener('click', () => {
    box.classList.toggle('active');
    if (box.classList.contains('active')) input.focus();
  });

  closeBtn.addEventListener('click', () => {
    box.classList.remove('active');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    sendBtn.disabled = true;

    // Append user message
    history.push({ role: 'user', content: text });
    const userMsgEl = document.createElement('div');
    userMsgEl.className = 'movan-ai-msg user';
    userMsgEl.textContent = text;
    messagesDiv.appendChild(userMsgEl);

    // Typing placeholder
    const typingEl = document.createElement('div');
    typingEl.className = 'movan-ai-msg assistant';
    typingEl.textContent = 'Movan-Code đang suy nghĩ...';
    messagesDiv.appendChild(typingEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    try {
      const apiUrl = `/proxy/ai/chat/completions`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'Movan-Code',
          messages: [
            {
              role: 'system',
              content: 'Bạn là Movan-Code AI, trợ lý ảo chính thức đại diện cho Movan Studio (Graphic Design, Web Development & AI Solutions). Hãy trả lời lịch sự, thông minh, ngắn gọn và hữu ích bằng Tiếng Việt.'
            },
            ...history
          ],
          stream: false
        })
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || data.reply || data.error?.message || data.error || 'Không nhận được câu trả lời từ máy chủ AI.';

      history.push({ role: 'assistant', content: reply });
      typingEl.innerHTML = reply.replace(/\n/g, '<br/>');
    } catch (err) {
      typingEl.textContent = 'Lỗi kết nối tới AI Worker: ' + err.message;
    } finally {
      sendBtn.disabled = false;
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  });
})();
