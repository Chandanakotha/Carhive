/* 
   TURO CLONE - BASIC JAVASCRIPT
   Simple interactions for the UI demo.
   No complex logic or backend calls here.
*/

// --- 1. Toggle the hamburger menu on/off ---
function toggleMenu() {
    var menu = document.getElementById('dropdown-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
    } else {
        menu.style.display = 'none';
    }
}

// --- 2. Change active category pill on click ---
function selectCategory(element) {
    // First, find all pills and remove the active class
    var allPills = document.querySelectorAll('.cat-pill');
    for (var i = 0; i < allPills.length; i++) {
        allPills[i].classList.remove('active');
    }

    // Add active class to the one we just clicked
    element.classList.add('active');

    // In a real app, this would filter the list below.
    console.log("Selected category: " + element.innerText);
}

// --- 3. Manage Login/Signup Modals ---
function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex'; // Use flex to center the content

        // Clear inputs when opening login modal to prevent "past details" look
        if (modalId === 'login-modal') {
            var emailInput = document.getElementById('login-email');
            var passwordInput = document.getElementById('login-password');
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
        }
    }
}

function closeModal() {
    // Close any open modals
    var modals = document.querySelectorAll('.modal-overlay');
    for (var i = 0; i < modals.length; i++) {
        modals[i].style.display = 'none';
    }
}

// --- 4. Image Gallery Switcher (Details Page) ---
function changeImage(thumbElement, newSrc) {
    // 1. Update the main image source
    var mainImg = document.getElementById('main-view');
    if (mainImg) {
        mainImg.src = newSrc;
    }

    // 2. Update active style on thumbnails
    var allThumbs = document.querySelectorAll('.thumb');
    for (var i = 0; i < allThumbs.length; i++) {
        allThumbs[i].classList.remove('active');
    }
    thumbElement.classList.add('active');
}

// --- 5. Simulate Login (for Demo) ---
// --- 5. Simulate Login (Moved to auth.js)
// --- 6. API Logic (Moved to api.js)

// --- 6. Render Dynamic Cars for Discovery ---
async function renderDiscoveryCars(filteredCars) {
    var displayBox = document.getElementById('cars-display-box');
    if (!displayBox) return; // Not on landing page

    var cars = filteredCars;

    // If no filtered list provided, fetch fresh data
    if (!cars) {
        cars = await fetchCarsFromApi();
    }

    // Check login status
    var isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    var totalCars = cars.length;
    var displayCars = cars;

    // Limit to 4 if not logged in
    var showMoreBtn = false;
    if (!isLoggedIn) {
        if (totalCars > 4) {
            displayCars = cars.slice(0, 4);
        }
        // Show button if user is not logged in, regardless of car count (as long as > 0)
        showMoreBtn = true;
    }

    if (displayCars.length > 0) {
        // Clear empty state
        displayBox.innerHTML = '';

        displayCars.forEach(function (car, index) {
            var card = document.createElement('a');
            // Link to details page with current index 
            card.href = 'car-details.html?id=' + car.id;
            card.className = 'car-card';

            var priceText = 'Rs ' + car.price + ' per ' + (car.priceType == 'hour' ? 'hour' : 'day');
            var availabilityDot = car.available !== false ? 'green' : 'red';

            card.innerHTML = `
                <div class="car-img-box" style="position: relative;">
                    <img src="${car.photo}" alt="${car.name}" style="object-fit: cover; width: 100%; height: 100%;">
                    <div style="position: absolute; bottom: 8px; left: 8px; width: 12px; height: 12px; background: ${availabilityDot}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                </div>
                <div class="car-name">${car.name}</div>
                <div class="car-rating">
                    5.0 <span class="star-icon">★</span> (0 trips)
                </div>
                <div class="car-price">${priceText}</div>
            `;
            displayBox.appendChild(card);
        });

        // Populate "Load More" container
        var loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) {
            loadMoreContainer.innerHTML = ''; // Clear previous content

            if (showMoreBtn) {
                var btnWrapper = document.createElement('div');
                btnWrapper.style.backgroundColor = '#007bff'; // Blue box
                btnWrapper.style.padding = '15px 40px';
                btnWrapper.style.borderRadius = '8px';
                btnWrapper.style.display = 'inline-block';
                btnWrapper.style.cursor = 'pointer';
                btnWrapper.onclick = function () { window.location.href = 'login.html'; };

                var btnText = document.createElement('span');
                btnText.style.color = 'white';
                btnText.style.fontWeight = 'bold';
                btnText.style.fontSize = '16px';
                btnText.innerText = 'Login for more';

                btnWrapper.appendChild(btnText);
                loadMoreContainer.appendChild(btnWrapper);
            }
        }
    } else {
        // Show no results message when search returns nothing
        displayBox.innerHTML = '<div id="no-cars-msg" style="padding: 40px; text-align: center; width: 100%; background: #f9f9f9; border-radius: 20px;"><p style="font-size: 18px; font-weight: 600; color: #777;">No cars match your search</p></div>';
        if (document.getElementById('load-more-container')) {
            document.getElementById('load-more-container').innerHTML = '';
        }
    }
}

// --- 6.5 Filter Cars by Category ---
function filterCars(filterType) {
    // Update active pill
    var pills = document.querySelectorAll('.cat-pill');
    for (var i = 0; i < pills.length; i++) {
        pills[i].classList.remove('active');
    }
    event.target.classList.add('active');

    // Use globalAllCars which should be populated
    var filtered = globalAllCars;

    if (filterType === 'available') {
        filtered = globalAllCars.filter(function (car) {
            return car.available !== false;
        });
    } else if (filterType === 'price') {
        filtered = globalAllCars.slice().sort(function (a, b) {
            var priceA = parseFloat(a.price);
            var priceB = parseFloat(b.price);
            return priceB - priceA; // High to low
        });
    }

    renderDiscoveryCars(filtered);
}

// --- 7. Search Functionality ---
// --- 7. Search Functionality ---
async function performSearch() {
    // Ensure we have data
    if (globalAllCars.length === 0) {
        await fetchCarsFromApi();
    }

    var place = document.getElementById('search-place').value.toLowerCase().trim();
    var type = document.getElementById('search-type').value;
    var seaters = document.getElementById('search-seaters').value;

    // Debug
    console.log("Searching for:", { place, type, seaters });

    var filtered = globalAllCars.filter(function (car) {
        // Ensure car.place exists and convert to lowercase for comparison
        var carPlace = (car.place || '').toLowerCase();

        // Logic: if search input is empty, it's a match.
        var matchPlace = !place || carPlace.includes(place);

        // Logic: if type is empty ("Any type"), it matches. Else match exact type.
        // Convert to string to be safe.
        var matchType = !type || (car.type && car.type === type);

        // Logic: if seaters is empty, it matches. Else match exact number chain.
        // Compare as strings.
        var matchSeaters = !seaters || String(car.seaters) === String(seaters);

        return matchPlace && matchType && matchSeaters;
    });

    console.log("Found matches:", filtered.length);

    renderDiscoveryCars(filtered);

    // Scroll to results section
    var resultsSection = document.getElementById('discovery-title');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Run check on load
window.onload = function () {
    checkAuthState();
    renderDiscoveryCars(); // REINSTATED: Needed so the page isn't empty
};

// Simple check to close modal when clicking outside of the content
window.onclick = function (event) {
    var modals = document.querySelectorAll('.modal-overlay');
    for (var i = 0; i < modals.length; i++) {
        if (event.target == modals[i]) {
            modals[i].style.display = "none";
        }
    }
}

