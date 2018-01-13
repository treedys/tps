#include "omx_config.h"

#include "omx.h"

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_camera_device_number(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nU32) {

    OMX_PARAM_U32TYPE dev_st; OMX_INIT_STRUCTURE (dev_st);

    dev_st.nPortIndex = nPortIndex;
    dev_st.nU32       = nU32;       //ID for the camera device

    return omx_set_parameter(hComponent, OMX_IndexParamCameraDeviceNumber, &dev_st);
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_qfactor(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nQFactor) {

    OMX_IMAGE_PARAM_QFACTORTYPE quality; OMX_INIT_STRUCTURE (quality);

    quality.nPortIndex = nPortIndex;
    quality.nQFactor   = nQFactor;

    return omx_set_parameter(hComponent, OMX_IndexParamQFactor, &quality);
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_brcm_exif(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_BOOL       bEnabled) {

    OMX_CONFIG_BOOLEANTYPE exif; OMX_INIT_STRUCTURE (exif);

    exif.bEnabled = bEnabled;

    return omx_set_parameter(hComponent, OMX_IndexParamBrcmDisableEXIF, &exif);
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_brcm_ijg_scaling(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bEnabled) {

    OMX_PARAM_IJGSCALINGTYPE ijg; OMX_INIT_STRUCTURE (ijg);

    ijg.nPortIndex = nPortIndex;
    ijg.bEnabled   = bEnabled;

    return omx_set_parameter(hComponent, OMX_IndexParamBrcmEnableIJGTableScaling, &ijg);
}

/*****************************************************************************/

OMX_API OMX_ERRORTYPE OMX_APIENTRY
omx_parameter_brcm_thumbnail(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        bEnable,
        OMX_IN OMX_U32        bUsePreview,
        OMX_IN OMX_U32        nWidth,
        OMX_IN OMX_U32        nHeight) {

    OMX_PARAM_BRCMTHUMBNAILTYPE thumbnail; OMX_INIT_STRUCTURE (thumbnail);

    thumbnail.bEnable     = bEnable;
    thumbnail.bUsePreview = bUsePreview;
    thumbnail.nWidth      = nWidth;
    thumbnail.nHeight     = nHeight;

    return omx_set_parameter(hComponent, OMX_IndexParamBrcmThumbnail, &thumbnail);
}

/*****************************************************************************/

