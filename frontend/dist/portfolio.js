document.addEventListener('DOMContentLoaded', () => {

  // --- PROJECT MODAL ---
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'project-modal-overlay';
    modalOverlay.innerHTML = `
    <div class="project-modal-content">
      <button class="project-modal-close">&times;</button>
      
      <div class="modal-top-section">
        <div class="modal-info">
          <h2 class="project-modal-title" id="modal-title"></h2>
          <p class="project-modal-desc" id="modal-desc"></p>
        </div>
        <div class="modal-hero-media" id="modal-hero"></div>
      </div>

      <div class="project-modal-gallery" id="modal-gallery"></div>
    </div>
  `;
  document.body.appendChild(modalOverlay);

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  modalOverlay.querySelector('.project-modal-close').addEventListener('click', closeModal);

      function openModal(proj) {
    if (!proj) return;
    document.getElementById('modal-title').textContent = proj.name || '';
    document.getElementById('modal-desc').textContent = proj.description || '';
    
    const gallery = proj.gallery || [];
    const fallbackPoster = gallery.find(s => s && !s.endsWith('.mp4')) || '';
    let heroHtml = '';
    let restHtml = '';

    if (gallery.length > 0) {
      const heroSrc = encodeURI(gallery[0]);
      heroHtml = gallery[0].endsWith('.mp4') ? 
        `<video src="${heroSrc}" ${fallbackPoster ? `poster="${encodeURI(fallbackPoster)}"` : ''} autoplay loop muted playsinline preload="auto"></video>` : 
        `<img src="${heroSrc}" alt="${proj.name || 'Hero'}" />`;
      
      const restGallery = gallery.slice(1);
      restHtml = restGallery.map(src => {
        const safeSrc = encodeURI(src);
        if (src.endsWith('.mp4')) {
          return `<video src="${safeSrc}" ${fallbackPoster ? `poster="${encodeURI(fallbackPoster)}"` : ''} autoplay loop muted playsinline preload="auto"></video>`;
        }
        return `<img src="${safeSrc}" alt="${proj.name || 'Project Image'}" />`;
      }).join('');
    }
    
    document.getElementById('modal-hero').innerHTML = heroHtml;
    document.getElementById('modal-gallery').innerHTML = restHtml;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    document.getElementById('modal-gallery').innerHTML = ''; // Stop videos
  }
  
  window.openProjectModal = (idx) => {
    if (window.CURRENT_PROJECTS && window.CURRENT_PROJECTS[idx]) {
      openModal(window.CURRENT_PROJECTS[idx]);
    }
  };

  const heroSection = document.querySelector("#sec-hero .v2-container");
  const skillsGrid = document.getElementById("skills-grid");
  const aboutSection = document.querySelector("#sec-about .v2-container");
  const experienceList = document.getElementById("experience-list");
  const projectsList = document.getElementById("projects-list");
  const contactInfo = document.getElementById("contact-info");

  function renderHero(cv) {
    if (!cv || !heroSection) return;
    const fb = cv.facebook !== undefined ? cv.facebook : 'https://www.facebook.com/NguyenTatLuonh/';
    const ig = cv.instagram !== undefined ? cv.instagram : 'https://www.instagram.com/nathan.laurens/';
    const be = cv.behance_url !== undefined ? cv.behance_url : 'https://www.behance.net/lngnguyntt1';
    const dc = cv.discord !== undefined ? cv.discord : 'https://discord.com/users/574966064761274389';
    heroSection.innerHTML = `
      <div class="hero-split">
        <div class="hero-text">
          <h1 style="white-space: nowrap;">HI, I'm <strong>${(cv.name || '').split(' ').slice(-2).join(' ')}</strong><br/>
          <span class="outline-text">${cv.role || 'Graphic Designer'}</span><br/>
          Based in <strong>${cv.location || 'Việt Nam.'}</strong></h1>
          <p class="hero-desc">${cv.intro || ''}</p>
          <div class="social-links">
            ${fb ? `<a href="${fb}" target="_blank" class="social-btn" title="Facebook">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
            </a>` : ''}
            ${ig ? `<a href="${ig}" target="_blank" class="social-btn" title="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>` : ''}
            ${be ? `<a href="${be}" target="_blank" class="social-btn" title="Behance">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.069 11.239c-.19-3.155-2.288-4.736-5.263-4.736-3.14 0-5.32 2.228-5.32 5.567 0 3.284 1.944 5.617 5.485 5.617 2.457 0 4.103-.984 4.887-2.648h-2.124c-.456.786-1.393 1.096-2.585 1.096-1.683 0-2.834-.84-3.072-2.648h8.043c.01-.527.014-1.218-.051-2.248zm-5.344-3.011c1.472 0 2.656.726 2.81 2.225h-5.613c.25-1.554 1.442-2.225 2.803-2.225zm-6.195 9.07h-8.081v-14.73h8.328c3.218 0 4.542 1.488 4.542 3.42 0 1.25-.668 2.47-2.316 2.83v.135c1.782.261 2.803 1.573 2.803 3.197 0 2.217-1.606 3.65-4.499 3.65h-.777zm-5.495-2.179h2.899c1.607 0 2.404-.764 2.404-1.928 0-1.282-.931-1.781-2.28-1.781h-3.023v3.709zm0-5.599h2.585c1.42 0 2.052-.712 2.052-1.573 0-.962-.642-1.551-1.896-1.551h-2.741v3.124zm5.176-6.852h-4.321v1.657h4.321v-1.657z"/></svg>
            </a>` : ''}
            ${dc ? `<a href="${dc}" target="_blank" class="social-btn" title="Discord">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </a>` : ''}
          </div>
        </div>
        <div class="hero-img">
          <div class="hero-illustration">
             <img src="${cv.hero_image || '/Media/images/hero-illustration.webp'}" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
        </div>
      </div>
    `;
  }

  function renderSkills(cv) {
    if (!cv) return;
    const allSkills = [
      ...cv.software.map(sw => ({ name: sw.name, icon: sw.name[0] })),
      ...cv.skills.map(s => ({ name: s, icon: '★' }))
    ];

    skillsGrid.innerHTML = allSkills.map((s, i) => `
      <div class="skill-box ${i === 1 ? 'dark' : ''}">
        <div class="skill-icon">${s.icon}</div>
        <div class="skill-name">${s.name}</div>
      </div>
    `).join('');
  }

  function renderAbout(cv) {
    if (!cv || !aboutSection) return;

    aboutSection.innerHTML = `
      <div class="about-split" style="align-items: flex-start; gap: 40px;">
        <!-- LEFT COLUMN -->
        <div class="about-img" style="flex: 1; position: sticky; top: 100px;">
          
          <!-- Avatar -->
          <div class="about-illustration bg-placeholder" style="margin-bottom: 20px;">
             <img src="${cv.avatar || '/Media/images/avatar_bust_final.webp'}" onerror="this.src='/Media/images/avatar_bust_close.webp'" style="width: 100%; height: auto; aspect-ratio: 3/4; object-fit: cover; object-position: top center; border-radius: 8px; border: 1px solid #000;" />
          </div>
          
          <!-- Name -->
          <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 2rem; font-weight: 800; text-transform: uppercase; margin-bottom: 30px; line-height: 1.2;">Nguyễn Tất Lượng</h2>
          
          <!-- Personal Info -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 1.2rem; margin-bottom: 15px; font-weight: 700; border-bottom: 2px solid #000; padding-bottom: 5px;">INFO</h3>
            <p style="margin-bottom: 10px;"><strong>DOB:</strong> ${cv.dob}</p>
            <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${cv.phone}</p>
            <p style="margin-bottom: 10px;"><strong>Email:</strong> ${cv.email}</p>
            <p style="margin-bottom: 10px;"><strong>Behance:</strong> <a href="${cv.behance}" target="_blank" style="color: #000;">${cv.behance}</a></p>
          </div>

          <!-- Education -->
          <div style="margin-bottom: 30px;">
            <h3 style="font-size: 1.2rem; margin-bottom: 15px; font-weight: 700; border-bottom: 2px solid #000; padding-bottom: 5px;">EDUCATION</h3>
            <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 5px;">${cv.education.school}</div>
            <div style="color: #666; font-size: 0.95rem; margin-bottom: 10px;">${cv.education.year}</div>
            <ul style="padding-left: 20px; line-height: 1.6; color: #444;">
              ${cv.education.courses.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>

          <!-- Skills -->
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 1.2rem; margin-bottom: 15px; font-weight: 700; border-bottom: 2px solid #000; padding-bottom: 5px;">SKILLS</h3>
              <ul style="padding-left: 20px; line-height: 1.8; font-size: 1rem; color: #444; list-style-type: disc;">
                ${cv.skills.map(s => `<li style="margin-bottom: 5px;">${s}</li>`).join('')}
              </ul>
            </div>
          
          

        </div>

        <!-- RIGHT COLUMN -->
        <div class="about-text" style="flex: 2;">
          <h2 class="section-title" style="text-align: left; margin-bottom: 30px;"><span>About</span> Me</h2>
          <div style="font-size: 1.1rem; line-height: 1.8; color: #444; margin-bottom: 60px;">
            <p>${cv.intro2 || cv.intro}</p>
          </div>

          <h2 class="section-title" style="text-align: left; margin-bottom: 30px;"><span>My</span> Experience</h2>
          <div style="display: flex; flex-direction: column; gap: 20px;">
            ${cv.experiences.map((exp) => `
              <div style="padding: 25px; border: 1px solid #000; border-radius: 8px; transition: all 0.3s;" class="hover-black-card">
                 <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 15px;">
                   <h4 style="font-size: 1.3rem; font-weight: 700; margin: 0; font-family: 'Space Grotesk', sans-serif; color: #000;">${exp.company}</h4>
                   <span style="font-size: 0.9rem; font-weight: 600; color: #000;">${exp.period}</span>
                 </div>
                 <ul style="padding-left: 20px; line-height: 1.6;">
                   ${exp.tasks.map(t => `<li style="margin-bottom: 8px;">${t}</li>`).join('')}
                 </ul>
              </div>
            `).join('')}
          </div>
            
            <!-- Software on Right Column -->
            <h2 class="section-title" style="text-align: left; margin-bottom: 30px; margin-top: 60px;"><span>My</span> Software</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px;">
              ${cv.software.map(sw => {
                return `
                  <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f9f9f9; border-radius: 10px; border: 1px solid #eaeaea; transition: all 0.3s;" class="hover-black-card">
                    <div style="display: flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #fff; border-radius: 10px; overflow: hidden; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                      <img src="${sw.icon || `/Media/icons/${sw.class}.png`}" style="width: 100%; height: 100%; object-fit: cover; padding: 6px;" alt="${sw.name}" />
                    </div>
                    <span style="font-size: 1.1rem; font-weight: 600; color: #111;">${sw.name}</span>
                  </div>
                `;
              }).join('')}
            </div>

          </div>
        </div>
      </div>
    `;
  }

  function renderExperience(cv) {
    // Experience is now rendered inside About Me
    if (experienceList) {
       experienceList.innerHTML = '';
    }
  }

  function renderProjects(projects) {
    if (!projects || projects.length === 0 || !projectsList) return;
    window.CURRENT_PROJECTS = projects;

    const renderMedia = (src, alt, objFit = "cover", posterSrc = "") => {
      if (!src) return '';
      const safeSrc = src.startsWith('http') ? src : encodeURI(src);
      if (src.endsWith('.mp4')) {
        const posterAttr = posterSrc ? `poster="${encodeURI(posterSrc)}"` : '';
        return `<video src="${safeSrc}" ${posterAttr} style="width: 100%; height: 100%; object-fit: ${objFit}; display: block; background-color: #111;" autoplay loop muted playsinline preload="metadata"></video>`;
      }
      return `<img src="${safeSrc}" style="width: 100%; height: 100%; object-fit: ${objFit}; display: block;" alt="${alt}" loading="lazy" />`;
    };

    if (window.SHOW_ALL_PROJECTS) {
      projectsList.innerHTML = '<div class="all-projects-grid">' + projects.map(proj => {
        const gal = proj.gallery || [];
        const firstImg = gal.find(s => s && !s.endsWith('.mp4')) || proj.image || '';
        let cover = gal.length > 0 ? gal[0] : (proj.image || "https://placehold.co/600x400?text=No+Image");
        return `
          <div class="project-card" onclick="window.openProjectModal(${projects.indexOf(proj)})">
            <div class="project-card-media">
              ${renderMedia(cover, proj.name, "cover", firstImg)}
            </div>
            <div class="project-card-content">
              <h3 class="project-card-title">${proj.name}</h3>
              ${proj.description ? `<p class="project-card-desc">${proj.description.length > 80 ? proj.description.substring(0, 80) + '...' : proj.description}</p>` : ''}
            </div>
          </div>
        `;
      }).join('') + '</div>';
      return;
    }

    const showcaseProjects = projects.slice(0, 5);
    
    projectsList.innerHTML = showcaseProjects.map((proj, i) => {
      let isFirst = i === 0;
      let maxImages = 6;
      let placeholderUrl = isFirst ? "https://placehold.co/800x450/222222/666666?text=Image" : "https://placehold.co/400x500/222222/666666?text=Image";

      let validGallery = (proj.gallery && proj.gallery.length > 0) ? proj.gallery.filter(Boolean) : (proj.image ? [proj.image] : []);
      if (validGallery.length === 0) {
         validGallery = Array(maxImages).fill(placeholderUrl);
      }
      const posterFallback = validGallery.find(s => s && !s.endsWith('.mp4')) || '';
      let cols = 3;
      let aspectRatio = isFirst ? '16/9' : '3/4';

      let rowStyle = "align-items: flex-start; margin-bottom: 80px;";
      let textColStyle = "flex: 0 0 25%; padding-right: 20px;";

      let galleryWrapper = '';
      let galleryHtml = '';

      if (i === 1) { // Second project (A80)
        cols = 2; 
        galleryHtml = validGallery.slice(0, 4).map((imgSrc, idx) => `
          <div style="aspect-ratio: 16/9; border-radius: 8px; overflow: hidden; background: #111;">
            ${renderMedia(imgSrc, proj.name + ' ' + (idx + 1), 'cover', posterFallback)}
          </div>
        `).join('');
        galleryWrapper = `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 15px; align-items: stretch;">${galleryHtml}</div>`;
      } else if (i === 2 || i === 3 || i === 4) { // Westworld, Wallflower, Farello
        cols = 6;
        let fit = proj.name.includes("FARELLO") || proj.name.includes("WALLFLOWER") ? "contain" : "cover";
        let bg = proj.name.includes("FARELLO") || proj.name.includes("WALLFLOWER") ? "#ffffff" : "#111";
        let limit = Math.min(validGallery.length, 11);
        for (let j = 0; j < limit; j++) {
          const span = j < 2 ? 3 : 2;
          galleryHtml += `
            <div style="grid-column: span ${span}; border-radius: 8px; overflow: hidden; background: ${bg}; aspect-ratio: 4/3;">
              ${renderMedia(validGallery[j], proj.name + ' ' + (j + 1), fit, posterFallback)}
            </div>
          `;
        }
        galleryWrapper = `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 15px; align-items: stretch;">${galleryHtml}</div>`;
      } else {
        galleryHtml = validGallery.slice(0, maxImages).map(imgSrc => `
          <div style="aspect-ratio: ${aspectRatio}; border-radius: 8px; overflow: hidden; background: #222;">
            ${renderMedia(imgSrc, proj.name, 'cover', posterFallback)}
          </div>
        `).join('');
        galleryWrapper = `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 15px; align-items: start;">${galleryHtml}</div>`;
      }

      return `
        <div class="project-row" onclick="window.openProjectModal(${projects.indexOf(proj)})" style="cursor: pointer; ${rowStyle}">
          <div class="proj-text-col" style="${textColStyle}">
            <div class="proj-number">0${i + 1}</div>
            <h3 class="proj-title">${proj.name}</h3>
            ${proj.category ? `<span style="display: inline-block; padding: 4px 12px; border: 1px solid currentColor; border-radius: 20px; font-size: 0.8rem; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">${proj.category.replace('-', ' ')}</span>` : ''}
            <p class="proj-desc">${proj.description || 'Dự án nổi bật của Nguyễn Lượng với phong cách thiết kế hiện đại và tối giản, tập trung vào trải nghiệm người dùng.'}</p>
            <a href="#" class="proj-link">↗</a>
          </div>
          <div class="proj-img-col" style="flex: 1;">
            ${galleryWrapper}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderContact(cv) {
    if (!cv || !contactInfo) return;
    const heading = cv.contact_heading || "Let's <span>talk</span> for<br/>Something special";
    const sub = cv.contact_sub || 'Tôi luôn mong muốn vượt qua mọi giới hạn của sự sáng tạo và công nghệ để mang lại những trải nghiệm tuyệt vời nhất.';
    contactInfo.innerHTML = `
      <h2 class="contact-heading">${heading}</h2>
      <p class="contact-sub">${sub}</p>
      <div class="contact-details">
        <p class="c-email">${cv.email || ''}</p>
        <p class="c-phone">${cv.phone || ''}</p>
        ${cv.behance ? `<p class="c-behance" style="font-size: 1rem; margin-top: 6px;"><a href="https://${String(cv.behance).replace(/^https?:\/\//, '')}" target="_blank" style="color: #000; text-decoration: underline;">${cv.behance}</a></p>` : ''}
      </div>
    `;
  }

  
  function renderHeader(headerData) {
    const el = document.getElementById('dynamic-header');
    if (!el || !headerData) return;
    const isAllProjects = window.SHOW_ALL_PROJECTS;
    const homeHref = (headerData.home_link && !headerData.home_link.includes('127.0.0.1')) ? headerData.home_link : '/';
    el.innerHTML = `
    <div class="v2-container header-inner">
      <a href="${isAllProjects ? 'index.html' : '#'}" class="brand-logo">${headerData.logo || 'Movan'}</a>
      <nav class="portfolio-nav">
        ${(headerData.nav || []).map(n => `<a href="${isAllProjects && n.href.startsWith('#') ? 'index.html'+n.href : n.href}" ${isAllProjects && n.href=='all-projects.html' ? 'class="active"' : ''}>${n.label}</a>`).join('')}
      </nav>
      <div class="header-actions">
        <a href="#" class="lang-btn notranslate">${document.cookie.includes('googtrans=/vi/en') ? 'VN' : 'EN'}</a>
        <a href="${homeHref}" class="home-btn">Trang chủ</a>
      </div>
    </div>`;
  }

  function renderTestimonials(testData) {
    const el = document.getElementById('dynamic-testimonials');
    if (!el || !testData) return;
    el.innerHTML = testData.map(t => `
          <div class="testimonial-card">
             <div class="t-avatar">${t.avatar}</div>
             <p>"${t.quote}"</p>
             <h4>${t.name}</h4>
          </div>`).join('');
  }

  function renderFooter(footerData) {
    const el = document.getElementById('dynamic-footer');
    if (!el || !footerData) return;
    const brand = footerData.brand || 'Movan';
    const tagline = footerData.tagline !== undefined ? footerData.tagline : 'Không ngừng sáng tạo và theo đuổi sự hoàn hảo trong từng điểm chạm thiết kế.';
    const email = footerData.email || '';
    const phone = footerData.phone || '';
    const address = footerData.address || '';
    const fb = footerData.facebook !== undefined ? footerData.facebook : 'https://www.facebook.com/NguyenTatLuonh/';
    const ig = footerData.instagram !== undefined ? footerData.instagram : 'https://www.instagram.com/nathan.laurens/';
    const be = footerData.behance !== undefined ? footerData.behance : 'https://www.behance.net/lngnguyntt1';
    const dc = footerData.discord !== undefined ? footerData.discord : 'https://discord.com/users/574966064761274389';
    const bottomBrand = footerData.bottom_brand || brand;
    const copyright = footerData.copyright || '© 2026 Made with ❤️';

    const contactItems = [
      email ? `<a href="mailto:${email}" style="color:#ccc;text-decoration:none;">✉ ${email}</a>` : '',
      phone ? `<a href="tel:${phone}" style="color:#ccc;text-decoration:none;">☎ ${phone}</a>` : '',
      address ? `<span style="color:#ccc;">📍 ${address}</span>` : ''
    ].filter(Boolean).join('<span style="color:#444;margin:0 8px;">•</span>');

    el.innerHTML = `
    <div class="v2-container" style="padding: 50px 24px 28px;">
      <div style="text-align: center; padding-bottom: 36px; border-bottom: 1px solid #222;">
        <div style="font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 800; margin-bottom: 12px; color: #fff;">${brand}</div>
        ${tagline ? `<p style="color: #999; font-size: 0.98rem; max-width: 520px; margin: 0 auto 20px; line-height: 1.6;">${tagline}</p>` : ''}
        ${contactItems ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;font-size:0.9rem;margin-bottom:24px;">${contactItems}</div>` : ''}
        <div style="display: flex; justify-content: center; gap: 14px;">
          ${fb ? `<a href="${fb}" target="_blank" title="Facebook" style="width: 40px; height: 40px; border: 1px solid #444; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; text-decoration: none; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
          </a>` : ''}
          ${ig ? `<a href="${ig}" target="_blank" title="Instagram" style="width: 40px; height: 40px; border: 1px solid #444; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; text-decoration: none; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>` : ''}
          ${be ? `<a href="${be}" target="_blank" title="Behance" style="width: 40px; height: 40px; border: 1px solid #444; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; text-decoration: none; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.069 11.239c-.19-3.155-2.288-4.736-5.263-4.736-3.14 0-5.32 2.228-5.32 5.567 0 3.284 1.944 5.617 5.485 5.617 2.457 0 4.103-.984 4.887-2.648h-2.124c-.456.786-1.393 1.096-2.585 1.096-1.683 0-2.834-.84-3.072-2.648h8.043c.01-.527.014-1.218-.051-2.248zm-5.344-3.011c1.472 0 2.656.726 2.81 2.225h-5.613c.25-1.554 1.442-2.225 2.803-2.225zm-6.195 9.07h-8.081v-14.73h8.328c3.218 0 4.542 1.488 4.542 3.42 0 1.25-.668 2.47-2.316 2.83v.135c1.782.261 2.803 1.573 2.803 3.197 0 2.217-1.606 3.65-4.499 3.65h-.777zm-5.495-2.179h2.899c1.607 0 2.404-.764 2.404-1.928 0-1.282-.931-1.781-2.28-1.781h-3.023v3.709zm0-5.599h2.585c1.42 0 2.052-.712 2.052-1.573 0-.962-.642-1.551-1.896-1.551h-2.741v3.124zm5.176-6.852h-4.321v1.657h4.321v-1.657z"/></svg>
          </a>` : ''}
          ${dc ? `<a href="${dc}" target="_blank" title="Discord" style="width: 40px; height: 40px; border: 1px solid #444; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #fff; text-decoration: none; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          </a>` : ''}
        </div>
      </div>
      <div class="footer-inner" style="padding: 24px 0 0;">
        <div class="footer-brand">${bottomBrand}</div>
        <div class="footer-copy">${copyright}</div>
      </div>
    </div>`;
  }

  const bootstrap = (portfolioData) => {
    if (!portfolioData) {
        return;
    }
    const safeRender = (fn, data, name) => { 
        try { 
            fn(data); 
        } catch (e) { 
            console.error('Render error in ' + name + ':', e); 
        } 
    };
    
    // Root level data
    safeRender(renderHeader, portfolioData.header, 'renderHeader');
    safeRender(renderTestimonials, portfolioData.testimonials, 'renderTestimonials');
    safeRender(renderFooter, portfolioData.footer, 'renderFooter');
    
    // Portfolio level data
    const pf = portfolioData.portfolio || {};
    safeRender(renderHero, pf.cv, 'renderHero');
    safeRender(renderAbout, pf.cv, 'renderAbout');
    safeRender(renderProjects, pf.projects, 'renderProjects');
    safeRender(renderContact, pf.cv, 'renderContact');
  };

  const resolveSiteContent = () =>
    fetch("/api/portfolio?t=" + Date.now(), { headers: { Accept: "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error("API response not ok");
        return res.json();
      })
      .catch(() =>
        fetch("./data/site-content.json?v=" + Date.now(), { headers: { Accept: "application/json" } })
          .then((response) => (response.ok ? response.json() : {}))
          .catch(() => ({}))
      );

  resolveSiteContent()
    .then((content) => bootstrap(content))
    .catch(() => bootstrap(null));
});
// --- GOOGLE TRANSLATE INTEGRATION ---
window.googleTranslateElementInit = function() {
  new google.translate.TranslateElement({
    pageLanguage: 'vi',
    includedLanguages: 'en,vi',
    autoDisplay: false
  }, 'google_translate_element');
};

(function() {
  // Inject script
  const gtScript = document.createElement('script');
  gtScript.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.head.appendChild(gtScript);

  // Inject div
  const gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  gtDiv.style.display = 'none';
  document.body.appendChild(gtDiv);

  // Inject CSS to hide Google bar
  const style = document.createElement('style');
  style.innerHTML = `
    .goog-te-banner-frame { display: none !important; }
    .skiptranslate { display: none !important; }
    body { top: 0 !important; }
    #goog-gt-tt { display: none !important; }
  `;
  document.head.appendChild(style);

  // Lang switch handler
  document.addEventListener('click', (e) => {
    if (e.target && e.target.closest('.lang-btn')) {
      e.preventDefault();
      const isEnglish = document.cookie.includes('googtrans=/vi/en');
      
      if (isEnglish) {
        // Switch to VI (clear cookie)
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      } else {
        // Switch to EN
        document.cookie = 'googtrans=/vi/en; path=/';
      }
      location.reload();
    }
  });
})();

// Update button text on load
function updateLangBtnText() {
  const isEnglish = document.cookie.includes('googtrans=/vi/en');
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.innerText = isEnglish ? 'VN' : 'EN';
  });
}
// Run immediately (since script is at bottom) and also on DOMContentLoaded just in case
updateLangBtnText();
document.addEventListener('DOMContentLoaded', updateLangBtnText);

// --- ANTI-SCRAPE SECURITY ---
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'A') e.preventDefault();
});
document.addEventListener('keydown', e => {
  if (e.key === 'F12' || 
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) || 
      (e.ctrlKey && e.key.toUpperCase() === 'U')) {
    e.preventDefault();
  }
});
// Disable text selection globally via CSS injection
const noSelectStyle = document.createElement('style');
noSelectStyle.innerHTML = 'body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }';
document.head.appendChild(noSelectStyle);
if (window.location.search.includes('clear_lang=1')) {
    document.cookie = "googtrans=/vi/vi; path=/; domain=" + window.location.hostname;
    document.cookie = "googtrans=/vi/vi; path=/";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = window.location.pathname;
}

// ── CLIENT CLICK & INTERACTION TRACKER FOR MOVAN PORTFOLIO ──
(function setupClickTracking() {
  function sendClick(targetName) {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/portfolio/track-click', JSON.stringify({ target: targetName, path: window.location.pathname }));
      } else {
        fetch('/api/portfolio/track-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: targetName, path: window.location.pathname }),
          keepalive: true
        }).catch(() => {});
      }
    } catch(e) {}
  }

  document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button, .project-card, .project-row, .service-card, input[type="submit"]');
    if (target) {
      const text = (target.getAttribute('aria-label') || target.innerText || target.getAttribute('title') || target.tagName).trim().slice(0, 50);
      sendClick(text || 'Element Click');
    }
  }, { passive: true });
})();
