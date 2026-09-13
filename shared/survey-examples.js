/* A configuration explorer, not a live survey. All example data is fictional. */
(() => {
  'use strict';
  const catalog = window.SurveyCatalog;
  const site = document.body.dataset.site;
  if (!catalog || !Object.hasOwn(catalog.sites, site)) return;
  const explorer = Boolean(document.getElementById('example-controls'));
  const params = new URLSearchParams(location.search);
  let selection = catalog.normalize({ ...Object.fromEntries(params), site });
  const byId = (id) => document.getElementById(id);
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const link = (text, href, className = 'example-link') => {
    const node = element('a', className, text);
    node.href = href;
    return node;
  };
  function button(text, callback, className = 'example-button') {
    const node = element('button', className, text);
    node.type = 'button';
    node.addEventListener('click', callback);
    return node;
  }
  function addSelect(root, key, label, options, value, update) {
    const wrapper = element('div', 'example-control');
    const title = element('label', '', label);
    title.htmlFor = `example-${key}`;
    const select = element('select');
    select.id = title.htmlFor;
    select.name = key;
    for (const item of options) {
      const option = element('option', '', item.label);
      option.value = item.value;
      select.append(option);
    }
    select.value = value;
    select.addEventListener('change', () => update(key, select.value));
    wrapper.append(title, select);
    root.append(wrapper);
    return select;
  }
  const choices = (items) => items.map(([value, label]) => ({ value, label }));

  function placeholder(example, id) {
    const target = element('section', 'survey-placeholder');
    target.id = id;
    target.dataset.survey = example.selection.type;
    target.dataset.trigger = example.scenario.trigger;
    target.dataset.question = example.question;
    target.dataset.dataMode = example.selection.data;
    target.dataset.variant = catalog.toQuery(example.selection);
    Demo.initializePlaceholders(target);
    const summary = element('p', 'survey-placeholder__trigger', `${catalog.dataModes[example.selection.data]} · ${example.respondent.length} respondent fields · ${Object.keys(example.session).length} session fields`);
    target.append(summary);
    return target;
  }

  function renderFacts(example, root) {
    root.replaceChildren();
    const facts = element('dl', 'example-facts');
    for (const fact of example.facts) {
      const row = element('div'); row.append(element('dt', '', fact.label), element('dd', '', fact.value)); facts.append(row);
    }
    root.append(facts);
    if (example.items.length) {
      const list = element('ul', 'example-options');
      for (const item of example.items) list.append(element('li', '', item));
      root.append(element('h3', '', ['UserChoice'].includes(example.selection.type) ? 'Example attributes' : example.selection.type === 'FeaturePriority' ? 'Example features' : 'Example choices'), list);
    }
    if (example.respondent.length) {
      const tableWrap = element('div', 'example-fields');
      const table = element('table');
      const caption = element('caption', '', 'Respondent fields · fictional values, no data entry');
      const head = element('thead');
      const row = element('tr');
      for (const label of ['Field', 'Input type', 'Rule', 'Example']) { const th = element('th', '', label); th.scope = 'col'; row.append(th); }
      head.append(row);
      const body = element('tbody');
      for (const field of example.respondent) {
        const row = element('tr');
        for (const value of [field.label, field.type, field.required ? 'Required' : 'Optional', field.sample]) row.append(element('td', '', value));
        body.append(row);
      }
      table.append(caption, head, body);
      tableWrap.append(table);
      root.append(tableWrap, element('p', 'example-note', 'Choice fields use three sample options. Required and optional rules apply independently to each field. Nothing is entered or submitted here.'));
    }
    if (Object.keys(example.session).length) {
      root.append(element('h3', '', 'Fictional session data'));
      const values = element('dl', 'example-facts example-session');
      for (const [key, value] of Object.entries(example.session)) {
        const row = element('div'); row.append(element('dt', '', `${key} · ${typeof value}`), element('dd', '', String(value))); values.append(row);
      }
      root.append(values, element('p', 'example-note', example.selection.schema === 'declared' ? 'Declared schema: every selected field is supplied with its matching type before the embed mounts.' : 'Without a declared schema: the host supplies the same safe, flat example values.'));
    }
  }

  function renderContext(example, root) {
    root.replaceChildren(element('span', 'example-chip', `${example.site.name} / ${example.selection.type}`), element('h2', '', example.scenario.title), element('p', '', example.scenario.context));
    root.append(element('p', 'example-note', `${example.scenario.path} · ${example.scenario.trigger}`));
  }

  function ensureDialog() {
    let dialog = byId('example-dialog');
    if (!dialog) {
      dialog = element('dialog', 'example-dialog');
      dialog.id = 'example-dialog';
      dialog.setAttribute('aria-labelledby', 'example-dialog-title');
      const top = element('div', 'example-dialog-top');
      const title = element('h2', '', 'Survey preview');
      title.id = 'example-dialog-title';
      const close = button('×', () => Demo.hide(dialog));
      close.setAttribute('aria-label', 'Close survey preview');
      top.append(title, close);
      const slot = element('div'); slot.id = 'example-dialog-slot';
      dialog.append(top, slot, button('Continue without feedback', () => Demo.hide(dialog)));
      document.body.append(dialog);
      dialog.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
      });
    }
    return dialog;
  }

  function reveal(example) {
    if (example.selection.placement === 'inline') {
      const slot = byId('example-inline');
      slot.replaceChildren(placeholder(example, 'example-placeholder-inline'));
      slot.hidden = false;
      slot.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else {
      const dialog = ensureDialog();
      dialog.classList.toggle('example-dialog--drawer', example.selection.placement === 'drawer');
      byId('example-dialog-title').textContent = example.scenario.title;
      byId('example-dialog-slot').replaceChildren(placeholder(example, 'example-placeholder-dialog'));
      Demo.show(dialog);
    }
    if (byId('example-status')) byId('example-status').textContent = `${example.selection.type} placeholder shown with ${catalog.dataModes[example.selection.data].toLowerCase()}.`;
  }

  function renderControls() {
    const root = byId('example-controls');
    const focused = document.activeElement?.id;
    root.replaceChildren();
    for (const definition of catalog.axes[selection.type]) {
      if (selection.type === 'PricePoint' && definition.key === 'currency' && selection.cohort === 'legacy') continue;
      const options = definition.options.filter((item) => {
        if (definition.key === 'shortlist') return Number(item.value) < Number(selection.features);
        if (definition.key === 'answer' && selection.choice === 'single') return item.value !== 'mixed';
        if (definition.key === 'reactionAction' && selection.reaction === 'favourite') return item.value !== 'change';
        return true;
      });
      addSelect(root, definition.key, definition.label, options, selection[definition.key], update);
    }
    if (selection.type === 'FastPoll' && selection.followup === 'selected') {
      const group = element('fieldset');
      group.append(element('legend', '', 'Which choices trigger the follow-up?'));
      catalog.sites[site].scenarios.FastPoll.choices.forEach((choice, index) => addSelect(group, `trigger_${index}`, choice, choices([['on', 'Triggers follow-up'], ['off', 'Skips follow-up']]), selection[`trigger_${index}`], update));
      group.append(element('p', 'example-note', 'Any nonempty subset is supported. Other is not a configurable follow-up trigger.'));
      root.append(group);
    }
    if (selection.type === 'UserChoice') addSelect(root, 'attributes', 'Number of attributes', (selection.mode === 'lite' ? ['3', '4'] : ['4', '5', '6', '7']).map((value) => ({ value, label: value })), selection.attributes, update);
    addSelect(root, 'data', 'Data accompanying the response', Object.entries(catalog.dataModes).filter(([key]) => selection.type !== 'Reaction' || ['none', 'session'].includes(key)).map(([value, label]) => ({ value, label })), selection.data, update);
    if (selection.type === 'Reaction') root.append(element('p', 'example-note', 'Respondent-only and combined modes are unavailable: Reaction does not support respondent fields.'));
    if (['respondent', 'both'].includes(selection.data)) {
      const group = element('fieldset', 'example-field-controls');
      group.append(element('legend', '', 'Respondent fields'));
      catalog.respondentTypes.forEach((type, index) => addSelect(group, `field_${type}`, `${type} · ${catalog.sites[site].fields[index]}`, choices([['off', 'Not included'], ['optional', 'Optional'], ['required', 'Required']]), selection[`field_${type}`], update));
      group.append(element('p', 'example-note', 'Include any combination of field types. At least one remains selected while respondent data is enabled.'));
      root.append(group);
    }
    if (['session', 'both'].includes(selection.data)) {
      const group = element('fieldset', 'example-field-controls');
      group.append(element('legend', '', 'Session data'));
      addSelect(group, 'schema', 'Session schema', choices([['declared', 'Declared string / number / boolean schema'], ['unconfigured', 'Safe values without a declared schema']]), selection.schema, update);
      for (const type of ['string', 'number', 'boolean']) addSelect(group, `session_${type}`, `${type} field`, choices([['on', 'Include'], ['off', 'Not included']]), selection[`session_${type}`], update);
      root.append(group);
    }
    if (selection.type !== 'Reaction') addSelect(root, 'bot', 'Bot protection configuration', choices([['off', 'Off'], ['on', 'On · placeholder only']]), selection.bot, update);
    addSelect(root, 'placement', 'Placement on the host page', choices([['inline', 'Inline'], ['dialog', 'Dialog'], ['drawer', 'Side drawer']]), selection.placement, update);
    if (focused?.startsWith('example-')) byId(focused)?.focus({ preventScroll: true });
  }

  function update(key, value) {
    selection = catalog.normalize({ ...selection, [key]: value, site });
    history.replaceState(null, '', `${location.pathname}?${catalog.toQuery(selection)}`);
    render();
  }

  function render() {
    const example = catalog.describe(selection);
    byId('example-types').querySelectorAll('button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.type === selection.type)));
    renderControls();
    renderContext(example, byId('example-context'));
    renderFacts(example, byId('example-details'));
    byId('example-notes').replaceChildren(element('p', 'example-note', example.note));
    if (selection.type === 'Reaction') byId('example-notes').append(element('p', 'example-note', 'Pending example: Favourite Gallery for workspace templates, coffee collections, or reading lists. Add it after gallery support is implemented; no working gallery is implied by this placeholder.'));
    const actions = byId('example-actions');
    actions.replaceChildren(button('Try this combination', () => reveal(catalog.describe(selection))), link('Open in page context ↗', `${example.scenario.path}?example=1&${catalog.toQuery(selection)}#survey-example`));
    const slot = byId('example-inline');
    slot.replaceChildren();
    slot.hidden = true;
    if (byId('example-dialog')?.open) byId('example-dialog').close();
    byId('example-status').textContent = `${selection.type} · ${catalog.dataModes[selection.data]} · ${selection.placement}`;
  }

  if (explorer) {
    const tabs = byId('example-types');
    catalog.types.forEach((type) => {
      const tab = button(type, () => {
        selection = catalog.normalize({ site, type, data: selection.data });
        history.replaceState(null, '', `${location.pathname}?${catalog.toQuery(selection)}`);
        render();
      }, 'example-type');
      tab.dataset.type = type;
      tab.setAttribute('aria-pressed', 'false');
      tabs.append(tab);
    });
    const cards = byId('example-scenarios');
    catalog.types.forEach((type) => {
      const item = catalog.sites[site].scenarios[type];
      const card = element('article', 'example-card');
      card.dataset.exampleType = type;
      card.append(element('span', 'example-chip', type), element('h3', '', item.title), element('p', '', item.context), link('Explore combinations ↗', `/survey-examples/?type=${type}`));
      cards.append(card);
    });
    render();
  } else if (params.get('example') === '1') {
    const example = catalog.describe(selection);
    const section = element('section', 'example-context-entry');
    section.id = 'survey-example';
    section.tabIndex = -1;
    const context = element('div', 'example-context-card');
    renderContext(example, context);
    const details = element('details', 'example-context-details');
    details.append(element('summary', '', 'See the selected variant and data'));
    const facts = element('div'); renderFacts(example, facts); details.append(facts);
    const actions = element('div', 'example-actions');
    actions.append(button(example.scenario.action, () => reveal(example)), link('Change this combination ↗', `/survey-examples/?${catalog.toQuery(selection)}`));
    const slot = element('div'); slot.id = 'example-inline'; slot.hidden = true;
    section.append(context, details, element('p', 'example-note', 'This explicit demo action previews the placement. Business actions and survey responses remain simulated.'), actions, slot);
    document.querySelector('main').append(section);
    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: 'start' });
  }
})();
