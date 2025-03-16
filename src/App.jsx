"use client"

import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [step, setStep] = useState("start"); // "start", "taskInput", "sessionActive", "postSession"
  const [task, setTask] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const savedState = localStorage.getItem("popupState");
    if (savedState) {
      setStep(savedState);
    }

    const savedTask = localStorage.getItem("task");
    if (savedTask) {
      setTask(savedTask);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleStartSession = () => {
    setStep("taskInput");
    localStorage.setItem("popupState", "taskInput");
  };

  const handleSubmitTask = () => {
    if (task.trim() === "") return;
    setStartTime(Date.now());
    setElapsedTime(0);
    setTimerRunning(true);
    setStep("sessionActive");
    localStorage.setItem("popupState", "sessionActive");

    console.log("Session started at:", new Date().toISOString());
    
    chrome.runtime.sendMessage({ type: "START_FOCUS", task }, (response) => {
      console.log("Service worker response:", response);
    });
  };

  const handleEndSession = () => {
    setTimerRunning(false);
    setStep("postSession");
    localStorage.setItem("popupState", "postSession");
    console.log("Session ended at:", new Date().toISOString());
    
    chrome.runtime.sendMessage({ type: "END_SESSION" }, (response) => {
      console.log("Service worker response:", response);
    });
  };

  const handleClosePostSession = () => {
    setStep("start");
    setTask("");
    localStorage.setItem("popupState", "start");
    localStorage.setItem("task", "");
  };

  return (
    <div className="app-container">
      <div className="timer-card">
        <h1 className="app-title">Lock In!</h1>

        {step === "start" && (
          <div className="step-container start-step">
            <p>Ready to focus on your studies?</p>
            <button onClick={handleStartSession} className="btn btn-primary">
              Start Study Session
            </button>
          </div>
        )}

        {step === "taskInput" && (
          <div className="step-container task-step">
            <p>What will you be working on?</p>
            <input
              type="text"
              value={task}
              onChange={(e) => {
                setTask(e.target.value);
                localStorage.setItem("task", e.target.value);
              }}
              className="task-input"
              placeholder="Enter your task..."
            />
            <button onClick={handleSubmitTask} className="btn btn-success">
              Begin
            </button>
          </div>
        )}

        {step === "sessionActive" && (
          <div className="step-container active-step">
            <div className="task-display">
              <h2>Currently Focusing On:</h2>
              <p className="task-text">{task}</p>
            </div>
            <button onClick={handleEndSession} className="btn btn-danger">
              End Session
            </button>
          </div>
        )}

        {step === "postSession" && (
          <div className="step-container post-session-step">
            <h2>Good Job!</h2>
            <button onClick={handleClosePostSession} className="btn btn-primary">
              Close
            </button>
            <button onClick={() => window.open("/analytics.html", "_blank")} className="btn btn-secondary">
              View Analytics
            </button>
          </div>
        )}
      </div>
      
      <img src="/image.svg" alt="Cat" className="cat-image" />
    </div>
  );
}

export default App;
