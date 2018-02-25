#include "camera-net.h"

#include <uv.h>

#include "logerr.h"
#include "mac.h"

static struct sockaddr_in udp_broadcast_addr;
static struct sockaddr_in udp_server_addr;
static struct sockaddr_in udp_client_addr;

static uv_udp_t udp_server;
static uv_udp_t udp_client;

static uv_udp_send_t udp_send_request;

static uv_buf_t ping_buffer;

static char mac_address[18];

extern void shoot(void);
extern uint8_t jpeg[];
extern size_t position;


static void alloc_cb(uv_handle_t *handle, size_t suggested_size, uv_buf_t *buf)
{
    // FIXME: Fix the memory leak, free() must be called.
    *buf = uv_buf_init((char*) malloc(suggested_size), suggested_size);
}

static void udp_client_on_send_cb(uv_udp_send_t *req, int status)
{
    if(status==-1)
        LOG_ERROR("UDP send error");

    LOG_ERROR("PONG");
}

static void ping(void)
{
    LOG_ERROR("PING");

    ping_buffer = uv_buf_init(mac_address, sizeof(mac_address));

    uv_udp_send(&udp_send_request, &udp_client, &ping_buffer, 1, (const struct sockaddr *)&udp_client_addr, &udp_client_on_send_cb);
}

static void udb_server_recv_cb(uv_udp_t* handle,
        ssize_t nread,
        const struct uv_buf_t *buf,
        const struct sockaddr* addr,
        unsigned flags)
{
    if(!addr)
        return;

    switch(buf->base[0])
    {
        case 0:
            ping();
            break;

        case 1:
            shoot();
            break;

        default:
            LOG_ERROR("Unknown UDP request %02X", buf->base[0]);
            break;
    }
}

void net_session(void) {
    uv_loop_t *loop = uv_default_loop();

    get_mac_address("eth0", &mac_address);

    uv_udp_init(loop, &udp_server);
    uv_udp_init(loop, &udp_client);

    uv_ip4_addr("0.0.0.0",   6502, &udp_server_addr);
    uv_ip4_addr("0.0.0.0",      0, &udp_broadcast_addr);
    uv_ip4_addr("224.1.1.1", 6501, &udp_client_addr);

    uv_udp_bind(&udp_server, (const struct sockaddr *)&udp_server_addr,    UV_UDP_REUSEADDR);
    uv_udp_bind(&udp_client, (const struct sockaddr *)&udp_broadcast_addr,                0);

    uv_udp_set_membership(&udp_server, "224.1.1.1", NULL, UV_JOIN_GROUP);
    uv_udp_recv_start(&udp_server, alloc_cb, udb_server_recv_cb);

    uv_udp_set_broadcast(&udp_client, 1);

    uv_run(loop, UV_RUN_DEFAULT);
}
