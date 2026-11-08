class MovanFooter extends HTMLElement {
  connectedCallback() {
    const resolveSiteContent = () =>
      window.movanContent?.loadSiteContent
        ? window.movanContent.loadSiteContent()
        : fetch("/data/site-content.json", { headers: { Accept: "application/json" } })
            .then((response) => response.ok ? response.json() : {})
            .catch(() => ({}));

    const render = (siteConfig) => {
      const links = siteConfig?.footer_links || [
        { label: "Portfolio", href: "/portfolio" },
        { label: "Du an", href: "/projects" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" }
      ];
      const footerBrand = (siteConfig?.brand || "MOVAN STUDIO").toLowerCase();
      const copyright = siteConfig?.copyright || "© 2026 Movan Studio";

      this.innerHTML = `
        <footer class="footer">
          <span>${footerBrand}</span>
          <nav class="footer-nav" aria-label="Footer navigation">
            ${links.map((link) => `<a href="${link.href}">${link.label}</a>`).join("")}
          </nav>
          <span>${copyright}</span>
        </footer>
        <movan-toast></movan-toast>
      `;
    };

    resolveSiteContent()
      .then((content) => render(content?.site || null))
      .catch(() => render(null));
  }
}

customElements.define("movan-footer", MovanFooter);

class MovanToast extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        .toast-container {
          position: fixed;
          bottom: var(--space-6);
          right: var(--space-6);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          pointer-events: none;
        }

        .toast {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          padding: var(--space-4) var(--space-6);
          border-radius: 6px;
          color: var(--color-text);
          font-family: var(--font-body);
          font-size: var(--text-sm);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
          transform: translateY(20px);
          opacity: 0;
          transition: all var(--dur-base) var(--ease-out);
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .toast.show {
          transform: translateY(0);
          opacity: 1;
        }

        .toast.success { border-left: 4px solid var(--color-success); }
        .toast.error { border-left: 4px solid var(--color-danger); }
        .toast.info { border-left: 4px solid var(--color-accent); }
      </style>
      <div class="toast-container" id="toast-container"></div>
    `;

    window.showToast = this.showToast.bind(this);
  }

  showToast(message, type = "info", duration = 4000) {
    const container = this.querySelector("#toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
}

customElements.define("movan-toast", MovanToast);

