# TomoHub 
Tomohub is a graphical tool created with React and FastAPI for users to generate and configure YAML processlists for running [HTTOMO](https://diamondlightsource.github.io/httomo/index.html) pacakge.
## Purpose of Tomohub
In order to run a reconstruction jobs with HTTOMO package, you need to have your data and a processlist (pipeline), these processlists are
basically YAML files with different methods and parameters for the reconstruction job, with tomohub you can generate these processlists without editting
the YAML files directly 
## Usage
In order to generate functional processlists, you need to at first select and set fields for the loader section and then,
select and modify your required methods to run your reconstruction job
### Loader
- Configuring the loader for your pipeline is the first essential step to make a processlist, tomohub uses the standard_tomo_loader [see more](https://diamondlightsource.github.io/httomo/reference/loaders.html)
- previewing feature allows you to change the dimensions of the input data by reducing them, in another way is a way to crop your data before the reconstruction job happens [see more](https://diamondlightsource.github.io/httomo/howto/httomo_features/previewing.html)
  you can select this fetature by clicking on the "Enable preview" button in the Loader section and select a range to crop in both X and Y axises 
### methods
- Tomohub contains all the method from both [httomolib](https://github.com/DiamondLightSource/httomolib) and [httomolibgpu](https://github.com/DiamondLightSource/httomolibgpu) libraries, after setting your Loader, it's needed to select a set of methods for your reconstruction job, a good approach to do so is by following the order of the vertical tab on left 
- You can see the list of your methods in the pipeline on the right side bar, you can remove/edit your selected methods and you can also reorder your methods in the processlist by drag and dropping them
### parameter sweeping 
- HTTOMO supports parameter sweeping feature, sweeping in this context means you can set more than one value for a parameter in your selected methods [see more](https://diamondlightsource.github.io/httomo/howto/httomo_features/parameter_sweeping.html)
- in order to select sweeping for a parameter, select GEAR_ICON next the parameter input, then simply select your values for your sweeping in the opened pop-up window
- keep in mind as HTTOMO only allows one parameter sweeping per pipeline, you are only allowed to select 1 sweeping per processlist as well
### ready to use pipelines
you can select a ready to use pipelines as well, simply select your pipeline from the "Ready to use piplines"
### Download your processlist
after setting loader and selecting your methods, you can name download your config file and use it with HTTOMO
