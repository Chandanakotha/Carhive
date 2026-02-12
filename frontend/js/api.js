/* api.js - API Handling */

// Global cache for cars
let globalAllCars = [];

/**
 * Fetch cars from backend API
 * Returns mapped array of cars
 */
async function fetchCarsFromApi(token = null) {
    try {
        const headers = {};
        if (token) headers['Authorization'] = 'Bearer ' + token;

        const response = await fetch('https://carhive.onrender.com/api/v1/cars/', { headers });

        if (response.ok) {
            const apiCars = await response.json();
            globalAllCars = apiCars.map(car => ({
                id: car.id,
                name: car.name,
                place: car.location,
                contact: car.contact,
                type: car.car_type || 'Sedan',
                seaters: String(car.seaters || '4'),
                price: car.price_per_day,
                priceType: car.price_type || 'day',
                features: car.features,
                photo: car.photo || 'images/default-car.png',
                host: car.host || (car.owner && car.owner.full_name) || 'Car Owner',
                available: car.availability_status
            }));

            return globalAllCars;
        } else {
            console.warn('API fetchCars failed:', response.statusText);
        }
    } catch (err) {
        console.error("Backend API unreachable:", err);
    }

    return [];
}
