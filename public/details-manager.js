import { fetchPublic, postPublic, getImageUrl } from './client-api.js';

export class DetailsManager {
    constructor() {
        this.containerId = 'property-content';
        this.init();
    }

    async init() {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        const id = params.get('id');

        if (!section || !id) {
            this.renderError('Invalid property link.');
            return;
        }

        await this.loadData(section, id);
    }

    async loadData(section, id) {
        try {
            // Note: Section name in URL param (e.g. 'real-estate-properties') maps to API endpoint
            const endpoint = `/${section}/${id}`;
            const property = await fetchPublic(endpoint);
            this.renderDetails(property, section);
        } catch (error) {
            console.error(error);
            this.renderError('Property not found or could not be loaded.');
        }
    }

    renderDetails(prop, sectionName) {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const heroBg = getImageUrl(prop.main_image);
        const title = this.safe(prop.name);
        const cost = this.safe(prop.estimated_cost);
        const desc = this.safe(prop.description).replace(/\n/g, '<br>');
        const date = prop.created_at ? new Date(prop.created_at).toLocaleDateString() : '';
        const status = this.safe(prop.status);

        // Gallery logic
        let galleryHtml = '';
        let images = [];
        if (prop.sub_images) {
            try {
                images = Array.isArray(prop.sub_images) ? prop.sub_images : JSON.parse(prop.sub_images);
            } catch (e) {}
        }

        if (images && images.length > 0) {
            galleryHtml = `
                <div class="pd-gallery-section">
                    <h3>Gallery</h3>
                    <div class="pd-gallery-grid">
                        ${images.map(img => `
                            <div class="pd-gallery-item" onclick="window.open('${getImageUrl(img)}', '_blank')">
                                <img src="${getImageUrl(img)}" onerror="this.onerror=null;this.src='/placeholder.svg';">
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="pd-hero" style="background-image: url('${heroBg}');">
                <div class="pd-overlay"></div>
                <div class="pd-hero-content">
                    <span class="pd-badge">${status}</span>
                    <h1 class="pd-title">${title}</h1>
                    <div class="pd-meta">
                        <span>${cost}</span>
                        <span class="pd-dot">•</span>
                        <span>Listed: ${date}</span>
                    </div>
                </div>
            </div>

            <div class="pd-layout">
                <div class="pd-main">
                    <div class="pd-section">
                        <h3>Description</h3>
                        <div class="pd-desc">${desc}</div>
                    </div>
                    ${galleryHtml}
                </div>

                <div class="pd-sidebar">
                    <div class="pd-card">
                        <h3>Interested?</h3>
                        <p>Contact us to schedule a viewing or request a proposal.</p>
                        <form id="inquiryForm" class="pd-form">
                            <input type="text" name="name" placeholder="Your Name" required>
                            <input type="email" name="email" placeholder="Email Address" required>
                            <input type="tel" name="phone" placeholder="Phone Number">
                            <textarea name="message" rows="4" placeholder="I am interested in ${title}..." required></textarea>
                            <button type="submit" class="btn primary full-width">Send Inquiry</button>
                        </form>
                        <div id="inquiryMsg" class="form-msg"></div>
                    </div>
                </div>
            </div>
        `;

        // Attach event listener for form
        document.getElementById('inquiryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleInquiry(e.target, title, sectionName);
        });
    }

    async handleInquiry(form, propTitle, section) {
        const btn = form.querySelector('button');
        const msgDiv = document.getElementById('inquiryMsg');

        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;
        msgDiv.textContent = '';
        msgDiv.className = 'form-msg';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Add context
        data.subject = `Inquiry: ${propTitle} (${section})`;

        try {
            await postPublic('/inquiries', data);
            msgDiv.textContent = 'Inquiry sent successfully!';
            msgDiv.classList.add('success');
            form.reset();
        } catch (error) {
            console.error(error);
            msgDiv.textContent = 'Failed to send inquiry. Please try again.';
            msgDiv.classList.add('error');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    }

    renderError(msg) {
        const container = document.getElementById(this.containerId);
        if(container) {
            container.innerHTML = `
                <div class="pd-error">
                    <h2>Error</h2>
                    <p>${msg}</p>
                    <a href="index.html" class="btn ghost">Return Home</a>
                </div>
            `;
        }
    }

    safe(str) {
        return str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';
    }
}
