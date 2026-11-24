/* =====================================================================
   💗  EDIT THIS FILE ONLY  💗
   Everything she sees comes from here: names, stops, items, GIFs, notes.
   - image: a link to a picture OR a file you drop in the /images folder
            (e.g. "images/hoodie.jpg"). Leave "" to show the cute emoji tile.
   - link:  the product link (Savana / Amazon / Myntra ...). On her phone it
            opens straight in the shopping app if she has it installed.
   - note:  a tiny message from you shown when she taps the item.
   ===================================================================== */

window.LOVE_CONFIG = {
  herName: "Cupcake",
  yourName: "Dhiraj",
  occasion: "Happy Birthday",            // small line above her name ("" to hide)

  // Your WhatsApp number with country code, digits only (e.g. "919876543210").
  // Leave "" and WhatsApp will ask her who to send it to.
  whatsappNumber: "",

  sound: true,                            // cute pops & chimes (she can mute)
  partyHats: true,                        // birthday party hats on the bear & bunny
  music: true,                            // soft music-box tune (starts on her first tap)

  introLine: "I planned a little adventure just for you. Hold my hand? 🫶",

  // GIF links (Giphy/Tenor ".gif" links or files in /gifs). Empty = cartoon couple dances instead.
  gifs: {
    welcome: "",                          // empty = our own cartoon couple waves hello
    cheer: [                              // big GIF after each stop (repeats if fewer)
      "https://media.giphy.com/media/Mk8mJM6SQzOin6Gnhb/giphy.gif",          // couple squeeze-hug
      "https://media.giphy.com/media/7KmCCmbmv850stIY8Q/giphy.gif",          // hug in a big heart
      "https://media.giphy.com/media/byTkG3fBegmk2nEVbX/giphy.gif",          // cheek kiss on a bench
      "https://media.giphy.com/media/TLpVt0wAA8O4lJbIru/giphy.gif"           // cuddly kiss
    ],
    reactions: [                          // little sticker that pops up when she adds something
      "https://media.giphy.com/media/hJioaFkX7sjSe7Tkd1/giphy.gif", "https://media.giphy.com/media/gRSqTmhQ3ayroAQ04S/giphy.gif", "https://media.giphy.com/media/iN4THuyyGQboRXYEkc/giphy.gif",
      "https://media.giphy.com/media/8xiaKdWCoi4Iiuxzc2/giphy.gif", "https://media.giphy.com/media/97Dk9XfZlth5xY77y1/giphy.gif", "https://media.giphy.com/media/vX1C2TejT6OCOz2kLd/giphy.gif",
      "https://media.giphy.com/media/xR5cPyPoL5HVXSphqA/giphy.gif", "https://media.giphy.com/media/AjhzHRiiTdb20awZoo/giphy.gif"
    ],
    kiss: [                               // when she taps "Catch a kiss"
      "https://media.giphy.com/media/gRSqTmhQ3ayroAQ04S/giphy.gif", "https://media.giphy.com/media/97Dk9XfZlth5xY77y1/giphy.gif", "https://media.giphy.com/media/VZJn6HJfcWaxuX5nLg/giphy.gif"
    ],
    wish: "https://media.giphy.com/media/MESDm2ngLusbCIeGiy/giphy.gif",       // Wish Well stop ("I love you so much")
    home: "https://media.giphy.com/media/ducqwvT9PJcda4TQRn/giphy.gif",       // address stop (cute couple walking hand in hand)
    final: "https://media.giphy.com/media/MfhUoRSp05AxeSIoSW/giphy.gif",      // big cosy hug
    sent: "https://media.giphy.com/media/s6fnVyWTfM2nUKuMVY/giphy.gif"        // happy squeeze after she sends
  },



  // Shown after each stop. Repeats if you have more stops than lines.
  cheers: [
    "Look at you go, superstar! 🌟",
    "Ahh your taste is SO good 😍",
    "Okay shopping queen, I see you 👑",
    "You're literally glowing right now ✨",
    "Best. Shopper. Ever. 💖"
  ],

  // Little lines that pop up when she adds something.
  pickLines: [
    "Ooh good choice! 😍",
    "Added with love 💖",
    "That's SO you 🥹",
    "Yesss into the box it goes! 🎀",
    "You have the cutest taste 💕",
    "Noted, my love 📝💗"
  ],

  // The stops on the map. Add / remove / rename freely.
  levels: [
    {
      id: "tops",
      title: "Cute Tops",
      emoji: "👚",
      intro: "Soft knits, a little lace and one cosy jacket. Tap anything that makes you smile.",
      items: [
        { id: "pink-bow-pullover", name: "Pink Bow Pullover", emoji: "🎀",
          image: "https://img101.mfrcdn.com/goods-pic/52f16d934e884a5799e1c0c5a9535454_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/db/details/2037532?ub_cl=in_en-IN&skcPGs=335010-442489&vid=122",
          note: "A bow on a pink sweater. It was made for you 🎀" },
        { id: "lace-cami", name: "Lace Cami Top", emoji: "🤍",
          image: "https://img101.mfrcdn.com/goods-pic/953baea7963949f68b0441cee597d098_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/1745912?ub_cl=in_en-IN&vid=2&skcPGs=287976-386375",
          note: "Soft and dainty, just like you" },
        { id: "flower-pullover", name: "Little Flowers Pullover", emoji: "🌼",
          image: "https://img101.mfrcdn.com/goods-pic/4e5db30e3947455bb715c8fb61fea8e9_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/db/details/2332002?ub_cl=in_en-IN&skcPGs=380375-485599&vid=19",
          note: "Tiny flowers for my flower 🌼" },
        { id: "cream-pullover", name: "Cream Knit Pullover", emoji: "🧶",
          image: "https://img101.mfrcdn.com/goods-pic/aab641ac6b904d0c9d1b1c098a972539_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/db/details/2045542?ub_cl=in_en-IN&skcPGs=336480-437291%2C336481-441055&vid=308",
          note: "Cosy enough for coffee dates ☕" },
        { id: "cropped-jacket", name: "Cosy Cropped Jacket", emoji: "🧥",
          image: "https://img101.mfrcdn.com/goods-pic/a96beb599738480baf3e41f962e2e4db_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/db/details/1945642?ub_cl=in_en-IN&skcPGs=319740-420231&vid=308",
          note: "For when I'm not there to keep you warm" }
      ]
    },
    {
      id: "bottoms",
      title: "Comfy Bottoms",
      emoji: "👖",
      intro: "Wide legs and pretty embroidery. Pick the ones that feel like you.",
      items: [
        { id: "cherry-blossom-jeans", name: "Cherry Blossom Jeans", emoji: "🌸",
          image: "https://img101.mfrcdn.com/goods-pic/12635769c0334e4aa8af9cd4607711f2_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2326652?ub_cl=in_en-IN&skcPGs=379610-496466&vid=478",
          note: "Little blossoms walking around with you 🌸" },
        { id: "sakura-black-jeans", name: "Sakura Black Jeans", emoji: "🖤",
          image: "https://img101.mfrcdn.com/goods-pic/9f2c1192cdee40ccb1aca2599349699b_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2455622?ub_cl=in_en-IN&skcPGs=397624-503698&vid=478",
          note: "" },
        { id: "golden-bloom-jeans", name: "Golden Bloom Jeans", emoji: "✨",
          image: "https://img101.mfrcdn.com/goods-pic/8309e9260ea64afb956502be9833d83d_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/db/details/2422012?ub_cl=in_en-IN&skcPGs=393229-499192&vid=476",
          note: "Those gold pockets though ✨" },
        { id: "black-wide-leg-jeans", name: "Black Wide Leg Jeans", emoji: "👖",
          image: "https://img101.mfrcdn.com/goods-pic/597a90b7662849c98651a6df4601e1e8_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/db/details/2326092?ub_cl=in_en-IN&skcPGs=379542-485536&vid=478",
          note: "" },
        { id: "grey-wrap-jeans", name: "Grey Wrap Jeans", emoji: "🩶",
          image: "https://img101.mfrcdn.com/goods-pic/5615f5d5b7784e299e2fb050edb39526_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2418382?ub_cl=in_en-IN&vid=320&skcPGs=392670-498478",
          note: "A little different, a little cool" }
      ]
    },
    {
      id: "accessories",
      title: "Accessories",
      emoji: "💅",
      intro: "Charms, nails and a sweet perfume. The tiny things that make a day cuter.",
      items: [
        { id: "kitty-bag-charm", name: "Kitty Bag Charm", emoji: "🐱",
          image: "https://img101.mfrcdn.com/goods-pic/1f11027ac65e47ec8cd64fa949ef3ad7_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2345772?ub_cl=in_en-IN&skcPGs=382386-487077&vid=23",
          note: "Your bag deserves a cute friend too" },
        { id: "penguin-bag-charm", name: "Penguin Bag Charm", emoji: "🐧",
          image: "https://img101.mfrcdn.com/goods-pic/681299ef2a5d419dae6cccd65a34177b_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2430332?ub_cl=in_en-IN&skcPGs=394305-502119%2C394306-500713&vid=86",
          note: "Penguins pick one partner for life. Just saying 🐧" },
        { id: "heart-bag-charm", name: "Mini Heart Bag Charm", emoji: "💗",
          image: "https://img101.mfrcdn.com/goods-pic/89521f8b9ef74b07ae453ad588a077db_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2290512?ub_cl=in_en-IN&vid=122&skcPGs=374541-479409%2C374539-479407%2C374540-479408",
          note: "" },
        { id: "rhinestone-nails", name: "Sparkly Press-on Nails", emoji: "💅",
          image: "https://img101.mfrcdn.com/goods-pic/96d80fb99f454101ad88d71023592d04_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2286652?ub_cl=in_en-IN&skcPGs=374030-478985&vid=23",
          note: "Sparkly nails for my sparkly girl" },
        { id: "swan-nails", name: "Swan Press-on Nails", emoji: "🦢",
          image: "https://img101.mfrcdn.com/goods-pic/baaa4ca9acc24a54b172242c67dc0676_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2429222?ub_cl=in_en-IN&skcPGs=394149-500371&vid=554",
          note: "So elegant, so you 🦢" },
        { id: "powder-puff-perfume", name: "Powder Puff Perfume", emoji: "🌸",
          image: "https://img101.mfrcdn.com/goods-pic/c376c3454d2f42dbac2dbaf8960f469d_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/2282872?ub_cl=in_en-IN&vid=122&skcPGs=373527-483207",
          note: "So I can find you in a crowd 🥹" },
        { id: "flower-waist-buttons", name: "Flower Waist Buttons", emoji: "🌼",
          image: "https://img101.mfrcdn.com/goods-pic/5da9bee3ea5b434bb9d6312ffcc97402_w540_h720_q85_lg_fcover",
          link: "https://sharein.savana.com/da/details/1870812?ub_cl=in_en-IN&skcPGs=307955-407667&vid=326",
          note: "For jeans that need a tiny hug at the waist" }
      ]
    }
  ],

  // Shown on the last screen, like a little letter.
  finalNote: "Every single thing in this box is just a tiny excuse to see you smile. Thank you for being my favourite person in the whole world. Now let me spoil you a little 💗"
};
