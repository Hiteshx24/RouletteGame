const inquirer = require("inquirer");
 const chalk = require("chalk");
 const figlet = require("figlet");
 const {Keypair} = require('@solana/web3.js');

 const {getWalletBalance, transferSOL, airDropSol} = require("./solana");
 const {getReturnAmount, totalAmtToBePaid, randomNumber} = require('./helper');

 const init = () =>{
     console.log(
         chalk.green(
             figlet.textSync("SOL Stake", {
                 font: "Standard",
                 horizontalLayout: "default",
                 verticalLayout: "default"
             })
         )
     );
     console.log(chalk.yellow`The max bidding amount is 2.5 SOL here.`);
 };

 //Asking for the ratio
 //Asking for the sol to be staked 
 //checking amount that is available in wallet
 //public key
 //generate a random number
 //Ask for the generated number
 //if true the SQL as per ratio

 const userSecretKey =[
    217,  92, 207,  67,  11,  39, 206, 135,  85,  88, 253,
    116, 141, 156,  53, 143,  15, 147, 217,  17, 103,  34,
    108, 139, 187, 106, 252, 161,  63, 137,  74,  76, 120,
     73,  51, 137,   9,  17, 105,  34,   9, 117, 116, 245,
     26, 204,  84, 156,  58, 131,   1, 221, 232, 107,  37,
    136, 127, 132, 118, 117, 222, 184,  34,  52
 ];

 const userWallet = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));

 //Treasury
 const secretKey=[
    111, 188,  76, 169,  30, 105, 254,  33, 228,  66,  56,
    215,   9,  37,  51, 188, 188, 188,  20, 224, 228, 115,
     17, 163, 151, 105, 113, 251, 105, 177,  28, 157, 125,
    202, 195, 203, 253, 137,  26, 209,   7,   2,  66, 193,
     76, 241, 203, 168, 213,   5, 226,  11, 142,  44, 125,
    191, 167, 172, 166, 207, 176, 137, 210,  27
 ];

 const treasuryWallet  =Keypair.fromSecretKey(Uint8Array.from(secretKey));

 const askQuestions =() =>{
     const questions =[
        {
            name: "SOL",
            type: "number",
            message: "What is amount of SOL you want to stake?",
        }, 
        {
             type: "rawlist",
             name: "RATIO",
             message: "What is the ratio of your stake?",
             choices: ["1:1.25", "1:1.5", "1:1.75", "1:2"],
             filter: function(val){
                 const stakeFactor=val.split(":")[1];
                 return stakeFactor;
             },
         },
         {
             type: "number",
             name:"RANDOM",
             message:"Guess a random number from 1 to 5(both 1 and 5 included)",
             when:async (val) =>{
                 if(parseFloat(totalAmtToBePaid(val.SOL))>5){
                     console.log(chalk.red`You have violated the max stake limit. Stake with smaller amount.`)
                     return false;
                 }else{
                     console.log(`You need to pay ${totalAmtToBePaid(val.SOL)} to move forward`)
                     const userBalance = await getWalletBalance(userWallet.publicKey.toString())
                     if(userBalance<totalAmtToBePaid(val.SOL)){
                         console.log(chalk.red`You don't have enough balance in your wallet`);
                         return false;
                     }else{
                         console.log(chalk.green`You will get ${getReturnAmount(val.SOL,parseFloat(val.RATIO))} if guessing the number correctly`)
                         return true;
                     }
                 }
             },
         }
     ];
    return inquirer.prompt(questions);
 }


 const gameExexcution = async() =>{
     init();
     const generateRandomNumber = randomNumber(1,5);
     const answers = await askQuestions();
     if(answers.RANDOM){
         const paymentSignature = await transferSOL(userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL))
         console.log(`Signature of payment for playing game`,chalk.green`${paymentSignature}`);
         if(answers.RANDOM=== generateRandomNumber){
             //Airdrop winning amount
             await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));
             //guess is successful
             const prizeSignature = await transferSOL(treasuryWallet,userWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)))
             console.log(chalk.green`Your guess is absolutely correct.`);
             console.log(`Here is the prize signature`, chalk.green`${prizeSignature}`);

         }else{
             console.log(chalk.yellowBright`Better luck next time`)
         }
     }
 }

 gameExexcution();