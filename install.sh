make -C buildroot/ O=../output/camera BR2_EXTERNAL=../camera/ scanner_camera_defconfig
make -C buildroot/ O=../output/controller BR2_EXTERNAL=../controller/ scanner_controller_defconfig
make -C output/camera/ menuconfig
make -C output/controller/ menuconfig
