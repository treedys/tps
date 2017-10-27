################################################################################
#
# libbpg
#
################################################################################

LIBBPG_VERSION = 0.9.7
LIBBPG_SOURCE = libbpg-$(LIBBPG_VERSION).tar.gz
LIBBPG_SITE = https://bellard.org/bpg
LIBBPG_LICENSE = BSD, LGPL-2.1, GPL-2.0
LIBBPG_LICENSE_FILES = README#Licensing
LIBBPG_INSTALL_TARGET = YES
LIBBPG_INSTALL_STAGING = NO
LIBBPG_DEPENDENCIES = libpng jpeg

LIBBPG_CMAKE = $(BR2_CMAKE)
LIBBPG_CMAKE_OPTS = -DCMAKE_TOOLCHAIN_FILE="$(HOST_DIR)/share/buildroot/toolchainfile.cmake"

LIBBPG_CFLAGS = $(TARGET_CFLAGS) -fsigned-char
LIBBPG_MAKE_ENV = $(TARGET_MAKE_ENV) CROSS_PREFIX="$(TARGET_CROSS)" HOST_CMAKE="$(LIBBPG_CMAKE)" TARGET_CMAKE_OPTS="$(LIBBPG_CMAKE_OPTS)"

ifeq ($(BR2_PACKAGE_LIBBPG_EMMC),y)
    LIBBPG_MAKE_ENV += USE_EMMC=y
endif

ifeq ($(BR2_PACKAGE_LIBBPG_X265),y)
	LIBBPG_MAKE_ENV += USE_X265=y
endif

ifeq ($(BR2_PACKAGE_LIBBPG_JCTVC),y)
	LIBBPG_MAKE_ENV += USE_JCTVC=y
endif

ifeq ($(BR2_PACKAGE_LIBBPG_BPGVIEW),y)
	LIBBPG_MAKE_ENV += USE_BPGVIEW=y
	LIBBPG_DEPENDENCIES += sdl sdl_image
define LIBBPG_INSTALL_TARGET_BPGVIEW
	$(INSTALL) -D -m 0755 $(@D)/bpgview $(TARGET_DIR)/bin/
endef
endif

define LIBBPG_BUILD_CMDS
	$(LIBBPG_MAKE_ENV) $(MAKE) -C $(@D) all \
		TARGET_CFLAGS="$(LIBBPG_CFLAGS)" \
		TARGET_LDFLAGS="$(TARGET_LDFLAGS)"
endef

define LIBBPG_INSTALL_TARGET_CMDS
	$(INSTALL) -D -m 0755 $(@D)/bpgenc $(TARGET_DIR)/bin/
	$(INSTALL) -D -m 0755 $(@D)/bpgdec $(TARGET_DIR)/bin/
	$(LIBBPG_INSTALL_TARGET_BPGVIEW)
endef

$(eval $(generic-package))
