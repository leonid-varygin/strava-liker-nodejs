const puppeteer = require('puppeteer');
// const schedule = require('node-schedule');
const userAgent = require('user-agents');
require('dotenv').config()

// const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(0, 6)];
// rule.hour = 10;
// rule.minute = 30;

// schedule.scheduleJob(rule,
//     //Для Linux необходимо передать в функцию main ({ executablePath: '/usr/bin/chromium-browser' })
//     () => main()
//         .then(() => console.log('Лайки отгружены 😍'))
//         .catch(e => console.log('Случилась поломка 😞: ' + e.message)))

async function main(variant) {
    const browser = await puppeteer.launch({
        headless: false,
        ...variant
    });

    const page = await browser.newPage();
    // await page.setUserAgent('5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36');

    //Решить проблему с капчёй, когда запускаем браузер в режиме headless. возможно поможет настройка UserAgent
    await page.setUserAgent(userAgent.toString())
    await page.setViewport({ width: 1920, height: 1080 })

    await page.goto('https://www.strava.com/dashboard/following/220', {waitUntil: 'load', timeout: 10000});

    await page.type('#email', process.env.STRAVA_LOGIN);
    await page.type('#password', process.env.STRAVA_PASSWORD);

    await Promise.all([
        page.click('#login-button'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    await page.evaluate(() => {
        document.querySelectorAll('[title="Поставить зачет"]').forEach(el => {
            el.click()
            console.log('Успешный лайбон 🤩')
        })
        document.querySelectorAll('[title="Поставьте зачет первым!"]').forEach(el => {
            el.click()
            console.log('Успешный лайбон для первых тренировок 💪')
        })

        const arrButtons = document.querySelectorAll('button')
        arrButtons.forEach(el => {
            if(el.innerText === 'Принять участие в задаче') {
                el.click()
                console.log('Успешно принята задача 💪')
            }

        })

    })

    await page.screenshot({ path: 'result.png'})

    await browser.close()

    await process.exit()
}
main()