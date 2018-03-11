#ifndef  OMX_COMPONENT_INC
#define  OMX_COMPONENT_INC

#include <IL/OMX_Broadcom.h>
#include <interface/vcos/vcos.h>

#include "logerr.h"

#define LOG_MESSAGE_COMPONENT(component, fmt, ...) LOG_MESSAGE("component: %-30s, " fmt, (component)->name, ##__VA_ARGS__)
#define LOG_MESSAGE_EVENT(component, event, fmt, ...) LOG_MESSAGE_COMPONENT((component), "event: %-20s, " fmt, #event, ##__VA_ARGS__)

#define LOG_ERROR_COMPONENT(component, fmt, ...) LOG_ERROR("component: %-30s, " fmt, (component)->name, ##__VA_ARGS__)
#define LOG_ERROR_EVENT(component, event, fmt, ...) LOG_ERROR_COMPONENT((component), "event: %-20s, " fmt, #event, ##__VA_ARGS__)

#include "error.h"

//Data of each component
typedef struct
{
    //The handle is obtained with OMX_GetHandle() and is used on every function
    //that needs to manipulate a component. It is released with OMX_FreeHandle()
    OMX_HANDLETYPE handle;
    //Bitwise OR of flags. Used for blocking the current thread and waiting an
    //event. Used with vcos_event_flags_get() and vcos_event_flags_set()
    VCOS_EVENT_FLAGS_T flags;
    //The fullname of the component
    OMX_STRING name;
} component_t;

//Events used with vcos_event_flags_get() and vcos_event_flags_set()
typedef enum
{
    EVENT_ERROR                       = 0x1,
    EVENT_PORT_ENABLE                 = 0x2,
    EVENT_PORT_DISABLE                = 0x4,
    EVENT_STATE_SET                   = 0x8,
    EVENT_FLUSH                       = 0x10,
    EVENT_MARK_BUFFER                 = 0x20,
    EVENT_MARK                        = 0x40,
    EVENT_PORT_SETTINGS_CHANGED       = 0x80,
    EVENT_PARAM_OR_CONFIG_CHANGED     = 0x100,
    EVENT_BUFFER_FLAG                 = 0x200,
    EVENT_RESOURCES_ACQUIRED          = 0x400,
    EVENT_DYNAMIC_RESOURCES_AVAILABLE = 0x800,
    EVENT_FILL_BUFFER_DONE            = 0x1000,
    EVENT_EMPTY_BUFFER_DONE           = 0x2000,
} component_event;

            void            wake                        (component_t* component, VCOS_UNSIGNED event);
WARN_UNUSED enum error_code wait                        (component_t* component, VCOS_UNSIGNED events, VCOS_UNSIGNED* retrieves_events);
WARN_UNUSED enum error_code init_component              (component_t* component);
WARN_UNUSED enum error_code deinit_component            (component_t* component);
WARN_UNUSED enum error_code load_camera_drivers         (component_t* component);
WARN_UNUSED enum error_code change_state                (component_t* component, OMX_STATETYPE state);
WARN_UNUSED enum error_code enable_port                 (component_t* component, OMX_U32 port);
WARN_UNUSED enum error_code disable_port                (component_t* component, OMX_U32 port);
WARN_UNUSED enum error_code port_enable_allocate_buffer (component_t* component, OMX_BUFFERHEADERTYPE** buffer, OMX_U32 port);
WARN_UNUSED enum error_code port_disable_free_buffer    (component_t* component, OMX_BUFFERHEADERTYPE* buffer, OMX_U32 port);

#endif

