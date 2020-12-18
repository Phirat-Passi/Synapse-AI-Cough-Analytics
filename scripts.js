async function main() {
  const existed = await Dexie.exists('symptoms_database')

  const db = new Dexie("symptoms_database");
  db.version(1).stores({
    symptoms: 'timestamp,symptom'
  });

  if(!existed) {
    console.log("Database did not exist, adding sample data...");
    writeFakeData(db.symptoms, [3, 4, 7, 5, 6, 8, 1].reverse());
  }

  let recognizer;
  let listening = false;

  // Loads the model and starts the prediction.
  async function predict() {
    recognizer = speechCommands.create('BROWSER_FFT');
    await recognizer.ensureModelLoaded();

    // Array of words that the recognizer is trained to recognize.
    const symptoms = recognizer.wordLabels();
    recognizer.listen(({scores}) => {
      // Turn scores into a list of (score,word) pairs.
      scores = Array.from(scores).map((s, i) => ({score: s, word: symptoms[i]}));
      // Find the most probable word.
      scores.sort((s1, s2) => s2.score - s1.score);

      if(scores[0].word == "three") {
        symptomDetected("cough")
      }
    }, {probabilityThreshold: 0.75});

    document.querySelector('#status').className = 'listening';
    listening = true;
  }

  function stopPredicting() {
    recognizer.stopListening();
    document.querySelector('#status').className = 'stopped';
    listening = false;
  }

  // Callback called everytime a symptom is detected.
  async function symptomDetected(symptom) {
    await db.symptoms.add({
      timestamp: +moment(),
      symptom: symptom,
    })

    redraw()
  }

  const chart = document.getElementById('chart');
  Chart.defaults.global.defaultFontFamily = 'Nunito, sans-serif';
  var myChart = new Chart(chart, {
    plugins: [ChartDataLabels],
    type: 'line',
    data: {
      datasets:[{
        data: [],
        fill: false,
        borderColor: '#E0FCFF',
        pointBackgroundColor: '#85BAC0',
        pointBorderColor: '#85BAC0',
        pointHoverBackgroundColor: '#85BAC0',
        pointHoverBorderColor: '#85BAC0',
        pointRadius: 10,
        pointHoverRadius: 10,
        borderWidth: 7,
        hoverBorderWidth: 7,
      }]
    },
    options: {
      legend: {display: false},
      scales: {
        xAxes: [{
          gridLines: {
            color: '#91837A',
            lineWidth: 2,
            drawBorder: false,
            zeroLineWidth: 0,
            fontColor: '#fff',
          },
          ticks: {
            fontColor: '#fff',
            fontSize: 24,
            padding: 30,
          },
          type: 'time',
          time: {
            unit: 'day',
          }
        }],
        yAxes: [{
          gridLines: {
            color: '#91837A',
            lineWidth: 2,
            drawBorder: false,
            zeroLineWidth: 0,
          },
          ticks: {
            beginAtZero: true,
            precision: 0,
            stepSize: 10,
            max: 80,
            fontColor: '#fff',
            fontSize: 16,
            padding: 30,
          },
        }]
      },
      hover: {
        animationDuration: 100,
      },
      tooltips: {
        enabled: false,
        xPadding: 10,
        yPadding: 10,
        bodyFontSize: 20,
        bodyFontColor: '#3E3E3E',
        bodyFontStyle: 'bold',
        titleFontSize: 0,
        backgroundColor: '#fff',
        displayColors: false,
        callbacks: {
          title: function() {
            return '';
          }
        }
      },
      plugins: {
        // Change options for ALL labels of THIS CHART
        datalabels: {
          opacity: 0.9,
          color: '#36A2EB',
          anchor: 'end',
          align: 'end',
          backgroundColor: '#fff',
          borderRadius: 3,
          color: '#3E3E3E',
          offset: 10,
          font: {
            size: 14,
          },
          formatter: function(value, context) {
            return ''+value.y;
          }
        }
      }
    }
  });

  // To be called everytime an event happened.
  async function redraw() {
    const bounds = lastNDays(7)

    const data = []
    let sum = 0
    for(const i in bounds) {
      [start, end] = bounds[i]
      const coughs = await db.symptoms.where('timestamp').between(+start, +end).count()
      data.push({x: start.toDate(), y: coughs})
      sum += coughs
    }

    const last = data[1].y
    const diff = last - data[2].y
    const today = data[0].y
    const worst = Math.max(last, today)
    const average = sum/7

    if(worst < 10 && diff < 5 && worst <= average) {
      document.querySelector('#health').className = 'good';
    } else if(worst < 20 && diff < 10) {
      document.querySelector('#health').className = 'warn';
    } else {
      document.querySelector('#health').className = 'bad';
    }

    myChart.data.datasets[0].data = data
    myChart.update();
  }

  // Call redraw() to draw the initial state from the database.
  redraw()

  // Start predicting by default.
  predict();

  onClick('status-listening', function() {
    if(listening) {
      stopPredicting();
    }
  })

  onClick('status-stopped', function() {
    if(!listening) {
      predict();
    }
  })

  onClick('bsp1', function() {
    db.symptoms.clear();
    writeFakeData(db.symptoms, [3, 4, 7, 5, 6, 4, 1].reverse());
    redraw();
  });

  onClick('bsp2', function() {
    db.symptoms.clear();
    writeFakeData(db.symptoms, [3, 9, 11, 20, 25, 19, 15].reverse());
    redraw();
  });

  onClick('bsp3', function() {
    db.symptoms.clear();
    writeFakeData(db.symptoms, [3, 9, 22, 37, 45, 64, 65].reverse());
    redraw();
  });

  onClick('random', function() {
    db.symptoms.clear();
    writeFakeData(db.symptoms, [...Array(7).keys()].map(i => Math.floor(Math.random() * 60)))
    redraw();
  })

  onClick('reset', function() {
    db.symptoms.clear();
    redraw();
  })

  document.addEventListener('keydown', function(event) {
    const key = event.key; // "a", "1", "Shift", etc.
    if(key == "h") {
      db.symptoms.add({
        timestamp: +moment(),
        symptom: "cough"
      });
      redraw();
    }
  });

}

main();

function onClick(id, f) {
  document.getElementById(id).addEventListener('click', function() {
    f();
    return false;
  });
}

async function writeFakeData(table, fakes) {
  const bounds = lastNDays(fakes.length)
  const data = []
  for(const i in bounds) {
    const [start, end] = bounds[i];
    const count = fakes[i]
    for(let j = 0; j < count; j++) {
      data.push({
        timestamp: +start+j,
        symptom: "cough",
      })
    }
  }
  await table.bulkAdd(data)
}
