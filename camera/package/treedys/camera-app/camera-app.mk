################################################################################
#
# Treedys camera app
#
################################################################################

CAMERA_APP_SITE = $(BR2_EXTERNAL_TREEDYS_CAMERA_PATH)/app
CAMERA_APP_SITE_METHOD = local

CAMERA_APP_INSTALL_TARGET = YES
CAMERA_APP_INSTALL_STAGING = NO
CAMERA_APP_DEPENDENCIES = rpi-userland

define CAMERA_APP_BUILD_CMDS
	$(TARGET_CONFIGURE_OPTS) $(MAKE) -C $(@D) all
endef

define CAMERA_APP_INSTALL_TARGET_CMDS
	$(INSTALL) -D -m 0755 -t $(TARGET_DIR)/bin/ $(@D)/camera-app
	grep -qF "::respawn:/bin/camera-app" $(TARGET_DIR)/etc/inittab || echo "::respawn:/bin/camera-app" >> $(TARGET_DIR)/etc/inittab
endef

$(eval $(generic-package))
