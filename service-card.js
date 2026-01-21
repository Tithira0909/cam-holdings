import { getImageUrl } from './client-api.js';

export function ServiceCard(item, sectionEndpoint, showCategoryBadge = false, categoryLabel = '') {
    // Handle both old and new schema fields
    const rawImage = item.cover_image || item.main_image || item.image_url;
    const imgUrl = getImageUrl(rawImage);
    const title = item.title || item.name || 'Untitled';
    const cost = item.estimated_cost || item.budget || ''; // Projects might have budget, Services might have estimated_cost

    // Truncate description
    const rawDesc = item.description || '';
    const desc = rawDesc.length > 90 ? rawDesc.substring(0, 90) + '...' : rawDesc;

    // Status
    const status = item.is_active ? 'Active' : (item.status || 'Active');

    // Helper for safe HTML
    const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

    // Link logic
    let detailsLink = '#';
    // If it's a Project (has serviceCategory/service_id/budget), go to project-details
    // If it's a Service Listing (has category/estimated_cost), go to service-details
    // For now, if sectionEndpoint is 'services', go to service-details

    if (item.slug) {
        if (sectionEndpoint === 'projects') {
            detailsLink = `project-details.html?slug=${item.slug}`;
        } else {
            detailsLink = `service-details.html?slug=${item.slug}`;
        }
    } else {
        // Fallback to ID
        if (sectionEndpoint === 'projects') {
            detailsLink = `project-details.html?id=${item.id}`;
        } else {
            detailsLink = `service-details.html?id=${item.id}`; // Handle legacy ID lookup if needed
        }
    }

    let badgeHtml = '';
    // If explicitly asked to show category badge
    if (showCategoryBadge) {
        const cat = categoryLabel || item.category || item.service_name || '';
        if (cat) {
            badgeHtml = `<div class="card-badge category-badge">${safe(cat)}</div>`;
        }
    }

    // Optional status badge (usually we only show Active items so maybe skip "Active" badge? User requirement said "Status badge (only show Active items anyway)")
    // Actually if we only show active, status badge is redundant unless requested.
    // "Status badge (only show Active items anyway)" -> implies showing the badge saying "Active"?
    // I'll keep it.
    const statusBadge = `<div class="card-badge status-badge">${safe(status)}</div>`;

    return `
        <article class="service-card-item card">
            <div class="media-wrapper">
                <a href="${detailsLink}" tabindex="-1" class="card-link">
                    <img
                        src="${imgUrl}"
                        alt="${safe(title)}"
                        loading="lazy"
                        class="card-img"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                    />
                    <div class="fallback-placeholder" style="display: none;">
                        <div class="fallback-icon-box"></div>
                        <span>No Image Available</span>
                    </div>
                </a>
                <div class="card-badges-container">
                    ${badgeHtml}
                    ${statusBadge}
                </div>
            </div>
            <div class="card-content glass">
                <h3 class="card-title title"><a href="${detailsLink}">${safe(title)}</a></h3>
                ${cost ? `<div class="card-cost">${safe(cost)}</div>` : ''}
                <p class="card-desc desc">${safe(desc)}</p>
                <div class="card-actions cta">
                    <a href="${detailsLink}" class="cam-btn cam-btn--gold cam-btn--sm">View Details</a>
                </div>
            </div>
        </article>
    `;
}
