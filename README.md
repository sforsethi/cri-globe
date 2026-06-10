# CRI Globe

An interactive 3D globe with event polaroids, built with [cobe](https://github.com/shuding/cobe). Drag to spin; click a polaroid to view the event.

No build step — pure HTML + CSS + ES modules. Just serve the folder.

## Run locally

```bash
python3 -m http.server 8090
# then open http://localhost:8090
```

## Embed

Hosted on GitHub Pages; embed anywhere with an iframe:

```html
<iframe
  src="https://sforsethi.github.io/cri-globe/"
  title="CRI Globe"
  style="width:100%; height:600px; border:0;"
  loading="lazy"
></iframe>
```

## Notes

- The polaroid cards use **CSS Anchor Positioning**, supported in **Chrome/Edge 125+**. In Safari/Firefox the globe still spins, but the polaroids won't position correctly yet.

## Structure

```
index.html            Page shell: globe canvas + event modal
styles.css            Globe, polaroid, and modal styling
src/globe.js          cobe globe, 15 markers, polaroids, click-to-expand
vendor/cobe.module.js Vendored cobe library
assets/event1-8.png   Event photos shown in the polaroids
```
