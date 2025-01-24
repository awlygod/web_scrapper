import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDLpBk_XVOwiTfvJlegt96l6PRMg8-nb-Y",
  authDomain: "webscrapper-9820d.firebaseapp.com",
  databaseURL: "https://webscrapper-9820d-default-rtdb.firebaseio.com/",
  projectId: "webscrapper-9820d",
  storageBucket: "webscrapper-9820d.firebasestorage.app",
  messagingSenderId: "842116199863",
  appId: "1:842116199863:web:03b2ec3d1d1a6d50312432",
  measurementId: "G-M01M36J9CG"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Variable to store last scraped data for comparison
let lastScrapedData = [];
let timeoutId; // To store the timeout ID for debouncing

function createSuccessDialog() {
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.top = '50%';
  dialog.style.left = '50%';
  dialog.style.transform = 'translate(-50%, -50%)';
  dialog.style.backgroundColor = '#4CAF50';
  dialog.style.color = 'white';
  dialog.style.padding = '20px';
  dialog.style.borderRadius = '10px';
  dialog.style.zIndex = '1000';
  dialog.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
  dialog.style.textAlign = 'center';

  const message = document.createElement('p');
  message.textContent = 'Data Scraped Successfully!';
  message.style.fontSize = '18px';
  message.style.marginBottom = '15px';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';
  closeBtn.style.backgroundColor = 'white';
  closeBtn.style.color = '#4CAF50';
  closeBtn.style.border = 'none';
  closeBtn.style.padding = '10px 20px';
  closeBtn.style.borderRadius = '5px';
  closeBtn.style.cursor = 'pointer';
  
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(dialog);
  });

  dialog.appendChild(message);
  dialog.appendChild(closeBtn);
  document.body.appendChild(dialog);
}

function scrapeDataAndSync() {
  const table = document.querySelector("#treatment-list tbody");
  const rows = table.querySelectorAll("tr");

  const treatments = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("td");
    const treatmentName = cells[0].textContent.trim();
    const price = parseFloat(cells[1].textContent.trim());

    treatments.push({ treatmentName, price });
  });

  // Check if the new data is different from the last scraped data
  if (JSON.stringify(treatments) !== JSON.stringify(lastScrapedData)) {
    // Clear previous timeout (reset debounce)
    clearTimeout(timeoutId);

    // Set a new timeout to scrape the data after 5 seconds
    timeoutId = setTimeout(() => {
      // Data has changed, so sync it with Firebase
      set(ref(database, "scrapedTreatments"), treatments)
        .then(() => {
          lastScrapedData = treatments; // Update last scraped data
          createSuccessDialog();
        })
        .catch((error) => {
          console.error("Error syncing scraped data: ", error);
        });
    }, 5000); // 5000ms = 5 seconds
  } else {
    console.log("No new data to scrape.");
  }
}

// Poll every 10 seconds (10000 milliseconds)
setInterval(scrapeDataAndSync, 10000);

// Optional: Trigger the first scrape immediately
scrapeDataAndSync();
