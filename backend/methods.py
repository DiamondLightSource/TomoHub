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
    }
}

standard_tomo_loader = {
    "httomo.data.hdf.loaders": {  # Module name as the key
        "standard_tomo": {  # Method name as the key
            "method_name": "standard_tomo",
            "module_path": "httomo.data.hdf.loaders",
            "method_desc": "",
            "method_doc": "",
            "parameters": {
                "data_path": {
                    "type": "str",
                    "value": "/entry1/tomo_entry/data/data",
                    "desc": "The data_path parameter is the path to the dataset in the input hdf5/NeXuS file containing the image data"
                },
                "image_key_path": {
                    "type": "str",
                    "value": "/entry1/tomo_entry/instrument/detector/image_key",
                    "desc": "The image_key_path parameter is the path to the dataset in the input hdf5/NeXuS file containing the so called “image key”."
                },
                "roation_angles": {
                    "type": "dict",
                    "value": {
                        "data_path": "/entry1/tomo_entry/data/rotation_angle",
                        "user_defined": {
                            "start_angle": 0,
                            "stop_angle": 180,
                            "angles_total": 724
                        }
                    },
                    "desc": ""
                },
                "darks": {
                    "type": "dict",
                    "value": {
                        "file": "tests/test_data/i12/separate_flats_darks/dark_field.h5",
                        "data_path": "/1-NoProcessPlugin-tomo/data",
                    },
                    "desc": ""
                },
                "flats": {
                    "type": "dict",
                    "value": {
                        "file": "tests/test_data/i12/separate_flats_darks/flat_field.h5",
                        "data_path": "/1-NoProcessPlugin-tomo/data",
                    },
                    "desc": ""
                }
            }
        }
    }
}