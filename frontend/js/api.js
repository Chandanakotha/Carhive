/* API Handling */

// Global cache for cars - ONLY used for current page session, NOT persisted
let globalAllCars = [];

// Fetch from Backend API
// WHY: Backend is the single source of truth. We NEVER cache to localStorage
// because that creates stale data when other users or pages modify the database.
async function fetchCarsFromApi() {
    try {
        const response = await fetch('https://carhive.onrender.com/api/v1/cars');
        if (response.ok) {
            const apiCars = await response.json();
            // Map backend fields to frontend format - PRESERVE BACKEND ID
            globalAllCars = apiCars.map(car => ({
                id: car.id, // CRITICAL: Backend database ID for DELETE/PUT operations
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

            // WHY: We do NOT save to localStorage anymore. 
            // Every page load fetches fresh data from the backend.
            // This ensures deletions and edits are immediately visible everywhere.

            return globalAllCars;
        }
    } catch (e) {
        console.warn("Backend API unreachable:", e);
        return [];
    }

    return [];
}




