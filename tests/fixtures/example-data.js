/* Fixed test fixture: not loaded by the website. Edit shops/*.yml for live data. */
globalThis.MMData = {
  "config": {
    "currency": "diamond",
    "name": "Moss & Moon",
    "title": "The community directory",
    "language": "en",
    "serverAddress": "play.moss-n-moon.me",
    "logo": "assets/logo.png",
    "demoMode": true,
    "storageKey": "moss-moon-directory-v1",
    "links": {
      "discord": "",
      "store": "",
      "repository": ""
    },
    "hero": {
      "eyebrow": "A WORLD OF PLAYER-MADE POSSIBILITIES",
      "title": "Small shops.",
      "accent": "Great discoveries.",
      "description": "Find the blocks, little treasures, and helping hands for your next adventure. All in one corner of Moss & Moon."
    },
    "popular": [
      "Wool",
      "Mending",
      "Pale oak",
      "Building services"
    ],
    "guide": [
      {
        "icon": "search",
        "title": "Find your thing",
        "text": "Search for an item, a shop, or a service. Narrow it down by category and location."
      },
      {
        "icon": "pin",
        "title": "Plan a little visit",
        "text": "Open a shop to see its listings, prices, and directions. Copy the coordinates for your journey."
      },
      {
        "icon": "heart",
        "title": "Keep the good ones",
        "text": "Save your favourite shops on this device. Purchases and trades happen in Minecraft, not here."
      }
    ],
    "faq": [
      {
        "question": "Can I buy items on this website?",
        "answer": "No. This is a community directory, not an online checkout. Visit a shop in Minecraft and follow its owner’s trading instructions. No real-money purchases take place here."
      },
      {
        "question": "Are prices and stock live?",
        "answer": "No. These are manually maintained listings. The owner’s in-game signs are the source of truth. The example directory uses sample prices, stock labels, and coordinates."
      },
      {
        "question": "How do I add or update my shop?",
        "answer": "Use “List your shop” to prepare a YAML (.yml) listing file. Download it and send it to the directory maintainers through your community’s normal channel. Nothing is submitted or published automatically."
      },
      {
        "question": "Where are my saved shops stored?",
        "answer": "Only in your browser’s local storage on this device. There is no account, tracking, or cross-device sync. Your browser may clear this data; private browsing and local-file storage can behave differently."
      }
    ]
  },
  "categories": [
    {
      "id": "building",
      "name": "Building blocks",
      "icon": "blocks",
      "description": "Every build starts with a block."
    },
    {
      "id": "nature",
      "name": "Wood & greenery",
      "icon": "leaf",
      "description": "A little more life for your world."
    },
    {
      "id": "redstone",
      "name": "Redstone & tech",
      "icon": "circuit",
      "description": "For clever little contraptions."
    },
    {
      "id": "equipment",
      "name": "Gear & enchantments",
      "icon": "book",
      "description": "A better-equipped adventure."
    },
    {
      "id": "farming",
      "name": "Food & farming",
      "icon": "wheat",
      "description": "Supplies to keep you growing."
    },
    {
      "id": "travel",
      "name": "Travel & exploration",
      "icon": "compass",
      "description": "Your next destination awaits."
    },
    {
      "id": "services",
      "name": "Player services",
      "icon": "tools",
      "description": "A helping hand from the community."
    }
  ],
  "locations": [
    {
      "id": "district",
      "name": "Shopping District",
      "short": "Shopping District",
      "dimension": "Overworld",
      "icon": "store"
    },
    {
      "id": "spawn",
      "name": "Spawn & surroundings",
      "short": "Near spawn",
      "dimension": "Overworld",
      "icon": "sprout"
    },
    {
      "id": "nether",
      "name": "Nether roof",
      "short": "Nether roof",
      "dimension": "The Nether",
      "icon": "portal"
    }
  ],
  "shops": [
    {
      "kind": "shop",
      "status": "open",
      "demo": true,
      "featured": true,
      "theme": "wool",
      "tagline": "A whole rainbow, by the stack.",
      "directions": "Follow the main path from the district entrance. These are demonstration coordinates; replace them with the real route before publishing.",
      "notes": "Example prices: ordinary wool is listed in diamonds; the bulk listing uses diamond blocks. The bulk quantity is wool only, with no container included.",
      "tags": [
        "All 16 colours",
        "Bulk friendly"
      ],
      "images": [],
      "currency": "diamond",
      "id": "woolery",
      "name": "The Woolery",
      "owner": "CloudySheep",
      "description": "Every shade for every idea. Pick up a stack or stock your next big build with a whole rainbow of wool.",
      "categories": [
        "building"
      ],
      "location": "district",
      "coords": {
        "x": 128,
        "y": 64,
        "z": -240
      },
      "updated": "2026-10-09",
      "items": [
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "white_wool",
          "name": "White Wool",
          "price": 1,
          "quantity": 64,
          "color": "#e7e5df"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "light_gray_wool",
          "name": "Light Gray Wool",
          "price": 1,
          "quantity": 64,
          "color": "#adb1ae"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "gray_wool",
          "name": "Gray Wool",
          "price": 1,
          "quantity": 64,
          "color": "#646b6b"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "black_wool",
          "name": "Black Wool",
          "price": 1,
          "quantity": 64,
          "color": "#303437"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "brown_wool",
          "name": "Brown Wool",
          "price": 1,
          "quantity": 64,
          "color": "#866143"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "red_wool",
          "name": "Red Wool",
          "price": 1,
          "quantity": 64,
          "color": "#b94740"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "orange_wool",
          "name": "Orange Wool",
          "price": 1,
          "quantity": 64,
          "color": "#e7903d"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "yellow_wool",
          "name": "Yellow Wool",
          "price": 1,
          "quantity": 64,
          "color": "#e5c45c"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "lime_wool",
          "name": "Lime Wool",
          "price": 1,
          "quantity": 64,
          "color": "#91b55d"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "green_wool",
          "name": "Green Wool",
          "price": 1,
          "quantity": 64,
          "color": "#607c46"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "cyan_wool",
          "name": "Cyan Wool",
          "price": 1,
          "quantity": 64,
          "color": "#338e92"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "light_blue_wool",
          "name": "Light Blue Wool",
          "price": 1,
          "quantity": 64,
          "color": "#73b9cf"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "blue_wool",
          "name": "Blue Wool",
          "price": 1,
          "quantity": 64,
          "color": "#576bab"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "purple_wool",
          "name": "Purple Wool",
          "price": 1,
          "quantity": 64,
          "color": "#9569aa"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "magenta_wool",
          "name": "Magenta Wool",
          "price": 1,
          "quantity": 64,
          "color": "#bb71a0"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "wool",
            "colours",
            "colors"
          ],
          "currency": "diamond",
          "id": "pink_wool",
          "name": "Pink Wool",
          "price": 1,
          "quantity": 64,
          "color": "#dfa8b4"
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "wool",
          "aliases": [
            "bulk wool",
            "shulker of wool"
          ],
          "currency": "diamond_block",
          "id": "black_wool_bulk",
          "name": "Black Wool — shulker quantity",
          "price": 3,
          "quantity": 1728,
          "color": "#303437"
        }
      ]
    },
    {
      "kind": "shop",
      "status": "open",
      "demo": true,
      "featured": true,
      "theme": "pale",
      "tagline": "Good things from the quiet forest.",
      "directions": "Follow the main path from the district entrance. These are demonstration coordinates; replace them with the real route before publishing.",
      "notes": "",
      "tags": [
        "Pale oak",
        "Resin",
        "Botanicals"
      ],
      "images": [],
      "currency": "diamond",
      "id": "pale-found",
      "name": "Pale & Found",
      "owner": "WillowWisp",
      "description": "Pale oak, glowing resin, and the quieter side of the forest. A small collection for wonderfully unusual builds.",
      "categories": [
        "nature",
        "building"
      ],
      "location": "district",
      "coords": {
        "x": -92,
        "y": 65,
        "z": -184
      },
      "updated": "2026-10-09",
      "items": [
        {
          "unit": "items",
          "stock": "in",
          "icon": "log",
          "aliases": [],
          "currency": "diamond",
          "id": "pale_oak_log",
          "name": "Pale Oak Log",
          "price": 1,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "resin",
          "aliases": [
            "resin blocks"
          ],
          "currency": "diamond_block",
          "id": "resin_block",
          "name": "Block of Resin",
          "price": 1,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "resin",
          "aliases": [],
          "currency": "diamond",
          "id": "resin_bricks",
          "name": "Resin Bricks",
          "price": 4,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "low",
          "icon": "leaf",
          "aliases": [],
          "currency": "diamond",
          "id": "pale_oak_leaves",
          "name": "Pale Oak Leaves",
          "price": 2,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "leaf",
          "aliases": [],
          "currency": "diamond",
          "id": "pale_moss_block",
          "name": "Pale Moss Block",
          "price": 1,
          "quantity": 64
        }
      ]
    },
    {
      "kind": "shop",
      "status": "open",
      "demo": true,
      "featured": true,
      "theme": "books",
      "tagline": "A new chapter for your favourite tools.",
      "directions": "Follow the main path from the district entrance. These are demonstration coordinates; replace them with the real route before publishing.",
      "notes": "",
      "tags": [
        "Enchanted books",
        "Mending"
      ],
      "images": [],
      "currency": "diamond",
      "id": "moonbound",
      "name": "Moonbound Books",
      "owner": "LunaLibrarian",
      "description": "A little bookshop with a lot of magic. Browse useful enchanted books and give your favourite tools a longer story.",
      "categories": [
        "equipment"
      ],
      "location": "district",
      "coords": {
        "x": 176,
        "y": 64,
        "z": -208
      },
      "updated": "2026-10-09",
      "items": [
        {
          "unit": "item",
          "stock": "in",
          "icon": "book",
          "aliases": [
            "enchanted book",
            "mending book"
          ],
          "currency": "diamond",
          "id": "mending_book",
          "name": "Mending",
          "price": 5,
          "quantity": 1
        },
        {
          "unit": "item",
          "stock": "in",
          "icon": "book",
          "aliases": [
            "enchanted book"
          ],
          "currency": "diamond",
          "id": "unbreaking_iii_book",
          "name": "Unbreaking III",
          "price": 3,
          "quantity": 1
        },
        {
          "unit": "item",
          "stock": "low",
          "icon": "book",
          "aliases": [
            "enchanted book"
          ],
          "currency": "diamond",
          "id": "efficiency_v_book",
          "name": "Efficiency V",
          "price": 4,
          "quantity": 1
        },
        {
          "unit": "item",
          "stock": "in",
          "icon": "book",
          "aliases": [
            "enchanted book"
          ],
          "currency": "diamond",
          "id": "fortune_iii_book",
          "name": "Fortune III",
          "price": 4,
          "quantity": 1
        },
        {
          "unit": "item",
          "stock": "out",
          "icon": "book",
          "aliases": [
            "enchanted book"
          ],
          "currency": "diamond",
          "id": "silk_touch_book",
          "name": "Silk Touch",
          "price": 3,
          "quantity": 1
        }
      ]
    },
    {
      "kind": "shop",
      "status": "open",
      "demo": true,
      "featured": false,
      "theme": "redstone",
      "tagline": "Little components. Big possibilities.",
      "directions": "Follow the main path from the district entrance. These are demonstration coordinates; replace them with the real route before publishing.",
      "notes": "",
      "tags": [
        "Farm essentials",
        "Redstone"
      ],
      "images": [],
      "currency": "diamond",
      "id": "circuit",
      "name": "Circuit & Co.",
      "owner": "CopperPilot",
      "description": "The small pieces behind your next big machine. Reliable redstone essentials, gathered in one useful place.",
      "categories": [
        "redstone"
      ],
      "location": "nether",
      "coords": {
        "x": 48,
        "y": 129,
        "z": -64
      },
      "updated": "2026-10-09",
      "items": [
        {
          "unit": "items",
          "stock": "in",
          "icon": "redstone",
          "aliases": [],
          "currency": "diamond",
          "id": "redstone",
          "name": "Redstone Dust",
          "price": 1,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "machine",
          "aliases": [],
          "currency": "diamond",
          "id": "observer",
          "name": "Observer",
          "price": 3,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "machine",
          "aliases": [],
          "currency": "diamond",
          "id": "piston",
          "name": "Piston",
          "price": 3,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "low",
          "icon": "machine",
          "aliases": [],
          "currency": "diamond",
          "id": "hopper",
          "name": "Hopper",
          "price": 5,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "redstone",
          "aliases": [],
          "currency": "diamond",
          "id": "comparator",
          "name": "Redstone Comparator",
          "price": 3,
          "quantity": 64
        },
        {
          "unit": "items",
          "stock": "in",
          "icon": "redstone",
          "aliases": [],
          "currency": "diamond",
          "id": "repeater",
          "name": "Redstone Repeater",
          "price": 2,
          "quantity": 64
        }
      ]
    },
    {
      "kind": "service",
      "status": "open",
      "demo": true,
      "featured": false,
      "theme": "builder",
      "tagline": "A helping hand. A better build.",
      "directions": "Follow the main path from the district entrance. These are demonstration coordinates; replace them with the real route before publishing.",
      "notes": "Service prices depend on the project. Contact the owner in-game to agree on scope and payment before work begins.",
      "tags": [
        "Custom builds",
        "Landscaping"
      ],
      "images": [],
      "currency": "diamond_block",
      "id": "builders-bench",
      "name": "The Builder’s Bench",
      "owner": "MapleMason",
      "description": "A second pair of hands for your next project. From a cozy starter home to the landscape around it, let’s make something yours.",
      "categories": [
        "services"
      ],
      "location": "district",
      "coords": {
        "x": 96,
        "y": 64,
        "z": -112
      },
      "updated": "2026-10-09",
      "items": [
        {
          "unit": "project",
          "stock": "in",
          "icon": "tools",
          "aliases": [
            "builder",
            "custom builds",
            "houses"
          ],
          "currency": "diamond_block",
          "id": "building_service",
          "name": "Building services",
          "price": null,
          "quantity": 1
        },
        {
          "unit": "project",
          "stock": "in",
          "icon": "leaf",
          "aliases": [
            "landscaping",
            "terrain"
          ],
          "currency": "diamond_block",
          "id": "terraforming_service",
          "name": "Terraforming",
          "price": null,
          "quantity": 1
        },
        {
          "unit": "project",
          "stock": "low",
          "icon": "tools",
          "aliases": [
            "decoration",
            "decorating"
          ],
          "currency": "diamond_block",
          "id": "interior_service",
          "name": "Interior design",
          "price": null,
          "quantity": 1
        }
      ]
    }
  ]
};
