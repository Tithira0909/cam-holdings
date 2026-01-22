// quote.js
document.addEventListener('DOMContentLoaded', loadPropertyDesigns);

async function loadPropertyDesigns() {
    const select = document.getElementById('propertyDesign');
    if (!select) return;

    try {
        const response = await fetch('/api/admin/property-designs/public'); // Using public endpoint added
        if (!response.ok) throw new Error('Failed to load designs');
        const designs = await response.json();

        if (designs.length === 0) {
            select.innerHTML = '<option value="">No active property designs available</option>';
            return;
        }

        select.innerHTML = '<option value="">Select a Design (Optional)</option>';
        designs.forEach(d => {
            const option = document.createElement('option');
            option.value = d.id;
            option.textContent = d.name;
            select.appendChild(option);
        });
    } catch (e) {
        console.error(e);
        select.innerHTML = '<option value="">Error loading designs</option>';
    }
}

async function submitQuote() {
    const form = document.querySelector('.quote-form');
    if (!form) return;

    const btn = form.querySelector('button[type="submit"]');
    const msg = document.getElementById('quoteMsg');
    const originalText = btn.textContent;

    btn.textContent = 'Sending...';
    btn.disabled = true;
    msg.textContent = '';
    msg.className = 'quote-msg';

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Basic mapping
    const payload = {
        first_name: data.name, // Assuming name is full name, we might split or just use as first_name
        email: data.email,
        phone: data.phone,
        type: 'Quotation',
        property_design_id: data.property_design_id || null,
        details: {
            location: data.location,
            service: data.service,
            budget: data.budget,
            timeline: data.timeline,
            style: data.style,
            details: data.details,
            addons: formData.getAll('addons')
        }
    };

    try {
        const response = await fetch('/api/quotations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            msg.textContent = "✅ Request submitted! We’ll contact you shortly to confirm scope and next steps.";
            msg.classList.add('success');
            form.reset();
        } else {
            const res = await response.json();
            msg.textContent = `❌ ${res.message || 'Submission failed.'}`;
            msg.classList.add('error');
        }
    } catch (error) {
        console.error(error);
        msg.textContent = "❌ An error occurred. Please try again.";
        msg.classList.add('error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// Override the onclick in HTML to use this logic if not replaced
window.quoteThanks = submitQuote;
