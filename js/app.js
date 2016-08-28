require([
  "esri/Map",
  "esri/views/MapView",

  "esri/geometry/Point",
  "esri/geometry/Extent",
  "esri/symbols/PictureMarkerSymbol",
  "esri/Graphic",
  "esri/PopupTemplate",

  "esri/layers/FeatureLayer",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "esri/renderers/ClassBreaksRenderer",

  "esri/widgets/Legend",
  "esri/widgets/Home",
  "esri/widgets/BasemapToggle",
  "esri/views/ui/UI",

  "esri/config",

  "dojo/domReady!"
], function(Map, MapView,
  Point, Extent, PictureMarkerSymbol, Graphic, PopupTemplate,
  FeatureLayer, SimpleFillSymbol, Color, ClassBreaksRenderer,
  Legend, Home, BasemapToggle, UI,
  esriConfig) {

  //esriConfig.corsDetection = false;

  var less35 = new SimpleFillSymbol({
        color: "#4da6ff",
        style: "solid",
        outline: {
          width: 0.5,
          color: "white"
        }
      });
      var less50 = new SimpleFillSymbol({
        color: "#0080ff",
        style: "solid",
        outline: {
          width: 0.5,
          color: "white"
        }
      });
      var more50 = new SimpleFillSymbol({
        color: "#0059b3",
        style: "solid",
        outline: {
          width: 0.5,
          color: "white"
        }
      });
      var more75 = new SimpleFillSymbol({
        color: "#003366",
        style: "solid",
        outline: {
          width: 0.5,
          color: "white"
        }
      });
      var renderer = new ClassBreaksRenderer({
        field: "HISPPOP_CY",
        normalizationField: "TOTPOP",
        defaultSymbol: new SimpleFillSymbol({
          color: [217, 217, 217, .5],
          outline: {
            width: 0.5,
            color: "white"
          }
        }),
        defaultLabel: "no data",
        classBreakInfos: [
        {
          minValue: 0,
          maxValue: 0.3499,
          symbol: less35,
          label: "< 35%"
        }, {
          minValue: 0.35,
          maxValue: 0.4999,
          symbol: less50,
          label: "35 - 50%"
        }, {
          minValue: 0.50,
          maxValue: 0.7499,
          symbol: more50,
          label: "50 - 75%"
        }, {
          minValue: 0.75,
          maxValue: 1.00,
          symbol: more75,
          label: "> 75%"
        }]
      });

  var southernTexas = new FeatureLayer({
    url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/pop_growth_south_texas/FeatureServer/0",
    renderer: renderer,
    outFields: ["COUNTY", "HISPPOP_CY", "TOTPOP"],
    popupTemplate: {
      title: "{COUNTY}",
      content: "Hispanic Population: {HISPPOP_CY} and Total Population: {TOTPOP}"
    }
  });

//init the web map and the map's view
  map = new Map({
    basemap: "streets",
    layers: [southernTexas]
  });
  mainView = new MapView({
    container: "map",
    map: map,
    zoom: 8,
    center: [-98.09834411620189, 27.03680088987091],
    popup: {
          dockEnabled: true,
          dockOptions: {
            // Disables the dock button from the popup
            buttonEnabled: false,
            // Ignore the default sizes that trigger responsive docking
            breakpoint: false,
            position: "bottom-center"
          }
        }
  });

  var texasLegend = new Legend({
    view: mainView,
    layerInfos: [{
      layer: southernTexas,
      title: "Hispanic Population Divided by Total Population"
    }]
  });
mainView.ui.add(texasLegend, "bottom-left");

//Toggle basemap widget
  var toggleBasemap = new BasemapToggle({
    view: mainView,
    nextBasemap: "topo"
  });
  mainView.ui.add(toggleBasemap, "bottom-right");
  toggleBasemap.startup();

//Creating the Blue Raster Office Graphic
  var brOffice = new Point({
    latitude: 38.890849,
    longitude: -77.086213,
    extent: new Extent({
      xmin: -8582655.61,
      ymin: 4704861.36,
      xmax: -8578652.22,
      ymax: 4707727.75
    })
  });
  var brPictureSymbol = new PictureMarkerSymbol({
    url: "https://pbs.twimg.com/profile_images/462243963345186816/jGsFjbtb.jpeg",
    height: 45,
    width: 45
  });
  var brAttr = {
    name: "Blue Raster",
    address: "2200 Wilson Blvd, Ste 400, Arlington VA, 22201",
    motto: "Move beyond dots on a map"
  };
  var brGraphic = new Graphic({
    geometry: brOffice,
    symbol: brPictureSymbol,
    attributes: brAttr,
    popupTemplate: new PopupTemplate({
      title: "{name}",
      content: "Located at: {address} <br> Their motto is: {motto}"
    }),
    visible: true
  });

//UI element to recenter map to washington, dc
  var dcCenter = new Home();
  mainView.ui.add(dcCenter, "bottom-right");
  dcCenter.startup();
  dcCenter.on("click", goToDC);
  function goToDC(evt){
    mainView.goTo(
      {
      center: [-77.03, 38.91],
      zoom: 11
      },
      {
        animate: true,
        duration: 500
      }
    )
  };

//Add click event and shows a popup with coordinates
  mainView.on("click", addPoint);

  function addPoint(evt){
    var latitude = evt.mapPoint.getLatitude();
    var longitude = evt.mapPoint.getLongitude();
    mainView.popup.open({
      title: "Coordinates",
      content: "Latitude: " + latitude.toFixed(2) + ", Longitude: " + longitude.toFixed(2),
      location: evt.mapPoint
    });
  };

//add the blue raster office graphic when scale is close enough
  mainView.watch("viewpoint.scale", function(newScale, oldScale){
    if (newScale <= 35000) {
      mainView.graphics.add(brGraphic);
    }
    if (newScale > 65000) {
      mainView.graphics.remove(brGraphic);
    }
  });


  document.getElementById("br-logo").addEventListener("click", goToOffice);

  function goToOffice(){
    mainView.goTo(
        {
        center: [-77.08614862698474, 38.890812860154256],
        zoom: 19
        },
        {
          animate: true,
          duration: 500
        }
      )
  };

});