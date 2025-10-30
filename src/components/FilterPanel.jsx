// src/components/FilterPanel.jsx
import { useState, useEffect } from 'react';
import './FilterPanel.css';

function FilterPanel({ onApplyFilters, onClose, initialFilters }) {
  const [filters, setFilters] = useState({
    minAge: initialFilters?.minAge || 18,
    maxAge: initialFilters?.maxAge || 100,
    gender: initialFilters?.gender || [],
    maxDistance: initialFilters?.maxDistance || 100,
  });

  const handleGenderToggle = (genderValue) => {
    setFilters((prev) => ({
      ...prev,
      gender: prev.gender.includes(genderValue)
        ? prev.gender.filter((g) => g !== genderValue)
        : [...prev.gender, genderValue],
    }));
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      minAge: 18,
      maxAge: 100,
      gender: [],
      maxDistance: 100,
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <div className="filter-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
        <div className="filter-header">
          <h2>Filter Matches</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="filter-content">
          {/* Age Range */}
          <div className="filter-section">
            <label className="filter-label">
              Age Range: {filters.minAge} - {filters.maxAge}
            </label>
            <div className="age-sliders">
              <div className="slider-group">
                <label>Min: {filters.minAge}</label>
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={filters.minAge}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      minAge: Math.min(Number(e.target.value), prev.maxAge - 1),
                    }))
                  }
                  className="age-slider"
                />
              </div>
              <div className="slider-group">
                <label>Max: {filters.maxAge}</label>
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={filters.maxAge}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxAge: Math.max(Number(e.target.value), prev.minAge + 1),
                    }))
                  }
                  className="age-slider"
                />
              </div>
            </div>
          </div>

          {/* Gender Filter */}
          <div className="filter-section">
            <label className="filter-label">Gender</label>
            <div className="gender-options">
              {['Male', 'Female', 'Non-binary', 'Other'].map((genderOption) => (
                <button
                  key={genderOption}
                  className={`gender-btn ${
                    filters.gender.includes(genderOption) ? 'active' : ''
                  }`}
                  onClick={() => handleGenderToggle(genderOption)}
                >
                  {genderOption}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Filter */}
          <div className="filter-section">
            <label className="filter-label">
              Maximum Distance: {filters.maxDistance} km
            </label>
            <input
              type="range"
              min="1"
              max="500"
              value={filters.maxDistance}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxDistance: Number(e.target.value),
                }))
              }
              className="distance-slider"
            />
            <div className="distance-labels">
              <span>1 km</span>
              <span>500 km</span>
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button className="clear-filters-btn" onClick={handleClearFilters}>
            Clear Filters
          </button>
          <button className="apply-filters-btn" onClick={handleApply}>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
