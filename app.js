const chrome = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-extra')
const fs = require('fs')
const { randomizeUsername } = require('./utils.js')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

;(async () => {
    const username = randomizeUsername()
    let browser

    const isDev = false

    if (isDev) {
        browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: false,
            ignoreHTTPSErrors: true,
            args: ['--disable-features=site-per-process']
        })

    } else {
        browser = await puppeteer.launch({
            args: chrome.args,
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath(),
            headless: 'new',
            ignoreHTTPSErrors: true
        })
    }

    let serverURL;

    const page = await browser.newPage();

    for(let i = 1; i <= 4; i++) {
        await page.goto('https://createssh.net/vmess-websocket/singapore?page=' + i)

        const list = await page.evaluate((e) => {
            let result = [];

            const element = document.querySelectorAll('.card.pricing');
            element.forEach((item) => {
                const isOnline = item.querySelector('.status').classList.contains('status-green');
                const isAvailable = item.querySelector('[role=button]').classList.contains('btn-primary');
                const href = item.querySelector('[role=button]').getAttribute('href');

                if(isOnline && isAvailable) {
                    result.push(href);
                }
            })

            return result;
        })

        if(list.length > 0) {
            serverURL = list;
            break;
        }
    }

    await page.goto(serverURL[0]);

    await page.type('#username', username.substring(0, 9));
    await page.evaluate( () => document.getElementById("sni").value = "")
    await page.type('#sni', 'www.skillacademy.com');

    await page.click('#term');

    await new Promise(r => setTimeout(r, 10000));

    const submitSelector = '.subb';
    await page.waitForSelector(submitSelector);
    await page.click(submitSelector);

    await new Promise(r => setTimeout(r, 30000));

    const resultSelector = await page.waitForSelector('#openclass')
    const openclash = await resultSelector.evaluate((e) => e.textContent)


    fs.writeFileSync("data.yaml", openclash);

    await browser.close();
})()
