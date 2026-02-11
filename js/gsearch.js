// Search functionality for SOLAV Journal
document.addEventListener('DOMContentLoaded', function() {
    // Google Programmable Search Engine ID
    // Get from: https://programmablesearchengine.google.com/
    const SEARCH_ENGINE_ID = '2440ad3918cf84e2e'; // Format: 012345678901234567890:abcdefghijk
    
    // DOM Elements
    const searchToggle = document.getElementById('searchToggle');
    const searchModal = new bootstrap.Modal(document.getElementById('searchModal'));
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const searchResults = document.getElementById('searchResults');
    const searchLoading = document.getElementById('searchLoading');
    const noResults = document.getElementById('noResults');
    const resultStats = document.getElementById('resultStats');
    const searchPagination = document.getElementById('searchPagination');
    
    // Store search state
    let currentQuery = '';
    let searchInstance = null;
    
    // Open search modal
    if (searchToggle) {
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault();
            searchModal.show();
            setTimeout(() => searchInput.focus(), 100);
        });
    }
    
    // Handle search form submission
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                currentQuery = query;
                performSearch(query);
            }
        });
    }
    
    // Perform Google search
    function performSearch(query) {
        // Show loading, hide previous results
        searchLoading.classList.remove('d-none');
        searchResultsContainer.classList.add('d-none');
        noResults.classList.add('d-none');
        searchResults.innerHTML = '';
        
        // For development/testing: Use a mock response
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Show mock results for local testing
            setTimeout(() => {
                showMockResults(query);
            }, 500);
            return;
        }
        
        // For production: Use Google Custom Search
        // Method 1: Using Google CSE iframe (simplest, free)
        const cseUrl = `https://cse.google.com/cse?cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;
        
        // Create iframe for Google CSE results
        searchResults.innerHTML = `
            <iframe src="${cseUrl}" 
                    frameborder="0" 
                    width="100%" 
                    height="600" 
                    style="border: none;"
                    title="SOLAV Journal Search Results">
            </iframe>
        `;
        
        // Alternative: Use Google Programmable Search JSON API (requires API key)
        // If you want to use JSON API, get API key from Google Cloud Console
        // and uncomment below:
        /*
        const apiKey = 'YOUR_API_KEY';
        const startIndex = 1; // For pagination
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&start=${startIndex}&num=10`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                displayResults(data);
            })
            .catch(error => {
                console.error('Search error:', error);
                // Fallback to iframe method
                searchResults.innerHTML = `
                    <iframe src="${cseUrl}" 
                            frameborder="0" 
                            width="100%" 
                            height="600" 
                            style="border: none;">
                    </iframe>
                `;
                searchLoading.classList.add('d-none');
                searchResultsContainer.classList.remove('d-none');
            });
        */
        
        // For now, using iframe method (no API key needed)
        setTimeout(() => {
            searchLoading.classList.add('d-none');
            searchResultsContainer.classList.remove('d-none');
        }, 1000);
    }
    
    // Mock results for local testing
    function showMockResults(query) {
        searchLoading.classList.add('d-none');
        
        // Create mock results
        const mockItems = [
            {
                title: "Advancements in Renewable Energy Technologies",
                link: "https://solav.me/article/123",
                snippet: "Recent breakthroughs in solar panel efficiency and wind turbine design are paving the way for sustainable energy solutions.",
                formattedUrl: "solav.me/article/123"
            },
            {
                title: "Machine Learning Applications in Biomedical Research",
                link: "https://solav.me/article/456",
                snippet: "This study explores how artificial intelligence is transforming disease diagnosis and drug discovery processes.",
                formattedUrl: "solav.me/article/456"
            },
            {
                title: "Interdisciplinary Approaches to Climate Change",
                link: "https://solav.me/article/789",
                snippet: "Combining environmental science, engineering, and social sciences to address global warming challenges.",
                formattedUrl: "solav.me/article/789"
            }
        ];
        
        if (mockItems.length > 0) {
            resultStats.textContent = `About ${mockItems.length} results for "${query}"`;
            
            mockItems.forEach((item, index) => {
                const resultItem = createResultItem(item, index + 1);
                searchResults.appendChild(resultItem);
            });
            
            searchResultsContainer.classList.remove('d-none');
        } else {
            showNoResults();
        }
    }
    
    // Create result item element
    function createResultItem(item, number) {
        const div = document.createElement('a');
        div.href = item.link;
        div.className = 'list-group-item list-group-item-action search-result-item p-3 border-0 border-bottom';
        div.target = '_blank';
        
        div.innerHTML = `
            <div class="d-flex align-items-start">
                <span class="badge bg-primary bg-opacity-10 text-primary me-3 mt-1">${number}</span>
                <div class="flex-grow-1">
                    <h6 class="search-result-title mb-1">${item.title}</h6>
                    <p class="search-result-snippet mb-2">${item.snippet}</p>
                    <small class="search-result-url text-muted">
                        <i class="bi bi-link-45deg"></i> ${item.formattedUrl}
                    </small>
                </div>
                <i class="bi bi-box-arrow-up-right text-muted ms-2"></i>
            </div>
        `;
        
        return div;
    }
    
    // Display results from JSON API
    function displayResults(data) {
        searchLoading.classList.add('d-none');
        
        if (data.error) {
            console.error('Search API Error:', data.error);
            showNoResults();
            return;
        }
        
        if (data.searchInformation && data.items) {
            const totalResults = data.searchInformation.formattedTotalResults;
            const searchTime = data.searchInformation.formattedSearchTime;
            const results = data.items;
            
            resultStats.textContent = `About ${totalResults} results (${searchTime} seconds)`;
            
            results.forEach((item, index) => {
                const resultItem = createResultItem(item, index + 1);
                searchResults.appendChild(resultItem);
            });
            
            searchResultsContainer.classList.remove('d-none');
        } else {
            showNoResults();
        }
    }
    
    function showNoResults() {
        searchResultsContainer.classList.add('d-none');
        searchLoading.classList.add('d-none');
        noResults.classList.remove('d-none');
    }
    
    // Clear search when modal is hidden
    searchModal._element.addEventListener('hidden.bs.modal', function() {
        searchInput.value = '';
        searchResultsContainer.classList.add('d-none');
        searchLoading.classList.add('d-none');
        noResults.classList.add('d-none');
        searchResults.innerHTML = '';
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+K or Cmd+K to open search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchModal.show();
            setTimeout(() => searchInput.focus(), 100);
        }
        
        // Escape to close search modal
        if (e.key === 'Escape' && searchModal._element.classList.contains('show')) {
            searchModal.hide();
        }
    });
    
    // Add keyboard shortcut hint
    if (navigator.platform.indexOf('Mac') > -1) {
        const searchInputHint = document.createElement('small');
        searchInputHint.className = 'text-muted position-absolute end-0 me-3';
        searchInputHint.style.top = '50%';
        searchInputHint.style.transform = 'translateY(-50%)';
        searchInputHint.innerHTML = '⌘K';
        
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(searchInputHint);
    }
});