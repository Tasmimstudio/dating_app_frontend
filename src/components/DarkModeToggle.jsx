// src/components/DarkModeToggle.jsx
import { useDarkMode } from '../context/DarkModeContext';
import './DarkModeToggle.css';

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="dark-mode-switch-container">
      <label className="dark-mode-switch">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleDarkMode}
        />
        <span className="switch-slider">
          <span className="switch-icon">{isDarkMode ? '🌙' : '☀️'}</span>
        </span>
      </label>
    </div>
  );
}

export default DarkModeToggle;
