#!/bin/bash

set -u
set -e

# add git sha1
# TODO: Imrpove the firmware version, see:
#       https://stackoverflow.com/a/44038486/168872
git -C ${TARGET_DIR} ls-tree --full-tree HEAD camera   | awk '{print $3}' > ${TARGET_DIR}/etc/camera-version
git -C ${TARGET_DIR} ls-tree --full-tree HEAD buildroot| awk '{print $3}' > ${TARGET_DIR}/etc/buildroot-version
