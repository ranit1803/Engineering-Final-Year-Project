const channelId = '2408412';
const apiKey = 'LW1BUX3QZHLA1W3L';

const sensors = [
  { field: 3, label: 'Body Temperature', unit: '°C', id: 'bodyTempChart', color: 'rgba(255,99,132,1)' },
  { field: 5, label: 'Heart Rate', unit: 'bpm', id: 'heartRateChart', color: 'rgba(54, 162, 235, 1)' },
  { field: 6, label: 'Oxygen Level', unit: '%', id: 'oxygenChart', color: 'rgba(75, 192, 192, 1)' },
  { field: 1, label: 'Room Temperature', unit: '°C', id: 'roomTempChart', color: 'rgba(255, 206, 86, 1)' },
  { field: 4, label: 'Air Quality', unit: 'PPM', id: 'airQualityChart', color: 'rgba(153, 102, 255, 1)' },
  { field: 2, label: 'Humidity', unit: '%', id: 'humidityChart', color: 'rgba(255, 159, 64, 1)' }
];

sensors.forEach(sensor => {
  fetch(`https://api.thingspeak.com/channels/${channelId}/fields/${sensor.field}.json?results=30&api_key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      const labels = data.feeds.map(feed => {
        const d = new Date(feed.created_at);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });

      const values = data.feeds.map(feed => parseFloat(feed[`field${sensor.field}`]));

      new Chart(document.getElementById(sensor.id), {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: `${sensor.label} (${sensor.unit})`,
            data: values,
            borderColor: sensor.color,
            backgroundColor: sensor.color.replace('1)', '0.1)'),
            tension: 0.4,
            pointRadius: 2,
            fill: true,
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    })
    .catch(err => console.error(`Error loading ${sensor.label} data:`, err));
});
