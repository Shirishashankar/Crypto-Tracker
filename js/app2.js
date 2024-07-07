// Selects the shimmer container and pagination container elements from the DOM
const shimmerContainer = document.getElementsByClassName('shimmer-container')[0];
const paginationContainer = document.getElementById('pagination');

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

// Fetching coin data from the API
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

// Saves favorite coins to local storage
const saveFavouriteCoins = (favourites) => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
};

// Handles click event for favorite icon
const handleFavClick = (coinId) => {
    console.log("fav");
    const favourites = fetchFavouriteCoins();
    favourites.push(coinId);
    saveFavouriteCoins(favourites);
};

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
    const start = (page - 1) * itemPerPage + 1;
    const tableBody = document.getElementById('crypto-table-body');
    tableBody.innerHTML = ""; // Clear previous coins data
    coins.forEach((coin, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + index}</td>
            <td><img src="${coin.image}" alt="${coin.name}" width="24" height="24"></td>
            <td>${coin.name}</td>
            <td>$${coin.current_price}</td>
            <td>$${coin.total_volume}</td>
            <td>$${coin.market_cap}</td>
            <td>
                <i class="fa-solid fa-star favourite-icon" data-id="${coin.id}"></i>
            </td>
        `;

        // Adds event listener to the favourite icon
        const favIcon = row.querySelector('.favourite-icon');
        favIcon.addEventListener('click', (event) => {
            // Prevent the event from propagating to the row click event
            event.stopPropagation();
            handleFavClick(coin.id);
        });

        tableBody.appendChild(row); // Append the row to the table body
    });
};

// Renders pagination buttons
const renderPagination = (coins) => {
    const totalPage = Math.ceil(coins.length / itemPerPage);
    paginationContainer.innerHTML = ""; // Clear previous pagination buttons

    for (let i = 1; i <= totalPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.classList.add('page-btn');

        // Highlights the current page button
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }

        // Allows click on the pagination button
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            updatePaginationButton();
            displayCoins(getCoinsToDisplay(coins, currentPage), currentPage);
        });

        paginationContainer.appendChild(pageBtn); // Append the button to the pagination container
    }
};

// Updates the styles of pagination buttons
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

// Initializes and fetches data when the DOM content is loaded
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
