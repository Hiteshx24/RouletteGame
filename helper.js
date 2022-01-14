function randomNumber(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

function totalAmtToBePaid(investment){
    return investment; // it can be used to include the participation fees, taxes and all for the investment.
}

function getReturnAmount(investment, stakeFactor){
    return investment+stakeFactor;
}

module.exports={randomNumber, totalAmtToBePaid, getReturnAmount};
