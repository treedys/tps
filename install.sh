make -C buildroot/ O=../output BR2_EXTERNAL=../camera/ treedys_camera_defconfig
make -C output/ menuconfig
