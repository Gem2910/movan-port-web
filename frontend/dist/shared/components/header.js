class MovanHeader extends HTMLElement {
  connectedCallback() {
    const activePage = this.getAttribute("active-page") || "";
    let siteConfig = null;
    const resolveSiteContent = () =>
      window.movanContent?.loadSiteContent
        ? window.movanContent.loadSiteContent()
        : fetch("/data/site-content.json", { headers: { Accept: "application/json" } })
            .then((response) => response.ok ? response.json() : {})
            .catch(() => ({}));

    const defaultNavigation = [
      { label: "TRANG CHU", href: "/", page: "home" },
      { label: "PORTFOLIO", href: "/portfolio", page: "portfolio" },
      { label: "DU AN", href: "/projects", page: "projects" },
      { label: "BLOG", href: "/blog", page: "blog" },
      { label: "LIEN HE", href: "/contact", page: "contact" }
    ];

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        if ([...document.scripts].some((script) => script.src === src)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

    const buildNavLinks = (navigation) =>
      navigation
        .map(
          (item) =>
            `<a href="${item.href}" data-nav="${item.page}" class="${activePage === item.page ? "active" : ""}">${item.label}</a>`
        )
        .join("");

    const render = () => {
      const navigation = siteConfig?.navigation || defaultNavigation;
      const contactUrl = siteConfig?.contact_url || "/contact";
      const homeUrl = siteConfig?.home_url || "/";
      const brand = siteConfig?.brand || "MOVAN STUDIO";
      const navLinks = buildNavLinks(navigation);

      this.innerHTML = `
        <header class="topbar">
          <a class="brand" href="${homeUrl}" aria-label="Movan Studio - Trang chu">${brand}</a>
          <nav class="nav" aria-label="Navigation chinh">
            ${navLinks}
          </nav>
          <div class="topbar-actions">
            
            <button class="menu-toggle" id="menu-toggle" aria-label="Mo menu" aria-expanded="false">
              <span></span><span></span><span></span>
            </button>
          </div>
        </header>

        <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">
          ${navLinks}
        </nav>
      `;

      const menuToggle = this.querySelector("#menu-toggle");
      const mobileNav = this.querySelector("#mobile-nav");

      if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", () => {
          const isOpen = mobileNav.classList.toggle("is-open");
          menuToggle.setAttribute("aria-expanded", isOpen.toString());
          document.body.style.overflow = isOpen ? "hidden" : "";
        });

        mobileNav.querySelectorAll("a").forEach((link) => {
          link.addEventListener("click", () => {
            mobileNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.style.overflow = "";
          });
        });
      }
    };

    resolveSiteContent().then((content) => {
      siteConfig = content?.site || null;
      render();
    });
  }
}

customElements.define("movan-header", MovanHeader);

