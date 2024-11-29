import UIMethod from '../uitypes'

export const corMethods:UIMethod[] = [
    {
      id: "find_center_vo",
      methodName: "find COR using Naghia Vo's method ",
      linkToDoc:
        "https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.rotation.html#tomopy.recon.rotation.find_center_vo",
      parameters: {
        ind: ["int",false,"Index of the slice to be used for reconstruction", null],
        smin: ["int",false ,"Coarse search radius", -50],
        smax: ["int", false,"Coarse search radius", 50],
        srad: ["float", false,"Fine search radius", 6],
        step: ["float", false,"Step of fine searching", 0.25],
        ratio: [
          "float",
          false,
          "The ratio between the FOV of the camera and the size of object",
          0.5,
        ],
        drop: ["int",false, "Drop lines around vertical center of the mask", 20],
        ncore: ["int",false, "Number of cores that will be assigned to jobs", null],
      },
    },
    {
      id: "find_center_pc",
      methodName: "find COR using phase correlation in Fourier space",
      linkToDoc:
        "https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.rotation.html#tomopy.recon.rotation.find_center_pc",
      parameters: {
          "proj1":["string",false,"2D projection data","auto"],
          "proj2":["string",false,"2D projection data","auto"],
          "tol":["float",false,"Subpixel accuracy",0.5],
          "rotc_guess":["float",false,"Initual guess value for the rotation center",null]
      },
    },
];

export const normalisationMethods:UIMethod[] = [
    {
        id: "normalize",
        methodName: "normalize",
        linkToDoc: "https://tomopy.readthedocs.io/en/stable/api/tomopy.prep.normalize.html#tomopy.prep.normalize.normalize",
        parameters: {
            "cutoff":["float",false,"Permitted maximum vlaue for the normalized data",null],
            "averaging":["string",false,"‘mean’ or ‘median’, how the flat and dark arrays should be averaged","mean"]
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

export const reconstructionMethods:UIMethod[] = [
  {
    id: "recon",
    methodName: "Reconstruction job",
    linkToDoc: "https://tomopy.readthedocs.io/en/stable/api/tomopy.recon.algorithm.html#tomopy.recon.algorithm.recon",
    parameters: {
      "algorithm" : ["list",true,"Reconstruction algorithm (see method docs for more info)"," ",["art","bart","fbp","gridrec","mlem","osem","ospml_hybrid","ospml_quad","pml_hybrid","pml_quad","sirt","tv","grad","tikh"]],
      "singoram_order" : ["bool",false,"Determins whether data is a stack of sinograms (True, y-axis first axis) or a stack of radiographs (False, theta first axis)",false]
    }
  }
]