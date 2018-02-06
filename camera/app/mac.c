#include "mac.h"

#include <sys/types.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <net/if.h>
#include <stdio.h>
#include <string.h>

void get_mac_address(const char * const device, char (* const mac)[18])
{
    int s;
    struct ifreq ifr;

    s = socket(AF_INET, SOCK_DGRAM, 0);

    memset(&ifr, 0x00, sizeof(ifr));

    strncpy(ifr.ifr_name, device, sizeof(ifr.ifr_name));
    ifr.ifr_name[sizeof(ifr.ifr_name)-1]=0;

    ioctl(s, SIOCGIFHWADDR, &ifr);

    sprintf(&((*mac)[0]),"%02X:%02X:%02X:%02X:%02X:%02X",
            ((unsigned char*)ifr.ifr_hwaddr.sa_data)[0],
            ((unsigned char*)ifr.ifr_hwaddr.sa_data)[1],
            ((unsigned char*)ifr.ifr_hwaddr.sa_data)[2],
            ((unsigned char*)ifr.ifr_hwaddr.sa_data)[3],
            ((unsigned char*)ifr.ifr_hwaddr.sa_data)[4],
            ((unsigned char*)ifr.ifr_hwaddr.sa_data)[5]);
}
