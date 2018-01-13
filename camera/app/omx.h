#ifndef  OMX_INC
#define  OMX_INC

/*****************************************************************************/

#include <string.h>
#include <IL/OMX_Broadcom.h>

/*****************************************************************************/

#define OMX_INIT_STRUCTURE(a)                            \
    memset(&(a), 0, sizeof(a));                          \
    (a).nSize = sizeof(a);                               \
    (a).nVersion.nVersion        = OMX_VERSION;          \
    (a).nVersion.s.nVersionMajor = OMX_VERSION_MAJOR;    \
    (a).nVersion.s.nVersionMinor = OMX_VERSION_MINOR;    \
    (a).nVersion.s.nRevision     = OMX_VERSION_REVISION; \
    (a).nVersion.s.nStep         = OMX_VERSION_STEP

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY omx_init(void);
OMX_API OMX_ERRORTYPE OMX_APIENTRY omx_deinit(void);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_get_handle(
        OMX_OUT OMX_HANDLETYPE   *pHandle,
        OMX_IN  OMX_STRING        cComponentName,
        OMX_IN  OMX_PTR           pAppData,
        OMX_IN  OMX_CALLBACKTYPE *pCallBacks);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_free_handle(
        OMX_IN OMX_HANDLETYPE hComponent);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_set_config(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_INDEXTYPE  nIndex,
        OMX_IN OMX_PTR        pComponentConfigStructure);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_send_command(
        OMX_IN OMX_HANDLETYPE  hComponent,
        OMX_IN OMX_COMMANDTYPE Cmd,
        OMX_IN OMX_U32         nParam1,
        OMX_IN OMX_PTR         pCmdData);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_get_parameter(
        OMX_IN    OMX_HANDLETYPE  hComponent,
        OMX_IN    OMX_INDEXTYPE   nParamIndex,
        OMX_INOUT OMX_PTR         pComponentParameterStructure);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_set_parameter(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_INDEXTYPE  nIndex,
        OMX_IN OMX_PTR        pComponentParameterStructure);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_allocate_buffer(
        OMX_IN    OMX_HANDLETYPE         hComponent,
        OMX_INOUT OMX_BUFFERHEADERTYPE **ppBuffer,
        OMX_IN    OMX_U32                nPortIndex,
        OMX_IN    OMX_PTR                pAppPrivate,
        OMX_IN    OMX_U32                nSizeBytes);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_free_buffer(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_U32               nPortIndex,
        OMX_IN OMX_BUFFERHEADERTYPE *pBuffer);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_fill_this_buffer(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_BUFFERHEADERTYPE *pBuffer);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_setup_tunnel(
        OMX_IN OMX_HANDLETYPE hOutput,
        OMX_IN OMX_U32        nPortOutput,
        OMX_IN OMX_HANDLETYPE hInput,
        OMX_IN OMX_U32        nPortInput);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_allocate_port_buffer(
        OMX_IN    OMX_HANDLETYPE         hComponent,
        OMX_INOUT OMX_BUFFERHEADERTYPE **ppBuffer,
        OMX_IN    OMX_U32                nPortIndex,
        OMX_IN    OMX_PTR                pAppPrivate);

/*****************************************************************************/

#endif
