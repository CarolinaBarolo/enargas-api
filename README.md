# ENARGAS Proxy API para Power BI

Esta API te permite extraer y descargar directamente los archivos Excel de las estadísticas del GNC del portal de ENARGAS (https://www.enargas.gob.ar/secciones/gas-natural-comprimido/estadisticas.php) usando simples peticiones GET, lo cual facilita enormemente la integración con herramientas como **Power BI**.

El servidor hace de proxy, interactuando con los formularios y saltando las validaciones intermedias para entregarte directamente el Excel.

## 🚀 Cómo iniciar el servidor

1. Abre tu terminal en esta carpeta (`enargas-api`).
2. Instala las dependencias (si no lo has hecho):
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```
4. El servidor estará escuchando en `http://localhost:3000`.

## 📊 Cómo conectarlo a Power BI

Power BI puede consumir directamente la respuesta de esta API, ya que le envía un archivo binario `.xls`.

1. En Power BI Desktop, ve a **Obtener datos (Get Data)** -> **Web**.
2. Selecciona **Básico**.
3. En el campo de URL, pega la siguiente dirección:
   `http://localhost:3000/api/gnc?tipo_consulta=5;1&cuadro=1&periodo=9999`
4. Haz clic en **Aceptar**.
5. Power BI reconocerá automáticamente que es un archivo de Excel y abrirá el **Navegador** para que selecciones las hojas (generalmente "Worksheet") y transformes los datos como necesites.

## ⚙️ Parámetros de la URL

Puedes modificar la URL cambiando los parámetros para obtener diferentes reportes:

### `tipo_consulta` (Categoría principal)
- `5;1`: Cantidad de Vehículos habilitados
- `5;2`: Prácticas informadas por Tipo de Operación
- `5;3`: Precios de GNC al Público

### `cuadro` (El sub-reporte)
- **Si `tipo_consulta=5;1`**:
  - `1`: Total General
  - `2`: Taxis
  - `3`: Pick-Ups
  - `4`: Particulares
  - `5`: Oficiales
  - `6`: Motos
  - `7`: Otros
- **Si `tipo_consulta=5;2`**:
  - `1`: Conversiones de vehículos
  - `2`: Desmontajes de equipos en vehículos
  - `3`: Revisiones periódicas de vehículos
  - `4`: Modificaciones de equipos en vehículos
  - `5`: Revisiones de Cilindros
  - `6`: Cilindro de GNC revisiones CRPC
- **Si `tipo_consulta=5;3`**:
  - `1`: Precios GNC

### `periodo` (El año)
- Puedes enviar el año específico de 4 dígitos (ej. `2023`, `2022`).
- Para **todos los años**, usa `9999`.

### Ejemplos Adicionales:
- **Precios de GNC de todos los años:**
  `http://localhost:3000/api/gnc?tipo_consulta=5;3&cuadro=1&periodo=9999`
- **Conversiones de vehículos del año 2023:**
  `http://localhost:3000/api/gnc?tipo_consulta=5;2&cuadro=1&periodo=2023`