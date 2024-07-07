// Selects DOM elements for coin details and shimmer container
const coinContainer = document.getElementById('coin-container');
const shimmerContainer = document.querySelector('.shimmer-container');

const coinImage = document.getElementById('coin-image');
const coinName = document.getElementById('coin-name');
const coinDescription = document.getElementById('coin-description');
const coinRank = document.getElementById('coin-rank');
const coinPrice = document.getElementById('coin-price');
const coinMarketCap = document.getElementById('coin-market-cap');
const btnContainer = document.querySelectorAll('.button-container button');

// Sets up API request options
const options = {
    method: "GET",
    headers: {
        accept: "application/json",
        "x-cg-demo-api-key": "CG-mDVVqLm5xBDjvcVq523LnAmB",
    }
};

// Gets the coin ID from URL parameters
const urlParam = new URLSearchParams(window.location.search);
const coinId = urlParam.get('id');

// Fetches coin data from the API
const fetchCoinData = async () => {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options);
        const coinData = await response.json();
        displayCoinData(coinData);
    } catch (error) {
        console.log("Error occurred while fetching Coins");
        console.error(error);
    }
};

// Displaying coin data on the page
const displayCoinData = (coinData) => {
    coinImage.src = coinData.image.large;
    coinImage.alt = coinData.name;
    coinDescription.textContent = coinData.description.en.split('.')[0];
    coinRank.textContent = coinData.market_cap_rank;
    coinPrice.textContent = `$${coinData.market_data.current_price.usd.toLocaleString()}`;
    coinMarketCap.textContent = `$${coinData.market_data.market_cap.usd.toLocaleString()}`;
    coinName.textContent = coinData.name;
};

// Sets up chart context
const ctx = document.getElementById('myChart');

// Initializes Chart.js chart
const coinChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // x-axis labels
        datasets: [{
            label: 'Price (USD)',
            data: [], // y-axis data
            borderWidth: 1,
            borderColor: '#eebc1d',
            fill: false,
        }]
    },
});

// Updates chart data with new prices
const updateChart = (prices) => {
    const data = prices.map(price => price[1]);
    const labels = prices.map(price => {
        let date = new Date(price[0]);
        return date.toLocaleString();
    });
    coinChart.data.labels = labels;
    coinChart.data.datasets[0].data = data;
    coinChart.update();
};

// Fetching chart data from the API
const fetchChartData = async (days) => {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`, options);
        const chartData = await response.json();
        updateChart(chartData.prices);
    } catch (error) {
        console.error("Error while fetching chart data", error);
    }
};

// Adds event listeners to buttons to fetch and display chart data
btnContainer.forEach((button) => {
    button.addEventListener('click', (event) => {
        const days = event.target.id === "24h" ? 1 : event.target.id === "30d" ? 30 : 90;
        fetchChartData(days);
    });
});

// Initializes and fetches coin data on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCoinData();
    // Set the 24hrs as default
    document.getElementById("24h").click();
});
