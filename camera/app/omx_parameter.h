#ifndef  OMX_PARAMETER_INC
#define  OMX_PARAMETER_INC

/*****************************************************************************/

#include <IL/OMX_Broadcom.h>

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_camera_device_number(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nU32);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_qfactor(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nQFactor);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_brcm_exif(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_BOOL       bEnabled);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_brcm_ijg_scaling(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bEnabled);

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_brcm_thumbnail(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        bEnable,
        OMX_IN OMX_U32        bUsePreview,
        OMX_IN OMX_U32        nWidth,
        OMX_IN OMX_U32        nHeight);

/*****************************************************************************/

#endif
