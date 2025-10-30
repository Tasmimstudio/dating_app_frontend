// src/components/ProfileCompletenessIndicator.jsx
import './ProfileCompletenessIndicator.css';

function ProfileCompletenessIndicator({ profile, photos = [] }) {
  // Calculate profile completeness
  const calculateCompleteness = () => {
    const fields = [
      { name: 'name', label: 'Name', value: profile.name },
      { name: 'bio', label: 'Bio', value: profile.bio },
      { name: 'city', label: 'City', value: profile.city },
      { name: 'height', label: 'Height', value: profile.height },
      { name: 'occupation', label: 'Occupation', value: profile.occupation },
      { name: 'education', label: 'Education', value: profile.education },
      { name: 'photos', label: 'At least 2 photos', value: photos.length >= 2 },
      { name: 'primaryPhoto', label: 'Primary photo set', value: photos.some(p => p.is_primary) },
    ];

    const completed = fields.filter(field => {
      if (typeof field.value === 'boolean') return field.value;
      return field.value && field.value.toString().trim() !== '';
    });

    const percentage = Math.round((completed.length / fields.length) * 100);

    return {
      percentage,
      total: fields.length,
      completed: completed.length,
      fields,
      completedFields: completed.map(f => f.name),
    };
  };

  const completeness = calculateCompleteness();

  const getCompletionMessage = () => {
    if (completeness.percentage === 100) {
      return 'Your profile is complete! You\'re all set to find great matches.';
    } else if (completeness.percentage >= 75) {
      return 'Almost there! Complete your profile to get better matches.';
    } else if (completeness.percentage >= 50) {
      return 'Good start! Add more details to improve your chances.';
    } else {
      return 'Complete your profile to get 3x more matches!';
    }
  };

  const getFieldIcon = (fieldName) => {
    const isCompleted = completeness.completedFields.includes(fieldName);
    return isCompleted ? '✅' : '⚪';
  };

  const getProgressColor = () => {
    if (completeness.percentage === 100) return '#4caf50';
    if (completeness.percentage >= 75) return '#8bc34a';
    if (completeness.percentage >= 50) return '#ffc107';
    return '#ff9800';
  };

  return (
    <div className="profile-completeness">
      <div className="completeness-header">
        <h3>Profile Completeness</h3>
        <div className="completeness-percentage">{completeness.percentage}%</div>
      </div>

      <div className="completeness-progress-bar">
        <div
          className="completeness-progress-fill"
          style={{
            width: `${completeness.percentage}%`,
            background: `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()} 100%)`
          }}
        ></div>
      </div>

      <div className="completeness-checklist">
        {completeness.fields.map((field, index) => (
          <div
            key={index}
            className={`completeness-item ${completeness.completedFields.includes(field.name) ? 'completed' : ''}`}
          >
            <span className="completeness-icon">{getFieldIcon(field.name)}</span>
            <span className="completeness-label">{field.label}</span>
          </div>
        ))}
      </div>

      {completeness.percentage === 100 ? (
        <div className="completeness-message">
          {getCompletionMessage()}
        </div>
      ) : (
        <div className="completeness-suggestion">
          <strong>Tip:</strong> {getCompletionMessage()}
        </div>
      )}
    </div>
  );
}

export default ProfileCompletenessIndicator;
