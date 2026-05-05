const url = "https://siceam.sev.gob.mx/ValidaQR.aspx?data=CB76EE9DF6AD6B611A087368B2F5C9AECE3672B4D050108C&token=EZeE3Eez4y6KFlvs7pfP2hHBWZg2mf8VRgJWV3nOflWnXNK1qw2OxGWe2Y%2BdgfX7xgRyghAB8rdyj%2FuIdagyXHCW2SzZe%2FnpiN5fmEbpWlCthjJQvfuO92X6Bn9sOIc%2FGV75NKwvTPJ%2BhCk7pqtGp1EttemZjdR3ZB4qztEMrKw1UZbU0isZyFwTq%2Fqi1movHrS5C%2FnkGpmXON4mti%2Fk%2FncZXkVP90Erw9pL03biN4pWEDptn14DoUOfTWsKY4Y2gPSr1SR0Sv0MrSoA318grJIm2glm7ACdEFBZKtCITycD14%2B0cS7nY0fXrsaTcgISGn24aZrbvF%2FIaP2Ml3ouiQ%3D%3D";
fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
})
.then(r => r.text())
.then(t => require('fs').writeFileSync('sev_page.html', t))
.catch(console.error);
