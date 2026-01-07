document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const formData = new FormData(contactForm);
        const data = {
            client_name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            subject: `Inquiry: ${formData.get('service')} - ${formData.get('budget')}`, // Combining fields for subject
            message: formData.get('message') + `\n\nLocation: ${formData.get('location')}` // Appending location to message
        };

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Thank you! Your message has been sent successfully.');
                contactForm.reset();
            } else {
                const res = await response.json();
                alert(res.message || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
});
