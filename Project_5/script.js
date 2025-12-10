document.addEventListener('DOMContentLoaded', () => {
    // --- Game State ---
    let wallet = 150; // Starting money
    let inventory = [];
    let isTalking = false;
    let talkInterval = null;
    let currentDialogue = "";
    let charIndex = 0;
    let tradeMode = false;

    // --- DOM Elements ---
    const walletEl = document.getElementById('wallet-amount');
    const shopTableBody = document.querySelector('#shop-table tbody');
    const dialogueTextEl = document.getElementById('dialogue-text');
    const bobOverlay = document.getElementById('bob-overlay');

    // --- Items Data ---
    const items = [
        { 
            id: 'hammer', 
            name: 'Hammer', 
            price: 15, 
            img: 'assets/hammer.png', 
            lore: "That hammer? Sturdy. Reliable. My grandfather built his first doghouse with it. I'd hate to see it go, honestly." 
        },
        { 
            id: 'hammer2', 
            name: 'Sledge', 
            price: 25, 
            img: 'assets/hammer_2.png', 
            lore: "Heavy duty. Good for breaking things. Or fixing things, if you hit them hard enough. Just... be careful." 
        },
        { 
            id: 'saw', 
            name: 'Hand Saw', 
            price: 20, 
            img: 'assets/saw.png', 
            lore: "Sharp as the day I bought it. Cut through a lot of timber with that one. It's got history." 
        },
        { 
            id: 'wrench', 
            name: 'Wrench', 
            price: 12, 
            img: 'assets/wrench.png', 
            lore: "A classic adjustable wrench. It's seen a lot of leaky pipes. Kind of attached to it, to be frank." 
        },
        { 
            id: 'scraper', 
            name: 'Scraper', 
            price: 8, 
            img: 'assets/scraper.png', 
            lore: "Just a scraper. But it's *my* scraper. You sure you need it?" 
        },
        { 
            id: 'tape', 
            name: 'Tape Measure', 
            price: 10, 
            img: 'assets/tape_measure.png', 
            lore: "Measures up to 25 feet. I've measured my kids' height with this every year. Sentimental value, you know?" 
        },
        { 
            id: 'level', 
            name: 'Level', 
            price: 18, 
            img: 'assets/level.png', 
            lore: "Keeps things straight. Unlike my brother-in-law. Heh. But seriously, it's a good tool." 
        },
        { 
            id: 'scissors', 
            name: 'Shears', 
            price: 15, 
            img: 'assets/scissors.png', 
            lore: "Garden shears. Kept my rose bushes in check for decades. They're like family." 
        },
        { 
            id: 'fish', 
            name: 'Finnegan', 
            price: 500, 
            img: 'assets/fish.png', 
            lore: "NO! Not Finnegan! That's my best friend! My wife says he takes up too much counter space, but look at him! He's majestic! Please, don't buy him!" 
        }
    ];

    // --- Initialization ---
    updateWallet();
    renderShop();
    speak("Welcome to Bob's Rentals & Sales. Look around, but... try not to buy the good stuff, alright?");

    // --- Functions ---

    function updateWallet() {
        walletEl.textContent = wallet;
    }

    function renderShop() {
        shopTableBody.innerHTML = '';
        items.forEach(item => {
            // Skip if already bought
            if (inventory.includes(item.id)) return;

            const tr = document.createElement('tr');
            
            // Image Cell
            const imgTd = document.createElement('td');
            const img = document.createElement('img');
            img.src = item.img;
            img.className = 'item-icon';
            imgTd.appendChild(img);
            
            // Name Cell
            const nameTd = document.createElement('td');
            nameTd.textContent = item.name;
            
            // Price Cell
            const priceTd = document.createElement('td');
            priceTd.textContent = `$${item.price}`;
            
            // Actions Cell
            const actionTd = document.createElement('td');
            
            const askBtn = document.createElement('button');
            askBtn.className = 'action-btn btn-ask';
            askBtn.textContent = 'ASK';
            askBtn.onclick = () => askAbout(item);
            
            const buyBtn = document.createElement('button');
            buyBtn.className = 'action-btn btn-buy';
            buyBtn.textContent = tradeMode ? 'TRADE' : 'BUY';
            buyBtn.onclick = () => buyItem(item);
            
            actionTd.appendChild(askBtn);
            actionTd.appendChild(buyBtn);
            
            tr.appendChild(imgTd);
            tr.appendChild(nameTd);
            tr.appendChild(priceTd);
            tr.appendChild(actionTd);
            
            shopTableBody.appendChild(tr);
        });

        // Check for empty shop
        if (items.every(i => inventory.includes(i.id))) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 4;
            td.textContent = "Sold Out. You took everything. Even Finnegan...";
            td.style.textAlign = 'center';
            td.style.padding = '20px';
            tr.appendChild(td);
            shopTableBody.appendChild(tr);
        }
    }

    function askAbout(item) {
        speak(item.lore);
    }

    function buyItem(item) {
        if (tradeMode) {
            // Trading Logic (Simplified: Free items if broke)
            speak(`Fine. Take the ${item.name}. Just... take care of it.`);
            inventory.push(item.id);
            renderShop();
            return;
        }

        if (wallet >= item.price) {
            if (item.id === 'fish') {
                speak("You... you actually bought him. Finnegan... goodbye, old friend. *Sniff*");
            } else {
                speak(`Sold. *Sigh* I'll miss that ${item.name}.`);
            }
            wallet -= item.price;
            inventory.push(item.id);
            updateWallet();
            renderShop();
            checkEconomy();
        } else {
            speak("You don't have enough cash, stranger. And I don't give credit.");
        }
    }

    function checkEconomy() {
        // Check if user can afford anything left
        const availableItems = items.filter(i => !inventory.includes(i.id));
        if (availableItems.length === 0) return;

        const cheapest = Math.min(...availableItems.map(i => i.price));
        
        if (wallet < cheapest && !tradeMode) {
            setTimeout(() => {
                speak("Looks like you're tapped out, kid. Tell you what... since you've been a good customer, maybe we can work out a trade. Especially if you give me Finnegan back.");
                tradeMode = true;
                renderShop(); // Re-render to update buttons
            }, 3000);
        }
    }

    // --- Dialogue System ---

    function speak(text) {
        // Stop current speech
        if (talkInterval) clearInterval(talkInterval);
        
        currentDialogue = text;
        charIndex = 0;
        dialogueTextEl.textContent = "";
        isTalking = true;
        
        // Start talking animation
        bobOverlay.style.visibility = 'visible';
        
        talkInterval = setInterval(() => {
            if (charIndex < currentDialogue.length) {
                dialogueTextEl.textContent += currentDialogue.charAt(charIndex);
                charIndex++;
                
                // Toggle mouth every few chars for effect
                if (charIndex % 3 === 0) {
                    bobOverlay.style.visibility = (bobOverlay.style.visibility === 'visible') ? 'hidden' : 'visible';
                }
            } else {
                // Finished
                clearInterval(talkInterval);
                isTalking = false;
                bobOverlay.style.visibility = 'hidden';
            }
        }, 30); // Typing speed
    }
});
