const puppeteer = require('puppeteer');
const prettier = require('prettier');
const atob = require('atob');
const btoa = require('btoa');
var axios = require('axios');

const requestCache = new Map();
const email= '';
const password = '';

var config = {
  method: 'post',
  url: '',
  headers: { 
    'Content-Type': 'application/json'
  },
};



(async() => {
    const wsChromeEndpointurl = 'ws://127.0.0.1:9222/devtools/browser/ee6d3474-5deb-43f1-abcf-16f51d9a43c4'; // TODO: replace me
    // const browser = await puppeteer.connect({
    //     browserWSEndpoint: wsChromeEndpointurl,
    // });
    const browser = await puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions'],headless: false,});
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 })
    const url = 'https://mail.google.com/chat/u/0/#chat/welcome';
    await page.goto(url);
    await page.screenshot({ fullPage: true, path: 'screenshot.png' })
    console.log( await page.url());
    await page.waitForSelector("#identifierId");
    await page.type("#identifierId", email);


    await page.waitForSelector("#identifierNext");
    await page.click("#identifierNext");

    await page.waitFor(2000);
    await page.type(".whsOnd", password);
    console.log('ADASDA');
    await page.waitForSelector('input[type="password"]');

     await page.waitFor(2000);

    await page.click(".VfPpkd-vQzf8d");
    
    // console.log('HERE');
    // // await page.click(".njhDLd");
    
    intercept(page, urlPatterns, transform);



})();
const urlPatterns = [
    '*'
  ]
  
  function transform(source) {
    return prettier.format(source, {parser:'babel'});
  }
async function intercept(page, patterns, transform) {
  
    const client = await page.target().createCDPSession();
  
    await client.send('Network.enable');
  
    await client.send('Network.setRequestInterception', { 
      patterns: patterns.map(pattern => ({
        urlPattern: pattern, resourceType: 'XHR', interceptionStage: 'HeadersReceived'
      }))
    });
  
    client.on('Network.requestIntercepted', async ({ interceptionId, request, responseHeaders, resourceType }) => {
      

      if(request.url.includes('https://chat.google.com/u/0/webchannel/events?')){
        
        const response = await client.send('Network.getResponseBodyForInterception',{ interceptionId });
            const bodyData = response.base64Encoded ? atob(response.body) : response.body;
            const a =bodyData;
            const res= bodyData.split(',');
            
            if(res.length>65 && res.length<70){
            let message = res[30]
            message = message.slice(1,message.length-1)
            console.log('Message ',message)
            // console.log('here1',res.length)
          
            if(message!==null ){
            var data = JSON.stringify({
              "content": message,
              "sender": "bot"
            });

            config.data= data;

            axios(config)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
              console.log(error);
            }); 
          }
          }
          else if(a.length>700){
            let message = res[73]
            message = message.slice(1,message.length-1)
            console.log('Message:',message)
            if(message!==null){
            var data = JSON.stringify({
              "content": message,
              "sender": "bot"
            });
            
            config.data = data;

            axios(config)
            .then(function (response) {
              console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
              console.log(error);
            }); 
            // console.log('here1',res.length)
            }
          }

      }


      client.send('Network.continueInterceptedRequest', {
        interceptionId,
        // rawResponse: btoa('HTTP/1.1 200 OK' + '\r\n' + newHeaders.join('\r\n') + '\r\n\r\n' + newBody)
      });
    });
  
  }



