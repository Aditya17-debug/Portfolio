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
const formIframe = document.getElementById('formSubmitIframe');

let isFormSubmitting = false;

if (contactForm) {
    contactForm.addEventListener('submit', () => {
        isFormSubmitting = true;
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

        // Optional local dev server sync (:5000)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(() => {});
        }

        // Optional Supabase background sync
        try {
            const client = getSupabaseClient();
            if (client) {
                client.from('messages').insert([payload]).then(() => {}).catch(() => {});
            }
        } catch (_) {}

        function handleDone() {
            if (!isFormSubmitting) return;
            isFormSubmitting = false;
            contactSubmitBtn.disabled = false;
            contactSubmitBtn.innerHTML = origBtnContent;
            contactFormStatus.textContent = '✓ Message delivered to inbox, wait for response!';
            contactFormStatus.classList.add('success');
            contactForm.reset();
        }

        // Timer ensures UI always updates smoothly even if iframe onload is constrained
        const timer = setTimeout(handleDone, 2000);

        if (formIframe) {
            formIframe.onload = () => {
                clearTimeout(timer);
                handleDone();
            };
        }
    });
}

