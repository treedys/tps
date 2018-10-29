#ifndef  CAMERA_APP_INC
#define  CAMERA_APP_INC

#include <stdint.h>

/*****************************************************************************/

struct __attribute__((__packed__)) camera_shot_configuration {
    int32_t shutterSpeed;
    int16_t iso;
    int16_t redGain;
    int16_t blueGain;
    int16_t rotation;
    int16_t gpio_delay_17;
    int16_t gpio_delay_18;
    int16_t gpio_delay_22;
    int16_t gpio_delay_27;
    int8_t  open;
    int8_t  close;
    int8_t  quality;
    int8_t  sharpness;
    int8_t  contrast;
    int8_t  brightness;
    int8_t  saturation;
    int8_t  drc;
    int8_t  whiteBalance;
};

/*****************************************************************************/

struct __attribute__((__packed__)) camera_configuration {
    int32_t id;
    struct camera_shot_configuration shot[2];
};

/*****************************************************************************/

WARN_UNUSED enum error_code shoot(struct camera_configuration camera_configuration);
WARN_UNUSED enum error_code erase(const int32_t id);

/*****************************************************************************/

#endif
