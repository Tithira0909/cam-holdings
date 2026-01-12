// quote.js
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
