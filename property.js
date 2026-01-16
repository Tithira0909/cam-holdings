import { fetchPublic } from './client-api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const id = params.get('id'); // Fallback

    const identifier = slug || id;

    if (!identifier) {
        document.getElementById('propertyLoading').style.display = 'none';
        document.getElementById('propertyError').style.display = 'grid';
        return;
    }

    try {
        const property = await fetchPublic(`/real-estate/properties/${identifier}`);

        document.title = `${property.title} | CAM Holdings`;

        document.getElementById('pCover').src = property.cover_image_url || 'https://via.placeholder.com/1200x600';
        document.getElementById('pTitle').textContent = property.title;
        document.getElementById('pLocation').textContent = property.location;
        document.getElementById('pPrice').textContent = property.price_budget;
        document.getElementById('pDescription').innerHTML = property.description || property.short_description;

        // Meta info
        const metas = [];
        if (property.bedrooms) metas.push(`${property.bedrooms} Beds`);
        if (property.bathrooms) metas.push(`${property.bathrooms} Baths`);
        if (property.area_sqft) metas.push(`${property.area_sqft} SqFt`);
        document.getElementById('pMeta').textContent = metas.join(' • ');

        if (property.property_type) {
             document.getElementById('pType').textContent = property.property_type;
        }

        // Gallery
        const gallery = document.getElementById('pGallery');
        if (property.gallery_images && property.gallery_images.length > 0) {
            property.gallery_images.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.style.width = '100%';
                img.style.height = '250px';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                gallery.appendChild(img);
            });
        }

        document.getElementById('propertyLoading').style.display = 'none';
        document.getElementById('propertyContent').style.display = 'block';

    } catch (error) {
        console.error(error);
        document.getElementById('propertyLoading').style.display = 'none';
        document.getElementById('propertyError').style.display = 'grid';
    }
});
