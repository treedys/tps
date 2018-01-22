#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <string.h>

#include <uv.h>

#include <wiringPi.h>

#include "logerr.h"
#include "omx_still.h"

#define FILENAME "still.jpg"

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

void alloc_cb(uv_handle_t *handle, size_t suggested_size, uv_buf_t *buf)
{
        *buf = uv_buf_init((char*) malloc(suggested_size), suggested_size);
}

void svr_recv_cb(uv_udp_t* handle,
        ssize_t nread,
        const struct uv_buf_t *buf,
        const struct sockaddr* addr,
        unsigned flags)
{
    if(!addr)
        return;

    digitalWrite( 29, HIGH);
    digitalWrite(  0, HIGH);

    position = 0;
    omx_still_shoot(buffering);

    digitalWrite( 29, LOW);
    digitalWrite( 28, LOW);

    write_file();
}

void session(void)
{
    wiringPiSetup();

    pinMode( 27, OUTPUT);
    pinMode( 28, OUTPUT);
    pinMode( 29, OUTPUT);
    pinMode(  0, OUTPUT);

    digitalWrite( 27, HIGH);
    digitalWrite( 28, LOW);
    digitalWrite( 29, LOW);
    digitalWrite(  0, LOW);

    omx_still_open();

    uv_loop_t *loop = uv_default_loop();

    uv_udp_t udp_server;

    uv_udp_init(loop, &udp_server);

    struct sockaddr_in recv_addr;

    uv_ip4_addr("0.0.0.0", 6502, &recv_addr);
    uv_udp_bind(&udp_server, (const struct sockaddr *)&recv_addr, UV_UDP_REUSEADDR);
    uv_udp_set_membership(&udp_server, "224.1.1.1", NULL, UV_JOIN_GROUP);
    uv_udp_recv_start(&udp_server, alloc_cb, svr_recv_cb);

    uv_run(loop, UV_RUN_DEFAULT);

    omx_still_close();
}

int main()
{
    session();

    LOG_MESSAGE("ok");

    return 0;
}
