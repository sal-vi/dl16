// Funciones

// Request  API: mindicador.cl
const indicatorRequest = async (indicator) => {
    try {
        const response = await fetch(`https://mindicador.cl/api/${indicator}`);
        if (!response.ok) throw new Error("Oh no! Un error...");
        const data = await response.json();
        return data.serie;
    } catch (error) {
        const converterText = document.getElementById("text-converter");
        converterText.innerText = error;
        converterText.style.color = "red";
    }
};

//Organización de datos previa
const createDataToChart = (dataArray) => {
    const dataArrayLast10 = dataArray.slice(0, 10);
    const labels = dataArrayLast10
        .map((dato) => getNewDateFormat(dato.fecha))
        .reverse(); b
    const data = dataArrayLast10.map((dato) => dato.valor).reverse();

    const datasets = [
        {
            label: "MONTO EN CLP",
            borderColor: "rgb(32, 150, 110)",
            data,
        },
    ];

    return { labels, datasets };
};

// Renderizado
const renderChart = (dataArray) => {
    // Verificación de gráfica previa
    if (Chart.getChart("indicator-chart"))
        Chart.getChart("indicator-chart").destroy();

    const data = createDataToChart(dataArray);
    const config = {
        type: "line",
        data,
    };

    new Chart("indicator-chart", config);
};

// Formato fecha
const getNewDateFormat = (date) => {
    const dateFormat = new Date(date);
    const day = dateFormat.getUTCDate();
    const month = dateFormat.getUTCMonth() + 1;
    return (
        day.toString().padStart(2, "0") +
        "/" +
        month.toString().padStart(2, "0")
    );
};

// Formato divisa
const getCurrencyFormat = (amount) =>
    amount.toLocaleString("es-CL", {
        style: "decimal",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

// Formato fecha (txt).
const setDate = () => {
    let meses = new Array(
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre"
    );
    let diasSemana = new Array(
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado"
    );
    let f = new Date();

    return (
        diasSemana[f.getDay()] +
        ", " +
        f.getDate() +
        " de " +
        meses[f.getMonth()] +
        " de " +
        f.getFullYear()
    );
};

// Eventos
const converterBtn = document.getElementById("btn-converter");

converterBtn.addEventListener("click", async () => {
    const converterInput = document.getElementById("input-converter");
    const converterSelect = document.getElementById("select-converter");
    const converterText = document.getElementById("text-converter");
    const chartContainer = document.getElementById("chart-container");

    let dataArray = await indicatorRequest(converterSelect.value);

    const inputValue = parseFloat(converterInput.value);
    const actualValue = parseFloat(dataArray[0].valor);

    if (!isNaN(inputValue)) {
        const input = getCurrencyFormat(inputValue);
        const tasa = getCurrencyFormat(actualValue);
        const total = getCurrencyFormat(inputValue / actualValue);
        const currencyCodes = {
            dolar: "USD",
            uf: "UF",
            euro: "EUR",
        };

        converterText.style.color = "black";
        converterText.innerHTML = `
            <p class="text-converter-clp"> <span>${input}</span> CLP equivalen a:</p>
            <h3 class="text-converter-total">
                ${total} ${currencyCodes[converterSelect.value]}
            </h3>
            <p class="text-converter-tasa">Tasa: <span>${tasa}</span> CLP - ${setDate()}</p>
            `;
        chartContainer.innerHTML = `
            <canvas id="indicator-chart"></canvas>
            <p class="chart-title"> 10 últimas variaciones </p>
        `;
        renderChart(dataArray);
    } else {
        converterText.innerHTML = "<p>Ingrese un valor válido</p>";
        converterText.style.color = "red";
    }
});
