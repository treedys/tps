################################################################################
#
# Treedys Camera Firmware
#
################################################################################

CAMERA_FIRMWARE_SITE = $(TOPDIR)/../camera
CAMERA_FIRMWARE_SITE_METHOD = file
CAMERA_FIRMWARE_INSTALL_TARGET = YES
CAMERA_FIRMWARE_INSTALL_STAGING = NO

CAMERA_FIRMWARE_EXTRA_DOWNLOADS =

CAMERA_FIRMWARE_KCONFIG_DEFCONFIG = scanner_camera_defconfig

CAMERA_FIRMWARE_OUTPUT_DIR = /usr/share/camera-firmware/

define CAMERA_FIRMWARE_EXTRACT_CMDS
	$(MAKE) -C $(TOPDIR) O=$(@D) BR2_EXTERNAL=$(CAMERA_FIRMWARE_SITE) $(CAMERA_FIRMWARE_KCONFIG_DEFCONFIG)
endef

define CAMERA_FIRMWARE_BUILD_CMDS
	$(MAKE) -C $(@D)
endef

define CAMERA_FIRMWARE_INSTALL_TARGET_CMDS
	$(INSTALL) -d $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR)
	$(INSTALL) -d $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR)/overlays

	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR) $(@D)/images/rpi-firmware/bootcode.bin
	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR) $(@D)/images/rpi-firmware/cmdline.txt
	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR) $(@D)/images/rpi-firmware/config.txt
	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR) $(@D)/images/rpi-firmware/fixup.dat
	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR) $(@D)/images/rpi-firmware/start.elf
	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR) $(@D)/images/*.dtb
	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR) $(@D)/images/zImage

	$(INSTALL) -D -m 0644 -t $(TARGET_DIR)$(CAMERA_FIRMWARE_OUTPUT_DIR)/overlays/ $(@D)/images/rpi-firmware/overlays/*.dtbo

	$(INSTALL) -D -m 0644 $(CAMERA_FIRMWARE_PKGDIR)/dnsmasq.conf $(TARGET_DIR)/etc/dnsmasq.conf
endef

define CAMERA_FIRMWARE_CONFIGURE_DNSMASQ
	$(SED) '/^tftp-root=/s~^.*~tftp-root=$(CAMERA_FIRMWARE_OUTPUT_DIR)~' \
		$(TARGET_DIR)/etc/dnsmasq.conf
endef
CAMERA_FIRMWARE_TARGET_FINALIZE_HOOKS += CAMERA_FIRMWARE_CONFIGURE_DNSMASQ

$(eval $(kconfig-package))
