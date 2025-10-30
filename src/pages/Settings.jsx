// src/pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SettingsModal from '../components/SettingsModal';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    minAge: 18,
    maxAge: 35,
    maxDistance: 50,
    showMale: true,
    showFemale: true,
    showMe: true,
    notifyMatches: true,
    notifyMessages: true,
    notifySuperLikes: true,
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showBlockedUsersModal, setShowBlockedUsersModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSafetyTipsModal, setShowSafetyTipsModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [reportData, setReportData] = useState({
    category: 'bug',
    subject: '',
    description: '',
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      const response = await api.get(`/users/${userId}/preferences`);
      if (response.data) {
        setPreferences({ ...preferences, ...response.data });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      await api.put(`/users/${userId}/preferences`, preferences);
      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    }
  };

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleSliderChange = (key, value) => {
    setPreferences({ ...preferences, [key]: parseInt(value) });
  };

  const handleChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  const submitChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      await api.put(`/auth/change-password/${userId}`, {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      alert('Password changed successfully!');
      setShowChangePasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.detail || 'Failed to change password');
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccountModal(true);
  };

  const submitDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your password to confirm deletion');
      return;
    }

    if (!window.confirm('Are you absolutely sure? This action cannot be undone and all your data will be permanently deleted.')) {
      return;
    }

    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      await api.delete(`/auth/delete-account/${userId}`, {
        data: { password: deletePassword }
      });
      alert('Account deleted successfully');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error.response?.data?.detail || 'Failed to delete account');
    }
  };

  const handleBlockedUsers = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      const response = await api.get(`/blocks/user/${userId}`);
      setBlockedUsers(response.data);
      setShowBlockedUsersModal(true);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      alert('Failed to load blocked users');
    }
  };

  const handleUnblockUser = async (blockedUserId) => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      await api.delete(`/blocks/${userId}/${blockedUserId}`);
      setBlockedUsers(blockedUsers.filter(u => u.user_id !== blockedUserId));
      alert('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    }
  };

  const handleReportProblem = () => {
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportData.subject || !reportData.description) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const userId = JSON.parse(localStorage.getItem('user')).user_id;
      await api.post('/reports/', {
        user_id: userId,
        category: reportData.category,
        subject: reportData.subject,
        description: reportData.description,
      });
      alert('Report submitted successfully! We will review it shortly.');
      setShowReportModal(false);
      setReportData({ category: 'bug', subject: '', description: '' });
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    }
  };

  const handleSafetyTips = () => {
    setShowSafetyTipsModal(true);
  };

  const handleTerms = () => {
    setShowTermsModal(true);
  };

  const handlePrivacy = () => {
    setShowPrivacyModal(true);
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="header-left">
          <button onClick={() => navigate('/dashboard')} className="home-btn" title="Home">
            🏠
          </button>
          <h1 className="settings-title">Settings</h1>
        </div>
      </header>

      <div className="settings-content">
        {/* Account Section */}
        <div className="settings-section">
          <h2 className="section-title">Account</h2>
          <div className="settings-list">
            <div className="settings-item" onClick={() => navigate('/profile')}>
              <div className="item-content">
                <span className="item-icon">👤</span>
                <span className="item-label">Edit Profile</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
            <div className="settings-item" onClick={handleChangePassword}>
              <div className="item-content">
                <span className="item-icon">🔒</span>
                <span className="item-label">Change Password</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
            <div className="settings-item danger" onClick={handleDeleteAccount}>
              <div className="item-content">
                <span className="item-icon">🗑️</span>
                <span className="item-label">Delete Account</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
          </div>
        </div>

        

        {/* Notifications Section */}
        <div className="settings-section">
          <h2 className="section-title">Notifications</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="item-content">
                <span className="item-icon">💕</span>
                <span className="item-label">New Matches</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notifyMatches}
                  onChange={() => handleToggle('notifyMatches')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <div className="item-content">
                <span className="item-icon">💬</span>
                <span className="item-label">New Messages</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notifyMessages}
                  onChange={() => handleToggle('notifyMessages')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="settings-item">
              <div className="item-content">
                <span className="item-icon">⭐</span>
                <span className="item-label">Super Likes</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.notifySuperLikes}
                  onChange={() => handleToggle('notifySuperLikes')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Safety Section */}
        <div className="settings-section">
          <h2 className="section-title">Privacy & Safety</h2>
          <div className="settings-list">
            <div className="settings-item" onClick={handleBlockedUsers}>
              <div className="item-content">
                <span className="item-icon">🚫</span>
                <span className="item-label">Blocked Users</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
            <div className="settings-item" onClick={handleReportProblem}>
              <div className="item-content">
                <span className="item-icon">🚨</span>
                <span className="item-label">Report a Problem</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
            <div className="settings-item" onClick={handleSafetyTips}>
              <div className="item-content">
                <span className="item-icon">🛡️</span>
                <span className="item-label">Safety Tips</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <h2 className="section-title">About</h2>
          <div className="settings-list">
            <div className="settings-item" onClick={handleTerms}>
              <div className="item-content">
                <span className="item-icon">📄</span>
                <span className="item-label">Terms of Service</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
            <div className="settings-item" onClick={handlePrivacy}>
              <div className="item-content">
                <span className="item-icon">🔐</span>
                <span className="item-label">Privacy Policy</span>
              </div>
              <span className="item-arrow">›</span>
            </div>
            <div className="settings-item">
              <div className="item-content">
                <span className="item-icon">ℹ️</span>
                <span className="item-label">Version</span>
              </div>
              <span className="version-number">1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <SettingsModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        title="Change Password"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submitChangePassword(); }}>
          <div className="modal-form-group">
            <label className="modal-form-label">Current Password</label>
            <input
              type="password"
              className="modal-form-input"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">New Password</label>
            <input
              type="password"
              className="modal-form-input"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">Confirm New Password</label>
            <input
              type="password"
              className="modal-form-input"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
          </div>
          <div className="modal-form-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setShowChangePasswordModal(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              Change Password
            </button>
          </div>
        </form>
      </SettingsModal>

      {/* Delete Account Modal */}
      <SettingsModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="Delete Account"
      >
        <div>
          <p style={{ color: '#d32f2f', marginBottom: '20px', fontWeight: 600 }}>
            Warning: This action is permanent and cannot be undone!
          </p>
          <p style={{ marginBottom: '20px' }}>
            Deleting your account will permanently remove all your data including:
          </p>
          <ul style={{ marginBottom: '20px', color: '#666' }}>
            <li>Your profile and photos</li>
            <li>All matches and conversations</li>
            <li>Swipe history</li>
            <li>Account settings</li>
          </ul>
          <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submitDeleteAccount(); }}>
            <div className="modal-form-group">
              <label className="modal-form-label">Enter your password to confirm</label>
              <input
                type="password"
                className="modal-form-input"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
            </div>
            <div className="modal-form-actions">
              <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setShowDeleteAccountModal(false)}>
                Cancel
              </button>
              <button type="submit" className="modal-btn modal-btn-danger">
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </SettingsModal>

      {/* Blocked Users Modal */}
      <SettingsModal
        isOpen={showBlockedUsersModal}
        onClose={() => setShowBlockedUsersModal(false)}
        title="Blocked Users"
      >
        {blockedUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
            You haven't blocked any users yet
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {blockedUsers.map((user) => (
              <div key={user.user_id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '15px',
                background: 'rgba(255, 195, 225, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 195, 225, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  {user.primary_photo ? (
                    <img
                      src={`http://localhost:8000${user.primary_photo}`}
                      alt={user.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ff6b9d, #c44569)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}>
                      {user.name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: '#c44569' }}>{user.name}</div>
                    {user.age && <div style={{ fontSize: '0.9rem', color: '#999' }}>Age: {user.age}</div>}
                  </div>
                </div>
                <button
                  className="modal-btn modal-btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                  onClick={() => handleUnblockUser(user.user_id)}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </SettingsModal>

      {/* Report Problem Modal */}
      <SettingsModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report a Problem"
      >
        <form className="modal-form" onSubmit={(e) => { e.preventDefault(); submitReport(); }}>
          <div className="modal-form-group">
            <label className="modal-form-label">Category</label>
            <select
              className="modal-form-select"
              value={reportData.category}
              onChange={(e) => setReportData({ ...reportData, category: e.target.value })}
            >
              <option value="bug">Bug Report</option>
              <option value="user">Report User</option>
              <option value="content">Inappropriate Content</option>
              <option value="safety">Safety Concern</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">Subject</label>
            <input
              type="text"
              className="modal-form-input"
              value={reportData.subject}
              onChange={(e) => setReportData({ ...reportData, subject: e.target.value })}
              required
            />
          </div>
          <div className="modal-form-group">
            <label className="modal-form-label">Description</label>
            <textarea
              className="modal-form-textarea"
              value={reportData.description}
              onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
              required
            />
          </div>
          <div className="modal-form-actions">
            <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setShowReportModal(false)}>
              Cancel
            </button>
            <button type="submit" className="modal-btn modal-btn-primary">
              Submit Report
            </button>
          </div>
        </form>
      </SettingsModal>

      {/* Safety Tips Modal */}
      <SettingsModal
        isOpen={showSafetyTipsModal}
        onClose={() => setShowSafetyTipsModal(false)}
        title="Safety Tips"
      >
        <div className="modal-content-section">
          <h3>Online Safety</h3>
          <ul>
            <li>Never share personal information like your address, phone number, or financial details</li>
            <li>Be cautious about sharing your social media profiles</li>
            <li>Use the app's messaging system until you feel comfortable</li>
            <li>Trust your instincts - if something feels wrong, it probably is</li>
          </ul>
        </div>
        <div className="modal-content-section">
          <h3>Meeting in Person</h3>
          <ul>
            <li>Meet in a public place for the first few dates</li>
            <li>Tell a friend or family member where you're going</li>
            <li>Arrange your own transportation</li>
            <li>Stay sober and aware of your surroundings</li>
            <li>Don't feel pressured to do anything you're uncomfortable with</li>
          </ul>
        </div>
        <div className="modal-content-section">
          <h3>Reporting & Blocking</h3>
          <ul>
            <li>Report any suspicious or inappropriate behavior immediately</li>
            <li>Use the block feature if someone makes you uncomfortable</li>
            <li>Screenshots can be helpful evidence when reporting</li>
          </ul>
        </div>
      </SettingsModal>

      {/* Terms of Service Modal */}
      <SettingsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms of Service"
      >
        <div className="modal-content-section">
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing and using this dating application, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </div>
        <div className="modal-content-section">
          <h3>2. User Conduct</h3>
          <p>You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the service.</p>
          <ul>
            <li>Do not harass, abuse, or harm other users</li>
            <li>Do not post offensive, inappropriate, or illegal content</li>
            <li>Do not impersonate others or create fake profiles</li>
            <li>Respect other users' privacy and boundaries</li>
          </ul>
        </div>
        <div className="modal-content-section">
          <h3>3. Account Security</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
        </div>
        <div className="modal-content-section">
          <h3>4. Content Ownership</h3>
          <p>You retain all rights to the content you post. However, by posting content, you grant us a license to use, modify, and display that content on the platform.</p>
        </div>
        <div className="modal-content-section">
          <h3>5. Termination</h3>
          <p>We reserve the right to terminate or suspend your account at any time for violations of these terms.</p>
        </div>
      </SettingsModal>

      {/* Privacy Policy Modal */}
      <SettingsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <div className="modal-content-section">
          <h3>Information We Collect</h3>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Profile information (name, age, bio, photos, etc.)</li>
            <li>Account credentials and settings</li>
            <li>Messages and interactions with other users</li>
            <li>Location data (when permitted)</li>
            <li>Device information and usage data</li>
          </ul>
        </div>
        <div className="modal-content-section">
          <h3>How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and improve our services</li>
            <li>Match you with other users</li>
            <li>Personalize your experience</li>
            <li>Send you notifications and updates</li>
            <li>Ensure safety and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </div>
        <div className="modal-content-section">
          <h3>Information Sharing</h3>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li>Other users (as part of your profile and matches)</li>
            <li>Service providers who help operate our platform</li>
            <li>Law enforcement when required by law</li>
          </ul>
        </div>
        <div className="modal-content-section">
          <h3>Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt-out of certain data collection</li>
            <li>Control your privacy settings</li>
          </ul>
        </div>
        <div className="modal-content-section">
          <h3>Data Security</h3>
          <p>We implement industry-standard security measures to protect your information. However, no method of transmission over the Internet is 100% secure.</p>
        </div>
        <div className="modal-content-section">
          <h3>Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us through the "Report a Problem" feature.</p>
        </div>
      </SettingsModal>
    </div>
  );
}

export default Settings;
