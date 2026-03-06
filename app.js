document.addEventListener("DOMContentLoaded", function () {
  // Initialize the menu system
  initializeMenus();

  // Add smooth scrolling for navigation links
  addSmoothScrolling();

  // Add header scroll effects
  addHeaderEffects();

  // Initialize dynamic food gallery
  initializeFoodGallery();
});

// Initialize the menu system
function initializeMenus() {
  const menuBlocks = document.querySelectorAll(".menu-block");

  console.log("Initializing menus with", menuBlocks.length, "blocks");

  // Load initial menu images
  loadAllMenus();

  // Add event listeners for accordion functionality
  menuBlocks.forEach((block, index) => {
    const header = block.querySelector(".menu-header");
    const icon = block.querySelector(".menu-icon");
    const menuType = block.dataset.menu;

    console.log(`Setting up menu ${index + 1}: ${menuType}`);

    header.addEventListener("click", (e) => {
      e.preventDefault();
      console.log(`Clicked on ${menuType} menu`);

      // If this block is already open, close it
      if (block.classList.contains("open")) {
        console.log(`Closing ${menuType} menu`);
        block.classList.remove("open");
        if (icon) {
          icon.style.transform = "rotate(0deg)";
        }
        return;
      }

      // Close all other open blocks first
      menuBlocks.forEach((otherBlock) => {
        if (otherBlock !== block && otherBlock.classList.contains("open")) {
          const otherType = otherBlock.dataset.menu;
          console.log(`Closing other menu: ${otherType}`);
          otherBlock.classList.remove("open");
          const otherIcon = otherBlock.querySelector(".menu-icon");
          if (otherIcon) {
            otherIcon.style.transform = "rotate(0deg)";
          }
        }
      });

      // Open current block (content already loaded on page load via loadAllMenus)
      console.log(`Opening ${menuType} menu`);
      block.classList.add("open");

      // Update icon rotation
      if (icon) {
        icon.style.transform = "rotate(45deg)";
      }

      // Load this menu type if not yet loaded (runs in background, no wait)
      if (!block.dataset.loaded) {
        const gridType = block.querySelector(".menu-grid").dataset.type;
        console.log(`Loading content for ${gridType} menu`);
        loadMenuType(gridType);
        block.dataset.loaded = "true";
      }
    });
  });
}

// Load all menu types
async function loadAllMenus() {
  try {
    const response = await fetch("/menus");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const menuData = await response.json();

    // Render each visible menu type
    ["lunch", "dinner"].forEach((type) => {
      if (menuData[type]) {
        renderMenu(type, menuData[type]);
      } else {
        renderMenu(type, []);
      }
    });

    // Mark all blocks as loaded so first open on mobile never re-renders (avoids flash)
    document.querySelectorAll(".menu-block").forEach((block) => {
      block.dataset.loaded = "true";
    });
  } catch (error) {
    console.error("Error loading menus:", error);
    // Show fallback content for all visible menu types
    ["lunch", "dinner"].forEach((type) => {
      renderMenu(type, []);
    });
    document.querySelectorAll(".menu-block").forEach((block) => {
      block.dataset.loaded = "true";
    });
  }
}

// Load a specific menu type
async function loadMenuType(type) {
  try {
    const response = await fetch("/menus");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const menuData = await response.json();
    const items = menuData[type] || [];
    renderMenu(type, items);
  } catch (error) {
    console.error(`Error loading ${type} menu:`, error);
    renderMenu(type, []);
  }
}

// Render menu content for a specific type
function renderMenu(menuType, items) {
  const grid = document.querySelector(`.menu-grid[data-type="${menuType}"]`);
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="menu-card">
        <div style="padding: 2rem; text-align: center; color: #666;">
          <p>No ${menuType} menu available at the moment.</p>
        </div>
      </div>
    `;
    return;
  }

  // Show the latest 1-2 menu images
  const displayItems = items.slice(0, 2);

  grid.innerHTML = displayItems
    .map(
      (item) => `
    <div class="menu-card">
      <img 
        src="${item.url}" 
        alt="${menuType} menu" 
        loading="lazy"
        onerror="this.style.display='none'"
      />
    </div>
  `
    )
    .join("");
}

// Add smooth scrolling for navigation links
function addSmoothScrolling() {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = link.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerHeight =
          document.querySelector(".site-header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });
}

// Add header scroll effects
function addHeaderEffects() {
  const header = document.querySelector(".site-header");
  let lastScrollTop = 0;

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Add/remove scrolled class for styling
    if (scrollTop > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Hide/show header on scroll (optional)
    if (scrollTop > lastScrollTop && scrollTop > 200) {
      header.style.transform = "translateY(-100%)";
    } else {
      header.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop;
  });
}

// Add loading states and error handling
function showLoadingState(type) {
  const grid = document.querySelector(`.menu-grid[data-type="${type}"]`);
  if (grid) {
    grid.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading ${type} menu...</p>
      </div>
    `;
  }
}

function showErrorState(type, error) {
  const grid = document.querySelector(`.menu-grid[data-type="${type}"]`);
  if (grid) {
    grid.innerHTML = `
      <div class="error-state">
        <p>Unable to load ${type} menu</p>
        <button onclick="loadMenuType('${type}')" class="retry-button">Try Again</button>
      </div>
    `;
  }
}

// Add CSS for loading and error states
const style = document.createElement("style");
style.textContent = `
  .menu-placeholder {
    text-align: center;
    padding: 3rem 2rem;
    color: rgba(247, 246, 233, 0.6);
  }
  
  .placeholder-sub {
    font-size: 0.9rem;
    margin-top: 0.5rem;
    opacity: 0.7;
  }
  
  .loading-state {
    text-align: center;
    padding: 3rem 2rem;
    color: rgba(247, 246, 233, 0.6);
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(247, 246, 233, 0.1);
    border-top: 3px solid #b4b3a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-state {
    text-align: center;
    padding: 3rem 2rem;
    color: rgba(247, 246, 233, 0.6);
  }
  
  .retry-button {
    background: rgba(247, 246, 233, 0.1);
    border: 1px solid rgba(247, 246, 233, 0.3);
    color: #f7f6e9;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.3s ease;
  }
  
  .retry-button:hover {
    background: rgba(247, 246, 233, 0.2);
    border-color: rgba(247, 246, 233, 0.5);
  }
  
  .site-header.scrolled {
    background: rgba(20, 61, 44, 0.98);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  }
  
  .site-header {
    transition: all 0.3s ease;
  }
  
  .show-more-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
    padding: 1rem 0;
  }
  
  .show-more-btn {
    background: rgba(247, 246, 233, 0.1);
    border: 2px solid rgba(247, 246, 233, 0.3);
    color: #f7f6e9;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .show-more-btn:hover {
    background: rgba(247, 246, 233, 0.2);
    border-color: rgba(247, 246, 233, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .show-more-btn:active {
    transform: translateY(0);
  }
  
  .loading-gallery {
    text-align: center;
    padding: 3rem 2rem;
    color: rgba(247, 246, 233, 0.6);
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    background: rgba(15, 47, 35, 0.2);
    width: 100%;
  }
  
  .loading-gallery .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(247, 246, 233, 0.1);
    border-top: 3px solid #b4b3a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0;
  }
`;

document.head.appendChild(style);

// Food Gallery Library and Dynamic Rendering
const foodGalleryLibrary = [
  {
    image: "assets/food-1.png",
    title: "PORK SCHNITZEL 🐖🍄‍🟫",
    description: "mushrooms, sauce chasseur, pickled mushroom salad",
    alt: "Pork Schnitzel with mushrooms, sauce chasseur, and pickled mushroom salad",
  },
  {
    image: "assets/food-2.png",
    title: "POTATO CHIP TORTILLA 🌿",
    description: "with romesco",
    alt: "Potato Chip Tortilla with romesco",
  },
  {
    image: "assets/food-3.png",
    title: "DUCK BREAST 🦆🌱",
    description: "beets vinaigrette, sour cherry sauce, sage",
    alt: "Duck Breast with beets vinaigrette, sour cherry sauce, sage",
  },
  {
    image: "assets/food-4.png",
    title: "CITRUS TART 🍊🍋",
    description: "frangipane, lemon curd, winter citrus",
    alt: "Citrus Tart with frangipane, lemon curd, winter citrus",
  },
  {
    image: "assets/food-5.png",
    title: "SWORDFISH 🐠🌿",
    description: "white beans, ajo blanco, braised celery",
    alt: "Swordfish with white beans, ajo blanco, braised celery",
  },
  {
    image: "assets/food-6.png",
    title: "SQUASH AGRO DOLCE 🎃",
    description: "stracciatella, pumpkin seed, black olive",
    alt: "Squash Agro Dolce with stracciatella, pumpkin seed, black olive",
  },
  {
    image: "assets/food-7.png",
    title: "PORK MILANESE 🐖🌱",
    description: "bean salad with warm bacon vinaigrette",
    alt: "Pork Milanese with bean salad and warm bacon vinaigrette",
  },
  {
    image: "assets/food-8.png",
    title: "ROASTED EGGPLANT 🍆",
    description: "tahini, chickpeas, chili crisp",
    alt: "Roasted Eggplant with tahini, chickpeas, and chili crisp",
  },
  {
    image: "assets/food-9.png",
    title: "MARINATED FETA",
    description: "cucumber & canary melon a la grecque",
    alt: "Marinated Feta with cucumber and canary melon a la grecque",
  },
  {
    image: "assets/food-10.png",
    title: "SWEET CORN CRÈME CARAMEL 🌽",
    description: "caramel corn",
    alt: "Sweet Corn Crème Caramel with caramel corn",
  },
  {
    image: "assets/food-11.png",
    title: "SHRIMP TAGLIONI 🍤🍅",
    description: "tomato butter, chervil",
    alt: "Shrimp Tagliolini with tomato butter and chervil",
  },
  {
    image: "assets/food-12.png",
    title: "PAN BAGNAT 🐟🥚🍃",
    description: "albacore tuna, egg, olive, tomato, green beans, basil",
    alt: "Pan Bagnat with albacore tuna, egg, olive, tomato, green beans, and basil",
  },
  {
    image: "assets/food-13.png",
    title: "CHERRY & ALMOND TART 🍒",
    description: "",
    alt: "Cherry and Almond Tart",
  },
  {
    image: "assets/food-14.png",
    title: "SQUASH BLOSSOMS 🌼",
    description: "ricotta, zucchini agrodolce, mint",
    alt: "Squash Blossoms with ricotta, zucchini agrodolce, and mint",
  },
  {
    image: "assets/food-15.png",
    title: "GNOCCO FRITTO",
    description: "salsa maro, speck 🫛🍞",
    alt: "Gnocco Fritto with salsa maro and speck",
  },
  {
    image: "assets/food-16.png",
    title: "ROASTED CHICKEN 🍗🥔",
    description: "new potatoes & green onion",
    alt: "Roasted Chicken with new potatoes and green onion",
  },
  {
    image: "assets/food-17.png",
    title: "PARIS HAM SANDWICH 🐷",
    description: "leeks vinaigrette, grand trunk cheese",
    alt: "Paris Ham Sandwich with leeks vinaigrette and grand trunk cheese",
  },
  {
    image: "assets/food-18.png",
    title: "MALFATTI 🍃",
    description: "nettles, spinach, green garlic, pinenuts",
    alt: "Malfatti with nettles, spinach, green garlic, and pinenuts",
  },
  {
    image: "assets/food-19.png",
    title: "BREAKFAST SANDWICH 🥚🧀",
    description: "sausage, egg, hashbrown, cheddar",
    alt: "Breakfast Sandwich with sausage, egg, hashbrown, and cheddar",
  },
  {
    image: "assets/food-20.png",
    title: "FIDDLEHEAD FRITTI 🌿🍋",
    description: "gremolata, lemon",
    alt: "Fiddlehead Fritti with gremolata and lemon",
  },
  {
    image: "assets/food-21.png",
    title: "LOBSTER & GREEN ASPARAGUS 🦞🌱",
    description: "lobster sabayon, tarragon",
    alt: "Lobster and Green Asparagus with lobster sabayon and tarragon",
  },
  {
    image: "assets/food-22.png",
    title: "MAPLE WALNUT TART 🍁",
    description: "islay scotch, charcoal cream",
    alt: "Maple Walnut Tart with islay scotch and charcoal cream",
  },
  {
    image: "assets/food-23.png",
    title: "RABBIT & FOIE GRAS TERRINE 🥕🌱",
    description: "grated carrot salad",
    alt: "Rabbit and Foie Gras Terrine with grated carrot salad",
  },
  {
    image: "assets/food-24.png",
    title: "MUSSEL & CARROT ESCABECHE 🥕🌿",
    description: "",
    alt: "Mussel and Carrot Escabeche",
  },
  {
    image: "assets/food-25.png",
    title: "PICKEREL 🌻🐟",
    description: 'sunchokes & sunflower seed "almondine"',
    alt: "Pickerel with sunchokes and sunflower seed almondine",
  },
  {
    image: "assets/food-26.png",
    title: "CHOCOLATE MALT ICE CREAM & BANANA SORBET 🍌",
    description: "chocolate crumble",
    alt: "Chocolate Malt Ice Cream and Banana Sorbet with chocolate crumble",
  },
  {
    image: "assets/food-27.png",
    title: "FLUKE CRUDO 🐟🌿",
    description: "rhubarb, radish, fennel seed oil, chervil",
    alt: "Fluke Crudo with rhubarb, radish, fennel seed oil, and chervil",
  },
];

// Initialize the dynamic food gallery
function initializeFoodGallery() {
  const container = document.getElementById("food-gallery-container");
  if (!container) {
    console.error("Food gallery container not found");
    return;
  }

  // Always select 8 items from the library
  const numItems = 8;
  const selectedItems = getRandomItems(foodGalleryLibrary, numItems);

  // Render the selected items
  renderFoodGallery(selectedItems, container);
}

// Get random items from array without duplicates
function getRandomItems(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Render the food gallery items
function renderFoodGallery(items, container) {
  const galleryHTML = items
    .map(
      (item, index) => `
    <div class="gallery-item" data-index="${index}">
      <img
        src="${item.image}"
        alt="${item.alt}"
        loading="lazy"
      />
      <div class="gallery-description">
        <h3>${item.title}</h3>
        <p class="desktop-only">${item.description}</p>
      </div>
    </div>
  `
    )
    .join("");

  container.innerHTML = galleryHTML;

  // Add touch interaction for mobile/tablet
  addTouchInteractions(container);

  // Add the "Show me more!" button below the gallery
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "show-more-container";
  buttonContainer.innerHTML = `
    <button class="show-more-btn" onclick="refreshFoodGallery()">
      More
    </button>
  `;

  // Insert the button after the gallery container
  container.parentNode.insertBefore(buttonContainer, container.nextSibling);

  console.log(`Rendered ${items.length} food gallery items`);
}

// Function to refresh the food gallery with new random items
function refreshFoodGallery() {
  const container = document.getElementById("food-gallery-container");
  if (!container) {
    console.error("Food gallery container not found");
    return;
  }

  // Get the entire food-gallery section
  const foodGallerySection = container.closest(".food-gallery");

  // Capture the current height of the entire section BEFORE removing anything
  const sectionHeight = foodGallerySection.offsetHeight;

  // Remove existing button if it exists
  const existingButton = container.parentNode.querySelector(
    ".show-more-container"
  );
  if (existingButton) {
    existingButton.remove();
  }

  // Show loading state while maintaining the same height
  container.innerHTML = `
    <div class="loading-gallery">
      <div class="loading-spinner"></div>
    </div>
  `;

  // Maintain the same height for the entire section
  foodGallerySection.style.height = sectionHeight + "px";

  // Small delay to show loading state, then load new items
  setTimeout(() => {
    // Always select 8 items from the library
    const numItems = 8;
    const selectedItems = getRandomItems(foodGalleryLibrary, numItems);

    // Reset section height to auto for new content
    foodGallerySection.style.height = "auto";

    // Render the selected items
    renderFoodGallery(selectedItems, container);
  }, 500);
}

// Add touch interactions for mobile/tablet devices (only one item shows info at a time)
function addTouchInteractions(container) {
  const galleryItems = () => container.querySelectorAll(".gallery-item");
  const isTouchDevice = () => window.matchMedia("(hover: none)").matches;
  let lastTouchEnd = 0;
  let lastTouchedItem = null;

  // Delegate so taps on the overlay (when info is visible) still toggle the same item closed
  container.addEventListener(
    "touchend",
    (e) => {
      if (!isTouchDevice()) return;
      const item = e.target.closest(".gallery-item");
      if (!item) return;
      e.preventDefault();
      lastTouchEnd = Date.now();
      lastTouchedItem = item;
      galleryItems().forEach((other) => {
        if (other !== item) other.classList.remove("touch-active");
      });
      item.classList.toggle("touch-active");
    },
    { passive: false }
  );

  container.addEventListener("click", (e) => {
    const item = e.target.closest(".gallery-item");
    if (!item) return;
    if (isTouchDevice() && lastTouchedItem === item && Date.now() - lastTouchEnd < 400) {
      e.preventDefault();
      return;
    }
    if (!isTouchDevice()) {
      galleryItems().forEach((other) => {
        if (other !== item) other.classList.remove("touch-active");
      });
      item.classList.toggle("touch-active");
    }
  });
}
