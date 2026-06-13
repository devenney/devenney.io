export default {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        // Hard gates: accessibility and SEO must score ≥0.9
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo':           ['error', { minScore: 0.9 }],
        // Performance is off: scores are meaningless in a CI static-server
        // context (all font subsets load eagerly, no HTTP/2, cold cache).
        'categories:performance':   'off',
        'categories:best-practices':'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
