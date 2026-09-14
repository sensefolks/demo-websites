/* Native page invitations. Used only for old-link forwarding and deployment checks. */
(() => {
  const sites = {
    orbitdesk: {
      FastPoll: { path: '/account/', anchor: 'cancellation-section', key: 'orbitdesk-cancellation-reason' },
      Reaction: { path: '/help/', anchor: 'help-start', key: 'orbitdesk-help-start-helpfulness' },
      OpenFeedback: { path: '/workspace/', anchor: 'workspace-feedback', key: 'orbitdesk-workspace-friction' },
      UserChoice: { path: '/pricing/', anchor: 'team-plan-research', key: 'orbitdesk-team-plan-tradeoffs' },
      FeaturePriority: { path: '/workspace/', anchor: 'workspace-roadmap', key: 'orbitdesk-workspace-roadmap' },
      PricePoint: { path: '/pricing/', anchor: 'pro-pricing-feedback', key: 'orbitdesk-pro-pricing' },
    },
    'moss-and-mug': {
      FastPoll: { path: '/cart/', anchor: 'cart-title', key: 'moss-cart-hesitation' },
      Reaction: { path: '/order/', anchor: 'checkout-reaction', key: 'moss-checkout-reaction' },
      OpenFeedback: { path: '/products/starter-kit/', anchor: 'kit-suggestions', key: 'moss-kit-suggestions' },
      UserChoice: { path: '/products/starter-kit/', anchor: 'bundle-lab', key: 'moss-bundle-choice' },
      FeaturePriority: { path: '/', anchor: 'next-collection', key: 'moss-next-collection' },
      PricePoint: { path: '/', anchor: 'coffee-club', key: 'moss-coffee-club-price' },
    },
    fieldnotes: {
      FastPoll: { path: '/membership/', anchor: 'membership-poll', key: 'membership-poll' },
      Reaction: { path: '/articles/weekend-guide/', anchor: 'reader-feedback', key: 'article-reaction' },
      OpenFeedback: { path: '/search/', query: 'q=camping', anchor: 'empty-state', key: 'search-feedback' },
      UserChoice: { path: '/membership/', anchor: 'reader-package-invitation', key: 'reader-packages' },
      FeaturePriority: { path: '/newsletter/', anchor: 'newsletter-priorities-invitation', key: 'newsletter-priorities' },
      PricePoint: { path: '/membership/', anchor: 'membership-value-invitation', key: 'membership-value' },
    },
  };
  for (const placements of Object.values(sites)) {
    Object.values(placements).forEach(Object.freeze);
    Object.freeze(placements);
  }
  globalThis.SurveyPlacements = Object.freeze(sites);
})();
