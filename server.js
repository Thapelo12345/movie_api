const express = require('express')
const app = express()
const cheerio = require('cheerio')
const axios = require('axios')
const pretty = require('pretty')
const cors = require('cors')
require('dotenv').config()

app.use(cors());
app.use(express.json())

app.get('/', async (req, res) => {
  try {
    const idCounter = { current: 0 }; // Counter for unique IDs
    const items = [];

    // Function to scrape a page
    async function scrapePage(url) {
      const response = await axios(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const anchors = $('div.card.style_1').find('a.image');

      for (let i = 0; i < anchors.length; i++) {
        const element = anchors[i];
        const movieUrl = 'https://www.themoviedb.org' + $(element).attr('href');

        // Fetch the individual movie page
        await delay(500);
        const response1 = await axios(movieUrl);
        const html1 = response1.data;

        const $1 = cheerio.load(html1);
        idCounter.current++;

        const title = $1('h2 a').text();
        const picUrl = $1('div.poster')
          .find('div.image_content')
          .find('div.blurred')
          .find('img.poster.w-full')
          .attr('src');
        const description = $1('div.overview p').text();
        const year = $1('h2 span.tag.release_date').text();
        const age = $1('.facts .certification').text();
        const time = $1('.facts .runtime').text()
        const genres = [];
        $1('span.genres').find('a').each((index, item) => {
          genres.push($1(item).text());
        });

        items.push({ id: idCounter.current, title, picUrl, description, year, genres, age , time});
      }
    }

    // Scrape the first page
    await scrapePage('https://www.themoviedb.org/movie');

    // Scrape the second page
    await scrapePage('https://www.themoviedb.org/movie?page=2');

    res.json({ items });
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies' + error });
  }
});

// Helper function for delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{console.log('App runing on port ', PORT)})