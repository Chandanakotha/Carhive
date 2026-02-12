/* TURO CLONE - BASIC JAVASCRIPT */

// 1. Toggle the hamburger menu
function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    if (!menu) return;
    menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

// 2. Select category safely
function selectCategory(element) {
    if (!element) return;
    const allPills = document.querySelectorAll('.cat-pill');
    allPills.forEach(p => p.classList.remove('active'));
    element.classList.add('active');
}

// 3. Open/close modals
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';

    if (modalId === 'login-modal') {
        document.getElementById('login-email')?.value = '';
        document.getElementById('login-password')?.value = '';
    }
}

function closeModal() {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.style.display = 'none');
}

// 4. Image gallery switcher
function changeImage(thumbElement, newSrc) {
    const mainImg = document.getElementById('main-view');
    if (mainImg) mainImg.src = newSrc;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumbElement?.classList.add('active');
}

// 5. Render cars dynamically
async function renderDiscoveryCars(filteredCars) {
    try {
        const displayBox = document.getElementById('cars-display-box');
        if (!displayBox) return;

        let cars = filteredCars || await fetchCarsFromApi();
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        let displayCars = cars;

        let showMoreBtn = false;
        if (!isLoggedIn && cars.length > 4) {
            displayCars = cars.slice(0, 4);
            showMoreBtn = true;
        }

        displayBox.innerHTML = '';
        displayCars.forEach(car => {
            const card = document.createElement('a');
            card.href = 'car-details.html?id=' + car.id;
            card.className = 'car-card';

            const priceText = 'Rs ' + car.price + ' per ' + (car.priceType === 'hour' ? 'hour' : 'day');
            const availabilityDot = car.available !== false ? 'green' : 'red';

            card.innerHTML = `
                <div class="car-img-box" style="position: relative;">
                    <img src="${car.photo}" alt="${car.name}" style="object-fit: cover; width: 100%; height: 100%;">
                    <div style="position: absolute; bottom: 8px; left: 8px; width: 12px; height: 12px; background: ${availabilityDot}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
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
                btnWrapper.style = 'background-color: #007bff; padding: 15px 40px; border-radius: 8px; display: inline-block; cursor: pointer;';
                btnWrapper.onclick = () => window.location.href = 'login.html';
                const btnText = document.createElement('span');
                btnText.style = 'color:white;font-weight:bold;font-size:16px;';
                btnText.innerText = 'Login for more';
                btnWrapper.appendChild(btnText);
                loadMoreContainer.appendChild(btnWrapper);
            }
        }

        if (cars.length === 0) {
            displayBox.innerHTML = `<div id="no-cars-msg" style="padding:40px;text-align:center;width:100%;background:#f9f9f9;border-radius:20px;">
                <p style="font-size:18px;font-weight:600;color:#777;">No cars match your search</p>
            </div>`;
            loadMoreContainer && (loadMoreContainer.innerHTML = '');
        }
    } catch (err) {
        console.error("Error rendering cars:", err);
    }
}

// 6. Filter cars safely
function filterCars(filterType, event) {
    try {
        if (event?.target) {
            document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
            event.target.classList.add('active');
        }

        let filtered = globalAllCars;
        if (filterType === 'available') {
            filtered = globalAllCars.filter(car => car.available !== false);
        } else if (filterType === 'price') {
            filtered = globalAllCars.slice().sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        }

        renderDiscoveryCars(filtered);
    } catch (err) {
        console.error("Filter error:", err);
    }
}

// 7. Search cars
async function performSearch() {
    if (globalAllCars.length === 0) await fetchCarsFromApi();
    const place = document.getElementById('search-place')?.value.toLowerCase().trim() || '';
    const type = document.getElementById('search-type')?.value || '';
    const seaters = document.getElementById('search-seaters')?.value || '';

    const filtered = globalAllCars.filter(car => {
        const carPlace = (car.place || '').toLowerCase();
        const matchPlace = !place || carPlace.includes(place);
        const matchType = !type || (car.type && car.type === type);
        const matchSeaters = !seaters || String(car.seaters) === String(seaters);
        return matchPlace && matchType && matchSeaters;
    });

    renderDiscoveryCars(filtered);
    document.getElementById('discovery-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 8. Initialize page safely
window.onload = () => {
    try {
        checkAuthState();
        renderDiscoveryCars();
    } catch (err) {
        console.error("Error on page load:", err);
    }
};

// 9. Close modals on outside click
window.onclick = event => {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        if (event.target === modal) modal.style.display = "none";
    });
};
