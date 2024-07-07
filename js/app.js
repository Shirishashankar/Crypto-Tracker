// Selecting DOM elements
const shimmerContainer = document.getElementsByClassName('shimmer-container')[0];
const paginationContainer = document.getElementById('pagination');
const sortPriceAsc = document.getElementById('sort-price-asc');
const sortPriceDesc = document.getElementById('sort-price-desc');
const sortVolumneAsc = document.getElementById('sort-volume-asc');
const sortVolumneDesc = document.getElementById('sort-volume-desc');
const searchBox = document.getElementById('search-box');

// Setting up API request options
const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
    }
};

let coins = []; // Array to hold coin data
const itemPerPage = 15; // Number of items per page for pagination
let currentPage = 1; // Current page number

// Fetching data from the API
const fetchCoins = async () => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1', options);
        const coinsData = await response.json();
        return coinsData;
    } catch (err) {
        console.log("Error occurred while fetching Coins");
        console.error(err);
    }
};

// Fetching favorite coins from local storage
const fetchFavouriteCoins = () => {
    return JSON.parse(localStorage.getItem('favourites')) || [];
};

// Saving favorite coins to local storage
const saveFavouriteCoins = (favourites) => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
};

// Removing favorite coins from local storage
const removeFavouriteCoins = (favourites) => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
};

// Handles click event for favorite icon
const handleFavClick = (coinId) => {
    const favourites = fetchFavouriteCoins();
    // If coin is already a favorite, removing it
    if (favourites.includes(coinId)) {
        const newFavourites = favourites.filter((favourite) => (
            favourite !== coinId
        ));
        saveFavouriteCoins(newFavourites);
    } else {
        // Adding coin to favorites
        favourites.push(coinId);
        saveFavouriteCoins(favourites);
    }
    displayCoins(getCoinsToDisplay(coins, currentPage), currentPage);
};

// Sorting coins by price
const sortCoinsByPrice = (order) => {
    if (order === 'asc') {
        coins.sort((a, b) => a.current_price - b.current_price);
    } else if (order === 'desc') {
        coins.sort((a, b) => b.current_price - a.current_price);
    }
    currentPage = 1;
    displayCoins(getCoinsToDisplay(coins, currentPage), currentPage);
    renderPagination(coins);
};

// Event listeners for sorting by price
sortPriceAsc.addEventListener('click', () => {
    sortCoinsByPrice('asc');
});
sortPriceDesc.addEventListener('click', () => {
    sortCoinsByPrice('desc');
});

// Sorting coins by volume
const sortCoinsByVol = (order) => {
    if (order === 'asc') {
        coins.sort((a, b) => a.total_volume - b.total_volume);
    } else if (order === 'desc') {
        coins.sort((a, b) => b.total_volume - a.total_volume);
    }
    currentPage = 1;
    displayCoins(getCoinsToDisplay(coins, currentPage), currentPage);
    renderPagination(coins);
};

// Event listeners for sorting by volume
sortVolumneAsc.addEventListener('click', () => {
    sortCoinsByVol('asc');
});
sortVolumneDesc.addEventListener('click', () => {
    sortCoinsByVol('desc');
});

// Handles search functionality
const handleSearch = (event) => {
    const searchQuery = searchBox.value.trim();
    const searchedCoins = coins.filter((coin) => coin.name.toLowerCase().includes(searchQuery.toLowerCase()));
    currentPage = 1;
    displayCoins(getCoinsToDisplay(searchedCoins, currentPage), currentPage);
    renderPagination(searchedCoins);
};

// Event listener for search box input
searchBox.addEventListener('input', handleSearch);

// Shows shimmer loading animation
const showShimmer = () => {
    shimmerContainer.style.display = 'flex';
};

// Hides shimmer loading animation
const hideShimmer = () => {
    shimmerContainer.style.display = 'none';
};

// Gets coins to display on the current page
const getCoinsToDisplay = (coins, page) => {
    const start = (page - 1) * itemPerPage;
    const end = start + itemPerPage;
    return coins.slice(start, end);
};

// Displays coins on the page
const displayCoins = (coins, page) => {
    const favourites = fetchFavouriteCoins();
    const start = (page - 1) * itemPerPage + 1;
    const tableBody = document.getElementById('crypto-table-body');
    tableBody.innerHTML = "";
    coins.forEach((coin, index) => {
        const isfavourite = favourites.includes(coin.id) ? "favourite" : "";
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + index}</td>
            <td><img src="${coin.image}" alt="${coin.name}" width="24" height="24"></td>
            <td>${coin.name}</td>
            <td>$${coin.current_price.toLocaleString()}</td>
            <td>$${coin.total_volume.toLocaleString()}</td>
            <td>$${coin.market_cap.toLocaleString()}</td>
            <td>
                <i class="fa-solid fa-star favourite-icon ${isfavourite}" data-id="${coin.id}"></i>
            </td>`;
        row.addEventListener('click', () => {
            window.open(`coin/coin.html?id=${coin.id}`, "_blank");
        });
        row.querySelector('.favourite-icon').addEventListener('click', (event) => {
            event.stopPropagation();
            handleFavClick(coin.id);
        });
        tableBody.appendChild(row);
    });
};

// Renders pagination buttons
const renderPagination = (coins) => {
    const totalPage = Math.ceil(coins.length / itemPerPage);
    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('page-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            updatePaginationButton();
            displayCoins(getCoinsToDisplay(coins, currentPage), currentPage);
        });
        paginationContainer.appendChild(pageBtn);
    }
};

// Updates pagination button styles
const updatePaginationButton = () => {
    const pageBtns = document.querySelectorAll('.page-btn');
    pageBtns.forEach((btn, index) => {
        if (index + 1 === currentPage) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
};

// Fetching and displaying coins data when the page loads
document.addEventListener("DOMContentLoaded", async () => {
    try {
        showShimmer();
        coins = await fetchCoins();
        displayCoins(getCoinsToDisplay(coins, currentPage), currentPage);
        renderPagination(coins);
    } catch (error) {
        console.log("Error in fetching data", error);
    }
    hideShimmer();
});
