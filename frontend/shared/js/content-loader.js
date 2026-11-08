(function () {
  const JSON_HEADERS = { Accept: "application/json" };
  let siteContentPromise = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function safeSetText(selector, value, root = document) {
    const node = root.querySelector(selector);
    if (node && value !== undefined && value !== null) {
      node.textContent = value;
    }
  }

  function safeSetHtml(selector, value, root = document) {
    const node = root.querySelector(selector);
    if (node && value !== undefined && value !== null) {
      node.innerHTML = value;
    }
  }

  function safeSetHref(selector, value, root = document) {
    const node = root.querySelector(selector);
    if (node && value) {
      node.setAttribute("href", value);
    }
  }

  function loadSiteContent() {
    if (!siteContentPromise) {
      siteContentPromise = fetch("/data/site-content.json", { headers: JSON_HEADERS })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load site content.");
          }
          return response.json();
        })
        .catch((error) => {
          console.error(error);
          return {};
        });
    }

    return siteContentPromise;
  }

  function renderHomePage(content) {
    const home = content.home;
    if (!home) return;

    safeSetText("#home-hero-name", home.hero?.name);
    safeSetText("#home-hero-line-top", home.hero?.title_top);
    safeSetText("#home-hero-line-bottom", home.hero?.title_bottom);
    safeSetText("#home-hero-description", home.hero?.description);
    safeSetText("#home-hero-cta-primary", home.hero?.primary_cta?.label);
    safeSetHref("#home-hero-cta-primary", home.hero?.primary_cta?.href);
    safeSetText("#home-hero-cta-secondary", home.hero?.secondary_cta?.label);
    safeSetHref("#home-hero-cta-secondary", home.hero?.secondary_cta?.href);

    const capabilityStrip = document.getElementById("home-capability-strip");
    if (capabilityStrip && Array.isArray(home.capabilities)) {
      capabilityStrip.innerHTML = home.capabilities
        .map(
          (item) => `
            <article class="strip-item anim-ready">
              <span class="item-number">${escapeHtml(item.number)}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <p>${escapeHtml(item.description)}</p>
            </article>
          `
        )
        .join("");
    }

    safeSetText("#home-projects-eyebrow", home.selected_work?.eyebrow);
    safeSetText("#home-projects-title", home.selected_work?.title);
    safeSetText("#home-projects-cta", home.selected_work?.cta?.label);
    safeSetHref("#home-projects-cta", home.selected_work?.cta?.href);

    const projectGrid = document.getElementById("home-project-grid");
    if (projectGrid && Array.isArray(home.selected_work?.projects)) {
      projectGrid.innerHTML = home.selected_work.projects
        .map((project, index) => {
          const largeCard = index < 2 ? " col-2" : "";
          const titleStyle = index >= 2 ? ' style="font-size: var(--text-lg); line-height: 1.2"' : "";
          const excerpt = project.description
            ? `<p>${escapeHtml(project.description)}</p>`
            : "";
          const cta = index < 2
            ? `<a class="button btn-ghost" href="${escapeAttr(project.link || "#")}" style="margin-top:auto">Xem case study -></a>`
            : "";
          const year = project.year ? `<span class="label">${escapeHtml(project.year)}</span>` : "";

          return `
            <article class="card project-card anim-ready${largeCard}" id="project-${index + 1}">
              <img loading="lazy" src="${escapeAttr(project.image || "")}" alt="${escapeAttr(project.title || "")}" class="card-image" />
              <div class="card-meta">
                <span class="badge badge-accent">${escapeHtml(project.type || "")}</span>
                ${year}
              </div>
              <h3${titleStyle}>${escapeHtml(project.title || "")}</h3>
              ${excerpt}
              ${cta}
            </article>
          `;
        })
        .join("");
    }

    safeSetText("#home-process-eyebrow", home.process?.eyebrow);
    safeSetText("#home-process-title", home.process?.title);
    const processGrid = document.getElementById("home-process-grid");
    if (processGrid && Array.isArray(home.process?.steps)) {
      processGrid.innerHTML = home.process.steps
        .map(
          (step) => `
            <div class="process-step anim-ready">
              <div class="step-num">${escapeHtml(step.number)}</div>
              <strong>${escapeHtml(step.title)}</strong>
              <p>${escapeHtml(step.description)}</p>
            </div>
          `
        )
        .join("");
    }

    safeSetText("#home-shop-eyebrow", home.shop_preview?.eyebrow);
    safeSetText("#home-shop-title", home.shop_preview?.title);
    safeSetText("#home-shop-cta", home.shop_preview?.cta?.label);
    safeSetHref("#home-shop-cta", home.shop_preview?.cta?.href);
    const shopGrid = document.getElementById("shop-preview-grid");
    if (shopGrid && Array.isArray(home.shop_preview?.items)) {
      shopGrid.innerHTML = home.shop_preview.items
        .map(
          (item, index) => `
            <article class="card product-card anim-ready" id="product-preview-${index + 1}">
              <div class="product-thumb" style="background: var(--color-surface-mid); height:180px; display:flex; align-items:center; justify-content:center;">
                <span class="label">${escapeHtml(item.badge || item.type || "")}</span>
              </div>
              <div class="product-body">
                <span class="product-type">${escapeHtml(item.type || "")}</span>
                <h3 class="product-title">${escapeHtml(item.title || "")}</h3>
                <p class="product-price${item.free ? " is-free" : ""}">${escapeHtml(item.price || "")}</p>
              </div>
            </article>
          `
        )
        .join("");
    }
  }

  function renderServicesPage(content) {
    const services = content.services;
    if (!services) return;

    safeSetText("#services-eyebrow", services.eyebrow);
    safeSetText("#services-title", services.title);
    safeSetText("#services-description", services.description);

    const servicesGrid = document.getElementById("services-grid");
    if (!servicesGrid || !Array.isArray(services.items)) return;

    servicesGrid.innerHTML = services.items
      .map(
        (item) => `
          <article class="card anim-ready" id="svc-${escapeAttr((item.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">
            <span class="eyebrow" style="margin-bottom: var(--space-4)">${escapeHtml(item.number)}</span>
            <h3 style="font-size: var(--text-xl); margin-bottom: var(--space-4)">${escapeHtml(item.title)}</h3>
            <p class="body-sm" style="color: var(--color-text-soft); margin-bottom: var(--space-5);">${escapeHtml(item.description)}</p>
            <ul class="prose-list">
              ${(item.bullets || []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}
            </ul>
          </article>
        `
      )
      .join("");
  }

  function renderBlogPage(content) {
    const blog = content.blog;
    if (!blog) return;

    safeSetText("#blog-eyebrow", blog.eyebrow);
    safeSetText("#blog-title", blog.title);
    safeSetText("#blog-description", blog.description);

    const filterBar = document.getElementById("blog-filter-bar");
    if (filterBar && Array.isArray(blog.categories)) {
      filterBar.innerHTML = blog.categories
        .map(
          (category, index) => `
            <button class="filter-btn${index === 0 ? " active" : ""}" data-filter="${escapeAttr(category.slug)}">${escapeHtml(category.label)}</button>
          `
        )
        .join("");
    }

    const blogGrid = document.getElementById("blog-grid");
    if (blogGrid && Array.isArray(blog.posts)) {
      blogGrid.innerHTML = blog.posts
        .map(
          (post, index) => `
            <article class="card article-card anim-ready" data-filter-item="${escapeAttr(post.category)}" id="post-${index + 1}">
              <div class="article-meta">
                <span class="badge">${escapeHtml(post.badge)}</span>
                <span class="body-xs">${escapeHtml(post.meta)}</span>
              </div>
              <h2>${escapeHtml(post.title)}</h2>
              <p>${escapeHtml(post.excerpt)}</p>
              <a class="button btn-ghost" href="${escapeAttr(post.link || "#")}" style="margin-top:auto">Doc bai -></a>
            </article>
          `
        )
        .join("");
    }
  }

  function renderPortfolioPage(content) {
    const portfolio = content.portfolio;
    if (!portfolio) return;

    safeSetText(".hero-logo-top-left h2", portfolio.hero?.brand);
    safeSetText(".hero-logo-top-left span", portfolio.hero?.subbrand);
    safeSetText(".hero-logo-top-right .logo-k", portfolio.hero?.monogram);
    safeSetText(".hero-title .title-word.text-orange:first-child", portfolio.hero?.title_top);
    const titleWords = document.querySelectorAll(".hero-title .title-word.text-orange");
    if (titleWords[1] && portfolio.hero?.title_bottom) {
      titleWords[1].textContent = portfolio.hero.title_bottom;
    }
    safeSetText(".hero-badge.year", portfolio.hero?.year);

    const about = portfolio.about || {};
    const portrait = document.querySelector(".portrait-image");
    if (portrait && about.portrait_image) {
      portrait.setAttribute("src", about.portrait_image);
      portrait.setAttribute("alt", about.portrait_alt || "Portrait");
    }
    safeSetText(".badge-hecho", about.portrait_badge);
    safeSetHtml(".location-stamp", (about.location_lines || []).map((line) => escapeHtml(line)).join("<br/>"));
    safeSetText(".header-logo .text-orange", about.monogram);
    safeSetText(".about-title", about.title);

    const aboutDesc = document.querySelector(".about-desc");
    if (aboutDesc && Array.isArray(about.paragraphs)) {
      aboutDesc.innerHTML = about.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("<br/>");
    }

    safeSetText(".about-experience h3", about.experience_title);
    const experienceWrap = document.querySelector(".about-experience");
    if (experienceWrap && Array.isArray(about.experience)) {
      const title = `<h3>${escapeHtml(about.experience_title || "")}</h3>`;
      const items = about.experience
        .map(
          (item) => `
            <div class="exp-item">
              <div class="exp-year${item.accent ? " text-orange" : ""}">${escapeHtml(item.year)}<br/>${escapeHtml(item.location)}</div>
              <div class="exp-details">
                <strong>${escapeHtml(item.company)}</strong>
                <span>${escapeHtml(item.role)}</span>
              </div>
            </div>
          `
        )
        .join("");
      experienceWrap.innerHTML = title + items;
    }

    const sidebarSections = document.querySelectorAll(".about-sidebar .sidebar-section");
    if (sidebarSections[0]) {
      sidebarSections[0].querySelector("h3").textContent = about.focus_title || "";
      const focusList = sidebarSections[0].querySelector(".focus-list");
      if (focusList) {
        focusList.innerHTML = (about.focus_list || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
      }
    }
    if (sidebarSections[1]) {
      sidebarSections[1].querySelector("h3").textContent = about.tools_title || "";
      const toolsGrid = sidebarSections[1].querySelector(".tools-grid");
      if (toolsGrid) {
        toolsGrid.innerHTML = (about.tools || [])
          .map((tool) => `<div class="tool-icon ${escapeAttr(tool.class_name || "")}">${escapeHtml(tool.label || "")}</div>`)
          .join("");
      }
    }

    const polaroidRow = document.querySelector(".polaroid-row");
    if (polaroidRow && Array.isArray(about.polaroids)) {
      polaroidRow.innerHTML = about.polaroids
        .map(
          (item) => `
            <div class="polaroid">
              <div class="polaroid-img bg-placeholder"><img loading="lazy" src="${escapeAttr(item.image || "")}" style="width:100%;height:100%;object-fit:cover;"></div>
              <div class="polaroid-caption">${escapeHtml(item.caption || "")}</div>
            </div>
          `
        )
        .join("");
    }

    safeSetHtml(".brand-title", portfolio.brand_section?.title_html);
    safeSetText(".brand-subtitle", portfolio.brand_section?.subtitle);
    const brandHero = document.querySelector(".kevin-cutout img");
    if (brandHero && portfolio.brand_section?.hero_image) {
      brandHero.setAttribute("src", portfolio.brand_section.hero_image);
    }
  }

  function applyPageContent(content) {
    const page = document.body?.dataset?.page;
    if (page === "home") renderHomePage(content);
    if (page === "services") renderServicesPage(content);
    if (page === "blog") renderBlogPage(content);
    if (page === "portfolio") renderPortfolioPage(content);
  }

  window.movanContent = {
    applyPageContent,
    escapeAttr,
    escapeHtml,
    loadSiteContent,
    safeSetHref,
    safeSetHtml,
    safeSetText
  };

  document.addEventListener("DOMContentLoaded", async () => {
    const content = await loadSiteContent();
    applyPageContent(content);
    document.dispatchEvent(new CustomEvent("movan:content-ready", { detail: content }));
  });
})();

