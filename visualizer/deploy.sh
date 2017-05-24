#!/bin/bash
git add .
git commit -am "publishing"
git push
git subtree push --prefix visualizer origin gh-pages
