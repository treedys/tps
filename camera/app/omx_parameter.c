#include "omx_config.h"

#include "omx.h"

/*****************************************************************************/

enum error_code
omx_parameter_camera_device_number(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nU32)
{
    OMX_PARAM_U32TYPE dev_st; OMX_INIT_STRUCTURE (dev_st);

    dev_st.nPortIndex = nPortIndex;
    dev_st.nU32       = nU32;       //ID for the camera device

    return omx_set_parameter(hComponent, OMX_IndexParamCameraDeviceNumber, &dev_st);
}

/*****************************************************************************/

enum error_code
omx_parameter_qfactor(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nQFactor)
{
    OMX_IMAGE_PARAM_QFACTORTYPE quality; OMX_INIT_STRUCTURE (quality);

    quality.nPortIndex = nPortIndex;
    quality.nQFactor   = nQFactor;

    return omx_set_parameter(hComponent, OMX_IndexParamQFactor, &quality);
}

/*****************************************************************************/

enum error_code
omx_parameter_brcm_exif(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_BOOL       bEnabled)
{
    OMX_CONFIG_BOOLEANTYPE exif; OMX_INIT_STRUCTURE (exif);

    exif.bEnabled = bEnabled;

    return omx_set_parameter(hComponent, OMX_IndexParamBrcmDisableEXIF, &exif);
}

/*****************************************************************************/

enum error_code
omx_parameter_brcm_ijg_scaling(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bEnabled)
{
    OMX_PARAM_IJGSCALINGTYPE ijg; OMX_INIT_STRUCTURE (ijg);

    ijg.nPortIndex = nPortIndex;
    ijg.bEnabled   = bEnabled;

    return omx_set_parameter(hComponent, OMX_IndexParamBrcmEnableIJGTableScaling, &ijg);
}

/*****************************************************************************/

enum error_code
omx_parameter_brcm_thumbnail(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        bEnable,
        OMX_IN OMX_U32        bUsePreview,
        OMX_IN OMX_U32        nWidth,
        OMX_IN OMX_U32        nHeight)
{
    OMX_PARAM_BRCMTHUMBNAILTYPE thumbnail; OMX_INIT_STRUCTURE (thumbnail);

    thumbnail.bEnable     = bEnable;
    thumbnail.bUsePreview = bUsePreview;
    thumbnail.nWidth      = nWidth;
    thumbnail.nHeight     = nHeight;

    return omx_set_parameter(hComponent, OMX_IndexParamBrcmThumbnail, &thumbnail);
}

/*****************************************************************************/

enum error_code
omx_parameter_brcm_disable_proprietary_tunnels(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        bUseBuffers)
{
    OMX_PARAM_BRCMDISABLEPROPRIETARYTUNNELSTYPE tunels_type; OMX_INIT_STRUCTURE (tunels_type);

    tunels_type.nPortIndex  = nPortIndex;

    tunels_type.bUseBuffers = bUseBuffers;

    return omx_set_parameter(hComponent, OMX_IndexParamBrcmDisableProprietaryTunnels, &tunels_type);
}

/*****************************************************************************/

enum error_code
omx_parameter_port_max_frame_size(
    OMX_IN OMX_HANDLETYPE hComponent,
    OMX_IN OMX_INDEXTYPE  nPortIndex,
    OMX_IN OMX_U32        nWidth,
    OMX_IN OMX_U32        nHeight)
{
    OMX_FRAMESIZETYPE frame_size; OMX_INIT_STRUCTURE (frame_size);

    frame_size.nPortIndex = nPortIndex;

    frame_size.nWidth  = nWidth;
    frame_size.nHeight = nHeight;

    return omx_set_parameter(hComponent, OMX_IndexParamPortMaxFrameSize, &frame_size);
}


/*****************************************************************************/

