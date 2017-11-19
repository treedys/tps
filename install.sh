make -C buildroot/ O=../output/camera BR2_EXTERNAL=../camera/ scanner_camera_defconfig
make -C output/camera/ menuconfig
