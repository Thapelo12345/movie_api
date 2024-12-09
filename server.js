const express = require('express')
const cors = require('cors');
const app = express()
const cheerio = require('cheerio')
const axios = require('axios')
const pretty = require('pretty')
require('dotenv')

app.use(cors({origin: 'http://localhost:3000'}));

app.use(express.json())

app.get('/', async (req, res) => {
  try {
const itemObj = []

    // Fetch the main page
    const response = await axios('https://www.themoviedb.org/movie');
    const html = response.data;
    const $ = cheerio.load(html);

    // Collect all anchor elements
    const anchors = $('div.card.style_1').find('a.image');

    for (let i = 0; i < anchors.length; i++) {
      const element = anchors[i];
      const movieUrl = 'https://www.themoviedb.org' + $(element).attr('href');

      // Fetch the second HTML page
      const response1 = await axios(movieUrl);
      const html1 = response1.data;

      // Load the second HTML into Cheerio
      const $1 = cheerio.load(html1);

      // Extract some data from the second page
      let title = $1('h2 a').text()
      const picUrl = $1('div.poster')
      .find('div.image_content')
      .find('div.blurred')
      .find('img.poster.w-full')
      .attr('src');
      const description = $1('div.overview p').text()

      const year = $1('h2 span.tag.release_date').text()
      const genres = []
      $1('span.genres').find('a').each((index, item)=>{genres.push($1(item).text())})

      itemObj.push({title, picUrl, description, year, genres})

    }//end of 4 loop

    res.json({ itemObj});
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies' + error });
  }
})//end of movies router


const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{console.log('App runing on port ', PORT)})