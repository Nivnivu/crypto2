const axios = require('axios');
const cheerio = require('cheerio')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bodyParser = require('body-parser');
const { takeCoverage } = require('v8');
const { execPath } = require('process');
const { data } = require('cheerio/lib/api/attributes');
const PORT = process.env.PORT || 5000
let coinArr = []

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/public")))


async function getPriceFeed() {
    try {
        const siteUrl = "https://coinmarketcap.com/"
        const { data } = await axios({
            method: "GET",
            url: siteUrl,
        })

        const $ = cheerio.load(data)
        const elemSelector = '#__next > div > div.main-content > div.sc-1a736df3-0.PimrZ.cmc-body-wrapper > div > div:nth-child(1) > div.sc-f7a61dda-2.efhsPu > table > tbody > tr'


        const keys = [
            'rank',
            'name',
            'price'
        ]


        $(elemSelector).each((parentIdx, parentElem) => {
            let keyIdx = 0
            const coinObj = {}

            if (parentIdx <= 9) {
                $(parentElem).children().each((childIdx, childElem) => {
                    let tdValue = $(childElem).text()

                    if (keyIdx === 1 || keyIdx === 6) {
                        tdValue = $('p:first-child', $(childElem).html()).text()
                    }

                    if (tdValue) {
                        coinObj[keys[keyIdx]] = tdValue

                        keyIdx++
                    }
                })
                coinArr.push(coinObj)
            }
        })
        // console.log(coinArr)
    } catch (error) {
        console.log(error)
    }
}




mongoose.connect('mongodb+srv://nivbarsh:nivniv95@cluster0.fw5phvv.mongodb.net/?retryWrites=true&w=majority', () => {
    console.log('db is on');
})
const MyModel = mongoose.model('newCoinData', new mongoose.Schema({ rank: String, name: String, price: Number, date: String }));
const CalcModel = mongoose.model('CoinStatistics', new mongoose.Schema({
    name: { type: String },
    lastPrice: { type: Number },
    date: { type: String },
    nested: {

        one: {
            rsi: { type: Number },
            position: { type: String },
            takeProfit: { type: Number },
            stopLost: { type: Number },
        },
        twelve: {
            rsi: { type: Number },
            position: { type: String },
            takeProfit: { type: Number },
            stopLost: { type: Number },
        },
        twenyfour: {
            rsi: { type: Number },
            position: { type: String },
            takeProfit: { type: Number },
            stopLost: { type: Number },

        }

    }
}))


const injectDataToDb = async () => {
    const currentdate = new Date();
    const datetime = + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    await getPriceFeed()
    for (let i = 0; i < coinArr.length; i++) {
        delete coinArr[i].undefined
        coinArr[i].price = parseFloat(coinArr[i].price.slice(1).replace(',', ""))
        coinArr[i].date = datetime
    }
    coinArr = coinArr.filter(coin => coin.name != 'Tether')
    coinArr = coinArr.filter(coin => coin.name != 'USD Coin')
    coinArr = coinArr.filter(coin => coin.name != 'Binance USD')
    //  console.log(coinArr)
    MyModel.insertMany(coinArr).then(function () {
        console.log("Data inserted")  // Success
        coinArr = []
    }).catch(function (error) {
        console.log(error)      // Failures
    });
}

setInterval(injectDataToDb, 1000 * 60)

let temp
let Ethereum
let Polygon
let Dogecoin
let BNB
let Cardano
let Bitcoin
let XRP

const ordering = async (name, time) => {

    for (let i = 0; i < 7; i++) {
        temp = await MyModel.find({ name: name[i] }).exec();
        // console.log(temp.slice(temp.length - 10, temp.length))
        if (name[i] == 'Bitcoin') {
            Bitcoin = temp.slice(temp.length - time, temp.length)
        } else if (name[i] == 'Ethereum') {
            Ethereum = temp.slice(temp.length - time, temp.length)
        } else if (name[i] == 'Polygon') {
            Polygon = temp.slice(temp.length - time, temp.length)
        } else if (name[i] == 'Cardano') {
            Cardano = temp.slice(temp.length - time, temp.length)
        } else if (name[i] == 'XRP') {
            XRP = temp.slice(temp.length - time, temp.length)
        } else if (name[i] == 'BNB') {
            BNB = temp.slice(temp.length - time, temp.length)
        } else if (name[i] == 'Dogecoin') {
            Dogecoin = temp.slice(temp.length - time, temp.length)
        }
    }

}
let XRParrayOfNumber = []
let BNBarrayOfNumber = []
let DogecoinarrayOfNumber = []
let PolygonarrayOfNumber = []
let CardanoarrayOfNumber = []
let EthereumarrayOfNumber = []
let BitcoinarrayOfNumber = []

const keepOrder = async () => {
    await ordering(['Bitcoin', 'Ethereum', 'Polygon', 'Cardano', 'XRP', 'BNB', 'Dogecoin'], 1440)

    for (let j = 0; j < XRP.length; j++) {
        XRParrayOfNumber.push(XRP[j].price)
    }

    for (let j = 0; j < BNB.length; j++) {
        BNBarrayOfNumber.push(BNB[j].price)
    }

    for (let j = 0; j < Dogecoin.length; j++) {
        DogecoinarrayOfNumber.push(Dogecoin[j].price)
    }

    for (let j = 0; j < Polygon.length; j++) {
        PolygonarrayOfNumber.push(Polygon[j].price)
    }

    for (let j = 0; j < Cardano.length; j++) {
        CardanoarrayOfNumber.push(Cardano[j].price)
    }

    for (let j = 0; j < Ethereum.length; j++) {
        EthereumarrayOfNumber.push(Ethereum[j].price)
    }

    for (let j = 0; j < Bitcoin.length; j++) {
        BitcoinarrayOfNumber.push(Bitcoin[j].price)
    }


    // console.log(XRParrayOfNumber)
    // console.log(XRP)
    // console.log("-------Brake-------")
    // console.log(BitcoinarrayOfNumber)
    // console.log(Bitcoin)
    // console.log("-------Brake-------")
    // console.log(EthereumarrayOfNumber)
    // console.log(Ethereum)
    // console.log("-------Brake-------")
    // console.log(CardanoarrayOfNumber)
    // console.log(Cardano)
    // console.log("-------Brake-------")
    // console.log(PolygonarrayOfNumber)
    // console.log(Polygon)
    // console.log("-------Brake-------")
    // console.log(DogecoinarrayOfNumber)
    // console.log(Dogecoin)
    // console.log("-------Brake-------")
    // console.log(BNBarrayOfNumber)
    // console.log(BNB)
}



const insertAfterSort = async () => {
    const currentdate = new Date();
    const datetime = + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    await keepOrder()
    let eth1rsi
    let eth12rsi
    let eth24rsi
    let bnb1rsi
    let bnb12rsi
    let bnb24rsi
    let btc1rsi
    let btc12rsi = {}
    let btc24rsi = {}
    let pol1rsi = {}
    let pol12rsi = {}
    let pol24rsi = {}
    let ada1rsi
    let ada12rsi
    let ada24rsi
    let dog1rsi
    let dog12rsi
    let dog24rsi
    let xrp1rsi
    let xrp12rsi
    let xrp24rsi

    const arrayOfRsi =
        [btc1rsi, btc12rsi, btc24rsi, eth1rsi, eth12rsi, eth24rsi, bnb1rsi, bnb12rsi,
            bnb24rsi, xrp1rsi, xrp12rsi, xrp24rsi, ada1rsi, ada12rsi, ada24rsi, dog1rsi, dog12rsi, dog24rsi, pol1rsi, pol12rsi, pol24rsi]

    let btc1 = BitcoinarrayOfNumber.slice(BitcoinarrayOfNumber.length - 60, BitcoinarrayOfNumber.length)
    let btc12 = BitcoinarrayOfNumber.slice(BitcoinarrayOfNumber.length - 720, BitcoinarrayOfNumber.length)
    let btc24 = BitcoinarrayOfNumber.slice(BitcoinarrayOfNumber.length - 1440, BitcoinarrayOfNumber.length)
    let eth1 = EthereumarrayOfNumber.slice(EthereumarrayOfNumber.length - 60, EthereumarrayOfNumber.length)
    let eth12 = EthereumarrayOfNumber.slice(EthereumarrayOfNumber.length - 720, EthereumarrayOfNumber.length)
    let eth24 = EthereumarrayOfNumber.slice(EthereumarrayOfNumber.length - 1440, EthereumarrayOfNumber.length)
    let bnb1 = BNBarrayOfNumber.slice(BNBarrayOfNumber.length - 60, BNBarrayOfNumber.length)
    let bnb12 = BNBarrayOfNumber.slice(BNBarrayOfNumber.length - 720, BNBarrayOfNumber.length)
    let bnb24 = BNBarrayOfNumber.slice(BNBarrayOfNumber.length - 1440, BNBarrayOfNumber.length)
    let xrp1 = XRParrayOfNumber.slice(XRParrayOfNumber.length - 60, XRParrayOfNumber.length)
    let xrp12 = XRParrayOfNumber.slice(XRParrayOfNumber.length - 720, XRParrayOfNumber.length)
    let xrp24 = XRParrayOfNumber.slice(XRParrayOfNumber.length - 1440, XRParrayOfNumber.length)
    let ada1 = CardanoarrayOfNumber.slice(CardanoarrayOfNumber.length - 60, CardanoarrayOfNumber.length)
    let ada12 = CardanoarrayOfNumber.slice(CardanoarrayOfNumber.length - 720, CardanoarrayOfNumber.length)
    let ada24 = CardanoarrayOfNumber.slice(CardanoarrayOfNumber.length - 1440, CardanoarrayOfNumber.length)
    let dog1 = DogecoinarrayOfNumber.slice(DogecoinarrayOfNumber.length - 60, DogecoinarrayOfNumber.length)
    let dog12 = DogecoinarrayOfNumber.slice(DogecoinarrayOfNumber.length - 720, DogecoinarrayOfNumber.length)
    let dog24 = DogecoinarrayOfNumber.slice(DogecoinarrayOfNumber.length - 1440, DogecoinarrayOfNumber.length)
    let pol1 = PolygonarrayOfNumber.slice(PolygonarrayOfNumber.length - 60, PolygonarrayOfNumber.length)
    let pol12 = PolygonarrayOfNumber.slice(PolygonarrayOfNumber.length - 720, PolygonarrayOfNumber.length)
    let pol24 = PolygonarrayOfNumber.slice(PolygonarrayOfNumber.length - 1440, PolygonarrayOfNumber.length)

    let arrayOfIntervals = [btc1, btc12, btc24, eth1, eth12, eth24, bnb1, bnb12, bnb24, xrp1, xrp12, xrp24, ada1, ada12, ada24, dog1, dog12, dog24, pol1, pol12, pol24]

    let tempArr = []

    const modifyArr = (arr, nth) => {
        for (let c=0; c < arr.length ; c += nth){
            tempArr.push(arr[c])
        }

    }
 
    for (let t=0; t < arrayOfIntervals.length ; t ++){
        modifyArr(arrayOfIntervals[t], Math.floor( arrayOfIntervals[t].length / 14))
        arrayOfIntervals[t] = tempArr.slice(1)
        tempArr = []
     
    }

    
    
 


    let change = []
    let upwardMovement = []
    let downwardMovement = []
    let averageUpWardMovement = 0
    let averageDownWardMovement = 0
    let relativeStrength = 0
    let coinRsi = 0
    let position = ""
    let takeProfit = 0
    let stopLost = 0

    const calcForEach = (array) => {
        // Calculating and oredering all values !
        for (let q = 0; q < array.length; q++) {
            for (let j = 0; j < array[q].length; j++) {
                change.push(array[q][j + 1] - array[q][j])
            }
            change.pop()
            for (let k = 0; k < change.length; k++) {
                if (change[k] > 0) {
                    upwardMovement.push(change[k])
                    downwardMovement.push(0)
                } else {
                    upwardMovement.push(0)
                    downwardMovement.push(Math.abs(change[k]))
                }
            }

            for (let p = 0; p < upwardMovement.length; p++) {
                averageUpWardMovement += upwardMovement[p] / 13
                averageDownWardMovement += downwardMovement[p] / 13
            }

            relativeStrength = averageUpWardMovement / averageDownWardMovement
            coinRsi = 100 - 100 / (relativeStrength + 1)


            if (coinRsi > 80) {
                position = "Short"
                takeProfit = arrayOfIntervals[q].reduce((acc, cur) => acc + cur) / arrayOfIntervals[q].length
                stopLost =  array[q][array[q].length - 1] * ((Math.abs((array[q][array[q].length - 1] / takeProfit) - 1) / 2) + 1)
            } else if (coinRsi < 20) {
                position = "Long"
                takeProfit = arrayOfIntervals[q].reduce((acc, cur) => acc + cur) / arrayOfIntervals[q].length
                stopLost = array[q][array[q].length - 1] / ((((takeProfit / array[q][array[q].length - 1]) - 1) / 2) + 1)
            } else {
                position = "None"
                takeProfit = 0
                stopLost = 0
            }


            arrayOfRsi[q] = { rsi: coinRsi, position, takeProfit, stopLost }

        }


    }
    calcForEach(arrayOfIntervals)

 

    CalcModel.insertMany([{
        name: 'Bitcoin', lastPrice: btc1[btc1.length - 1], date: datetime, nested: {
            one: arrayOfRsi[0]
            , twelve: arrayOfRsi[1],
            twenyfour: arrayOfRsi[2]
        }
    }, {
        name: 'Ethereum', lastPrice: eth1[eth1.length - 1], date: datetime, nested: {
            one: arrayOfRsi[3]
            , twelve: arrayOfRsi[4],
            twenyfour: arrayOfRsi[5]
        }
    }, {
        name: 'BNB', lastPrice: bnb1[bnb1.length - 1], date: datetime, nested: {
            one: arrayOfRsi[6]
            , twelve: arrayOfRsi[7],
            twenyfour: arrayOfRsi[8]
        }
    }, {
        name: 'XRP', lastPrice: xrp1[xrp1.length - 1], date: datetime, nested: {
            one: arrayOfRsi[9]
            , twelve: arrayOfRsi[10],
            twenyfour: arrayOfRsi[11]
        }
    }, {
        name: 'Cardano', lastPrice: ada1[ada1.length - 1], date: datetime, nested: {
            one: arrayOfRsi[12]
            , twelve: arrayOfRsi[13],
            twenyfour: arrayOfRsi[14]
        }
    }, {
        name: 'Dogecoin', lastPrice: dog1[dog1.length - 1], date: datetime, nested: {
            one: arrayOfRsi[15]
            , twelve: arrayOfRsi[16],
            twenyfour: arrayOfRsi[17]
        }
    }, {
        name: 'Polygon', lastPrice: pol1[pol1.length - 1], date: datetime, nested: {
            one: arrayOfRsi[18]
            , twelve: arrayOfRsi[19],
            twenyfour: arrayOfRsi[20]
        }
    }

    ]).then(function () {
        console.log("Statics Inserted")  // Success
        coinArr = []
    }).catch(function (error) {
        console.log(error)      // Failures
    });

}


setInterval(insertAfterSort, 1000 * 65)


app.get('/api', async (req, res) => {
    data = await CalcModel.find({});
    data = data.slice(data.length - 7)
    res.json(data)
})


app.listen(PORT, () => {
    console.log('server works on port 5000');
});



