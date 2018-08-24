#ifndef  OMX_PARAMETER_INC
#define  OMX_PARAMETER_INC

/*****************************************************************************/

#include <IL/OMX_Broadcom.h>

/*****************************************************************************/

WARN_UNUSED enum error_code
omx_parameter_camera_device_number(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nU32);

/*****************************************************************************/

WARN_UNUSED enum error_code
omx_parameter_qfactor(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nQFactor);

/*****************************************************************************/

WARN_UNUSED enum error_code
omx_parameter_brcm_exif(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_BOOL       bEnabled);

/*****************************************************************************/

WARN_UNUSED enum error_code
omx_parameter_brcm_ijg_scaling(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bEnabled);

/*****************************************************************************/

WARN_UNUSED enum error_code
omx_parameter_brcm_thumbnail(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        bEnable,
        OMX_IN OMX_U32        bUsePreview,
        OMX_IN OMX_U32        nWidth,
        OMX_IN OMX_U32        nHeight);

/*****************************************************************************/

WARN_UNUSED enum error_code
omx_parameter_brcm_disable_proprietary_tunnels(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        bUseBuffers);

/*****************************************************************************/

WARN_UNUSED enum error_code
omx_parameter_port_max_frame_size(
    OMX_IN OMX_HANDLETYPE hComponent,
    OMX_IN OMX_INDEXTYPE  nPortIndex,
    OMX_IN OMX_U32        nWidth,
    OMX_IN OMX_U32        nHeight);

/*****************************************************************************/

#endif
