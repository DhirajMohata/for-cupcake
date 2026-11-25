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
  round: 2,                               // bump this when the items change: she starts fresh, address kept
  yourName: "Dhiraj",
  occasion: "Happy Birthday",            // small line above her name ("" to hide)

  // Your WhatsApp number with country code, digits only (e.g. "919876543210").
  // Leave "" and WhatsApp will ask her who to send it to.
  whatsappNumber: "917405503035",

  // Email that gets a copy of her love box when she taps Send ("" = WhatsApp only).
  email: "",

  sound: true,                            // cute pops & chimes (she can mute)
  partyHats: true,                        // birthday party hats on the bear & bunny
  music: true,                            // soft music-box tune (starts on her first tap)

  // Songs for the little player (YouTube video IDs). Extra IDs are backups in case one gets taken down.
  // If YouTube can't load at all, the soft built-in tune plays instead.
  songs: [
    { title: "Paper Rings (slowed)",      youtube: ["Cc53_zaDkyI", "oba679chnE4", "8HuE37VkieY"] },
    { title: "Lover (slowed)",            youtube: ["Z6WiuZiHRzM", "r1Vil72zqOM"] },
    { title: "invisible string (slowed)", youtube: ["MuhI7Msa1jk", "B5Yrio2nE6U"] },
    { title: "Daylight (slowed)",         youtube: ["uXOtWxTNkzM", "OONv2ggjmUk"] },
    { title: "You Are In Love (slowed)",  youtube: ["3eHskzw3jvg"] }
  ],

  introLine: "I found new things for you, all in your size this time. Hold my hand? 🫶",

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
    "Your taste is so good 😍",
    "Okay, shopping queen 👑",
    "You’re so cute when you shop 🙈",
    "Love that for you ✨"
  ],

  // Little lines that pop up when she adds something.
  pickLines: [
    "Good choice 😍",
    "That’s so you 🥹",
    "In the box 🎀",
    "Cutest taste ever 💕",
    "Noted, my love 📝"
  ],

  // Little handwritten love notes on the map and the love tape.
  loveNotes: [
    "you’re my favourite person",
    "still choosing you, every day",
    "my happy place is next to you",
    "you + me = forever",
    "i’d find you in every lifetime",
    "home is wherever you are",
    "forever feels short with you",
    "my cupcake, my whole heart"
  ],

  // The stops on the map. Add / remove / rename freely.
  // Round 2: everything here was checked in stock in her size (XS).
  levels: [
    {
      id: "tops2",
      title: "Cute Tops",
      emoji: "👚",
      intro: "All in your size this time 🤍 Pick the ones you love.",
      items: [
        { id: "gingham-corset", name: "Pink Gingham Corset Top", emoji: "🎀",
          image: "images/gingham-corset.jpg",
          link: "https://littleboxindia.com/products/gingham-corset-top-in-jet-white-and-classic-red",
          note: "Pink, gingham and a tiny bow. So you" },
        { id: "lace-bow-top", name: "White Lace Bow Top", emoji: "🤍",
          image: "images/lace-bow-top.jpg",
          link: "https://littleboxindia.com/products/lace-sweetheart-neck-long-sleeve-top-with-front-bow-detail-in-off-white",
          note: "This one felt the most like the lace top you loved" },
        { id: "white-corset-cami", name: "White Corset Cami", emoji: "🤍",
          image: "images/white-corset-cami.jpg",
          link: "https://littleboxindia.com/products/square-neck-button-front-corset-cami-top-in-classic-white",
          note: "Simple, pretty, goes with everything" },
        { id: "pink-puff-top", name: "Baby Pink Puff Sleeve Top", emoji: "🌸",
          image: "images/pink-puff-top.jpg",
          link: "https://littleboxindia.com/products/cute-tie-front-neck-puff-sleeve-fit-flare-top-in-baby-pink",
          note: "Puff sleeves for my puff 🥹" },
        { id: "pink-tie-top", name: "Light Pink Tie-Front Top", emoji: "💗",
          image: "images/pink-tie-top.jpg",
          link: "https://littleboxindia.com/products/tie-front-asymmetrical-hem-sleeveless-top-in-light-pink",
          note: "" },
        { id: "pink-tie-up-top", name: "Baby Pink Tie-Up Top", emoji: "🎀",
          image: "images/pink-tie-up-top.jpg",
          link: "https://littleboxindia.com/products/boat-neck-tie-up-detail-tailored-fit-top-in-baby-pink",
          note: "Soft pink, little tie at the neck" },
        { id: "lace-halter-tank", name: "White Lace Halter Tank", emoji: "🤍",
          image: "images/lace-halter-tank.jpg",
          link: "https://littleboxindia.com/products/halter-neckline-lace-trim-tank-top-in-white",
          note: "Only one XS left, it was waiting for you" }
      ]
    },
    {
      id: "pants2",
      title: "Comfy Pants",
      emoji: "👖",
      intro: "Soft, flowy and so comfy.",
      items: [
        { id: "brown-drawstring-pants", name: "Brown Drawstring Pants", emoji: "🤎",
          image: "images/brown-drawstring-pants.jpg",
          link: "https://littleboxindia.com/products/drawstring-waist-loose-pocket-pants-in-brown",
          note: "Comfy enough for long walks with me" },
        { id: "cocoa-straight-trousers", name: "Cocoa Straight Trousers", emoji: "🍫",
          image: "images/cocoa-straight-trousers.jpg",
          link: "https://littleboxindia.com/products/high-waist-straight-leg-buckle-detail-trousers-in-cocoa-brown",
          note: "A little classy, a little cute" }
      ]
    },
    {
      id: "kurtas2",
      title: "Kurta Sets",
      emoji: "🌸",
      intro: "Light and pretty, nothing too heavy.",
      items: [
        { id: "white-chikankari-set", name: "White Chikankari Set", emoji: "🌸",
          image: "images/white-chikankari-set.jpg",
          link: "https://houseofkari.in/products/chikankari-kurta-set-in-cotton-black-hk_set6_22",
          note: "Tiny pink flowers, nothing heavy" },
        { id: "white-kashmiri-set", name: "White Kashmiri Set", emoji: "🌷",
          image: "images/white-kashmiri-set.jpg",
          link: "https://houseofkari.in/products/falak-kashmiri-kurta-set-white-hk-kasset4",
          note: "Soft pink thread work, just at the neck" },
        { id: "baby-pink-kashmiri-set", name: "Baby Pink Kashmiri Set", emoji: "💗",
          image: "images/baby-pink-kashmiri-set.jpg",
          link: "https://houseofkari.in/products/kashmiri-aari-work-cotton-kurta-set-baby-pink-hk-szset1p",
          note: "" },
        { id: "peach-chikankari-set", name: "Peach Chikankari Set", emoji: "🍑",
          image: "images/peach-chikankari-set.jpg",
          link: "https://www.houseofchikankari.in/products/cotton-flex-chikankari-solid-womens-2pc-long-kurta-set-peach-hc45625wkss7271",
          note: "Soft peach with delicate white work" },
        { id: "light-pink-chanderi-set", name: "Light Pink Chanderi Set", emoji: "✨",
          image: "images/light-pink-chanderi-set.jpg",
          link: "https://www.aachho.com/products/rajeshwari-light-pink-embroidered-chanderi-kurta-set",
          note: "Light and elegant, for special days" }
      ]
    }
  ],

  // Shown on the last screen, like a little letter.
  finalNote: "Honestly, all of this is just an excuse to see you smile. You’re my favourite person and I’m so lucky I get to love you. Happy birthday, my cupcake. Now let me spoil you a little 💗"
};
