/* ============================================================
   MOVAN STUDIO - MAIN JS
   Navigation, content loading, entrance animations, filters
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  const JSON_HEADERS = { Accept: "application/json" };
  let contentPromise = null;

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getProjectsFromContent(content = {}) {
    const featuredProjects = Array.isArray(content.home?.selected_work?.projects) ? content.home.selected_work.projects : [];
    return featuredProjects.map((project, index) => ({
      slug: project.slug || `featured-project-${index + 1}`,
      title: project.title || "",
      type: project.type || "",
      year: project.year || "",
      description: project.description || "",
      cover: project.image || `/Media/public/phase${(index % 4) + 1}.png`
    }));
  }

  function loadSiteContent() {
    if (!contentPromise) {
      contentPromise = fetch("/api/portfolio", { headers: JSON_HEADERS })
        .then((response) => (response.ok ? response.json() : fetch("/data/site-content.json", { headers: JSON_HEADERS }).then(r => r.json())))
        .catch(() =>
          fetch("/data/site-content.json", { headers: JSON_HEADERS })
            .then((response) => (response.ok ? response.json() : {}))
            .catch(() => ({}))
        );
    }

    return contentPromise;
  }

  window.movanContent = window.movanContent || {};
  window.movanContent.loadSiteContent = loadSiteContent;

  const currentPage = document.body.dataset.page || "home";
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.nav === currentPage);
  });

  function observeAnimations(scope = document) {
    const animItems = scope.querySelectorAll(".anim-ready:not([data-anim-observed])");
    if (!animItems.length || !("IntersectionObserver" in window)) {
      animItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    animItems.forEach((item) => {
      item.dataset.animObserved = "true";
      observer.observe(item);
    });
  }

  function renderHomePage(content) {
    const home = content.home;
    if (!home) return;

    const heroName = document.querySelector(".hero-name");
    const heroTop = document.querySelector(".hero-line-top");
    const heroBottom = document.querySelector(".hero-line-bottom");
    const heroDescription = document.querySelector(".hero-copy .lead");
    const heroPrimary = document.getElementById("cta-portfolio");
    const heroSecondary = document.getElementById("cta-projects");

    if (heroName) heroName.textContent = home.hero?.name || heroName.textContent;
    if (heroTop) heroTop.textContent = home.hero?.title_top || heroTop.textContent;
    if (heroBottom) heroBottom.textContent = home.hero?.title_bottom || heroBottom.textContent;
    if (heroDescription) heroDescription.textContent = home.hero?.description || heroDescription.textContent;
    if (heroPrimary && home.hero?.primary_cta) {
      heroPrimary.textContent = home.hero.primary_cta.label;
      heroPrimary.href = home.hero.primary_cta.href;
    }
    if (heroSecondary && home.hero?.secondary_cta) {
      heroSecondary.textContent = home.hero.secondary_cta.label;
      heroSecondary.href = home.hero.secondary_cta.href;
    }

    const capabilityStrip = document.querySelector(".strip");
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

    const projectsSection = document.querySelector('section[aria-labelledby="projects-heading"]');
    if (projectsSection) {
      const eyebrow = projectsSection.querySelector(".section-header .eyebrow");
      const title = projectsSection.querySelector("#projects-heading");
      const cta = projectsSection.querySelector(".flex-between .button");
      const grid = projectsSection.querySelector(".grid-4.stagger");

      if (eyebrow) eyebrow.textContent = home.selected_work?.eyebrow || eyebrow.textContent;
      if (title) title.textContent = home.selected_work?.title || title.textContent;
      if (cta && home.selected_work?.cta) {
        cta.textContent = home.selected_work.cta.label;
        cta.href = home.selected_work.cta.href;
      }

      if (grid && Array.isArray(home.selected_work?.projects)) {
        grid.innerHTML = home.selected_work.projects
          .map((project, index) => {
            const isLarge = index < 2;
            const colClass = isLarge ? " col-2" : "";
            const year = project.year ? `<span class="label">${escapeHtml(project.year)}</span>` : "";
            const excerpt = project.description ? `<p>${escapeHtml(project.description)}</p>` : "";
            const ctaHtml = isLarge ? `<a class="button btn-ghost" href="${project.link || "#"}" style="margin-top:auto">Xem case study -></a>` : "";
            const titleStyle = isLarge ? "" : ' style="font-size: var(--text-lg); line-height: 1.2"';
            return `
              <article class="card project-card anim-ready${colClass}">
                <img loading="lazy" src="${project.image || ""}" alt="${escapeHtml(project.title || "")}" class="card-image" />
                <div class="card-meta">
                  <span class="badge badge-accent">${escapeHtml(project.type || "")}</span>
                  ${year}
                </div>
                <h3${titleStyle}>${escapeHtml(project.title || "")}</h3>
                ${excerpt}
                ${ctaHtml}
              </article>
            `;
          })
          .join("");
      }
    }

    const processSection = document.querySelector('section[aria-labelledby="process-heading"]');
    if (processSection) {
      const eyebrow = processSection.querySelector(".section-header .eyebrow");
      const title = processSection.querySelector("#process-heading");
      const grid = processSection.querySelector(".process-grid");

      if (eyebrow) eyebrow.textContent = home.process?.eyebrow || eyebrow.textContent;
      if (title) title.textContent = home.process?.title || title.textContent;
      if (grid && Array.isArray(home.process?.steps)) {
        grid.innerHTML = home.process.steps
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
    }

  }

  function renderBlogPage(content) {
    const blog = content.blog;
    if (!blog) return;

    const hero = document.querySelector(".section-header");
    if (hero) {
      const eyebrow = hero.querySelector(".eyebrow");
      const title = hero.querySelector("h1");
      const description = hero.querySelector("p");
      if (eyebrow) eyebrow.textContent = blog.eyebrow || eyebrow.textContent;
      if (title) title.textContent = blog.title || title.textContent;
      if (description) description.textContent = blog.description || description.textContent;
    }

    const filterBar = document.querySelector(".filter-bar");
    if (filterBar && Array.isArray(blog.categories)) {
      filterBar.innerHTML = blog.categories
        .map(
          (category, index) =>
            `<button class="filter-btn${index === 0 ? " active" : ""}" data-filter="${category.slug}">${escapeHtml(category.label)}</button>`
        )
        .join("");
    }

    const grid = document.getElementById("blog-grid");
    if (grid && Array.isArray(blog.posts)) {
      grid.innerHTML = blog.posts
        .map(
          (post, index) => `
            <article class="card article-card anim-ready" data-filter-item="${post.category}" id="post-${index + 1}">
              <div class="article-meta">
                <span class="badge">${escapeHtml(post.badge)}</span>
                <span class="body-xs">${escapeHtml(post.meta)}</span>
              </div>
              <h2>${escapeHtml(post.title)}</h2>
              <p>${escapeHtml(post.excerpt)}</p>
              <a class="button btn-ghost" href="${post.link || "#"}" style="margin-top:auto">Doc bai -></a>
            </article>
          `
        )
        .join("");
    }
  }

  function renderPortfolioPage(content) {
    const portfolio = content.portfolio;
    if (!portfolio) return;

    const titleWords = document.querySelectorAll(".hero-title .title-word");
    const heroTopLeft = document.querySelector(".hero-logo-top-left h2");
    const heroSubbrand = document.querySelector(".hero-logo-top-left span");
    const monogram = document.querySelector(".hero-logo-top-right .logo-k");
    const year = document.querySelector(".hero-badge.year");

    if (heroTopLeft) heroTopLeft.textContent = portfolio.hero?.brand || heroTopLeft.textContent;
    if (heroSubbrand) heroSubbrand.textContent = portfolio.hero?.subbrand || heroSubbrand.textContent;
    if (monogram) monogram.textContent = portfolio.hero?.monogram || monogram.textContent;
    if (titleWords[0]) titleWords[0].textContent = portfolio.hero?.title_top || titleWords[0].textContent;
    if (titleWords[1]) titleWords[1].textContent = portfolio.hero?.title_bottom || titleWords[1].textContent;
    if (year) year.textContent = portfolio.hero?.year || year.textContent;

    const about = portfolio.about || {};
    const portrait = document.querySelector(".portrait-image");
    if (portrait && about.portrait_image) {
      portrait.src = about.portrait_image;
      portrait.alt = about.portrait_alt || "Portrait";
    }
    const badge = document.querySelector(".badge-hecho");
    if (badge) badge.textContent = about.portrait_badge || badge.textContent;
    const location = document.querySelector(".location-stamp");
    if (location && Array.isArray(about.location_lines)) {
      location.innerHTML = about.location_lines.map((line) => escapeHtml(line)).join("<br/>");
    }
    const aboutTitle = document.querySelector(".about-title");
    if (aboutTitle) {
      if (about.title_html) {
        aboutTitle.innerHTML = about.title_html;
      }
    }
    const aboutDesc = document.querySelector(".about-desc");
    if (aboutDesc && Array.isArray(about.paragraphs)) {
      aboutDesc.innerHTML = about.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("<br/>");
    }
    const polaroidRow = document.querySelector(".polaroid-row");
    if (polaroidRow && Array.isArray(about.polaroids)) {
      polaroidRow.innerHTML = about.polaroids
        .map(
          (item) => `
            <div class="polaroid">
              <div class="polaroid-img bg-placeholder"><img loading="lazy" src="${item.image || ""}" style="width:100%;height:100%;object-fit:cover;"></div>
              <div class="polaroid-caption">${escapeHtml(item.caption || "")}</div>
            </div>
          `
        )
        .join("");
    }

    const brandTitle = document.querySelector(".brand-title");
    if (brandTitle && portfolio.brand_section?.title_html) {
      brandTitle.innerHTML = portfolio.brand_section.title_html;
    }
    const brandSubtitle = document.querySelector(".brand-subtitle");
    if (brandSubtitle) brandSubtitle.textContent = portfolio.brand_section?.subtitle || brandSubtitle.textContent;
    const brandImage = document.querySelector(".kevin-cutout img");
    if (brandImage && portfolio.brand_section?.hero_image) {
      brandImage.src = portfolio.brand_section.hero_image;
    }
  }

  function renderProjectsPage(content) {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    const renderProjectCards = (projects) => {
      grid.innerHTML = projects
        .map((project, index) => {
          const cover = project.cover || project.image || `/Media/public/phase${(index % 4) + 1}.png`;
          const detailHref = project.slug === "movan-studio-web" ? "/projects/detail/case-study" : "/portfolio";
          return `
            <article class="card project-card anim-ready${index < 2 ? " col-2" : ""}">
              <img loading="lazy" src="${cover}" alt="${escapeHtml(project.title || "")}" class="card-image" />
              <div class="card-meta">
                <span class="badge badge-accent">${escapeHtml(project.type || "")}</span>
                <span class="label">${escapeHtml(project.year || "")}</span>
              </div>
              <h3>${escapeHtml(project.title || "")}</h3>
              <p>${escapeHtml(project.description || "")}</p>
              <a class="button btn-ghost" href="${detailHref}" style="margin-top:auto">Xem chi tiet -></a>
            </article>
          `;
        })
        .join("");
      observeAnimations(grid);
    };

    fetch("/data/projects.json", { headers: JSON_HEADERS })
      .then((response) => (response.ok ? response.json() : {}))
      .then((payload) => {
        const projects = Array.isArray(payload?.projects) && payload.projects.length
          ? payload.projects
          : getProjectsFromContent(content);
        renderProjectCards(projects);
      })
      .catch(() => {
        renderProjectCards(getProjectsFromContent(content));
      });
  }

  function applyPageContent(content) {
    if (currentPage === "home") renderHomePage(content);
    if (currentPage === "blog") renderBlogPage(content);
    if (currentPage === "portfolio") renderPortfolioPage(content);
    if (currentPage === "projects") renderProjectsPage(content);
    observeAnimations(document);
  }

  loadSiteContent().then(applyPageContent);

  const inquiryForm = document.getElementById("inquiry-form");
  const formStatus = document.getElementById("form-status");

  if (inquiryForm) {
    inquiryForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const payload = {
        name: inquiryForm.name?.value?.trim() || "",
        email: inquiryForm.email?.value?.trim() || "",
        company: inquiryForm.company?.value?.trim() || "",
        type: inquiryForm.type?.value?.trim() || "",
        service: inquiryForm.service?.value?.trim() || inquiryForm.type?.value?.trim() || "",
        budget: inquiryForm.budget?.value?.trim() || "",
        message: inquiryForm.message?.value?.trim() || ""
      };

      if (!payload.name || !payload.email || !payload.service || !payload.message) {
        setFormStatus("Vui long dien du cac truong bat buoc.", "error");
        return;
      }

      try {
        setFormStatus("Dang gui yeu cau...", "pending");

        const response = await fetch("/backend/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Khong gui duoc yeu cau.");
        }

        setFormStatus("Da gui yeu cau thanh cong. Movan se phan hoi trong 24 gio.", "success");
        inquiryForm.reset();
      } catch (error) {
        setFormStatus(error.message || "Co loi xay ra. Vui long thu lai.", "error");
      }
    });
  }

  // Handle any standard .contact-form (e.g. homepage or products contact form)
  const contactForms = document.querySelectorAll(".contact-form");
  contactForms.forEach((cForm) => {
    if (cForm.id === "inquiry-form") return;

    cForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const nameInput = cForm.querySelector('input[type="text"]') || cForm.querySelector('input[name="name"]');
      const emailInput = cForm.querySelector('input[type="email"]') || cForm.querySelector('input[name="email"]');
      const allTextInputs = cForm.querySelectorAll('input[type="text"]');
      const companyInput = allTextInputs.length > 1 ? allTextInputs[1] : null;
      const messageInput = cForm.querySelector('textarea');
      const submitBtn = cForm.querySelector('button[type="submit"]');

      const name = nameInput?.value?.trim() || "";
      const email = emailInput?.value?.trim() || "";
      const company = companyInput?.value?.trim() || "";
      const message = messageInput?.value?.trim() || "";

      if (!name || !email) {
        alert("Vui lòng nhập tên và email của bạn.");
        return;
      }

      const origBtnText = submitBtn ? submitBtn.innerText : "Gửi liên hệ";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Đang gửi...";
      }

      try {
        const response = await fetch("/backend/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            company,
            service: "Website Contact Form",
            message: message || "Liên hệ qua trang web movan.id.vn"
          })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Không thể gửi liên hệ.");
        }

        alert("Cảm ơn bạn! Movan đã nhận được liên hệ và sẽ phản hồi sớm nhất.");
        cForm.reset();
      } catch (err) {
        console.error("Submit error:", err);
        alert(err.message || "Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại sau.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerText = origBtnText;
        }
      }
    });
  });

  function setFormStatus(message, state) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status ${state}`;
  }

  document.querySelectorAll(".filter-bar").forEach((bar) => {
    bar.addEventListener("click", (event) => {
      const button = event.target.closest(".filter-btn");
      if (!button || !button.dataset.filter) return;

      bar.querySelectorAll(".filter-btn").forEach((node) => node.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter;
      const grid = bar.closest("[data-filter-target]")?.querySelector("[data-filter-grid]");
      if (!grid) return;

      grid.querySelectorAll("[data-filter-item]").forEach((item) => {
        const match = filter === "all" || item.dataset.filterItem === filter;
        item.style.display = match ? "" : "none";
      });
    });
  });

  observeAnimations(document);
});

