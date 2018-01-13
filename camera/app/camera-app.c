#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>

#include "logerr.h"
#include "omx_still.h"

#define FILENAME "still.jpg"

uint8_t jpeg[10000000];
size_t position = 0;

void buffering(const uint8_t * const buffer, const size_t length) {

    if(length > sizeof(jpeg)-position) {
        LOG_ERROR("Buffer overflow %d %d", position, length);
        exit(1);
    }

    memcpy(&jpeg[position], buffer, length);

    position += length;
}

void write_file(void) {
    //Open the file
    int fd = open(FILENAME, O_WRONLY | O_CREAT | O_TRUNC | O_APPEND, 0666); if(fd == -1) { LOG_ERROR("open"); exit(1); }

    //Append the buffer into the file
    if(write(fd, jpeg, position) == -1) {
        LOG_ERRNO("write");
        exit(1);
    }

    //Close the file
    if(close(fd)) { LOG_ERROR("close"); exit(1); }
}

void session(void) {

    omx_still_open();

    position = 0;
    omx_still_shoot(buffering);

    omx_still_close();
}

int main() {

    session();

    write_file();

    LOG_MESSAGE("ok");

    return 0;
}
