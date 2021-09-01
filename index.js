// const axios = require("axios");
const ccxt = require("ccxt");
require("dotenv").config();

const getData = async function (symbol, timeframe) {
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
  const lengthOfTime = 60 * 60 * 24 * 3 * 1000;
  const since = now - lengthOfTime;
  const candleData = await exchange.fetch_ohlcv(
    `${symbol}/BUSD`,
    `${timeframe}`,
    since
  ); // This returns an array called candleData[] with each array item being an array of [OHLCV values].

  //
  //
  //
  //
  //
  //
  // Trading logic... checking every ~15/16mins.
  //
  //
  //
  //
  //

  //Establish a CURRENT AVERAGE PRICE based on 3-day, 1hr closing price data.
  const averagePrices = [];
  for (let i = 0; i < candleData.length; i++) {
    averagePrices.push((candleData[i][2] + candleData[i][3]) / 2);
  }
  const currentAvgPrice =
    averagePrices.reduce((acc, value) => acc + value) / averagePrices.length;

  // After +/-3% change from CURRENT AVERAGE PRICE, set either buySignal, sellSignal, or holdSignal {

  //  1.  Reset CURRENT AVERAGE PRICE to a new price based on new trailing 3-day data.

  //  2. Determine if its time to buy, sell, or hold.

  //    if holdSignal && last 3 x 15min candles are red? {
  //        sell 10% of ETH.
  //        then change/keep to sellSignal.
  //    }
  //    if holdSignal && last 3 x 15min candles are green? {
  //        hold.
  //    }
  //    if sellSignal && last 3 x 15min candles are green? {
  //        buy $100 worth of ETH
  //        set to holdSignal.
  //    }
  //    if sellSignal && last 3 x 15min candles are red? {
  //        sell signal.
  //    }
  //    if buySignal && last 3 x 15min candles are green? {
  //        set holdSignal
  //    } else {
  //        set buy or sell signal.
  //    }
  //
  //

  // Example: Assume ETH/BUSD and we hold $1,000 worth of BUSD and ETH 50/50.
  //        Every 'big' a.k.a 3%? movement in price, we buy (or sell) 10%? 5%? of original holdings (of amount invested). i.e. if buy, we buy $100 worth. If sell, we only sell 10% of ETH holdings.
  //        Establish a base price for ETH @ T=0.
  //        keep checking every 15mins OR until the price of ETH increases or decreases by 3% from the original price, then set a new buy/hold/sell signal.

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //*****Turns the client to the testnet.*****
  exchange.set_sandbox_mode(true);
  // Gets current balance data from binanace API Account (TESTNET)
  const balance = await exchange.fetchBalance();

  // console log the data fetched.
  return console.log({ candleData, balance }); // data returned: [ 1630412160000, 3428.62, 3431.55, 3422.79, 3424.5, 15.631 ] equals [timestamp(ms), openPrice, highPrice, lowPrice, closePrice, volume(inBaseCurrency) ]
};

getData("ETH", "15m");
