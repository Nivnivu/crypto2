//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const util = require('node:util')


var yahooFinance = require('yahoo-finance');
const { historical } = require("yahoo-finance");


const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get('/', function(req, res){
  res.render('index')
});

/* Dealin With Dates !!! *///

var startDate = new Date();
var endDate = new Date();
var startDate = startDate.getDate() - 1
var endDate = endDate.getDate() - 13 

function calcDate(endDate){
  if (endDate <= 0) {
    return endDate + 30
  }
  else {
    return endDate
  }
};

let currentDay = calcDate(endDate)

let fromDate = new Date()
let currentYear = fromDate.getUTCFullYear()
let currentMonth = fromDate.getMonth() + 1
// console.log("0" + String(currentMonth - 1) )

function modifyMonth(currentMonth) {
  if (currentMonth < 10 && endDate <= 0){
    return "0" + String(currentMonth - 1) 
  }
  else {
    return currentMonth
  }
}

let currentMonth1 = modifyMonth(currentMonth)

let fromDay = currentYear + "-" + currentMonth1 + "-" +  currentDay

let toDay = currentYear + "-" + currentMonth + "-" +  startDate 

/* End of dealing with dates */


/* Getting The Data */
async function getData(data) {
  const historical = util.promisify(yahooFinance.historical)
  const closeArray = []
  const quote = await historical({
    symbol: 'ETH-USD',
    from: fromDay,
    to: toDay
  // period: 'd'  // 'd' (daily), 'w' (weekly), 'm' (monthly), 'v' (dividends only)
  })

  for (let i = 0; i < quote.length; i++) {
    closeArray.push(Math.floor(quote[i].close))
  }
  console.log(data(closeArray))
}

const newArray = []

const closingArray = 
getData((answer) => {
  for(let i = 0 ; i < closingArray.length; i++){
    newArray.push(i)
  }
  console.log(answer)
});




app.listen(3001, function() {
  console.log("Server started on port 3000");
});
