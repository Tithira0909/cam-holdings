import { fetchPublic, getImageUrl } from './client-api.js';

async function initServices() {
    const grid = document.querySelector('.service-grid');
    if (!grid) return;

    try {
        const [types, services] = await Promise.all([
            fetchPublic('/service-types'),
            fetchPublic('/services')
        ]);

        if (types.length === 0) {
            grid.innerHTML = '<p>No services found.</p>';
            return;
        }

        grid.innerHTML = ''; // Clear existing static content

        types.forEach(type => {
            const typeServices = services.filter(s => s.service_type_id === type.id);

            const card = document.createElement('article');
            card.className = 'service-card';
            // Use ID for anchor linking if needed, fallback to slug-like
            card.id = type.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            // Determine icon/image
            let iconHtml = '<div class="service-icon">⟡</div>';
            if (type.thumbnail) {
                // If thumbnail exists, use it. Maybe as an img or background.
                // The design uses a small icon div. Let's try to put an img inside it.
                iconHtml = `<div class="service-icon"><img src="${getImageUrl(type.thumbnail)}" alt="" style="width:100%; height:100%; object-fit:contain;"></div>`;
            }

            // Build checklist
            let checklistHtml = '';
            if (typeServices.length > 0) {
                checklistHtml = '<ul class="checklist">';
                typeServices.forEach(svc => {
                    checklistHtml += `<li>${svc.name}</li>`;
                });
                checklistHtml += '</ul>';
            }

            card.innerHTML = `
                ${iconHtml}
                <h3>${type.name}</h3>
                <p>${type.description || ''}</p>
                ${checklistHtml}
                <a class="service-link" href="/contact.html">Discuss this service →</a>
            `;

            // If this is the "Real Estate" card, fetch and append a mini preview
            if (type.slug.includes('real-estate') || type.name.toLowerCase().includes('real estate')) {
                // Change link to real-estate.html
                const link = card.querySelector('.service-link');
                if (link) {
                    link.href = '/real-estate.html';
                    link.textContent = 'View Exclusive Properties →';
                }

                // Fetch previews from new API
                fetchPublic('/real-estate/properties?featured=true&limit=3')
                    .then(projects => {
                        if (projects && projects.length > 0) {
                            const previewDiv = document.createElement('div');
                            previewDiv.className = 'service-preview-list';
                            previewDiv.style.marginTop = '1rem';
                            previewDiv.style.borderTop = '1px solid rgba(255,255,255,0.1)';
                            previewDiv.style.paddingTop = '1rem';

                            let html = '<div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px; color:rgba(255,255,255,0.5);">Latest</div>';

                            const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

                            projects.forEach(p => {
                                const link = `/property.html?slug=${safe(p.slug)}`;
                                html += `
                                    <a href="${link}" style="display:block; font-size:0.9rem; color:rgba(255,255,255,0.85); margin-bottom:4px; text-decoration:none;">
                                        • ${safe(p.title)}
                                    </a>
                                `;
                            });
                            previewDiv.innerHTML = html;
                            card.appendChild(previewDiv);
                        }
                    })
                    .catch(err => console.error(err));
            }

            grid.appendChild(card);
        });

        // Re-initialize tilt effect for new cards
        initTiltCards();

    } catch (error) {
        console.error('Error loading services:', error);
        grid.innerHTML = '<p>Error loading services.</p>';
    }
}

// Copied from script.js to ensure it runs on dynamic elements
function initTiltCards() {
    const cards = document.querySelectorAll("[data-tilt], .service-card, .metric");
    if (!cards.length) return;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    cards.forEach((card) => {
      let rect = null;

      const onMove = (e) => {
        rect = rect || card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;  // 0..1
        const y = (e.clientY - rect.top) / rect.height;  // 0..1

        const rx = clamp((0.5 - y) * 6, -6, 6);  // tilt strength
        const ry = clamp((x - 0.5) * 8, -8, 8);

        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      };

      const onLeave = () => {
        rect = null;
        card.style.transform = "";
      };

      // only on devices with hover
      if (window.matchMedia("(hover: hover)").matches) {
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
      }
    });
  }

document.addEventListener('DOMContentLoaded', initServices);
