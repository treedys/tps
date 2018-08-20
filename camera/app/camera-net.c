#include "camera-net.h"
#include "camera-app.h"

#include <uv.h>
#include <string.h>
#include <unistd.h>

#include "logerr.h"
#include "mac.h"

#define LOG_UV_ERROR(uv_err, fmt, ...) LOG_ERROR("LIBUV: UV_(%d) %s, " fmt, uv_err, uv_err_name(uv_err), ##__VA_ARGS__)

static struct sockaddr_in udp_broadcast_addr;
static struct sockaddr_in udp_server_addr;
static struct sockaddr_in udp_client_addr;

static uv_udp_t udp_server;
static uv_udp_t udp_client;

static uv_buf_t ping_buffer;
static uv_buf_t error_buffer;

static char mac_address[18];
static const char mac_broadcast_address[18] = "FF:FF:FF:FF:FF:FF";

struct __attribute__((__packed__)) received_message
{
    struct __attribute__((__packed__))
    {
        const char address[17];
        const uint8_t command;
    } header;

    union __attribute__((__packed__))
    {
        struct __attribute__((__packed__)) { struct camera_configuration configuration; } shoot;
        struct __attribute__((__packed__)) { int32_t shoot; } erase;
        struct __attribute__((__packed__)) { char shell_command[1]; } execute; /* Avoid GCC 'error: flexible array member in otherwise empty struct' */
    };
};

static void alloc_cb(uv_handle_t *handle, size_t suggested_size, uv_buf_t *buf)
{
    *buf = uv_buf_init((char*) malloc(suggested_size), suggested_size);
}

static void udp_client_on_send_ping_cb(uv_udp_send_t *req, int status)
{
    if(status==-1)
        LOG_ERROR("UDP send error");

    free(req);

    LOG_MESSAGE("PONG");
}

static WARN_UNUSED enum error_code ping(void)
{
    uv_errno_t result_uv;

    LOG_MESSAGE("PING");

    uv_udp_send_t *udp_send_request = malloc(sizeof(*udp_send_request));
    if(udp_send_request==NULL) {
        LOG_ERROR("PING Out of memory");
        return ERROR;
    }

    ping_buffer = uv_buf_init(mac_address, sizeof(mac_address));

    result_uv = uv_udp_send(udp_send_request, &udp_client, &ping_buffer, 1, (const struct sockaddr *)&udp_client_addr, &udp_client_on_send_ping_cb);

    if(result_uv!=0) {
        LOG_UV_ERROR(result_uv, "PING UDP send");
        free(udp_send_request);
        return ERROR;
    }

    return OK;
}

/* TODO: Try to report better error information */
static void udp_client_on_send_error_cb(uv_udp_send_t *req, int status)
{
    if(status==-1)
        LOG_ERROR("UDP send error");

    free(req);
}

/* TODO: call that from the error handler */
void report_error(const char * const message)
{
    uv_errno_t result_uv;

    struct {
        uv_udp_send_t udp_send_request;
        char          message[500];
    } *mem = malloc(sizeof(*mem));

    if(mem==NULL) { return; }

    memset(mem->message, 0, sizeof(mem->message));

    strncpy(mem->message, message, sizeof(mem->message));
    error_buffer = uv_buf_init(mem->message, sizeof(mem->message));

    result_uv = uv_udp_send(&mem->udp_send_request, &udp_client, &error_buffer, 1, (const struct sockaddr *)&udp_client_addr, &udp_client_on_send_error_cb);

    if(result_uv!=0)
        free(mem);
}

static void udb_server_recv_cb(uv_udp_t* handle,
        ssize_t nread,
        const struct uv_buf_t *buf,
        const struct sockaddr* addr,
        unsigned flags)
{
    enum error_code result;

    const struct received_message * const message = (const struct received_message * const)(buf->base);

    if(!addr || !nread || nread<sizeof(message->header))
        goto exit;

    if(memcmp(message->header.address, mac_address,           sizeof(message->header.address))!=0 &&
       memcmp(message->header.address, mac_broadcast_address, sizeof(message->header.address))!=0)
        goto exit;

    switch(message->header.command)
    {
        case 0:
            result = ping(); if(result!=OK) { /* ignore any errors */ }
            break;

        case 1:
            if( nread != sizeof(message->header)+sizeof(message->shoot) )
                LOG_ERROR("Wrong request size %d expected %d",
                        nread, sizeof(message->header)+sizeof(message->shoot));

            result = shoot(message->shoot.configuration);
            if(result!=OK) { /* ignore any errors */ }
            break;

        case 2:
            if( nread != sizeof(message->header)+sizeof(message->erase) )
                LOG_ERROR("Wrong request size %d expected %d", nread, sizeof(message->header)+sizeof(message->erase));

            result = erase(message->erase.shoot); if(result!=OK) { /* ignore any errors */ }
            break;

        case 3:
            system(message->execute.shell_command);
            break;

        default:
            LOG_ERROR("Unknown UDP request %d (%02X)", nread, message->header.command);
            break;
    }
exit:
    if(buf->base)
        free(buf->base);
}

enum error_code net_session(void) {
    enum error_code result;
    uv_errno_t result_uv;

    int exit_code;

    /* Check that network is initialised */
    exit_code = system("ip route | grep default"); if(exit_code<0) { LOG_ERROR("System failed %d", exit_code); return ERROR; }

    if(exit_code>0) {
        LOG_MESSAGE("Network is not initialised");
        sleep(1);
        return OK;
    }

    uv_loop_t *loop = uv_default_loop();

    result = get_mac_address("eth0", &mac_address); if(result!=OK) return result;

    result_uv = uv_udp_init(loop, &udp_server);                                                        if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Initialising UDP server" ); return ERROR; }
    result_uv = uv_udp_init(loop, &udp_client);                                                        if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Initialising UDP client" ); return ERROR; }

    result_uv = uv_ip4_addr("0.0.0.0",   6502, &udp_server_addr);                                      if(result_uv!=0) { LOG_UV_ERROR(result_uv, "IP4 address"             ); return ERROR; }
    result_uv = uv_ip4_addr("0.0.0.0",      0, &udp_broadcast_addr);                                   if(result_uv!=0) { LOG_UV_ERROR(result_uv, "IP4 address"             ); return ERROR; }
    result_uv = uv_ip4_addr("224.1.1.1", 6501, &udp_client_addr);                                      if(result_uv!=0) { LOG_UV_ERROR(result_uv, "IP4 address"             ); return ERROR; }

    result_uv = uv_udp_bind(&udp_server, (const struct sockaddr *)&udp_server_addr, UV_UDP_REUSEADDR); if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Server UDP bind"         ); return ERROR; }
    result_uv = uv_udp_bind(&udp_client, (const struct sockaddr *)&udp_broadcast_addr,             0); if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Client UDP bind"         ); return ERROR; }

    result_uv = uv_udp_set_membership(&udp_server, "224.1.1.1", NULL, UV_JOIN_GROUP);                  if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Server UDP membership"   ); return ERROR; }
    result_uv = uv_udp_recv_start    (&udp_server, alloc_cb, udb_server_recv_cb    );                  if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Server UDP receive start"); return ERROR; }

    result_uv = uv_udp_set_broadcast(&udp_client, 1);                                                  if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Client UDP broadcast"    ); return ERROR; }

    logerr = report_error;

    uv_run(loop, UV_RUN_DEFAULT);

    logerr = NULL;

    result_uv = uv_udp_recv_stop     (&udp_server                                   );                 if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Server UDP receive stop" ); return ERROR; }
    result_uv = uv_udp_set_membership(&udp_server, "224.1.1.1", NULL, UV_LEAVE_GROUP);                 if(result_uv!=0) { LOG_UV_ERROR(result_uv, "Server leave membership" ); return ERROR; }

    return OK;
}
