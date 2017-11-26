make -C buildroot/ O=../output/camera BR2_EXTERNAL=../camera/ scanner_camera_defconfig
make -C buildroot/ O=../output/controller BR2_EXTERNAL=../controller/ scanner_controller_defconfig
make -C buildroot/ O=../output/rpi-config BR2_EXTERNAL=../rpi-config/ rpi_defconfig
make -C output/camera/ menuconfig
make -C output/controller/ menuconfig
make -C output/rpi-config/ menuconfig
