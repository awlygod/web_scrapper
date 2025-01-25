const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");

admin.initializeApp();

const db = admin.database();

exports.scrapeDataEveryMinute = functions.pubsub
    .schedule("every 1 minutes")
    .onRun(async (context) => {
      console.log("Scraping data from the webpage...");

      try {
        const response = await axios.get(
            "https://webscrapper-9820d.web.app",
        );
        const $ = cheerio.load(response.data);

        const treatments = [];
        $("#treatment-list tbody tr").each((index, element) => {
          const treatmentName = $(element)
              .find("td")
              .eq(0)
              .text()
              .trim();
          const price = parseFloat(
              $(element).find("td").eq(1).text().trim(),
          );

          treatments.push({treatmentName, price});
        });

        await db.ref("scrapedTreatments").set(treatments);
        console.log("Data successfully updated in Firebase!");
      } catch (error) {
        console.error("Error scraping data: ", error);
      }
    });
