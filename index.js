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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API Proxy de ENARGAS escuchando en el puerto ${PORT}`);
    console.log(`URL de prueba: http://localhost:${PORT}/api/gnc?tipo_consulta=5;1&cuadro=1&periodo=9999`);
});
