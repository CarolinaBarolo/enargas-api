const express = require('express');
const cors = require('cors');
const http = require('http');
const https = require('https');

const app = express();
app.use(cors());

app.get('/api/gnc', async (req, res) => {
    // Parámetros por defecto
    const tipoConsulta = req.query.tipo_consulta || '5;1'; // 5;1 = Vehículos, 5;2 = Prácticas, 5;3 = Precios
    const cuadro = req.query.cuadro || '1';
    const periodo = req.query.periodo || '9999'; // 9999 = Todos los años

    const postData = new URLSearchParams({
        'tipo-consulta-gnc': tipoConsulta,
        'cuadro': cuadro,
        'periodo': periodo,
        'desarrollo': '1', // Bypass de validación/Recaptcha en el sistema de Enargas
        'Excel': '1',
        'token': '',
        'action': 'sicgnc_consulta_estadisticas'
    }).toString();

    const options = {
        hostname: 'www.enargas.gob.ar',
        port: 443,
        path: '/secciones/gas-natural-comprimido/exportar-datos-operativos-gnc-xls-pdf-n.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // Configuramos las cabeceras para que el cliente (Power BI/Browser) entienda que es un Excel
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/vnd.ms-excel',
            'Content-Disposition': `attachment; filename="estadisticas_gnc_${tipoConsulta}_${cuadro}.xls"`
        });

        // Hacemos un pipe directo del stream de Enargas hacia la respuesta de nuestra API
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (e) => {
        console.error(`Error realizando la petición a Enargas: ${e.message}`);
        res.status(500).json({ error: 'Error interno de proxy' });
    });

    // Escribimos el cuerpo del POST y finalizamos la petición
    proxyReq.write(postData);
    proxyReq.end();
});

app.get('/api/pozos', (req, res) => {
    // La URL directa de descarga obtenida del portal de datos de energía
    const csvUrl = 'http://datos.energia.gob.ar/dataset/c846e79c-026c-4040-897f-1ad3543b407c/resource/cb5c0f04-7835-45cd-b982-3e25ca7d7751/download/capitulo-iv-pozos.csv';

    http.get(csvUrl, (proxyRes) => {
        // Configuramos las cabeceras para que el cliente lo interprete como CSV
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="produccion_pozos.csv"'
        });

        // Hacemos un pipe directo del CSV hacia la respuesta de nuestra API
        proxyRes.pipe(res);
    }).on('error', (e) => {
        console.error(`Error realizando la petición a Datos Energía: ${e.message}`);
        res.status(500).json({ error: 'Error interno de proxy al descargar CSV' });
    });
});

app.get('/api/precios', (req, res) => {
    // URL directa de descarga de "Precios en Surtidor - Resolución 314/2016"
    const csvUrl = 'http://datos.energia.gob.ar/dataset/1c181390-5045-475e-94dc-410429be4b17/resource/80ac25de-a44a-4445-9215-090cf55cfda5/download/precios-en-surtidor-resolucin-3142016.csv';

    http.get(csvUrl, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="precios_surtidor.csv"'
        });

        proxyRes.pipe(res);
    }).on('error', (e) => {
        console.error(`Error realizando la petición de precios a Datos Energía: ${e.message}`);
        res.status(500).json({ error: 'Error interno de proxy al descargar CSV de precios' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Proxy de ENARGAS escuchando en el puerto ${PORT}`);
    console.log(`URL de prueba: http://localhost:${PORT}/api/gnc?tipo_consulta=5;1&cuadro=1&periodo=9999`);
});
