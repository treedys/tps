#ifndef  MAC_INC
#define  MAC_INC

#include "error.h"

/*****************************************************************************/

WARN_UNUSED enum error_code get_mac_address(const char * const device, char (* const mac)[18]);

/*****************************************************************************/

#endif
