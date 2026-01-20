import { getImageUrl } from './client-api.js';

export function ServiceCard(item, sectionEndpoint, showCategoryBadge = false, categoryLabel = '') {
    const imgUrl = getImageUrl(item.main_image);
    const title = item.name || 'Untitled';
    const cost = item.estimated_cost || 'Price on Request';
    // Truncate description roughly to fit 2 lines
    const desc = item.description ? (item.description.substring(0, 90) + (item.description.length > 90 ? '...' : '')) : '';
    const status = item.status || 'Active';

    // Helper for safe HTML
    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    // detailsLink passes the section endpoint so property-details.js knows where to fetch from
    const detailsLink = `property.html?section=${sectionEndpoint}&id=${item.id}`;

    let badgeHtml = '';
    if (showCategoryBadge && categoryLabel) {
        badgeHtml = `<div class="card-badge category-badge">${safe(categoryLabel)}</div>`;
    }

    const statusBadge = `<div class="card-badge status-badge">${safe(status)}</div>`;

    return `
        <article class="service-card-item">
            <div class="card-img-wrapper">
                <a href="${detailsLink}" tabindex="-1">
                    <img src="${imgUrl}" alt="${safe(title)}" loading="lazy" onerror="this.onerror=null;this.src='/placeholder.svg';">
                </a>
                <div class="card-badges-container">
                    ${badgeHtml}
                    ${statusBadge}
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title"><a href="${detailsLink}">${safe(title)}</a></h3>
                <div class="card-cost">${safe(cost)}</div>
                <p class="card-desc">${safe(desc)}</p>
                <div class="card-actions">
                    <a href="${detailsLink}" class="cam-btn cam-btn--gold cam-btn--sm">View Details</a>
                </div>
            </div>
        </article>
    `;
}
