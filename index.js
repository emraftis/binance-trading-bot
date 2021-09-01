// const axios = require("axios");
const ccxt = require("ccxt");
require("dotenv").config();

const getData = async function (symbol, timeframe) {
  console.log("15min function start");
  // Establishes the client connection to Binance (real binance network)
  // Because price data on Binance's sandbox is not real-time, we FIRST use real-time price data from the real binance network to test
  // AND THEN after we get price data, we turn to the testnet for account related functions.
  const exchangeId = "binance",
    exchangeClass = ccxt[exchangeId],
    exchange = new exchangeClass({
      apiKey: process.env.BINANCE_KEY,
      secret: process.env.BINANCE_SECRET,
      enableRateLimit: true,
    });

  // Gets 15m candle data from binance mainnet for a trailing 3 day period.
  const now = exchange.milliseconds();
  const lengthOfTime = 60 * 60 * 24 * 0.25 * 1000;
  const since = now - lengthOfTime;
  const candleData = await exchange.fetch_ohlcv(
    `${symbol}/BUSD`,
    `${timeframe}`,
    since
  ); // returns an array called candleData[] with each array item being an array of [OHLCV values].

  //Establish a CURRENT AVERAGE PRICE based on 3-day, 1hr closing price data.
  const averagePrices = [];
  for (let i = 0; i < candleData.length; i++) {
    averagePrices.push((candleData[i][2] + candleData[i][3]) / 2);
  }
  const currentAvgPrice =
    averagePrices.reduce((acc, value) => acc + value) / averagePrices.length; //can hard-code this value for testing.
  console.log(currentAvgPrice);

  //Get the first price in the orderBook (closest to bid/ask spread midpoint).
  const currentActualPrices = await exchange.fetch_order_book("ETH/BUSD");
  const currentActualPrice = currentActualPrices.bids[1][0];
  console.log(currentActualPrice);

  //Check Account balance for $BUSD and $ETH.
  //

  //If the current price is below the average price calc'd above, BY A LARGE MARGIN (3%), we will buy, regardless of the buy 'cooldown'.
  if (currentAvgPrice >= 1.03 * currentActualPrice) {
    console.log(`Buy without time restriction at ${currentActualPrice}`); //no time restriction, aka buy the dip!
    console.log(
      `Set limit sell at ${currentAvgPrice * 1.015} for 55% of ETH purchased`
    );
    console.log(
      `Set limit sell at ${currentAvgPrice * 1.03} for 35% of ETH purchased`
    );
    console.log(
      `Set limit sell at ${currentAvgPrice * 1.05} for 10% of ETH purchased`
    );
  } else if (currentAvgPrice > currentActualPrice) {
    console.log(`Buy with time restriction at ${currentActualPrice}`); //
    console.log(
      `Set limit sell at ${currentAvgPrice * 1.015} for 55% of ETH purchased`
    );
    console.log(
      `Set limit sell at ${currentAvgPrice * 1.03} for 35% of ETH purchased`
    );
    console.log(
      `Set limit sell at ${currentAvgPrice * 1.05} for 10% of ETH purchased`
    );
  } else if (currentActualPrice > currentAvgPrice * 1.2) {
    console.log("Market sell 20% of ETH holdings with timer");
  } else if (currentActualPrice > currentAvgPrice * 1.1) {
    console.log("Market sell 10% of ETH holdings with timer");
  }

  //*****Turns the client to the testnet.*****
  exchange.set_sandbox_mode(true);
  // Gets current balance data from binanace API Account (TESTNET)
  //   const balance = await exchange.fetchBalance();
  return console.log("15min function ended");
  // console log the data fetched.
  //   return console.log({ balance });
  //return console.log({ candleData, balance }); // data returned: [ 1630412160000, 3428.62, 3431.55, 3422.79, 3424.5, 15.631 ] equals [timestamp(ms), openPrice, highPrice, lowPrice, closePrice, volume(inBaseCurrency) ]
};

// const tickerFunction = function () {
//   setInterval(getData("ETH", "15m"), 900000);
// };

setInterval(getData, 60000, "ETH", "1m");
