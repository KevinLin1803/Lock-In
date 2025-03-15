"use client"

import { useState, useEffect } from "react"
import "./App.css"

function App() {
  const [step, setStep] = useState("start") // "start", "taskInput", "sessionActive"
  const [task, setTask] = useState("")
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const savedState = localStorage.getItem('popupState');
    if (savedState) {
        setStep(savedState);
    }

    const savedTask = localStorage.getItem('task');
    if (savedTask) {
      setTask(savedTask);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleStartSession = () => {
    setStep("taskInput")
  }

  const handleSubmitTask = () => {
    if (task.trim() === "") return;
    const timestamp = new Date().toISOString();
    setStartTime(timestamp);
    setStep("sessionActive");
  
    console.log("Session started at:", timestamp);
  
    // Send message to service worker
    chrome.runtime.sendMessage({ type: "START_FOCUS", task }, (response) => {
      console.log("Service worker response:", response);
    });
  };
  
  const handleEndSession = () => {
    const timestamp = new Date().toISOString();
    setEndTime(timestamp);
    setStep("start");
    setTask("");
  
    console.log("Session ended at:", timestamp);
  
    // Send message to service worker
    chrome.runtime.sendMessage({ type: "END_SESSION" }, (response) => {
      console.log("Service worker response:", response);
    });
  };

  return (
    <div className="app-container">
      <div className="timer-card">
        <h1 className="app-title">Study Timer</h1>

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
              onChange={(e) => setTask(e.target.value)}
              className="task-input"
              placeholder="Enter your task..."
            />
            <button onClick={handleSubmitTask} className="btn btn-success">
              Begin Focus
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
      </div>
      
      {/* Cat SVG */}
      <img src="/cat.svg" alt="Cat" className="cat-image" />
    </div>
  )
}

export default App
