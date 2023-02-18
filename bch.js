"use strict";
async function start() {
    if (localStorage.getItem("wallet") != null) {
        const mnemonic = JSON.parse(localStorage.getItem("wallet")).mnemonic;
        const wallet = await SmartBchWallet.fromSeed(mnemonic);
        showData(wallet);
        document.getElementById("mainBox").style.display = "none";
    } else {
        document.getElementById("myWalletBox").style.display = "none";
        document.getElementById("accountBox").style.display = "none";
        document.getElementById("mainBox").style.display = "flex";
    }
    if (localStorage.getItem("tHistory") == null || localStorage.getItem("tData") == null) {
        const tHistory = [];
        const tData = [];
        localStorage.setItem("tHistory", JSON.stringify(tHistory));
        localStorage.setItem("tData", JSON.stringify(tData));
    }
}

async function newWallet() {
    const wallet = await SmartBchWallet.newRandom();
    localStorage.setItem("wallet", JSON.stringify(wallet));
    // console.log(wallet);
    showData(wallet);
    document.getElementById("mainBox").style.display = "none";
    document.getElementById("myWalletBox").style.display = "flex";
}

async function showData(wallet) {
    // console.log(wallet);
    const balance = await wallet.getBalance();
    // transaction(wallet);
    showTransaction();
    toggleTx();
    toggleSeed();
    // console.log(balance);
    document.getElementById("walletBalance").innerText = `${balance.bch.toFixed(8)} sBCH`;

    document.getElementById("walletAddress").value = `${wallet.address}`;

    document.getElementById("walletAddress2").value = `${wallet.address}`;

    document.querySelector('#deposit').src = wallet.getDepositQr().src;
    }

async function importWallet() {
    if (document.getElementById("seed").value != "") {
        let mnemonic = document.getElementById("seed").value;
        document.getElementById("seed").value = "";
        const wallet = await SmartBchWallet.fromSeed(mnemonic);
        localStorage.setItem("wallet", JSON.stringify(wallet));
        showData(wallet);
        // console.log(wallet);
        document.getElementById("mainBox").style.display = "none";
        document.getElementById("myWalletBox").style.display = "flex";
    } else {
        console.log('invalid mnemonic');
    }

}

function closeSend() {
    document.getElementById("address").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("myWalletBox").style.display = "flex";
    document.getElementById("sendBox").style.display = "none";
}

function openSend() {
    document.getElementById("sendBox").style.display = "flex";
    document.getElementById("myWalletBox").style.display = "none";
}

function closeReceive() {
    document.getElementById("myWalletBox").style.display = "flex";
    document.getElementById("receiveBox").style.display = "none";
}

function openReceive() {
    document.getElementById("receiveBox").style.display = "flex";
    document.getElementById("myWalletBox").style.display = "none";
}

function copyAddress() {
    let input = document.getElementById("walletAddress");
    // console.log(input);
    // console.log(input.value);
    navigator.clipboard.writeText(input.value);
}

async function withdraw() {
    const seller = String(document.getElementById("address").value);
    const amount = Number(document.getElementById("amount").value);
    // /^0x[a-zA-Z0-9]{40}$/
    if (seller != "" && amount != "") {

        document.getElementById("loderBox").style.display = "flex";

        const mnemonic = JSON.parse(localStorage.getItem("wallet")).mnemonic;
        const wallet = await SmartBchWallet.fromSeed(mnemonic);
        // console.log(wallet);
        const balance = await wallet.getBalance();
        // const overrides = { gasPrice: 0.2, gasLimit: 26038 }

        setTimeout(() => {
            document.getElementById("loderBox").style.display = "none";
            closeSend();
        }, 20000);

        const txData = await wallet.send([[seller, amount, 'bch']]);
        console.log(txData);

        document.getElementById("loderBox").style.display = "none";
        start();

        const tHistory = JSON.parse(localStorage.getItem("tHistory"));
        tHistory.push(txData);

        localStorage.setItem("tHistory", JSON.stringify(tHistory));
        // console.log(tHistory);

        const cdate = new Date();
        const date = cdate.toLocaleDateString();
        const time = cdate.toLocaleTimeString();
        tData(balance, wallet, seller, txData, amount, date, time);
        // showData(wallet);
    } else {
        console.log('Invalid Data');
    }
}

//withdraw section -->

function toggleMenu() {
    if (document.getElementById("menuBox").style.display == "none" || document.getElementById("menuBox").style.display == "") {
        document.getElementById("menuBox").style.display = "flex";

    } else {
        document.getElementById("menuBox").style.display = "none";
    }
}

async function maxAmount() {
    const mnemonic = JSON.parse(localStorage.getItem("wallet")).mnemonic;
    const wallet = await SmartBchWallet.fromSeed(mnemonic);
    const max = await wallet.getMaxAmountToSend();
    console.log(max);
    const maxbch = max["bch"];
    document.getElementById("amount").value = `${maxbch}`;
}

function closeAccount() {
    document.getElementById("myWalletBox").style.display = "flex";
    document.getElementById("accountBox").style.display = "none";
}

function openAccount() {
    document.getElementById("accountBox").style.display = "flex";
    document.getElementById("myWalletBox").style.display = "none";
    document.getElementById("menuBox").style.display = "none";
}

function resetFunction() {
    const conf = confirm("Backup your wallet first, by writing down your 12-word mnemonic. Resetting your account will clear your transaction history. This will not change the balances in your accounts or require you to re-enter your 12-word mnemonic.");

    if (conf) {
        localStorage.clear("wallet");
        localStorage.clear("tHistory");
        localStorage.clear("tData");
    }
    start();
}

// function copyMnemonic() {
//     let mnemonic = document.getElementById("showMnemonic");
//     navigator.clipboard.writeText(mnemonic.innerText);
// }


//------- transaction section --------
function closeTransaction() {
    document.getElementById("myWalletBox").style.display = "flex";
    document.getElementById("transactionBox").style.display = "none";
}

function openTransaction() {
    document.getElementById("myWalletBox").style.display = "none";
    document.getElementById("transactionBox").style.display = "flex";
    document.getElementById("menuBox").style.display = "none";
}


const tData = (balance, wallet, seller, txData, amount, date, time) => {
    const totalSend = balance.bch - txData[0].balance["bch"];
    const fees = totalSend - amount;

    const tDataObj = {
        txId: txData[0].txId,
        from: wallet.address,
        to: seller,
        amount: amount.toFixed(8),
        txFees: fees.toFixed(8),
        totalSend: totalSend.toFixed(8),
        date: date,
        time: time,
    }
    const tData = JSON.parse(localStorage.getItem("tData"));
    tData.push(tDataObj);
    console.log(tData);
    localStorage.setItem("tData", JSON.stringify(tData));
}

const showTransaction = () => {
    const tData = JSON.parse(localStorage.getItem("tData"));
    const thbox = document.getElementById("thbox");
    thbox.innerHTML = "";

    for (let i = tData.length - 1; i >= 0; i--) {
        const element = tData[i];
        // tData.forEach((element) => {
        // console.log(element);

        thbox.innerHTML +=
            `<div class="tbox">
                <span class="span1">Sent</span>
                <span class="span2">(${element.date} - ${element.time})</span>
                <span class="span3">${element.amount} BCH</span>

                <span class="open">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
                        class="bi bi-plus" viewBox="0 0 16 16">
                        <path
                            d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                </span>

                <span class="close">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor"
                        class="bi bi-x" viewBox="0 0 16 16">
                        <path
                            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                </span>

                <div class="tinfo">
                    <div>
                        <h4>Transaction ID</h4>
                        <p>${element.txId}</p>
                    </div>
                    <div>
                        <h4>From</h4>
                        <p>${element.from}</p>
                    </div>
                    <div>
                        <h4>To</h4>
                        <p>${element.to}</p>
                    </div>
                    <div>
                        <h4>Amount</h4>
                        <p>${element.amount} BCH</p>
                    </div>
                    <div>
                        <h4>Gas fee</h4>
                        <p>${element.txFees} BCH</p>
                    </div>
                    <div>
                        <h4>Total Amount</h4>
                        <p>${element.totalSend} BCH</p>
                    </div>
                </div>
            </div>`

        // });
    }
}


const toggleTx = () => {
    const tbox = document.getElementsByClassName("tbox");
    const close = document.getElementsByClassName("close");
    const open = document.getElementsByClassName("open");
    for (let i = 0; i < tbox.length; i++) {
        tbox[i].addEventListener("click", () => {
            const value = tbox[i].classList.toggle("active");
            // console.log(value);
            if (value) {
                close[i].style.display = "block";
                open[i].style.display = "none";
            } else {
                open[i].style.display = "block";
                close[i].style.display = "none";
            }
        });

    }
}

// mnemonic

const toggleSeed = () => {
    document.getElementById("seedBox").classList.remove("active");
    document.getElementById("seedBox").innerHTML = "";
    let mnemonic = JSON.parse(localStorage.getItem("wallet")).mnemonic;
    let ar = mnemonic.split(" ");
    ar.forEach((e, i) => {
        // console.log(i+1,e);
        document.getElementById("seedBox").innerHTML += `<div class="seedItem">${i + 1}. ${e}</div>`;
    })

    document.getElementById("copybtn").addEventListener("click", () => {
        // console.log('clicked');
        navigator.clipboard.writeText(mnemonic);
        document.getElementById("copybtn").innerText = "copied";
        setTimeout(() => {
            document.getElementById("copybtn").innerText = "copy";
        }, 2000)
    })

}

const toggleShow = ()=>{
    const showHide = document.getElementById("show-hide");
    const seedBox = document.getElementById("seedBox");

        seedBox.classList.toggle("active");
        if (seedBox.classList.contains("active")) {
            showHide.innerText = "hide";
        } else {
            showHide.innerText = "show";
        }
}