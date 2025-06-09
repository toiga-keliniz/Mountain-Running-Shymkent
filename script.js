        // Mobile Menu Toggle
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        const backdrop = document.querySelector('.backdrop');
        const closeMenuBtn = document.querySelector('.close-menu-btn');
        
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.add('active');
            backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        closeMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        backdrop.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Distance Tabs
        const distanceTabs = document.querySelectorAll('.distance-tab');
        const distanceContents = document.querySelectorAll('.distance-content');
        
        distanceTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                distanceTabs.forEach(t => t.classList.remove('active'));
                distanceContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding content
                const distance = tab.getAttribute('data-distance');
                document.getElementById(`${distance}-content`).classList.add('active');
            });
        });
        
        // Countdown Timer
        function updateCountdown() {
            const marathonDate = new Date('October 19, 2025 08:00:00').getTime();
            const now = new Date().getTime();
            const distance = marathonDate - now;
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        }
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
        
        // Navbar Scroll Effect
        window.addEventListener('scroll', () => {
            const navContainer = document.querySelector('.nav-container');
            if (window.scrollY > 50) {
                navContainer.classList.add('nav-scrolled');
            } else {
                navContainer.classList.remove('nav-scrolled');
            }
        });
        
        // Smooth Scrolling for Anchor Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Close mobile menu if open
                    mobileMenu.classList.remove('active');
                    backdrop.classList.remove('active');
                    document.body.style.overflow = '';
                    
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
