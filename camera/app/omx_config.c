#include "omx_config.h"

#include "omx.h"

/*****************************************************************************/

enum error_code
omx_config_sharpness(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nSharpness)
{
    OMX_CONFIG_SHARPNESSTYPE sharpness_st; OMX_INIT_STRUCTURE(sharpness_st);

    sharpness_st.nPortIndex = nPortIndex;
    sharpness_st.nSharpness = nSharpness;

    return omx_set_config(hComponent, OMX_IndexConfigCommonSharpness, &sharpness_st);
}

/*****************************************************************************/

enum error_code
omx_config_contrast(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nContrast)
{
    OMX_CONFIG_CONTRASTTYPE contrast_st; OMX_INIT_STRUCTURE (contrast_st);

    contrast_st.nPortIndex = nPortIndex;
    contrast_st.nContrast  = nContrast;

    return omx_set_config(hComponent, OMX_IndexConfigCommonContrast, &contrast_st);
}

/*****************************************************************************/

enum error_code
omx_config_saturation(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nSaturation)
{
    OMX_CONFIG_SATURATIONTYPE saturation_st; OMX_INIT_STRUCTURE (saturation_st);

    saturation_st.nPortIndex  = nPortIndex;
    saturation_st.nSaturation = nSaturation;

    return omx_set_config(hComponent, OMX_IndexConfigCommonSaturation, &saturation_st);
}

/*****************************************************************************/

enum error_code
omx_config_brightness(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nBrightness)
{
    OMX_CONFIG_BRIGHTNESSTYPE brightness_st; OMX_INIT_STRUCTURE (brightness_st);

    brightness_st.nPortIndex  = nPortIndex;
    brightness_st.nBrightness = nBrightness;

    return omx_set_config(hComponent, OMX_IndexConfigCommonBrightness, &brightness_st);
}

/*****************************************************************************/

enum error_code
omx_config_exposure_value(
        OMX_IN OMX_HANDLETYPE   hComponent,
        OMX_U32                 nPortIndex,
        OMX_IN OMX_METERINGTYPE eMetering,
        OMX_IN OMX_S32          xEVCompensation,
        OMX_IN OMX_U32          nApertureFNumber,
        OMX_IN OMX_BOOL         bAutoAperture,
        OMX_IN OMX_U32          nShutterSpeedMsec,
        OMX_IN OMX_BOOL         bAutoShutterSpeed,
        OMX_IN OMX_U32          nSensitivity,
        OMX_IN OMX_BOOL         bAutoSensitivity)
{
    OMX_CONFIG_EXPOSUREVALUETYPE exposure_value_st; OMX_INIT_STRUCTURE (exposure_value_st);

    exposure_value_st.nPortIndex        = nPortIndex;
    exposure_value_st.eMetering         = eMetering;
    exposure_value_st.xEVCompensation   = xEVCompensation;
    exposure_value_st.nApertureFNumber  = nApertureFNumber;
    exposure_value_st.bAutoAperture     = bAutoAperture;
    exposure_value_st.nShutterSpeedMsec = nShutterSpeedMsec;
    exposure_value_st.bAutoShutterSpeed = bAutoShutterSpeed;
    exposure_value_st.nSensitivity      = nSensitivity;
    exposure_value_st.bAutoSensitivity  = bAutoSensitivity;

    return omx_set_config(hComponent, OMX_IndexConfigCommonExposureValue, &exposure_value_st);
}

/*****************************************************************************/

enum error_code
omx_config_exposure(
        OMX_IN OMX_HANDLETYPE          hComponent,
        OMX_IN OMX_U32                 nPortIndex,
        OMX_IN OMX_EXPOSURECONTROLTYPE eExposureControl)
{
    OMX_CONFIG_EXPOSURECONTROLTYPE exposure_control_st; OMX_INIT_STRUCTURE (exposure_control_st);

    exposure_control_st.nPortIndex       = nPortIndex;
    exposure_control_st.eExposureControl = eExposureControl;

    return omx_set_config(hComponent, OMX_IndexConfigCommonExposure, &exposure_control_st);
}

/*****************************************************************************/

enum error_code
omx_config_frame_stabilisation(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bStab)
{
    OMX_CONFIG_FRAMESTABTYPE frame_stabilisation_st; OMX_INIT_STRUCTURE (frame_stabilisation_st);

    frame_stabilisation_st.nPortIndex = nPortIndex;
    frame_stabilisation_st.bStab      = bStab;

    return omx_set_config(hComponent, OMX_IndexConfigCommonFrameStabilisation, &frame_stabilisation_st);
}

/*****************************************************************************/

enum error_code
omx_config_white_balance(
        OMX_IN OMX_HANDLETYPE   hComponent,
        OMX_IN OMX_U32          nPortIndex,
        OMX_WHITEBALCONTROLTYPE eWhiteBalControl)
{
    OMX_CONFIG_WHITEBALCONTROLTYPE white_balance_st; OMX_INIT_STRUCTURE (white_balance_st);

    white_balance_st.nPortIndex       = nPortIndex;
    white_balance_st.eWhiteBalControl = eWhiteBalControl;

    return omx_set_config(hComponent, OMX_IndexConfigCommonWhiteBalance, &white_balance_st);
}

/*****************************************************************************/

enum error_code
omx_config_white_balance_gains(
        OMX_IN OMX_HANDLETYPE   hComponent,
        OMX_IN OMX_U32          xGainR,
        OMX_IN OMX_U32          xGainB)
{
        OMX_CONFIG_CUSTOMAWBGAINSTYPE white_balance_gains_st; OMX_INIT_STRUCTURE (white_balance_gains_st);

        white_balance_gains_st.xGainR = xGainR;
        white_balance_gains_st.xGainB = xGainB;

        return omx_set_config(hComponent, OMX_IndexConfigCustomAwbGains, &white_balance_gains_st);
}

/*****************************************************************************/

enum error_code
omx_config_image_filter(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IMAGEFILTERTYPE   eImageFilter)
{
    OMX_CONFIG_IMAGEFILTERTYPE image_filter_st; OMX_INIT_STRUCTURE (image_filter_st);

    image_filter_st.nPortIndex   = nPortIndex;
    image_filter_st.eImageFilter = eImageFilter;

    return omx_set_config(hComponent, OMX_IndexConfigCommonImageFilter, &image_filter_st);
}

/*****************************************************************************/

enum error_code
omx_config_mirror(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_MIRRORTYPE        eMirror)
{
    OMX_CONFIG_MIRRORTYPE mirror_st; OMX_INIT_STRUCTURE (mirror_st);

    mirror_st.nPortIndex = nPortIndex;
    mirror_st.eMirror    = eMirror;

    return omx_set_config(hComponent, OMX_IndexConfigCommonMirror, &mirror_st);
}

/*****************************************************************************/

enum error_code
omx_config_rotation(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_S32        nRotation)
{
    OMX_CONFIG_ROTATIONTYPE rotation_st; OMX_INIT_STRUCTURE (rotation_st);

    rotation_st.nPortIndex = nPortIndex;
    rotation_st.nRotation  = nRotation;

    return omx_set_config(hComponent, OMX_IndexConfigCommonRotate, &rotation_st);
}

/*****************************************************************************/

enum error_code
omx_config_color_enhancement(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bColorEnhancement,
        OMX_IN OMX_U8         nCustomizedU,
        OMX_IN OMX_U8         nCustomizedV)
{
    OMX_CONFIG_COLORENHANCEMENTTYPE color_enhancement_st; OMX_INIT_STRUCTURE (color_enhancement_st);

    color_enhancement_st.nPortIndex        = nPortIndex;
    color_enhancement_st.bColorEnhancement = bColorEnhancement;
    color_enhancement_st.nCustomizedU      = nCustomizedU;
    color_enhancement_st.nCustomizedV      = nCustomizedV;

    return omx_set_config(hComponent, OMX_IndexConfigCommonColorEnhancement, &color_enhancement_st);
}

/*****************************************************************************/

enum error_code
omx_config_denoise(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_BOOL       bEnabled)
{
    OMX_CONFIG_BOOLEANTYPE denoise_st; OMX_INIT_STRUCTURE (denoise_st);

    denoise_st.bEnabled = bEnabled;

    return omx_set_config(hComponent, OMX_IndexConfigStillColourDenoiseEnable, &denoise_st);
}

/*****************************************************************************/

enum error_code
omx_config_input_crop_percentage(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        xLeft,
        OMX_IN OMX_U32        xTop,
        OMX_IN OMX_U32        xWidth,
        OMX_IN OMX_U32        xHeight)
{
    OMX_CONFIG_INPUTCROPTYPE roi_st; OMX_INIT_STRUCTURE (roi_st);

    roi_st.nPortIndex = nPortIndex;
    roi_st.xLeft      = xLeft;
    roi_st.xTop       = xTop;
    roi_st.xWidth     = xWidth;
    roi_st.xHeight    = xHeight;

    return omx_set_config(hComponent, OMX_IndexConfigInputCropPercentages, &roi_st);
}

/*****************************************************************************/

enum error_code
omx_config_dynamic_range_expansion(
        OMX_IN OMX_HANDLETYPE                    hComponent,
        OMX_IN OMX_DYNAMICRANGEEXPANSIONMODETYPE eMode)
{
    OMX_CONFIG_DYNAMICRANGEEXPANSIONTYPE drc_st; OMX_INIT_STRUCTURE (drc_st);

    drc_st.eMode = eMode;

    return omx_set_config(hComponent, OMX_IndexConfigDynamicRangeExpansion, &drc_st);
}

/*****************************************************************************/

enum error_code
omx_config_port_capturing(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_BOOL       bEnabled)
{
    OMX_CONFIG_PORTBOOLEANTYPE cameraCapturePort; OMX_INIT_STRUCTURE (cameraCapturePort);

    cameraCapturePort.nPortIndex = nPortIndex;
    cameraCapturePort.bEnabled   = bEnabled;

    return omx_set_config(hComponent, OMX_IndexConfigPortCapturing, &cameraCapturePort);
}

/*****************************************************************************/

enum error_code
omx_config_request_callback(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_INDEXTYPE  nIndex,
        OMX_IN OMX_BOOL       bEnable)
{
    OMX_CONFIG_REQUESTCALLBACKTYPE cbs_st; OMX_INIT_STRUCTURE (cbs_st);

    cbs_st.nPortIndex = nPortIndex;
    cbs_st.nIndex     = nIndex;
    cbs_st.bEnable    = bEnable;

    return omx_set_config(hComponent, OMX_IndexConfigRequestCallback, &cbs_st);
}

/*****************************************************************************/

enum error_code
omx_config_metadata_item(
        OMX_IN OMX_HANDLETYPE        hComponent,
        OMX_IN OMX_METADATASCOPETYPE eScopeMode,
        OMX_IN OMX_U32               nScopeSpecifier,
        OMX_IN char                 *nKey,
        OMX_IN char                 *nValue)
{
    size_t key_length = strlen(nKey);
    size_t value_length = strlen(nValue);

    struct
    {
        //These two fields need to be together
        OMX_CONFIG_METADATAITEMTYPE metadata_st;
        char metadata_padding[value_length];
    } item;

    OMX_INIT_STRUCTURE (item.metadata_st);

    item.metadata_st.nSize           = sizeof(item);
    item.metadata_st.eScopeMode      = eScopeMode;
    item.metadata_st.nScopeSpecifier = nScopeSpecifier;
    item.metadata_st.eKeyCharset     = OMX_MetadataCharsetASCII;
    item.metadata_st.nKeySizeUsed    = key_length;
    memcpy(item.metadata_st.nKey, nKey, key_length);
    item.metadata_st.eValueCharset  = OMX_MetadataCharsetASCII;
    item.metadata_st.nValueMaxSize  = sizeof(item.metadata_padding);
    item.metadata_st.nValueSizeUsed = value_length;
    memcpy(item.metadata_st.nValue, nValue, value_length);

    return omx_set_config(hComponent, OMX_IndexConfigMetadataItem, &item);
}

/*****************************************************************************/

enum error_code
omx_config_singlestep(
        OMX_IN OMX_HANDLETYPE hComponent,
        OMX_IN OMX_U32        nPortIndex,
        OMX_IN OMX_U32        nSteps)
{
    OMX_PARAM_U32TYPE param; OMX_INIT_STRUCTURE(param);

    param.nPortIndex = nPortIndex;
    param.nU32       = nSteps;

    return omx_set_config(hComponent, OMX_IndexConfigSingleStep, &param);
}

/*****************************************************************************/

