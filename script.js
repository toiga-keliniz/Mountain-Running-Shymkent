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



        // Distance Tabs with Video Control
const distanceTabs = document.querySelectorAll('.distance-tab');
const distanceContents = document.querySelectorAll('.distance-content');

// Функция для запуска видео в активной вкладке при первой загрузке страницы
function playInitialVideo() {
    const activeContent = document.querySelector('.distance-content.active');
    if (activeContent) {
        const video = activeContent.querySelector('video');
        if (video) {
            video.play().catch(error => {
                console.error("Initial video play failed:", error);
            });
        }
    }
}

distanceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // 1. Сначала останавливаем и сбрасываем ВСЕ видео
        distanceContents.forEach(content => {
            const video = content.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0; // Сбрасываем видео на начало
            }
        });

        // 2. Убираем класс 'active' со всех вкладок и контентов
        distanceTabs.forEach(t => t.classList.remove('active'));
        distanceContents.forEach(c => c.classList.remove('active'));

        // 3. Добавляем класс 'active' к нажатой вкладке
        tab.classList.add('active');

        // 4. Показываем соответствующий контент и запускаем в нем видео
        const distance = tab.getAttribute('data-distance');
        const activeContent = document.getElementById(`${distance}-content`);
        
        if (activeContent) {
            activeContent.classList.add('active');
            const activeVideo = activeContent.querySelector('video');
            if (activeVideo) {
                // play() возвращает Promise, его лучше обрабатывать
                activeVideo.play().catch(error => {
                    console.error("Video play failed:", error);
                    // Эта ошибка может возникнуть, если пользователь еще не взаимодействовал со страницей
                });
            }
        }
    });
});

// Запускаем видео в активной вкладке (5км) при первой загрузке страницы
document.addEventListener('DOMContentLoaded', playInitialVideo);
