# devenney.io

The public website code for https://devenney.io.

## Setup

This project requires Node. It is recommended that you install the latest LTS release. Beyond this, the project is self-contained.

```bash
# Install packages
npm install

# Build distribution
npm run build
```

## Local Development

To serve the code locally, the project uses `webpack-dev-server`. A script is provided for convenience:

```bash
npm run local
```

The hot reloaded code should then be available at http://localhost:8000.