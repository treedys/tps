#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>

#include <wiringPi.h>

#include "logerr.h"
#include "omx_still.h"
#include "camera-net.h"
#include "camera-app.h"

#define FILENAME "/var/www/still.jpg"

uint8_t jpeg[10000000];
size_t position = 0;

void buffering(const uint8_t * const buffer, const size_t length)
{
    digitalWrite(28, HIGH);
    digitalWrite(  0, LOW);

    if(length > sizeof(jpeg)-position)
    {
        LOG_ERROR("Buffer overflow %d %d", position, length);
        exit(1);
    }

    memcpy(&jpeg[position], buffer, length);

    position += length;
}

void write_file(void)
{
    //Open the file
    int fd = open(FILENAME, O_WRONLY | O_CREAT | O_TRUNC | O_APPEND, 0666); if(fd == -1) { LOG_ERROR("open"); exit(1); }

    //Append the buffer into the file
    if(write(fd, jpeg, position) == -1)
    {
        LOG_ERRNO("write");
        exit(1);
    }

    //Close the file
    if(close(fd)) { LOG_ERROR("close"); exit(1); }
}

void single_shoot(struct camera_shot_configuration config)
{
    digitalWrite( 17, config.gpio17 ? HIGH : LOW );
    digitalWrite( 18, config.gpio17 ? HIGH : LOW );
    digitalWrite( 22, config.gpio17 ? HIGH : LOW );
    digitalWrite( 27, config.gpio17 ? HIGH : LOW );

    omx_still_open(config);

    position = 0;
    omx_still_shoot(buffering);

    write_file();

    omx_still_close();
}

void shoot(struct camera_configuration config)
{
    LOG_ERROR("SHOOT");

    LOG_ERROR("config.shutterSpeed %d %d", config.shot[0].shutterSpeed, config.shot[1].shutterSpeed );
    LOG_ERROR("config.iso          %d %d", config.shot[0].iso,          config.shot[1].iso          );
    LOG_ERROR("config.redGain      %d %d", config.shot[0].redGain,      config.shot[1].redGain      );
    LOG_ERROR("config.blueGain     %d %d", config.shot[0].blueGain,     config.shot[1].blueGain     );
    LOG_ERROR("config.quality      %d %d", config.shot[0].quality,      config.shot[1].quality      );
    LOG_ERROR("config.sharpness    %d %d", config.shot[0].sharpness,    config.shot[1].sharpness    );
    LOG_ERROR("config.contrast     %d %d", config.shot[0].contrast,     config.shot[1].contrast     );
    LOG_ERROR("config.brightness   %d %d", config.shot[0].brightness,   config.shot[1].brightness   );
    LOG_ERROR("config.saturation   %d %d", config.shot[0].saturation,   config.shot[1].saturation   );
    LOG_ERROR("config.drc          %d %d", config.shot[0].drc,          config.shot[1].drc          );
    LOG_ERROR("config.whiteBalance %d %d", config.shot[0].whiteBalance, config.shot[1].whiteBalance );
    LOG_ERROR("config.gpio17       %d %d", config.shot[0].gpio17,       config.shot[1].gpio17       );
    LOG_ERROR("config.gpio18       %d %d", config.shot[0].gpio18,       config.shot[1].gpio18       );
    LOG_ERROR("config.gpio22       %d %d", config.shot[0].gpio22,       config.shot[1].gpio22       );
    LOG_ERROR("config.gpio27       %d %d", config.shot[0].gpio27,       config.shot[1].gpio27       );

    single_shoot(config.shot[0]);
    single_shoot(config.shot[1]);

    digitalWrite( 17, LOW);
    digitalWrite( 18, LOW);
    digitalWrite( 22, LOW);
    digitalWrite( 27, LOW);
}

void session(void)
{
    wiringPiSetup();

    pinMode( 17, OUTPUT);
    pinMode( 18, OUTPUT);
    pinMode( 22, OUTPUT);
    pinMode( 27, OUTPUT);

    digitalWrite( 17, LOW);
    digitalWrite( 18, LOW);
    digitalWrite( 22, LOW);
    digitalWrite( 27, LOW);

    net_session();
}

int main()
{
    for(;;)
        session();

    LOG_MESSAGE("ok");

    return 0;
}
