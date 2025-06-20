#!/bin/bash

# Create GitHub repository using API
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user/repos \
  -d '{
    "name": "pong-game",
    "description": "A classic Pong game with CPU opponent",
    "private": false,
    "auto_init": false
  }' 