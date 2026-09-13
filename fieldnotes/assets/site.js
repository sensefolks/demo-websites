(() => {
  'use strict';
  const demo = window.Demo;
  const $ = (query, root = document) => root.querySelector(query);
  const $$ = (query, root = document) => [...root.querySelectorAll(query)];
  const stories = [
    {title:'A weekend with no particular hurry.', category:'Weekend escapes', tags:'weekend mountain mountains guide slow travel quiet packing nature', summary:'Two days, a small bag, and a gentler way to get away. Our guide to leaving room for the unexpected.', url:'/articles/weekend-guide/', image:'/assets/mountain-hero.jpg'},
    {title:'The quiet way through the trees.', category:'Walking', tags:'forest woods trees trail walk walking green woodland', summary:'A sheltered woodland loop, an unhurried lunch, and the pleasure of taking the long way back.', url:'/articles/weekend-guide/#forest', image:'/assets/forest-trail.jpg'},
    {title:'Follow the coast, forget the clock.', category:'Notes & rituals', tags:'coast coastal sea ocean beach sunset coffee ritual journal', summary:'A morning by the water, with a flask of coffee and absolutely nowhere else to be.', url:'/articles/weekend-guide/#coast', image:'/assets/coastal-path.jpg'}
  ];

  $$('[data-category-filter]').forEach(button => button.addEventListener('click', () => {
    $$('[data-category-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let count = 0;
    $$('[data-story-category]').forEach(card => {
      card.hidden = button.dataset.categoryFilter !== 'all' && card.dataset.storyCategory !== button.dataset.categoryFilter;
      if (!card.hidden) count++;
    });
    const status = $('#filter-status');
    if (status) status.textContent = count + (count === 1 ? ' story shown.' : ' stories shown.');
  }));

  $$('[data-bookmark]').forEach(button => {
    const render = () => {
      const saved = demo.state.get('bookmarked-guide', false);
      button.setAttribute('aria-pressed', String(saved));
      $('[data-bookmark-label]', button).textContent = saved ? 'Saved for later' : 'Save for later';
    };
    render();
    button.addEventListener('click', () => {
      const saved = !demo.state.get('bookmarked-guide', false);
      demo.state.set('bookmarked-guide', saved);
      render();
      demo.toast(saved ? 'Guide saved in this browser.' : 'Guide removed from your saved stories.');
    });
  });

  const article = $('[data-article-body]');
  if (article) {
    const updateProgress = () => {
      const rect = article.getBoundingClientRect();
      const progress = Math.max(0, Math.min(100, Math.round((window.innerHeight - rect.top) / Math.max(rect.height, 1) * 100)));
      const label = $('#reading-progress');
      const meter = $('#reading-meter-fill');
      if (label) label.textContent = progress + '% of the guide explored';
      if (meter) meter.style.width = progress + '%';
      const target = $('#article-reaction');
      if (progress >= 70 && target && target.hidden) demo.show('article-reaction', {automatic:true, scroll:false});
    };
    window.addEventListener('scroll', updateProgress, {passive:true});
    window.addEventListener('resize', updateProgress);
    window.addEventListener('load', updateProgress, {once:true});
    updateProgress();
    $('[data-try-reading]')?.addEventListener('click', () => demo.show('article-reaction', {automatic:false, scroll:true}));
  }

  const searchForm = $('#search-form');
  if (searchForm) {
    const input = $('#search-input');
    const renderResults = (query, updateURL = true) => {
      const normalized = query.trim().toLowerCase();
      const words = normalized.split(/\s+/).filter(Boolean);
      const matches = stories.filter(story => words.every(word => (story.title + ' ' + story.tags + ' ' + story.category).toLowerCase().includes(word)));
      const container = $('#search-results');
      container.replaceChildren();
      $('#results-label').textContent = normalized ? matches.length + (matches.length === 1 ? ' story' : ' stories') + ' for “' + query.trim() + '”' : 'Explore all ' + stories.length + ' stories';
      matches.forEach(story => {
        const card = document.createElement('article');
        card.className = 'result-card';
        const imageLink = document.createElement('a');
        imageLink.href = story.url;
        imageLink.tabIndex = -1;
        imageLink.setAttribute('aria-hidden', 'true');
        const image = document.createElement('img');
        image.src = story.image;
        image.alt = '';
        image.loading = 'lazy';
        imageLink.append(image);
        const copy = document.createElement('div');
        const category = document.createElement('div');
        category.className = 'eyebrow orange';
        category.textContent = story.category;
        const heading = document.createElement('h2');
        const link = document.createElement('a');
        link.href = story.url;
        link.textContent = story.title;
        heading.append(link);
        const summary = document.createElement('p');
        summary.textContent = story.summary;
        copy.append(category, heading, summary);
        card.append(imageLink, copy);
        container.append(card);
      });
      $('#empty-state').hidden = matches.length !== 0;
      if (matches.length === 0) demo.show('search-feedback', {automatic:false, scroll:false});
      else demo.hide('search-feedback');
      if (updateURL) {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        history.replaceState(null, '', '/search/' + (params.size ? '?' + params.toString() : ''));
      }
    };
    input.value = new URLSearchParams(window.location.search).get('q') || '';
    renderResults(input.value, false);
    searchForm.addEventListener('submit', event => {event.preventDefault(); renderResults(input.value);});
    $$('[data-search-term]').forEach(button => button.addEventListener('click', () => {
      input.value = button.dataset.searchTerm;
      renderResults(input.value);
    }));
    $('[data-try-search]')?.addEventListener('click', () => {
      input.value = 'moonwalking';
      renderResults(input.value);
      $('#empty-state').scrollIntoView({behavior:'smooth', block:'center'});
    });
    $('[data-clear-search]')?.addEventListener('click', () => {input.value = ''; renderResults(''); input.focus();});
  }

  const billingButtons = $$('[data-billing]');
  if (billingButtons.length) {
    const setBilling = billing => {
      demo.state.set('membership-billing', billing);
      billingButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.billing === billing)));
      $('#member-price').textContent = billing === 'yearly' ? '$48' : '$5';
      $('#member-period').textContent = billing === 'yearly' ? '/ year' : '/ month';
      $('#price-caption').textContent = billing === 'yearly' ? 'A little thank-you: save $12 across the year.' : 'A small monthly contribution to independent stories.';
    };
    setBilling(demo.state.get('membership-billing', 'yearly'));
    billingButtons.forEach(button => button.addEventListener('click', () => setBilling(button.dataset.billing)));
    $$('[data-preview-plan]').forEach(button => button.addEventListener('click', () => {
      const plan = button.dataset.previewPlan;
      demo.state.set('membership-preview', plan);
      $('#preview-plan-name').textContent = plan;
      $('#membership-preview-message').textContent = 'You are previewing ' + plan + '. Your reading list is ready to explore.';
      $('#membership-preview-message').hidden = false;
      demo.show('membership-dialog', {automatic:false, scroll:false});
    }));
    $('[data-try-membership]')?.addEventListener('click', () => demo.show('membership-poll', {automatic:false, scroll:true}));
  }

  const preferenceForm = $('#preferences-form');
  if (preferenceForm) {
    const savedTopics = demo.state.get('newsletter-topics', ['weekends', 'walking']);
    $$('input[name=topics]', preferenceForm).forEach(input => { input.checked = savedTopics.includes(input.value); });
    $('#newsletter-cadence').value = demo.state.get('newsletter-cadence', 'weekly');
    const renderSubscription = () => {
      const subscribed = demo.state.get('newsletter-subscribed', true);
      $('#subscriber-status').textContent = subscribed ? 'Subscribed' : 'Unsubscribed';
      $('#subscriber-status').classList.toggle('paused', !subscribed);
      $('#unsubscribe-success').hidden = subscribed;
      $('#unsubscribe-area').hidden = !subscribed;
      $('#preferences-fields').disabled = !subscribed;
      $('#save-preferences').disabled = !subscribed;
      $('#save-preferences').textContent = subscribed ? 'Save reading preferences' : 'Subscription is paused';
      if (subscribed) demo.hide('newsletter-feedback');
      return subscribed;
    };
    const unsubscribe = () => {
      demo.state.set('newsletter-subscribed', false);
      renderSubscription();
      demo.show('newsletter-feedback', {automatic:false, scroll:false});
      demo.toast('Unsubscribed. Your demo newsletter is now paused.');
      $('#unsubscribe-success').focus({preventScroll:true});
    };
    renderSubscription();
    if (!demo.state.get('newsletter-subscribed', true)) demo.show('newsletter-feedback', {automatic:false, scroll:false});
    preferenceForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!demo.state.get('newsletter-subscribed', true)) return;
      demo.state.set('newsletter-topics', $$('input[name=topics]:checked', preferenceForm).map(input => input.value));
      demo.state.set('newsletter-cadence', $('#newsletter-cadence').value);
      demo.toast('Reading preferences saved in this browser.');
    });
    $('[data-unsubscribe]')?.addEventListener('click', unsubscribe);
    $('[data-try-unsubscribe]')?.addEventListener('click', () => {
      unsubscribe();
      $('#unsubscribe-success').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'center'});
    });
    $('[data-resubscribe]')?.addEventListener('click', () => {
      demo.state.set('newsletter-subscribed', true);
      renderSubscription();
      demo.toast('Your demo newsletter subscription is active again.');
    });
  }
})();
