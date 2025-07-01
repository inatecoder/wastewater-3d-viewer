document.addEventListener('DOMContentLoaded', () => {

    const mainContainer = document.getElementById('main-container');
    const infoPanel = document.getElementById('info-panel');
    const stageName = document.getElementById('stage-name');
    const stageSlide = document.getElementById('stage-slide');
    const closeBtn = document.getElementById('close-btn');

    // Data for the interactive points on the flowchart
    // Positions are in percentages (top, left) to be responsive
    const INTERACTIVE_POINTS = [
        {
            name: 'Screening',
            slide: 'images/01_screening.png',
            position: { top: '38%', left: '28%' }
        },
        {
            name: 'Grit Chamber',
            slide: 'images/02_primary_treatment.png', // Assuming this corresponds to primary treatment
            position: { top: '80%', left: '20%' }
        },
        {
            name: 'Aeration Tank',
            slide: 'images/03_secondary_treatment.png',
            position: { top: '40%', left: '65%' }
        },
        {
            name: 'Secondary Clarifier',
            slide: 'images/04_sludge_management.png', // Sludge is managed from here
            position: { top: '48%', left: '80%' }
        },
        {
            name: 'Disinfection',
            slide: 'images/05_tertiary_treatment.png',
            position: { top: '30%', left: '88%' }
        }
    ];

    // Create and place the info icons on the flowchart
    INTERACTIVE_POINTS.forEach(point => {
        const icon = document.createElement('div');
        icon.className = 'info-icon';
        icon.textContent = 'i'; // Or use an icon font/image
        icon.style.top = point.position.top;
        icon.style.left = point.position.left;

        // Add data to the element to retrieve on click
        icon.dataset.name = point.name;
        icon.dataset.slide = point.slide;

        mainContainer.appendChild(icon);

        // Add click listener to show the info panel
        icon.addEventListener('click', () => {
            stageName.textContent = icon.dataset.name;
            stageSlide.src = icon.dataset.slide;
            infoPanel.style.display = 'block';
        });
    });

    // Add click listener to the close button
    closeBtn.addEventListener('click', () => {
        infoPanel.style.display = 'none';
    });

    // Optional: Close panel when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === infoPanel) {
            infoPanel.style.display = 'none';
        }
    });
});
// Start animation
animate();
