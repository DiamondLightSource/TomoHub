import Method from '../types'

export const corMethods:Method[] = [
    {
      id: "find_center_vo",
      methodName: "find COR using Naghia Vo's method ",
      linkToDoc:
        "https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.rotation.html#tomopy.recon.rotation.find_center_vo",
      parameters: {
        ind: ["int", "Index of the slice to be used for reconstruction", null],
        smin: ["int", "Coarse search radius", -50],
        smax: ["int", "Coarse search radius", 50],
        srad: ["float", "Fine search radius", 6],
        step: ["float", "Step of fine searching", 0.25],
        ratio: [
          "float",
          "The ratio between the FOV of the camera and the size of object",
          0.5,
        ],
        drop: ["int", "Drop lines around vertical center of the mask", 20],
        ncore: ["int", "Number of cores that will be assigned to jobs", null],
      },
    },
    {
      id: "find_center_pc",
      methodName: "find COR using phase correlation in Fourier space",
      linkToDoc:
        "https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.rotation.html#tomopy.recon.rotation.find_center_pc",
      parameters: {
          "proj1":["string","2D projection data","auto"],
          "proj2":["string","2D projection data","auto"],
          "tol":["float","Subpixel accuracy",0.5],
          "rotc_guess":["float","Initual guess value for the rotation center",null]
      },
    },
];

export const normalisationMethods:Method[] = [
    {
        id: "normalize",
        methodName: "normalize",
        linkToDoc: "https://tomopy.readthedocs.io/en/stable/api/tomopy.prep.normalize.html#tomopy.prep.normalize.normalize",
        parameters: {
            "cutoff":["float","Permitted maximum vlaue for the normalized data",null],
            "averaging":["string","‘mean’ or ‘median’, how the flat and dark arrays should be averaged","mean"]
        }
    }
    ,
    {
        id:"minus_log",
        methodName: "minus",
        linkToDoc: "https://tomopy.readthedocs.io/en/stable/api/tomopy.prep.normalize.html#tomopy.prep.normalize.minus_log",
        parameters:{
          
         }
    }
]