const cars = [
  {
    id: "porsche-911",
    name: "Porsche 911 Carrera",
    subtitle: "The Sunday driver",
    category: "Luxury",
    type: "Coupe",
    price: 189,
    rating: "4.98",
    reviews: 124,
    seats: 2,
    transmission: "Automatic",
    location: "Los Angeles",
    tag: "Guest favorite",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80",
    alt: "Silver Porsche sports car"
  },
  {
    id: "tesla-model-y",
    name: "Tesla Model Y",
    subtitle: "The all-rounder",
    category: "Electric",
    type: "Electric SUV",
    price: 96,
    rating: "4.92",
    reviews: 208,
    seats: 5,
    transmission: "Automatic",
    location: "San Francisco",
    tag: "Electric",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80",
    alt: "White electric sedan parked in the city"
  },
  {
    id: "range-rover-sport",
    name: "Range Rover Sport",
    subtitle: "The weekend escape",
    category: "SUV",
    type: "Premium SUV",
    price: 149,
    rating: "4.95",
    reviews: 86,
    seats: 5,
    transmission: "Automatic",
    location: "New York",
    tag: "Premium pick",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80",
    alt: "Black luxury SUV on a country road"
  },
  {
    id: "mini-cooper",
    name: "MINI Cooper",
    subtitle: "The city slicker",
    category: "Compact",
    type: "Compact",
    price: 58,
    rating: "4.89",
    reviews: 173,
    seats: 4,
    transmission: "Automatic",
    location: "Chicago",
    tag: "Easy around town",
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80",
    alt: "Red compact car in a city"
  },
  {
    id: "ford-bronco",
    name: "Ford Bronco",
    subtitle: "The trail seeker",
    category: "SUV",
    type: "Off-road SUV",
    price: 112,
    rating: "4.91",
    reviews: 97,
    seats: 5,
    transmission: "Automatic",
    location: "Miami",
    tag: "Ready for anything",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=900&q=80",
    alt: "Adventure-ready four-wheel-drive vehicle"
  },
  {
    id: "mercedes-c-class",
    name: "Mercedes-Benz C-Class",
    subtitle: "The smooth operator",
    category: "Luxury",
    type: "Luxury sedan",
    price: 128,
    rating: "4.96",
    reviews: 142,
    seats: 5,
    transmission: "Automatic",
    location: "New York",
    tag: "A little extra",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
    alt: "Black luxury sedan"
  }
];

const state = {
  category: "All",
  location: "any",
  sortByPrice: false,
  dates: null,
  selectedCar: null,
  favorites: new Set()
};

const carGrid = document.querySelector("#car-grid");
const resultsMessage = document.querySelector("#results-message");
const searchForm = document.querySelector("#search-form");
const pickupInput = document.querySelector("#pickup-date");
const dropoffInput = document.querySelector("#dropoff-date");
const locationInput = document.querySelector("#location");
const bookingDialog = document.querySelector("#booking-dialog");
const reservationForm = document.querySelector("#reservation-form");
const toast = document.querySelector("#toast");
let toastTimer;

const today = new Date();
const todayString = formatDateInput(today);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
pickupInput.min = todayString;
dropoffInput.min = todayString;
pickupInput.value = todayString;
dropoffInput.value = formatDateInput(tomorrow);

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}

function getRentalDays() {
  if (!state.dates) return 1;
  const start = new Date(`${state.dates.pickup}T12:00:00`);
  const end = new Date(`${state.dates.dropoff}T12:00:00`);
  return Math.max(1, Math.ceil((end - start) / 86400000));
}

function getVisibleCars() {
  let visibleCars = cars.filter((car) => {
    const matchesCategory = state.category === "All" || car.category === state.category;
    const matchesLocation = state.location === "any" || car.location === state.location;
    return matchesCategory && matchesLocation;
  });

  if (state.sortByPrice) {
    visibleCars = [...visibleCars].sort((a, b) => a.price - b.price);
  }

  return visibleCars;
}

function renderCars() {
  const visibleCars = getVisibleCars();
  const resultCount = String(visibleCars.length).padStart(2, "0");
  resultsMessage.textContent = `${resultCount} ${visibleCars.length === 1 ? "car" : "cars"}${state.location !== "any" ? ` in ${state.location}` : ""}${state.dates ? ` · ${formatDate(state.dates.pickup)} – ${formatDate(state.dates.dropoff)}` : ""}`;

  if (visibleCars.length === 0) {
    carGrid.innerHTML = '<div class="empty-state"><strong>No cars found just yet.</strong>Try another location or browse all cars.</div>';
    return;
  }

  carGrid.innerHTML = visibleCars.map((car, index) => {
    const isFavorite = state.favorites.has(car.id);
    return `
      <article class="car-card" style="animation-delay:${index * 45}ms">
        <div class="car-image-wrap">
          <img src="${car.image}" alt="${car.alt}" loading="lazy" />
          <span class="car-tag">${car.tag}</span>
          <button class="favorite-button${isFavorite ? " is-favorite" : ""}" type="button" data-favorite="${car.id}" aria-label="${isFavorite ? "Remove from" : "Add to"} favorites" aria-pressed="${isFavorite}">${isFavorite ? "♥" : "♡"}</button>
        </div>
        <div class="car-info">
          <div class="car-title-row">
            <h3 class="car-name">${car.name}</h3>
            <span class="car-rating"><span aria-hidden="true">★</span> ${car.rating} (${car.reviews})</span>
          </div>
          <p class="car-subtitle">${car.subtitle}</p>
          <div class="car-specs">
            <span><span class="spec-icon" aria-hidden="true">♧</span> ${car.seats} seats</span>
            <span><span class="spec-icon" aria-hidden="true">◉</span> ${car.transmission}</span>
            <span><span class="spec-icon" aria-hidden="true">⌖</span> ${car.location}</span>
          </div>
          <div class="car-card-footer">
            <span class="price">$${car.price}<small> / day</small></span>
            <button class="book-button" type="button" data-book="${car.id}">View &amp; book <span aria-hidden="true">↗</span></button>
          </div>
        </div>
      </article>`;
  }).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function openBooking(carId) {
  const car = cars.find((item) => item.id === carId);
  if (!car) return;
  state.selectedCar = car;
  const days = getRentalDays();
  document.querySelector("#dialog-description").textContent = `You're one step away from booking the ${car.name}.`;
  document.querySelector("#reservation-summary").innerHTML =
    `<span>${car.name} · ${days} ${days === 1 ? "day" : "days"}</span><strong>$${car.price * days} total</strong><br><span>${state.dates ? `${formatDate(state.dates.pickup)} – ${formatDate(state.dates.dropoff)}` : "Choose dates to see your trip"} · ${car.location}</span>`;
  bookingDialog.showModal();
}

document.querySelector(".category-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-category]");
  if (!tab) return;
  state.category = tab.dataset.category;
  document.querySelectorAll(".category-tab").forEach((item) => {
    const selected = item === tab;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-pressed", String(selected));
  });
  renderCars();
});

carGrid.addEventListener("click", (event) => {
  const favoriteButton = event.target.closest("[data-favorite]");
  if (favoriteButton) {
    const carId = favoriteButton.dataset.favorite;
    if (state.favorites.has(carId)) {
      state.favorites.delete(carId);
    } else {
      state.favorites.add(carId);
    }
    renderCars();
    return;
  }

  const bookButton = event.target.closest("[data-book]");
  if (bookButton) openBooking(bookButton.dataset.book);
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const pickup = pickupInput.value;
  const dropoff = dropoffInput.value;

  if (!pickup || !dropoff) {
    showToast("Choose both pick-up and drop-off dates to search.");
    return;
  }
  if (dropoff <= pickup) {
    dropoffInput.setCustomValidity("Drop-off must be after pick-up.");
    dropoffInput.reportValidity();
    return;
  }
  dropoffInput.setCustomValidity("");
  state.location = locationInput.value;
  state.dates = { pickup, dropoff };
  renderCars();
  document.querySelector("#fleet").scrollIntoView({ behavior: "smooth" });
});

dropoffInput.addEventListener("input", () => dropoffInput.setCustomValidity(""));
pickupInput.addEventListener("change", () => {
  dropoffInput.setCustomValidity("");
  dropoffInput.min = pickupInput.value || todayString;
  if (dropoffInput.value && dropoffInput.value <= pickupInput.value) {
    const nextDay = new Date(`${pickupInput.value}T12:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    dropoffInput.value = formatDateInput(nextDay);
  }
});

document.querySelector("#sort-button").addEventListener("click", (event) => {
  state.sortByPrice = !state.sortByPrice;
  const label = event.currentTarget.querySelector("strong");
  label.textContent = state.sortByPrice ? "Price: low to high" : "Recommended";
  event.currentTarget.setAttribute("aria-label", state.sortByPrice ? "Sort by recommended" : "Sort cars by price");
  renderCars();
});

reservationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!reservationForm.reportValidity() || !state.selectedCar) return;
  const name = new FormData(reservationForm).get("name").trim();
  bookingDialog.close();
  reservationForm.reset();
  showToast(`Thanks, ${name.split(/\s+/)[0]}! Your ${state.selectedCar.name} request is in.`);
});

document.querySelector(".dialog-close").addEventListener("click", () => bookingDialog.close());
bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});

document.querySelector("#sign-in-button").addEventListener("click", () => {
  showToast("Account sign-in will be available soon.");
});
document.querySelector("#get-started-button").addEventListener("click", () => {
  document.querySelector("#fleet").scrollIntoView({ behavior: "smooth" });
});

const menuButton = document.querySelector("#menu-button");
menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  document.querySelector(".main-nav").classList.toggle("menu-open", !isExpanded);
});
document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.setAttribute("aria-expanded", "false");
    document.querySelector(".main-nav").classList.remove("menu-open");
  });
});

document.querySelectorAll('.footer-bottom a[href="#hero-title"], .hero-link[href="#fleet"]').forEach((link) => {
  link.addEventListener("click", () => {
    if (link.classList.contains("hero-link")) document.querySelector("#fleet").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
renderCars();
