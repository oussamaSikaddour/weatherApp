export const setLocationObject = (locationObj, coordsObj) => {
  const { lat, lon, name, unit } = coordsObj;
  locationObj.setLat(lat);
  locationObj.setLon(lon);
  locationObj.setName(name);
  if (unit) {
    locationObj.setUnit(unit);
  }
};
export const getHomeLocation = () => {
  return localStorage.getItem("defaultWeaherLocation");
};
export const getWeaherFromCoords = async (locationObj) => {
  const urlDataObj = {
    lat: locationObj.getLat(),
    lon: locationObj.getLon(),
    units: locationObj.getUnit(),
  };
  try {
    const weatherStream = await fetch(`./.netlify/functons/get_weather`, {
      method: "POST",
      body: JSON.stringify(urlDataObj),
    });
    const weatherJson = await weatherStream.json();
    return weatherJson;
  } catch (error) {
    console.error(error);
  }
};
export const getGoordsFromApi = async (entryText, units) => {
  // const regex = /^\d+$/g;
  // const flag = regex.test(entryText) ? "zip" : "q";
  // const url = `https://api.openweathermap.org/data/2.5/weather?${flag}=${entryText}&units=${units}&appid=${WEATHER_API_KEY}`;
  // const encodedUrl = encodeURI(url);
  // try {
  //   const dataStream = await fetch(encodedUrl);
  //   const jasonData = await dataStream.json();

  //   return jasonData;
  // } catch {
  //   console.log(err.stack);
  // }
  const urlDataObj = {
    text: entryText,
    units: units,
  };
  try {
    const dataStream = await fetch("./.netlify/functions/get_coords", {
      method: "POST",
      body: JSON.stringify(urlDataObj),
    });
    const jsonData = await dataStream.json();
    return jsonData;
  } catch (err) {
    console.error(err);
  }
};
export const cleanText = (text) => {
  const regex = / {2,}/g;
  const entryText = text.replaceAll(regex, " ").trim();
  return entryText;
};
