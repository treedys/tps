#include "omx.h"

#include "logerr.h"
#include "dump.h"

/*****************************************************************************/

enum error_code omx_init(void)
{
    OMX_ERRORTYPE result_omx = OMX_Init();

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_Init: (%s)", dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code omx_deinit(void)
{
    OMX_ERRORTYPE result_omx = OMX_Deinit();

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_Deinit: (%s)", dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_get_handle(
        OMX_OUT OMX_HANDLETYPE   *pHandle,
        OMX_IN  OMX_STRING        cComponentName,
        OMX_IN  OMX_PTR           pAppData,
        OMX_IN  OMX_CALLBACKTYPE *pCallBacks)
{
    OMX_ERRORTYPE result_omx = OMX_GetHandle(pHandle, cComponentName, pAppData, pCallBacks);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_GetHandle: %s (%s)", cComponentName, dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_free_handle(
        OMX_IN OMX_HANDLETYPE hComponent)
{
    OMX_ERRORTYPE result_omx = OMX_FreeHandle(hComponent);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_FreeHandle: (%s)", dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_set_config(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_INDEXTYPE  nIndex,
        OMX_IN OMX_PTR        pComponentConfigStructure)
{
    OMX_ERRORTYPE result_omx = OMX_SetConfig(hComponent, nIndex, pComponentConfigStructure);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SetConfig: %s(%8X) (%s)", dump_OMX_INDEXTYPE(nIndex), nIndex, dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_send_command(
        OMX_IN OMX_HANDLETYPE  hComponent,
        OMX_IN OMX_COMMANDTYPE Cmd,
        OMX_IN OMX_U32         nParam1,
        OMX_IN OMX_PTR         pCmdData)
{
    OMX_ERRORTYPE result_omx = OMX_SendCommand(hComponent, Cmd, nParam1, pCmdData);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SendCommand: (%s)", dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_get_parameter(
        OMX_IN    OMX_HANDLETYPE  hComponent,
        OMX_IN    OMX_INDEXTYPE   nParamIndex,
        OMX_INOUT OMX_PTR         pComponentParameterStructure)
{
    OMX_ERRORTYPE result_omx = OMX_GetParameter(hComponent, nParamIndex, pComponentParameterStructure);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_GetParameter: %s(%8X) (%s)", dump_OMX_INDEXTYPE(nParamIndex), nParamIndex, dump_OMX_ERRORTYPE(result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_set_parameter(
        OMX_IN OMX_HANDLETYPE  hComponent,
        OMX_IN OMX_INDEXTYPE   nParamIndex,
        OMX_IN OMX_PTR         pComponentParameterStructure)
{
    OMX_ERRORTYPE result_omx = OMX_SetParameter(hComponent, nParamIndex, pComponentParameterStructure);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SetParameter: %s(%8X) (%s)", dump_OMX_INDEXTYPE(nParamIndex), nParamIndex, dump_OMX_ERRORTYPE(result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_allocate_buffer(
        OMX_IN    OMX_HANDLETYPE         hComponent,
        OMX_INOUT OMX_BUFFERHEADERTYPE **ppBuffer,
        OMX_IN    OMX_U32                nPortIndex,
        OMX_IN    OMX_PTR                pAppPrivate,
        OMX_IN    OMX_U32                nSizeBytes)
{
    OMX_ERRORTYPE result_omx = OMX_AllocateBuffer(hComponent, ppBuffer, nPortIndex, pAppPrivate, nSizeBytes);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_AllocateBuffer: port %d %d (%s)", nPortIndex, nSizeBytes, dump_OMX_ERRORTYPE(result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_free_buffer(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_U32               nPortIndex,
        OMX_IN OMX_BUFFERHEADERTYPE *pBuffer)
{
    OMX_ERRORTYPE result_omx = OMX_FreeBuffer(hComponent, nPortIndex, pBuffer);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_FreeBuffer: port %d (%s)", nPortIndex, dump_OMX_ERRORTYPE(result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_fill_this_buffer(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_BUFFERHEADERTYPE *pBuffer)
{
    OMX_ERRORTYPE result_omx = OMX_FillThisBuffer(hComponent, pBuffer);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_FillThisBuffer: (%s)", dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_setup_tunnel(
        OMX_IN OMX_HANDLETYPE hOutput,
        OMX_IN OMX_U32        nPortOutput,
        OMX_IN OMX_HANDLETYPE hInput,
        OMX_IN OMX_U32        nPortInput)
{
    OMX_ERRORTYPE result_omx = OMX_SetupTunnel(hOutput, nPortOutput, hInput, nPortInput);

    if(result_omx != OMX_ErrorNone)
    {
        LOG_ERROR("OMX_SetupTunnel: output %d input %d (%s)", nPortOutput, nPortInput, dump_OMX_ERRORTYPE (result_omx));
        return ERROR;
    }

    return OK;
}

/*****************************************************************************/

enum error_code
omx_allocate_port_buffer(
        OMX_IN    OMX_HANDLETYPE         hComponent,
        OMX_INOUT OMX_BUFFERHEADERTYPE **ppBuffer,
        OMX_IN    OMX_U32                nPortIndex,
        OMX_IN    OMX_PTR                pAppPrivate)
{
    enum error_code result;
    OMX_PARAM_PORTDEFINITIONTYPE def_st; OMX_INIT_STRUCTURE (def_st);

    def_st.nPortIndex = nPortIndex;

    result = omx_get_parameter(hComponent, OMX_IndexParamPortDefinition, &def_st); if(result) return result;

    return omx_allocate_buffer(hComponent, ppBuffer, nPortIndex, pAppPrivate, def_st.nBufferSize);
}

/*****************************************************************************/

