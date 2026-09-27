# BDOPS landing page

Responsive landing page using the supplied BDOPS logo and BEDE artwork, built with HTML, CSS, JavaScript, and Vite.

## Run

```sh
npm install
npm run dev -- --port 5174
```

Open the URL printed by Vite. Port 5174 avoids the separate application using 5173 on this workspace.

## Production

```sh
npm run build
npm run preview
```

Publish the complete `dist` folder, including its mascot assets, to a static host.

## Browser check

With the development server running on port 5174:

```sh
npm test
```

Install Chromium with `npx playwright install chromium` if it is not already available. Set `TEST_URL` to test another server.

Tests cover image decoding, curated mascot placement, Discord destinations, technology tabs and keyboard navigation, BEDE moods, mobile navigation, internal destinations, horizontal overflow at 320-2560px, breakpoint boundaries, and landscape orientation, and reduced motion. Screenshots are saved under `.playwright`.

## Content and assets

- `index.html`: page content, curated mascot placement, Discord invitation, and Instagram profile.
- `style.css`: responsive grids, justified paragraphs, Inter body text, and Plus Jakarta Sans headings from Google Fonts.
- `main.js`: navigation, technology tabs, greetings, and BEDE mood picker.
- `public/mascots`: source collection retained; the full gallery is no longer displayed. Only selected named artwork is requested by the page.
- `public/bede-*.png`: named mascot assets used throughout the page.
- Join buttons use `https://discord.gg/c6NDJP8HFc`.

Content stays visible without scroll animations or JavaScript. Images below the hero load lazily with reserved dimensions. Digital solutions remain described as developing capabilities.

Mascots appear in four places: the hero greeting, community introduction, interactive BEDE portrait, and Discord invitation. Activity cards use compact icons.

UI icons use Google Material Symbols Outlined, with an icon subset loaded through the Google Fonts API. Font and icon loading is covered by the browser check.

Visual direction: editorial typography, a framed BEDE hero illustration, restrained navy surfaces, and a light activity grid. Headlines use a fluid scale; body paragraphs remain justified.

Discord and Instagram brand icons are inline SVGs from Simple Icons 11.15.0 (CC0): https://github.com/simple-icons/simple-icons/tree/11.15.0/icons. They require no external icon request at runtime.
