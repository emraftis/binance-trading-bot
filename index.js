// const axios = require("axios");
const ccxt = require("ccxt");
require("dotenv").config();

// Gets candle data from binance, to USDC.
// to update - how can we get candle data for a certain period of time? Current candle is every 60,000.
const getCandles = async function (symbol, timeframe) {
  const exchangeId = "binance",
    exchangeClass = ccxt[exchangeId],
    exchange = new exchangeClass({
      apiKey: process.env.BINANCE_KEY,
      secret: process.env.BINANCE_SECRET,
      enableRateLimit: true,
    });

  const now = exchange.milliseconds();
  console.log(now);
  const day = 60 * 60 * 24 * 1000; // milliseconds
  const since = now - day;
  const candleData = await exchange.fetch_ohlcv(
    `${symbol}/USDC`,
    `${timeframe}`,
    since
  );
  return console.log(candleData); // data returned: [ 1630412160000, 3428.62, 3431.55, 3422.79, 3424.5, 15.631 ] equals [timestamp(ms), openPrice, highPrice, lowPrice, closePrice, volume(inBaseCurrency) ]
};

getCandles("ETH", "15m");
