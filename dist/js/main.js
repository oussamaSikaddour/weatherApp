import CurrentLocation from "./CurrentLocation.js";

import {
  setPlaceHolderText,
  addSpinner,
  displayError,
  displayApiError,
  updateScreenReaderConfirmation,
  updateDisplay,
} from "./domFunctions.js";
import {
  getGoordsFromApi,
  getWeaherFromCoords,
  setLocationObject,
  getHomeLocation,
  cleanText,
} from "./dataFunctions.js";
const currentLoc = new CurrentLocation();

const initApp = () => {
  //add listteners
  const geoButton = document.getElementById("getLocation");
  geoButton.addEventListener("click", getGeoWeather);
  const homeButton = document.getElementById("home");
  homeButton.addEventListener("click", loadWeather);
  const saveButton = document.getElementById("saveLocation");
  saveButton.addEventListener("click", saveLocation);
  const unitButton = document.getElementById("unit");
  unitButton.addEventListener("click", setUnitPref);
  const refreshButton = document.getElementById("refersh");
  refreshButton.addEventListener("click", refreshWeather);
  const locationEntry = document.getElementById("searchBar__form");
  locationEntry.addEventListener("submit", submitNewLocationWeather);
  // set up
  setPlaceHolderText();
  //load weather
  loadWeather();
};

const getGeoWeather = (e) => {
  if (e) {
    if (e.type === "click") {
      // add spinner
      const mapIcon = document.querySelector(".fa-map-marker-alt");
      addSpinner(mapIcon);
    }
    if (!navigator.geolocation) geoError();
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
  }
};

const geoError = (errObj) => {
  const errMsg = errObj.message ? errObj.message : "Geoloaction not supported";
  displayError(errMsg, errMsg);
};
const geoSuccess = (position) => {
  const myCoordsObj = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
    name: `Lat:${position.coords.latitude} Long:${position.coords.longitude}`,
  };
  // set Location Object
  setLocationObject(currentLoc, myCoordsObj);

  updateDataAndDisplay(currentLoc);
};

const loadWeather = (e) => {
  const savedLocation = getHomeLocation();
  if (!savedLocation && !e) return getGeoWeather();
  if (!savedLocation && e.type === "click") {
    displayError(
      "no home location saved",
      "Sorry.Please save you home location first"
    );
  } else if (savedLocation && !e) {
    displayHomeLocationWeather(savedLocation);
  } else {
    const homeIcon = document.querySelector(".fa-home");
    addSpinner(homeIcon);
    displayHomeLocationWeather(savedLocation);
  }
};

const displayHomeLocationWeather = (home) => {
  if (typeof home === "string") {
    const locationJson = JSON.parse(home);
    const myCoordsObj = {
      lat: locationJson.lat,
      lon: locationJson.lon,
      name: locationJson.name,
      unit: locationJson.unit,
    };
    setLocationObject(currentLoc, myCoordsObj);
    updateDataAndDisplay(currentLoc);
  }
};

const saveLocation = () => {
  if (currentLoc.getLat() && currentLoc.getLon()) {
    const saveIcon = document.querySelector(".fa-save");
    addSpinner(saveIcon);
    const location = {
      name: currentLoc.getName(),
      lat: currentLoc.getLat(),
      lon: currentLoc.getLon(),
      unit: currentLoc.getUnit(),
    };
    localStorage.setItem("defaultWeaherLocation", JSON.stringify(location));
    updateScreenReaderConfirmation(
      `Saved ${currentLoc.getName()} as home Location`
    );
  }
};

const setUnitPref = () => {
  const unitIcon = document.querySelector(".fa-chart-bar");
  addSpinner(unitIcon);
  currentLoc.toggleUnit();
  updateDataAndDisplay(currentLoc);
};
const refreshWeather = () => {
  const refreshIcon = document.querySelector(".fa-sync-alt");
  addSpinner(refreshIcon);
  updateDataAndDisplay(currentLoc);
};

const submitNewLocationWeather = async (e) => {
  e.preventDefault();
  const text = document.getElementById("searchBar__text").value;
  const entryText = cleanText(text);
  if (!entryText.length) return;
  const locationIcon = document.querySelector(".fa-search");
  addSpinner(locationIcon);
  const coordsData = await getGoordsFromApi(entryText, currentLoc.getUnit());
  //work with api data
  if (coordsData) {
    if (coordsData.cod === 200) {
      //Work with api data
      //success
      const myCoordsObj = {
        lat: coordsData.coord.lat,
        lon: coordsData.coord.lon,
        name: coordsData.sys.country
          ? `${coordsData.name},${coordsData.sys.country}`
          : coordsData.name,
      };
      setLocationObject(currentLoc, myCoordsObj);
      updateDataAndDisplay(currentLoc);
    } else {
      displayApiError(coordsData);
    }
  } else {
    displayError("connection Error", "Connection Error");
  }
};

document.addEventListener("DOMContentLoaded", initApp);

const updateDataAndDisplay = async (locationObj) => {
  const weatherJson = await getWeaherFromCoords(locationObj);

  if (weatherJson) updateDisplay(weatherJson, locationObj);
};
