document.addEventListener('DOMContentLoaded', function() {
    // Update time display
    const timeElement = document.querySelector('.time');
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeElement.innerHTML = `<span>LOCAL//</span><span>${hours}:${minutes}:${seconds}</span>`;
    }
    updateTime();
    setInterval(updateTime, 1000);

    // Initialize sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        if (section.id === 'home') { 
            section.classList.add('visible');
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
            section.classList.remove('visible');
        }
    });

    // Navigation handling
    const links = document.querySelectorAll('a[href^="#"]');
    const transitionOverlay = document.getElementById('transition-overlay'); // Get overlay element
    const transitionDuration = 800;

    links.forEach(link => {
        // Exclude resume button from section transition logic
        if (link.id === 'resume-button') return;
        
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent immediate navigation
            
            const targetId = this.getAttribute('href').slice(1);
            const currentActiveSection = document.querySelector('section.visible');
            const targetSection = document.getElementById(targetId);
            
            // Do nothing if clicking the link for the already active section or overlay is busy
            if (!targetSection || targetSection === currentActiveSection || transitionOverlay.classList.contains('active')) {
                return; 
            }
            
            // --- Reset overlay state BEFORE adding .active --- 
            transitionOverlay.classList.remove('sliding-up'); 
            transitionOverlay.classList.remove('active');
            
            // Apply instant move to bottom
            transitionOverlay.classList.add('prepare-slide-in');
            
            // Force reflow to apply the change immediately
            void transitionOverlay.offsetHeight; 
            
            // Remove helper class
            transitionOverlay.classList.remove('prepare-slide-in');
            
            // Force another reflow before adding active (might be needed for some browsers)
            void transitionOverlay.offsetHeight; 
            // --- End Reset --- 
            
            // Start transition: Slide overlay in from bottom
            transitionOverlay.classList.add('active');

            // Wait for overlay to cover screen
            setTimeout(() => {
                // Hide current section
                if (currentActiveSection) {
                    currentActiveSection.classList.add('hidden');
                    currentActiveSection.classList.remove('visible');
                }
                
                // Show the target section
                targetSection.classList.remove('hidden');
                targetSection.classList.add('visible');
                
                // Scroll to top instantly (before revealing)
                window.scrollTo(0, 0);
                
                // Trigger slide out animation (upwards)
                transitionOverlay.classList.add('sliding-up');
                transitionOverlay.classList.remove('active'); // Start sliding up

                // Wait for slide out animation to finish
                setTimeout(() => {
                    // --- Reset overlay to bottom instantly --- 
                    // Apply instant move to bottom and disable transition
                    transitionOverlay.classList.add('prepare-slide-in');
                    
                    // Remove the class that positioned it at the top
                    transitionOverlay.classList.remove('sliding-up'); 
                    
                    // Force reflow might be needed
                    void transitionOverlay.offsetHeight;
                    
                    // Remove the prepare class to re-enable transitions for the next run
                    transitionOverlay.classList.remove('prepare-slide-in');
                    // --- End Reset --- 
                    
                }, transitionDuration);

            }, transitionDuration);
        });
    });

    // --- Grid Transition Cards Interaction (Based on Example) --- 
    const list = document.querySelector('.project-list-container'); // Use new class
    
    if (list) {
        const items = list.querySelectorAll('li'); // Select li elements
        const itemCount = items.length;
        
        if (itemCount > 0) {
             // Set initial active state based on HTML
            const initialActive = list.querySelector('li[data-active="true"]');
            const initialIndex = initialActive ? [...items].indexOf(initialActive) : 0; // Default to first if none active
            items.forEach((item, i) => item.dataset.active = (i === initialIndex).toString());
            const initialCols = new Array(itemCount).fill('1fr').map((_, i) => i === initialIndex ? '10fr' : '1fr').join(' ');
            list.style.setProperty('grid-template-columns', initialCols);
            
            const setIndex = (event) => {
                const closest = event.target.closest('li');
                if (closest) {
                    const index = [...items].indexOf(closest);
                    // Update grid-template-columns based on hovered/focused index
                    const cols = new Array(itemCount)
                      .fill('1fr') // Base size for non-active items
                      .map((_, i) => {
                        items[i].dataset.active = (index === i).toString(); // Update data-active attribute
                        return index === i ? '10fr' : '1fr'; // Active item gets 10fr
                      })
                      .join(' ');
                    list.style.setProperty('grid-template-columns', cols);
                }
            };
            
            // Use pointermove for smoother updates as mouse moves across items
            list.addEventListener('pointermove', setIndex);
            // Use focusin to handle keyboard navigation/focus
            list.addEventListener('focusin', setIndex);
            // Click listener (optional, but good practice)
            list.addEventListener('click', setIndex);
        } else {
             console.warn('No project list items found for interaction.');
        }

    } else {
        console.warn('Project list container not found.');
    }
});