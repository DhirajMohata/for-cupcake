# 💗 Cupcake's Love Box Adventure

A cute cartoon "walk with me" shopping adventure. You and her (a bear and a bunny 🐻🐰)
walk a map stop by stop. At each stop she taps floating gifts, opens them in the
shopping app, and adds only what she loves. After that she pastes her own links into the Wish Well,
fills in her address, and sends the whole Love Box to your WhatsApp.

## Files
| File | What it is |
|---|---|
| `config.js` | **The only file you need to edit.** Names, stops, items, GIFs, notes |
| `index.html`, `style.css`, `app.js` | The site itself, so you don't need to touch these |
| `images/` | Drop product photos here (e.g. `images/necklace.jpg`) |
| `gifs/` | Optional: your own GIFs (e.g. `gifs/us.gif`) |

## Adding your items (config.js)
```js
{ name: "Dainty Heart Necklace", emoji: "💗",
  image: "images/necklace.jpg",          // or a full https:// image link
  link: "https://amzn.in/d/xxxx",        // product page; opens the app on her phone
  note: "Closest thing to wearing my heart" }
```
- **image**: easiest way is to open the product, long-press/right-click the photo, choose
  "Copy image address", and paste it. Or save the photo into `images/`.
- **link**: use the app's own *Share → Copy link*. Those links open straight in the
  Amazon / Myntra / Nykaa app on her phone.
- Leave `image: ""` to show a cute emoji tile instead.
- Add or remove whole stops in `levels` and the map grows or shrinks on its own.

Also set at the top:
- `whatsappNumber: "91XXXXXXXXXX"` is your number with country code, digits only
- `herName`, `occasion`, `introLine`, `finalNote` (your little letter at the end)

## Try it on your laptop
```bash
cd "/Users/dhirajmohata/Cupcakes birthday" && python3 -m http.server 5178
```
Then open http://localhost:5178

Her progress saves on her phone, so if she closes the tab she continues where she left off.
To test from scratch, tap **"start the adventure over"** at the end.

## Sending her the link
She needs it online. The free and easy option is to go to https://app.netlify.com/drop and drag
this whole folder in. You get a link like `something.netlify.app` to send her.
(GitHub Pages works too.)
