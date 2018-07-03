#!/bin/bash

set -u
set -e

# add git sha1
# TODO: Imrpove the firmware version, see:
#       https://stackoverflow.com/a/44038486/168872
git -C ${TARGET_DIR} rev-parse HEAD > ${TARGET_DIR}/etc/camera-version
