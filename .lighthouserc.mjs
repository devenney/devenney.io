export default {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        // Category hard gates
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo':           ['error', { minScore: 0.9 }],
        'categories:best-practices':['warn',  { minScore: 0.9 }],
        'categories:performance':   ['warn',  { minScore: 0.8 }],
        // CI-specific overrides: byte weight and network tree are unreliable
        // in a local static-server context (all font subsets loaded eagerly)
        'total-byte-weight':              ['warn', { maxNumericValue: 2000000 }],
        'network-dependency-tree-insight': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
