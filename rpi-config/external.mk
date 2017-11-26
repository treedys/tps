define ENABLE_NETWORK_BOOT
	if ! grep -qE '^program_usb_boot_mode=1' "${BINARIES_DIR}/rpi-firmware/config.txt"; then \
		echo "" >> "${BINARIES_DIR}/rpi-firmware/config.txt" ;\
		echo "# Enable network boot" >> "${BINARIES_DIR}/rpi-firmware/config.txt" ;\
		echo "program_usb_boot_mode=1" >> "${BINARIES_DIR}/rpi-firmware/config.txt" ;\
	fi
endef

TARGET_FINALIZE_HOOKS += ENABLE_NETWORK_BOOT
