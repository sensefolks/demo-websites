/* Public, fictional scenario descriptions. These are not API provisioning payloads. */
(() => {
  'use strict';
  const types = ['FastPoll', 'Reaction', 'OpenFeedback', 'UserChoice', 'FeaturePriority', 'PricePoint'];
  const dataModes = { none: 'No extra data', respondent: 'Respondent fields', session: 'Session data', both: 'Respondent + session data' };
  const respondentTypes = ['text', 'email', 'number', 'dropdown', 'radio', 'checkbox'];
  const option = (value, label) => ({ value, label });
  const axis = (key, label, options) => ({ key, label, options: options.map((item) => Array.isArray(item) ? option(...item) : option(String(item), String(item))) });
  const axes = {
    FastPoll: [
      axis('choice', 'Choice selection', [['single', 'Single choice'], ['multi', 'Multiple choices']]),
      axis('followup', 'Follow-up question', [['off', 'No follow-up'], ['selected', 'After selected answers'], ['all', 'After any configured answer']]),
      axis('answer', 'Example answer path', [['configured', 'First configured choice'], ['alternative', 'Another configured choice'], ['other', 'Other, with written detail'], ['mixed', 'Configured choice + Other · multi-choice']]),
    ],
    Reaction: [
      axis('reaction', 'Reaction set', [['expressive', 'Expressive faces'], ['thumbsUpDown', 'Thumbs up / down'], ['favourite', 'Favourite heart']]),
      axis('reactionAction', 'Illustrated response action', [['select', 'Select a reaction'], ['change', 'Change a reaction'], ['remove', 'Remove a reaction']]),
    ],
    OpenFeedback: [axis('feedback', 'Question context', [['suggestion', 'An idea or suggestion'], ['problem', 'A problem to understand'], ['leaving', 'A reason for leaving']])],
    UserChoice: [
      axis('mode', 'Research mode', [['lite', 'Lite · 3–4 attributes'], ['full', 'Full · 4–7 attributes']]),
      axis('noneOption', 'Choice task alternatives', [['off', 'Choose one alternative'], ['on', 'Include “None of these”']]),
      axis('offering', 'Research context', [['product', 'Product'], ['service', 'Service']]),
    ],
    FeaturePriority: [
      axis('branch', 'Illustrated answer-dependent path', [['early', 'Kano → finish · 0–2 survivors'], ['pairwise', 'Kano → pairwise · 3 survivors'], ['full', 'Kano → MaxDiff → pairwise · 4+ survivors']]),
      axis('features', 'Configured features', [4, 5, 6, 7]),
      axis('trial', 'Items per MaxDiff trial', [3, 4, 5]),
      axis('shortlist', 'MaxDiff shortlist', [2, 3, 4, 5, 6]),
      axis('offering', 'Research context', [['product', 'Product'], ['service', 'Service']]),
    ],
    PricePoint: [
      axis('billing', 'Pricing model', [['one-time', 'One-time purchase'], ['monthly', 'Monthly subscription'], ['quarterly', 'Quarterly subscription'], ['annual', 'Annual subscription']]),
      axis('cohort', 'Illustrated study assignment', [['discovery', 'Discovery · VW + NMS'], ['calibration-vw', 'Calibration · VW + NMS'], ['calibration-gg', 'Calibration · one-price GG'], ['validation-vw', 'Validation · VW + NMS'], ['validation-gg', 'Validation · one-price GG'], ['legacy', 'Legacy automatic currency · VW only']]),
      axis('currency', 'Fixed currency example', ['USD', 'EUR', 'INR']),
      axis('costs', 'Cost analysis context', [['off', 'Without cost assumptions'], ['on', 'With fictional cost assumptions']]),
    ],
  };

  const common = {
    FastPoll: { note: 'Single and multiple choice use the same conditional free-text follow-up. When triggered, that follow-up is required. Other text is required when Other is selected. Other is available by default; it is not a separate dashboard toggle.' },
    Reaction: { note: 'Reaction supports session data, but no respondent fields or configurable bot challenge. People can change or remove their reaction; the selected state confirms the action. Favourite Gallery is a planned product capability, not implemented in the current embed, so it is recorded below as pending.' },
    OpenFeedback: { note: 'OpenFeedback has one open-text response mode (up to 10,000 characters). The three question contexts are use cases, not different input modes.' },
    UserChoice: { note: 'Lite and Full both ask people to choose one concept per task. None of these is optional in a task; neither mode is a multiple-choice poll. Attribute counts follow the current Lite/Full limits.' },
    FeaturePriority: { note: 'Every response starts with Kano. Its answers determine whether the respondent finishes, moves to pairwise, or proceeds through MaxDiff and pairwise. These are illustrated outcomes, not independent method switches. MaxDiff trial size is capped to available items by the runtime.' },
    PricePoint: { note: 'Adaptive study phase and cohort are assigned by the service. A GG respondent sees one assigned price without earlier VW/NMS questions. These controls illustrate valid assignments; they do not force a live cohort. Automatic currency is legacy VW-only. Currency and billing cycle are fixed at survey creation.' },
  };

  const sites = {
    orbitdesk: {
      name: 'OrbitDesk', segment: 'Pro workspace', number: 4, returning: true,
      fields: ['Fictional team name', 'Example contact', 'Team size', 'Your role', 'Work style', 'Tools used'],
      scenarios: {
        FastPoll: { path: '/account/', title: 'A better goodbye', question: 'What would make you keep your workspace?', trigger: 'Begin subscription cancellation', action: 'Review cancellation', placement: 'inline', choices: ['Pricing', 'Missing features', 'Team changes'], followup: 'What could we improve about this?', context: 'Feedback sits above cancellation confirmation. Leaving remains possible without answering.' },
        Reaction: { path: '/help/', title: 'Help that earns its place', question: 'Did this answer get you unstuck?', trigger: 'Expand a help answer', action: 'Read the answer', placement: 'inline', items: ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied'], context: 'Ask for a quick response while the help article is still fresh.' },
        OpenFeedback: { path: '/workspace/', title: 'An idea in the moment', question: 'What slowed down your work today?', trigger: 'Open the feedback action from the workspace', action: 'Share a workspace idea', placement: 'drawer', context: 'A side panel lets people describe friction without losing their place on the board.' },
        UserChoice: { path: '/pricing/', title: 'Build the right plan', question: 'Which workspace plan would your team choose?', trigger: 'Compare team plans', action: 'Compare plan concepts', placement: 'dialog', attributes: ['Team size', 'Storage', 'Monthly price', 'Automation', 'Support', 'Reporting', 'Integrations'], context: 'Compare believable bundles of seats, storage, automation, and support.' },
        FeaturePriority: { path: '/workspace/', title: 'The next thing worth building', question: 'What should we build next?', trigger: 'Complete a task', action: 'Mark the sample task done', placement: 'drawer', items: ['Focus mode', 'Project templates', 'Recurring tasks', 'Time tracking', 'Client portals', 'Offline mode', 'Workload planning'], context: 'Invite a roadmap discussion after a small product success.' },
        PricePoint: { path: '/pricing/', title: 'A price that fits the work', question: 'What is OrbitDesk Pro worth to your team?', trigger: 'Explore Pro pricing', action: 'Help price Pro', placement: 'dialog', products: ['Workspace setup pack', 'OrbitDesk Pro monthly', 'OrbitDesk Pro quarterly', 'OrbitDesk Pro annual'], context: 'Show the full plan benefits beside the pricing study.' },
      },
    },
    'moss-and-mug': {
      name: 'Moss & Mug', segment: 'Morning essentials', number: 2, returning: false,
      fields: ['Fictional coffee club', 'Example contact', 'Cups per day', 'Brew method', 'Roast preference', 'Coffee equipment'],
      scenarios: {
        FastPoll: { path: '/cart/', title: 'A little nudge, thoughtfully timed', question: 'What is holding you back?', trigger: '20 seconds of visible-page cart inactivity', action: 'Try the cart invitation', placement: 'inline', choices: ['Delivery', 'Price', 'Still comparing'], followup: 'What would make this choice easier?', context: 'Offer help with hesitation before checkout, with an easy dismissal.' },
        Reaction: { path: '/order/', title: 'How did your morning begin?', question: 'How was your checkout experience?', trigger: 'Finish a fictional purchase', action: 'Show a sample confirmation', placement: 'inline', context: 'A quick reaction on the confirmation page leaves checkout uninterrupted.' },
        OpenFeedback: { path: '/products/starter-kit/', title: 'Room for a better ritual', question: 'What is missing from your morning kit?', trigger: 'Open product feedback below the details', action: 'Suggest a kit improvement', placement: 'drawer', context: 'Make space for open-ended suggestions after a shopper reads the product details.' },
        UserChoice: { path: '/products/starter-kit/', title: 'The next morning kit', question: 'Which coffee bundle would you choose?', trigger: 'Help shape a starter bundle', action: 'Compare the bundles', placement: 'dialog', attributes: ['Brewer', 'Coffee quantity', 'Price', 'Mug finish', 'Grind', 'Delivery', 'Origin'], context: 'Compare product bundles rather than asking shoppers to rate features in isolation.' },
        FeaturePriority: { path: '/products/starter-kit/', title: 'Let the next collection begin here', question: 'Which additions belong in our next collection?', trigger: 'Open the next-collection preview', action: 'Shape the next collection', placement: 'drawer', items: ['Travel brewer', 'Reusable filters', 'Coffee refills', 'Insulated mug', 'Grind selection', 'Gift packaging', 'Brew workshops'], context: 'Prioritize both product improvements and services around a coffee ritual.' },
        PricePoint: { path: '/products/starter-kit/', title: 'Find the right place on the shelf', question: 'What would you expect to pay for this coffee offering?', trigger: 'Review a kit or coffee subscription', action: 'Explore a fair price', placement: 'dialog', products: ['The morning kit', 'Monthly coffee club', 'Quarterly coffee box', 'Annual coffee membership'], context: 'Research a one-time kit and recurring coffee deliveries with explicit billing context.' },
      },
    },
    fieldnotes: {
      name: 'Fieldnotes', segment: 'Weekend readers', number: 3, returning: true,
      fields: ['Fictional reader name', 'Example contact', 'Trips per year', 'Favourite landscape', 'Reading frequency', 'Outdoor interests'],
      scenarios: {
        FastPoll: { path: '/membership/', title: 'A membership shaped by readers', question: 'Which member benefits matter most?', trigger: 'Read the membership benefits', action: 'Explore member preferences', placement: 'inline', choices: ['Seasonal guides', 'Early stories', 'Community walks'], followup: 'What would make that benefit special?', context: 'Ask a focused question while readers consider the value of membership.' },
        Reaction: { path: '/articles/weekend-guide/', title: 'A small response to a good read', question: 'Was this guide worth your time?', trigger: 'Read 70% of the weekend guide', action: 'Preview the end-of-read prompt', placement: 'inline', context: 'Reveal feedback after meaningful reading rather than on arrival.' },
        OpenFeedback: { path: '/search/', title: 'A dead end can start a story', question: 'What were you hoping to find?', trigger: 'Search returns no matching stories', action: 'Try a missing topic', placement: 'inline', context: 'An empty search result becomes a place to suggest the next article.' },
        UserChoice: { path: '/membership/', title: 'Choose your kind of journal', question: 'Which membership bundle would you choose?', trigger: 'Compare reader membership concepts', action: 'Compare memberships', placement: 'dialog', attributes: ['Story access', 'Guide frequency', 'Price', 'Print editions', 'Community events', 'Audio stories', 'Guest passes'], context: 'Learn which combinations of editorial benefits readers actually prefer.' },
        FeaturePriority: { path: '/articles/weekend-guide/', title: 'Where should the journal go next?', question: 'What should we add to your reading experience?', trigger: 'Open the next-issue planning invitation', action: 'Shape the next issue', placement: 'drawer', items: ['Offline guides', 'Audio stories', 'Trail maps', 'Seasonal itineraries', 'Reading lists', 'Local walks', 'Print editions'], context: 'Use recent reading experience to prioritize new editorial features.' },
        PricePoint: { path: '/membership/', title: 'Put a value on a little outside', question: 'What is this Fieldnotes offering worth to you?', trigger: 'Explore a guide or membership price', action: 'Help price the journal', placement: 'dialog', products: ['Weekend field guide', 'Monthly membership', 'Quarterly journal', 'Annual membership'], context: 'Compare the value of a standalone guide with recurring membership.' },
      },
    },
  };

  function normalize(input = {}) {
    const type = types.includes(input.type) ? input.type : 'FastPoll';
    const site = Object.hasOwn(sites, input.site) ? input.site : 'orbitdesk';
    const value = { site, type };
    for (const definition of axes[type]) {
      value[definition.key] = definition.options.some((item) => item.value === input[definition.key]) ? input[definition.key] : definition.options[0].value;
    }
    value.data = Object.hasOwn(dataModes, input.data) ? input.data : 'none';
    if (type === 'Reaction' && ['respondent', 'both'].includes(value.data)) value.data = 'session';
    value.placement = ['inline', 'dialog', 'drawer'].includes(input.placement) ? input.placement : sites[site].scenarios[type].placement;
    value.bot = type !== 'Reaction' && input.bot === 'on' ? 'on' : 'off';
    value.schema = input.schema === 'unconfigured' ? 'unconfigured' : 'declared';
    for (const field of respondentTypes) value[`field_${field}`] = ['off', 'optional', 'required'].includes(input[`field_${field}`]) ? input[`field_${field}`] : field === 'dropdown' ? 'optional' : 'off';
    for (const field of ['string', 'number', 'boolean']) value[`session_${field}`] = input[`session_${field}`] === 'off' ? 'off' : 'on';
    if (type === 'FastPoll') {
      if (value.choice === 'single' && value.answer === 'mixed') value.answer = 'configured';
      for (let index = 0; index < 3; index++) value[`trigger_${index}`] = input[`trigger_${index}`] === 'on' || (input[`trigger_${index}`] === undefined && index === 0) ? 'on' : 'off';
      if (![0, 1, 2].some((index) => value[`trigger_${index}`] === 'on')) value.trigger_0 = 'on';
    }
    if (type === 'Reaction' && value.reaction === 'favourite' && value.reactionAction === 'change') value.reactionAction = 'select';
    if (['respondent', 'both'].includes(value.data) && respondentTypes.every((field) => value[`field_${field}`] === 'off')) value.field_dropdown = 'optional';
    if (['session', 'both'].includes(value.data) && ['string', 'number', 'boolean'].every((field) => value[`session_${field}`] === 'off')) value.session_string = 'on';
    if (type === 'FeaturePriority') value.shortlist = String(Math.min(Number(value.shortlist), Number(value.features) - 1));
    if (type === 'UserChoice') {
      const values = value.mode === 'lite' ? ['3', '4'] : ['4', '5', '6', '7'];
      value.attributes = values.includes(input.attributes) ? input.attributes : values[0];
    }
    return value;
  }

  function describe(input) {
    const selection = normalize(input);
    const site = sites[selection.site];
    const scenario = site.scenarios[selection.type];
    const facts = [];
    const add = (label, value) => facts.push({ label, value });
    let question = scenario.question;
    let items = [];
    if (selection.type === 'FastPoll') {
      const triggers = selection.followup === 'all' ? scenario.choices : selection.followup === 'selected' ? scenario.choices.filter((_choice, index) => selection[`trigger_${index}`] === 'on') : [];
      const selected = selection.answer === 'alternative' ? [scenario.choices[1]] : selection.answer === 'configured' || selection.answer === 'mixed' ? [scenario.choices[0]] : [];
      const follows = selected.some((choice) => triggers.includes(choice));
      add('Selection', selection.choice === 'single' ? 'One answer' : 'One or more answers');
      add('Follow-up', selection.followup === 'off' ? 'None' : `“${scenario.followup}” after ${triggers.join(', ')}`);
      add('Example answer', [...selected, ...(['other', 'mixed'].includes(selection.answer) ? ['Other + required written detail'] : [])].join(' + '));
      add('Conditional path', follows ? 'Follow-up is shown and requires a written answer.' : 'Follow-up is skipped for this example answer.');
      items = [...scenario.choices, 'Other (written detail)'];
    }
    if (selection.type === 'Reaction') {
      add('Reaction set', axes.Reaction[0].options.find((item) => item.value === selection.reaction).label);
      items = selection.reaction === 'expressive' ? ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied'] : selection.reaction === 'thumbsUpDown' ? ['Thumbs up', 'Thumbs down'] : ['Favourite this item'];
      add('Response actions', 'Select, change, or remove; no completion page');
      add('Illustrated action', selection.reactionAction === 'select' ? 'Set a reaction' : selection.reactionAction === 'remove' ? 'Remove the selected reaction' : 'Switch from one reaction to another');
    }
    if (selection.type === 'OpenFeedback') {
      question = selection.feedback === 'suggestion' ? scenario.question : selection.feedback === 'problem' ? `What could ${site.name} make easier?` : `What would make you return to ${site.name}?`;
      add('Answer', 'Open text · up to 10,000 characters');
      add('Context', axes.OpenFeedback[0].options.find((item) => item.value === selection.feedback).label);
    }
    if (selection.type === 'UserChoice') {
      add('Mode', `${selection.mode === 'lite' ? 'Lite' : 'Full'} · ${selection.attributes} attributes`);
      add('Task', selection.noneOption === 'on' ? 'Choose one concept, or None of these' : 'Choose one concept');
      add('Context', selection.offering);
      items = scenario.attributes.slice(0, Number(selection.attributes));
    }
    if (selection.type === 'FeaturePriority') {
      add('Illustrated path', axes.FeaturePriority[0].options.find((item) => item.value === selection.branch).label);
      add('MaxDiff configuration', `${selection.trial} items per trial · top ${selection.shortlist} continue when MaxDiff runs`);
      add('Context', selection.offering);
      items = scenario.items.slice(0, Number(selection.features));
    }
    if (selection.type === 'PricePoint') {
      const billingIndex = ['one-time', 'monthly', 'quarterly', 'annual'].indexOf(selection.billing);
      add('Offering', scenario.products[billingIndex]);
      add('Billing', axes.PricePoint[0].options.find((item) => item.value === selection.billing).label);
      add('Currency', selection.cohort === 'legacy' ? 'Automatic currency · legacy only' : selection.currency);
      add('Illustrated assignment', axes.PricePoint[1].options.find((item) => item.value === selection.cohort).label);
      add('Questions', selection.cohort.includes('gg') ? 'Purchase intent at one assigned price' : selection.cohort === 'legacy' ? 'Four Van Westendorp price questions' : 'Four Van Westendorp questions + two NMS intent questions');
      add('Cost assumptions', selection.costs === 'on' ? 'Fictional annual inputs: 120 per customer; 12,000 fixed expenses; 500 customers; 20% target margin. Used for analysis, not respondent questions.' : 'No cost assumptions');
    }
    const respondent = ['respondent', 'both'].includes(selection.data) ? respondentTypes.flatMap((type, index) => selection[`field_${type}`] === 'off' ? [] : [{ type, label: site.fields[index], key: `demo_${type}`, required: selection[`field_${type}`] === 'required', sample: type === 'email' ? 'reader@example.com' : type === 'number' ? '3' : type === 'checkbox' ? 'Option A, Option B' : type === 'text' ? 'Sample reader' : 'Option A', options: ['dropdown', 'radio', 'checkbox'].includes(type) ? ['Option A', 'Option B', 'Option C'] : [] }]) : [];
    const session = {};
    if (['session', 'both'].includes(selection.data)) {
      if (selection.session_string === 'on') session.demo_segment = site.segment;
      if (selection.session_number === 'on') session.demo_item_count = site.number;
      if (selection.session_boolean === 'on') session.demo_returning = site.returning;
    }
    add('Extra data', dataModes[selection.data]);
    add('Bot protection', selection.bot === 'on' ? 'Configured hCaptcha · placeholder only; no challenge loaded' : 'No configured challenge');
    return { selection, scenario, site, question, items, facts, respondent, session, note: common[selection.type].note };
  }

  function toQuery(input) {
    const selection = normalize(input);
    const query = new URLSearchParams(selection);
    query.delete('site');
    return query.toString();
  }
  globalThis.SurveyCatalog = Object.freeze({ types, axes, dataModes, respondentTypes, sites, normalize, describe, toQuery });
})();
