// ───── Supabase Cloud Database Configuration ─────
// Paste your Project URL and Anon Public Key from supabase.com (Project Settings > API)
const SUPABASE_URL = 'https://jtjafllyamoepfzbxbal.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1CWgKxywLhXTmPJB2mb5GA_6kA5DjJA';

let supabaseClient = null;
const supabaseLib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
if (supabaseLib && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
        supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✓ Supabase Cloud Database connected successfully!');
    } catch (supaInitErr) {
        console.warn('Supabase initialization warning:', supaInitErr);
    }
}
// ───── Theme Toggle (Dark / Light) ─────
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = themeToggleBtn.querySelector('.theme-icon');
const sunIcon = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;

let isLight = false;
themeToggleBtn.addEventListener('click', () => {
    isLight = !isLight;
    document.body.classList.toggle('light-mode', isLight);
    themeIcon.innerHTML = isLight ? sunIcon : moonIcon;
});

// ───── Scroll Reveal ─────
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

// ───── Hide Mouse Indicator on Scroll ─────
const heroScroll = document.querySelector('.hero__scroll');
let hasScrolled = false;

window.addEventListener('scroll', () => {
    if (!hasScrolled && window.scrollY > 10) {
        hasScrolled = true;
        if (heroScroll) heroScroll.classList.add('hidden');
    }
    if (hasScrolled && window.scrollY <= 10) {
        hasScrolled = false;
        if (heroScroll) heroScroll.classList.remove('hidden');
    }
}, { passive: true });

// ───── Active Rail Link Highlight on Scroll ─────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-rail__link');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
});

// ───── Interactive Code Card (3D Tilt & Cursor Spotlight) ─────
const codeCard = document.getElementById('aboutCodeCard');
if (codeCard) {
    codeCard.addEventListener('mousemove', (e) => {
        const rect = codeCard.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Update cursor spotlight custom properties
        codeCard.style.setProperty('--card-mouse-x', `${mouseX}px`);
        codeCard.style.setProperty('--card-mouse-y', `${mouseY}px`);

        // Amplified 3D tilt calculation
        const centerX = mouseX - rect.width / 2;
        const centerY = mouseY - rect.height / 2;
        const tiltX = (centerY / (rect.height / 2)) * -14;
        const tiltY = (centerX / (rect.width / 2)) * 14;

        codeCard.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-14px) scale3d(1.035, 1.035, 1.035)`;
    });

    codeCard.addEventListener('mouseleave', () => {
        codeCard.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease, border-color 0.5s ease';
        codeCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale3d(1, 1, 1)';
        setTimeout(() => {
            codeCard.style.transition = '';
        }, 500);
    });

    codeCard.addEventListener('mouseenter', () => {
        codeCard.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
    });
}

const copyBtn = document.getElementById('copyCodeBtn');
if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const codeSnippet = `const aditya = {
  name: "Aditya Bagdwal",
  role: "CS Student & Freelancer",
  education: "B.Tech in Computer Science",
  passions: [
    "Continuous Learning",
    "Problem Solving",
    "Web Development",
    "Open Source"
  ],
  hireable: true
};`;
        navigator.clipboard.writeText(codeSnippet).then(() => {
            const copyText = copyBtn.querySelector('.copy-text');
            copyBtn.classList.add('copied');
            copyText.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    });
}

// ───── Contact Form Submission (Backend with Smart Fallback) ─────
// ───── Supabase Helper ─────
function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    const lib = window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
    if (lib && SUPABASE_URL && SUPABASE_ANON_KEY) {
        try {
            supabaseClient = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } catch (e) {
            console.error('Error creating Supabase client:', e);
        }
    }
    return supabaseClient;
}

// ───── Contact Form Submission ─────
const contactForm = document.getElementById('contactForm');
const contactSubmitBtn = document.getElementById('contactSubmitBtn');
const contactFormStatus = document.getElementById('contactFormStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const origBtnContent = contactSubmitBtn.innerHTML;

        contactSubmitBtn.disabled = true;
        contactSubmitBtn.innerHTML = '<span>Sending...</span>';
        contactFormStatus.className = 'contact__form-status';
        contactFormStatus.textContent = '';

        const payload = {
            name: document.getElementById('contact-name').value.trim(),
            email: document.getElementById('contact-user-email').value.trim(),
            subject: document.getElementById('contact-subject').value.trim() || 'Portfolio Inquiry',
            message: document.getElementById('contact-message').value.trim()
        };

        let emailSent = false;
        let isActivationPending = false;
        let dbSaved = false;
        let errorMessage = '';

        // ── 1. Primary: Send email directly to your inbox via FormSubmit ──
        try {
            const formSubmitRes = await fetch('https://formsubmit.co/ajax/bagdwaladitya17@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: payload.name,
                    email: payload.email,
                    _replyto: payload.email,
                    _subject: `[Portfolio Inquiry] ${payload.subject} (from ${payload.name})`,
                    message: payload.message,
                    _captcha: 'false',
                    _template: 'table'
                })
            });

            const result = await formSubmitRes.json();
            if (formSubmitRes.ok && (result.success === 'true' || result.success === true)) {
                emailSent = true;
            } else if (result.message && result.message.toLowerCase().includes('activate')) {
                // First-time FormSubmit submission: sends one-time activation link to inbox
                emailSent = true;
                isActivationPending = true;
                console.info('FormSubmit one-time activation required:', result.message);
            } else {
                errorMessage = result.message || 'Email delivery failed.';
            }
        } catch (mailErr) {
            console.warn('FormSubmit AJAX network issue:', mailErr);
            // If running directly from file:// protocol where browser CORS blocks AJAX, fallback to native submit
            if (window.location.protocol === 'file:') {
                contactForm.submit();
                return;
            }
            errorMessage = mailErr.message || 'Network error sending email.';
        }

        // ── 2. Local Backend Sync (if localhost dev server is running on :5000) ──
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            try {
                const localRes = await fetch('http://localhost:5000/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (localRes.ok) {
                    dbSaved = true;
                    console.log('✓ Message stored in local SQLite backend!');
                }
            } catch (localErr) {
                // Local dev server not running, quietly ignore
            }
        }

        // ── 3. Optional Cloud Database (Supabase) — Non-blocking ──
        try {
            const client = getSupabaseClient();
            if (client) {
                const { error: supaErr } = await client
                    .from('messages')
                    .insert([{
                        name: payload.name,
                        email: payload.email,
                        subject: payload.subject,
                        message: payload.message
                    }]);

                if (!supaErr) {
                    dbSaved = true;
                    console.log('✓ Message recorded in Supabase cloud database!');
                } else {
                    console.warn('Supabase insert failed:', supaErr.message);
                }
            }
        } catch (supaErr) {
            console.warn('Supabase sync skipped/failed:', supaErr.message);
        }

        // ── 4. Status feedback to the user ──
        if (isActivationPending) {
            contactFormStatus.textContent = '✓ Activation email sent! Check bagdwaladitya17@gmail.com and click "Activate Form" once.';
            contactFormStatus.classList.add('success');
            contactForm.reset();
        } else if (emailSent || dbSaved) {
            contactFormStatus.textContent = '✓ Message delivered to inbox, wait for response!';
            contactFormStatus.classList.add('success');
            contactForm.reset();
        } else {
            // Provide a direct mailto fallback if network or email services failed
            const mailtoUrl = `mailto:bagdwaladitya17@gmail.com?subject=${encodeURIComponent(payload.subject)}&body=${encodeURIComponent('From: ' + payload.name + ' (' + payload.email + ')\n\n' + payload.message)}`;
            contactFormStatus.innerHTML = `Error: ${errorMessage || 'Unable to deliver message.'} <a href="${mailtoUrl}" style="color:var(--accent);text-decoration:underline;margin-left:6px;" target="_blank">Click here to send via email client</a>`;
            contactFormStatus.classList.add('error');
        }

        contactSubmitBtn.disabled = false;
        contactSubmitBtn.innerHTML = origBtnContent;
    });
}

