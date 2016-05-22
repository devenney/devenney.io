# devenney.io

![CodeShip Build Status Badge](https://codeship.com/projects/419d3bb0-b23a-0133-dee6-66cd7c0bebc3/status?branch=master)

The public website code for devenney.io.

Work derived from Elevation by @Pixelarity. License: pixelarity.com/license

# Site Generation

## Dependencies

* Install [Node.js](https://nodejs.org/en/)
* For development:
  * npm install --dev
* For production:
  * npm install --production

To update:

* Run `npm-check-updates -u`.
* Execute all build steps and verify the output.

## Build

The default Gulpfile task can be executed as follows:

    $ gulp
    
Otherwise, specific tasks can be called such as:

    $ gulp minify

Generated site will be placed into `./dist/`.

# Continuous Integration

Testing is achieved through [mocha](https://mochajs.org/) wrapped by [gulp-mocha](https://github.com/sindresorhus/gulp-mocha).

Continuous Integration is provided by [CodeShip](https://codeship.com/). The test pipeline is as follows:

    #SETUP
    nvm install 5.6.0
    npm install
    npm install -g gulp
    
    #TEST
    gulp test
    
    #DEPLOY (if master branch)
    gulp
    scp -rp dist $USER@$HOST:$SITEPATH
 
All pull requests undergo these tests.
