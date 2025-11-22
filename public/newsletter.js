function loadNewsletter() {
    const newsletterHTML = `
        <section id="newsletter" class="section-p1 section-m1">
            <div class="newstext">
                <h4>Signup for NewsLetters</h4>
                <p>Get Email Updates about our latest shop and <span>special offers.</span></p>
            </div>
            <div class="newsform">
                <input type="email" placeholder="Enter your email">
                <button class="normal" type="submit" style="margin-bottom: 0;">Subscribe</button>
            </div>
        </section>
    `;
    document.getElementById('newsletter-container').innerHTML = newsletterHTML;
}

document.addEventListener('DOMContentLoaded', function () {
    loadNewsletter();
});

document.addEventListener('DOMContentLoaded', function () {
    const subscribeButton = document.querySelector('.newsform button');

    if (subscribeButton) {
        subscribeButton.addEventListener('click', function () {
            const emailInput = document.querySelector('.newsform input');
            const email = emailInput.value.trim();

            if (!email) {
                alert('Please enter your email!');
                return;
            }

            try {
                fetch('/newsletter/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {throw new Error(err.error || response.statusText)});
                    }
                    return response.json();
                })
                .then(data => {
                    alert(data.message || "Subscription successful!");
                    emailInput.value = '';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("An error occurred: " + error.message);
                });
            } catch (fetchError) {  // Catch errors that occur *before* the fetch call.
                console.error("Fetch setup error:", fetchError);
                alert("A problem occurred. Please try again later."); // More generic message for setup issues
            }
        });
    } else {
        console.warn("Subscribe button not found. Check your HTML.");
    }
});
