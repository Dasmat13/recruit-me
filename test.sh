#!/bin/bash
export NODE_OPTIONS="--experimental-vm-modules"
npx jest --no-cache "$@"
