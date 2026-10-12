# Presentación · Banco de ideas de Optimizo

Página estática (HTML, CSS y JS, sin dependencias) para elegir o descartar las ideas de contenido.
Usa el sistema de diseño del guion visual (https://optimizo-cl.github.io/guion/): tokens de color, Inter, cerámica con grano,
paleta A (teal) / B (mandarina), tema claro y oscuro, y la transición del punto que abre un círculo.

## Cómo verla
- Opción 1: abrir `index.html` con doble clic.
- Opción 2: ejecutar `node servir.js` y abrir http://localhost:5173

## Cómo se usa
- Flechas ← → o espacio para cambiar de lámina. `F` = pantalla completa.
- En cada tarjeta: **Elegir** o **Descartar**. Pulsar de nuevo el mismo botón deshace la decisión.
- Abajo: paleta A/B y tema claro/oscuro.
- Las decisiones se guardan en el navegador (localStorage). La última lámina permite copiar el resumen, descargar un JSON o reiniciar.

## Archivos
- `data.js`: ideas exportadas desde el banco de Notion (sin credenciales).
- `assets/`: isotipo, logos y fuente Inter tomados del guion visual, y las texturas de grano.

## Publicarla en GitHub Pages (opcional)
Subir esta carpeta a un repositorio y activar Pages desde Settings → Pages. No hay nada que compilar.
