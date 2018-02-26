make -C buildroot/ O=../output/camera BR2_EXTERNAL=../camera/ scanner_camera_defconfig
make -C buildroot/ O=../output/x86_controller BR2_EXTERNAL=../controller/ x86_controller_defconfig
make -C buildroot/ O=../output/espresso_controller BR2_EXTERNAL=../controller/ espresso_controller_defconfig
make -C buildroot/ O=../output/rpi-config BR2_EXTERNAL=../rpi-config/ rpi_defconfig
make -C output/camera/ menuconfig
make -C output/x86_controller/ menuconfig
make -C output/espresso_controller/ menuconfig
make -C output/rpi-config/ menuconfig
