/* main.js - UI Interactions */

async function renderDiscoveryCars(filteredCars = null) {
    const displayBox = document.getElementById('cars-display-box');
    if (!displayBox) return;

    let cars = filteredCars || await fetchCarsFromApi(localStorage.getItem('token'));

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    let displayCars = cars;
    let showMoreBtn = false;

    if (!isLoggedIn && cars.length > 4) {
        displayCars = cars.slice(0, 4);
        showMoreBtn = true;
    }

    displayBox.innerHTML = '';
    if (displayCars.length === 0) {
        displayBox.innerHTML = `<div style="padding:40px;text-align:center;background:#f9f9f9;border-radius:20px;">
            <p style="font-size:18px;font-weight:600;color:#777;">No cars match your search</p>
        </div>`;
        if (document.getElementById('load-more-container'))
            document.getElementById('load-more-container').innerHTML = '';
        return;
    }

    displayCars.forEach(car => {
        const card = document.createElement('a');
        card.href = 'car-details.html?id=' + car.id;
        card.className = 'car-card';
        const priceText = 'Rs ' + car.price + ' per ' + (car.priceType == 'hour' ? 'hour' : 'day');
        const availabilityDot = car.available !== false ? 'green' : 'red';
        card.innerHTML = `
            <div class="car-img-box" style="position: relative;">
                <img src="${car.photo}" alt="${car.name}" style="object-fit: cover; width: 100%; height: 100%;">
                <div style="position:absolute;bottom:8px;left:8px;width:12px;height:12px;background:${availabilityDot};border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2)"></div>
            </div>
            <div class="car-name">${car.name}</div>
            <div class="car-rating">5.0 <span class="star-icon">★</span> (0 trips)</div>
            <div class="car-price">${priceText}</div>
        `;
        displayBox.appendChild(card);
    });

    const loadMoreContainer = document.getElementById('load-more-container');
    if (loadMoreContainer) {
        loadMoreContainer.innerHTML = '';
        if (showMoreBtn) {
            const btnWrapper = document.createElement('div');
            btnWrapper.style.backgroundColor = '#007bff';
            btnWrapper.style.padding = '15px 40px';
            btnWrapper.style.borderRadius = '8px';
            btnWrapper.style.display = 'inline-block';
            btnWrapper.style.cursor = 'pointer';
            btnWrapper.onclick = () => { window.location.href = 'login.html'; };
            const btnText = document.createElement('span');
            btnText.style.color = 'white';
            btnText.style.fontWeight = 'bold';
            btnText.style.fontSize = '16px';
            btnText.innerText = 'Login for more';
            btnWrapper.appendChild(btnText);
            loadMoreContainer.appendChild(btnWrapper);
        }
    }
}

// Filter Cars by Category
function filterCars(filterType, event) {
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach(pill => pill.classList.remove('active'));
    if (event) event.target.classList.add('active');

    let filtered = globalAllCars;
    if (filterType === 'available') {
        filtered = globalAllCars.filter(car => car.available !== false);
    } else if (filterType === 'price') {
        filtered = globalAllCars.slice().sort((a, b) => b.price - a.price);
    }
    renderDiscoveryCars(filtered);
}

// Search
async function performSearch() {
    if (globalAllCars.length === 0) await fetchCarsFromApi();

    const place = document.getElementById('search-place').value.toLowerCase().trim();
    const type = document.getElementById('search-type').value;
    const seaters = document.getElementById('search-seaters').value;

    const filtered = globalAllCars.filter(car => {
        const carPlace = (car.place || '').toLowerCase();
        const matchPlace = !place || carPlace.includes(place);
        const matchType = !type || (car.type && car.type === type);
        const matchSeaters = !seaters || String(car.seaters) === String(seaters);
        return matchPlace && matchType && matchSeaters;
    });

    renderDiscoveryCars(filtered);

    const resultsSection = document.getElementById('discovery-title');
    if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Run on page load
window.onload = () => {
    checkAuthState();
    renderDiscoveryCars();
};

// Close modal when clicking outside
window.onclick = function (event) {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        if (event.target === modal) modal.style.display = "none";
    });
};
