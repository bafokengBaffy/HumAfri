// index.js - Enhanced JavaScript for Humble Africans E-commerce Site

document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // Global Variables and Initializations
    // =============================================
    const cartCount = document.querySelector('.cart-count');
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Initialize cart count
    updateCartCount();
    
    // =============================================
    // Performance Optimizations
    // =============================================
    
    // Lazy load images
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                    
                    // Add fade-in effect
                    img.style.opacity = 0;
                    setTimeout(() => {
                        img.style.transition = 'opacity 0.5s ease';
                        img.style.opacity = 1;
                    }, 50);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.01
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
    
    // =============================================
    // Cart Functionality
    // =============================================
    
    function updateCartCount() {
        if (cartCount) {
            const count = cartItems.reduce((total, item) => total + item.quantity, 0);
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'block' : 'none';
        }
    }
    
    function addToCart(product, quantity = 1, size = '', color = '') {
        const existingItem = cartItems.find(item => 
            item.id === product.id && 
            item.size === size && 
            item.color === color
        );
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cartItems.push({
                ...product,
                quantity,
                size,
                color
            });
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartCount();
        animateCartIcon();
        showToast(`${product.name} added to cart!`);
    }
    
    function animateCartIcon() {
        if (prefersReducedMotion) return;
        
        if (cartCount) {
            cartCount.classList.add('animate-bounce');
            setTimeout(() => {
                cartCount.classList.remove('animate-bounce');
            }, 1000);
        }
    }
    
    // =============================================
    // Toast Notifications
    // =============================================
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // =============================================
    // Product Card Enhancements
    // =============================================
    
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        if (prefersReducedMotion) return;
        
        // Hover effect
        card.addEventListener('mouseenter', () => {
            card.classList.add('product-card-hover');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('product-card-hover');
        });
        
        // Image zoom effect
        const img = card.querySelector('img');
        if (img) {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                img.style.transformOrigin = `${x}px ${y}px`;
                img.classList.add('product-image-zoom');
            });
            
            card.addEventListener('mouseleave', () => {
                img.style.transformOrigin = '';
                img.classList.remove('product-image-zoom');
            });
        }
        
        // Add to cart button
        const addToCartBtn = card.querySelector('.add-to-cart');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const product = {
                    id: card.dataset.id || Math.random().toString(36).substr(2, 9),
                    name: card.querySelector('.product-title').textContent,
                    price: parseFloat(card.querySelector('.product-price').textContent.replace('M', '')),
                    image: card.querySelector('img').src
                };
                
                addToCart(product);
            });
        }
    });
    
    // =============================================
    // Image Gallery Functionality (Product Detail Page)
    // =============================================
    
    const thumbnails = document.querySelectorAll('.product-thumbnail');
    const mainImage = document.querySelector('.product-main-image');
    
    if (thumbnails.length && mainImage) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all thumbnails
                thumbnails.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked thumbnail
                thumb.classList.add('active');
                
                // Crossfade main image
                mainImage.classList.add('image-fade-out');
                setTimeout(() => {
                    mainImage.src = thumb.dataset.image || thumb.href;
                    mainImage.classList.remove('image-fade-out');
                    mainImage.classList.add('image-fade-in');
                    
                    setTimeout(() => {
                        mainImage.classList.remove('image-fade-in');
                    }, 300);
                }, 150);
            });
        });
    }
    
    // =============================================
    // Quantity Input Controls
    // =============================================
    
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        const minusBtn = input.previousElementSibling;
        const plusBtn = input.nextElementSibling;
        
        minusBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            if (value > 1) {
                input.value = value - 1;
                updateCartItem(input);
            }
        });
        
        plusBtn.addEventListener('click', () => {
            let value = parseInt(input.value);
            input.value = value + 1;
            updateCartItem(input);
        });
        
        input.addEventListener('change', () => {
            let value = parseInt(input.value);
            if (isNaN(value) || value < 1) {
                input.value = 1;
            }
            updateCartItem(input);
        });
    });
    
    function updateCartItem(input) {
        const row = input.closest('tr');
        const price = parseFloat(row.querySelector('td:nth-child(3)').textContent.replace('M', ''));
        const quantity = parseInt(input.value);
        const totalCell = row.querySelector('td:nth-child(5)');
        
        totalCell.textContent = `M${(price * quantity).toFixed(2)}`;
        updateOrderSummary();
    }
    
    // =============================================
    // Order Summary Calculations (Cart Page)
    // =============================================
    
    function updateOrderSummary() {
        const subtotalElement = document.querySelector('.order-subtotal');
        const totalElement = document.querySelector('.order-total');
        
        if (subtotalElement && totalElement) {
            let subtotal = 0;
            
            document.querySelectorAll('.cart-table tbody tr').forEach(row => {
                const price = parseFloat(row.querySelector('td:nth-child(3)').textContent.replace('M', ''));
                const quantity = parseInt(row.querySelector('.quantity-input').value);
                subtotal += price * quantity;
            });
            
            const shipping = 100; // Fixed shipping cost
            const total = subtotal + shipping;
            
            subtotalElement.textContent = `M${subtotal.toFixed(2)}`;
            document.querySelector('.order-shipping').textContent = `M${shipping.toFixed(2)}`;
            totalElement.textContent = `M${total.toFixed(2)}`;
        }
    }
    
    // =============================================
    // Form Validations
    // =============================================
    
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            let isValid = true;
            const inputs = form.querySelectorAll('[required]');
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
                
                // Email validation
                if (input.type === 'email' && !isValidEmail(input.value)) {
                    input.classList.add('is-invalid');
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showToast('Please fill in all required fields correctly', 'error');
            } else {
                // Form is valid, show success toast
                if (form.id === 'contactForm') {
                    e.preventDefault();
                    showToast('Your message has been sent successfully!', 'success');
                    form.reset();
                }
            }
        });
    });
    
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // =============================================
    // Smooth Scrolling
    // =============================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // =============================================
    // Mobile Menu Enhancements
    // =============================================
    
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            navbarCollapse.classList.toggle('show');
            
            // Animate hamburger icon
            navbarToggler.classList.toggle('collapsed');
            navbarToggler.setAttribute('aria-expanded', navbarToggler.classList.contains('collapsed') ? 'false' : 'true');
        });
    }
    
    // Close mobile menu when clicking a link
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
                navbarToggler.classList.add('collapsed');
                navbarToggler.setAttribute('aria-expanded', 'false');
            }
        });
    });
    
    // =============================================
    // Sticky Header on Scroll
    // =============================================
    
    const header = document.querySelector('.header');
    if (header) {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll <= 0) {
                header.classList.remove('scrolled', 'scrolled-up');
                return;
            }
            
            if (currentScroll > lastScroll && !header.classList.contains('scrolled-down')) {
                header.classList.remove('scrolled-up');
                header.classList.add('scrolled', 'scrolled-down');
            } else if (currentScroll < lastScroll && header.classList.contains('scrolled-down')) {
                header.classList.remove('scrolled-down');
                header.classList.add('scrolled-up');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // =============================================
    // Page-Specific Initializations
    // =============================================
    
    // Product Detail Page - Image Zoom
    const productImage = document.querySelector('.product-main-image');
    if (productImage) {
        productImage.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) { // Only on desktop
                const { left, top, width, height } = productImage.getBoundingClientRect();
                const x = (e.clientX - left) / width * 100;
                const y = (e.clientY - top) / height * 100;
                
                productImage.style.transformOrigin = `${x}% ${y}%`;
                productImage.classList.add('product-detail-zoom');
            }
        });
        
        productImage.addEventListener('mouseleave', () => {
            productImage.style.transformOrigin = '';
            productImage.classList.remove('product-detail-zoom');
        });
    }
    
    // Cart Page - Remove Item
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const row = button.closest('tr');
            
            if (!prefersReducedMotion) {
                row.classList.add('fade-out-left');
                setTimeout(() => {
                    row.remove();
                    updateOrderSummary();
                }, 300);
            } else {
                row.remove();
                updateOrderSummary();
            }
            
            showToast('Item removed from cart', 'info');
        });
    });
    
    // Cart Page - Clear Cart
    const clearCartBtn = document.querySelector('.clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const rows = document.querySelectorAll('.cart-table tbody tr');
            if (rows.length === 0) return;
            
            if (!prefersReducedMotion) {
                rows.forEach((row, index) => {
                    setTimeout(() => {
                        row.classList.add('fade-out-left');
                        setTimeout(() => {
                            row.remove();
                            if (index === rows.length - 1) {
                                updateOrderSummary();
                                showToast('Cart cleared', 'info');
                            }
                        }, 300);
                    }, index * 100);
                });
            } else {
                rows.forEach(row => row.remove());
                updateOrderSummary();
                showToast('Cart cleared', 'info');
            }
        });
    }
});

// =============================================
// Helper Functions
// =============================================

function debounce(func, wait = 100, immediate = false) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit = 100) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}