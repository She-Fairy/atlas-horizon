class MapGallery {
    constructor() {
        this.maps = [];
        this.filteredMaps = [];
        this.currentPage = 1;
        this.mapsPerPage = 12;
        this.filters = {
            search: '',
            gamemode: 'all',
            environment: 'all'
        };

        this.init();
    }

    async init() {
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Load maps data
        await this.loadMaps();
        
        // Apply initial filters and render
        this.applyFilters();
        this.renderMaps();
    }

    initializeEventListeners() {
        // Search input
        const searchInput = document.querySelector('.search-bar input');
        searchInput.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.currentPage = 1;
            this.applyFilters();
            this.renderMaps();
        });

        // Filter selects
        const filterSelects = document.querySelectorAll('.filter-controls select');
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                this.filters[e.target.name] = e.target.value;
                this.currentPage = 1;
                this.applyFilters();
                this.renderMaps();
            });
        });

        // Pagination buttons
        const prevBtn = document.querySelector('.pagination-btn[data-action="prev"]');
        const nextBtn = document.querySelector('.pagination-btn[data-action="next"]');
        
        prevBtn.addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderMaps();
            }
        });

        nextBtn.addEventListener('click', () => {
            const maxPage = Math.ceil(this.filteredMaps.length / this.mapsPerPage);
            if (this.currentPage < maxPage) {
                this.currentPage++;
                this.renderMaps();
            }
        });
    }

    async loadMaps() {
        try {
            // In a real application, this would be an API call
            // For now, we'll use sample data
            this.maps = [
                {
                    id: 1,
                    name: 'Desert Storm',
                    gamemode: 'Gem_Grab',
                    environment: 'Mine',
                    thumbnail: 'path/to/thumbnail1.jpg',
                    author: 'Player1',
                    date: '2024-03-15'
                },
                // Add more sample maps here
            ];
        } catch (error) {
            console.error('Error loading maps:', error);
            // Show error message to user
            this.showError('Failed to load maps. Please try again later.');
        }
    }

    applyFilters() {
        this.filteredMaps = this.maps.filter(map => {
            const matchesSearch = map.name.toLowerCase().includes(this.filters.search) ||
                                map.author.toLowerCase().includes(this.filters.search);
            const matchesGamemode = this.filters.gamemode === 'all' || map.gamemode === this.filters.gamemode;
            const matchesEnvironment = this.filters.environment === 'all' || map.environment === this.filters.environment;

            return matchesSearch && matchesGamemode && matchesEnvironment;
        });
    }

    renderMaps() {
        const mapGrid = document.querySelector('.map-grid');
        const paginationInfo = document.querySelector('.pagination-info');
        const prevBtn = document.querySelector('.pagination-btn[data-action="prev"]');
        const nextBtn = document.querySelector('.pagination-btn[data-action="next"]');

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.mapsPerPage;
        const endIndex = startIndex + this.mapsPerPage;
        const currentMaps = this.filteredMaps.slice(startIndex, endIndex);
        const totalPages = Math.ceil(this.filteredMaps.length / this.mapsPerPage);

        // Update pagination info
        paginationInfo.textContent = `Page ${this.currentPage} of ${totalPages}`;
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;

        // Clear existing maps
        mapGrid.innerHTML = '';

        // Render maps
        currentMaps.forEach(map => {
            const mapCard = this.createMapCard(map);
            mapGrid.appendChild(mapCard);
        });

        // Show no results message if needed
        if (this.filteredMaps.length === 0) {
            mapGrid.innerHTML = `
                <div class="no-results">
                    <p>No maps found matching your criteria.</p>
                </div>
            `;
        }
    }

    createMapCard(map) {
        const card = document.createElement('div');
        card.className = 'map-card';
        card.innerHTML = `
            <div class="map-preview">
                <img src="${map.thumbnail}" alt="${map.name}" loading="lazy">
            </div>
            <div class="map-info">
                <h3>${map.name}</h3>
                <div class="map-meta">
                    <span>${map.gamemode}</span>
                    <span>${map.environment}</span>
                </div>
                <div class="map-meta">
                    <span>By ${map.author}</span>
                    <span>${new Date(map.date).toLocaleDateString()}</span>
                </div>
            </div>
        `;

        // Add click event to open map
        card.addEventListener('click', () => {
            this.openMap(map.id);
        });

        return card;
    }

    openMap(mapId) {
        // In a real application, this would navigate to the map editor
        // or open a modal with map details
        console.log(`Opening map ${mapId}`);
        // Example: window.location.href = `/mapmaker.html?id=${mapId}`;
    }

    showError(message) {
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.querySelector('.main-content').prepend(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
}

// Initialize the gallery when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MapGallery();
}); 