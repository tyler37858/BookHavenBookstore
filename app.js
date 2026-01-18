const PAGES = 
[
    { href: "./products.html", label: "Products" },
    { href: "./cart.html", label: "Cart" },
    { href: "./contact.html", label: "Contact Us" },
    { href: "./community.html", label: "Community" },
    { href: "./about.html", label: "About Us" }
];

const CART_KEY = "bh_cart";

//utilities
function getCurrnetFileName()
{
    const path = window.location.pathname;
    const file = path.split("/").pop() || "index.html";
    return file.toLowerCase();
}

function money(value)
{
    const n = Number(value);
    if (Number.isNaN(n)) return "$0.00";
    return `$${n.toFixed(2)}`;
}

// build header 

function buildHeader()
{
    const current = getCurrnetFileName();

    const linksHtml = PAGES.map((p) => 
    {
        const isActive = current === p.href.replace("./", "").toLowerCase();
        const cls = isActive ? "menu-link is-active" : "menu-link";
        return `<a class="${cls}" href="${p.href}">${p.label}</a>`;
    }).join("");

    return `
    <header class="site-header">
      <div class="site-header__inner">
        <div class="brand">
          <a href="./index.html" aria-label="Go to home page">
            <img class="brand__logo" src="./images/book_logo.png" alt="Book Haven Bookstore logo" />
          </a>
        </div>

        <p class="brand__title">Book Haven Bookstore</p>

        <button
          class="menu-button"
          type="button"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="menuPanel"
        >
          <span class="burger" aria-hidden="true">
            <span></span><span></span><span></span>
          </span>
        </button>
      </div>

      <div class="menu-panel" id="menuPanel">
        <nav class="menu-panel__box" aria-label="Site menu">
          ${linksHtml}
        </nav>
      </div>
    </header>
  `;
}

// build footer 

function buildFooter() {
  return `
    <footer class="site-footer">
        <div class="site-footer__inner">
            <div class="footer-hours" aria-label="Store hours">
                <p class="footer-hours__line">Hours:</p>
                <p class="footer-hours__line">Monday - Friday: 8 am - 5 pm</p>
                <p class="footer-hours__line">Saturday: 10 am - 6 pm</p>
                <p class="footer-hours__line">Sunday: 11 am - 5 pm</p>
            </div>

            <div class="footer-subscribe">
                <form id="subscribeForm" class="subscribe__form" novalidate>
                    <input
                        id="subscribeEmail"
                        class="subscribe__input"
                        type="email"
                        placeholder="Email"
                        autocomplete="email"
                    />
                    <button id="subscribeBtn" class="subscribe__btn" type="submit">
                        Subscribe
                    </button>
                </form>

                <p id="subscribeThanks" class="subscribe__thanks" hidden>
                    Thank you for subscribing
                </p>
            </div>

            <div class="socials" aria-label="Social media links">
                <a class="social-btn" href="https://www.facebook.com" target="_blank" rel="noreferrer">
                    <span class="social-badge">f</span>
                    <span>Facebook</span>
                </a>

                <a class="social-btn" href="https://x.com" target="_blank" rel="noreferrer">
                    <span class="social-badge">x</span>
                    <span>X</span>
                </a>

                <a class="social-btn" href="https://www.instagram.com" target="_blank" rel="noreferrer">
                    <span class="social-badge">i</span>
                    <span>Instagram</span>
                </a>
            </div>
        </div>
    </footer>
    `;
}

// hamburger menu behavior 

function wireMenu()
{
    const btn = document.querySelector(".menu-button");
    const panel = document.getElementById("menuPanel");

    if (!btn || !panel)
        return;

    const closeMenu = ()  => 
    {
        panel.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", () => 
    {
        const isOpen = panel.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.addEventListener("click" , (e) => 
    {
        const target = e.target;
        const clickedInside = panel.contains(target) || btn.contains(target);
        if (!clickedInside)
            closeMenu();
    });

    document.addEventListener("keydown", (e) => 
    {
        if (e.key === "Escape")
            closeMenu();
    });

    window.addEventListener("resize", () =>
    {
        closeMenu();
    });
}

// cart storage

function readCart()
{
    try
    {
        const raw = localStorage.getItem(CART_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    }
    catch
    {
        return [];
    }
}

// write the cart to local storage 
function writeCart(items)
{
    localStorage.setItem(CART_KEY, JSON.stringify(items))
}

// add item to cart
function addToCart(item)
{
    const cart = readCart();
    cart.push(item);
    writeCart(cart);
}

// remove item from cart 
function removeFromCart(index)
{
    const cart = readCart();
    cart.splice(index, 1);
    writeCart(cart);
}

// remove all items from cart 
function clearCart()
{
    writeCart([]);
}

// wire up the product page 

function wireAddToCartButtons()
{
    // read the procduct data from data attr & adds a cart item to local storage when clicked 
    const buttons = document.querySelectorAll(".add-to-cart");

    if (!buttons.length)
        return;

    buttons.forEach((btn) => 
    {
        btn.addEventListener("click", () =>
        {
            const card = btn.closest(".product-card");

            if (!card)
                return;

            const sku = card.getAttribute("data-sku") || "";
            const name = card.getAttribute("data-name") || "";
            const price = Number(card.getAttribute("data-price") || "0" );
            const descEl = card.querySelector(".product-card__desc");
            const desc = descEl ? descEl.textContent.trim() : "";

            addToCart({ sku, name, desc, price});

            btn.textContent = "Item added to the cart";
            btn.disabled = true;

            // reset the add item button 
            window.setTimeout(() => 
            {
                btn.textContent = "Add to Cart";
                btn.disabled = false;

            }, 900);
        });
    });
}

// cart page message 

let messageTimerId = null;

let orderSuccessVisible = false

function showCartMessage(text, ms)
    {
    const msg = document.getElementById("cartMessage");

    if (!msg)
            return;

    // clear any previous timers so messages do not conflict each other 
    if (messageTimerId)
    {
        window.clearTimeout(messageTimerId);
        messageTimerId = null;
    }

    msg.textContent = text;

    if (typeof ms === "number" && ms > 0) 
    {
        messageTimerId = window.setTimeout(() => 
        {
            if (!orderSuccessVisible)
                    {
                    msg.textContent = "";
                    }
                messageTimerId = null;
        }, ms);
    }
}

function clearCartMessage() 
{
    const msg = document.getElementById("cartMessage");
    
    if (!msg)
            return;

    if (messageTimerId) 
    {
        window.clearTimeout(messageTimerId);
        messageTimerId = null;
    }

    msg.textContent = "";
}

//render cart page 

function renderCartPage() 
{
  // only run when cart page rows exist 
  const rowsHost = document.getElementById("cartRows");
  const totalEl = document.getElementById("cartTotal");
  const emptyEl = document.getElementById("cartEmpty");

  if (!rowsHost || !totalEl || !emptyEl) 
    return;

  const cart = readCart();
  rowsHost.innerHTML = "";

  if (cart.length === 0) 
    {
        emptyEl.hidden = false;
        totalEl.textContent = "$0.00";
        return;
    }

  emptyEl.hidden = true;

  let total = 0;

  cart.forEach((item, index) => 
    {
        total += Number(item.price) || 0;

        const row = document.createElement("div");
        row.className = "cart__row";

        row.innerHTML = `
        <div class="cart__item">
            <p class="cart__item-name">${escapeHtml(item.name)}</p>
            <p class="cart__item-desc">${escapeHtml(item.desc)}</p>
        </div>

        <p class="cart__price">${money(item.price)}</p>

        <button class="btn btn--ghost cart__remove" type="button" data-index="${index}">
            Remove
        </button>
        `;

        rowsHost.appendChild(row);
    });

  totalEl.textContent = money(total);

  // wire up remove buttons after rendering

  rowsHost.querySelectorAll(".cart__remove").forEach((btn) => 
    {
    btn.addEventListener("click", () => 
        {
            const idx = Number(btn.getAttribute("data-index"));
            if (Number.isNaN(idx)) return;

            removeFromCart(idx);
            renderCartPage();

            // Message for 3 seconds. (i added this to have time to get screenshots for documentation)
            orderSuccessVisible = false;
            showCartMessage("Item removed", 3000);
        });
    });
}

//subscribe logic 

const SUBSCRIBE_KEY = "bh_subscribed"
const SUBSCRIBE_EMAIL_KEY = "bh_subscribed_email"

function isValidEmail(email) 
{
  const value = String(email || "").trim()
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value)
}

function wireSubscribe() 
{
  const form = document.getElementById("subscribeForm")
  const input = document.getElementById("subscribeEmail")
  const thanks = document.getElementById("subscribeThanks")

  if (!form || !input || !thanks)
     return

  const alreadySubscribed = localStorage.getItem(SUBSCRIBE_KEY) === "true"

  if (alreadySubscribed) 
    {
        form.hidden = true
        thanks.hidden = false
        return
    }

  form.addEventListener("submit", (e) => 
    {
        e.preventDefault()

        const email = input.value.trim()

        if (!email) {
        console.log("Subscribe validation failed. Email is required.")
        input.focus()
        return
        }

        if (!isValidEmail(email)) {
        console.log("Subscribe validation failed. Email format is invalid:", email)
        input.focus()
        return
        }

        console.log("Subscribe validation passed. Email:", email)

        localStorage.setItem(SUBSCRIBE_KEY, "true")
        localStorage.setItem(SUBSCRIBE_EMAIL_KEY, email)

        form.hidden = true
        thanks.hidden = false
    })
}

function wireCartActions() 
{
  const clearBtn = document.getElementById("clearCartBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const msg = document.getElementById("cartMessage");

  if (!clearBtn || !checkoutBtn || !msg)
     return;

  //when opening the page ensure all old messages are cleaned up 

  orderSuccessVisible = false;
  clearCartMessage();

  clearBtn.addEventListener("click", () => 
    {
        clearCart();
        renderCartPage();

        orderSuccessVisible = false;
        showCartMessage("Cart cleared", 3000);
    });

  checkoutBtn.addEventListener("click", () => 
    {
        orderSuccessVisible = false;
        showCartMessage("Order Processed", 3000);

        //clear cart and display empty cart 
        clearCart();
        renderCartPage();

        // shows order successful after process order pressed 
        orderSuccessVisible = true;
        msg.textContent = "Thank you for your order";
    });
}

//saftey to escape html

function escapeHtml(value) 
{
  //prevents HTML injection when rendering strings into the DOM.
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

//layout injection

function injectLayout() 
{
  const headerSlot = document.getElementById("siteHeader");
  const footerSlot = document.getElementById("siteFooter");

  if (headerSlot) headerSlot.innerHTML = buildHeader();
  if (footerSlot) footerSlot.innerHTML = buildFooter();

  wireMenu();
  wireAddToCartButtons();
  wireCartActions();
  renderCartPage();
}

//contact page 

const CONTACT_KEY = "bh_contact_submitted";

function wireContactForm() {
  const form = document.getElementById("contactForm");
  const content = document.getElementById("contactContent");
  const thankYou = document.getElementById("contactThankYou");

  if (!form || !content || !thankYou)
     return;

  const alreadySubmitted = localStorage.getItem(CONTACT_KEY) === "true";

  if (alreadySubmitted) {
    content.hidden = true;
    thankYou.hidden = false;
    return;
  }

  form.addEventListener("submit", (e) => 
    {
        e.preventDefault();

        localStorage.setItem(CONTACT_KEY, "true");

        content.hidden = true;
        thankYou.hidden = false;
    });
}


injectLayout();
wireSubscribe();
wireContactForm();
