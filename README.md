# TomoHub 
Tomohub is a graphical tool created with React and FastAPI to generate and configure YAML processlists for [HTTOMO](https://diamondlightsource.github.io/httomo/index.html) pacakge and using React Relay and [Workflows](https://github.com/DiamondLightSource/workflows), it's able to run high throughput tomography jobs using [HTTOMO](https://diamondlightsource.github.io/httomo/index.html) as well.

## How to use
In order to run a tomography reconstruction jobs with HTTOMO package, you need to have your data and a processlist (pipeline), these processlists are
basically YAML files with different methods and parameters for the reconstruction job, with both deployment and local versions of tomohub you are able generate these processlists without editting the YAML files directly and then simply download your config files and use them in order to run HTTOMO.
beside generating config files, the local version is able to run HTTOMO jobs as well, after selecting your desired methods (or if you have your own config file as well), you can run HTTOMO by clicking on "Run HTTOMO (Local)" button 
### cor finder tool
the main available feature on the local version is COR finder tool, with this tool based on the [parameter sweeping](#parameter-sweeping) feature of HTTOMO, users are able to run a reconstruction job with either of gdric or FBP algorithms and a range of values for centre of rotation, in the result, users can see final png output of the reconstruction job and they can use the slider to see different outputs and select their desired one, this feture is currently implemented with power of workflows.
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

## Setting up developer environment

### Clone the repo

```
git clone https://github.com/DiamondLightSource/TomoHub
```

### Setup frontend

#### Add local env file

In `frontend/`, add an `.env.local` file with the following contents:
```
VITE_API_BASE_URL = "http://localhost:8000"
VITE_KEYCLOAK_URL = "https://authn.diamond.ac.uk/"
VITE_KEYCLOAK_REALM = "master"
VITE_KEYCLOAK_CLIENT_ID = "tomohub-dev"
```

#### Install dependencies and generate code from GraphQL schema

```
cd Tomohub/frontend
npm i
npm run relay
npm run dev
```

### Setup backend

```
cd Tomohub/backend
pip install -r requirements.txt
pip install httomolibgpu --no-deps
pip install httomo_backends --no-deps
uvicorn main:app --reload
```
