const chrome = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
// const express = require('express')
// const app = express()
// const port = 3000
const { randomizeUsername } = require('./utils.js');

(async () => {
    const username = randomizeUsername()
    const isProd = process.env.NODE_ENV === 'production'

    let browser

    // if (isProd) {
        browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath(),
            headless: 'new',
            ignoreHTTPSErrors: true
        })
    // } else {
    //     browser = await puppeteer.launch({
    //         headless: false,
    //         executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    //     })
    // }

    const page = await browser.newPage()
    await page.goto('https://opentunnel.net/v2ray/');

    const list = await page.evaluate((e) => {
        const baseURL = 'https://opentunnel.net'

        const result = [];
        const element = document.querySelectorAll('.card.h-100.text-muted');

        element.forEach((item) => {
            const isAvailable = item.querySelector('[role=button]').classList.contains('btn-primary');
            const url = item.querySelector('[role=button]').getAttribute('href');

            if (isAvailable) {
                result.push({
                    'location': item.querySelector('.fw-bold').textContent,
                    'url': `${baseURL}${url}`
                })
            }

        })

        return result;
    })

    let dataURL;

    const hasSgServer = list.find((el) => el.location.includes('SG')).length > 0
    if (hasSgServer) dataURL = list.find((el) => el.location.includes('SG'))[0]
    dataURL = list[Math.floor(Math.random() * list.length)]

    await page.goto(dataURL.url);

    await page.type('#username', username);
    await page.type('#bh', 'www.skillacademy.com');

    const submitSelector = '.subb';
    await page.waitForSelector(submitSelector);
    await page.click(submitSelector);

    const resultSelector = await page.waitForSelector('#confighttp')
    const result = await resultSelector.evaluate((e) => e.textContent)

    await browser.close();

    fs.writeFileSync("data.txt", result);
})()
// })

// app.listen(port, () => {
//     console.log(`Example app listening on port ${port}`)
// })
