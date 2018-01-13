#include "omx_component.h"

#include "omx.h"
#include "omx_config.h"
#include "omx_parameter.h"
#include "dump.h"

//Function that is called when a component receives an event from a secondary
//thread
OMX_ERRORTYPE event_handler(OMX_IN OMX_HANDLETYPE comp,
                            OMX_IN OMX_PTR        app_data,
                            OMX_IN OMX_EVENTTYPE  event,
                            OMX_IN OMX_U32        data1,
                            OMX_IN OMX_U32        data2,
                            OMX_IN OMX_PTR        event_data) {

    component_t* component = (component_t*)app_data;

    switch(event) {
        case OMX_EventCmdComplete:
            switch(data1) {
                case OMX_CommandStateSet:    wake(component, EVENT_STATE_SET   ); LOG_EVENT(component, EVENT_STATE_SET,    "state: %s", dump_OMX_STATETYPE (data2)); break;
                case OMX_CommandPortDisable: wake(component, EVENT_PORT_DISABLE); LOG_EVENT(component, EVENT_PORT_DISABLE, "port: %d",  data2); break;
                case OMX_CommandPortEnable:  wake(component, EVENT_PORT_ENABLE ); LOG_EVENT(component, EVENT_PORT_ENABLE,  "port: %d",  data2); break;
                case OMX_CommandFlush:       wake(component, EVENT_FLUSH       ); LOG_EVENT(component, EVENT_FLUSH,        "port: %d",  data2); break;
                case OMX_CommandMarkBuffer:  wake(component, EVENT_MARK_BUFFER ); LOG_EVENT(component, EVENT_MARK_BUFFER,  "port: %d",  data2); break;
            }
            break;

        case OMX_EventError:                     wake(component, EVENT_ERROR                      ); LOG_EVENT(component, EVENT_ERROR,                       "%s",       dump_OMX_ERRORTYPE(data1)); break;
        case OMX_EventMark:                      wake(component, EVENT_MARK                       ); LOG_EVENT(component, EVENT_MARK,                        ""                                   ); break;
        case OMX_EventPortSettingsChanged:       wake(component, EVENT_PORT_SETTINGS_CHANGED      ); LOG_EVENT(component, EVENT_PORT_SETTINGS_CHANGED,       "port: %d",             data1        ); break;
        case OMX_EventParamOrConfigChanged:      wake(component, EVENT_PARAM_OR_CONFIG_CHANGED    ); LOG_EVENT(component, EVENT_PARAM_OR_CONFIG_CHANGED,     "data1: %d, data2: %X", data1, data2 ); break;
        case OMX_EventBufferFlag:                wake(component, EVENT_BUFFER_FLAG                ); LOG_EVENT(component, EVENT_BUFFER_FLAG,                 "port: %d",             data1        ); break;
        case OMX_EventResourcesAcquired:         wake(component, EVENT_RESOURCES_ACQUIRED         ); LOG_EVENT(component, EVENT_RESOURCES_ACQUIRED,          ""                                   ); break;
        case OMX_EventDynamicResourcesAvailable: wake(component, EVENT_DYNAMIC_RESOURCES_AVAILABLE); LOG_EVENT(component, EVENT_DYNAMIC_RESOURCES_AVAILABLE, ""                                   ); break;

        default:
            //This should never execute, just ignore
            LOG_EVENT(component, EVENT_UNKNOWN, "(%X)", event);
            break;
    }

    return OMX_ErrorNone;
}

//Function that is called when a component fills a buffer with data
OMX_ERRORTYPE fill_buffer_done(OMX_IN OMX_HANDLETYPE comp,
                               OMX_IN OMX_PTR        app_data,
                               OMX_IN OMX_BUFFERHEADERTYPE* buffer) {

    component_t* component = (component_t*)app_data;

    wake(component, EVENT_FILL_BUFFER_DONE);
    LOG_COMPONENT(component, "fill_buffer_done");

    return OMX_ErrorNone;
}

void wake(component_t* component, VCOS_UNSIGNED event) {
    vcos_event_flags_set(&component->flags, event, VCOS_OR);
}

void wait(component_t* component, VCOS_UNSIGNED events, VCOS_UNSIGNED* retrieved_events) {

    VCOS_UNSIGNED set;

    if(vcos_event_flags_get(&component->flags, events | EVENT_ERROR, VCOS_OR_CONSUME, VCOS_SUSPEND, &set)) {
        LOG_ERROR("vcos_event_flags_get");
        exit(1);
    }

    if(set == EVENT_ERROR) {
        LOG_ERROR("EVENT_ERROR");
        exit(1);
    }

    if(retrieved_events) {
        *retrieved_events = set;
    }
}

void init_component(component_t* component) {
    LOG_COMPONENT(component, "initializing component");

    OMX_ERRORTYPE error;

    //Create the event flags
    if(vcos_event_flags_create(&component->flags, "component")) {
        LOG_ERROR("vcos_event_flags_create");
        exit(1);
    }

    //Each component has an event_handler and fill_buffer_done functions
    OMX_CALLBACKTYPE callbacks_st;
    callbacks_st.EventHandler = event_handler;
    callbacks_st.FillBufferDone = fill_buffer_done;

    //Get the handle
    error = OMX_GetHandle(&component->handle, component->name, component, &callbacks_st); if(error) { exit(1); }

    //Disable all the ports
    OMX_INDEXTYPE types[] = {
        OMX_IndexParamAudioInit,
        OMX_IndexParamVideoInit,
        OMX_IndexParamImageInit,
        OMX_IndexParamOtherInit
    };

    OMX_PORT_PARAM_TYPE ports_st; OMX_INIT_STRUCTURE (ports_st);

    int i;
    for(i=0; i<4; i++) {
        error = omx_get_parameter(component->handle, types[i], &ports_st); if(error) { exit(1); }

        OMX_U32 port;
        for(port=ports_st.nStartPortNumber; port<ports_st.nStartPortNumber + ports_st.nPorts; port++) {
            //Disable the port
            disable_port(component, port);
            //Wait to the event
            wait(component, EVENT_PORT_DISABLE, 0);
        }
    }
}

void deinit_component(component_t* component) {
    LOG_COMPONENT(component, "deinit_component");

    OMX_ERRORTYPE error;

    vcos_event_flags_delete(&component->flags);

    error = omx_free_handle(component->handle); if(error) { exit(1); }
}

void load_camera_drivers(component_t* component) {
    /*
       This is a specific behaviour of the Broadcom's Raspberry Pi OpenMAX IL
       implementation module because the OMX_SetConfig() and OMX_SetParameter() are
       blocking functions but the drivers are loaded asynchronously, that is, an
       event is fired to signal the completion. Basically, what you're saying is:

       "When the parameter with index OMX_IndexParamCameraDeviceNumber is set, load
       the camera drivers and emit an OMX_EventParamOrConfigChanged event"

       The red LED of the camera will be turned on after this call.
       */

    LOG_COMPONENT(component, "load_camera_drivers");

    OMX_ERRORTYPE error;

    error = omx_config_request_callback       (component->handle, OMX_ALL, OMX_IndexParamCameraDeviceNumber, OMX_TRUE); if(error) { exit(1); }
    error = omx_parameter_camera_device_number(component->handle, OMX_ALL, 0);                                          if(error) { exit(1); }

    wait(component, EVENT_PARAM_OR_CONFIG_CHANGED, 0);
}

void change_state(component_t* component, OMX_STATETYPE state) {
    LOG_COMPONENT(component, "change_state to %s", dump_OMX_STATETYPE (state));

    OMX_ERRORTYPE error;

    error = omx_send_command(component->handle, OMX_CommandStateSet, state, 0); if(error) { exit(1); }
}

void enable_port(component_t* component, OMX_U32 port) {
    LOG_COMPONENT(component, "enable_port %d", port);

    OMX_ERRORTYPE error;

    error = omx_send_command(component->handle, OMX_CommandPortEnable, port, 0); if(error) { exit(1); }
}

void disable_port(component_t* component, OMX_U32 port) {
    LOG_COMPONENT(component, "disable_port %d", port);

    OMX_ERRORTYPE error;

    error = omx_send_command(component->handle, OMX_CommandPortDisable, port, 0); if(error) { exit(1); }
}

void port_enable_allocate_buffer(component_t* component, OMX_BUFFERHEADERTYPE** buffer, OMX_U32 port) {
    //The port is not enabled until the buffer is allocated
    OMX_ERRORTYPE error;

    enable_port(component, port);

    LOG_COMPONENT(component, "allocating output buffer");

    error = omx_allocate_port_buffer(component->handle, buffer, port, 0); if(error) { exit(1); }

    wait(component, EVENT_PORT_ENABLE, 0);
}

void port_disable_free_buffer(component_t* component, OMX_BUFFERHEADERTYPE* buffer, OMX_U32 port) {
    //The port is not disabled until the buffer is released
    OMX_ERRORTYPE error;

    disable_port(component, port);

    //Free encoder output buffer
    LOG_COMPONENT(component, "releasing output buffer");

    error = omx_free_buffer(component->handle, port, buffer); if(error) { exit(1); }

    wait(component, EVENT_PORT_DISABLE, 0);
}

