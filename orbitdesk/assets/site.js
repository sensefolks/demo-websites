/* OrbitDesk's fictional product interactions. Everything stays in this browser session. */
(() => {
  'use strict';

  const { Demo } = window;
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('main-nav');

  function closeMenu() {
    navigation?.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
  }

  menu?.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation.classList.toggle('open', open);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav')) closeMenu();
  });

  if (page === 'pricing') {
    function setBilling(period) {
      const yearly = period === 'yearly';
      document.querySelectorAll('[data-billing]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.billing === period));
      });
      document.querySelector('[data-plan-price="pro"]').textContent = yearly ? '12' : '15';
      document.querySelector('[data-plan-price="business"]').textContent = yearly ? '20' : '25';
      document.querySelector('[data-billing-note]').textContent = yearly ? 'Billed yearly. $144 per person / year.' : 'Billed monthly. A little more flexibility.';
      document.querySelector('[data-billing-business]').textContent = yearly ? 'Billed yearly. $240 per person / year.' : 'Billed monthly. A little more flexibility.';
      Demo.state.set('billing', period);
    }
    document.querySelectorAll('[data-billing]').forEach((button) => {
      button.addEventListener('click', () => setBilling(button.dataset.billing));
    });
    setBilling(Demo.state.get('billing', 'yearly') === 'monthly' ? 'monthly' : 'yearly');
    if (params.get('scenario') === 'pricing') Demo.show('pricing-dialog');
  }

  if (page === 'workspace') {
    const board = document.getElementById('project-board');
    const content = document.querySelector('.app-content');
    const storedCompleted = Demo.state.get('completed-tasks', []);
    const completed = new Set(Array.isArray(storedCompleted) ? storedCompleted.filter((id) => typeof id === 'string') : []);
    const storedTasks = Demo.state.get('custom-tasks', []);
    const tasks = Array.isArray(storedTasks) ? storedTasks.filter((task) => task && typeof task.id === 'string' && typeof task.name === 'string') : [];
    const categoryClass = { Design: '', Content: 'green', Development: 'blue', Strategy: 'orange' };

    function updateCounts() {
      board.querySelectorAll('[data-column]').forEach((column) => {
        column.querySelector('.count').textContent = String(column.querySelectorAll('.task-card').length);
      });
      const total = board.querySelectorAll('.task-card').length;
      const done = board.querySelectorAll('[data-column="done"] .task-card').length;
      document.getElementById('task-progress-label').textContent = `${done} of ${total} tasks complete`;
      document.getElementById('task-progress').style.width = `${Math.round((done / total) * 100)}%`;
    }

    function moveToDone(card) {
      card.classList.add('completed');
      const button = card.querySelector('[data-complete]');
      if (button) {
        button.disabled = true;
        button.textContent = '✓ Complete';
        button.setAttribute('aria-label', `${card.querySelector('h3').textContent}, completed`);
      }
      card.querySelector('small').textContent = 'Nicely done';
      board.querySelector('[data-column="done"]').append(card);
    }

    function createTask(task) {
      const article = document.createElement('article');
      article.className = 'task-card';
      article.dataset.task = task.id;
      const category = Object.hasOwn(categoryClass, task.category) ? task.category : 'Strategy';
      const tag = document.createElement('span');
      tag.className = `tag ${categoryClass[category]}`;
      tag.textContent = category;
      const title = document.createElement('h3');
      title.textContent = task.name.slice(0, 100);
      const description = document.createElement('p');
      description.textContent = 'A good idea, ready for its first step.';
      const bottom = document.createElement('div');
      bottom.className = 'task-bottom';
      const avatar = document.createElement('span');
      avatar.className = 'avatar orange';
      avatar.setAttribute('aria-label', 'Alex Morgan');
      avatar.textContent = 'AM';
      const time = document.createElement('small');
      time.textContent = 'Just added';
      const button = document.createElement('button');
      button.className = 'complete-task';
      button.type = 'button';
      button.dataset.complete = task.id;
      button.setAttribute('aria-label', `Complete ${task.name.slice(0, 100)}`);
      button.textContent = '✓ Done';
      bottom.append(avatar, time, button);
      article.append(tag, title, description, bottom);
      const column = board.querySelector('[data-column="todo"]');
      column.insertBefore(article, column.querySelector('.board-add'));
      return article;
    }

    tasks.forEach(createTask);
    board.querySelectorAll('.task-card').forEach((card) => {
      if (completed.has(card.dataset.task)) moveToDone(card);
    });
    updateCounts();

    function completeTask(button, explicitScenario = false) {
      if (!button || button.disabled) return;
      const card = button.closest('.task-card');
      completed.add(card.dataset.task);
      Demo.state.set('completed-tasks', [...completed]);
      moveToDone(card);
      card.tabIndex = -1;
      card.focus({ preventScroll: true });
      updateCounts();
      const shouldOffer = !Demo.state.get('roadmap-offered', false);
      Demo.state.set('roadmap-offered', true);
      Demo.toast('Nicely done. One more good thing moved forward.');
      if (explicitScenario) Demo.show('roadmap-dialog');
      else if (shouldOffer) Demo.show('roadmap-dialog', { automatic: true });
    }

    board.addEventListener('click', (event) => {
      const button = event.target.closest('[data-complete]');
      if (button) completeTask(button);
    });
    document.getElementById('try-roadmap').addEventListener('click', () => {
      const firstTask = board.querySelector('[data-complete]:not(:disabled)');
      if (firstTask) completeTask(firstTask, true);
      else Demo.show('roadmap-dialog');
    });

    function setView(view) {
      content.classList.toggle('board-list', view === 'list');
      document.querySelectorAll('.board-tabs [data-view]').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.view === view));
      });
      Demo.state.set('board-view', view);
    }
    document.querySelectorAll('[data-view]').forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });
    setView(Demo.state.get('board-view', 'board') === 'list' ? 'list' : 'board');

    function addTask(name, category, id = `task-${Date.now()}-${tasks.length}`) {
      const task = { name: name.slice(0, 100), category, id };
      tasks.push(task);
      Demo.state.set('custom-tasks', tasks);
      createTask(task);
      updateCounts();
    }
    document.getElementById('new-task-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = document.getElementById('task-name');
      const name = input.value.trim();
      if (!name) {
        input.setCustomValidity('Give this little task a name.');
        input.reportValidity();
        return;
      }
      input.setCustomValidity('');
      addTask(name, document.getElementById('task-category').value);
      event.currentTarget.reset();
      Demo.hide('task-dialog');
      Demo.toast('A new idea, right where it belongs. Added to To do.');
    });
    document.getElementById('task-name').addEventListener('input', (event) => event.target.setCustomValidity(''));
    const templateButton = document.getElementById('apply-template');
    function updateTemplateButton() {
      if (Demo.state.get('template-applied', false)) {
        templateButton.textContent = 'Already on your board ✓';
        templateButton.disabled = true;
      }
    }
    templateButton.addEventListener('click', () => {
      if (Demo.state.get('template-applied', false)) return;
      addTask('Check every link, one last time', 'Development', 'template-links');
      addTask('Prepare the launch announcement', 'Content', 'template-announcement');
      addTask('Celebrate the people who made it happen', 'Strategy', 'template-celebrate');
      Demo.state.set('template-applied', true);
      updateTemplateButton();
      Demo.hide('template-dialog');
      Demo.toast('A little head start. Three launch tasks added to your board.');
    });
    updateTemplateButton();

    if (params.get('scenario') === 'roadmap') Demo.show('roadmap-dialog');
    if (params.get('scenario') === 'template') Demo.show('template-dialog');
    const selectedPlan = params.get('plan');
    if (['free', 'pro', 'business'].includes(selectedPlan)) {
      const planName = selectedPlan === 'free' ? 'Free' : selectedPlan === 'pro' ? 'Pro' : 'Business';
      Demo.toast(`Welcome in. Explore this sample workspace while considering ${planName}.`);
    }
  }

  if (page === 'help') {
    const form = document.getElementById('help-search');
    const input = document.getElementById('help-query');
    const guides = [...document.querySelectorAll('[data-help]')];
    let category = 'all';

    function filterGuides() {
      const query = input.value.trim().toLowerCase();
      let count = 0;
      guides.forEach((guide) => {
        const matches = (category === 'all' || guide.dataset.help === category) && (!query || guide.textContent.toLowerCase().includes(query));
        guide.hidden = !matches;
        if (matches) count += 1;
      });
      document.getElementById('help-empty').hidden = count > 0;
      document.getElementById('help-results-count').textContent = query ? `${count} ${count === 1 ? 'guide' : 'guides'} found for “${input.value.trim()}”.` : `${count} small ${count === 1 ? 'guide' : 'guides'} to a smoother workday.`;
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      filterGuides();
    });
    input.addEventListener('input', filterGuides);
    document.querySelectorAll('[data-help-category]').forEach((button) => {
      button.addEventListener('click', () => {
        category = button.dataset.helpCategory;
        input.value = '';
        document.querySelectorAll('[data-help-category]').forEach((item) => {
          item.classList.toggle('active', item === button);
          item.setAttribute('aria-pressed', String(item === button));
        });
        const headings = { all: 'The everyday essentials.', basics: 'Start with a little confidence.', projects: 'Keep the good work moving.', billing: 'A plan that feels right.' };
        document.getElementById('help-results-title').textContent = headings[category];
        filterGuides();
      });
    });
    document.getElementById('clear-help').addEventListener('click', () => {
      document.querySelector('[data-help-category="all"]').click();
      input.focus();
    });
    if (params.has('q')) {
      input.value = params.get('q').slice(0, 120);
      filterGuides();
    }
    if (params.get('scenario') === 'helpful') document.getElementById('help-start').open = true;
  }

  if (page === 'account') {
    const start = document.getElementById('start-cancel');
    const flow = document.getElementById('cancel-flow');
    const section = document.getElementById('cancellation-section');
    const success = document.getElementById('cancel-success');

    function applySubscriptionState() {
      const cancelled = Demo.state.get('subscription-cancelled', false) === true;
      section.hidden = cancelled;
      success.hidden = !cancelled;
      document.getElementById('plan-status').textContent = cancelled ? 'Cancellation scheduled' : 'Active subscription';
      document.getElementById('renewal-note').textContent = cancelled ? 'Pro access ends: October 1, 2026.' : 'Next renewal: October 1, 2026.';
    }

    function openCancellation() {
      start.setAttribute('aria-expanded', 'true');
      Demo.show('cancel-flow', { scroll: true });
      const heading = flow.querySelector('h3');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    start.addEventListener('click', openCancellation);
    document.getElementById('keep-plan').addEventListener('click', () => {
      Demo.hide('cancel-flow');
      start.setAttribute('aria-expanded', 'false');
      start.focus();
      Demo.toast('All good. Your fictional Pro plan stays just as it is.');
    });
    document.getElementById('confirm-cancel').addEventListener('click', () => {
      Demo.state.set('subscription-cancelled', true);
      applySubscriptionState();
      success.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
      const heading = success.querySelector('h2');
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    });
    document.getElementById('restore-plan').addEventListener('click', () => {
      Demo.state.set('subscription-cancelled', false);
      flow.hidden = true;
      start.setAttribute('aria-expanded', 'false');
      applySubscriptionState();
      start.focus();
      Demo.toast('Your fictional subscription is active again.');
    });
    applySubscriptionState();
    if (params.get('scenario') === 'cancel' && !section.hidden) openCancellation();
  }
})();
