# Carvia 🚗

### *Find the right car, wherever you are.*

Carvia is a modern peer-to-peer car rental platform inspired by industry leaders. It connects car owners (Dealers) with travelers (Clients) through a seamless digital experience.

---

## 🚀 What Problem Does Carvia Solve?

Carvia simplifies the car rental process by:
- **Removing the counter**: Rent directly from local owners.
- **Providing transparency**: View detailed car specs, real photos, and clear pricing.
- **Empowering owners**: Allowing individuals to list their vehicles and earn income.

---

## ✨ Key Features

### 🏢 For Dealers (Car Owners)
- **Easy Listing**: Add a car in seconds with photos and details.
- **Inventory Management**: View, edit, or delete listings from a personal dashboard.
- **Availability Control**: Toggle car availability instantly.

### 👤 For Clients (Renters)
- **Advanced Search**: Filter by location, car type, and seat capacity.
- **Guest Preview**: Browse top listings even without an account.
- **Seamless Booking**: Inspect detailed car profiles and book directly.

---

## 🛠️ Technology Stack

### **Frontend** (Client-Side)
- **HTML5**: semantic structure.
- **CSS3**: Custom "Dark Ash" design system (no external frameworks).
- **Vanilla JavaScript**: Dynamic rendering, API communication, and state management.

### **Backend** (Server-Side)
- **Python (FastAPI)**: High-performance API framework.
- **SQLAlchemy (Async)**: Modern ORM for database interactions.
- **Pydantic**: Robust data validation and serialization.
- **PostgreSQL / SQLite**: Relational database for persistent storage.

---

## 🏗️ High-Level Architecture

Carvia follows a **RESTful Client-Server** architecture:

1.  **Client**: The browser runs the frontend files (`index.html`, `js/main.js`). It creates a dynamic Single Page Application (SPA) feel.
2.  **API**: The FastAPI server receives requests (e.g., `GET /cars/`).
3.  **Database**: The server queries the database and returns structured JSON data.

---

## 🏃 How to Run Locally

### Prerequisites
- Python 3.10+
- A modern web browser

### Step 1: Start the Backend
1.  Open your terminal/command prompt.
2.  Navigate to the `backend` folder.
3.  Install dependencies: `pip install -r requirements.txt`
4.  Initialize the database: `python reset_database.py`
5.  Start the server: `uvicorn app.main:app --reload`
    *   *Server runs at: `https://carhive.onrender.com/api/v1`*

### Step 2: Launch the Frontend
1.  Navigate to the `frontend` folder.
2.  Open `index.html` in your browser.
    *   *Tip: Use "Open with Live Server" in VS Code for the best experience.*

---

## � API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/cars/` | Retrieve all available cars |
| `POST` | `/api/v1/cars/` | Create a new car listing |
| `GET` | `/api/v1/cars/{id}` | Get details of a specific car |
| `PUT` | `/api/v1/cars/{id}` | Update car details |
| `DELETE` | `/api/v1/cars/{id}` | Remove a car listing |

---

## 📸 Screenshots

*(Placeholders for future screenshots)*

*   **Homepage**: Hero banner with search functionality.
*   **Car Listing**: Grid view of available vehicles.
*   **Car Details**: Detailed view with specs and booking options.
*   **Add Car Form**: The dealer interface for listing vehicles.

---

## ⚠️ Disclaimer
*Carvia is a portfolio project model inspired by modern car-rental platforms. It is designed for educational and demonstration purposes.*

