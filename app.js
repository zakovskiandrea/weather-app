window.onload = () => {
  if (localStorage.getItem("cities")) {
    displaySavedCities();
  }

  getWeather("Skopje");
  getForecast("Skopje");
};
// Event Listener on ENTER key
document.querySelector(".input").addEventListener("keyup", function(e) {
  let textInput = "";
  if (e.code === "Enter") {
    textInput = document.querySelector(".input").value;

    getWeather(textInput);
    getForecast(textInput);
  }
});

// Event Listener on ADD FAVOURITE button
document.getElementById("heading").addEventListener("click", () => {
  // add city on UI
  let cityName = document.querySelector(".city").textContent;
  const cityList = document.querySelector("#fav-city");
  const city = document.createElement("div");
  city.className = "fav-city";
  let cities = localStorage.getItem("cities");
  cities = cities ? cities.split(",") : [];
  cityName = cityName.slice(0, cityName.lastIndexOf(","));
  if (cities.indexOf(cityName) > -1 || cities.length === 4) return;

  city.innerHTML = `${cityName}<i><img class="del-icon" src="/delete-icon.png" alt="del"/></i>`;
  cityList.appendChild(city);
  // save to LOCAL STORAGE

  cities.push(cityName);
  localStorage.setItem("cities", cities.join(","));

  console.log(cities.length);
});

// Event Listener on DELETE ICON button

document.body.addEventListener("click", e => {
  if (e.target.className === "del-icon") {
    const element = e.target.parentElement.parentElement;
    element.remove();
    citiesArr = localStorage.getItem("cities").split(",");

    // for (let i = 0; i < citiesArr.length; i++) {
    //   if (citiesArr[i] === element.textContent) {
    //     console.log(citiesArr[i]);
    //     citiesArr.splice(i, 1);
    //   }
    // }
    localStorage.setItem(
      "cities",
      citiesArr.filter(city => city !== element.textContent).join(",")
    );
  }
});

// display LOCAL STORAGE ON UI
function displaySavedCities() {
  let citiesArr = localStorage.getItem("cities").split(",");
  for (let i = 0; i < citiesArr.length; i++) {
    const cityList = document.querySelector("#fav-city");
    const city = document.createElement("div");
    city.className = "fav-city";
    city.innerHTML = `${
      citiesArr[i]
    }<i><img class="del-icon" src="/delete-icon.png" alt="del"/></i>`;
    cityList.appendChild(city);
  }
}

//Event Listener on FAV CITY
document.body.addEventListener("click", e => {
  const city = e.target.textContent;
  if (e.target.className === "fav-city") {
    getWeather(city);
  }
});

// GET WEATHER API
async function getWeather(textInput) {
  const api_url = `https://api.openweathermap.org/data/2.5/weather?q=${textInput}&APPID=b60f06be8a1cf3685899ba2249887706`;
  const response = await fetch(api_url);
  const data = await response.json();

  if (data.cod != 200) {
    return alert(data.message);
  }

  // Temperature in celsius
  const temperature = Math.round(data.main.temp - 273.15);
  // AM/PM

  const localTime = calcTime(data.timezone / 3600);
  let timeOfDay;

  if (localTime >= 6 && localTime < 12) {
    timeOfDay = "Morning";
  } else if (localTime >= 12 && localTime < 17) {
    timeOfDay = "Afternoon";
  } else if (localTime >= 17 && localTime < 22) {
    timeOfDay = "Evening";
  } else {
    timeOfDay = "Night";
  }
  // ICON

  let picName;

  if (data.weather[0].main === "Clear") {
    if (timeOfDay === "Night") {
      picName = "1n";
    } else {
      picName = "1d";
    }
  } else if (data.weather[0].main === "Thunderstorm") {
    picName = "2";
  } else if (data.weather[0].main === "Snow") {
    picName = "3";
  } else if (data.weather[0].main === "Rain") {
    if (timeOfDay === "Night") {
      picName = "4n";
    } else {
      picName = "4d";
    }
  } else if (data.weather[0].main === "Dizzle") {
    picName = "5";
  } else {
    picName = "6";
  }

  //UI Controller
  document.querySelector(".city").textContent = `${data.name}, ${
    data.sys.country
  }`;
  document.querySelector(".temperature-now").textContent = `${temperature}°`;
  document.querySelector(".part-of-day").textContent = `${timeOfDay}`;
  document.querySelector(
    ".item"
  ).innerHTML = `<img class="icon" src="/img/weather icons/${picName}.png" alt="icon">`;
}

// GET FORECAST API
async function getForecast(textInput) {
  const api_url = `https://api.openweathermap.org/data/2.5/forecast?q=${textInput}&APPID=b60f06be8a1cf3685899ba2249887706`;
  const response = await fetch(api_url);
  const data = await response.json();
  if (data.cod != 200) {
    return alert(data.message);
  }

  let dates = {};
  let dateArr = [];
  data.list.map(function(item) {
    var newD = item["dt_txt"].split(" ")[0];
    if (!dates[newD] && item["dt_txt"].split(" ")[1] == "15:00:00") {
      dates[newD] = item;
      if (dateArr.length < 4) {
        dateArr.push(item);
      }
    }
  });

  var daysInWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  dateArr.map((item, index) => {
    let tempRounded = Math.round(item.main.temp - 273.15);
    let dayInWeek = new Date(item["dt_txt"].split(" ")[0]).getDay();

    document.getElementById(`day${index}`).textContent = daysInWeek[dayInWeek];
    document.getElementById(`temp${index}`).textContent = `${tempRounded}°`;
  });
}

function calcTime(offset) {
  const d = new Date();

  const utc = d.getTime() + d.getTimezoneOffset() * 60000;

  const nd = new Date(utc + 3600000 * offset);

  return nd.getHours();
}
