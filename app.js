const express = require('express');
const path = require('path');
const stocks = require('./stocks');

const app = express();
app.use(express.static(path.join(__dirname, 'static')));

app.get('/stocks', async (req, res) => {
  try {
    const stockSymbols = await stocks.getStocks();
    res.send({ stockSymbols });
  } catch (error) {
    console.error('Error fetching stock symbols:', error.message);
    res.status(500).send({ error: 'Failed to retrieve stock symbols' });
  }
});

app.get('/stocks/:symbol', async (req, res) => {
  const { params: { symbol } } = req;

  try {
    const data = await stocks.getStockPoints(symbol, new Date());
    res.send(data);
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error.message);
    
    if (error.message === 'Failed to generate stock data' || error.message.startsWith('Unknown stock')) {
      // Return a 404 status for client-side handling
      res.status(404).send({ error: error.message });
    } else {
      // Return a 500 status for other errors
      res.status(500).send({ error: 'Failed to retrieve stock data' });
    }
  }
});

app.listen(3000, () => console.log('Server is running!'));
