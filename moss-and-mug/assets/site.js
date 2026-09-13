(() => {
  'use strict';

  const catalog = {
    'starter-kit': { name: 'The morning kit', description: 'Pour-over, mug & 250g of coffee', price: 64, image: '/assets/coffee-hero.jpg' },
    'ceramic-mug': { name: 'The everyday mug', description: 'Hand-finished ceramic · 300ml', price: 24, image: '/assets/coffee-cup.jpg' },
    'house-coffee': { name: 'The house blend', description: 'Whole bean · 250g · medium roast', price: 18, image: '/assets/coffee-beans.jpg' }
  };
  const money = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const getCart = () => {
    const value = Demo.state.get('moss-cart', []);
    if (!Array.isArray(value)) return [];
    return value.filter(item => item && Object.hasOwn(catalog, item.id) && Number.isInteger(item.quantity) && item.quantity > 0).map(item => ({ id: item.id, quantity: Math.min(20, item.quantity) }));
  };
  let cart = getCart();
  let delivery = 'standard';
  let inactivityTimer;
  let cartPromptDismissed = false;
  const count = () => cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = () => cart.reduce((total, item) => total + catalog[item.id].price * item.quantity, 0);
  const updateCount = () => {
    document.querySelectorAll('[data-cart-count]').forEach(element => { element.textContent = count(); });
    document.querySelectorAll('[data-cart-link]').forEach(element => { element.setAttribute('aria-label', `Your bag, ${count()} ${count() === 1 ? 'item' : 'items'}`); });
  };
  const saveCart = () => {
    Demo.state.set('moss-cart', cart);
    updateCount();
  };
  const addToCart = (id, quantity = 1) => {
    if (!Object.hasOwn(catalog, id)) return;
    const existing = cart.find(item => item.id === id);
    if (existing) existing.quantity = Math.min(20, existing.quantity + quantity);
    else cart.push({ id, quantity: Math.min(20, quantity) });
    saveCart();
    Demo.toast(`${catalog[id].name} added to your bag.`);
  };

  document.querySelectorAll('[data-add-product]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById('product-quantity');
      const quantity = input ? Math.max(1, Math.min(20, Math.floor(Number(input.value) || 1))) : 1;
      if (input) input.value = quantity;
      addToCart(button.dataset.addProduct, quantity);
      button.textContent = 'Added to your bag ✓';
      window.setTimeout(() => { button.innerHTML = button.dataset.originalLabel || 'Add to bag <span aria-hidden="true">+</span>'; }, 1700);
    });
  });

  document.querySelectorAll('[data-product-quantity]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById('product-quantity');
      input.value = Math.max(1, Math.min(20, (Number(input.value) || 1) + Number(button.dataset.productQuantity)));
    });
  });
  document.getElementById('product-quantity')?.addEventListener('change', event => {
    event.target.value = Math.max(1, Math.min(20, Math.floor(Number(event.target.value) || 1)));
  });

  document.querySelectorAll('[data-product-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-product-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
      let visible = 0;
      document.querySelectorAll('[data-product-category]').forEach(card => {
        card.hidden = button.dataset.productFilter !== 'all' && card.dataset.productCategory !== button.dataset.productFilter;
        if (!card.hidden) visible++;
      });
      document.getElementById('filter-result').textContent = `${visible} ${visible === 1 ? 'thoughtful essential' : 'thoughtful essentials'}`;
    });
  });

  document.querySelectorAll('[data-gallery-image]').forEach(button => {
    button.addEventListener('click', () => {
      const hero = document.getElementById('product-main-image');
      hero.src = button.dataset.galleryImage;
      hero.alt = button.querySelector('img').alt;
      document.querySelectorAll('[data-gallery-image]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  });

  const summaryRows = shipping => `<div class="summary-row"><span>Subtotal</span><span>${money(subtotal())}</span></div><div class="summary-row"><span>Delivery</span><span>${shipping ? money(shipping) : 'On us'}</span></div><div class="summary-row summary-total"><span>Total <span class="muted">USD</span></span><span>${money(subtotal() + shipping)}</span></div>`;
  const itemPreview = item => {
    const product = catalog[item.id];
    return `<div class="checkout-item"><img src="${product.image}" alt="${product.name}" width="72" height="78"><div><h3>${product.name}</h3><p>Quantity ${item.quantity}</p></div><span>${money(product.price * item.quantity)}</span></div>`;
  };

  function renderCart() {
    const content = document.getElementById('cart-content');
    if (!content) return;
    const itemCount = document.getElementById('cart-item-count');
    itemCount.textContent = `${count()} ${count() === 1 ? 'good thing' : 'good things'}, ready for a slower morning.`;
    if (!cart.length) {
      content.innerHTML = `<section class="empty-state"><div class="empty-icon" aria-hidden="true">☕</div><h2>A little room for a ritual.</h2><p>Your bag is taking a breather. Explore a few good things made for your everyday coffee.</p><a class="button" href="/#shop">Find your morning essential <span class="arrow" aria-hidden="true">↗</span></a></section>`;
      document.getElementById('cart-feedback').hidden = true;
      window.clearTimeout(inactivityTimer);
      return;
    }
    content.innerHTML = `<div class="cart-layout"><section aria-label="Items in your bag"><div class="cart-headings" aria-hidden="true"><span>Your essentials</span><span>Quantity</span><span>Total</span></div>${cart.map(item => {
      const product = catalog[item.id];
      return `<article class="cart-line"><div class="cart-product"><img src="${product.image}" alt="${product.name}" width="94" height="112"><div><h2>${product.name}</h2><p>${money(product.price)} each</p><button class="text-button remove-item" data-remove-product="${item.id}" aria-label="Remove ${product.name}">Remove</button></div></div><div class="quantity-control"><button data-cart-change="${item.id}" data-change="-1" aria-label="Decrease quantity of ${product.name}" ${item.quantity <= 1 ? 'disabled' : ''}>−</button><output aria-label="Quantity of ${product.name}">${item.quantity}</output><button data-cart-change="${item.id}" data-change="1" aria-label="Increase quantity of ${product.name}" ${item.quantity >= 20 ? 'disabled' : ''}>+</button></div><span class="line-price">${money(product.price * item.quantity)}</span></article>`;
    }).join('')}<div class="cart-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16v14H4zM8 8V6a4 4 0 0 1 8 0v2M8 14h8"/></svg><p>Packed with a little care.<br>Recyclable packaging. A handwritten kind of feeling.</p></div></section><aside class="summary-card"><h2>Your order</h2>${summaryRows(0)}<a class="button full-width" href="/checkout/">Continue to checkout <span class="arrow" aria-hidden="true">→</span></a><p class="summary-caption">A practice purchase, with all the good details.<br>No payment or personal information needed.</p></aside></div>`;
    content.querySelectorAll('[data-remove-product]').forEach(button => button.addEventListener('click', () => {
      const product = catalog[button.dataset.removeProduct];
      cart = cart.filter(item => item.id !== button.dataset.removeProduct);
      saveCart(); renderCart(); resetInactivity();
      Demo.toast(`${product.name} removed from your bag.`);
      content.querySelector('button, a')?.focus();
    }));
    content.querySelectorAll('[data-cart-change]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.cartChange;
      const change = button.dataset.change;
      const item = cart.find(entry => entry.id === id);
      item.quantity = Math.max(1, Math.min(20, item.quantity + Number(change)));
      saveCart(); renderCart(); resetInactivity();
      const nextButton = content.querySelector(`[data-cart-change="${id}"][data-change="${change}"]`);
      if (nextButton && !nextButton.disabled) nextButton.focus();
      else content.querySelector(`[data-cart-change="${id}"]:not(:disabled)`)?.focus();
    }));
  }

  function resetInactivity() {
    window.clearTimeout(inactivityTimer);
    if (!document.getElementById('cart-content') || document.hidden || !cart.length || cartPromptDismissed || !document.getElementById('cart-feedback').hidden) return;
    inactivityTimer = window.setTimeout(() => {
      if (document.hidden || !cart.length || cartPromptDismissed) return;
      if (Demo.isTyping()) { resetInactivity(); return; }
      Demo.show('cart-feedback', { automatic: true, scroll: false });
    }, 20000);
  }

  if (document.getElementById('cart-content')) {
    renderCart();
    ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'].forEach(name => document.addEventListener(name, resetInactivity, { passive: true }));
    document.addEventListener('visibilitychange', resetInactivity);
    document.querySelectorAll('[data-try-cart]').forEach(button => button.addEventListener('click', () => {
      if (!cart.length) { addToCart('starter-kit'); renderCart(); }
      window.clearTimeout(inactivityTimer);
      Demo.show('cart-feedback', { automatic: false, scroll: true });
    }));
    document.querySelectorAll('[data-dismiss-cart]').forEach(button => button.addEventListener('click', () => {
      cartPromptDismissed = true;
      window.clearTimeout(inactivityTimer);
      Demo.hide('cart-feedback');
      document.querySelector('[data-try-cart]')?.focus();
    }));
    resetInactivity();
  }

  function renderCheckoutSummary() {
    const summary = document.getElementById('checkout-summary');
    if (!summary) return;
    summary.innerHTML = `<h2>Your good things</h2><div class="checkout-items">${cart.map(itemPreview).join('')}</div>${summaryRows(delivery === 'express' ? 8 : 0)}<button class="button full-width" type="submit" form="demo-checkout">Place demo order <span class="arrow" aria-hidden="true">→</span></button><p class="checkout-legal">This is a fictional shop. Nothing is charged or shipped. Prices include any fictional taxes.</p>`;
  }
  if (document.getElementById('checkout-content')) {
    if (!cart.length) {
      document.getElementById('checkout-content').hidden = true;
      document.getElementById('checkout-empty').hidden = false;
    } else renderCheckoutSummary();
    document.querySelectorAll('input[name="shipping"]').forEach(input => input.addEventListener('change', () => {
      delivery = input.value;
      renderCheckoutSummary();
      Demo.toast(delivery === 'express' ? 'Express delivery selected. Demo total updated.' : 'Standard delivery selected. Demo total updated.');
    }));
    document.getElementById('demo-checkout').addEventListener('submit', event => {
      event.preventDefault();
      if (!cart.length) return;
      const order = {
        id: `MM-${Date.now().toString(36).slice(-6).toUpperCase()}`,
        items: cart.map(item => ({ ...item })),
        delivery,
        payment: document.querySelector('input[name="payment"]:checked')?.value || 'wallet',
        subtotal: subtotal(),
        shipping: delivery === 'express' ? 8 : 0
      };
      Demo.state.set('moss-order', order);
      cart = []; saveCart();
      window.location.assign('/order/');
    });
  }

  function renderOrder() {
    const orderView = document.getElementById('order-content');
    if (!orderView) return;
    const order = Demo.state.get('moss-order', null);
    const validOrder = order && typeof order.id === 'string' && /^MM-[A-Z0-9]+$/.test(order.id) && Array.isArray(order.items) && order.items.length && order.items.every(item => item && Object.hasOwn(catalog, item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 20);
    orderView.hidden = !validOrder;
    document.getElementById('order-empty').hidden = !!validOrder;
    if (!validOrder) return;
    document.getElementById('order-number').textContent = `Demo order ${order.id}`;
    document.getElementById('order-delivery').textContent = order.delivery === 'express' ? 'Express · 1–2 days' : 'Standard · 3–5 days';
    document.getElementById('order-payment').textContent = order.payment === 'gift' ? 'Fictional gift credit' : 'Demo wallet';
    const total = order.items.reduce((sum, item) => sum + catalog[item.id].price * item.quantity, 0) + (order.delivery === 'express' ? 8 : 0);
    document.getElementById('order-items').innerHTML = `<h2>A few good things, on their way.</h2>${order.items.map(itemPreview).join('')}<div class="summary-row summary-total"><span>Demo total <span class="muted">USD</span></span><span>${money(total)}</span></div>`;
  }
  function createSampleOrder() {
    Demo.state.set('moss-order', { id: 'MM-SAMPLE', items: [{ id: 'starter-kit', quantity: 1 }], delivery: 'standard', payment: 'wallet', subtotal: 64, shipping: 0 });
    renderOrder();
    document.getElementById('order-content').scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    document.getElementById('order-title')?.focus();
  }
  document.querySelector('[data-sample-order]')?.addEventListener('click', createSampleOrder);
  document.querySelector('[data-try-order]')?.addEventListener('click', () => {
    if (document.getElementById('order-content').hidden) createSampleOrder();
    document.getElementById('checkout-reaction').scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  updateCount();
  renderOrder();
})();
