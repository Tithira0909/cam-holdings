// contact.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Map form fields to API expected fields
        // API expects: name, email, phone, subject, message
        // Form has: name, email, phone, service, location, budget, message
        // We will combine service/location/budget into subject or message?
        // User instructions for DB schema: subject, message.
        // Let's use 'service' as subject, or a combination.
        // Or just map what fits.

        const payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.service || 'Inquiry',
            message: `Location: ${data.location}\nBudget: ${data.budget}\n\nMessage:\n${data.message}`
        };

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Thank you! We have received your inquiry.');
                form.reset();
            } else {
                const res = await response.json();
                alert(res.message || 'Failed to send inquiry.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
});
