#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

#include <wiringPi.h>

#include "logerr.h"
#include "omx_still.h"
#include "camera-net.h"
#include "camera-app.h"

uint8_t jpeg1[10000000];
uint8_t jpeg2[10000000];

size_t position1 = 0;
size_t position2 = 0;

void buffering1(const uint8_t * const buffer, size_t length)
{
    if(length > sizeof(jpeg1)-position1)
    {
        LOG_ERROR("Buffer1 overflow %d %d", position1, length);
        length = sizeof(jpeg1-position1);
    }

    memcpy(&jpeg1[position1], buffer, length);

    position1 += length;
}

void buffering2(const uint8_t * const buffer, size_t length)
{
    if(length > sizeof(jpeg2)-position2)
    {
        LOG_ERROR("Buffer2 overflow %d %d", position2, length);
        length = sizeof(jpeg2-position2);
    }

    memcpy(&jpeg2[position2], buffer, length);

    position2 += length;
}

WARN_UNUSED enum error_code write_file(const char * const filename, const uint8_t * const buffer, const size_t length)
{
    //Open the file
    int fd = open(filename, O_WRONLY | O_CREAT | O_TRUNC | O_APPEND, 0666);
    if(fd == -1)
    {
        LOG_ERRNO("open %s", filename);
        return ERROR;
    }

    //Append the buffer into the file
    if(write(fd, buffer, length) == -1)
    {
        LOG_ERRNO("write %s %zu", filename, length);
        return ERROR;
    }

    //Close the file
    if(close(fd))
    {
        LOG_ERRNO("close %s", filename);
        return ERROR;
    }

    return OK;
}

WARN_UNUSED enum error_code single_shoot(struct camera_shot_configuration config, const buffer_output_handler handler)
{
    enum error_code result;

    if(config.open)
    {
        result = omx_still_open(config); if(result!=OK) { return result; }
    }

    digitalWrite( 17, config.gpio17 ? HIGH : LOW );
    digitalWrite( 18, config.gpio18 ? HIGH : LOW );
    digitalWrite( 22, config.gpio22 ? HIGH : LOW );
    digitalWrite( 27, config.gpio27 ? HIGH : LOW );

    result = omx_still_shoot(handler); if(result!=OK) { return result; }

    digitalWrite( 17, LOW );
    digitalWrite( 18, LOW );
    digitalWrite( 22, LOW );
    digitalWrite( 27, LOW );

    if(config.close)
    {
        result = omx_still_close(); if(result!=OK) { return result; }
    }

    return OK;
}

enum error_code shoot(struct camera_configuration config)
{
    enum error_code result;

    LOG_MESSAGE("SHOOT");

    LOG_MESSAGE("config.shutterSpeed %d %d", config.shot[0].shutterSpeed, config.shot[1].shutterSpeed );
    LOG_MESSAGE("config.iso          %d %d", config.shot[0].iso,          config.shot[1].iso          );
    LOG_MESSAGE("config.redGain      %d %d", config.shot[0].redGain,      config.shot[1].redGain      );
    LOG_MESSAGE("config.blueGain     %d %d", config.shot[0].blueGain,     config.shot[1].blueGain     );
    LOG_MESSAGE("config.quality      %d %d", config.shot[0].quality,      config.shot[1].quality      );
    LOG_MESSAGE("config.sharpness    %d %d", config.shot[0].sharpness,    config.shot[1].sharpness    );
    LOG_MESSAGE("config.contrast     %d %d", config.shot[0].contrast,     config.shot[1].contrast     );
    LOG_MESSAGE("config.brightness   %d %d", config.shot[0].brightness,   config.shot[1].brightness   );
    LOG_MESSAGE("config.saturation   %d %d", config.shot[0].saturation,   config.shot[1].saturation   );
    LOG_MESSAGE("config.drc          %d %d", config.shot[0].drc,          config.shot[1].drc          );
    LOG_MESSAGE("config.whiteBalance %d %d", config.shot[0].whiteBalance, config.shot[1].whiteBalance );
    LOG_MESSAGE("config.gpio17       %d %d", config.shot[0].gpio17,       config.shot[1].gpio17       );
    LOG_MESSAGE("config.gpio18       %d %d", config.shot[0].gpio18,       config.shot[1].gpio18       );
    LOG_MESSAGE("config.gpio22       %d %d", config.shot[0].gpio22,       config.shot[1].gpio22       );
    LOG_MESSAGE("config.gpio27       %d %d", config.shot[0].gpio27,       config.shot[1].gpio27       );


    position1 = 0;
    position2 = 0;

    result = single_shoot(config.shot[0], buffering1); if(result!=OK) { return result; }
    result = single_shoot(config.shot[1], buffering2); if(result!=OK) { return result; }

    digitalWrite( 17, LOW);
    digitalWrite( 18, LOW);
    digitalWrite( 22, LOW);
    digitalWrite( 27, LOW);

    char filename[100];

    snprintf(filename, sizeof(filename), "/var/www/%d-1.jpg", (int)config.id);

    result = write_file(filename, jpeg1, position1); if(result!=OK) { return result; }

    LOG_MESSAGE("Written %s", filename);

    snprintf(filename, sizeof(filename), "/var/www/%d-2.jpg", (int)config.id);

    result = write_file(filename, jpeg2, position2); if(result!=OK) { return result; }

    LOG_MESSAGE("Written %s", filename);

    return OK;
}

enum error_code erase(const int32_t id)
{
    char filename[100];

    snprintf(filename, sizeof(filename), "/var/www/%d-1.jpg", (int)id);

    if(unlink(filename)) {
        LOG_ERRNO("Unlink %s", filename);
        return ERROR;
    }

    LOG_MESSAGE("Removed %s", filename);

    snprintf(filename, sizeof(filename), "/var/www/%d-2.jpg", (int)id);

    if(unlink(filename)) {
        LOG_ERRNO("Unlink %s", filename);
        return ERROR;
    }

    LOG_MESSAGE("Removed %s", filename);

    return OK;
}

WARN_UNUSED enum error_code session(void)
{
    wiringPiSetupGpio();

    pinMode( 17, OUTPUT);
    pinMode( 18, OUTPUT);
    pinMode( 22, OUTPUT);
    pinMode( 27, OUTPUT);

    digitalWrite( 17, LOW);
    digitalWrite( 18, LOW);
    digitalWrite( 22, LOW);
    digitalWrite( 27, LOW);

    return net_session();
}

int main()
{
    for(;;)
        if(session()!=OK)
            exit(1);

    return 0;
}
