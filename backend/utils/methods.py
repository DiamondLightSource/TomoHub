METHOD_CATEGORIES = {
    "denoising-artefactsremoval": {
        "httomolibgpu.misc.corr": ["remove_outlier","median_filter"],
        "httomolibgpu.misc.denoise": ["total_variation_PD","total_variation_ROF"]
    },
    "image-saving": {
        "httomolib.misc.images": ["save_to_images"],
        "httomolibgpu.misc.rescale": ["rescale_to_int"]
    },
    "segmentation": {
        "httomolib.misc.segm": ["binary_thresholding"]
    },
    "morphological": {
        "httomolib.misc.morph": ["data_reducer"],
        "httomolibgpu.misc.morph": ["sino_360_to_180", "data_resampler"]
    },
    "normalization": {
        "httomolibgpu.prep.normalize": ["normalize"]
    },
    "phase-retrieval": {
        "httomolib.prep.phase": ["paganin_filter"],
        "httomolibgpu.prep.phase": ["paganin_filter_savu", "paganin_filter_tomopy"]
    },
    "stripe-removal": {
        "httomolibgpu.prep.stripe": [
            "remove_stripe_based_sorting",
            "remove_stripe_ti",
            "remove_all_stripe",
            "raven_filter"
        ]
    },
    "distortion-correction": {
        "httomolibgpu.prep.alignment": ["distortion_correction_proj_discorpy"]
    },
    "rotation-center": {
        "httomolibgpu.recon.rotation": [
            "find_center_vo",
            "find_center_360",
            "find_center_pc"
        ]
    },
    "reconstruction": {
        "httomolibgpu.recon.algorithm": ["FBP", "LPRec", "SIRT", "CGLS"]
    },
}
