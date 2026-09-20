document.addEventListener("DOMContentLoaded", function () {

updateSensorDisplays();

});

var countdownTimer = null;
var alarmInterval = null;
var audioContext = null;
var liveTimer = null;
var liveMonitoring = false;
var emergencyActive = false;

/* =========================
AUDIO UNLOCK
========================= */

function unlockAudio() {

try {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    if (audioContext.state === "suspended") {

        audioContext.resume();

    }

    /* Small test beep */

    var oscillator =
        audioContext.createOscillator();

    var gain =
        audioContext.createGain();

    oscillator.frequency.value = 600;

    gain.gain.setValueAtTime(
        0.001,
        audioContext.currentTime
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.05
    );

} catch (error) {

    console.log("Audio unlock error:", error);

}

}

/* =========================
SENSOR DISPLAY
========================= */

function updateSensorDisplays() {

var impact =
    document.getElementById("impact");

var rotation =
    document.getElementById("rotation");

var movement =
    document.getElementById("movement");


if (impact) {

    document.getElementById(
        "impactValue"
    ).innerText = impact.value;

}


if (rotation) {

    document.getElementById(
        "rotationValue"
    ).innerText = rotation.value;

}


if (movement) {

    document.getElementById(
        "movementValue"
    ).innerText = movement.value;

}

}

/* =========================
MANUAL ANALYSIS
========================= */

function analyzeSensors() {

unlockAudio();


var impact =
    Number(
        document.getElementById("impact").value
    );

var rotation =
    Number(
        document.getElementById("rotation").value
    );

var movement =
    Number(
        document.getElementById("movement").value
    );

var suddenStop =
    document.getElementById(
        "suddenStop"
    ).checked;


sendToAI(
    impact,
    rotation,
    movement,
    suddenStop
);

}

/* =========================
SEND TO FLASK
========================= */

function sendToAI(
impact,
rotation,
movement,
suddenStop
) {

fetch("/analyze", {

    method: "POST",

    headers: {
        "Content-Type": "application/json"
    },

    body: JSON.stringify({

        impact: impact,
        rotation: rotation,
        movement: movement,
        sudden_stop: suddenStop

    })

})

.then(function (response) {

    return response.json();

})

.then(function (data) {

    showAIResult(data);

})

.catch(function (error) {

    console.log(error);

    document.getElementById(
        "result"
    ).innerHTML =

        "<div class='emergency-box'>" +
        "<h3>❌ CONNECTION ERROR</h3>" +
        "<p>Could not connect to SafeLink AI.</p>" +
        "</div>";

});

}

/* =========================
AI RESULT
========================= */

function showAIResult(data) {

var result =
    document.getElementById("result");


result.innerHTML =

    "<div class='result-box'>" +

    "<h2>🤖 AI Risk Analysis</h2>" +

    "<p>Risk Score: <strong>" +
    data.risk_score +
    "/100</strong></p>" +

    "<p>Risk Level: <strong>" +
    data.risk +
    "</strong></p>" +

    "</div>";


if (data.risk === "HIGH") {

    triggerEmergency();

}

else if (data.risk === "MEDIUM") {

    result.innerHTML +=

        "<div class='medium-box'>" +

        "<h3>⚠️ MEDIUM RISK</h3>" +

        "<p>Unusual sensor activity detected.</p>" +

        "</div>";

}

else {

    result.innerHTML +=

        "<div class='safe-box'>" +

        "<h3>🟢 LOW RISK</h3>" +

        "<p>Normal sensor activity.</p>" +

        "</div>";

}

}

/* =========================
EMERGENCY
========================= */

function triggerEmergency() {

if (emergencyActive) {
    return;
}


emergencyActive = true;


var result =
    document.getElementById("result");


result.innerHTML +=

    "<div class='emergency-box'>" +

    "<h2>🚨 POSSIBLE EMERGENCY</h2>" +

    "<p>AI detected a high-risk sensor pattern.</p>" +

    "<p><strong>⚠️ ARE YOU SAFE?</strong></p>" +

    "<p id='countdown'>" +

    "Checking your safety in 10 seconds..." +

    "</p>" +

    "<button onclick='userIsSafe()'>" +

    "🟢 I'M SAFE" +

    "</button>" +

    "</div>";


startAlarm();

startCountdown();

}

/* =========================
COUNTDOWN
========================= */

function startCountdown() {

var seconds = 10;


if (countdownTimer) {

    clearInterval(countdownTimer);

}


countdownTimer =
    setInterval(function () {

        var countdown =
            document.getElementById(
                "countdown"
            );


        if (countdown) {

            countdown.innerHTML =

                "⚠️ Are you safe? " +

                "<strong>" +

                seconds +

                "</strong> seconds remaining";

        }


        seconds--;


        if (seconds < 0) {

            clearInterval(
                countdownTimer
            );

            countdownTimer = null;


            automaticEmergencyReport();

        }


    }, 1000);

}

/* =========================
I'M SAFE
========================= */

function userIsSafe() {

if (countdownTimer) {

    clearInterval(
        countdownTimer
    );

    countdownTimer = null;

}


stopAlarm();

emergencyActive = false;


document.getElementById(
    "result"
).innerHTML +=

    "<div class='safe-box'>" +

    "<h2>🟢 YOU ARE SAFE</h2>" +

    "<p>Safety confirmation received.</p>" +

    "<p>🚫 Emergency report cancelled.</p>" +

    "</div>";

}

/* =========================
AUTOMATIC REPORT
========================= */

function automaticEmergencyReport() {

stopAlarm();


document.getElementById(
    "result"
).innerHTML +=

    "<div class='emergency-box'>" +

    "<h2>🚨 EMERGENCY AUTOMATICALLY REPORTED</h2>" +

    "<p>No safety confirmation received.</p>" +

    "<p>📍 Location: Demo Location</p>" +

    "<p>🤖 AI Priority: HIGH</p>" +

    "<p>👥 Community responders notified.</p>" +

    "</div>";


updateDashboard();

}

/* =========================
START ALARM
========================= */

function startAlarm() {

stopAlarm();


try {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (audioContext.state === "suspended") {

        audioContext.resume();

    }


    function beep() {

        if (!audioContext) {
            return;
        }


        var oscillator =
            audioContext.createOscillator();

        var gain =
            audioContext.createGain();


        oscillator.type = "square";

        oscillator.frequency.setValueAtTime(
            900,
            audioContext.currentTime
        );


        gain.gain.setValueAtTime(
            0.25,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.3
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();


        oscillator.stop(
            audioContext.currentTime + 0.3
        );

    }


    beep();


    alarmInterval =
        setInterval(beep, 600);


} catch (error) {

    console.log(
        "Alarm error:",
        error
    );

}

}

/* =========================
STOP ALARM
========================= */

function stopAlarm() {

if (alarmInterval) {

    clearInterval(
        alarmInterval
    );

    alarmInterval = null;

}

}

/* =========================
LIVE MONITORING
========================= */

function startLiveMonitoring() {

unlockAudio();


if (liveMonitoring) {

    stopLiveMonitoring();

    return;

}


liveMonitoring = true;

emergencyActive = false;


var button =
    document.getElementById(
        "liveButton"
    );


if (button) {

    button.innerText =
        "⏹ STOP LIVE MONITORING";

}


var status =
    document.querySelector(
        ".status"
    );


if (status) {

    status.innerHTML =
        "<span class='status-dot'></span>" +
        " LIVE AI MONITORING";

}


var cycle = 0;


liveTimer =
    setInterval(function () {

        cycle++;


        var impact;
        var rotation;
        var movement;
        var suddenStop;


        if (cycle <= 7) {

            impact =
                Math.floor(
                    Math.random() * 3
                );

            rotation =
                Math.floor(
                    Math.random() * 3
                );

            movement =
                Math.floor(
                    Math.random() * 5
                );

            suddenStop = false;

        }


        else if (cycle <= 12) {

            impact =
                Math.floor(
                    Math.random() * 2
                ) + 4;

            rotation =
                Math.floor(
                    Math.random() * 2
                ) + 5;

            movement =
                Math.floor(
                    Math.random() * 2
                );

            suddenStop = false;

        }


        else {

            impact = 9;

            rotation = 8;

            movement = 1;

            suddenStop = true;

        }


        setSensorValues(
            impact,
            rotation,
            movement,
            suddenStop
        );


        if (cycle === 13) {

            sendToAI(
                impact,
                rotation,
                movement,
                suddenStop
            );


            stopLiveMonitoring();

        }


    }, 1000);

}

/* =========================
SENSOR VALUES
========================= */

function setSensorValues(
impact,
rotation,
movement,
suddenStop
) {

document.getElementById(
    "impact"
).value = impact;


document.getElementById(
    "rotation"
).value = rotation;


document.getElementById(
    "movement"
).value = movement;


document.getElementById(
    "suddenStop"
).checked = suddenStop;


document.getElementById(
    "impactValue"
).innerText = impact;


document.getElementById(
    "rotationValue"
).innerText = rotation;


document.getElementById(
    "movementValue"
).innerText = movement;

}

/* =========================
STOP LIVE
========================= */

function stopLiveMonitoring() {

liveMonitoring = false;


if (liveTimer) {

    clearInterval(liveTimer);

    liveTimer = null;

}


var button =
    document.getElementById(
        "liveButton"
    );


if (button) {

    button.innerText =
        "▶ START LIVE MONITORING";

}


var status =
    document.querySelector(
        ".status"
    );


if (status) {

    status.innerHTML =
        "<span class='status-dot'></span>" +
        " SYSTEM ONLINE";

}

}

/* =========================
DASHBOARD
========================= */

function updateDashboard() {

var status =
    document.getElementById(
        "incidentStatus"
    );

var detection =
    document.getElementById(
        "incidentDetection"
    );

var priority =
    document.getElementById(
        "incidentPriority"
    );

var location =
    document.getElementById(
        "incidentLocation"
    );

var report =
    document.getElementById(
        "incidentReportStatus"
    );

var responders =
    document.getElementById(
        "responderStatus"
    );


if (status) {

    status.innerHTML =
        "🚨 ACTIVE INCIDENT";

}


if (detection) {

    detection.innerText =
        "Sensor + AI";

}


if (priority) {

    priority.innerText =
        "HIGH";

}


if (location) {

    location.innerText =
        "📍 Demo Location";

}


if (report) {

    report.innerText =
        "Emergency Reported";

}


if (responders) {

    responders.innerHTML =
        "👥 NOTIFIED";

}

}

/* =========================
WITNESS REPORT
========================= */

function witnessReport() {

var witness =
    document.getElementById(
        "witnessResult"
    );


if (!witness) {
    return;
}


witness.innerHTML =

    "<div class='report-processing'>" +

    "<h3>🤖 AI ANALYZING...</h3>" +

    "<p>Classifying emergency...</p>" +

    "</div>";


setTimeout(function () {

    witness.innerHTML =

        "<div class='report-success'>" +

        "<h3>🚨 EMERGENCY REPORTED!</h3>" +

        "<p>AI classified the incident as " +

        "<strong>HIGH priority.</strong></p>" +

        "<p>📍 Location: Demo Location</p>" +

        "<p>👥 Community responders notified.</p>" +

        "</div>";


    updateDashboard();

}, 1000);

}