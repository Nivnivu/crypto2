const axios = require('axios');
const cheerio = require('cheerio')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const bodyParser =require('body-parser');
const PORT = process.env.PORT || 5000
let coinArr = []

const app = express();
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + "/public")))


async function getPriceFeed() {
    try {
        const siteUrl = "https://coinmarketcap.com/"
        const {data} = await axios({
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

        if(parentIdx <= 9){
            $(parentElem).children().each((childIdx, childElem) => {
                let tdValue = $(childElem).text()

                if (keyIdx === 1 || keyIdx === 6) {
                    tdValue = $('p:first-child', $(childElem).html()).text()
                }

                if (tdValue){
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
const MyModel = mongoose.model('coinData', new mongoose.Schema({ rank: String, name: String, price: String }));


const injectDataToDb = async () => {
     await getPriceFeed()
     for (let i = 0; i < coinArr.length; i++){
        delete coinArr[i].undefined

     }
    
     console.log(coinArr)
     MyModel.insertMany(coinArr).then(function(){
    console.log("Data inserted")  // Success
    coinArr = []
    console.log(coinArr)
}).catch(function(error){
    console.log(error)      // Failures
});
}

// setInterval(injectDataToDb, 1000 * 60 )

app.get('/api', async (req,res) => {
    let data = await MyModel.find({});
    res.json(data)
} )


app.listen(PORT,()=>{
    console.log('server works on port 5000');
});