/* =====================================================================
   💗  EDIT THIS FILE ONLY  💗
   Everything she sees comes from here: names, stops, items, GIFs, notes.
   - image: a link to a picture OR a file you drop in the /images folder
            (e.g. "images/hoodie.jpg"). Leave "" to show the cute emoji tile.
   - link:  the product link (Amazon / Myntra / Nykaa ...). On her phone it
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
    cheer: [                              // one per stop, repeats if fewer
      "https://media.giphy.com/media/XMYKIIPTeq9ejnXFcQ/giphy.gif",
      "https://media.giphy.com/media/4JNq1qXXOBFoD0fjt2/giphy.gif",
      "https://media.giphy.com/media/a0aQKr2zTcbJCfiJpY/giphy.gif",
      "https://media.giphy.com/media/QIvKVRTxAoUJghw18M/giphy.gif"
    ],
    final: "https://media.giphy.com/media/oalrDwsiuYFdKq4t21/giphy.gif",
    sent: "https://media.giphy.com/media/4JNq1qXXOBFoD0fjt2/giphy.gif"
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
      id: "fits",
      title: "Cozy & Cute Fits",
      emoji: "👗",
      intro: "Comfy, cute, and made for cuddles. See anything you love?",
      items: [
        { name: "Oversized Pastel Hoodie", emoji: "🧥", price: "", image: "", link: "https://www.amazon.in/s?k=oversized+pastel+hoodie+women", note: "So I can steal it back sometimes 😌" },
        { name: "Strawberry Pyjama Set",  emoji: "🍓", price: "", image: "", link: "https://www.amazon.in/s?k=strawberry+pyjama+set+women", note: "Sleepy strawberry girl era" },
        { name: "Scrunchie Rainbow Pack",  emoji: "🎀", price: "", image: "", link: "https://www.amazon.in/s?k=silk+scrunchies+pack", note: "" },
        { name: "Fluffy Bunny Slippers",   emoji: "🐰", price: "", image: "", link: "https://www.amazon.in/s?k=bunny+slippers+women", note: "Tiny bunny for my bunny" }
      ]
    },
    {
      id: "sparkle",
      title: "Sparkle & Shine",
      emoji: "💍",
      intro: "A little shiny something for the shiniest girl.",
      items: [
        { name: "Dainty Heart Necklace", emoji: "💗", price: "", image: "", link: "https://www.amazon.in/s?k=dainty+heart+necklace", note: "Closest thing to wearing my heart" },
        { name: "Pearl Drop Earrings",   emoji: "🦪", price: "", image: "", link: "https://www.amazon.in/s?k=pearl+drop+earrings", note: "" },
        { name: "Charm Bracelet",        emoji: "✨", price: "", image: "", link: "https://www.amazon.in/s?k=charm+bracelet+women", note: "We can add a charm for every trip" }
      ]
    },
    {
      id: "glow",
      title: "Glow Up Corner",
      emoji: "💄",
      intro: "Not that you need it. You already glow. But still 💅",
      items: [
        { name: "Lip & Cheek Tint Set", emoji: "💋", price: "", image: "", link: "https://www.nykaa.com/search/result/?q=lip%20tint", note: "" },
        { name: "Cute Sheet Mask Box",  emoji: "🧖‍♀️", price: "", image: "", link: "https://www.nykaa.com/search/result/?q=sheet%20mask", note: "Spa date at home? 🛁" },
        { name: "A Perfume That's You", emoji: "🌸", price: "", image: "", link: "https://www.nykaa.com/search/result/?q=perfume%20women", note: "" }
      ]
    },
    {
      id: "cuddle",
      title: "Cuddle Zone",
      emoji: "🧸",
      intro: "For when I'm not there to hug you myself.",
      items: [
        { name: "Giant Teddy Bear",   emoji: "🧸", price: "", image: "", link: "https://www.amazon.in/s?k=giant+teddy+bear", note: "A stand-in until I get there" },
        { name: "Fairy Light Curtain", emoji: "💡", price: "", image: "", link: "https://www.amazon.in/s?k=fairy+light+curtain", note: "" },
        { name: "Heart Cushion",       emoji: "❤️", price: "", image: "", link: "https://www.amazon.in/s?k=heart+cushion", note: "" }
      ]
    }
  ],

  // Shown on the last screen, like a little letter.
  finalNote: "Every single thing in this box is just a tiny excuse to see you smile. Thank you for being my favourite person in the whole world. Now let me spoil you a little 💗"
};
