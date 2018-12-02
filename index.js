(function(){
    'use-strict'
    const WP_API_KEY  = "89db84edfc78b9debb5fe1ccde4cbccc";
   
    (()=>{
        let options = {
         types: ['(cities)'],
        };
        let input = document.getElementById('cityQuery');
        let autocomplete = new google.maps.places.Autocomplete(input, options);
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            let payload = document.getElementById('cityQuery').value.replace(/\s/g, "") ;
            fetchData(payload);
        });
    })();

    const toCelsius = (f)=>  Math.round(((5/9) * (f-32))*100)/100;
    const dateFormat=(d)=>{
        let date = new Date(d*1000);
        var months = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return `${date.getDate()} ${months[date.getMonth()]}`;        
    };
    const getWeatherImage = (d)=>{
        const temp = d.toLowerCase();
        if(temp === "sun"   ||  temp === "clear")
            return "&#x263C;"
        else if(temp === "cloudy" || temp === "clouds")
            return "&#x2601;"
        else if(temp === "rain")
            return "&#x1F327;"
        return "&#x2609;"
    }
    const makeData = (data)=>{
        return {
            description:data.weather[0].description,
            humidity:data.main.humidity,
            imgSrc:getWeatherImage(data.weather[0].main),
            date:dateFormat(data.dt),
            temp_max:toCelsius(data.main.temp_max),
            temp_min:toCelsius(data.main.temp_min)
        }
    }
    const makeTiles = (parent,weatherData,dateSet,index)=>{
        let tile = document.createElement("div");
        tile.setAttribute("class","weatherCard")
        
        let tileDate = document.createElement("div");
        tileDate.innerHTML = weatherData[dateSet[index]].date;
        tileDate.setAttribute("class","date");
        tile.appendChild(tileDate);
        
        let tileImg = document.createElement("div");
        tileImg.innerHTML = weatherData[dateSet[index]].imgSrc;
        tileImg.setAttribute("class","wtImg");
        tile.appendChild(tileImg);

        let tileMinMax = document.createElement("div");
        tileMinMax.innerHTML = `${weatherData[dateSet[index]].temp_max}&deg; / ${weatherData[dateSet[index]].temp_min}&deg;`;
        tileMinMax.setAttribute("class","minmax");
        tile.appendChild(tileMinMax);
        
        let tileHumidity = document.createElement("div");
        tileHumidity.innerHTML = `humidity: ${weatherData[dateSet[index]].humidity}`;
        tileHumidity.setAttribute("class","humidity");
        tile.appendChild(tileHumidity);
        
        let tileDescription = document.createElement("div");
        tileDescription.innerHTML = `Weather: ${weatherData[dateSet[index]].description}`;
        tileDescription.setAttribute("class","description");
        tile.appendChild(tileDescription);
        parent.appendChild(tile);
    }
    const calcTiles = (data)=>{
        if(data){
            let numEntries = data.length;
            let weatherData = {};
            for(let i=0;i<numEntries;i++){
                let temp = data[i]['dt_txt'].split(" ")[0]
                if(typeof weatherData[temp] == "undefined"){
                    weatherData[temp] = makeData(data[i]);
                }
            }
            let parent = document.getElementById("forecastSection");
            parent.innerHTML = "";
            const dateSet = Object.keys(weatherData);
            for(let i=0;i<=4;i++){
             makeTiles(parent,weatherData,dateSet,i)
            }
        }
    }
    const showError = (error)=>{
        let parent = document.getElementById("forecastSection");
        parent.innerHTML = "";
        let errorDiv    =   document.createElement("div");
        errorDiv.innerHTML = error;
        parent.appendChild(errorDiv);
    }
    const fetchData = (data)=>{
        let url = `https://api.openweathermap.org/data/2.5/forecast?q=${data}&appid=${WP_API_KEY}`;
        fetch(url).then(function(response) {  
            return response.json();
        }).then(function(response) { 
            if(response.list)
                calcTiles(response.list);
            else
                showError(response.message);
        }).catch(function(error){
            console.log(error);
        })
    }
})();