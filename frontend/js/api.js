/* API Handling */

// Global cache for cars - ONLY used for current page session
let globalAllCars = [];

// Fetch from Backend API
async function fetchCarsFromApi() {
    try {
        const response = await fetch('https://carhive.onrender.com/api/v1/cars/');
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
            console.warn("Backend returned error:", response.status);
            return [];
        }
    } catch (e) {
        console.warn("Backend API unreachable:", e);
        return [];
    }
}
