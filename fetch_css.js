const url = "https://siceam.sev.gob.mx/Estilos/Estilos.css";
fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
.then(r => r.text())
.then(t => require('fs').writeFileSync('Estilos.css', t))
.catch(console.error);
