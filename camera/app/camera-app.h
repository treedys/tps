#ifndef  CAMERA_APP_INC
#define  CAMERA_APP_INC

#include <stdint.h>

/*****************************************************************************/

struct __attribute__((__packed__)) camera_shot_configuration {
    int16_t shutterSpeed;
    int16_t iso;
    int16_t redGain;
    int16_t blueGain;
    int8_t  quality;
    int8_t  sharpness;
    int8_t  contrast;
    int8_t  brightness;
    int8_t  saturation;
    int8_t  drc;
    int8_t  whiteBalance;
    int8_t  gpio17;
    int8_t  gpio18;
    int8_t  gpio22;
    int8_t  gpio27;
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
