// const axios = require("axios");
const ccxt = require("ccxt");
require("dotenv").config();

const getCandleData = async function (symbol, timeframe) {
  const exchangeId = "binance",
    exchangeClass = ccxt[exchangeId],
    exchange = new exchangeClass({
      apiKey: process.env.BINANCE_KEY,
      secret: process.env.BINANCE_SECRET,
      enableRateLimit: true,
    });

  // Gets *real* candle data from binance (not testnet) for every trailing 24 hour period.
  const now = exchange.milliseconds();
  console.log(now);
  const day = 60 * 60 * 24 * 1 * 1000; // milliseconds
  const since = now - day;
  const candleData = await exchange.fetch_ohlcv(
    `${symbol}/BUSD`,
    `${timeframe}`,
    since
  );

  //Turns the client to the testnet.
  exchange.set_sandbox_mode(true);

  // Gets current balance data from binanace API Account (TESTNET)
  const balance = await exchange.fetchBalance();

  // console log the data fetched.
  return console.log({ candleData, balance }); // data returned: [ 1630412160000, 3428.62, 3431.55, 3422.79, 3424.5, 15.631 ] equals [timestamp(ms), openPrice, highPrice, lowPrice, closePrice, volume(inBaseCurrency) ]
};

getCandleData("ETH", "15m");
