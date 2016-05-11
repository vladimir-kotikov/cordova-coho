/*
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

var optimist = require('optimist');
var apputil = require('./apputil');
var flagutil = require('./flagutil');
var repoutil = require('./repoutil');
var executil = require('./executil');
var print = apputil.print;

function *publishTag(options) {
    var opt = flagutil.registerHelpFlag(optimist);

    //argv was passed through another function, set defaults to appease demand.
    if(options) {
        opt = opt
            .options('tag', {
                default:options.tag
            })
            .options('r',  {
                default:options.r
            })
            .options('pretend', {
                default:options.pretend
            })
    }

    argv = opt
        .usage('Publishes current version of a repo to a specified npm tag. \n' +
               'Usage: $0 npm-publish --tag rc -r cli -r lib')
        .options('tag', {
            desc: 'Which npm tag to publish to',
            demand: true
        })
        .options('r', {
            alias: 'repos',
            desc: 'Which repo(s) to publish',
            demand:true
        })
        .options('pretend', {
            desc: 'Don\'t actually run commands, just print what would be run.',
            type:'boolean'
        })
        .argv;

    if(argv.h) {
        optimist.showHelp();
        process.exit(1);
    }

    var repos = flagutil.computeReposFromFlag(argv.r);

    //npm publish --tag argv.tag
    yield repoutil.forEachRepo(repos, function*(repo) {
        yield executil.execOrPretend(executil.ARGS('npm publish --tag ' + argv.tag), argv.pretend);
    });
}

module.exports.publishTag = publishTag;

//TODO: Does npm tag cordova-js*.tgz latest
exports.setLatest = function*(argv) {


}

//Gets last nightly tag and unpublishes it
function *unpublish(options) {
    var opt = flagutil.registerHelpFlag(optimist);

    if(options) {
        opt = opt
            .options('pretend', {
                default:options.pretend
            })
            .options('r', {
                default:options.r
            })
            .options('version', {
                default:options.version
            })
    }

    argv = opt
        .usage("Unpublishes the nightly version for the cli & lib from npm \n" +
                "Usage: $0 npm-unpublish-nightly")
        .options("pretend", {
            desc: "Don't actually run commands, just print what would be run",
            type: "boolean"
        })
        .options('r', {
            desc: "Which repo(s) to publish",
            demand: true
        })
        .options('version', {
            desc: "Which version to unpublish",
            demand: true
        })
        .argv;

    if(argv.h) {
        optimist.showHelp();
        process.exit(1);
    }

    var repos = flagutil.computeReposFromFlag(argv.r);

    if (typeof argv.version !== 'object') {
        // CLI use case: coho npm-unpublish-nightly -r cli -r lib --version "{ ""cli"": ""6.2.0-nightly.2016.5.11+123345"", ""lib"": ""6.2.0-nightly.2016.5.11+234456"" }" --pretend
        argv.version = JSON.parse(argv.version);
    }

    yield repoutil.forEachRepo(repos, function*(repo) {
        yield executil.execOrPretend(executil.ARGS('npm unpublish '+ repo.id + '@' + argv.version[repo.id]), argv.pretend);
    })
}

module.exports.unpublish = unpublish;
