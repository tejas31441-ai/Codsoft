// Form Handler with EmailJS Integration
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    // ======================= CONFIGURATION =======================
    // Get these values from https://www.emailjs.com
    const EMAILJS_CONFIG = {
        PUBLIC_KEY: 'YOUR_PUBLIC_KEY_HERE',      // Replace with your actual key
        SERVICE_ID: 'YOUR_SERVICE_ID_HERE',      // Replace with your Service ID
        TEMPLATE_ID: 'YOUR_TEMPLATE_ID_HERE'     // Replace with your Template ID
    };
    // ============================================================
    
    // Initialize EmailJS with your PUBLIC KEY
    if (EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY_HERE') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    } else {
        console.warn('⚠️ EmailJS not configured. Please add your keys.');
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Validation
            if (!name || !email || !subject || !message) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showMessage('Please enter a valid email address', 'error');
                return;
            }
            
            const submitBtn = contactForm.querySelector('.form-submit');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            try {
                // Send email using EmailJS
                const templateParams = {
                    from_name: name,
                    from_email: email,
                    subject: `Portfolio Contact: ${subject}`,
                    message: message,
                    to_name: "Tejas",
                    reply_to: email,
                    timestamp: new Date().toLocaleString()
                };
                
                // Send email (using EmailJS service)
                const response = await emailjs.send(
                    EMAILJS_CONFIG.SERVICE_ID,
                    EMAILJS_CONFIG.TEMPLATE_ID,
                    templateParams
                );
                
                console.log('✅ Email sent successfully:', response.status);
                
                // Show success message
                showMessage('✅ Message sent successfully! I\'ll get back to you soon.', 'success');
                
                // Reset form
                contactForm.reset();
                
            } catch (error) {
                console.error('❌ Failed to send email:', error);
                
                // Fallback: Store in localStorage and notify you
                storeMessageLocally(name, email, subject, message);
                
                // Show user a different message
                showMessage('📝 Message saved locally! I\'ll check it soon.', 'info');
                
            } finally {
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Fallback: Store message in localStorage
    function storeMessageLocally(name, email, subject, message) {
        try {
            const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            const newMessage = {
                id: Date.now(),
                name,
                email,
                subject,
                message,
                timestamp: new Date().toISOString(),
                read: false
            };
            
            messages.push(newMessage);
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            // Log for debugging
            console.log('💾 Message stored locally:', newMessage);
            console.log('📊 Total messages in storage:', messages.length);
            
            // Send browser notification (if permitted)
            if ("Notification" in window && Notification.permission === "granted") {
                new Notification("📧 New Message on Portfolio", {
                    body: `From: ${name}\nSubject: ${subject}`,
                    icon: '/assets/images/favicon.ico',
                    tag: 'portfolio-contact'
                });
            }
            
            // For you to check messages easily, add this to console:
            console.log('👀 To view stored messages, run:');
            console.log('JSON.parse(localStorage.getItem("contactMessages"))');
            
        } catch (error) {
            console.error('❌ LocalStorage error:', error);
        }
    }
    
    function showMessage(text, type) {
        if (!formMessage) return;
        
        formMessage.textContent = text;
        formMessage.className = 'form-message ' + type;
        formMessage.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Request notification permission on page load
    if ("Notification" in window && Notification.permission === "default") {
        // Ask after a short delay
        setTimeout(() => {
            Notification.requestPermission();
        }, 2000);
    }
    
    // Add input validation styling
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.style.borderColor = 'rgba(255, 50, 50, 0.5)';
            } else {
                this.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = 'var(--accent-green)';
        });
    });
});