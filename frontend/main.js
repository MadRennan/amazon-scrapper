// --- DOM Element Selection ---
const form = document.getElementById('search-form');
const input = document.getElementById('keyword-input');
const resultsContainer = document.getElementById('results-container');
const statusMessage = document.getElementById('status-message');
const searchButton = form.querySelector('button');

// --- NEW: Filter/Sort Controls ---
const sortSelect = document.getElementById('sort-select');
const hideSponsoredCheckbox = document.getElementById('hide-sponsored');

// --- State Management ---
let allProducts = []; // Holds the original fetched data

// --- Event Listeners ---
form.addEventListener('submit', handleSearch);
sortSelect.addEventListener('change', renderProducts);
hideSponsoredCheckbox.addEventListener('change', renderProducts);


/**
 * Handles the form submission event to initiate scraping.
 * @param {Event} e - The form submission event.
 */
async function handleSearch(e) {
  e.preventDefault();
  const keyword = input.value.trim();

  if (!keyword) {
    displayStatus('Please enter a search keyword.', 'error');
    return;
  }

  setLoadingState(true);
  clearResults();
  displayStatus('🚀 Launching headless browser...');

  try {
    // API Call - fetches data from our enhanced backend
    const response = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    allProducts = await response.json(); // Store fetched data in our state

    if (allProducts.length === 0) {
      displayStatus(`No products found for "${keyword}". Try a different term. 🤔`, 'info');
    } else {
      displayStatus(`Found ${allProducts.length} products.`, 'info');
      renderProducts(); // Initial render
    }
  } catch (error) {
    console.error('Fetch error:', error);
    displayStatus(`An error occurred: ${error.message}. Please try again.`, 'error');
  } finally {
    setLoadingState(false);
  }
}

/**
 * Renders products to the DOM based on current filter and sort settings.
 * This function no longer fetches data; it uses the `allProducts` state.
 */
function renderProducts() {
  clearResults();
  
  let productsToRender = [...allProducts];

  // 1. Apply Filtering
  if (hideSponsoredCheckbox.checked) {
    productsToRender = productsToRender.filter(p => !p.isSponsored);
  }

  // Helper function to parse price string (e.g., "$29.99") into a number
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace('$', '').replace(',', ''));
  };

  // 2. Apply Sorting
  const sortBy = sortSelect.value;
  if (sortBy === 'price-asc') {
    productsToRender.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  } else if (sortBy === 'price-desc') {
    productsToRender.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  } else if (sortBy === 'rating') {
    productsToRender.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
  }

  // 3. Render to DOM
  productsToRender.forEach(product => {
    const card = document.createElement('a'); // Card is now a clickable link
    card.className = 'product-card';
    card.href = product.productUrl;
    card.target = '_blank'; // Open in new tab
    card.rel = 'noopener noreferrer';

    card.innerHTML = `
      ${product.isSponsored ? '<span class="sponsored-badge">Sponsored</span>' : ''}
      <img src="${product.imageUrl || 'https://placehold.co/300x200?text=No+Image'}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        ${product.price ? `<p class="product-price">${product.price}</p>` : ''}
        <div class="product-details">
          <span class="product-rating">
            ${product.rating ? `<span class="star">⭐</span> ${product.rating}` : 'No rating'}
          </span>
          <span class="product-reviews">
            ${product.reviews ? `${product.reviews} reviews` : ''}
          </span>
        </div>
      </div>
    `;
    resultsContainer.appendChild(card);
  });
}

// --- UI Helper Functions ---
function displayStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.style.color = type === 'error' ? 'red' : '#555';
}

function clearResults() {
  resultsContainer.innerHTML = '';
}

function setLoadingState(isLoading) {
  searchButton.disabled = isLoading;
  input.disabled = isLoading;
}
