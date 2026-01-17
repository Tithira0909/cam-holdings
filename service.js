document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id');

    if (!slug && !id) {
        window.location.href = '/index.html';
        return;
    }

    try {
        let serviceType;
        if (slug) {
            const res = await fetch(`/api/admin/service-types/slug/${slug}`);
            if (!res.ok) throw new Error('Service Type not found');
            serviceType = await res.json();
        } else {
             const res = await fetch(`/api/admin/service-types/${id}`);
             if (!res.ok) throw new Error('Service Type not found');
             serviceType = await res.json();
        }

        renderServiceType(serviceType);
        loadSubServices(serviceType.id);

    } catch (error) {
        console.error(error);
        document.getElementById('svcTitle').textContent = 'Service Not Found';
        document.getElementById('svcDesc').textContent = 'The requested service section could not be found.';
    }
});

function renderServiceType(data) {
    document.title = `${data.name} | CAM Holdings`;
    document.getElementById('svcTitle').textContent = data.name;
    document.getElementById('svcDesc').textContent = data.description || '';

    if (data.banner) {
        // Handle full URL or relative path
        let bannerUrl = data.banner;
        if (!bannerUrl.startsWith('http') && !bannerUrl.startsWith('/')) {
             bannerUrl = `/uploads/${data.banner.split(/[/\\]/).pop()}`;
        }
        document.getElementById('svcHero').style.backgroundImage = `url('${bannerUrl}')`;
    }
}

async function loadSubServices(typeId) {
    try {
        // Fetch published services for this type
        const res = await fetch(`/api/admin/services?service_type_id=${typeId}&status=published`);

        if (!res.ok) return;
        const services = await res.json();

        const grid = document.getElementById('subServicesGrid');
        grid.innerHTML = '';

        if (services.length === 0) {
            grid.innerHTML = '<p class="muted" style="grid-column: 1/-1; text-align: center; color: #888;">Coming Soon.</p>';
            return;
        }

        services.forEach(svc => {
             let imgUrl = svc.image_url;
             if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
                 imgUrl = `/uploads/${svc.image_url.split(/[/\\]/).pop()}`;
             }
             if (!imgUrl) imgUrl = 'https://via.placeholder.com/300x200?text=No+Image';

             const safe = (str) => str ? String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;") : '';

             const card = document.createElement('div');
             card.className = 'sub-service-card';
             card.innerHTML = `
                <div class="ssc-media" style="background-image: url('${imgUrl}')"></div>
                <div class="ssc-body">
                    <div class="ssc-title">${safe(svc.name)}</div>
                    <div class="ssc-desc">${safe(svc.description || '')}</div>
                </div>
             `;
             grid.appendChild(card);
        });

    } catch (e) {
        console.error(e);
    }
}
