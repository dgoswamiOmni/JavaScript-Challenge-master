// Create the SVG container only once when the page is loaded.
const chart = d3.select('#chart');
const width = 1000;
const height = 600;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

const svg = chart.append('svg')
  .attr('width', width)
  .attr('height', height);

// Function to fill the dropdown with the list of stocks
function fillStockDropdown(stockList) {
  const stockDropdown = document.getElementById('stockDropdown');

  // Clear existing options
  stockDropdown.innerHTML = '';

  // Add new options
  stockList.forEach(stock => {
    const option = document.createElement('option');
    option.value = stock;
    option.textContent = stock;
    stockDropdown.appendChild(option);
  });
}

// Function to fetch the list of stocks
async function fetchStocks() {
  try {
    const response = await fetch('/stocks');
    const data = await response.json();
    return data.stockSymbols;
  } catch (error) {
    console.error('Error fetching stock symbols:', error.message);
    throw error;
  }
}

// Function to initialize the page
async function initializePage() {
  try {
    console.log('Initializing page...');

    // Fetch stocks
    const stocks = await fetchStocks();
    console.log('Available Stocks:', stocks);

    // Populate the stocks dropdown
    fillStockDropdown(stocks);

    // Hide the spinner after stocks are fetched
    const spinner = document.querySelector('.spinner');
    spinner.style.display = 'none';

  } catch (error) {
    console.error('Error initializing page:', error.message);
    // Handle error on the front end (e.g., display an error message)
    renderErrorMessage('Failed to initialize the page. Please try again.');
  }
}

// Function to fetch stock data for the selected stock
async function fetchStockData() {
  const selectedStock = document.getElementById('stockDropdown').value;
  console.log('Fetching data for', selectedStock);

  try {
    // Display the spinner while stock data is being fetched
    const spinner = document.querySelector('.spinner');
    spinner.style.display = 'inline-block';

    // Fetch stock data from the server
    const response = await fetch(`/stocks/${selectedStock}`);
    const data = await response.json();
    const stockData = await getStockData(selectedStock);

    const x = d3.scaleUtc()
      .domain([d3.min(stockData, d => new Date(d.timestamp)), d3.max(stockData, d => new Date(d.timestamp))])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(stockData, d => d.value), d3.max(stockData, d => d.value)])
      .range([height - margin.bottom, margin.top]);

    const line = d3.line()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.value));

    svg.selectAll('g').remove(); // Remove existing elements

    // Update the SVG content (line chart)
    svg.append('path')
      .datum(stockData)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add the x-axis.
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // Add the y-axis.
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Render stock data in the table
    renderStockData(data);

  } catch (error) {
    console.error('Error fetching stock data:', error.message);

    // Handle error on the front end (e.g., display an error message)
    renderErrorMessage('Failed to retrieve stock data. Please try again.');
  } finally {
    // Hide the spinner once stock data is fetched or on error
    const spinner = document.querySelector('.spinner');
    spinner.style.display = 'none';
  }
}

// Function to render stock data in the table
function renderStockData(stockData) {
  const tableBody = document.querySelector('#stockDataTable tbody');

  // Clear existing rows
  tableBody.innerHTML = '';

  // Check if stockData is an array
  if (!Array.isArray(stockData)) {
    // If not an array, display an error message
    renderErrorMessage('Failed to retrieve stock data. Please try again.');
    return;
  }

  // Populate the table with stock data
  stockData.forEach(entry => {
    const row = document.createElement('tr');
    const timestampCell = document.createElement('td');
    const valueCell = document.createElement('td');

    timestampCell.textContent = entry.timestamp;
    valueCell.textContent = entry.value;

    row.appendChild(timestampCell);
    row.appendChild(valueCell);
    tableBody.appendChild(row);
  });
}

// Function to render error message on the front end
function renderErrorMessage(message) {
  const errorMessageContainer = document.getElementById('errorMessage');
  errorMessageContainer.textContent = message;
  errorMessageContainer.style.color = 'red';
}

// Call the initializePage function when the page loads
window.onload = initializePage;

async function getStockData(stockName) {
  try {
    const response = await fetch(`/stocks/${stockName}`);
    const data = await response.json();

    return data;
  } catch (e) {
    console.error('There is an error fetching your stock data:\n', e.message);
  }
}
