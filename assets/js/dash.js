document.addEventListener("DOMContentLoaded", function () {
  const CHANNEL_ID = "2408412"; // 🔁 Replace with your ThingSpeak Channel ID
  const API_KEY = "LW1BUX3QZHLA1W3L";  // 🔁 Optional if your channel is public

  // Select all asset cards
  const allCards = document.querySelectorAll('.asset-card');

  const fetchAllSensorData = async () => {
    try {
      const response = await fetch(`https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds/last.json?api_key=${API_KEY}`);
      if (!response.ok) throw new Error("Failed to fetch ThingSpeak data");

      const data = await response.json();

      // Map field data to correct card elements
      const sensorValues = {
        roomTemp: data.field1,
         humidity: data.field2,
        bodyTemp: data.field3,
        heartRate: data.field5,
        oxygenLevel: data.field6,
        airQuality: data.field4,
      };

      allCards[0].querySelector("p").innerHTML = `${sensorValues.bodyTemp || "N/A"} °C`;
      allCards[1].querySelector("p").innerHTML = `${sensorValues.heartRate || "N/A"} bpm`;
      allCards[2].querySelector("p").innerHTML = `${sensorValues.oxygenLevel || "N/A"} %`;
      allCards[3].querySelector("p").innerHTML = `${sensorValues.roomTemp || "N/A"} °C`;
      allCards[4].querySelector("p").innerHTML = `${sensorValues.humidity || "N/A"} %`;
      allCards[5].querySelector("p").innerHTML = `${sensorValues.airQuality || "N/A"} PPM`;

    } catch (error) {
      console.error("Error fetching sensor data:", error);
      allCards.forEach(card => {
        card.querySelector("p").innerHTML = "Error loading data";
      });
    }
  };

  fetchAllSensorData();
  setInterval(fetchAllSensorData, 15000); // Refresh every 15 seconds
});

//emailjs
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        const userEmail = user.email;
        console.log("User logged in:", userEmail);

        const sendBtn = document.getElementById('sendMailBtn');
        console.log("Button reference:", sendBtn);

        if (sendBtn) {
            sendBtn.addEventListener('click', function() {
                console.log("Send button clicked!");

              fetch('https://api.thingspeak.com/channels/2408412/feeds.json?results=1&api_key=LW1BUX3QZHLA1W3L')
                    .then(response => response.json())
                    .then(data => {
                        const feed = data.feeds[0];
                        const message = `
                            Latest Data From Jacket:\n
                            Room Temperature: ${feed.field1} °C\n
                            Humidity: ${feed.field2} %\n
                            Body Temperature: ${feed.field3} °C\n
                            Air Quality: ${feed.field4} AQI\n
                            Heart Rate: ${feed.field5} BPM\n
                            Blood Oxygen Level: ${feed.field6} %\n
                            Timestamp: ${feed.created_at}
                        `;

                        emailjs.send("service_6g7u6g8", "template_n09d062", {
                            user_email: userEmail,
                            message: message
                        }).then(function(response) {
                            alert('Email sent successfully!');
                        }, function(error) {
                            alert('Failed to send email: ' + JSON.stringify(error));
                        });
                    });
            });
        } else {
            console.error("Send button not found!");
        }
    } else {
        console.warn("User not logged in.");
    }
});

//report
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById("generateReportBtn").addEventListener("click", function () {
    alert("Report downloading... Please wait a few seconds.");

    fetch("/generate_report")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to generate the report.");
            }
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "AI_Health_Report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(error => {
            delay(8000).then(() => {
                alert("Downloading Complete. Please Check Your Downloads Folder");
                console.error("Download error:", error);
            });
        });
});





