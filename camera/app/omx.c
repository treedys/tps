#include "omx.h"

#include "logerr.h"
#include "dump.h"

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY omx_init(void)
{
    OMX_ERRORTYPE error = OMX_Init();

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_Init: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY omx_deinit(void)
{
    OMX_ERRORTYPE error = OMX_Deinit();

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_Deinit: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_get_handle(
        OMX_OUT OMX_HANDLETYPE   *pHandle,
        OMX_IN  OMX_STRING        cComponentName,
        OMX_IN  OMX_PTR           pAppData,
        OMX_IN  OMX_CALLBACKTYPE *pCallBacks)
{
    OMX_ERRORTYPE error = OMX_GetHandle(pHandle, cComponentName, pAppData, pCallBacks);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_GetHandle: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_free_handle(
        OMX_IN OMX_HANDLETYPE hComponent)
{
    OMX_ERRORTYPE error = OMX_FreeHandle(hComponent);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_FreeHandle: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_set_config(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_INDEXTYPE  nIndex,
        OMX_IN OMX_PTR        pComponentConfigStructure)
{
    OMX_ERRORTYPE error = OMX_SetConfig(hComponent, nIndex, pComponentConfigStructure);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SetConfig: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_send_command(
        OMX_IN OMX_HANDLETYPE  hComponent,
        OMX_IN OMX_COMMANDTYPE Cmd,
        OMX_IN OMX_U32         nParam1,
        OMX_IN OMX_PTR         pCmdData)
{
    OMX_ERRORTYPE error = OMX_SendCommand(hComponent, Cmd, nParam1, pCmdData);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SendCommand: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_get_parameter(
        OMX_IN    OMX_HANDLETYPE  hComponent,
        OMX_IN    OMX_INDEXTYPE   nParamIndex,
        OMX_INOUT OMX_PTR         pComponentParameterStructure)
{
    OMX_ERRORTYPE error = OMX_GetParameter(hComponent, nParamIndex, pComponentParameterStructure);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_GetParameter: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_set_parameter(
        OMX_IN OMX_HANDLETYPE  hComponent,
        OMX_IN OMX_INDEXTYPE   nParamIndex,
        OMX_IN OMX_PTR         pComponentParameterStructure)
{
    OMX_ERRORTYPE error = OMX_SetParameter(hComponent, nParamIndex, pComponentParameterStructure);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SetParameter: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_allocate_buffer(
        OMX_IN    OMX_HANDLETYPE         hComponent,
        OMX_INOUT OMX_BUFFERHEADERTYPE **ppBuffer,
        OMX_IN    OMX_U32                nPortIndex,
        OMX_IN    OMX_PTR                pAppPrivate,
        OMX_IN    OMX_U32                nSizeBytes)
{
    OMX_ERRORTYPE error = OMX_AllocateBuffer(hComponent, ppBuffer, nPortIndex, pAppPrivate, nSizeBytes);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_AllocateBuffer: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_free_buffer(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_U32               nPortIndex,
        OMX_IN OMX_BUFFERHEADERTYPE *pBuffer)
{
    OMX_ERRORTYPE error = OMX_FreeBuffer(hComponent, nPortIndex, pBuffer);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_FreeBuffer: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_fill_this_buffer(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_BUFFERHEADERTYPE *pBuffer)
{
    OMX_ERRORTYPE error = OMX_FillThisBuffer(hComponent, pBuffer);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_FillThisBuffer: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_setup_tunnel(
        OMX_IN OMX_HANDLETYPE hOutput,
        OMX_IN OMX_U32        nPortOutput,
        OMX_IN OMX_HANDLETYPE hInput,
        OMX_IN OMX_U32        nPortInput)
{
    OMX_ERRORTYPE error = OMX_SetupTunnel(hOutput, nPortOutput, hInput, nPortInput);

    if(error != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SetupTunnel: %s", dump_OMX_ERRORTYPE (error));
    }

    return error;
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_allocate_port_buffer(
        OMX_IN    OMX_HANDLETYPE         hComponent,
        OMX_INOUT OMX_BUFFERHEADERTYPE **ppBuffer,
        OMX_IN    OMX_U32                nPortIndex,
        OMX_IN    OMX_PTR                pAppPrivate)
{
    OMX_ERRORTYPE error;
    OMX_PARAM_PORTDEFINITIONTYPE def_st; OMX_INIT_STRUCTURE (def_st);

    def_st.nPortIndex = nPortIndex;

    error = omx_get_parameter(hComponent, OMX_IndexParamPortDefinition, &def_st); if(error) return error;

    return omx_allocate_buffer(hComponent, ppBuffer, nPortIndex, pAppPrivate, def_st.nBufferSize);

}

/*****************************************************************************/

