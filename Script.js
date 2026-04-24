function showToast(msg, dur = 3000) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), dur);
}
function debounce(fn, d) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), d); }; }

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navLinkEls = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section[id]');

function handleNavScroll() { navbar.classList.toggle('scrolled', window.scrollY > 50); }

function highlightNav() {
    let cur = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - navbar.offsetHeight - 60) cur = s.id; });
    navLinkEls.forEach(l => l.classList.toggle('active', l.dataset.section === cur));
}

function closeMobileMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.addEventListener('click', e => { if (e.target.classList.contains('nav-link')) closeMobileMenu(); });
document.addEventListener('click', e => { if (!navbar.contains(e.target)) closeMobileMenu(); });
window.addEventListener('scroll', debounce(() => { handleNavScroll(); highlightNav(); }, 10), { passive: true });
handleNavScroll();

document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight, behavior: 'smooth' });
    });
});

const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.scroll-reveal').forEach(el => revealObs.observe(el));

const filterTabs = document.querySelectorAll('.filter-tab');
const productCards = document.querySelectorAll('#productsGrid .product-card');

filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        filterTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
        const filter = tab.dataset.filter;
        productCards.forEach((card, i) => {
            const match = filter === 'all' || card.dataset.category === filter;
            if (match) {
                card.classList.remove('hidden');
                setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0) scale(1)'; }, i * 60);
            } else {
                card.style.opacity = '0'; card.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => card.classList.add('hidden'), 350);
            }
        });
    });
});

let cartCount = 0;
const cartBadge = document.querySelector('.cart-badge');
if (cartBadge) cartBadge.style.transition = 'transform 0.3s cubic-bezier(0.68,-0.55,0.265,1.55)';

document.querySelectorAll('.product-add-cart, .slide-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        cartCount++;
        if (cartBadge) { cartBadge.textContent = cartCount; cartBadge.style.transform = 'scale(1.4)'; setTimeout(() => cartBadge.style.transform = '', 300); }
        showToast('✓ تمت إضافة المنتج لسلتك!');
    });
});

document.querySelectorAll('.product-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
        const icon = btn.querySelector('i');
        const active = btn.classList.toggle('active');
        icon.classList.toggle('fas', active); icon.classList.toggle('far', !active);
        showToast(active ? '❤️ اتضافت للمفضلة' : 'اتشالت من المفضلة');
    });
});

document.querySelectorAll('.product-quick-view').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.closest('.product-card')?.querySelector('.product-name')?.textContent || 'المنتج';
        showToast(`🔍 عرض سريع: ${name}`);
    });
});

(function () {
    const slider = document.getElementById('featuredSlider');
    const dotsEl = document.getElementById('sliderDots');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    if (!slider) return;
    const slides = slider.querySelectorAll('.slide');
    const total = slides.length;
    let cur = 0, autoTimer;

    slides.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `شريحة ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
    });

    function updateDots() { dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === cur)); }
    function goTo(idx) { cur = (idx + total) % total; slider.style.transform = `translateX(${cur * 100}%)`; updateDots(); resetAuto(); }
    function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(() => goTo(cur + 1), 5000); }

    prevBtn.addEventListener('click', () => goTo(cur - 1));
    nextBtn.addEventListener('click', () => goTo(cur + 1));

    let tx = 0;
    slider.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => { const d = tx - e.changedTouches[0].clientX; if (Math.abs(d) > 50) d > 0 ? goTo(cur + 1) : goTo(cur - 1); });

    resetAuto();
})();

(function () {
    const track = document.getElementById('testimonialsTrack');
    const dotsEl = document.getElementById('testDots');
    const prevBtn = document.getElementById('testPrev');
    const nextBtn = document.getElementById('testNext');
    if (!track) return;
    const cards = track.querySelectorAll('.testimonial-card');
    const total = cards.length;
    let cur = 0, autoTimer;
    const getVis = () => window.innerWidth <= 768 ? 1 : 3;
    let vis = getVis(), maxIdx = Math.max(0, total - vis);

    function buildDots() {
        dotsEl.innerHTML = '';
        const cnt = Math.ceil(total / vis);
        for (let i = 0; i < cnt; i++) {
            const d = document.createElement('button');
            d.className = 'dot' + (i === 0 ? ' active' : '');
            d.setAttribute('aria-label', `صفحة ${i + 1}`);
            d.addEventListener('click', () => goTo(i * vis));
            dotsEl.appendChild(d);
        }
    }
    function updateDots() { dotsEl.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === Math.floor(cur / vis))); }
    function goTo(idx) { cur = Math.max(0, Math.min(idx, maxIdx)); track.style.transform = `translateX(${cur * (100 / vis)}%)`; updateDots(); resetAuto(); }
    function resetAuto() { clearInterval(autoTimer); autoTimer = setInterval(() => goTo(cur < maxIdx ? cur + 1 : 0), 4500); }

    prevBtn.addEventListener('click', () => goTo(cur > 0 ? cur - 1 : maxIdx));
    nextBtn.addEventListener('click', () => goTo(cur < maxIdx ? cur + 1 : 0));

    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => { const d = tx - e.changedTouches[0].clientX; if (Math.abs(d) > 50) d > 0 ? nextBtn.click() : prevBtn.click(); });

    window.addEventListener('resize', debounce(() => { vis = getVis(); maxIdx = Math.max(0, total - vis); cur = 0; buildDots(); goTo(0); }, 200));
    buildDots(); resetAuto();
})();

(function () {
    const nums = document.querySelectorAll('.stat-number');
    if (!nums.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            const el = e.target, target = parseInt(el.dataset.target), start = performance.now();
            function step(now) {
                const ease = 1 - Math.pow(1 - Math.min((now - start) / 2000, 1), 4);
                el.textContent = Math.round(target * ease).toLocaleString('ar-SA');
                if (ease < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });
    nums.forEach(n => obs.observe(n));
})();

document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
        const isExp = btn.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-question').forEach(b => {
            b.setAttribute('aria-expanded', 'false');
            const ans = document.getElementById(b.getAttribute('aria-controls'));
            if (ans) ans.hidden = true;
        });
        btn.setAttribute('aria-expanded', !isExp);
        const ans = document.getElementById(btn.getAttribute('aria-controls'));
        if (ans) ans.hidden = isExp;
    });
});

(function () {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('formSubmit');
    const successMsg = document.getElementById('formSuccess');
    if (!form) return;

    const fields = [
        { input: document.getElementById('contactName'), error: document.getElementById('nameError'), validate: v => v.trim().length >= 2 ? '' : 'اكتبي اسم صحيح (حرفين على الأقل)' },
        { input: document.getElementById('contactEmail'), error: document.getElementById('emailError'), validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'اكتبي بريد إلكتروني صحيح' },
        { input: document.getElementById('contactSubject'), error: document.getElementById('subjectError'), validate: v => v !== '' ? '' : 'اختاري موضوع الرسالة' },
        { input: document.getElementById('contactMessage'), error: document.getElementById('messageError'), validate: v => v.trim().length >= 10 ? '' : 'اكتبي رسالة لا تقل عن ١٠ حروف' }
    ];

    function validateField({ input, error, validate }) {
        const msg = validate(input.value);
        error.textContent = msg; input.classList.toggle('error', !!msg);
        return !msg;
    }

    fields.forEach(f => {
        f.input.addEventListener('blur', () => validateField(f));
        f.input.addEventListener('input', () => { if (f.input.classList.contains('error')) validateField(f); });
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        if (!fields.every(f => validateField(f))) { form.querySelector('.error')?.focus(); return; }
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'بنبعت...';
        submitBtn.style.opacity = '0.7';
        setTimeout(() => {
            form.reset();
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = 'ابعتي الرسالة';
            submitBtn.style.opacity = '1';
            fields.forEach(f => { f.input.classList.remove('error'); f.error.textContent = ''; });
            if (successMsg) { successMsg.hidden = false; setTimeout(() => successMsg.hidden = true, 6000); }
        }, 1800);
    });
})();

document.getElementById('newsletterForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const inp = this.querySelector('input[type="email"]');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { showToast('⚠️ اكتبي بريد إلكتروني صحيح'); return; }
    showToast('✨ شكراً! اشتركتي في نشرتنا 🎉');
    inp.value = '';
});

const btt = document.getElementById('backToTop');
if (btt) {
    window.addEventListener('scroll', debounce(() => btt.classList.toggle('visible', window.scrollY > 500), 50), { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width / 2) / r.width;
        const dy = (e.clientY - r.top - r.height / 2) / r.height;
        card.style.transform = `translateY(-8px) rotateX(${dy * 4}deg) rotateY(${-dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
});

console.log('%c✦ She Zone', 'color:#E91E8C;font-size:2rem;font-weight:900;');
console.log('%cأناقة بلا حدود', 'color:#7B4F65;font-size:1rem;');